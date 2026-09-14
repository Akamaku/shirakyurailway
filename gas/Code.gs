/**
 * 白急線ポータル バックエンド（Google Apps Script）
 *  - 運用投稿の保存・一覧（Google スプレッドシート）
 *  - JR西日本 列車走行位置JSONの中継（ブラウザから直接取得できない場合用）
 *
 * 設置手順
 *  1. Google スプレッドシートを新規作成し、シート名を「posts」にする
 *  2. 拡張機能 → Apps Script を開き、このコードを貼り付ける
 *  3. デプロイ → 新しいデプロイ → 種類「ウェブアプリ」
 *       実行ユーザー: 自分 / アクセスできるユーザー: 全員
 *  4. 発行された URL（…/exec）を index.html の API_URL に設定する
 */

const SHEET_NAME = 'posts';
const HEADER = ['date','time','line','trainNo','opNo','set','cars','name','note','created'];

function sheet_(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if(!sh){ sh = ss.insertSheet(SHEET_NAME); }
  if(sh.getLastRow() === 0) sh.appendRow(HEADER);
  return sh;
}
function json_(obj){
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e){
  const p = (e && e.parameter) || {};
  if(p.action === 'jr'){
    const line = String(p.line || 'yamatoji').replace(/[^a-z0-9_]/gi,'');
    const res = UrlFetchApp.fetch('https://www.train-guide.westjr.co.jp/api/v3/' + line + '.json', {muteHttpExceptions:true});
    return ContentService.createTextOutput(res.getContentText()).setMimeType(ContentService.MimeType.JSON);
  }
  if(p.action === 'list'){
    const date = String(p.date || '');
    const sh = sheet_();
    const rows = sh.getDataRange().getValues();
    const head = rows.shift();
    const posts = rows
      .map(r => Object.fromEntries(head.map((h,i)=>[h, r[i]==null? '' : String(r[i])])))
      .filter(r => !date || r.date === date);
    return json_({ok:true, posts});
  }
  return json_({ok:false, error:'unknown action'});
}

function doPost(e){
  try{
    const body = JSON.parse(e.postData.contents || '{}');
    if(body.action !== 'add' || !body.post) return json_({ok:false, error:'bad request'});
    const p = body.post;
    if(!p.trainNo) return json_({ok:false, error:'trainNo required'});
    const clean = v => String(v == null ? '' : v).slice(0, 100);
    sheet_().appendRow([clean(p.date), clean(p.time), clean(p.line), clean(p.trainNo), clean(p.opNo), clean(p.set), clean(p.cars), clean(p.name), clean(p.note), new Date()]);
    return json_({ok:true});
  }catch(err){
    return json_({ok:false, error:String(err)});
  }
}
