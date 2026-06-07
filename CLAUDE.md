# 藻屑社長クリッカー — Claude向けガイド

## 技術スタック
- 純粋なバニラ HTML / CSS / JS（フレームワーク不使用、`type="module"`）
- Firebase（認証・クラウドセーブ）
- ファイル構成：`index.html` / `style.css` / `script.js` / `version.json`

## 必須ルール

### バージョン更新
#### メインゲーム（script.js / version.json）を変えるとき — 4箇所
1. `version.json` の `version` フィールド
2. `script.js` 冒頭の `const CURRENT_VERSION`
3. `index.html` 末尾の `<script src="script.js?v=X.X.X">` のクエリパラメータ
4. **`script.js`の`UPDATE_LOG`配列の先頭に新しいお知らせエントリを追加**

4箇所揃えないとブラウザが古いscript.jsをキャッシュから読み続け、更新バナーが毎回出続ける。
**UPDATE_LOGを忘れるとお知らせモーダルに新バージョンが表示されない。**

#### モンスターズミニゲーム（minigame-mokumon.js / mokumon.css）を変えるとき — 追加2箇所
上記4箇所に加えて：
5. `index.html` の `mokumon.css?v=X.X.X`
6. `script.js` 末尾の `import { initMokumon } from './minigame-mokumon.js?v=X.X.X'`

### コミット時の画像
`git add` するとき `assets/` 以下の画像ファイルを**必ず含める**。
コミット前に `git status` で untracked の画像がないか確認すること。

## アーキテクチャ

- **gameState**：単一オブジェクト、localStorage + Firebase に JSON 保存（`SAVE_VERSION` 管理）
- **IMAGE_CONFIG**：個別ファイルパスを一元管理（スプライトシートではなく個別 PNG）
- **データ駆動**：`UPGRADES` / `EMPLOYEES` / `FACILITIES` / `EVENTS` / `GACHA_SKINS` は定数配列

## MPS計算（表示と収益を統一する）

`mpsTotal` は必ず以下の全掛け算で計算する：
```js
mokuPerSecond × awakening × event × mpsBoost × petMult
```
`stat-mps`（ホーム画面表示）とヘッダーの `mps-display` は同じ `mpsTotal` を使うこと。

## サウンド（Web Audio API）

`beepAt(at, freq, dur, vol, type)` を使って音を予約スケジュールする。
`setTimeout` 内で `ctx.currentTime` を取得すると過去時刻になり音が鳴らないので禁止。

## ミニゲームのファイル分割

**新しいミニゲームは必ず別ファイルに作る**：
- `minigame-xxx.js` として `script.js` と同じ階層に置く
- `script.js` から `import { initXxx } from './minigame-xxx.js'` で読み込む
- HTMLの `<div id="minigame-game-xxx">` はこれまで通り `index.html` に追加する

既存のミニゲーム（dungeon, yomogi等）は `script.js` 内にあるが、新規追加分は必ず分割すること。

## コーディング方針
- コメントは原則書かない（理由が自明でない場合のみ1行）
- エラーハンドリングは外部APIの境界のみ（内部ロジックに不要なtry/catchを足さない）
- 新機能を追加するとき既存コードの無関係なリファクタはしない
