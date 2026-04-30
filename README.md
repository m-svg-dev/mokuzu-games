# 藻屑社長クリッカー 作成手順書

スマホブラウザで動く Cookie クリッカー風放置ゲームの開発手順書です。  
テーマ：**海藻の筋肉質な社長（藻屑キャラ）** が自社を拡大していく物語。

> 参考イメージ：`mokuzufix.png`（完成形5画面）

---

## 目次

1. [プロジェクト構成と各ファイルの役割](#1-プロジェクト構成と各ファイルの役割)
2. [開発全体フロー](#2-開発全体フロー)
3. [初期実装の順序（ステップ別）](#3-初期実装の順序ステップ別)
4. [データ設計（ゲームの状態管理）](#4-データ設計ゲームの状態管理)
5. [ゲームロジックの分解](#5-ゲームロジックの分解)
6. [画像の扱い方](#6-画像の扱い方)
7. [セーブ機能の設計](#7-セーブ機能の設計)
8. [UIレイアウト方針（5画面タブ構成）](#8-uiレイアウト方針5画面タブ構成)
9. [ゲームバランス設計](#9-ゲームバランス設計)
10. [今後の拡張方針](#10-今後の拡張方針)

---

## 1. プロジェクト構成と各ファイルの役割

```
mokuzu-games/
├─ index.html        ← 画面の骨格・タブ構成・UI要素の定義
├─ style.css         ← スマホ対応レイアウト・演出アニメーション
├─ script.js         ← ゲームロジック全般・状態管理・セーブ
└─ assets/
   └─ sheets/
      ├─ character_sheet.png   ← 社長キャラのスプライトシート
      └─ ui_sheet.png          ← ボタン・アイコン等のUIスプライトシート
```

### index.html の役割

- ページ全体のHTML骨格（`<meta viewport>` でスマホ対応必須）
- 5つの画面タブ（メイン・強化・社員施設・覚醒・イベント）を `div` で定義
- `script.js` と `style.css` の読み込み（`script` は `</body>` 直前）
- JavaScriptから操作する要素には `id` 属性を付与

### style.css の役割

- スマホ縦画面（最大幅 480px）に最適化したレイアウト
- タップ時の `.tapped` アニメーション、覚醒中の `.awakened` 虹エフェクト
- レベルごとのスーツカラークラス（`suit-black` 〜 `suit-rainbow`）
- タブ切り替えの表示・非表示（`.tab-panel.active`）
- ボタンの活性・非活性スタイル（`.btn-disabled`）

### script.js の役割

- ゲーム状態オブジェクト（`gameState`）の管理
- タップ処理・自動収益ループ・強化・社員・イベントロジック
- レベルアップ判定とスーツ進化
- 覚醒モードのタイマー管理
- localStorage を使ったセーブ・ロード・リセット
- 画像設定オブジェクト（`IMAGE_CONFIG`）によるスプライト管理

---

## 2. 開発全体フロー

全体を **6ステップ** で進めます。各ステップ完了後にブラウザで動作確認してから次へ進んでください。

| ステップ | 作業内容 | 完了の確認方法 |
|---|---|---|
| Step 1 | HTMLの骨格・タブUI作成 | タブが切り替わって各画面が表示される |
| Step 2 | CSSでスマホ対応レイアウト | スマホサイズで崩れない |
| Step 3 | タップ・自動収益の基本ロジック | タップで数字が増え、1秒ごとに自動加算される |
| Step 4 | 強化・社員システム | 購入すると tapPower / MPS が変化する |
| Step 5 | レベル・スーツ進化・覚醒モード | レベルに応じてキャラ見た目が変わり覚醒が使える |
| Step 6 | イベント・セーブ・リセット・総合デバッグ | リロード後にデータが復元される |

---

## 3. 初期実装の順序（ステップ別）

### Step 1 ― HTML の骨格・タブ作成

`index.html` に以下の構造を定義します。

```html
<!-- タブナビゲーション -->
<nav id="tab-nav">
  <button data-tab="main">メイン</button>
  <button data-tab="upgrade">強化</button>
  <button data-tab="employee">社員/施設</button>
  <button data-tab="event">イベント</button>
</nav>

<!-- 各タブのパネル（1つだけ .active を付ける） -->
<div id="tab-main"     class="tab-panel active"> ... </div>
<div id="tab-upgrade"  class="tab-panel"> ... </div>
<div id="tab-employee" class="tab-panel"> ... </div>
<div id="tab-event"    class="tab-panel"> ... </div>
```

各パネル内の主要な `id` 一覧：

| id | 役割 |
|---|---|
| `#moku-display` | 藻の現在量 |
| `#mps-display` | 毎秒収益（MPS）表示 |
| `#character-img` | 社長キャラ画像（タップ対象） |
| `#awaken-gauge-bar` | 覚醒ゲージのプログレスバー |
| `#awaken-btn` | 覚醒ボタン |
| `#awaken-timer` | 覚醒残り秒数表示 |
| `#upgrade-list` | 強化ボタンをJSで動的生成する領域 |
| `#employee-list` | 社員ボタンをJSで動的生成する領域 |
| `#event-area` | イベント内容をJSで動的表示する領域 |
| `#save-btn` | セーブボタン |
| `#reset-btn` | リセットボタン |

### Step 2 ― CSS でスマホ対応レイアウト

- `body` に `max-width: 480px; margin: 0 auto; overflow-x: hidden;`
- `.tab-panel` は通常 `display: none`、`.tab-panel.active` だけ `display: block`
- `#upgrade-list`・`#employee-list` は `overflow-y: auto; max-height: 60vh;` でスクロール対応
- タップ遅延対策として `#character-img` に `touch-action: manipulation;` を付与

### Step 3 ― 基本ゲームロジック

1. `gameState` オブジェクトの初期化
2. `#character-img` の `touchstart` + `click` 両対応でタップ処理
3. `setInterval(gameLoop, 1000)` で自動収益ループ
4. `updateDisplay()` 関数でUI反映

### Step 4 ― 強化・社員システム

1. `UPGRADES` / `EMPLOYEES` 定数配列の定義
2. `renderUpgradeList()` / `renderEmployeeList()` で動的にボタン生成
3. 購入可否チェック（資金 + maxCountチェック）・コスト消費
4. `recalcTapPower()` / `recalcMPS()` で合計値を再計算

### Step 5 ― レベル・スーツ進化・覚醒モード

1. `calcLevel(totalMoku)` 関数の実装（`LEVEL_THRESHOLDS` を上から検索）
2. `updateSuit(suit)` でキャラクラス差し替えと `IMAGE_CONFIG` のスプライト適用
3. 覚醒ゲージ蓄積（タップ毎 +2）・覚醒ボタン解放・30秒タイマー

### Step 6 ― イベント・セーブ・リセット・デバッグ

1. `triggerRandomEvent()` の実装（60〜120秒ごとにランダム発生）
2. `saveGame()` / `loadGame()` / `resetGame()` の実装
3. `visibilitychange` イベントでバックグラウンド時に自動保存
4. セーブバージョン互換チェックの実装

---

## 4. データ設計（ゲームの状態管理）

### gameState オブジェクト

```js
const SAVE_VERSION = 1; // データ構造変更時にインクリメント

const DEFAULT_STATE = {
  saveVersion: SAVE_VERSION,
  moku: 0,              // 現在の藻ポイント
  totalMoku: 0,         // 累計獲得藻（覚醒ボーナスは含めない）
  tapPower: 1,          // 1タップで得られる藻（基本値）
  mokuPerSecond: 0,     // 毎秒自動収益
  suit: 'black',        // 現在のスーツ色（totalMokuから再計算するため level は保存しない）
  awakenGauge: 0,       // 覚醒ゲージ（0〜100の整数）
  isAwakened: false,    // 覚醒中フラグ
  awakenTimer: 0,       // 覚醒残り秒数
  upgrades: {},         // 各強化の購入回数 { upgradeId: count }
  employees: {},        // 各社員の所持数 { employeeId: count }
  lastSaved: 0,         // 最終セーブ時刻（Date.now()）
};

// gameState は DEFAULT_STATE をコピーして使う
let gameState = structuredClone(DEFAULT_STATE);
```

> `level` は `totalMoku` から毎回 `calcLevel()` で算出するため保存しません。  
> `totalMoku` には覚醒中のボーナス倍率は加算せず、素の収益のみを記録します（覚醒によるレベル急上昇を防ぐため）。

### レベル閾値テーブル（序盤を上がりやすく設定）

| レベル | スーツ色 | 必要累計藻 |
|---|---|---|
| 1 | 黒 | 0 |
| 10 | 青 | 500 |
| 25 | 緑 | 5,000 |
| 50 | 赤 | 50,000 |
| 100 | 金 | 500,000 |
| 200 | レインボー | 50,000,000 |

```js
const LEVEL_THRESHOLDS = [
  { level: 200, suit: 'rainbow', mokuRequired: 50_000_000 },
  { level: 100, suit: 'gold',    mokuRequired: 500_000 },
  { level:  50, suit: 'red',     mokuRequired: 50_000 },
  { level:  25, suit: 'green',   mokuRequired: 5_000 },
  { level:  10, suit: 'blue',    mokuRequired: 500 },
  { level:   1, suit: 'black',   mokuRequired: 0 },
];

function calcLevel(totalMoku) {
  return LEVEL_THRESHOLDS.find(t => totalMoku >= t.mokuRequired);
  // 配列は降順なので最初にヒットしたものが現在のレベル
}
```

### 強化データ配列（1回購入ごとに tapBonus が加算される買い切り型）

```js
const UPGRADES = [
  { id: 'tap1', name: 'タップ強化 I',  baseCost: 8,    costMult: 2.0, tapBonus: 1,  maxCount: 10 },
  { id: 'tap2', name: 'タップ強化 II', baseCost: 60,   costMult: 2.0, tapBonus: 5,  maxCount: 10 },
  { id: 'tap3', name: 'タップ強化 III',baseCost: 500,  costMult: 2.0, tapBonus: 25, maxCount: 10 },
];
// 現在コスト: baseCost * costMult^(購入済み回数)
// tapPower の合計: 1 + Σ(tapBonus × 購入回数)
```

### 社員データ配列（画像の社員名に準拠）

```js
const EMPLOYEES = [
  { id: 'algae_part', name: '小型海藻バイト', baseCost: 8,     mpsBonus: 0.1  },
  { id: 'jellyfish',  name: 'クラゲ室長',     baseCost: 80,    mpsBonus: 0.6  },
  { id: 'crab',       name: 'カニ経営者',     baseCost: 800,   mpsBonus: 3.0  },
  { id: 'coral',      name: 'サンゴ工場長',   baseCost: 5_000, mpsBonus: 10.0 },
  { id: 'shark',      name: 'サメ取締役',     baseCost: 30_000,mpsBonus: 40.0 },
];
// 現在コスト: baseCost * 1.15^(所持数)
// MPS の合計: Σ(mpsBonus × 所持数)
```

### イベントデータ配列

```js
const EVENTS = [
  { id: 'bonus_tap',   name: '藻の大発生！',   effect: 'tapPower×3',   duration: 20 },
  { id: 'bonus_mps',   name: '自動収穫強化！', effect: 'mps×2',        duration: 30 },
  { id: 'bonus_moku',  name: 'ボーナス収穫！', effect: 'moku+totalMoku×0.1', duration: 0 },
  // duration: 0 は即時効果
];
// 60〜120秒ごとにランダムで1つ発生
```

---

## 5. ゲームロジックの分解

### 5-1. タップ処理

```
touchstart / click イベント（二重発火防止のためflagで管理）
  → multiplier = isAwakened ? 5 : 1
  → moku      += tapPower * multiplier
  → totalMoku += tapPower  ← 覚醒ボーナスは含めない
  → awakenGauge = Math.min(100, awakenGauge + 2)
  → updateDisplay()
  → #character-img に .tapped クラスを付与 → 100ms後に削除
```

### 5-2. 自動収益ループ（1秒ごと）

```
setInterval(gameLoop, 1000)
  → multiplier = isAwakened ? 5 : 1
  → moku      += mokuPerSecond * multiplier
  → totalMoku += mokuPerSecond  ← 覚醒ボーナスは含めない
  → 覚醒中: awakenTimer -= 1
            awakenTimer <= 0 なら deactivateAwaken()
  → updateDisplay()
  → calcLevel(totalMoku) で suit が変わっていれば updateSuit()
```

### 5-3. 強化購入

```
強化ボタンをタップ
  → count = gameState.upgrades[id] ?? 0
  → count >= maxCount なら処理なし（上限チェック）
  → cost = baseCost * costMult^count
  → moku < cost なら処理なし（資金チェック）
  → moku -= cost
  → upgrades[id] = count + 1
  → recalcTapPower()  ← 全強化から tapPower を再計算
  → renderUpgradeList()
```

### 5-4. 社員購入

```
社員ボタンをタップ
  → count = gameState.employees[id] ?? 0
  → cost = baseCost * 1.15^count
  → moku < cost なら処理なし
  → moku -= cost
  → employees[id] = count + 1
  → recalcMPS()  ← 全社員から mokuPerSecond を再計算
  → renderEmployeeList()
```

### 5-5. レベルアップ判定（1秒ごとのループ内）

```
const current = calcLevel(gameState.totalMoku)
if (current.suit !== gameState.suit) {
  updateSuit(current.suit)
}

function updateSuit(suit) {
  gameState.suit = suit
  applyCharacterSprite(suit)   ← IMAGE_CONFIG でスプライト切り替え
  document.getElementById('character-img').className = `suit-${suit}`
}
```

### 5-6. 覚醒モード

```
覚醒ゲージ: タップ1回 +2 で蓄積（上限100）
覚醒ボタン: awakenGauge >= 100 のときだけ有効（それ以外は .btn-disabled）

覚醒ボタンをタップ
  → isAwakened = true / awakenTimer = 30 / awakenGauge = 0
  → #character-img に .awakened クラス付与（虹エフェクト）
  → #awaken-timer を表示

deactivateAwaken()
  → isAwakened = false
  → .awakened クラス削除 / #awaken-timer を非表示
```

### 5-7. ランダムイベント

```
setInterval(checkEvent, 1000) 内で管理
  → eventCooldown（秒）を 1 ずつ減算
  → 0 になったら EVENTS からランダム1件選択
  → イベント内容を #event-area に表示 + エフェクト適用
  → 次の発生まで 60〜120秒（乱数）を eventCooldown に設定
```

---

## 6. 画像の扱い方

画像パス・座標は `IMAGE_CONFIG` で一元管理します。  
ロジック内に直接パスを書かず、すべてこのオブジェクト経由でアクセスすることで  
**画像差し替えがロジックに影響しない** 設計にします。

```js
const IMAGE_CONFIG = {
  character: {
    src: 'assets/sheets/character_sheet.png',
    // スーツ6種を横1行に並べた 768×128 のシートを想定
    // 各コマ: 128×128px
    suits: {
      black:   { x: 0,   y: 0, w: 128, h: 128 },
      blue:    { x: 128, y: 0, w: 128, h: 128 },
      green:   { x: 256, y: 0, w: 128, h: 128 },
      red:     { x: 384, y: 0, w: 128, h: 128 },
      gold:    { x: 512, y: 0, w: 128, h: 128 },
      rainbow: { x: 640, y: 0, w: 128, h: 128 },
    },
  },
  ui: {
    src: 'assets/sheets/ui_sheet.png',
    // アイコンを横1行に並べた 240×48 のシートを想定
    // 各コマ: 48×48px
    icons: {
      currency:   { x: 0,   y: 0, w: 48, h: 48 },
      upgrade:    { x: 48,  y: 0, w: 48, h: 48 },
      employee:   { x: 96,  y: 0, w: 48, h: 48 },
      awaken:     { x: 144, y: 0, w: 48, h: 48 },
      event:      { x: 192, y: 0, w: 48, h: 48 },
    },
  },
};
```

### スプライトの CSS 適用方法

Canvas を使わず `background-position` で切り抜きます。

```js
function applyCharacterSprite(suit) {
  const { src, suits } = IMAGE_CONFIG.character;
  const s = suits[suit];
  const el = document.getElementById('character-img');
  el.style.backgroundImage    = `url(${src})`;
  el.style.backgroundPosition = `-${s.x}px -${s.y}px`;
  el.style.backgroundSize     = 'auto'; // 実寸で表示
  el.style.width              = `${s.w}px`;
  el.style.height             = `${s.h}px`;
}
```

### 将来の画像追加手順

1. `assets/sheets/` に画像ファイルを配置
2. `IMAGE_CONFIG` に新しいキーと座標を追記
3. 呼び出し側はキー名を変えるだけ — ロジック変更不要

### 必要な素材の目安（参考：mokuzufix.png より）

| カテゴリ | 内容 |
|---|---|
| キャラクター | スーツ別6種（黒・青・緑・赤・金・レインボー）＋覚醒エフェクト |
| 社員アイコン | 小型海藻バイト・クラゲ室長・カニ経営者・サンゴ工場長・サメ取締役 |
| イベントイラスト | 藻の大発生・自動収穫強化・ボーナス収穫 各1点 |
| UIアイコン | 通貨・強化・社員・覚醒・イベント 各1点 |
| 合計目安 | **30〜50枚程度** |

---

## 7. セーブ機能の設計

### 保存タイミング

| タイミング | 実装 |
|---|---|
| 30秒ごと（オートセーブ） | `setInterval(saveGame, 30_000)` |
| セーブボタン押下 | 手動実行 + 「保存しました」トースト表示 |
| ページ非表示時 | `document.addEventListener('visibilitychange', ...)` |

### localStorage 設計

```js
const SAVE_KEY = 'mozuku_president_v1';

function saveGame() {
  gameState.lastSaved = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return; // 初回起動

  let saved;
  try {
    saved = JSON.parse(raw);
  } catch {
    console.warn('セーブデータの解析に失敗。初期値で起動します。');
    return;
  }

  // バージョン互換チェック
  if (saved.saveVersion !== SAVE_VERSION) {
    console.warn(`セーブバージョン不一致(${saved.saveVersion} → ${SAVE_VERSION})。初期値で起動します。`);
    return;
  }

  Object.assign(gameState, saved);
  recalcTapPower();
  recalcMPS();
}

function resetGame() {
  if (!confirm('リセットしますか？すべての進捗が失われます。')) return;
  localStorage.removeItem(SAVE_KEY);
  location.reload();
}
```

### ページロード時の処理順序

```
1. 定数定義（IMAGE_CONFIG / LEVEL_THRESHOLDS / UPGRADES / EMPLOYEES / EVENTS）
2. gameState = structuredClone(DEFAULT_STATE)
3. loadGame()（セーブデータがあれば上書き・バージョン不一致なら初期値のまま）
4. renderUpgradeList() / renderEmployeeList()
5. updateDisplay() / updateSuit(gameState.suit)
6. setInterval(gameLoop, 1000)       ← 自動収益
7. setInterval(checkEvent, 1000)     ← イベント判定
8. setInterval(saveGame, 30_000)     ← オートセーブ
9. タブ・ボタンのイベントリスナー登録
```

---

## 8. UIレイアウト方針（5画面タブ構成）

参考イメージ（mokuzufix.png）に基づく5画面構成です。

### 画面①　メイン（タブ: メイン）

```
┌─────────────────────────────┐
│  藻: 123,456    1,234/s     │  ← #header（固定表示）
├─────────────────────────────┤
│                             │
│      [社長キャラ 128×128]   │  ← #tap-area（touch-action: manipulation）
│       タップで増殖！        │
│                             │
│  [覚醒ゲージ =========] 覚醒│  ← #awaken-bar（ゲージ満タンでボタン活性）
│       残り: 00:28           │  ← #awaken-timer（覚醒中のみ表示）
├─────────────────────────────┤
│ [メイン] [強化] [社員] [EV] │  ← #tab-nav（画面下部固定）
└─────────────────────────────┘
```

### 画面②　強化（タブ: 強化）

```
┌─────────────────────────────┐
│  強化一覧                   │
│  ┌──────────────────────┐   │
│  │ タップ強化 I   8藻   │   │  ← 動的生成（購入済回数・上限・コスト表示）
│  │ タップ強化 II  60藻  │   │
│  │ ...                  │   │
│  └──────────────────────┘   │  ← overflow-y: auto でスクロール
└─────────────────────────────┘
```

### 画面③　社員/施設（タブ: 社員）

```
┌─────────────────────────────┐
│  社員一覧                   │
│  ┌──────────────────────┐   │
│  │ [icon] 小型海藻バイト │   │  ← 動的生成（所持数・コスト・MPS貢献表示）
│  │ [icon] クラゲ室長     │   │
│  │ ...                  │   │
│  └──────────────────────┘   │
└─────────────────────────────┘
```

### 画面④　イベント（タブ: EV）

```
┌─────────────────────────────┐
│  イベント！                 │
│  ┌──────────────────────┐   │
│  │ 藻の大発生！          │   │  ← ランダム発生時に内容と残り時間表示
│  │ タップ効率 ×3（15秒）│   │
│  └──────────────────────┘   │
│  次のイベントまで: 42秒     │
└─────────────────────────────┘
```

---

## 9. ゲームバランス設計

### 序盤（0〜Lv10）を「上がりやすく」する方針

- **最初のタップで体感できる**: 強化 I（8藻）が開始直後から購入できるよう tapPower 1 でも 8回タップで買える
- **Lv10（青スーツ）までが最速**: 500藻でレベルアップ → 開始数分でスーツが変わる達成感
- **小型海藻バイト（8藻）**: 序盤は頻繁に買えて MPS がすぐ積み上がる

### ゲーム進行の目安

| フェーズ | 目安 | プレイヤーの行動 |
|---|---|---|
| 序盤 | Lv1〜10（〜500藻） | タップ連打・強化 I 購入・初社員雇用 |
| 中盤 | Lv10〜50（〜50,000藻） | 社員を複数種購入してMPSを伸ばす |
| 終盤 | Lv50〜100（〜500,000藻） | 覚醒モードを活用して加速 |
| やり込み | Lv100〜200（〜50,000,000藻） | 全強化maxを目指す |

### 覚醒ゲージの蓄積感

- タップ1回で +2 → 50回タップで覚醒可能
- 序盤は「頑張れば覚醒できる」ちょうどいい距離感に設定
- 後半は MPS が高いので「覚醒温存してから一気に使う」戦略も生まれる

---

## 10. 今後の拡張方針

### 短期（実装フェーズ完了後）

- [ ] キャラクターの独自イラストへの差し替え（`IMAGE_CONFIG` のパスを変えるだけ）
- [ ] タップ時フロートテキスト演出（`+1` が上に浮かぶアニメーション）
- [ ] セーブ成功トーストの実装

### 中期（コンテンツ追加）

- [ ] プレステージ（周回）機能：藻をリセットして永続ボーナス獲得
- [ ] 実績（アチーブメント）システム
- [ ] BGM・SE（Web Audio API）

### 長期（大型機能）

- [ ] ストーリーモード（藻屑社長の成長物語）
- [ ] シーズンイベント（期間限定社員・強化）
- [ ] オフライン収益（離席中の自動収益を再ログイン時に加算）
- [ ] ランキング機能（サーバ対応が必要）

### 拡張しやすい設計のポイント

- `UPGRADES` / `EMPLOYEES` / `EVENTS` は定数配列なので要素追加だけで新コンテンツが増える
- `IMAGE_CONFIG` を変えるだけで全アセット差し替えが完結する
- `gameState` は単一オブジェクト + `SAVE_VERSION` 管理で、将来のデータ構造変更に対応できる

---

*本手順書に沿って Step 1 から実装を進めてください。*
