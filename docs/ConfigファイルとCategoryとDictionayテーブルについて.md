## Configの例説明

```js
window.appConfig = window.appConfig || {};
window.appConfig.MAIN_CONFIG = {
  debug_mode: true,
  app_key: "user_ownd_roles",   // mtb_item_categoryテーブルのcategory_codeになります。⇐ こちらの度のアプリか必ず指定する！！！
  grid: {  // 左に一覧を表示したい場合はこれを追加（MainLayoutWithList.vueコンポネントを使用）。いきなりForm画面を表示する場合この定義が不要(MainLayoutNoList.vueコンポネントを使用)。
    sql_tag: 'users.get_user_list', // 左グリッドが使用するSQL TAG
    condition:{}, // SQL参照初期条件。MainList.vueコンポネントにも日付など条件がある場合、SQLに合わせてconditionを構築してSQL参照をください！
//      const loadData = async () => {
//       　     // 実際日付など条件が必要な場合conditions.valueに入れて検索してください
//              let val = await dataStore.runLoad(sqltag.value, conditions.value || { }, sqltag.value)
//              rows.value = val
//              await nextTick()
//      }

//     watch(
//         [sqltag, conditions],
//         async ([snv, cnv]) => {
//              console.log('snv,cnv===', snv, cnv)
//              if (!snv) return
//              await loadData()
//         }, {immediate: true,}
//     )
  },
  // 各タブのSQLタグを定義
  tab2sqltag_list: { // 機能別の定義。一つの機能一つのhash map。keyはmtb_categoryテーブルのsub_category_codeの値になります。複数の機能はTab/Accordionに表示される
    user_roles: { // mtb_categoryテーブルのsub_category_codeの値になります
        label: 'ユーザーのロール', // sub_category_codeのsub_category_nameと同等だが、sub_category_nameを優先適用中でTab名として表示。
        data_key: 'userdata',      // 現在未使用
        display_items: ['role_code','role_name'], // 左一覧に選択するときフォームのタイトルに表示したい項目（例えば、{"ユーザーID - ユーザー名"}表示したい場合、user_id, user_nameという項目を設定する（実在する項目））
        jsonb_fields: [],          // jsonb カラムの一覧。主に、１）JSON.parse, ２）flat可、３）再度jsonb構築に使う
        skip_reload: true,
        sqltags:{ select:'user_roles.get_user_roles', save:'user_roles.save_user_roles', delete:'user_roles.delete_user_role', }, // sql tags, 必要に応じてTag追加。例えば、承認SQL Tag追加、この場合FormVuetifyContainerHybrid.vueボタンなど対応するアクションの追加が必要です！
        separate_items: [ 'role_code','role_name','remarks','enabled','show_order' ],// jsonb以外の普通カラム。保zんする前にjsonb_fieldsから外すためです
    },
  },
};

```

## config構造

```text
MAIN_CONFIG
├─ app_name
├─ app_key
├─ grid
│   ├─ sql_tag
│   └─ condition
└─ tab2sqltag_list
    └─ role_master
        ├─ display_items
        ├─ sqltags
        ├─ condition
        ├─ separate_items
        └─ jsonb_fields

```


## アプリの条件。 

検索時にこの４条件を揃える  

```text
/****
 * 1) config init conditoon values
 *   (1) MAIN_CONFIG.grid.condition
 *   (2) MAIN_CONFIG.tab2sqltag_list.[sub_category_code].condition
 * 2) properties from custom web component
 *      dataStore.params.attributes
 * 3) アプリケーションの条件の値
 * 　{start_date: '2026-06-11', ....}
 * 4) データ選択などでダイナミック値、
 * 　例えば、selectedRow
 */
```


-------------------------------------------------------------

## 外部Config JS、mtb_item_category、mtb_item_dictionary の関係

自動フォーム生成では、次の3つの設定が連携して画面を構成する。

```text
外部 index.js MAIN_CONFIG
        ↓
どの画面を表示するか、どのSQLTAGを使うかを決める

master_schema.mtb_item_category
        ↓
アプリ・機能・タブ・画面タイプを管理する

master_schema.mtb_item_dictionary
        ↓
フォームに表示する項目、入力部品、検証、表示順を管理する
```

---

# 1. 役割の違い

## 1.1 外部Config JS

外部Config JSは、フロント側の画面起動設定である。

主な役割：

* 初期表示タブの指定
* タブごとの `data_key` 指定
* SQLTAGの指定
* JSONBカラムの指定
* 通常カラムの指定
* リロード制御
* 保存・削除・承認SQLTAGの紐付け

例：

```javascript
user: { //
  label: 'ユーザー情報',
  data_key: 'userdata',
  jsonb_fields: ['option_data'],
  skip_reload: true,
  sqltags: {
    select: 'system.get_users',
    save: 'system.save_user_request',
    delete: 'system.delete_user_request',
    approve: 'system.approve_user_request'
  },
  separate_items: [
    'id',
    'user_id',
    'email',
    'password',
    'draft_status',
    'draft_effective_date'
  ]
}
```

つまり、外部Config JSは、

```text
このタブでは、どのデータを、どのSQLで取得・保存するか
```

を定義する。

---

## 1.2 mtb_item_category

`mtb_item_category` は、アプリと機能の登録マスタである。

主な役割：

* アプリを登録する
* アプリ内の機能を登録する
* タブ表示順を決める
* 自動フォームか手作り画面かを決める
* 表示・非表示を管理する

例：

```text
category_code      : system
category_name      : システム管理
sub_category_code  : user
sub_category_name  : ユーザー情報
data_structure     : single
ui_component       : null
enabled            : active
show_order         : 10
```

`data_structure` の意味：

```text
single      : 1件の自動フォーム
repeatable  : 複数件の自動フォーム
page        : 手作りVueコンポーネント
```

つまり、`mtb_item_category` は、

```text
このアプリに、どんな機能タブがあるか
```

を管理する。

---

## 1.3 mtb_item_dictionary

`mtb_item_dictionary` は、フォーム項目の定義マスタである。

主な役割：

* 項目コードを管理する
* ラベルを管理する
* 入力コンポーネントを管理する
* 必須・readonly・hiddenを管理する
* バリデーションを管理する
* 選択肢を管理する
* 表示順を管理する
* 計算式を管理する
* 項目単位の権限制御に利用する

例：

```json
{
  "key": "user_name",
  "db": {
    "column": "user_name",
    "dataType": "varchar"
  },
  "component": "v-text-field",
  "label": "ユーザー名",
  "type": "text",
  "required": true,
  "props": {
    "clearable": true,
    "variant": "outlined"
  },
  "display": {
    "cols": 12,
    "md": 6
  }
}
```

つまり、`mtb_item_dictionary` は、

```text
このフォームに、どんな項目を、どのように表示・入力させるか
```

を管理する。

---

# 2. 3つの関係

例：ユーザー情報画面の場合

## 外部Config JS

```javascript
user: {
  label: 'ユーザー情報',
  data_key: 'userdata',
  jsonb_fields: ['option_data'],
  sqltags: {
    select: 'system.get_users',
    save: 'system.save_user_request'
  },
  separate_items: [
    'id',
    'user_id',
    'email',
    'password'
  ]
}
```

## mtb_item_category

```text
category_code      : system
sub_category_code  : user
sub_category_name  : ユーザー情報
data_structure     : single
enabled            : active
show_order         : 10
```

## mtb_item_dictionary

```text
category_code      : system
sub_category_code  : user
l_item_code        : user_id
l_item_code        : email
l_item_code        : password
l_item_code        : user_name
```

この3つが `sub_category_code = user` で連携する。

---

# 3. 連携キー

基本的な連携キーは以下である。

```text
category_code
sub_category_code
```

または、外部Config JSのキー名と `sub_category_code` を一致させる。

例：

```javascript
tab2sqltag_list: {
  user: { ... }
}
```

この `user` が、DB側の

```text
mtb_item_category.sub_category_code = user
mtb_item_dictionary.sub_category_code = user
```

と対応する。

---

# 4. 画面生成の流れ

```text
1. MAIN_CONFIG.default_list を確認
        ↓
2. MAIN_CONFIG.tab2sqltag_list を読み込む
        ↓
3. mtb_item_category から有効な機能一覧を取得
        ↓
4. category_code / sub_category_code に対応するタブを作成
        ↓
5. mtb_item_dictionary から項目定義を取得
        ↓
6. data_structure を判定
        ↓
7. single / repeatable / page に分岐
        ↓
8. SQLTAG select でデータ取得
        ↓
9. DynamicVuetifyForm で画面生成
        ↓
10. SQLTAG save/delete/approve で保存・削除・承認
```

---

# 5. data_structure別の動作

## 5.1 single

1人1件、または1対象1件のフォーム。

例：

```text
ユーザー情報
スタッフ基本情報
契約基本情報
```

動作：

```text
mtb_item_dictionary
        ↓
DynamicVuetifyForm
        ↓
1件フォーム表示
```

保存：

```text
separate_items は通常カラムへ保存
jsonb_fields はJSONBカラムへ保存
```

---

## 5.2 repeatable

1人に複数件あるデータ。

例：

```text
銀行口座
扶養家族
資格
職歴
通勤経路
```

動作：

```text
mtb_item_dictionary
        ↓
RepeatableFormWrapper
        ↓
DynamicVuetifyForm × 複数
```

保存：

```text
複数レコードをLOOP処理または配列処理で保存
```

---

## 5.3 page

自動フォームでは表現しにくい画面。

例：

```text
ロール権限設定
Ganttチャート
勤務表
画像アップロード
ダッシュボード
```

動作：

```text
mtb_item_category.ui_component
        ↓
登録済みVueコンポーネントを表示
```

ただし、`page` の場合でも項目定義は `mtb_item_dictionary` に登録する。

理由：

```text
1. 項目単位の権限管理に使う
2. 技術仕様として管理する
3. 将来、自動フォーム化・検索条件化・帳票化に使える
```

---

# 6. separate_items と jsonb_fields の関係

## separate_items

通常カラムとして保存する項目。

例：

```javascript
separate_items: [
  'user_id',
  'email',
  'password',
  'enabled'
]
```

DBでは通常カラム：

```sql
user_id
email
password
enabled
```

に保存される。

---

## jsonb_fields

JSONBカラムとして保存する項目。

例：

```javascript
jsonb_fields: ['option_data']
```

DBでは：

```sql
option_data jsonb
```

に保存される。

---

## 保存時の考え方

```text
field_definition.db.column が separate_items に含まれる
        ↓
通常カラムとして保存

それ以外で jsonb_fields が指定されている
        ↓
JSONB内に保存
```

例：

```json
{
  "user_id": "chen",
  "email": "chen@example.com",
  "option_data": {
    "language": "ja",
    "theme": "dark"
  }
}
```

---

# 7. SQLTAGとの関係

外部Config JSの `sqltags` は、画面のCRUD処理を指定する。

```javascript
sqltags: {
  select: 'system.get_users',
  save: 'system.save_user_request',
  delete: 'system.delete_user_request',
  approve: 'system.approve_user_request'
}
```

意味：

```text
select   : 一覧・詳細取得
save     : 新規・更新・一時保存
delete   : 削除・取消
approve  : 承認
```

フォーム自体はSQLを知らない。

```text
DynamicVuetifyForm
        ↓
emit save
        ↓
FormVuetifyContainer
        ↓
DataStore
        ↓
SQLTAG
        ↓
PostgreSQL
```

---

# 8. 新規アプリ・フォーム作成時の判断基準

## 自動フォームでよい場合

以下の場合は `single` または `repeatable` を使う。

```text
通常の入力フォーム
マスタ管理
スタッフ情報
銀行情報
扶養情報
資格情報
ユーザー情報
```

---

## 手作りフォームにする場合

以下の場合は `page` を使う。

```text
複雑な表形式編集
ドラッグ操作
Ganttチャート
権限ルールのJSON編集
画像アップロード専用画面
複雑なダッシュボード
```

ただし、手作りフォームでも項目定義は登録する。

---

# 9. 本番アプリ作成時のチェックリスト

## 9.1 mtb_item_category

```text
category_code は正しいか
sub_category_code はConfigのキーと一致しているか
data_structure は正しいか
enabled は active か
show_order は設定されているか
page の場合 ui_component は設定されているか
```

---

## 9.2 mtb_item_dictionary

```text
category_code / sub_category_code は正しいか
g_item_code は全体で一意か
l_item_code は機能内で一意か
field_definition.key は保存キーと一致しているか
component は存在するか
required / readonly / hidden は正しいか
show_order は設定されているか
enabled は active か
```

---

## 9.3 外部Config JS

```text
tab2sqltag_list のキーは sub_category_code と一致しているか
label はタブ名と一致しているか
data_key はAPI結果のキーと一致しているか
jsonb_fields は正しいか
separate_items は正しいか
sqltags.select は存在するか
sqltags.save は存在するか
sqltags.delete は存在するか
skip_reload の設定は適切か
```

---

# 10. まとめ

3つの設定の責任範囲は以下のように分ける。

```text
mtb_item_category
    何のアプリ・機能・タブを表示するか

mtb_item_dictionary
    そのフォームに何の項目を表示するか

外部Config JS
    その画面がどのSQLTAGでデータ取得・保存するか
```

つまり、

```text
mtb_item_category = 画面構造
mtb_item_dictionary = 項目仕様
外部Config JS = 動作設定
```

この3つを正しく登録すれば、Vueソースを追加しなくても、本番用のアプリ・フォームを作成できる。
