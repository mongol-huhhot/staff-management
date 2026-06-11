// 外部index.js　Configファイル内容
window.appConfig = window.appConfig || {};
window.appConfig.MAIN_CONFIG = {
  debug_mode: true,
  app_key: "permission_management",   // mtb_item_categoryテーブルのcategory_codeになります。
  app_name: "ロールアプリ権限管理",        // 例えば、アプリにタイトルなどに表示に使用。また、どんなアプリを開発しているか明白にする 
  grid: {  // 左に一覧を表示したい場合はこれを追加。個人用個人情報登録にこれがないです
    sql_tag: 'permission.get_role_app_permissions', 
    condition:{ enabled: 'active' }, // こちらに必要なすべて条件項目を定義、デフォルト値も入れる！！！
    // ✅ columns を関数化
    buildInitColumns: ({ onRowClicked } = {}) => [
      {
        field: 'role_code',
        headerName: 'ロール記号',
        pinned: 'left',
        flex: 1,
        onCellClicked: onRowClicked,
        cellStyle: {
          textAlign: 'left',
          padding: '4px',
          color: '#1976d2',
          textDecoration: 'underline',
          cursor: 'pointer',
        },
      },
      {
        field: 'role_name',
        headerName: 'ロール名',
        pinned: 'left',
        flex: 1,
        onCellClicked: onRowClicked,
        cellStyle: {
          textAlign: 'left',
          padding: '4px',
          color: '#1976d2',
          textDecoration: 'underline',
          cursor: 'pointer',
        },
      },
      { field: 'app_code', headerName: 'アプリ記号', },
      { field: 'app_name', headerName: 'アプリ名', },
      { field: 'process_code', headerName: '機能記号', },
      { field: 'process_name', headerName: '機能名', },
      { field: 'status_code', headerName: 'ステータスコード', },
      { field: 'access_allowed', headerName: 'アクセス許可', },
      { field: 'view_includes', headerName: '項目ビュー可', },
      { field: 'view_excludes', headerName: '項目ビュー不可', },
      { field: 'edit_includes', headerName: '項目編集可', },
      { field: 'edit_excludes', headerName: '項目編集不可', },
      { field: 'scope_codes', headerName: 'データコープ', },
      { field: 'enabled', headerName: '有効無効', },
      { field: 'show_order', headerName: '表示順番', },
    ],    
  },
  // 各タブのSQLタグを定義
  tab2sqltag_list: { // 機能別の定義
    app_role_permission: { // mtb_categoryテーブルのsub_category_codeの値になります
      label: 'ロールのアプリへの権限設定',
      // 左一覧に選択するときフォームのタイトルに表示したい項目。（例えば、{"ユーザーID - ユーザー名"}表示したい場合、user_id, user_nameという項目を設定する（実在する項目））
      display_items: ['role_code','role_name', 'process_code', 'process_name'], 
      data_key: 'roledata',
      jsonb_fields: [],   // jsonb カラムの一覧
      skip_reload: true,  // 現在実装してない
      sqltags:{ select:'permission.get_role_app_permissions', save:'permission.save_app_role_permissions', delete:'permission.delete_app_role_permissions', }, // jsonb以外の普通カラム
      separate_items: [ 'id', 'role_code', 'role_name', 'app_code', 'app_name', 'process_code', 'process_name', 'status_code', 'access_allowed', 'view_includes', 'view_excludes', 'edit_includes','edit_excludes',  'scope_codes', 'enabled', 'show_order' ],// jsonb以外の普通カラム
      condition: { role_code:null, app_code:null, process_code:null }, // selectのときの条件にrole_codeのみが必要です。こちらに必要なすべて条件項目を定義、デフォルト値も入れる！！！
    },
  },
};
