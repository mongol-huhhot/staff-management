# 退職申請管理

社員が退職願を提出し、現場（支店）と人事がそれぞれの退職手続きをチェックリストで
管理・完了させるための画面群。ホストシステムのメニュー
から Web コンポーネントとして呼び出され、同一デプロイが `?type=` クエリパラメータに
よって別画面として動作する。

## 画面（`?type=`）

| `?type=` | 画面 | コンポーネント | 利用者 |
|---|---|---|---|
| `request` | 退職申請 — 本人の申請作成・編集 | `request/ResignationRequest.vue` | ログインユーザー全員 |
| （なし） | スタッフ入退管理 — 現場手続き／人事手続きの2タブ | `resignation/ResignationManagement.vue` | 事務員 + 人事 |
| `checklist` | チェックリスト管理 — 手続きマスターの登録（会社ごとに手続き項目が異なるためハードコードせず画面から登録する） | `resignation/ChecklistMaster.vue` | 管理者／人事 |

フロー: 申請が `submitted` になると2つのタブに同時に行が表示される。両 scope の
必須タスクがすべて done/na になると申請は自動的に `completed` になり、
`staff.retired_at` に退職日が書き込まれる。承認（最終承認）は独立した画面ではなく、
人事手続きタブの1タスク（`final_approval`）。

## 起動方法

```bash
yarn install
yarn dev
```

- `http://localhost:5173/` — スタッフ入退管理（2タブ）
- `http://localhost:5173/?type=request` — 退職申請
- `http://localhost:5173/?type=checklist` — チェックリスト管理

ビルド（⚠ 必ずこのフォルダ内から実行すること — 別の場所から `npx vite` を実行すると
グローバルの v8 が使われ「index.html が見つからない」エラーになる）:

```bash
yarn build   # dist/ へ出力
```

## ステータス値一覧

### 1. `request_status` — 申請ステータス（`staff_schema.resignation_request`）

```
draft ──▶ submitted ──▶ completed
```

| コード | 表示 | 説明 |
|---|---|---|
| `draft` | 下書き | 未提出の下書き |
| `submitted` | 提出済 | 提出済み — 2つのタブに同時に表示され、本人は再編集・再提出できる |
| `completed` | 完了 | 両 scope の必須タスクがすべて done/na — `save_task_progress` が自動設定し、`staff.retired_at` に退職日を書き込む |
| `cancelled` | — | 任意の時点から: ──▶ cancelled |


## ファイル構成（主要部分）

```
src/
  components/
    MainLayout.vue                 ?type= を読んで画面を切り替える
    request/ResignationRequest*.vue     退職申請（フォーム／提出済み表示／dialog）
    resignation/ResignationManagement.vue   2タブ画面
    resignation/ProcedureListTab.vue        一覧（scope prop で共用）
    resignation/TaskChecklistDialog.vue     チェックリスト dialog
    resignation/ChecklistMaster.vue         マスター登録画面
    helper/                        AgGridPro など再利用グリッド部品
                                   （別ドキュメント: src/components/helper/README.md）
  composables/useColumns.js        カラム定義 + ステータスラベルの集約
  stores/DataStore.js              SQL タグ呼び出し + DEV モック fallback
  stores/mock/                     backend タグ定義までの DEV データ
docs/                              設計・backend SQL ドキュメント（モンゴル語）
```
