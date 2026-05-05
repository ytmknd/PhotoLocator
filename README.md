# Photo GPS Viewer

画像の EXIF データから GPS 位置情報を読み取り、Google マップで撮影場所を確認できる Web アプリです。

**🌐 デモ: https://ytmknd.github.io/PhotoLocator/**

## 機能

- 画像をドラッグ＆ドロップ、またはクリックして選択
- EXIF データから以下の情報を抽出・表示
  - ファイル名
  - 緯度 / 経度
  - 高度
  - 撮影日時
- 位置情報がある場合、Google マップで撮影地点を開くリンクを表示

## 使い方

1. ページにアクセスする
2. 画像ファイル（JPEG など GPS 情報を含む画像）をドロップエリアにドラッグ＆ドロップするか、クリックして選択する
3. 位置情報が含まれていれば緯度・経度などが表示される
4. 「地図で開く」ボタンをクリックすると Google マップで撮影場所を確認できる

## 技術スタック

- HTML / CSS / JavaScript（バニラ）
- EXIF 解析: ブラウザの FileReader API を使用
- ホスティング: GitHub Pages

## ローカルで実行

```bash
git clone https://github.com/ytmknd/PhotoLocator.git
cd PhotoLocator
# 任意のローカルサーバーで開く（例: VS Code Live Server など）
open index.html
```

## ライセンス

MIT
