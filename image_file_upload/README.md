## 用途  
画像管理用Custom Web Componentです。
任意のWEBページ上の使用は可能です。  

現在、
https://surupas-dev.native365.net/janga_vue_base_system/webcomponents/imageFileHandler/
にリリースしています。

#### 機能  
- アップロード保存・削除  
- 切り取り  
- 回転  
- サイズ調整  
- 画像品質調整
- 画像タイプ指定  
- iPhone HEICをJPEGに変換し管理
- 画像枚数、タイトル指定
- 画像編集モード・非編集モード指定可能
- 画像表示サイズ縮小率設定可能
- 複数画像のデフォルト横・縦表示指定（デスクトップPCのみ、モバイルをlandscapeにする横表示可能）
- 複数種類の画像ドキュメントを同時並んで表示可能。例：マイナンバーカード、学生証などを同じ画面で管理可能
- 画像ドキュメントに特定なキー設定可能
- 拡大表示可能
- デスクトップ・モバイル対応
- DB側SQL自由設定可能なため、DBやテーブルは自由に変更可能  
- コンポネントを変えずに設定を自由にできる


### 設定について  

設定については下記のような2つの方法があります。

#### jsファイルによる設定  

./js/UploadImage.jsというファイルに設定します。

その構造は

```text
// 他の設定と兼用
window.appConfig =  window.appConfig || {}

// イメージファイルアップロードの設定と兼用
window.appConfig.UploadFiles = {
    // 画像のキー。学生証
    student_card: {
        editable: true, // if editable: false then the own has viewable permission only. if editable:  true then has editing permission
        height: 360,    // number of Pixels
        width:  360,    // number of Pixels
        returnType: 'blob', // 'base64' or 'blob'
        direction: 'row', // 'row' or 'column'
        files : [ // you can define many files to be uloaded。
            { field: 'front', headerName: '学生証表'},  // image field_key=student_card_front_{identity}
            { field: 'back', headerName: '学生証裏'},   // image field_key=student_card_back_{identity}
            { field: 'diploma', headerName: '卒業書'},  // image field_key=student_card_diploma_{identity}
            { field: 'academic_transcript', headerName: '成績書'},// image field_key=student_card_academic_transcript_{identity}
        ],
    },
    // 画像のキー。マイナンバーカード
    mynumber_card: {
        editable: true, // if editable: false then the own has viewable permission only. if editable:  true then has editing permission
        height: 360,    // number of Pixels
        width:  360,    // number of Pixels
        returnType: 'blob', // 'base64' or 'blob'
        direction: 'row', // 'row' or 'column'
        files :[ // you can define many files to be uloaded
            { field: 'front', headerName: 'マイナンバーカード表'},
            { field: 'back', headerName: 'マイナンバーカード裏'},
        ]
    },
};

```  

#### HTMLタグのプロパティーとしての設定  

Web Custom componentのタグのプロパティーとして設定します。主に設定の自由度を高めるためです。
"category-code"以外はオプションプロパティーで、省略可能です。  

注：オプションプロパティーのキーはKebabケース（区切りをハイフン（-））であることに注意してください！  


```text
  <body>
    <noscript>
      <strong>We're sorry but <%= htmlWebpackPlugin.options.title %> doesn't work properly without JavaScript enabled. Please enable it to continue.</strong>
    </noscript>
    <div style="display: block;">
    <!-- we also provide additional properties for this custom web component to set various parameters among diffrent components even they are displyed on a single page  -->
    <!-- 
      these properties are optional. you can leverage them freely based on your needs.
      compressRatio: { type: Number, default: 1 },   // 0.1 ~ 1 (e.g., 0.5 halves width/height)
      jpegQuality:  { type: Number, default: 0.9 },  // 0.1 ~ 1 (JPEG encode quality)
      outputFormat: { type: String, default: 'image/jpeg' }, // 'image/jpeg' | 'image/png' | 'image/webp'
      maxWidth:     { type: Number, default: 0 },    // optional hard cap; 0 = ignore
      maxHeight:    { type: Number, default: 0 },    // optional hard cap; 0 = ignore
    -->
      <image-uplaod
        category-code="mynumber_card"
        swap-size-in-landscape="true"
        identity="2025"
        id="mynumber_card"
        compress-ratio=0.5
        jpeg-quality=0.8
        max-width=0
        max-height=0
      ></image-uplaod>

      <image-uplaod
        category-code="student_card"
        swap-size-in-landscape="true"
        identity="2025"
        id="student_card"
        compress-ratio=0.5
        jpeg-quality=0.8
        ></image-uplaod>
   </div>          https://surupas-dev.native365.net/janga_vue_base_system/webcomponents/imageFileHandler/
  </body>
```  

### DB関連  

#### SQLファイル
/var/www/sms_workspace/dataEngine/template/janga_vue_base_system/generic-folder/image-operations.sql

#### PHPファイル  

- 1) 画像ファイル保存用  

/var/www/html/sms/dataEngine/v1/handleRequest/imageUploadHandler.php

- 2) 画像表示用  

/var/www/html/sms/dataEngine/v1/handleRequest/loadImage.php

- 3) 画像標準アクセス用  

/var/www/html/sms/dataEngine/v1/handleRequest/sqlRequestHandler_v2.php  
既存 /var/www/html/sms/dataEngine/v1/handleRequest/sqlRequestHandler.php
の改善バージョンです。  

- 4) 未使用  
既存 /var/www/html/sms/dataEngine/v1/handleRequest/requestHandler.php
の変わりに使うバージョン 
/var/www/html/sms/dataEngine/v1/handleRequest/requestHandler_v2.php  

今回未使用です。

#### VUEファイル  

github  

https://github.com/JangaTech/janga-vue-base-system/tree/main/image_file_upload




