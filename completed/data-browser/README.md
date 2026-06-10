# SURUPAs埋め込み　給与計算管理画面

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
# payroll

/**
* スタッフの部署変動、昇格、降格、異動の場合、デフォルト値はどう対応する方法：
* 個人情報管理などの対応と別に、
* 　給与計算システム情報上、デフォルト値を入れ直す必要がある
* 　方法は、
* 　　① 現行デフォルト値の設定値を一括無効に設定。この操作は、「デフォルト値」廃止と言う機能を提供する
* 　　② 新規デフォルト値を設定する。方法は、(1)CSVデータファイルからアップロード、(2)画面上調節入力する
* 
*/

/**
    // 基本" name="basic"
    // 手当" name="items"
    // 扶養人数" name="dep"
    // 雇用保険" name="empIns"
    // 交通費" name="trans"
    // 住民税" name="resident"
    // 支給" name="payment"
    // "控除" name="deduction"
    // "勤怠" name="attendance"
    // その他" name="others"

    //基本項目
*/
