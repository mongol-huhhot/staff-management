// index.js
window.appConfig = window.appConfig || {};
window.appConfig.MAIN_CONFIG = {
  debug_mode: true,
  default_list: 'roles',
  // 各タブのSQLタグを定義
  tab2sqltag_list: {
    roles: {
      label: 'ロール一覧',
      data_key: 'roles',
      jsonb_fields: [],// jsonb カラムの一覧
      skip_reload: true,
      sqltags:{ select:'masters.get_roles', save:'masters.save_roles', delete:'masters.master.delete_roles'}, // jsonb以外の普通カラム
      separate_items: [ 'role_code','role_name','remarks','enabled','show_order','updated_at' ],// jsonb以外の普通カラム
    },
    role: { 
      label: 'ロール',
      data_key: 'user_roles',
      jsonb_fields: [],// jsonb カラムの一覧
      sqltags:{ select:'system.get_user_roles', save:'system.save_user_roles', delete:'system.delete_user_role'}, // jsonb以外の普通カラム
      separate_items: ['user_id','role_code','start_date','end_date','enabled','remarks',],
    },
  },
};

