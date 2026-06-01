# Generic Master System 詳細仕様書

| 項目 | 内容 |
|------|------|
| プロジェクト名 | janga-web-components（generic-master） |
| バージョン | 0.1.1 |
| 最終更新 | 2026-05-29 |
| 対象読者 | 開発者・保守担当・インテグレーション担当 |

---

## 1. 概要

### 1.1 目的

本システムは **スタッフ（従業員）の個人情報・マスタ情報を一覧表示・編集する Web コンポーネント** である。Surupas プラットフォーム上の DataEngine（PHP + SQL テンプレート）と連携し、テナント単位で DB アクセスを行う。

主な機能:

- スタッフ一覧（AG Grid）の表示・行選択
- タブ形式の動的フォームによる項目編集（DB マスタ駆動）
- タブ単位の保存（SQLTAG 設定可能）
- CSV アップロード（変動データ）
- 月額変更届 CSV 出力（一部 API 未実装あり）

### 1.2 提供形態

| モード | 説明 |
|--------|------|
| **単体開発** | `npm run dev` → ルート `index.html` から起動 |
| **Web Component 埋め込み** | ビルド成果物 `generic-master-system`（IIFE）を親ページに読み込み、`<generic-master-system>` タグで利用 |
| **親システム連携** | 親ページで `public/js/index.js` を先に読み込み `window.appConfig` を設定する必要がある |

### 1.3 カスタム要素名

```
<generic-master-system j='{"user_id":"...","tid":"premier"}'></generic-master-system>
```

- **要素名**: `generic-master-system`
- **必須属性**: `j` — JSON 文字列（`user_id`, `tid` 等）

---

## 2. 技術スタック

| 区分 | 技術 | バージョン目安 |
|------|------|----------------|
| フレームワーク | Vue 3 (Composition API, `<script setup>`) | ^3.5 |
| UI | Vuetify 3 | ^3 |
| 状態管理 | Pinia | ^2.1 |
| ビルド | Vite | ^8 |
| グリッド | AG Grid Community + ag-grid-vue3 | ^31 |
| レイアウト | splitpanes | ^4 |
| 日付 | dayjs | ^1.11 |
| CSV | papaparse, encoding-japanese | — |
| Web Component | vue3-webcomponent-wrapper | ^0.2 |

---

## 3. システムアーキテクチャ

### 3.1 レイヤ構成

```
┌─────────────────────────────────────────────────────────────┐
│  親ページ / index.html                                       │
│    window.appConfig (public/js/index.js)                     │
│    <generic-master-system j="...">                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  Presentation Layer (Vue Components)                           │
│    top-page.ce.vue → MainLayout → MainList | FormVuetify...  │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  Application Layer (Pinia Stores)                            │
│    useDataStore (DataStore.js)                                 │
│    useAppConfigStore (AppConfigStore.js)                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  Infrastructure Layer (useDbStore.js)                        │
│    fetch → /{tid}/dataEngine/v5/handleRequest/...             │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  Backend (Surupas DataEngine)                                  │
│    requestHandler.php / login.php + SQL テンプレート (PHP)      │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 画面レイアウト

`MainLayout.vue` は左右 2 ペイン（`Splitpanes`）:

| ペイン | コンポーネント | 役割 |
|--------|----------------|------|
| 左 | `MainList.vue` | スタッフ一覧・年月選択・CSV・月額変更届 |
| 右 | `FormVuetifyContainer.vue` | 選択スタッフのタブ編集フォーム |

### 3.3 コンポーネントツリー

```
main.js
└─ customElements: generic-master-system
   └─ top-page.ce.vue
      └─ MainLayout.vue
         ├─ MainList.vue
         │  ├─ PagedAgGridCard.vue → AgGridPro.vue
         │  └─ CSVUpload.vue
         └─ FormVuetifyContainer.vue
            ├─ DynamicVuetifyForm.vue（通常タブ）
            └─ RepeatableFormWrapper.vue（repeatable タブ）
               └─ DynamicVuetifyForm.vue
```

---

## 4. 起動・初期化フロー

### 4.1 単体起動時のファイル読み込み順

1. `index.html`
2. `public/js/index.js` — `window.appConfig.MAIN_CONFIG` を定義
3. DOM: `<generic-master-system j="...">`（この時点では未登録）
4. `src/main.js` — 依存モジュール解決後、`customElements.define`
5. カスタム要素アップグレード → Vue アプリ起動

### 4.2 main.js の処理

```javascript
// 1. Vuetify インスタンス作成
// 2. WebComponentInner: createApp + vuetify + pinia（インスタンスごと）
// 3. wrapper(top-page.ce.vue, WebComponentInner, h)
// 4. customElements.define('generic-master-system', webComponent)
```

**注意（Pinia 二重化）**:

- `DataStore.js` モジュール読み込み時: `setActivePinia(createPinia())` が実行される
- Web Component 内: `app.use(createPinia())` で別インスタンスが作られる

`useDataStore()` はモジュールロード時の Pinia に紐づく。Web Component 用 Pinia とは別になる可能性があるため、状態共有に不整合が出る場合は要確認。

### 4.3 top-page.ce.vue の初期化

`props.j` を `watch`（`immediate: true`）:

1. JSON パース（`&quot;` → `"` 置換対応）
2. `dataStore.params.attributes = p`
3. `login()` — 固定資格情報で `authenticate.login`
4. `get_user_register({ user_id })`

`props.j` が無い場合はエラーメッセージのみ表示。

### 4.4 環境変数（.env.development）

| 変数 | 説明 |
|------|------|
| `VITE_APP_MODE` | development |
| `VITE_SKIP_AUTH` | true（開発用） |
| `VITE_DEV_TENANT_ID` | デフォルト tid（premier） |
| `VITE_DEV_USER_ID` | デフォルト user_id（dev_user） |

---

## 5. 設定仕様（window.appConfig）

### 5.1 読み込み

`AppConfigStore.loadFromWindow()` が `Object.assign(this, window.appConfig)` で Pinia にコピーする。

**親ページまたは `public/js/index.js` を main.js より先に読み込むこと。**

### 5.2 MAIN_CONFIG.tab2sqltag_list

各タブ（`sub_category_code` と一致するキー）の定義:

| プロパティ | 型 | 説明 |
|------------|-----|------|
| `label` | string | 表示名 |
| `data_key` | string | 論理データキー |
| `jsonb_fields` | string[] | 取得時にフラット化する JSONB カラム名 |
| `skip_reload` | boolean | 保存後の再読込をスキップ（basic のみ true） |
| `sqltags.select` | string | タブデータ取得 SQLTAG |
| `sqltags.save` | string | タブデータ保存 SQLTAG |
| `sqltags.delete` | string | 削除 SQLTAG（UI 未実装） |

**現在の設定例**（`public/js/index.js`）:

| タブキー | ラベル | select | save | jsonb_fields |
|----------|--------|--------|------|--------------|
| basic | 基本情報 | staffs.get_staff_profile | staffs.upsert_staff_profile | profile_jsonb |
| traffic | 通勤情報 | staffs.get_staff_traffic | staffs.save_staff_traffic | traffic_info |
| bank | 銀行情報 | masters.get_staff_bank | masters.save_staff_bank | （なし） |
| education | 資格情報 | masters.get_staff_education | masters.save_staff_education | education_info |

### 5.3 debug_mode

`MAIN_CONFIG.debug_mode === true` のとき、`MainList` の `readOnly` が常に `false`（編集可能）。

---

## 6. データアクセス仕様（useDbStore）

### 6.1 テナント ID 解決

`detectTid()`:

- `localhost` / `127.0.0.1` → `commonParams.tid`（デフォルト `premier`）
- それ以外 → URL パス先頭セグメント（例: `/premier/...` → `premier`）

### 6.2 エンドポイント

| 用途 | パス（相対） |
|------|----------------|
| トランザクション | `/{tid}/dataEngine/v5/handleRequest/requestHandler.php` |
| ログイン | `/{tid}/dataEngine/v5/handleRequest/login.php` |
| ログアウト | `/{tid}/dataEngine/v5/handleRequest/logout.php` |
| トークン検証 | `/{tid}/dataEngine/v5/handleRequest/verify.php` |

開発時 Vite プロキシ: `^/[^/]+/dataEngine/.*` → `https://surupas-run.native365.net`

### 6.3 リクエスト形式

POST、`Content-Type: application/json`、認証時 `Authorization: Bearer {token}`

```json
{
  "json_string": {
    "COMMON": {
      "RETURN": 1,
      "RESULT_TYPE": 1,
      "QUERY_TYPE": 2,
      "tid": "premier",
      "SQL_PATH": "premier/showcase/entrance.sql"
    },
    "staffs.get_staff_profile": {
      "SQL_TAG": "staffs.get_staff_profile",
      "staff_code": "001",
      "category_code": "basic"
    }
  }
}
```

### 6.4 マルチタグ取得（dbAccessWithMultiTags）

複数 SQL を 1 リクエストで実行。レスポンスは `unwrapMultiTagResult` で各キーの配列に変換:

```
resp.result[tabCode].result[0].result → data[tabCode]
```

### 6.5 主要 API ラッパー

| メソッド | 説明 |
|----------|------|
| `load(sqltag, params, options)` | 取得。成功時 `result` 配列、失敗時 null + スナックバー |
| `execute` / `save(sqltag, params, options)` | 更新。成功時 true |
| `login(sqltag, params, options)` | ログイン。token を session/localStorage に保存 |
| `verify()` | JWT 検証 |
| `logout()` | ログアウト + token 削除 |

### 6.6 認証エラー

JWT 期限切れ等で `surupas:auth-expired` カスタムイベントを dispatch。

---

## 7. 状態管理仕様

### 7.1 useDataStore（DataStore.js）

#### states

| キー | 型 | 説明 |
|------|-----|------|
| `currentRow` | object \| null | 一覧で選択中のスタッフ行 |
| `approved_status` | boolean \| null | 月額変更届の届出状態（一覧から算出） |
| `current_month` | string | 対象年月（YYYY-MM-DD、給与日ベース） |
| `staff_code` | string \| null | 予約 |
| `forceFresh` | any | 一覧再読込トリガ（参照あり、setter 要確認） |

#### params

| キー | 説明 |
|------|------|
| `attributes` | Web Component の `j` 属性からパースした `{ user_id, tid, ... }` |

#### 公開メソッド

| メソッド | SQLTAG（定数） |
|----------|----------------|
| `get_staff_profile` | staffs.get_staff_profile |
| `get_item_category` | masters.get_item_category |
| `get_item_dictionary` | masters.get_item_dictionary |
| `get_user_register` | users.get_user_register |
| `runSave(sql_tag, params)` | 任意 |
| `saveData(params)` | staffs.upsert_staff_profile 固定 |
| `dbAccessWithMultiTags(params)` | 複数タグ |
| `login` / `logout` / `verify` | 認証 |

### 7.2 useAppConfigStore

`window.appConfig` のシャローコピー。`MAIN_CONFIG` を参照。

---

## 8. 画面・機能仕様

### 8.1 MainList.vue（左ペイン）

#### 8.1.1 一覧データ取得

- トリガ: `dataStore.states.current_month` 変更、`forceFresh` 変更
- SQL: `staffs.get_staff_profile`（`category_code: 'staffs'`）
- 処理: `parseAndFlattenJsonbFields(val, ['profile_jsonb'])` で JSONB をフラット化して `rows` に格納

#### 8.1.2 年月選択

- UI: `type="month"` の `v-text-field`
- 初期値: 前月（`subMonth = -1`）
- `salaryDay = '20'` — 選択月の 20 日を `current_month` に正規化

#### 8.1.3 行クリック

`handleRowClick` → `dataStore.states.currentRow = event.data`

右ペイン `FormVuetifyContainer` が `currentRow` を watch してフォームを更新。

#### 8.1.4 読み取り専用判定（readOnly）

```
debug_mode → 編集可
isOperatable（MAIN_CONFIG.includes(今月)）かつ 未届 → 編集可
それ以外 → 読み取り専用
```

※ `MAIN_CONFIG.includes` は配列想定だが、現設定はオブジェクトのため **常に undefined になり得る**。要設定見直し。

#### 8.1.5 月額変更届 CSV

- `handleDownload` → `get_change_notification` / `approve_change_notification`
- **DataStore に未実装**（実行時エラーになる）

#### 8.1.6 グリッド列

`buildInitColumns`（`useColumns.js`）で固定列 + `itemDefs` 動的列。

### 8.2 FormVuetifyContainer.vue（右ペイン）

#### 8.2.1 マスタ取得（onMounted）

同時取得:

| ブロックキー | SQLTAG | パラメータ |
|--------------|--------|------------|
| category | masters.get_item_category | category_code: staffs, enabled: active |
| dictionary | masters.get_item_dictionary | 同上 |

`category` → タブ定義（`sub_category_code`, `category_name`, `data_structure`, `show_order`）  
`dictionary` → 項目定義（`field_definition` JSONB をパース）

#### 8.2.2 formData 構造

```javascript
formData = {
  [tabCode]: { fieldKey: value, ... }   // 通常タブ（object）
  [tabCode]: [ { ... }, { __uuid } ]    // repeatable タブ（array）
}
```

- タブコード = `sub_category_code`（DB カテゴリマスタと一致）
- フィールドキー = `field_definition.key` || `l_item_code` || `g_item_code`

#### 8.2.3 タブ切替・遅延ロード

`loadActiveTabData(tabCode)`:

1. `currentRow` と `staff_code`/`staff_id` 必須
2. キャッシュキー `{staffKey}:{tabCode}` — 同一ならスキップ（`force` で再取得）
3. `tabSqlTags[tabCode].sqltags.select` で DB 取得
4. `jsonb_fields` を `parseAndFlattenJsonbFields` でフラット化
5. `formData[tabCode]` にマージ

`activeName` 変更時・`currentRow` 変更時に実行。

#### 8.2.4 保存処理（save）

**アクティブタブのみ**保存:

```javascript
const tabCode = activeName.value
const currentTabData = formData.value[tabCode] || {}
const saveSqlTag = tabSqlTags[tabCode]?.sqltags?.save || 'staffs.upsert_staff_profile'

await dataStore.runSave(saveSqlTag, {
  staff_code: row.staff_code,
  profile_version: (row.profile_version || 0) + 1,
  profile_jsonb: JSON.stringify(currentTabData),
  files: JSON.stringify(row.files ?? {}),
})
```

保存後: `loadActiveTabData(tabCode, { force: true })`（`skip_reload` 未使用 — basic でも再読込される実装）

**設計上の注意**:

- `basic` タブ以外（traffic, bank 等）でも同一 payload 形状（`profile_jsonb`）を送っている
- タブごとの SQL・カラム構造が異なる場合は **payload 組み立ての分岐が必要**
- 他タブのデータをマージせず **当該タブの formData のみ** JSON 化しているため、profile 全体を上書きする SQL 設計だと他タブ情報が消えるリスクあり

#### 8.2.5 編集モード

`editMode = !!dataStore.states.currentRow` — 行未選択時は保存・削除ボタン非表示。

#### 8.2.6 未実装機能

- `confirmDelete` — 確認のみ、削除 API 未接続
- `csvDownload` — 空実装
- ヘッダー「保存」は全タブ共通（アクティブタブ保存）
- フォーム内「保存」は `@submit="save"` で同関数

### 8.3 DynamicVuetifyForm.vue

項目マスタ駆動の動的フォーム。

| field 属性 | 用途 |
|------------|------|
| `key` | v-model バインドキー |
| `label` | 表示ラベル |
| `component` / `type` | Vuetify コンポーネント種別 |
| `props` | 追加 props |
| `validation` | required, minLength, maxLength, pattern, email |
| `showable` | `hide` で非表示 |
| `enabled` | `inactive` で除外（親でフィルタ済み） |

`submit` イベントで親の `save()` を呼ぶ。

### 8.4 RepeatableFormWrapper.vue

`data_structure === 'repeatable'` のタブ用。配列要素ごとに `DynamicVuetifyForm`。追加時 `__uuid` を付与。

### 8.5 CSVUpload.vue

変動データ CSV のアップロード UI。`CSVUploadStore` 経由で保存。`disabled` は `MainList.readOnly` に連動。

---

## 9. SQL 連携仕様

### 9.1 スタッフプロフィール（例: ユーザー提供 SQL）

#### staffs.get_staff_profile

```sql
SELECT staff_id, profile_jsonb, profile_version, staff_code
FROM staff_schema.staff_profile
WHERE ...
```

フロントは `profile_jsonb` をフラット化して一覧・フォームに展開。

#### staffs.upsert_staff_profile

| パラメータ | 説明 |
|------------|------|
| `staff_code` | 必須。ON CONFLICT キー |
| `profile_jsonb` | JSON 文字列 → DB 側で jsonb 変換 |
| `profile_version` | 数値。フロントは保存時 +1 |
| `files` | JSON 文字列（files カラム） |

DB 側で `&quot`, `\u`, `\\` のエスケープ置換を実施。

### 9.2 項目マスタ SQL（想定）

| SQLTAG | 用途 |
|--------|------|
| masters.get_item_category | タブ（サブカテゴリ）一覧 |
| masters.get_item_dictionary | フォーム項目定義 |
| users.get_user_register | ログインユーザー登録情報 |
| authenticate.login | 認証 |

### 9.3 タブ別 SQL

`public/js/index.js` の `sqltags` で select/save/delete をタブごとに切替。PHP 側 SQL テンプレートに同名タグを定義すること。

---

## 10. ユーティリティ仕様

### 10.1 utilFactory.js

| 関数 | 説明 |
|------|------|
| `parseJsonbFields(rows, keys)` | 指定キーの JSON 文字列をオブジェクトにパース |
| `parseAndFlattenJsonbFields(rows, keys)` | JSONB 内キーを行オブジェクトにマージし、元 JSONB キーを削除 |

### 10.2 通知・ローディング

| モジュール | 用途 |
|------------|------|
| `utils/SnackBar.vue` | `showSnackbar(message, level)` |
| `utils/loadingService.js` | `showLoading` / `hideLoading` |

`useDbStore` から直接呼び出し。

---

## 11. ビルド・デプロイ

### 11.1 npm スクリプト

| コマンド | 説明 |
|----------|------|
| `npm run dev` | Vite dev server（0.0.0.0:5173） |
| `npm run build` | ライブラリ IIFE ビルド（entry: src/main.js） |
| `npm run preview` | ビルド結果プレビュー |

### 11.2 ビルド出力

- 形式: IIFE
- 名前: `GenericMasterSystem`
- ファイル名: `generic-master-system`

### 11.3 親システム埋め込み手順

1. `generic-master-system.js`（ビルド成果物）を読み込む
2. **先に** `index.js` 相当で `window.appConfig` を設定
3. HTML に `<generic-master-system j='{"user_id":"...","tid":"..."}'>` を配置
4. 親ページの URL が `/{tid}/...` 形式であること（本番 tid 解決）

---

## 12. ディレクトリ構成（主要）

```
generic-master/
├── index.html                 # 開発エントリ
├── public/
│   └── js/index.js            # appConfig（タブ SQL 定義）
├── src/
│   ├── main.js                # Web Component 登録
│   ├── components/
│   │   ├── top-page.ce.vue    # ルート CE
│   │   ├── MainLayout.vue
│   │   ├── MainList.vue
│   │   ├── forms/
│   │   │   ├── FormVuetifyContainer.vue
│   │   │   ├── DynamicVuetifyForm.vue
│   │   │   └── RepeatableFormWrapper.vue
│   │   ├── helper/grid/       # AG Grid 関連
│   │   └── csvupload/
│   ├── stores/
│   │   ├── DataStore.js       # アプリケーション Store
│   │   ├── useDbStore.js      # DB アクセス Store
│   │   └── AppConfigStore.js
│   ├── composables/
│   └── utils/
├── vite.config.js
└── docs/
    └── SPECIFICATION.md       # 本書
```

`bak/`, `forms copy/`, `helper-old/` はレガシー・バックアップ。本番参照は上記主要パスのみ推奨。

---

## 13. データフロー図

### 13.1 スタッフ選択 → フォーム表示

```
MainList: 行クリック
  → dataStore.states.currentRow = row
  → FormVuetifyContainer watch(currentRow)
      → formData クリア、タブ容器初期化
      → loadActiveTabData(activeName)
          → dbAccessWithMultiTags({ [tabCode]: { SQLTAG: sqltags.select, ... }})
          → parseAndFlattenJsonbFields
          → formData[tabCode] = parsedData
```

### 13.2 タブ保存

```
保存ボタン / DynamicVuetifyForm submit
  → save()
  → formData[activeName] を JSON.stringify
  → runSave(sqltags.save, { staff_code, profile_jsonb, profile_version, files })
  → loadActiveTabData(activeName, { force: true })
```

---

## 14. 既知の課題・未実装一覧

| 項目 | 状態 | 備考 |
|------|------|------|
| `get_change_notification` | 未実装 | MainList が呼び出し |
| `approve_change_notification` | 未実装 | 同上 |
| `getSalaryList` | 未定義 | showDeleted watch で参照 |
| タブ削除（sqltags.delete） | 未接続 | confirmDelete は空 |
| ヘッダー CSV ダウンロード | 未実装 | |
| login 固定アカウント | ハードコード | top-page.ce.vue |
| Pinia 二重インスタンス | 要確認 | DataStore vs CE 内 Pinia |
| basic 以外の save payload | 要設計 | 全タブ profile_jsonb 形式 |
| profile 部分更新 vs 全置換 | 要設計 | タブのみ保存で他キー消失の可能性 |
| MAIN_CONFIG.includes | 設定不整合 | オブジェクトに対し配列 API 使用 |

---

## 15. 拡張ガイド

### 15.1 新タブ追加

1. DB: `masters.get_item_category` に `sub_category_code` を追加
2. DB: `masters.get_item_dictionary` に項目を `sub_category_code` で紐付け
3. PHP: select/save/delete 用 SQL テンプレート追加
4. `public/js/index.js` の `tab2sqltag_list` にエントリ追加
5. `data_structure` が `repeatable` なら Repeatable フォームが自動選択

### 15.2 保存 payload をタブ別に分岐する場合

`FormVuetifyContainer.save()` 内で `tabCode` ごとに:

- SQLTAG（既存: `sqltags.save`）
- パラメータ名（`profile_jsonb` vs `traffic_info` 等）
- マージ戦略（既存 row + 当タブのみ patch）

を分岐実装する。

### 15.3 推奨: DataStore にドメインメソッド追加

```javascript
// 例
saveStaffTab(tabCode, staffCode, tabData, version) {
  const conf = configStore.MAIN_CONFIG.tab2sqltag_list[tabCode]
  return runSave(conf.sqltags.save, buildPayload(tabCode, staffCode, tabData, version))
}
```

UI（FormVuetifyContainer）から SQL 名・payload 組み立てを分離すると保守性が向上する。

---

## 16. 用語集

| 用語 | 説明 |
|------|------|
| SQLTAG | DataEngine で SQL テンプレートを識別する文字列キー |
| tid | テナント ID |
| sub_category_code | タブコード（formData のキー） |
| field_definition | 項目辞書マスタ内の UI 定義 JSONB |
| profile_jsonb | スタッフプロフィール統合 JSON カラム |
| CE | Custom Element（Web Component） |

---

## 改訂履歴

| 日付 | 内容 |
|------|------|
| 2026-05-29 | 初版作成（コードベース調査に基づく） |
