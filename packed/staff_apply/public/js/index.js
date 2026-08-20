// index.js
window.appConfig = window.appConfig || {};
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
  tab2sqltag_list: {
    basic: {
      label: '基本情報',
      data_key: 'staff_profile',
      jsonb_fields: ['data_jsonb'],// jsonb カラムの一覧
      skip_reload: false,
      sqltags:{ select:'get_staff_personal_request',insert:'test_insert_staff_request_info',update:'test_update_staff_request_info', delete:'' },
      separate_items: ['id','approved_at','approved_by','rejected_at','rejected_by', 'staff_id', 'data_type', 'valid_from', 
                       'created_at', 'created_by', 'updated_at', 'updated_by','request_type', 'requested_at', 'requested_by', 
                       'request_status', 'request_comment', 'approval_comment','new_request_status'],// jsonb以外の普通カラム
    },
    address: {
      label: '住所情報',
      data_key: 'staff_address',
      jsonb_fields: ['data_jsonb'],// jsonb カラムの一覧
      skip_reload: false,
      sqltags:{ select:'get_staff_personal_request',insert:'test_insert_staff_request_info',update:'test_update_staff_request_info',  delete:'' },
      separate_items: ['id','approved_at','approved_by','rejected_at','rejected_by', 'staff_id', 'data_type', 'valid_from', 
                       'created_at', 'created_by', 'updated_at', 'updated_by','request_type', 'requested_at', 'requested_by', 
                       'request_status', 'request_comment', 'approval_comment','new_request_status'],// jsonb以外の普通カラム
    },
    contact: {
      label: '連絡先情報',
      data_key: 'staff_contact',
      jsonb_fields: ['data_jsonb'],// jsonb カラムの一覧
      skip_reload: false,
      sqltags:{ select:'get_staff_personal_request', insert:'test_insert_staff_request_info',update:'test_update_staff_request_info', delete:'' },
      separate_items: ['id','approved_at','approved_by','rejected_at','rejected_by', 'staff_id', 'data_type', 'valid_from', 
                       'created_at', 'created_by', 'updated_at', 'updated_by','request_type', 'requested_at', 'requested_by', 
                       'request_status', 'request_comment', 'approval_comment','new_request_status'],// jsonb以外の普通カラム
    },
    // mynumber: {
    //   label: 'マイナンバー情報',//未実装
    //   data_key: 'staff_mynumber',
    //   jsonb_fields: ['data_jsonb'],// jsonb カラムの一覧
    //   skip_reload: true,
    //   sqltags:{ select:'', insert:'',update:'', delete:'' },
    //   separate_items: ['staff_code', 'profile_version'],// jsonb以外の普通カラム
    // },
    users: {
      label: 'ログインユーザー情報',//未実装
      data_key: 'staff_users',
      jsonb_fields: ['data_jsonb'],// jsonb カラムの一覧
      skip_reload: true,
      sqltags:{ select:'', save:'', delete:'' },
      separate_items: ['staff_code', 'profile_version'],// jsonb以外の普通カラム
    },
    traffic: {
      label: '通勤情報',
      data_key: 'staff_traffic',
      jsonb_fields: ['data_jsonb'],
      sqltags:{ select:'get_staff_personal_repeatable_request',insert:'test_insert_staff_request_info',update:'test_update_staff_request_info', delete:''}, // jsonb以外の普通カラム
      separate_items: ['id','approved_at','approved_by','rejected_at','rejected_by', 'staff_id', 'data_type', 'valid_from', 
                       'created_at', 'created_by', 'updated_at', 'updated_by','request_type', 'requested_at', 'requested_by', 
                       'request_status', 'request_comment', 'approval_comment','new_request_status','record_id'],// jsonb以外の普通カラム
    },
    bank: {
      label: '銀行情報',
      data_key: 'staff_bank',
      jsonb_fields: ['data_jsonb'],// jsonb カラムの一覧
      allow_terminate: true,
      sqltags:{ select:'get_staff_personal_repeatable_request',insert:'test_insert_staff_request_info',update:'test_update_staff_request_info', delete:''}, // jsonb以外の普通カラム
      separate_items: ['id','approved_at','approved_by','rejected_at','rejected_by', 'staff_id', 'data_type', 'valid_from', 
                       'created_at', 'created_by', 'updated_at', 'updated_by','request_type', 'requested_at', 'requested_by', 
                       'request_status', 'request_comment', 'approval_comment','new_request_status','record_id'],// jsonb以外の普通カラム
    },
    education: {
      label: '教育情報',
      data_key: 'staff_education',
      jsonb_fields: ['data_jsonb'],// jsonb カラムの一覧
      skip_reload: false,
      allow_terminate: true,
      sqltags:{ select:'get_staff_personal_repeatable_request',insert:'test_insert_staff_request_info',update:'test_update_staff_request_info', delete:'' },
      separate_items: ['id','approved_at','approved_by','rejected_at','rejected_by', 'staff_id', 'data_type', 'valid_from', 
                       'created_at', 'created_by', 'updated_at', 'updated_by','request_type', 'requested_at', 'requested_by', 
                       'request_status', 'request_comment', 'approval_comment','new_request_status','record_id'],// jsonb以外の普通カラム
      },
    // dependents: {
    //   label: '扶養情報',
    //   data_key: 'staff_dependents',
    //   jsonb_fields: ['data_jsonb'],// jsonb カラムの一覧
    //   skip_reload: false,
    //   sqltags:{ select:'get_staff_personal_repeatable_request',insert:'test_insert_staff_request_info',update:'test_update_staff_request_info', delete:''}, // jsonb以外の普通カラム
    //   separate_items: ['id','approved_at','approved_by','rejected_at','rejected_by', 'staff_id', 'data_type', 'valid_from', 
    //                    'created_at', 'created_by', 'updated_at', 'updated_by','request_type', 'requested_at', 'requested_by', 
    //                    'request_status', 'request_comment', 'approval_comment','new_request_status','record_id'],// jsonb以外の普通カラム
    // },
    // contract: {
    //   label: '雇用契約情報',//未実装
    //   data_key: 'staff_contract',
    //   jsonb_fields: ['data_jsonb'],// jsonb カラムの一覧
    //   skip_reload: false,
    //   sqltags:{ select:'', save:'', delete:'' },
    //   separate_items: ['staff_code', 'profile_version'],// jsonb以外の普通カラム
    // },
    // insurance: {
    //   label: '保険情報',
    //   data_key: 'staff_insurance',
    //   jsonb_fields: ['data_jsonb'],// jsonb カラムの一覧
    //   skip_reload: false,
    //   sqltags:{ select:'get_staff_personal_repeatable_request',insert:'test_insert_staff_request_info',update:'test_update_staff_request_info', delete:''}, // jsonb以外の普通カラム
    //   separate_items: ['id','approved_at','approved_by','rejected_at','rejected_by', 'staff_id', 'data_type', 'valid_from', 
    //                    'created_at', 'created_by', 'updated_at', 'updated_by','request_type', 'requested_at', 'requested_by', 
    //                    'request_status', 'request_comment', 'approval_comment','new_request_status','record_id'],// jsonb以外の普通カラム
    // },
    work_history: {
      label: '職歴情報',
      data_key: 'staff_work_history',
      jsonb_fields: ['data_jsonb'],// jsonb カラムの一覧
      skip_reload: false,
      sqltags:{ select:'get_staff_personal_repeatable_request',insert:'test_insert_staff_request_info',update:'test_update_staff_request_info', delete:''}, // jsonb以外の普通カラム
      separate_items: ['id','approved_at','approved_by','rejected_at','rejected_by', 'staff_id', 'data_type', 'valid_from', 
                       'created_at', 'created_by', 'updated_at', 'updated_by','request_type', 'requested_at', 'requested_by', 
                       'request_status', 'request_comment', 'approval_comment','new_request_status','record_id'],// jsonb以外の普通カラム
    },
    certification: {
      label: '資格情報',//未実装
      data_key: 'staff_certification',
      jsonb_fields: ['data_jsonb'],
      skip_reload: false,
      sqltags:{ select:'get_staff_personal_request',insert:'test_insert_staff_request_info',update:'test_update_staff_request_info', delete:'' },
      separate_items: ['id','approved_at','approved_by','rejected_at','rejected_by', 'staff_id', 'data_type', 'valid_from', 
                       'created_at', 'created_by', 'updated_at', 'updated_by','request_type', 'requested_at', 'requested_by', 
                       'request_status', 'request_comment', 'approval_comment','new_request_status'],// jsonb以外の普通カラム
    },
  },
};

window.appConfig.UploadFiles = {
    // default config for staff. these items will be gotten from login information
    editable: true, // if editable: false then the own has viewable permission only. if editable:  true then has editing permission
    height: 200,    // number of Pixels
    width:  200,    // number of Pixels
    returnType: 'base64', // 'base64' or 'blob'
    direction: 'row', // 'row' or 'column'
    student_card: {
        editable: true, // if editable: false then the own has viewable permission only. if editable:  true then has editing permission
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
        editable: true, // if editable: false then the own has viewable permission only. if editable:  true then has editing permission
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
        editable: true, // if editable: false then the own has viewable permission only. if editable:  true then has editing permission
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
        editable: true, // if editable: false then the own has viewable permission only. if editable:  true then has editing permission
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
    drivers_license: {
    editable: true,
    height: 360,
    width: 360,
    returnType: 'blob',
    direction: 'row',
    swapSizeInLandscape: true,
    compressRatio: 1,
    jpegQuality: 0.9,
    outputFormat: 'image/jpeg',
    maxWidth: 0,
    maxHeight: 0,
    files: [
        { field: 'front', headerName: '運転免許証（表面）' },
        { field: 'back', headerName: '運転免許証（裏面）' },
    ]
},

qualification_2: {
    editable: true,
    height: 360,
    width: 360,
    returnType: 'blob',
    direction: 'row',
    swapSizeInLandscape: true,
    compressRatio: 1,
    jpegQuality: 0.9,
    outputFormat: 'image/jpeg',
    maxWidth: 0,
    maxHeight: 0,
    files: [
        { field: 'certificate', headerName: '資格証明書②' },
    ]
},

basic_deduction_report: {
    editable: true,
    height: 360,
    width: 360,
    returnType: 'blob',
    direction: 'row',
    swapSizeInLandscape: true,
    compressRatio: 1,
    jpegQuality: 0.9,
    outputFormat: 'image/jpeg',
    maxWidth: 0,
    maxHeight: 0,
    files: [
        { field: 'report', headerName: '基礎控除申告書' },
    ]
},

commuting_permit: {
    editable: true,
    height: 360,
    width: 360,
    returnType: 'blob',
    direction: 'row',
    swapSizeInLandscape: true,
    compressRatio: 1,
    jpegQuality: 0.9,
    outputFormat: 'image/jpeg',
    maxWidth: 0,
    maxHeight: 0,
    files: [
        { field: 'application', headerName: '自動車等通勤許可申請書' },
    ]
},

passport_main: {
    editable: true,
    height: 360,
    width: 360,
    returnType: 'blob',
    direction: 'row',
    swapSizeInLandscape: true,
    compressRatio: 1,
    jpegQuality: 0.9,
    outputFormat: 'image/jpeg',
    maxWidth: 0,
    maxHeight: 0,
    files: [
        { field: 'main', headerName: 'パスポート（通常）' },
    ]
},

hazard_map: {
    editable: true,
    height: 360,
    width: 360,
    returnType: 'blob',
    direction: 'row',
    swapSizeInLandscape: true,
    compressRatio: 1,
    jpegQuality: 0.9,
    outputFormat: 'image/jpeg',
    maxWidth: 0,
    maxHeight: 0,
    files: [
        { field: 'map', headerName: 'ハザードマップ' },
    ]
},

dependency_deduction_report: {
    editable: true,
    height: 360,
    width: 360,
    returnType: 'blob',
    direction: 'row',
    swapSizeInLandscape: true,
    compressRatio: 1,
    jpegQuality: 0.9,
    outputFormat: 'image/jpeg',
    maxWidth: 0,
    maxHeight: 0,
    files: [
        { field: 'report', headerName: '扶養控除等申告書' },
    ]
},

voluntary_insurance: {
    editable: true,
    height: 360,
    width: 360,
    returnType: 'blob',
    direction: 'row',
    swapSizeInLandscape: true,
    compressRatio: 1,
    jpegQuality: 0.9,
    outputFormat: 'image/jpeg',
    maxWidth: 0,
    maxHeight: 0,
    files: [
        { field: 'certificate', headerName: '任意保険書（※対人・対物保証金額記載）' },
    ]
},

approval_doc: {
    editable: true,
    height: 360,
    width: 360,
    returnType: 'blob',
    direction: 'row',
    swapSizeInLandscape: true,
    compressRatio: 1,
    jpegQuality: 0.9,
    outputFormat: 'image/jpeg',
    maxWidth: 0,
    maxHeight: 0,
    files: [
        { field: 'document', headerName: '決裁書' },
    ]
},

health_checkup: {
    editable: true,
    height: 360,
    width: 360,
    returnType: 'blob',
    direction: 'row',
    swapSizeInLandscape: true,
    compressRatio: 1,
    jpegQuality: 0.9,
    outputFormat: 'image/jpeg',
    maxWidth: 0,
    maxHeight: 0,
    files: [
        { field: 'result', headerName: '健康診断結果' },
    ]
},

id_photo: {
    editable: true,
    height: 360,
    width: 360,
    returnType: 'blob',
    direction: 'row',
    swapSizeInLandscape: true,
    compressRatio: 1,
    jpegQuality: 0.9,
    outputFormat: 'image/jpeg',
    maxWidth: 0,
    maxHeight: 0,
    files: [
        { field: 'photo', headerName: '身分証明書撮影' },
    ]
},

passport_designation: {
    editable: true,
    height: 360,
    width: 360,
    returnType: 'blob',
    direction: 'row',
    swapSizeInLandscape: true,
    compressRatio: 1,
    jpegQuality: 0.9,
    outputFormat: 'image/jpeg',
    maxWidth: 0,
    maxHeight: 0,
    files: [
        { field: 'designation', headerName: 'パスポート（指定書）' },
    ]
},

employment_insurance_cert: {
    editable: true,
    height: 360,
    width: 360,
    returnType: 'blob',
    direction: 'row',
    swapSizeInLandscape: true,
    compressRatio: 1,
    jpegQuality: 0.9,
    outputFormat: 'image/jpeg',
    maxWidth: 0,
    maxHeight: 0,
    files: [
        { field: 'certificate', headerName: '雇用保険被保険者証' },
    ]
},

residence_card: {
    editable: true,
    height: 360,
    width: 360,
    returnType: 'blob',
    direction: 'row',
    swapSizeInLandscape: true,
    compressRatio: 1,
    jpegQuality: 0.9,
    outputFormat: 'image/jpeg',
    maxWidth: 0,
    maxHeight: 0,
    files: [
        { field: 'front', headerName: '在留カード（表面）' },
        { field: 'back', headerName: '在留カード（裏面）' },
    ]
},

passport_permission: {
    editable: true,
    height: 360,
    width: 360,
    returnType: 'blob',
    direction: 'row',
    swapSizeInLandscape: true,
    compressRatio: 1,
    jpegQuality: 0.9,
    outputFormat: 'image/jpeg',
    maxWidth: 0,
    maxHeight: 0,
    files: [
        { field: 'permission', headerName: 'パスポート（資格外活動許可証）' },
    ]
},

resume: {
    editable: true,
    height: 360,
    width: 360,
    returnType: 'blob',
    direction: 'row',
    swapSizeInLandscape: true,
    compressRatio: 1,
    jpegQuality: 0.9,
    outputFormat: 'image/jpeg',
    maxWidth: 0,
    maxHeight: 0,
    files: [
        { field: 'document', headerName: '履歴書' },
    ]
},

student_id: {
    editable: true,
    height: 360,
    width: 360,
    returnType: 'blob',
    direction: 'row',
    swapSizeInLandscape: true,
    compressRatio: 1,
    jpegQuality: 0.9,
    outputFormat: 'image/jpeg',
    maxWidth: 0,
    maxHeight: 0,
    files: [
        { field: 'front', headerName: '学生証' },
    ]
},

pension_book: {
    editable: true,
    height: 360,
    width: 360,
    returnType: 'blob',
    direction: 'row',
    swapSizeInLandscape: true,
    compressRatio: 1,
    jpegQuality: 0.9,
    outputFormat: 'image/jpeg',
    maxWidth: 0,
    maxHeight: 0,
    files: [
        { field: 'document', headerName: '年金手帳' },
    ]
},

disability_cert: {
    editable: true,
    height: 360,
    width: 360,
    returnType: 'blob',
    direction: 'row',
    swapSizeInLandscape: true,
    compressRatio: 1,
    jpegQuality: 0.9,
    outputFormat: 'image/jpeg',
    maxWidth: 0,
    maxHeight: 0,
    files: [
        { field: 'certificate', headerName: '障がい者手帳' },
    ]
},

passport_other: {
    editable: true,
    height: 360,
    width: 360,
    returnType: 'blob',
    direction: 'row',
    swapSizeInLandscape: true,
    compressRatio: 1,
    jpegQuality: 0.9,
    outputFormat: 'image/jpeg',
    maxWidth: 0,
    maxHeight: 0,
    files: [
        { field: 'front', headerName: 'パスポート（その他）' },
    ]
},

qualification_1: {
    editable: true,
    height: 360,
    width: 360,
    returnType: 'blob',
    direction: 'row',
    swapSizeInLandscape: true,
    compressRatio: 1,
    jpegQuality: 0.9,
    outputFormat: 'image/jpeg',
    maxWidth: 0,
    maxHeight: 0,
    files: [
        { field: 'certificate', headerName: '資格証明書①（栄養士・調理師・管理栄養士）' },
    ]
},

vehicle_inspection: {
    editable: true,
    height: 360,
    width: 360,
    returnType: 'blob',
    direction: 'row',
    swapSizeInLandscape: true,
    compressRatio: 1,
    jpegQuality: 0.9,
    outputFormat: 'image/jpeg',
    maxWidth: 0,
    maxHeight: 0,
    files: [
        { field: 'certificate', headerName: '車検証' },
    ]
},
thumbnail: {
    editable: true,
    height: 360,
    width: 360,
    returnType: 'blob',
    direction: 'row',
    swapSizeInLandscape: true,
    compressRatio: 1,
    jpegQuality: 0.9,
    outputFormat: 'image/jpeg',
    maxWidth: 0,
    maxHeight: 0,
    files: [
        { field: 'front', headerName: '顔写真' },
    ]
},
};
window.appConfig.buttonRules = {
  draft: {
    draftSave:      { show: true,  disabled: false },
    delete:         { show: false,  disabled: false },
    newRequest:     { show: false, disabled: true  },
    submit:         { show: true,  disabled: false },
  },

  submitted: {
    draftSave:      { show: true,  disabled: true },
    delete:         { show: false,  disabled: true },
    newRequest:     { show: false, disabled: true },
    submit:         { show: true,  disabled: true },
  },

  returned: {
    draftSave:      { show: true,  disabled: false },
    delete:         { show: false,  disabled: false },
    newRequest:     { show: false, disabled: true },
    submit:         { show: true,  disabled: false },
  },

  approved: {
    draftSave:      { show: false, disabled: true },
    delete:         { show: true, disabled: false },
    newRequest:     { show: true,  disabled: false },
    submit:         { show: false, disabled: true },
  },

  rejected: {
    draftSave:      { show: false, disabled: true },
    delete:         { show: false, disabled: true },
    newRequest:     { show: true,  disabled: false },
    submit:         { show: false, disabled: true },
  },

  tmp: {
    draftSave:      { show: true, disabled: false },
    delete:         { show: false, disabled: true },
    newRequest:     { show: false,  disabled: true },
    submit:         { show: true, disabled: false },
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
window.appConfig.uploadImageRules = {
  draft: {
    save: {
      show: true,
      disabled: false,
    },
    upload: {
      show: true,
      disabled: false,
    },
    delete: {
      show: true,
      disabled: false,
    },
  },

  submitted: {
    save: {
      show: true,
      disabled: true,
    },
    upload: {
      show: true,
      disabled: true,
    },
    delete: {
      show: true,
      disabled: true,
    },
  },

  returned: {
    save: {
      show: true,
      disabled: false,
    },
    upload: {
      show: true,
      disabled: false,
    },
    delete: {
      show: true,
      disabled: false,
    },
  },

  approved: {
    save: {
      show: false,
      disabled: true,
    },
    upload: {
      show: false,
      disabled: true,
    },
    delete: {
      show: false,
      disabled: true,
    },
  },

  rejected: {
    save: {
      show: false,
      disabled: true,
    },
    upload: {
      show: false,
      disabled: true,
    },
    delete: {
      show: false,
      disabled: true,
    },
  },
  tmp: {
    save: {
      show: true,
      disabled:false,
    },
    upload: {
      show: true,
      disabled:false,
    },
    delete: {
      show: true,
      disabled:false,
    },
  },
}

