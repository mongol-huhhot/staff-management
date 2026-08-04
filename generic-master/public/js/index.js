// index.js
window.appConfig = window.appConfig || {};

const REQUEST_TAGS = {
  select: 'staff.get_information',
  save: 'insert_staff_category_info',
  delete: 'staffs.delete_staff_profile',
};

// staff_personal_data の jsonb（data_jsonb）以外の普通カラム
const REQUEST_SEPARATE_ITEMS = [
  'id', 'staff_id', 'data_type', 'valid_from', 'valid_to',
  'source_request_id', 'created_at', 'created_by', 'updated_at', 'updated_by',
];

window.appConfig.MAIN_CONFIG = {
  debug_mode: true,

  // 各タブのSQLタグを定義
  tab2sqltag_list: {
    preview: {
      label: 'プレビュー',
      jsonb_fields: ['profile_jsonb'],
      sqltags: {
        select: 'staff.get_information_preview',
      },
    },
    basic: {
      label: '基本情報',
      data_key: 'staff_profile',
      jsonb_fields: ['data_jsonb'],
      skip_reload: true,
      sqltags: REQUEST_TAGS,
      separate_items: REQUEST_SEPARATE_ITEMS,
    },
    address: {
      label: '住所情報',
      data_key: 'staff_profile',
      jsonb_fields: ['data_jsonb'],
      skip_reload: true,
      sqltags: REQUEST_TAGS,
      separate_items: REQUEST_SEPARATE_ITEMS,
    },
    contact: {
      label: '連絡先情報',
      data_key: 'staff_profile',
      jsonb_fields: ['data_jsonb'],
      skip_reload: true,
      sqltags: REQUEST_TAGS,
      separate_items: REQUEST_SEPARATE_ITEMS,
    },
    mynumber: {
      label: 'マイナンバー情報',
      data_key: 'staff_mynumber',
      jsonb_fields: ['data_jsonb'],
      skip_reload: true,
      sqltags: REQUEST_TAGS,
      separate_items: REQUEST_SEPARATE_ITEMS,
    },
    users: {
      label: 'ログインユーザー情報',
      data_key: 'staff_users',
      jsonb_fields: ['data_jsonb'],
      skip_reload: true,
      sqltags: REQUEST_TAGS,
      separate_items: REQUEST_SEPARATE_ITEMS,
    },
    traffic: {
      label: '通勤情報',
      data_key: 'staff_traffic',
      jsonb_fields: ['traffic_info'],
      sqltags: REQUEST_TAGS,
      separate_items: REQUEST_SEPARATE_ITEMS,
    },
    bank: {
      label: '銀行情報',
      data_key: 'staff_bank',
      jsonb_fields: ['data_jsonb'],
      sqltags: REQUEST_TAGS,
      separate_items: REQUEST_SEPARATE_ITEMS,
    },
    education: {
      label: '教育情報',
      data_key: 'staff_education',
      jsonb_fields: ['education_info'],
      sqltags: REQUEST_TAGS,
      separate_items: REQUEST_SEPARATE_ITEMS,
    },
    dependents: {
      label: '扶養情報',
      data_key: 'staff_dependents',
      jsonb_fields: ['data_jsonb'],
      skip_reload: true,
      sqltags: REQUEST_TAGS,
      separate_items: REQUEST_SEPARATE_ITEMS,
    },
    contract: {
      label: '雇用契約情報',
      data_key: 'staff_contract',
      jsonb_fields: ['data_jsonb'],
      skip_reload: true,
      sqltags: REQUEST_TAGS,
      separate_items: REQUEST_SEPARATE_ITEMS,
    },
    insurance: {
      label: '保険情報',
      data_key: 'staff_insurance',
      jsonb_fields: ['data_jsonb'],
      skip_reload: true,
      sqltags: REQUEST_TAGS,
      separate_items: REQUEST_SEPARATE_ITEMS,
    },
    work_history: {
      label: '職歴情報',
      data_key: 'staff_work_history',
      jsonb_fields: ['data_jsonb'],
      skip_reload: true,
      sqltags: REQUEST_TAGS,
      separate_items: REQUEST_SEPARATE_ITEMS,
    },
    certification: {
      label: '資格情報',
      data_key: 'staff_certification',
      jsonb_fields: ['data_jsonb'],
      skip_reload: true,
      sqltags: REQUEST_TAGS,
      separate_items: REQUEST_SEPARATE_ITEMS,
    },
  },
};

window.appConfig.UploadFiles = {
  // default config for staff. these items will be gotten from login information
  editable: true, // if editable: false then the own has viewable permission only. if editable:  true then has editing permission
  height: 200,    // number of Pixels
  width: 200,    // number of Pixels
  returnType: 'base64', // 'base64' or 'blob'
  direction: 'row', // 'row' or 'column'
  student_card: {
    editable: true, // if editable: false then the own has viewable permission only. if editable:  true then has editing permission
    height: 360,    // number of Pixels
    width: 360,    // number of Pixels
    returnType: 'blob', // 'base64' or 'blob'
    direction: 'row', // 'row' or 'column'
    files: [// you can define many files to be uloaded
      { field: 'front', headerName: '学生証表' },
      { field: 'back', headerName: '学生証裏' },
      { field: 'diploma', headerName: '卒業書' },
      { field: 'academic_transcript', headerName: '成績書' },
    ],
  },
  mynumber_card: {
    editable: true, // if editable: false then the own has viewable permission only. if editable:  true then has editing permission
    height: 360,    // number of Pixels
    width: 360,    // number of Pixels
    returnType: 'blob', // 'base64' or 'blob'
    direction: 'row', // 'row' or 'column'
    swapSizeInLandscape: true,
    compressRatio: 1,    // 0.1 ~ 1
    jpegQuality: 0.9,  // 0.1 ~ 1
    outputFormat: 'image/jpeg',
    maxWidth: 0,    // 0 = ignore
    maxHeight: 0,    // 0 = ignore
    files: [ // you can define many files to be uloaded
      { field: 'front', headerName: 'マイナンバーカード表' },
      { field: 'back', headerName: 'マイナンバーカード裏' },
    ]
  },
  bank_book: {
    editable: true, // if editable: false then the own has viewable permission only. if editable:  true then has editing permission
    height: 360,    // number of Pixels
    width: 360,    // number of Pixels
    returnType: 'blob', // 'base64' or 'blob'
    direction: 'row', // 'row' or 'column'
    swapSizeInLandscape: true,
    compressRatio: 1,    // 0.1 ~ 1
    jpegQuality: 0.9,  // 0.1 ~ 1
    outputFormat: 'image/jpeg',
    maxWidth: 0,    // 0 = ignore
    maxHeight: 0,    // 0 = ignore
    files: [ // you can define many files to be uloaded
      { field: 'cover', headerName: '通帳表紙' },
      { field: 'front', headerName: '通帳見開き' },
    ]
  },
  bank_card: {
    editable: true, // if editable: false then the own has viewable permission only. if editable:  true then has editing permission
    height: 360,    // number of Pixels
    width: 360,    // number of Pixels
    returnType: 'blob', // 'base64' or 'blob'
    direction: 'row', // 'row' or 'column'
    swapSizeInLandscape: true,
    compressRatio: 1,    // 0.1 ~ 1
    jpegQuality: 0.9,  // 0.1 ~ 1
    outputFormat: 'image/jpeg',
    maxWidth: 0,    // 0 = ignore
    maxHeight: 0,    // 0 = ignore
    files: [ // you can define many files to be uloaded
      { field: 'front', headerName: '銀行カード' },
    ]
  },
};
