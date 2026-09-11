白急線ポータル

index.html をブラウザで開くだけで動きます（サーバー不要、GitHub Pages にそのまま置けます）。
ダイヤデータは index.html 内に埋め込み済みです。
data/ フォルダには元の OuDiaSecond ファイルを入れています。

ダイヤを更新するとき:
 1. メニュー（☰）→「別の .oud2 ファイルを開く」で一時的に読み込む
 2. 恒久的に差し替える場合は index.html 内の `const ROUTES = [ {name:'白急桜田線', text: "..."} ]`
    の文字列を新しい .oud2 の内容（JSON文字列化したもの）に置き換える

路線を増やすとき:
 index.html 内の ROUTES 配列に要素を追加します。
   const ROUTES = [
     {name:'白急桜田線', text: "…"},
     {name:'白急〇〇線', text: "…"},   // ← 追加（text は .oud2 の内容を JSON 文字列化したもの）
   ];
 走行位置・運用表・時刻表のそれぞれで路線を選べるようになります。
