// 外部index.js　Configファイル内容
window.appConfig = window.appConfig || {};
window.appConfig.MAIN_CONFIG = {
  debug_mode: true,
  app_key: "role_master_management",   // mtb_item_categoryテーブルのcategory_codeになります。
  grid: {  // 左に一覧を表示したい場合はこれを追加
    sql_tag: 'roles.get_role_list', condition:{}
  },
  // 各タブのSQLタグを定義
  tab2sqltag_list: { // 機能別の定義
    role_master: { // mtb_categoryテーブルのsub_category_codeの値になります
      label: 'ロール編集',
      data_key: 'roledata',
      jsonb_fields: [],// jsonb カラムの一覧
      skip_reload: true,
      sqltags:{ select:'roles.get_role_list', save:'roles.save_roles', delete:'roles.delete_roles', }, // jsonb以外の普通カラム
      separate_items: [ 'role_code','role_name','remarks','enabled','show_order' ],// jsonb以外の普通カラム
    },
  },
};
