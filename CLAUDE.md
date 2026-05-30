# 藻屑社長クリッカー — Claude向けガイド

## 技術スタック
- 純粋なバニラ HTML / CSS / JS（フレームワーク不使用、`type="module"`）
- Firebase（認証・クラウドセーブ）
- ファイル構成：`index.html` / `style.css` / `script.js` / `version.json`

## 必須ルール

### バージョン更新
バージョンを上げるときは **必ず4箇所セットで変える**：
1. `version.json` の `version` フィールド
2. `script.js` 冒頭の `const CURRENT_VERSION`
3. `index.html` 末尾の `<script src="script.js?v=X.X.X">` のクエリパラメータ
4. **`script.js`の`UPDATE_LOG`配列の先頭に新しいお知らせエントリを追加**

4箇所揃えないとブラウザが古いscript.jsをキャッシュから読み続け、更新バナーが毎回出続ける。
**UPDATE_LOGを忘れるとお知らせモーダルに新バージョンが表示されない。**

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

## コーディング方針
- コメントは原則書かない（理由が自明でない場合のみ1行）
- エラーハンドリングは外部APIの境界のみ（内部ロジックに不要なtry/catchを足さない）
- 新機能を追加するとき既存コードの無関係なリファクタはしない
