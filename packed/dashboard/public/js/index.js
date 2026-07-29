
window.appConfig = window.appConfig || {};

  const REQUEST_SEPARATE_ITEMS = [
    // キー
    'id', 'record_id', 'staff_id', 'data_type', 'valid_from',
    // 申請ライフサイクル
    'request_type', 'request_status', 'new_request_status',
    'request_comment', 'approval_comment',
    'requested_at', 'requested_by',
    'approved_at', 'approved_by',
    'rejected_at', 'rejected_by',
    // 監査
    'created_at', 'created_by', 'updated_at', 'updated_by',
  ];

  // ダッシュボードで使う申請系 SQL タグをここに集約する
  const REQUEST_SAVE_TAGS = {
    select: 'staff.request.select_submitted',
    insert:'insert_staff_request_info',
    update: 'update_staff_request_info',
    delete: '',
    approve: 'staff.request.approve',                   // 承認（一括・個別）
    update_status: 'staff.request.update_status',       // 差戻し・却下
    count_category: 'staff.request.count_category',     // 処理待ち件数
    select_profile: 'staff.profile.select_by_request',  // 処理待ち別スタッフ一覧
  };

  // コンポーネント側（Dashboard.vue / ApprovalActions.vue / DataStore.js）からも参照できるように公開する
  window.appConfig.REQUEST_SAVE_TAGS = REQUEST_SAVE_TAGS;

  // 未実装タブのプレースホルダ
  const NO_TAGS = { select: '', insert: '', update: '', delete: '' };

window.appConfig.DASHBOARD_CONFIG = {
  staff_code: '11018',
  debug_mode: true,

  // 処理待ちバッジに数える申請ステータス（例: ['submitted'] や ['submitted', 'returned']）
  pending_statuses: ['submitted'],

  // notices: {
  //     sql_tag: 'notices',
  //     condition: {'is_active': true},
  // },
  notices: [
    '算定基礎や保険関連書類の作成も可能となりました！詳しくはお問合せください！',
    'リリース情報',
    '算定基礎や保険関連書類の作成も可能となりました！詳しくはお問合せください！',
    '算定基礎や保険関連書類の作成も可能となりました！詳しくはお問合せください！',
    '算定基礎や保険関連書類の作成も可能となりました！詳しくはお問合せください！',
  ],
  menus: [
    { title: '給与明細', icon: 'mdi-database', url: '/pay-stubs' },
    { title: '雇用保険', icon: 'mdi-account-card', url: '/employment-insurance' },
    { title: '資料アップロード', icon: 'mdi-file-upload', url: '/document-upload' },
    { title: '勤怠時間計算', icon: 'mdi-swap-horizontal', url: '/attendance-calculation' },
    { title: '給与明細', icon: 'mdi-database', url: '/pay-stubs' },
    { title: '雇用保険', icon: 'mdi-account-card', url: '/employment-insurance' },
    { title: '勤怠時間計算', icon: 'mdi-swap-horizontal', url: '/attendance-calculation' },
    { title: '給与明細', icon: 'mdi-database', url: '/pay-stubs' },
    { title: '雇用保険', icon: 'mdi-account-card', url: '/employment-insurance' },
  ],
};
window.appConfig.MAIN_CONFIG = {
  debug_mode: true,

  approval_flow: {
    staff_profile: {
      label: '基本情報',
      steps: [
        { name: 'manager_approval', label: '上長承認' },
        { name: 'hr_approval', label: '人事承認' },
      ],
    },
    staff_traffic: {
      label: '通勤情報',
      steps: [
        { name: 'manager_approval', label: '上長承認' },
        { name: 'hr_approval', label: '人事承認' },
      ],
    },
    staff_bank: {
      label: '銀行情報',
      steps: [
        { name: 'manager_approval', label: '上長承認' },
        { name: 'hr_approval', label: '人事承認' },
      ],
    },
    staff_education: {
      label: '資格情報',
      steps: [
        { name: 'manager_approval', label: '上長承認' },
        { name: 'hr_approval', label: '人事承認' },
      ],
    },
  },
  // 各タブのSQLタグを定義
  tab2sqlTag_list: {
    basic: {
      label: '基本情報',
      data_key: 'staff_profile',
      jsonb_fields: ['data_jsonb'],
      skip_reload: false,
      sqlTags: REQUEST_SAVE_TAGS,
      separate_items: REQUEST_SEPARATE_ITEMS,
    },
    address: {
      label: '住所情報',
      data_key: 'staff_address',
      jsonb_fields: ['data_jsonb'],
      skip_reload: false,
      sqlTags: REQUEST_SAVE_TAGS,
      separate_items: REQUEST_SEPARATE_ITEMS,
    },
    contact: {
      label: '連絡先情報',
      data_key: 'staff_contact',
      jsonb_fields: ['data_jsonb'],
      skip_reload: false,
      sqlTags: REQUEST_SAVE_TAGS,
      separate_items: REQUEST_SEPARATE_ITEMS,
    },
    bank: {
      label: '銀行情報',
      data_key: 'staff_bank',
      jsonb_fields: ['data_jsonb'],
      skip_reload: false,
      sqlTags: REQUEST_SAVE_TAGS,
      separate_items: REQUEST_SEPARATE_ITEMS,
    },
    education: {
      label: '教育情報',
      data_key: 'staff_education',
      jsonb_fields: ['data_jsonb'],
      skip_reload: false,
      sqlTags: REQUEST_SAVE_TAGS,
      separate_items: REQUEST_SEPARATE_ITEMS,
    },
    traffic: {
      label: '通勤情報', // select 未設定（旧: sqlTags 定義なし）
      data_key: 'staff_traffic',
      jsonb_fields: ['data_jsonb'],
      skip_reload: false,
      sqlTags: REQUEST_SAVE_TAGS,
      separate_items: REQUEST_SEPARATE_ITEMS,
    },

    // ---- select 未実装の申請系タブ ----
    dependents: {
      label: '扶養情報',
      data_key: 'staff_dependents',
      jsonb_fields: ['data_jsonb'],
      skip_reload: false,
      sqlTags: REQUEST_SAVE_TAGS,
      separate_items: REQUEST_SEPARATE_ITEMS,
    },
    insurance: {
      label: '保険情報',
      data_key: 'staff_insurance',
      jsonb_fields: ['data_jsonb'],
      skip_reload: false,
      sqlTags: REQUEST_SAVE_TAGS,
      separate_items: REQUEST_SEPARATE_ITEMS,
    },
    work_history: {
      label: '職歴情報',
      data_key: 'staff_work_history',
      jsonb_fields: ['data_jsonb'],
      skip_reload: false,
      sqlTags: REQUEST_SAVE_TAGS,
      separate_items: REQUEST_SEPARATE_ITEMS,
    },

    // ---- 未実装タブ ----
    mynumber: {
      label: 'マイナンバー情報', // 未実装
      data_key: 'staff_mynumber',
      jsonb_fields: ['data_jsonb'],
      skip_reload: true,
      sqlTags: { ...NO_TAGS },
      separate_items: ['staff_code', 'profile_version'],
    },
    users: {
      label: 'ログインユーザー情報', // 未実装
      data_key: 'staff_users',
      jsonb_fields: ['data_jsonb'],
      skip_reload: true,
      sqlTags: { ...NO_TAGS },
      separate_items: ['staff_code', 'profile_version'],
    },
    contract: {
      label: '雇用契約情報', // 未実装
      data_key: 'staff_contract',
      jsonb_fields: ['data_jsonb'],
      skip_reload: false,
      sqlTags: { ...NO_TAGS },
      separate_items: ['staff_code', 'profile_version'],
    },

    // ---- 独自構造のタブ ----
    certification: {
      label: '資格情報', // 未実装
      data_key: 'staff_certification',
      jsonb_fields: ['certification_info'],
      sqlTags: {
        select: 'masters.get_staff_certification',
        save: 'masters.upsert_staff_certification',
        delete: 'masters.delete_staff_certification',
      },
    },
  },
};

window.appConfig.UploadFiles = {
    // default config for staff. these items will be gotten from login information
    editable: false, // if editable: false then the own has viewable permission only. if editable:  true then has editing permission
    height: 200,    // number of Pixels
    width:  200,    // number of Pixels
    returnType: 'base64', // 'base64' or 'blob'
    direction: 'row', // 'row' or 'column'
    student_card: {
        editable: false, // if editable: false then the own has viewable permission only. if editable:  true then has editing permission
        height: 360,    // number of Pixels
        width:  360,    // number of Pixels
        returnType: 'blob', // 'base64' or 'blob'
        direction: 'row', // 'row' or 'column'
        files : [// you can define many files to be uloaded
            { field: 'front', headerName: '学生証表'},
            { field: 'back', headerName: '学生証裏'},
            { field: 'diploma', headerName: '卒業書'},
            { field: 'academic_transcript', headerName: '成績書'},
        ],
    },
    mynumber_card: {
        editable: false, // if editable: false then the own has viewable permission only. if editable:  true then has editing permission
        height: 360,    // number of Pixels
        width:  360,    // number of Pixels
        returnType: 'blob', // 'base64' or 'blob'
        direction: 'row', // 'row' or 'column'
        swapSizeInLandscape: true,
        compressRatio: 1,    // 0.1 ~ 1
        jpegQuality:   0.9,  // 0.1 ~ 1
        outputFormat:  'image/jpeg',
        maxWidth:      0,    // 0 = ignore
        maxHeight:     0,    // 0 = ignore
        files :[ // you can define many files to be uloaded
            { field: 'front', headerName: 'マイナンバーカード表'},
            { field: 'back', headerName: 'マイナンバーカード裏'},
        ]
    },
    bank_book: {
        editable: false, // if editable: false then the own has viewable permission only. if editable:  true then has editing permission
        height: 360,    // number of Pixels
        width:  360,    // number of Pixels
        returnType: 'blob', // 'base64' or 'blob'
        direction: 'row', // 'row' or 'column'
        swapSizeInLandscape: true,
        compressRatio: 1,    // 0.1 ~ 1
        jpegQuality:   0.9,  // 0.1 ~ 1
        outputFormat:  'image/jpeg',
        maxWidth:      0,    // 0 = ignore
        maxHeight:     0,    // 0 = ignore
        files :[ // you can define many files to be uloaded
            { field: 'cover', headerName: '通帳表紙'},
            { field: 'front', headerName: '通帳見開き'},
        ]
    },
    bank_card: {
        editable: false, // if editable: false then the own has viewable permission only. if editable:  true then has editing permission
        height: 360,    // number of Pixels
        width:  360,    // number of Pixels
        returnType: 'blob', // 'base64' or 'blob'
        direction: 'row', // 'row' or 'column'
        swapSizeInLandscape: true,
        compressRatio: 1,    // 0.1 ~ 1
        jpegQuality:   0.9,  // 0.1 ~ 1
        outputFormat:  'image/jpeg',
        maxWidth:      0,    // 0 = ignore
        maxHeight:     0,    // 0 = ignore
        files :[ // you can define many files to be uloaded
            { field: 'front', headerName: '銀行カード'},
        ]
    },
};

window.appConfig.buttonRules = {
  add: { show: false, disabled: true },

  submitted: {
    approve:    { show: true, disabled: false, status: 'approved' },
    returnBack: { show: true, disabled: false, status: 'returned' },
    reject:     { show: true, disabled: false, status: 'rejected' },
  },
};
window.appConfig.requestStatusConfig = {
  draft: {
    title: "下書き",
    color: "grey",
    icon: "mdi-file-document-edit-outline",
    variant: "flat",
    textColor: "white",
    description: "編集・下書き保存が可能です"
  },

  submitted: {
    title: "申請中",
    color: "primary",
    icon: "mdi-send",
    variant: "flat",
    textColor: "white",
    description: "承認待ちです"
  },

  returned: {
    title: "差戻し",
    color: "warning",
    icon: "mdi-arrow-u-left-top",
    variant: "flat",
    textColor: "white",
    description: "修正して再申請してください"
  },

  approved: {
    title: "承認済み",
    color: "info",
    icon: "mdi-check-circle",
    variant: "flat",
    textColor: "white",
    description: "正式データとして登録されています"
  },

  rejected: {
    title: "却下",
    color: "error",
    icon: "mdi-close-circle",
    variant: "flat",
    textColor: "white",
    description: "申請は却下されました"
  },
  tmp: {
    title: "未保存",
    color: "warning",
    icon: "mdi-close-circle",
    variant: "flat",
    textColor: "white",
    description: "申請は却下されました"
  }
}
