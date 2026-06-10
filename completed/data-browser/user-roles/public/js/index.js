// 外部index.js　Configファイル内容
window.appConfig = window.appConfig || {};
window.appConfig.MAIN_CONFIG = {
  debug_mode: true,
  app_key: "user_ownd_roles",   // mtb_item_categoryテーブルのcategory_codeになります。
  grid: {  // 左に一覧を表示したい場合はこれを追加
    sql_tag: 'users.get_user_list', condition:{}
  },
  // 各タブのSQLタグを定義
  tab2sqltag_list: { // 機能別の定義
    user_roles: { // mtb_categoryテーブルのsub_category_codeの値になります
      label: 'ユーザーのロール編集',
      data_key: 'userdata',
      jsonb_fields: [],// jsonb カラムの一覧
      skip_reload: true,
      sqltags:{ select:'user_roles.get_user_roles', save:'user_roles.save_user_roles', delete:'user_roles.delete_user_role', }, // jsonb以外の普通カラム
      separate_items: [ 'role_code','role_name','remarks','enabled','show_order' ],// jsonb以外の普通カラム
    },
  },
};
