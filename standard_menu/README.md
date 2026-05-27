# 標準サービス管理ポータル
## サービス全般を管理するポータル
 - 会社が提供する全般サービスや提供する情報をまとめたサイト
 - メニューと権限をまとめて管理する

## メニューと権限管理データ
### 場所
dev://jsou221201@shared/m_menu


#### データ基本構造（再帰ツリー構造)

```text
baseDataStructure := 
{
  "id": "hr_top",
  "label": "人事評価",
  "style": {
    "color": "white"
  },
  "users": [
    "sysadmin",
    "12331",
    "34343",
    "demo3@janga.co.jp",
    "%__LOGIN_USER%"
  ],
  "disabled": false,
  "show": true,
  "open_icon": "mdi-clock-check-outline",
  "close_icon": "mdi-clock-outline",
  "user_group": [
    "sysmanager",
    "department_admin"
  ],
  "children": [
    baseDataStructure
  ]
}  

%__LOGIN_USER%: ログインユーザアクセス可能タグ。実際はログインユーザIDで入れ替えられる
<%__LOGIN_USER%>：は実際ログインユーザID。sessionに持たされている値

```  

#### 説明

- id: グルーバル唯一なID
- label: メニューに表示する文字
- style: html CSS。注：す別のStyleが有効ではない
- users: アクセス許可ユーザーID一覧
- user_group: アクセス許可グループID一覧

