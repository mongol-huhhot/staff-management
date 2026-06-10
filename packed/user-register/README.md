### Localizing 

standard_menuプロジェクトから構成するようにする。

- ① LanguageSwitcher.vueというファイルを@/componenents/へコピーする
- ② i18n.jsというファイルを@/にコピーする
- ③ loadLocaleMessages.jsというファイルを@/utils/にコピーする
- ④ yarn add vue-i18nで必要なLibをダウンロード  
     yarn add flag-icons　 ---国旗アイコン
- ⑤ @/locales/をコピー
- ⑥ @/main.js　に

```text
　import i18n from './i18n';
　import 'flag-icons/css/flag-icons.min.css'

  ...他のコード

　app.use(i18n);
```   
を入れる  

- ⑦ loadLocaleMessages.jsの下記の項目を編集して自分のファイル名に合わせる。一つの場合一つだけでいい

```text
  import(`../locales/common.${locale}.json`),
  import(`../locales/login.${locale}.json`)
```
- ⑧ @/locales/の下のファイルをこのファイルの名に合わせる
- ⑨ @/locales/のしたのファイルを編集し、必要な項目の定義をする
- ⑩ コンポーネントに
　　　{{ $t("login.surupasTitle") }}  のように使う  

あるいは、＄なしで、t('gender.female')に呼ぶ。  

```text
    const { t, locale } = useI18n()
    const gentles = computed(() => [
      { label: t('gender.female'), value: 'female' },
      { label: t('gender.male'), value: 'male' },
      { label: t('gender.other'), value: 'other' }
    ])
```  

読みやすくするため(Readability)に、Lcalizingタグの内容をコメントして残して下さい！  

```text
<!-- SURUPAs&nbsp;ログイン -->
{{ $t("login.surupasTitle") }}
```  

### The dir structure  

追加する言語によってjsonファイルは増減します。

```text
/src/
  /locales/
    userRegister.en.json
    userRegister.ja.json
    common.en.json
    common.ja.json
  /utils/
    loadLocaleMessages.js
  /i18n.js
  main.js

```  


