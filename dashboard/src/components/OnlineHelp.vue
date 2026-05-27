<script setup>
import { ref } from 'vue';

// State for the help sidebar
const helpSidebar = ref(false);

const contractTermsHTML = `
  <style>
  li {
    margin: 8px;
  }
  details {
    margin-bottom: 1rem;
  }
  summary {
    font-weight: bold;
    cursor: pointer;
    color: '#616a6b';
  }
  </style>
  <h3>画面用語一覧</h3>
  <details>
    <summary>『ユーザー一覧』画面</summary>
    <ol>
      <li><strong>「ユーザー一覧」</strong>：<p>ログイン可能なユーザー一覧として表示する画面</p></li>
      <li><strong>「新規契約」</strong>：<p>新社員に対するはじめの契約作成。誰のか契約か社員指定が必須</p></li>
      <li><strong>「契約編集」</strong>：<p>既存作成中の契約の確認と編集。承認済契約は編集不可</p></li>
      <li><strong>「契約閲覧」</strong>：<p>契約を出力シートで確認</p></li>
      <li><strong>「操作手順」</strong>：<p>契約作成操作順番の表示</p></li>
      <li><strong>「❓」（丸）</strong>：<p>このガイドを表示</p></li>
    </ol>
  </details>
  <details>
    <summary>『契約作成』画面</summary>
    <ol>
      <li><strong>「契約作成」</strong>：<p>契約を編集するエリア</p></li>
      <li><strong>「新規」</strong>：<p>すでに契約有る社員に対する契約形態変更・契約更新などによる契約作成。社員特定不要</p></li>
      <li><strong>「登 録」</strong>：<p>編集データを保存</p></li>
      <li><strong>「削 除」</strong>：<p>編集データを削除。承認済契約は削除不可</p></li>
      <li><strong>「リセット」</strong>：<p>編集データのリセット。保存ししてないと左の一覧を選んでリカバー可能</p></li>
      <li><strong>「テンプレートとして保存」</strong>：<p>編集データをテンプレートとして保存。最高管理者が操作可能</p></li>
    </ol>
  </details>
`
// Injected HTML for "FAQ"
const faqHTML = `
  <style>
  li {
    margin: 8px;
  }
  </style>
  <h3>FAQ</h3>
  <details>
    <summary>契約作成について質問</summary>
    <ul>
      <li><strong>一括複数人の契約の作成は可能か?</strong> - <p>可能です。複数社員を選んで他の条件を入れて保存するだけです。社員情報はマスタからとなるため、社員マスタに登録されている社員に限ります</p></li>
      <li><strong>社員マスタに登録なし者に対して契約作成できますか?</strong> - <p>可能です。社員情報を契約に直接記入して保存するだけです</p></li>
      <li><strong>契約状態は?</strong> - <p>契約は「作成中」、「現行」、「期限切れ」の3つ状態があります。「作成中」の契約はまだ無効で、承認（本人・会社）後「現行」になり有効となります。また、契約期限が切れたら「期限切れ」と失効になります。<br>
        「現行」「期限切れ」は更新不可となります。万が一更新する場合、「契約更新」として新規契約を結んで入れ替えをします。また、操作を便利にするため、既存契約をコピーして訂正できます</p>
      </li>
    </ul>
  </details>
`

defineExpose({ helpSidebar });

</script>

<template>
  <v-container>
    <v-navigation-drawer v-model="helpSidebar" location="right" temporary :width="640">
      <v-list density="compact">
        <!-- Injected HTML for "画面用語一覧" -->
        <v-list-item>
          <div v-html="contractTermsHTML"></div>
        </v-list-item>

        <!-- Injected HTML for "FAQ" -->
        <v-list-item>
          <div v-html="faqHTML"></div>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </v-container>
</template>
