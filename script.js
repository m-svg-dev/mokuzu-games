// ========== 定数定義 ==========

const CURRENT_VERSION = '2.8.0';
const SAVE_VERSION   = 1;
const SAVE_KEY       = 'mozuku_president_v1';
const CHECKSUM_KEY   = '_mzk_i_v1';
const CHECKSUM_SALT  = 'mzk_9f2x_k4p7_bq8r';

function computeChecksum(str) {
  let h = 0x811c9dc5;
  const s = CHECKSUM_SALT + str;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36);
}

// ========== 更新履歴 ==========

const UPDATE_LOG = [
  {
    id: 'v2.8.0',
    date: '2026/05/16',
    title: '🎰 ミニゲーム追加！',
    items: [
      '🎰【新機能】ミニゲームを追加しました！藻コインを賭けてひりつけ！',
      '🎡【ルーレット】0〜36の数字に賭けて当てろ！当たれば35倍！',
      '🎲【スロット9マス】9マスに絵柄を並べて同じ絵柄を集めろ！ランダムで確率UPイベントも発生！',
    ],
  },
  {
    id: 'v2.7.0',
    date: '2026/05/09',
    title: '🌟 神話スキルツリー実装！',
    items: [
      '🌟【新機能】神話スキルツリーを追加しました！転生50回以上で解放されます',
      '⚡【新通貨】神転生石を追加しました。転生石100個と交換できます（1個・10個・全部交換）',
      '💎 神話の力（転生50回〜）: 恒久タップ×5倍　3段階強化',
      '🌊 神話の流れ（転生50回〜）: 恒久MPS×5倍　3段階強化',
      '👑 神話の覇道（転生75回〜）: タップ&MPS×3倍　3段階強化',
      '🔒 転生石上限強化II（転生30回〜）: 上限+3000石　5段階強化を追加しました',
    ],
  },
  {
    id: 'v2.6.3',
    date: '2026/05/08',
    title: '🛠️ 重大バグを修正しました',
    items: [
      '🐛【重大】ログインし直すとデータが⓪に戻る問題を修正しました。新しいデバイスやブラウザでログインした際にクラウドデータが自動で復元されるようになりました',
      '🐛【重大】転生後にクラウドの古いデータで上書きされて転生回数が巻き戻るバグを修正しました。累計藻ではなく転生回数を優先してデータを比較するよう変更しました',
      '🐛 メイン画面の「転生すると○○石獲得」のプレビューが上限を無視して多く表示されるバグを修正しました',
    ],
  },
  {
    id: 'v2.6.2',
    date: '2026/05/06',
    title: '🌿 社員の生産性が大幅アップ！',
    items: [
      '📈 全社員の生産性を大幅強化しました！海藻バイトからサメ幹部まで、みんなより頑張って稼いでくれます🦈',
      '🌿 小型海藻バイト: 0.1→0.3 / クラゲ社員: 0.6→2.0 / カニ主任: 3→8 / サンゴ管理職: 10→30 / サメ幹部: 40→100（/秒）',
      '💤 放置中もしっかり藻が増えるようになったのでぜひ置いといてください！',
    ],
  },
  {
    id: 'v2.6.1',
    date: '2026/05/06',
    title: '⚡ 覚醒システム強化 & バランス調整',
    items: [
      '⏱️ 覚醒時間を30秒→10秒に短縮。強化で最大35秒まで延長可能に！',
      '🔋 覚醒ゲージの蓄積速度を調整。強化「覚醒ゲージ強化」（最大7段）で加速できます',
      '🌿 転生スキルツリーに上位スキルを追加（転生20/25/30回で解放）',
      '🛠️ 単位表記を拡張（T / Qa / Qi / Sx）',
    ],
  },
  {
    id: 'v2.6.0',
    date: '2026/05/06',
    title: '🌟 URスキン追加 & スキン効果システム実装！',
    items: [
      '🌟 新レアリティ「UR」追加！星屑のルシエル・黒星のノクシアが登場（排出率約0.1%）',
      '⚡ SR以上のスキンに装備効果（OP）を追加！SR: ×1.3 / SSR: ×1.5 / UR: タップ&MPS ×2.0',
      '📊 ガチャ排出率をスキンごとに個別表示するよう変更',
      '⚖️ SSR排出率を約3%に調整（以前は約8%）',
      '🐾 ペット購入後に図鑑へ即時反映されないバグを修正',
    ],
  },
  {
    id: 'v2.5.5',
    date: '2026/05/05',
    title: '☕ 社長への投資機能を追加！',
    items: [
      '💸 設定画面に「社長に投資する」ボタンを追加しました！個人開発の活動費を応援してもらえると次の新機能・スキン追加の燃料になります🌿',
      '📝 ofuse（投げ銭サービス）経由で応援メッセージも送れます。ひとことでも嬉しいです！',
      '🖥️ PC版サイドバーにも案内を追加しました',
    ],
  },
  {
    id: 'v2.5.2',
    date: '2026/05/05',
    title: '⚖️ バランス調整 & 緊急バグ修正',
    items: [
      '⚖️【転生石バランス調整】転生条件の必要藻が転生回数に応じて段階的に増加するよう変更しました（10M → 15M → 25M → 50M → 100M → 200M → 400M → 800M → 1.6B固定）',
      '⚖️【転生石バランス調整】転生石の獲得上限を1,000石に設定しました。転生スキル「転生石上限UP」（250石×最大10回）で500石ずつ上限を拡張できます',
      '🐛 クーポンや無料ガチャで取得したスキンがクラウドデータ引き継ぎ時に消えるバグを修正しました',
      '🐛 転生直後に「転生する」ボタンが消えずに残り続けるバグを修正しました',
      '🐛 iPhoneのノッチ・Dynamic Island で更新バナーが隠れてクリックできないバグを修正しました',
      '🐛 PWAで更新ボタンを押してもキャッシュが残り古いバージョンが表示され続けるバグを修正しました',
    ],
  },
  {
    id: 'v2.5',
    date: '2026/05/05',
    title: '⚔️ 強化システム拡張 & バグ修正ラッシュ',
    items: [
      '⚔️ 強化に「クリティカル率強化」「クリティカル倍率強化」「MPS強化 I〜IV」を追加！',
      '🐛 タップ量が「NaN+」と表示されるバグを修正しました',
      '🐛 ブラウザを別タブに切り替えて戻ったとき放置収益が反映されないバグを修正しました',
      '🐛 名前変更後にランキングが旧名前のまま登録されるバグを修正しました',
      '🐛 クーポンを連打すると報酬が二重に付与されることがあるバグを修正しました',
      '🐛 クーポンで取得したスキンがクラウドリストア時に消えることがあるバグを修正しました',
      '🐛 転生直後に「転生する」ボタンが消えず残り続けるバグを修正しました',
      '🐛 石→コイン交換直後にアプリを閉じると交換結果が消えることがあるバグを修正しました',
      '🐛 転生後にクラウドセーブが正常に動作しないバグを修正しました',
      '🐛 お帰りボーナス・デイリーコインがクラウドに反映されないことがあるバグを修正しました',
      '🐛 累計獲得藻がクリティカルや倍率強化の値を反映していなかったバグを修正しました',
      '🐛 転生条件の必要藻が毎回100Mで変わらないバグを修正しました（段階的に増加するよう変更）',
    ],
  },
  {
    id: 'v2.4',
    date: '2026/05/05',
    title: '🎀 新スキン追加 & ペット強化 & レベル上限拡張',
    items: [
      '🎀 新SSRスキン「ぷいきゅあきいろちゃん」「ぷいきゅあぴんくちゃん」をガチャに追加！',
      '🐾 ペットの見た目を自由に変更できるようになりました！進化しても以前の姿に戻せます',
      '⏳ ペット進化タイマーが残り1時間未満で分表示・60秒未満で秒数カウントダウン表示に！',
      '👑 レベル上限を200→300に拡張！Lv300達成には累計300M藻が必要です',
      '🌈 SSRスキン装備中はキャラクターの枠がレインボーに！スキン名も画面に表示されます',
      '🐛 ペットタブを開いたとき進化ボタン・卵購入ボタンが操作できないバグを修正しました',
      '🐛 クラウドのセーブデータよりローカルが古い状態で上書き保存されるバグを修正しました',
      '🐛 「SKIN0504」クーポンを使用したのにガチャチケットが反映されていなかったバグを修正しました。すでに影響を受けた方は個別補填対応中のため管理者までご連絡ください🙇',
    ],
  },
  {
    id: 'v2.3',
    date: '2026/05/04',
    title: '🔧 バグ修正・安定化フェーズ',
    items: [
      '🙏 定期アップデートに伴い不具合が発生してしまい、ご迷惑をおかけして申し訳ございません！',
      '🔧 ログインし直したらデータが消えるバグを修正しました',
      '🔧 PWA（ホーム画面アプリ）で古いバージョンが読み込まれ続ける問題を修正しました',
      '🔧 クーポン補填アイテムが即反映されない問題を修正しました',
      '📢 現在バグ修正フェーズ中です！軽微なことでも気になったことがあればお気軽にご報告ください🙇',
    ],
  },
  {
    id: 'v2.2',
    date: '2026/05/04',
    title: '🎀 新SSRスキン4体追加 & 不具合修正',
    items: [
      '🎀 新SSRスキン「もくきちゃん」「もみずちゃん」「もぴんくちゃん」「もまじょちゃん」をガチャに追加！',
      '🐛 無料ガチャチケットを持っているのにガチャが引けない不具合を修正しました！ご迷惑をおかけして申し訳ありませんでした🙇',
      '🎁 お詫びとして無料ガチャチケット10枚クーポンを配布中！設定のクーポンコード欄に「SKIN0504」と入力すると受け取れます',
    ],
  },
  {
    id: 'v2.1',
    date: '2026/05/04',
    title: '💔 メンヘラモード追加 & おかえり調整',
    items: [
      '💔 転生5回でメンヘラモードが解放！設定からON/OFFできます',
      '💔 メンヘラモードON中はちょっとした離席でもおかえりメッセージが届きます',
      '🐛 おかえりモーダルが1分放置でも出ていた問題を修正（通常は30分以上で表示）',
    ],
  },
  {
    id: 'v2.0',
    date: '2026/05/04',
    title: '🐾 ペットスロット2解放機能追加',
    items: [
      '🐾 転生5回 + 藻500Mでペットスロット2が解放！2体同時に効果が発動します',
      '🎁 管理者からの個別補填システムを追加（ペット・コイン・石などを直接届けられます）',
      '🐛 ペット図鑑が補填後に即反映されないバグを修正',
    ],
  },
  {
    id: 'v1.9',
    date: '2026/05/04',
    title: '🐛 重大バグ修正 & 🎁 クーポンコード機能追加',
    items: [
      '🐛 【重要】転生後にペットが消えるバグを修正しました！ご迷惑をおかけして申し訳ありませんでした🙇',
      '🎁 クーポンコード機能を追加！設定画面から入力するとアイテムがもらえます',
      '🎁 お詫びクーポン配布中！設定のクーポンコード欄に「MOKU0504」と入力すると藻コイン10枚プレゼント！',
    ],
  },
  {
    id: 'v1.8',
    date: '2026/05/04',
    title: '🐱 新ペット追加：ピンクにゃんこ・しろにゃんこ',
    items: [
      '🐱 新ペット「ピンクにゃんこ」「しろにゃんこ」を追加！',
      '🌿 藻1000万個で卵から入手できます',
      '🐱 卵 → 子猫 → 成長にゃんこ と進化します',
      '📖 図鑑にも新ペットが追加されました',
    ],
  },
  {
    id: 'v1.7',
    date: '2026/05/03',
    title: '📲 アプリとしてインストール対応 & バグ修正',
    items: [
      '📲 PWA対応 — このゲームをアプリとしてホーム画面に追加できます！ダウンロード不要・完全無料！',
      '📱 iOSの場合：Safariでこのページを開く → 下の共有ボタン（□↑）→「ホーム画面に追加」→「追加」',
      '🤖 Androidの場合：Chromeでこのページを開く → 右上の︙→「アプリをインストール」または「ホーム画面に追加」→「追加」',
      '✨ アドレスバーが消えて全画面で遊べます！',
      '⚠️ iOSご注意：ホーム画面へ追加するとセーブデータが引き継がれません。データを引き継ぐ場合は先に会員登録を済ませてからホーム画面に追加してください！',
      '🐛 転生後にランキングスコアが0になるバグを修正（全転生の累計藻を合算するよう変更）',
    ],
  },
  {
    id: 'v1.6',
    date: '2026/05/03',
    title: '🏆 実績システム追加',
    items: [
      '🏆 実績システムを追加（16種類）',
      '🎖️ 実績達成時にポップアップ通知',
      '🪙 実績達成でコイン・転生石を報酬付与',
      '🐛 転生後にキャラスーツがリセットされないバグを修正',
      '🐛 ログイン済みでもデイリーが3コインになるバグを修正',
      '📱 スマホでヘッダーがスクロール時にずれるバグを修正',
      '🖥️ PC版でタブナビをマウスホイールで横スクロール対応',
    ],
  },
  {
    id: 'v1.5',
    date: '2026/05/03',
    title: '🎨 UI刷新・操作性改善',
    items: [
      '🗂️ タブナビをアイコン横スクロール対応に刷新（より大きく見やすく）',
      '🌀 転生可能になるとメイン画面で獲得転生石数をプレビュー表示',
      '⚙️ ログイン・新規登録を設定ボタンから行えるように変更',
      '💰 藻コイン・転生石が専用アイコン表示に',
      '📐 メイン画面を「キャラ → 覚醒ゲージ → ステータス」の順に変更',
    ],
  },
  {
    id: 'v1.4',
    date: '2026/05/03',
    title: '🐾 ペットシステム追加',
    items: [
      '🥚 ペット卵を購入して育成できるようになりました',
      '✨ 卵→成長期→成熟期→完全期→究極期の5段階進化',
      '🌿 緑の精霊（タップ倍率）🌸 桜の精霊（MPS倍率）🌙 月の精霊（コイン倍率）',
      '📖 ペット図鑑で収集状況を確認できます',
      '🎨 タブナビゲーションをアイコンデザインに刷新',
      '🐾 専用ペットタブを追加',
    ],
  },
  {
    id: 'v1.3',
    date: '2026/05/02',
    title: '☁️ クラウドセーブ・セキュリティ強化',
    items: [
      '☁️ ログインするとデータがクラウドに保存され別端末で引き継ぎ可能に',
      '🔒 セーブデータ改ざん検知機能を追加',
      '🎁 新規登録特典を追加（デイリー+5コイン・オフライン補填80%・石10個）',
      '📅 起動時にデイリーボーナスを自動受け取り',
      '🌿 藻ロイヤルハートアイテムを追加',
      '🎲 イベントタブにイベント解放・履歴一覧を追加',
      '⚡ タップブースト持続時間を1分に調整',
    ],
  },
  {
    id: 'v1.2',
    date: '2026/05/01',
    title: '🎰 ガチャ・コイン・ランキング',
    items: [
      '🎰 スキンガチャを追加（転生石で豪華スキンを入手）',
      '🪙 藻コインシステムを追加（デイリーログインで獲得）',
      '⚡ タップブースト・MPS加速などの消費アイテムを追加',
      '🏆 ランキング機能を追加（要ユーザー登録）',
      '👤 プレイヤー名登録・変更機能を追加',
      '🤖 オートクリッカーアイテムを追加',
    ],
  },
  {
    id: 'v1.1',
    date: '2026/04/30',
    title: '🌀 転生・施設・イベントシステム',
    items: [
      '✨ 転生システムを追加（転生石・スキルツリー）',
      '🏗️ 施設システムを追加（工場・研究所など）',
      '🎲 ランダムイベントシステムを追加',
      '💥 クリティカルヒットシステムを追加',
      '🔊 サウンドシステムを追加',
      '🌙 オフライン収益システムを追加',
      '👑 ロイヤルハートアイテムを追加',
    ],
  },
];

// ========== 画像設定 ==========
// 個別ファイル管理。画像を追加したらここのパスを変えるだけ。
const IMAGE_CONFIG = {
  character: {
    suits: {
      black:    'assets/characters/suit_black.png',
      blue:     'assets/characters/suit_blue.png',
      green:    'assets/characters/suit_green.png',
      red:      'assets/characters/suit_red.png',
      gold:     'assets/characters/suit_gold.png',
      rainbow:  'assets/characters/suit_rainbow.png',
      awakened: 'assets/characters/suit_awakened.png',
      silver:   'assets/suits/suit_silver.png',
      white:    'assets/suits/suit_white.png',
      moku_ki:  'assets/characters/moku_ki.png',
      mo_mizu:  'assets/characters/mo_mizu.png',
      mo_pink:  'assets/characters/mo_pink.png',
      mo_majyo: 'assets/characters/mo_majyo.png',
      puikyua_ki:  'assets/characters/puikyua_kiiro_.png',
      puikyua_pk:  'assets/characters/puikyua_pink_.png',
      ur_rushieru: 'assets/characters/ur_rushieru.png',
      ur_nokushia: 'assets/characters/ur_nokushia.png',
    },
  },
  employees: {
    algae:     'assets/employees/algae.png',
    jellyfish: 'assets/employees/jellyfish.png',
    crab:      'assets/employees/crab.png',
    coral:     'assets/employees/coral.png',
    shark:     'assets/employees/shark.png',
  },
  events: {
    bonus_tap:       'assets/events/bonus_tap.png',
    bonus_mps:       'assets/events/bonus_mps.png',
    bonus_moku:      'assets/events/bonus_moku.png',
    jellyfish_swarm: 'assets/events/jellyfish_swarm.png',
    shark_deal:      'assets/events/shark_deal.png',
    human_spotted:   'assets/events/human_spotted.png',
    moku_bubble:     'assets/events/moku_bubble.png',
    settlement_bonus:'assets/events/settlement_bonus.png',
    tax_bill:        'assets/events/tax_bill.png',
    deep_treasure:   'assets/events/deep_treasure.png',
    sea_god:         'assets/events/sea_god.png',
    rough_current:   'assets/events/rough_current.png',
    record_break:    'assets/events/record_break.png',
    deep_factory:    'assets/events/deep_factory.png',
  },
  facilities: {
    facility_plant:   'assets/facilities/facility_plant.png',
    facility_factory: 'assets/facilities/facility_factory.png',
    facility_lab:     'assets/facilities/facility_lab.png',
    facility_hq:      'assets/facilities/facility_hq.png',
    facility_bank:    'assets/facilities/facility_bank.png',
    facility_tower:   'assets/facilities/facility_tower.png',
  },
  items: {
    royalheart:     'assets/items/royalheart.png',
    mo_royalheart:  'assets/items/mo_royalheart.png',
    trophy_black:   'assets/trophy/black-removebg-preview.png',
    trophy_bronze:  'assets/trophy/bronze-removebg-preview.png',
    trophy_silver:  'assets/trophy/silver-removebg-preview.png',
    trophy_gold:    'assets/trophy/gold-removebg-preview.png',
    trophy_kirin:   'assets/trophy/kirin-removebg-preview.png',
    trophy_rainbow: 'assets/trophy/rainbow-removebg-preview.png',
  },
  effects: {
    // tapPower に応じて切り替え
    normal:   'assets/effects/tap_normal.png',   // デフォルト
    large:    'assets/effects/tap_large.png',    // tapPower >= 6
    critical: 'assets/effects/tap_critical.png', // tapPower >= 26
    awakened: 'assets/effects/tap_awakened.png', // 覚醒中
    // テキストオーバーレイ
    textBashu:  'assets/effects/text_bashu.png',  // tapPower >= 6 で表示
    textMuzoku: 'assets/effects/text_muzoku.png', // 覚醒中に表示
  },
};

const SUIT_COVER_FIT = new Set(['silver', 'white']); // 正方形画像はcoverで表示
const SUIT_TOP_FIT   = new Set(['moku_ki', 'mo_mizu', 'mo_pink', 'mo_majyo', 'puikyua_ki', 'puikyua_pk', 'ur_rushieru', 'ur_nokushia']); // 正方形・上寄せ表示

function applyCharacterSprite(suit) {
  let effectiveSuit = suit;
  if (gameState.equippedSkin) {
    const skin = GACHA_SKINS.find(s => s.id === gameState.equippedSkin);
    if (skin) effectiveSuit = skin.suit;
  }
  const src = IMAGE_CONFIG.character.suits[effectiveSuit] ?? IMAGE_CONFIG.character.suits.black;
  const sprite = document.getElementById('character-sprite');
  if (sprite) {
    sprite.src = src;
    if (SUIT_TOP_FIT.has(effectiveSuit)) {
      sprite.style.objectFit = 'contain';
      sprite.style.objectPosition = 'top center';
    } else {
      sprite.style.objectFit = SUIT_COVER_FIT.has(effectiveSuit) ? 'cover' : 'contain';
      sprite.style.objectPosition = 'center';
    }
  }
}

function getEmployeeIconStyle(empId) {
  const src = IMAGE_CONFIG.employees[empId];
  if (!src) return '';
  return `background-image:url('${src}');background-size:cover;background-position:center;background-repeat:no-repeat;font-size:0;`;
}

// スーツ変化の節目（Lv単位）
const SUIT_MILESTONES = [
  [200, 'rainbow'],
  [100, 'gold'],
  [ 50, 'red'],
  [ 25, 'green'],
  [ 10, 'blue'],
  [  1, 'black'],
];

// 各節目に対応する累計藻の目標値（線形補間でLv1ずつ増える）
const MOKU_MILESTONES = [
  [1,   0],
  [10,  500],
  [25,  5_000],
  [50,  50_000],
  [100, 500_000],
  [200, 50_000_000],
];

// レベルnに到達するために必要な累計藻（線形補間）
function mokuForLevel(n) {
  if (n <= 1) return 0;
  if (n >= 200) return 50_000_000 + (n - 200) * 2_500_000;
  for (let i = 1; i < MOKU_MILESTONES.length; i++) {
    const [l1, m1] = MOKU_MILESTONES[i - 1];
    const [l2, m2] = MOKU_MILESTONES[i];
    if (n <= l2) {
      const t = (n - l1) / (l2 - l1);
      return Math.floor(m1 + t * (m2 - m1));
    }
  }
  return 50_000_000;
}

// 累計藻から現在レベルを算出
function calcLevelFromMoku(totalMoku) {
  if (totalMoku >= 300_000_000) return 300;
  let level = 1;
  for (let n = 2; n <= 300; n++) {
    if (mokuForLevel(n) <= totalMoku) level = n;
    else break;
  }
  return level;
}

// レベルからスーツ名を返す
function getSuitForLevel(level) {
  for (const [threshold, suit] of SUIT_MILESTONES) {
    if (level >= threshold) return suit;
  }
  return 'black';
}

// 施設（各最大5回購入、costMult: 2.5）
const FACILITIES = [
  { id: 'facility_plant',   name: '海藻プラント',   icon: '🌱', desc: '+3 / 秒',      baseCost: 2_000,     costMult: 2.5, mpsBonus: 3,    maxCount: 5 },
  { id: 'facility_factory', name: '深海工場',       icon: '🏭', desc: '+20 / 秒',     baseCost: 15_000,    costMult: 2.5, mpsBonus: 20,   maxCount: 5 },
  { id: 'facility_lab',     name: 'サンゴ研究所',   icon: '🔬', desc: 'タップ +50',   baseCost: 50_000,    costMult: 2.5, tapBonus: 50,   maxCount: 5 },
  { id: 'facility_hq',      name: '海底本社ビル',   icon: '🏢', desc: '+100 / 秒',    baseCost: 200_000,   costMult: 2.5, mpsBonus: 100,  maxCount: 5 },
  { id: 'facility_bank',    name: '海流銀行',       icon: '🏦', desc: '+400 / 秒',    baseCost: 800_000,   costMult: 2.5, mpsBonus: 400,  maxCount: 5 },
  { id: 'facility_tower',   name: '光合成タワー',   icon: '🗼', desc: '+1500 / 秒',   baseCost: 3_000_000, costMult: 2.5, mpsBonus: 1500, maxCount: 5 },
];

// ========== ペットシステム ==========

const CAT_STAGES = [
  { id: 'egg',     name: '卵',    col: 0, mult: 1.0, condition: null,                     waitHours: 0 },
  { id: 'growth',  name: '子猫',  col: 1, mult: 1.25, condition: { mokuCost: 5_000_000 }, waitHours: 1 },
  { id: 'ultimate',name: 'ゴリラ', col: 2, mult: 1.5,  condition: { mokuCost: 50_000_000 }, waitHours: 6 },
];

const PET_TYPES = [
  { id: 'green',     name: '緑の精霊',     icon: '🌿', row: 0, buyCost: { type: 'coins',  amount: 30         }, effectType: 'tap',  effectDesc: 'タップ倍率アップ' },
  { id: 'pink',      name: '桜の精霊',     icon: '🌸', row: 1, buyCost: { type: 'stones', amount: 20         }, effectType: 'mps',  effectDesc: 'MPS倍率アップ'   },
  { id: 'purple',    name: '月の精霊',     icon: '🌙', row: 2, buyCost: { type: 'stones', amount: 50         }, effectType: 'coin', effectDesc: 'デイリー藻コイン獲得アップ' },
  { id: 'cat_pink',  name: 'ピンクにゃんこ', icon: '🐱', row: 3, buyCost: { type: 'moku',   amount: 10_000_000 }, effectType: 'tap',  effectDesc: 'タップ倍率アップ', stages: CAT_STAGES, sprites: ['pink_cat_egg', 'pink_cat_child', 'pink_gorira']  },
  { id: 'cat_white', name: 'しろにゃんこ',  icon: '🐈', row: 4, buyCost: { type: 'moku',   amount: 10_000_000 }, effectType: 'mps',  effectDesc: 'MPS倍率アップ',   stages: CAT_STAGES, sprites: ['white_cat_egg', 'white_cat_child', 'white_gorira'] },
];

const PET_STAGES = [
  { id: 'egg',     name: '卵',     col: 0, mult: 1.0, condition: null,                                             waitHours: 0  },
  { id: 'growth',  name: '成長期', col: 1, mult: 1.1, condition: { mokuCost: 500_000 },                           waitHours: 1  },
  { id: 'mature',  name: '成熟期', col: 2, mult: 1.25,condition: { mokuCost: 3_000_000 },                         waitHours: 12 },
  { id: 'perfect', name: '完全期', col: 3, mult: 1.5, condition: { mokuCost: 20_000_000, prestigeMin: 1 },        waitHours: 24 },
  { id: 'ultimate',name: '究極期', col: 4, mult: 2.0, condition: { mokuCost: 100_000_000, prestigeMin: 3 },       waitHours: 72 },
];

function getPetStages(typeId) {
  const type = PET_TYPES.find(t => t.id === typeId);
  return type?.stages ?? PET_STAGES;
}

function getPetSpriteStyle(typeId, stageIndex) {
  const stage = getPetStages(typeId)[stageIndex];
  if (!stage) return '';
  const type = PET_TYPES.find(t => t.id === typeId);
  const file = type?.sprites?.[stageIndex] ?? `${typeId}_${stage.id}`;
  return `background-image:url('assets/pet/${file}.png');background-size:cover;background-position:top center;background-repeat:no-repeat;`;
}

function getPetMultiplier() {
  const slots = [gameState.activePetType];
  if (gameState.petSlot2Unlocked && gameState.activePetType2) slots.push(gameState.activePetType2);
  let tap = 1, mps = 1, coin = 1;
  for (const typeId of slots) {
    if (!typeId) continue;
    const pet = (gameState.ownedPets ?? {})[typeId];
    if (!pet) continue;
    const mult = getPetStages(typeId)[pet.stageIndex ?? 0]?.mult ?? 1;
    const type = PET_TYPES.find(t => t.id === typeId);
    if (type?.effectType === 'tap')  tap  *= mult;
    if (type?.effectType === 'mps')  mps  *= mult;
    if (type?.effectType === 'coin') coin *= mult;
  }
  return { tap, mps, coin };
}

// ネタアイテム・装飾アイテム（一度きりの購入）
const ITEMS = [
  { id: 'royalheart',     name: 'ロイヤルハート',         icon: '👑', desc: '藻屑界のエリートの証！',             cost:          5_000_000, overlayPos: 'top-left'  },
  { id: 'mo_royalheart',  name: '藻ロイヤルハート',       icon: '🌿', desc: '藻屑界の頂点に立つ者の証！',         cost:         10_000_000, overlayPos: 'top-right' },
  { id: 'trophy_black',   name: '黒トロフィー',           icon: '🏆', desc: '藻屑界への第一歩の証。',             cost:          2_000_000, overlayPos: 'trophy'    },
  { id: 'trophy_bronze',  name: '銅トロフィー',           icon: '🏆', desc: '着実に積み上げてきた実力の証。',     cost:          8_000_000, overlayPos: 'trophy'    },
  { id: 'trophy_silver',  name: '銀トロフィー',           icon: '🏆', desc: '藻屑界でも一目置かれる存在の証。', cost:         40_000_000, overlayPos: 'trophy'    },
  { id: 'trophy_gold',    name: '金トロフィー',           icon: '🏆', desc: '選ばれし藻屑エリートの証。',         cost:        200_000_000, overlayPos: 'trophy'    },
  { id: 'trophy_kirin',   name: 'キリントロフィー',       icon: '🏆', desc: '幻の領域に踏み込んだ者の証。',       cost:      1_000_000_000, overlayPos: 'trophy'    },
  { id: 'trophy_rainbow', name: 'レインボートロフィー',   icon: '🏆', desc: '藻屑界の伝説。この先に何がある？',   cost:      8_000_000_000, overlayPos: 'trophy'    },
];

// 購入ごとに tapBonus/critRateBonus/critMultBonus/mpsBonus が加算される
const UPGRADES = [
  { id: 'tap1',   name: 'タップ強化 I',        icon: '💪', desc: 'タップ +1',             baseCost: 8,       costMult: 2.0, tapBonus: 1,             maxCount: 10 },
  { id: 'tap2',   name: 'タップ強化 II',       icon: '💪', desc: 'タップ +5',             baseCost: 60,      costMult: 2.0, tapBonus: 5,             maxCount: 10 },
  { id: 'tap3',   name: 'タップ強化 III',      icon: '💪', desc: 'タップ +25',            baseCost: 500,     costMult: 2.0, tapBonus: 25,            maxCount: 10 },
  { id: 'tap4',   name: 'タップ強化 IV',       icon: '💪', desc: 'タップ +100',           baseCost: 5_000,   costMult: 2.0, tapBonus: 100,           maxCount: 10 },
  { id: 'critR',  name: 'クリティカル率強化',  icon: '🎯', desc: 'クリティカル率 +2%',   baseCost: 300,     costMult: 3.0, critRateBonus: 0.02,     maxCount: 5  },
  { id: 'critM',  name: 'クリティカル倍率強化',icon: '⚡', desc: 'クリティカル倍率 +0.5', baseCost: 1_000,   costMult: 3.0, critMultBonus: 0.5,      maxCount: 5  },
  { id: 'mps1',   name: 'MPS強化 I',           icon: '🌊', desc: 'MPS +2',                baseCost: 500,     costMult: 2.0, mpsBonus: 2,             maxCount: 10 },
  { id: 'mps2',   name: 'MPS強化 II',          icon: '🌊', desc: 'MPS +10',               baseCost: 4_000,   costMult: 2.0, mpsBonus: 10,            maxCount: 10 },
  { id: 'mps3',   name: 'MPS強化 III',         icon: '🌊', desc: 'MPS +50',               baseCost: 30_000,  costMult: 2.0, mpsBonus: 50,            maxCount: 10 },
  { id: 'mps4',        name: 'MPS強化 IV',          icon: '🌊', desc: 'MPS +200',              baseCost: 250_000, costMult: 2.0, mpsBonus: 200,    maxCount: 10 },
  { id: 'awaken_time', name: '覚醒時間延長',        icon: '⏱️', desc: '覚醒時間 +5秒',         baseCost: 50_000,  costMult: 3.0,                              maxCount: 5  },
  { id: 'awaken_gauge',name: '覚醒ゲージ強化',      icon: '⚡', desc: 'ゲージ増加 +0.05/タップ', baseCost: 30_000,  costMult: 3.0,                              maxCount: 7  },
];

// 所持数に応じて MPS が増加（baseCost * 1.15^所持数 で価格上昇）
const EMPLOYEES = [
  { id: 'algae',    name: '小型海藻バイト', icon: '🌿', baseCost: 8,      mpsBonus: 0.3   },
  { id: 'jellyfish',name: 'クラゲ社員',     icon: '🪼', baseCost: 80,     mpsBonus: 2.0   },
  { id: 'crab',     name: 'カニ主任',       icon: '🦀', baseCost: 800,    mpsBonus: 8.0   },
  { id: 'coral',    name: 'サンゴ管理職',   icon: '🪸', baseCost: 5_000,  mpsBonus: 30.0  },
  { id: 'shark',    name: 'サメ幹部',       icon: '🦈', baseCost: 30_000, mpsBonus: 100.0 },
];

const EVENTS = [
  // ── デフォルト解放済み（unlockCost: 0） ──
  { id: 'bonus_tap',       name: '藻の大発生！',           icon: '🌊', desc: 'タップ効率 ×3（100秒）',          type: 'tap_mult',   value: 3,   duration: 100, unlockCost: 0       },
  { id: 'bonus_mps',       name: '自動収穫強化！',         icon: '⚡', desc: '自動収益 ×2（150秒）',            type: 'mps_mult',   value: 2,   duration: 150, unlockCost: 0       },
  { id: 'bonus_moku',      name: 'ボーナス収穫！',         icon: '💎', desc: '現在の藻 +10%（即時）',           type: 'moku_bonus', value: 0.1, duration: 15,  unlockCost: 0       },
  { id: 'rough_current',   name: '海流が荒れている…',     icon: '🌀', desc: '自動収益 -30%（100秒）',          type: 'mps_mult',   value: 0.7, duration: 100, unlockCost: 0       },
  // ── 藻で解放可能 ──
  { id: 'jellyfish_swarm', name: 'クラゲの大群襲来！',     icon: '🪼', desc: 'タップ効率 ×2（200秒）',          type: 'tap_mult',   value: 2,   duration: 200, unlockCost: 500     },
  { id: 'human_spotted',   name: '人間にバレそうだ！',     icon: '👁️', desc: '話題沸騰！自動収益 ×1.5（150秒）',type: 'mps_mult',   value: 1.5, duration: 150, unlockCost: 1_000   },
  { id: 'moku_bubble',     name: '海流バブル発生！',       icon: '🫧', desc: 'タップ効率 ×5（75秒）',           type: 'tap_mult',   value: 5,   duration: 75,  unlockCost: 3_000   },
  { id: 'shark_deal',      name: 'サメが営業に来た！',     icon: '🦈', desc: '自動収益 ×3（225秒）',            type: 'mps_mult',   value: 3,   duration: 225, unlockCost: 8_000   },
  { id: 'deep_factory',    name: '深海工場の稼働！',       icon: '🏭', desc: '自動収益 ×2（300秒）',            type: 'mps_mult',   value: 2,   duration: 300, unlockCost: 15_000  },
  { id: 'deep_treasure',   name: '深海の宝を発見！',       icon: '🪙', desc: '現在の藻 +30%（即時）',           type: 'moku_bonus', value: 0.3, duration: 15,  unlockCost: 25_000  },
  { id: 'record_break',    name: '記録更新！！',           icon: '📈', desc: 'タップ効率 ×10（50秒）',          type: 'tap_mult',   value: 10,  duration: 50,  unlockCost: 50_000  },
  { id: 'settlement_bonus',name: '決算ボーナス！',         icon: '💰', desc: '現在の藻 +50%（即時）',           type: 'moku_bonus', value: 0.5, duration: 15,  unlockCost: 100_000 },
  { id: 'tax_bill',        name: '税金の請求書が届いた…', icon: '📄', desc: '自動収益 -50%（150秒）',          type: 'mps_mult',   value: 0.5, duration: 150, unlockCost: 0       },
  { id: 'sea_god',         name: '海神様のお告げだ！',     icon: '🔱', desc: '全収益 ×4（50秒）',               type: 'all_mult',   value: 4,   duration: 50,  unlockCost: 500_000 },
];

// ガチャスキン一覧（既存スーツを流用）
const GACHA_SKINS = [
  { id: 'skin_black',   name: '黒スーツ',         rarity: 'N',   suit: 'black',       prob: 0.60  },
  { id: 'skin_blue',    name: '青スーツ',         rarity: 'R',   suit: 'blue',        prob: 0.125 },
  { id: 'skin_green',   name: '緑スーツ',         rarity: 'R',   suit: 'green',       prob: 0.125 },
  { id: 'skin_red',     name: '赤スーツ',         rarity: 'SR',  suit: 'red',         prob: 0.06,  op: { tap: 1.3 } },
  { id: 'skin_gold',    name: '金スーツ',         rarity: 'SR',  suit: 'gold',        prob: 0.06,  op: { mps: 1.3 } },
  { id: 'skin_rainbow', name: 'レインボースーツ', rarity: 'SSR', suit: 'rainbow',     prob: 0.0033, op: { tap: 1.5 } },
  { id: 'skin_silver',  name: 'シルバースーツ',   rarity: 'SSR', suit: 'silver',      prob: 0.0033, op: { mps: 1.5 } },
  { id: 'skin_white',   name: 'ホワイトスーツ',   rarity: 'SSR', suit: 'white',       prob: 0.0033, op: { tap: 1.5 } },
  { id: 'skin_moku_ki', name: 'もくきちゃん',     rarity: 'SSR', suit: 'moku_ki',     prob: 0.0033, op: { mps: 1.5 } },
  { id: 'skin_mo_mizu', name: 'もみずちゃん',     rarity: 'SSR', suit: 'mo_mizu',     prob: 0.0033, op: { tap: 1.5 } },
  { id: 'skin_mo_pink', name: 'もぴんくちゃん',   rarity: 'SSR', suit: 'mo_pink',     prob: 0.0033, op: { mps: 1.5 } },
  { id: 'skin_mo_majyo',   name: 'もまじょちゃん',         rarity: 'SSR', suit: 'mo_majyo',    prob: 0.0033, op: { tap: 1.5 } },
  { id: 'skin_puikyua_ki', name: 'ぷいきゅあきいろちゃん', rarity: 'SSR', suit: 'puikyua_ki',  prob: 0.0033, op: { mps: 1.5 } },
  { id: 'skin_puikyua_pk', name: 'ぷいきゅあぴんくちゃん', rarity: 'SSR', suit: 'puikyua_pk',  prob: 0.0033, op: { tap: 1.5 } },
  { id: 'skin_ur_rushieru', name: '星屑のルシエル', rarity: 'UR', suit: 'ur_rushieru', prob: 0.001, op: { tap: 2.0, mps: 2.0 } },
  { id: 'skin_ur_nokushia', name: '黒星のノクシア', rarity: 'UR', suit: 'ur_nokushia', prob: 0.001, op: { tap: 2.0, mps: 2.0 } },
];

const RARITY_COLOR       = { N: '#888888', R: '#4499ff', SR: '#ffd700', SSR: '#ff44ff', UR: '#ff6600' };
const RARITY_DUPE_STONES = { N: 1, R: 5, SR: 15, SSR: 50, UR: 100 };

// ========== 消費アイテム ==========

const COINS_PER_STONE = 10;
const DAILY_COINS     = 3;

const CONSUMABLE_ITEMS = [
  { id: 'tap_boost',    name: 'タップブースト',  icon: '⚡', desc: '1分間タップ×10倍',          cost: 3,  duration: 60,  type: 'timed',   effect: 'tap_boost'  },
  { id: 'mps_boost',    name: 'MPS加速',          icon: '🌊', desc: '5分間MPS×5倍',              cost: 3,  duration: 300, type: 'timed',   effect: 'mps_boost'  },
  { id: 'auto_clicker', name: 'オートクリッカー', icon: '👆', desc: '5分間自動タップ（2回/秒）', cost: 5,  duration: 300, type: 'timed',   effect: 'auto_click' },
  { id: 'moku_storm',   name: '藻の嵐',           icon: '💎', desc: '現在のMPS×300秒分を即獲得', cost: 8,  duration: 0,   type: 'instant', effect: 'moku_storm' },
  { id: 'gacha_coin',   name: 'スキンガチャコイン', icon: '🎰', desc: 'スキンガチャ1回無料',       cost: 50, duration: 0,   type: 'instant', effect: 'gacha'      },
];

// 転生スキルツリー
const PRESTIGE_SKILLS = [
  { id: 'pTap',    name: 'タップ強化',         desc: '恒久タップ ×1.5倍',        costs: [10, 25, 50, 100, 200], type: 'tapMult',    value: 1.5, maxLevel: 5 },
  { id: 'pMps',    name: '自動収益強化',        desc: '恒久MPS ×1.5倍',            costs: [10, 25, 50, 100, 200], type: 'mpsMult',    value: 1.5, maxLevel: 5 },
  { id: 'pCritR',  name: 'クリティカル率UP',   desc: '恒久クリティカル率 +5%',    costs: [30, 80, 200],          type: 'critRate',   value: 0.05, maxLevel: 3 },
  { id: 'pCritM',  name: 'クリティカル倍率UP', desc: '恒久クリティカル倍率 +1倍', costs: [50, 150, 400],         type: 'critMult',   value: 1,    maxLevel: 3 },
  { id: 'pAwaken', name: '覚醒強化',            desc: '覚醒効果 ×2（5倍→10倍）',   costs: [300],                  type: 'awakenMult', value: 2,    maxLevel: 1 },
  { id: 'pStone',    name: '転生加速',      desc: '転生石獲得量 ×2',          costs: [500],                                                    type: 'stoneMult', value: 2,   maxLevel: 1 },
  { id: 'pStoneCap', name: '転生石上限UP', desc: '転生石獲得上限 +500（現在上限: {cap}石）', costs: [250,250,250,250,250,250,250,250,250,250], type: 'stoneCap',  value: 500, maxLevel: 10 },
  { id: 'pTap2',   name: '深海の力',              desc: '恒久タップ ×2倍',          costs: [3000, 6000, 12000], type: 'tapMult',  value: 2,    maxLevel: 3, requirePrestige: 20 },
  { id: 'pMps2',   name: '深海の流れ',            desc: '恒久MPS ×2倍',             costs: [3000, 6000, 12000], type: 'mpsMult',  value: 2,    maxLevel: 3, requirePrestige: 20 },
  { id: 'pCritR2', name: 'クリティカルの極意',    desc: '恒久クリティカル率 +10%',  costs: [5000, 5000, 5000],  type: 'critRate', value: 0.10, maxLevel: 3, requirePrestige: 25 },
  { id: 'pCritM2', name: 'クリティカル倍率の極意', desc: '恒久クリティカル倍率 +2倍', costs: [4000, 8000, 16000], type: 'critMult', value: 2,    maxLevel: 3, requirePrestige: 25 },
  { id: 'pAll',       name: '社長の覇道',      desc: 'タップ＆MPS ×3倍',                             costs: [20000, 50000],             type: 'allMult',     value: 3,    maxLevel: 2, requirePrestige: 30 },
  { id: 'pStoneCap2', name: '転生石上限強化II', desc: '転生石獲得上限 +3000（現在上限: {cap}石）',     costs: [5000,5000,5000,5000,5000], type: 'stoneCap2',   value: 3000, maxLevel: 5, requirePrestige: 30 },
  { id: 'shinTap',    name: '神話の力',         desc: '恒久タップ ×5倍',                              costs: [250, 500, 1000],           type: 'shinTapMult', value: 5,    maxLevel: 3, requirePrestige: 50, currencyType: 'shin' },
  { id: 'shinMps',    name: '神話の流れ',       desc: '恒久MPS ×5倍',                                 costs: [250, 500, 1000],           type: 'shinMpsMult', value: 5,    maxLevel: 3, requirePrestige: 50, currencyType: 'shin' },
  { id: 'shinAll',    name: '神話の覇道',       desc: 'タップ＆MPS ×3倍',                             costs: [250, 500, 1000],           type: 'shinAllMult', value: 3,    maxLevel: 3, requirePrestige: 75, currencyType: 'shin' },
];

// ========== 初期状態 ==========

const DEFAULT_STATE = {
  saveVersion:    SAVE_VERSION,
  moku:           0,
  totalMoku:      0,      // 累計獲得藻（覚醒・イベントボーナスは含めない）
  tapPower:       1,
  mokuPerSecond:  0,
  suit:           'black',
  awakenGauge:    0,      // 0〜100 の整数
  isAwakened:     false,
  awakenTimer:    0,
  upgrades:       {},     // { upgradeId: 購入回数 }
  employees:      {},     // { employeeId: 所持数 }
  facilities:     {},     // { facilityId: 購入回数 }
  critRate:        0.05,   // クリティカル確率（課金要素で上昇）
  critMult:        3,      // クリティカル倍率（課金要素で上昇）
  soundEnabled:    true,   // サウンドON/OFF
  purchasedItems:  [],
  equippedItems:   [],
  prestigeLevel:   0,
  prestigeStones:  0,
  prestigeSkills:  {},
  prestigeHistory: [],
  ownedSkins:      [],
  equippedSkin:    null,
  gachaPity:       0,
  unlockedEvents:  ['bonus_tap', 'bonus_mps', 'bonus_moku', 'rough_current', 'tax_bill'],
  nextEventId:     null,   // 待機中に予告表示するイベントID
  eventCooldown:   60,
  activeEvent:     null,   // { id, timer }
  eventTapMult:    1,
  eventMpsMult:    1,
  lastSaved:       0,
  mokuCoins:       0,
  lastDailyLogin:  null,
  consumables:          {},     // { itemId: 所持数 }
  activeEffects:        {},     // { effectId: 終了timestamp(ms) }
  hasRegistered:        false,  // 一度でもログインしたか
  registrationBonusClaimed: false, // 登録ボーナス受取済みか
  menheraMode:          false,  // メンヘラモードON/OFF
  ownedPets:            {},     // { typeId: { stageIndex, conditionMetAt } }
  activePetType:        null,   // スロット1のペットtypeId
  activePetType2:       null,   // スロット2のペットtypeId
  petSlot2Unlocked:     false,  // スロット2解放済みか
  lastReadUpdateId:     null,
  tapCount:             0,
  achievements:         {},
  usedCoupons:          [],
  shinStones:           0,
  highlowHighScore:     0,
};

let gameState = structuredClone(DEFAULT_STATE);

// ========== ユーティリティ ==========

function fmt(n) {
  n = Math.floor(n);
  if (n >= 1e33) return (n / 1e33).toFixed(2) + 'Dc';
  if (n >= 1e30) return (n / 1e30).toFixed(2) + 'No';
  if (n >= 1e27) return (n / 1e27).toFixed(2) + 'Oc';
  if (n >= 1e24) return (n / 1e24).toFixed(2) + 'Sp';
  if (n >= 1e21) return (n / 1e21).toFixed(2) + 'Sx';
  if (n >= 1e18) return (n / 1e18).toFixed(2) + 'Qi';
  if (n >= 1e15) return (n / 1e15).toFixed(2) + 'Qa';
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9)  return (n / 1e9).toFixed(2)  + 'B';
  if (n >= 1e6)  return (n / 1e6).toFixed(2)  + 'M';
  if (n >= 1e4)  return (n / 1e3).toFixed(1)  + 'K';
  return n.toLocaleString();
}

// 旧関数: calcLevelFromMoku に統合済み（互換のため残しておく）
function calcLevel(totalMoku) {
  const lv   = calcLevelFromMoku(totalMoku);
  const suit = getSuitForLevel(lv);
  return { level: lv, suit };
}

// ========== サウンド（Web Audio API） ==========

let _audioCtx = null;
let _lastCloudSave = null;
let _minCloudTotalMoku = 0;
let _cloudCheckDone = false; // クラウド確認完了前のsaveGame()ブロック用
const _petWaitingSet = new Set(); // 進化待機中のペット追跡（タイマー完了検知用）

function getAudioCtx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}

function playSound(type) {
  if (!gameState.soundEnabled) return;
  const ctx = getAudioCtx();
  const t = ctx.currentTime;

  const beep = (freq, endFreq, duration, gain = 0.18, wave = 'square') => {
    const osc = ctx.createOscillator();
    const vol = ctx.createGain();
    osc.connect(vol);
    vol.connect(ctx.destination);
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, t);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + duration);
    vol.gain.setValueAtTime(gain, t);
    vol.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.start(t);
    osc.stop(t + duration);
  };

  switch (type) {
    case 'tap':      beep(380, 200, 0.07, 0.12); break;
    case 'tapLarge': beep(600, 280, 0.11, 0.18); break;
    case 'critical':
      [600, 900, 1300].forEach((f, i) => setTimeout(() => beep(f, f * 1.2, 0.1, 0.18, 'sawtooth'), i * 80));
      break;
    case 'buy':      beep(800, 1200, 0.14, 0.18, 'sine'); break;
    case 'awaken':   beep(180, 1600, 0.5, 0.25, 'sawtooth'); break;
    case 'levelup':
      [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, f, 0.12, 0.16, 'triangle'), i * 90));
      break;
  }
}

let _prevLevel = -1;

function getUpgradeCost(u) {
  const count = gameState.upgrades[u.id] ?? 0;
  return Math.floor(u.baseCost * Math.pow(u.costMult, count));
}

function getEmployeeCost(emp) {
  const count = gameState.employees[emp.id] ?? 0;
  return Math.floor(emp.baseCost * Math.pow(1.15, count));
}

function getFacilityCost(f) {
  const count = gameState.facilities[f.id] ?? 0;
  return Math.floor(f.baseCost * Math.pow(f.costMult, count));
}

function getFacilityIconStyle(facId) {
  const src = IMAGE_CONFIG.facilities[facId];
  if (!src) return '';
  return `background-image:url('${src}');background-size:cover;background-position:center;background-repeat:no-repeat;font-size:0;`;
}

function getPrestigeBonus(type) {
  const isMult = ['tapMult', 'mpsMult', 'awakenMult', 'stoneMult', 'allMult', 'shinTapMult', 'shinMpsMult', 'shinAllMult'].includes(type);
  let bonus = isMult ? 1 : 0;
  for (const s of PRESTIGE_SKILLS) {
    if (s.type !== type) continue;
    const lv = gameState.prestigeSkills?.[s.id] ?? 0;
    if (isMult) bonus *= Math.pow(s.value, lv);
    else        bonus += s.value * lv;
  }
  return bonus;
}

function getSkinOp() {
  const skin = gameState.equippedSkin ? GACHA_SKINS.find(s => s.id === gameState.equippedSkin) : null;
  return skin?.op ?? {};
}

function formatSkinOp(op) {
  if (!op) return '';
  if (op.tap && op.mps) return `タップ&MPS ×${op.tap}`;
  if (op.tap) return `タップ ×${op.tap}`;
  if (op.mps) return `MPS ×${op.mps}`;
  return '';
}

function recalcTapPower() {
  let power = 1;
  for (const u of UPGRADES) {
    power += (u.tapBonus ?? 0) * (gameState.upgrades[u.id] ?? 0);
  }
  for (const f of FACILITIES) {
    power += (f.tapBonus ?? 0) * (gameState.facilities[f.id] ?? 0);
  }
  const skinOp = getSkinOp();
  gameState.tapPower = power * getPrestigeBonus('tapMult') * getPrestigeBonus('allMult') * getPrestigeBonus('shinTapMult') * getPrestigeBonus('shinAllMult') * (skinOp.tap ?? 1);
  if (!Number.isFinite(gameState.tapPower)) {
    console.error('[mokuzu] recalcTapPower: NaN/Infinityを検出。tapPower=1にフォールバック');
    gameState.tapPower = 1;
  }
}

function recalcMPS() {
  let mps = 0;
  for (const emp of EMPLOYEES) {
    mps += (emp.mpsBonus ?? 0) * (gameState.employees[emp.id] ?? 0);
  }
  for (const f of FACILITIES) {
    mps += (f.mpsBonus ?? 0) * (gameState.facilities[f.id] ?? 0);
  }
  for (const u of UPGRADES) {
    mps += (u.mpsBonus ?? 0) * (gameState.upgrades[u.id] ?? 0);
  }
  const skinOp = getSkinOp();
  gameState.mokuPerSecond = mps * getPrestigeBonus('mpsMult') * getPrestigeBonus('allMult') * getPrestigeBonus('shinMpsMult') * getPrestigeBonus('shinAllMult') * (skinOp.mps ?? 1);
  if (!Number.isFinite(gameState.mokuPerSecond)) {
    console.error('[mokuzu] recalcMPS: NaN/Infinityを検出。mokuPerSecond=0にフォールバック');
    gameState.mokuPerSecond = 0;
  }
}

// ========== 表示更新 ==========

function updateDisplay() {
  document.getElementById('moku-display').textContent = `藻: ${fmt(gameState.moku)}`;

  const mpsTotal = gameState.mokuPerSecond
    * (gameState.isAwakened ? 5 : 1)
    * (gameState.eventMpsMult ?? 1);
  document.getElementById('mps-display').textContent = `${fmt(mpsTotal)} / 秒`;

  // 覚醒ゲージ
  document.getElementById('awaken-gauge-bar').style.width = `${gameState.awakenGauge}%`;

  const btn = document.getElementById('awaken-btn');
  if (gameState.isAwakened) {
    btn.textContent = '覚醒中';
    btn.classList.remove('ready');
    btn.disabled = true;
  } else if (gameState.awakenGauge >= 100) {
    btn.textContent = '覚醒！';
    btn.classList.add('ready');
    btn.disabled = false;
  } else {
    btn.textContent = '覚醒';
    btn.classList.remove('ready');
    btn.disabled = true;
  }

  // 覚醒タイマー
  const timerEl = document.getElementById('awaken-timer');
  if (gameState.isAwakened) {
    timerEl.classList.remove('hidden');
    document.getElementById('awaken-time-val').textContent = gameState.awakenTimer;
  } else {
    timerEl.classList.add('hidden');
  }

  // レベル・スーツ・XPバー更新
  const SUIT_LABELS = {
    black: '⬛ 黒', blue: '🟦 青', green: '🟩 緑',
    red: '🟥 赤',  gold: '🌟 金', rainbow: '🌈 レインボー',
  };
  const lv   = calcLevelFromMoku(gameState.totalMoku);
  if (_prevLevel > 0 && lv > _prevLevel) playSound('levelup');
  _prevLevel = lv;
  const suit = getSuitForLevel(lv);
  if (suit !== gameState.suit) updateSuit(suit);

  const levelEl = document.getElementById('level-display');
  if (levelEl) {
    const equippedSkin = gameState.equippedSkin
      ? GACHA_SKINS.find(s => s.id === gameState.equippedSkin)
      : null;
    const suitLabel = equippedSkin ? equippedSkin.name : `${SUIT_LABELS[suit]}スーツ`;
    levelEl.textContent = `Lv.${lv}　${suitLabel}`;
  }

  // XPバー
  const xpCurrent = gameState.totalMoku - mokuForLevel(lv);
  const xpNeeded  = mokuForLevel(lv + 1) - mokuForLevel(lv);
  const xpPct     = lv >= 300 ? 100 : Math.min(100, Math.floor(xpCurrent / xpNeeded * 100));
  const xpBar  = document.getElementById('xp-bar');
  const xpText = document.getElementById('xp-text');
  if (xpBar)  xpBar.style.width = `${xpPct}%`;
  if (xpText) xpText.textContent = lv >= 300 ? 'MAX' : `${fmt(xpCurrent)} / ${fmt(xpNeeded)}`;

  // ステータスパネル更新
  const totalEmployees = Object.values(gameState.employees).reduce((s, n) => s + n, 0);
  const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.innerHTML = v; };
  setVal('stat-tap-power', `+${fmt(gameState.tapPower)}`);
  setVal('stat-mps',       `${fmt(gameState.mokuPerSecond)}<span class="stat-unit">/秒</span>`);
  setVal('stat-employees', `${totalEmployees}<span class="stat-unit">体</span>`);
  setVal('stat-total-moku', fmt(gameState.totalMoku));

  updatePrestigeBar();
  updatePrestigeTab();
  updateGoalPanel();
  renderUpgradeList();
  renderEventUnlockList();
  renderEmployeeList();
  renderFacilityList();
  renderItemList();
  renderConsumableList();
  renderUnlockedEventList();
  updateCoinDisplay();
  updateActiveEffectsBar();
  updateSoundBtn();
  checkAchievements();
  renderAchievementList();
}

const PRESTIGE_THRESHOLDS = [
  10_000_000,   // 1回目
  15_000_000,   // 2回目
  25_000_000,   // 3回目
  50_000_000,   // 4回目
  100_000_000,  // 5回目
  200_000_000,  // 6回目
  400_000_000,  // 7回目
  800_000_000,  // 8回目
];
const PRESTIGE_THRESHOLD_CAP = 1_600_000_000; // 9回目以降固定

function getPrestigeThreshold() {
  const lv = gameState.prestigeLevel ?? 0;
  return lv < PRESTIGE_THRESHOLDS.length ? PRESTIGE_THRESHOLDS[lv] : PRESTIGE_THRESHOLD_CAP;
}

function getPrestigeStoneCap() {
  return 1000 + (gameState.prestigeSkills?.pStoneCap ?? 0) * 500 + (gameState.prestigeSkills?.pStoneCap2 ?? 0) * 3000;
}

function updatePrestigeBar() {
  const total   = gameState.totalMoku ?? 0;
  const threshold = getPrestigeThreshold();
  const pct     = Math.min(100, Math.floor(total / threshold * 100));
  const ready   = total >= threshold;

  const bar     = document.getElementById('prestige-bar');
  const gauge   = document.getElementById('prestige-gauge-bar');
  const pctEl   = document.getElementById('prestige-pct');
  const remEl   = document.getElementById('prestige-remaining');
  const labelEl = document.getElementById('prestige-label');
  if (!bar) return;

  gauge.style.width = `${pct}%`;
  pctEl.textContent = `${pct}%`;

  const stonePreview = document.getElementById('prestige-stone-preview');
  if (ready) {
    bar.classList.add('prestige-ready');
    labelEl.textContent = '✨ 転生可能！';
    remEl.textContent   = '';
    const stonesPreview = Math.min(Math.floor(total / 1_000_000) * getPrestigeBonus('stoneMult'), getPrestigeStoneCap());
    if (stonePreview) {
      stonePreview.classList.remove('hidden');
      stonePreview.innerHTML = `<img class="prestige-stone-icon" src="assets/prestige/prestige_stone.png" alt="転生石"> 転生すると <strong>${stonesPreview} 転生石</strong> 獲得！`;
    }
    if (!document.getElementById('prestige-do-btn')) {
      const btn = document.createElement('button');
      btn.id = 'prestige-do-btn';
      btn.innerHTML = '<img class="prestige-effect-icon" src="assets/prestige/prestige_effect.png" alt=""> 転生する';
      btn.addEventListener('click', doPrestige);
      bar.appendChild(btn);
    }
  } else {
    bar.classList.remove('prestige-ready');
    labelEl.textContent = '✨ 転生まで';
    remEl.textContent   = `あと ${fmt(threshold - total)} 藻`;
    if (stonePreview) stonePreview.classList.add('hidden');
    document.getElementById('prestige-do-btn')?.remove();
  }
}

function updateGoalPanel() {
  const labelEl = document.getElementById('goal-label');
  const remEl   = document.getElementById('goal-remaining');
  if (!labelEl || !remEl) return;

  if (gameState.equippedSkin) {
    const skin = GACHA_SKINS.find(s => s.id === gameState.equippedSkin);
    if (skin) {
      const rarityColor = RARITY_COLOR[skin.rarity];
      const opStr = skin.op ? ` [${formatSkinOp(skin.op)}]` : '';
      labelEl.innerHTML = `<span style="color:${rarityColor};font-weight:bold">${skin.rarity}</span> ${skin.name}${opStr} 装備中`;
      remEl.textContent = '';
      return;
    }
  }

  const lv = calcLevelFromMoku(gameState.totalMoku);

  const SUIT_GOALS = [
    { level: 10,  suit: '青',         emoji: '🟦' },
    { level: 25,  suit: '緑',         emoji: '🟩' },
    { level: 50,  suit: '赤',         emoji: '🟥' },
    { level: 100, suit: '金',         emoji: '🌟' },
    { level: 200, suit: 'レインボー', emoji: '🌈' },
    { level: 300, suit: 'MAX',        emoji: '👑' },
  ];

  const next = SUIT_GOALS.find(g => lv < g.level);
  if (!next) {
    labelEl.textContent   = '👑 Lv.MAX 達成！';
    remEl.textContent     = '';
    return;
  }

  const needed = mokuForLevel(next.level) - gameState.totalMoku;
  if (next.level === 300) {
    labelEl.textContent = `🎯 Lv300 MAX 達成まで！`;
  } else {
    labelEl.textContent = `🎯 Lv${next.level}で${next.emoji}${next.suit}スーツ解放！`;
  }
  remEl.textContent = `あと ${fmt(Math.max(0, needed))} 藻`;
}

function updateSoundBtn() {
  const btn = document.getElementById('sound-btn');
  if (!btn) return;
  btn.textContent = gameState.soundEnabled ? '🔊 サウンド ON' : '🔇 サウンド OFF';
  btn.style.opacity = gameState.soundEnabled ? '1' : '0.5';
}

// ========== スーツ更新 ==========

function updateSuit(suit) {
  gameState.suit = suit;
  const el = document.getElementById('character-img');
  const equippedSkin = gameState.equippedSkin
    ? GACHA_SKINS.find(s => s.id === gameState.equippedSkin)
    : null;
  const borderSuit = equippedSkin?.rarity === 'UR' ? 'ur' : equippedSkin?.rarity === 'SSR' ? 'rainbow' : suit;
  el.className = `suit-${borderSuit}`;
  if (gameState.isAwakened) el.classList.add('awakened');
  applyCharacterSprite(suit);
}

// ========== タップ処理 ==========

let tapLocked = false;

function onTap(e) {
  if (e.cancelable) e.preventDefault();
  if (tapLocked) return;
  tapLocked = true;
  setTimeout(() => { tapLocked = false; }, 50);

  const awakenMult   = gameState.isAwakened ? 5 * getPrestigeBonus('awakenMult') : 1;
  const eventMult    = gameState.eventTapMult ?? 1;
  const tapBoostMult = isEffectActive('tap_boost') ? 10 : 1;
  const petTapMult   = getPetMultiplier().tap;
  const upgradeCritRate = UPGRADES.reduce((s, u) => s + (u.critRateBonus ?? 0) * (gameState.upgrades[u.id] ?? 0), 0);
  const upgradeCritMult = UPGRADES.reduce((s, u) => s + (u.critMultBonus ?? 0) * (gameState.upgrades[u.id] ?? 0), 0);
  const critRate     = 0.05 + getPrestigeBonus('critRate') + upgradeCritRate;
  const critMult     = 3    + getPrestigeBonus('critMult') + upgradeCritMult;
  const isCritical   = Math.random() < critRate;
  const gained       = gameState.tapPower * awakenMult * eventMult * tapBoostMult * petTapMult * (isCritical ? critMult : 1);

  gameState.moku      += gained;
  gameState.totalMoku += gained;
  gameState.tapCount   = (gameState.tapCount ?? 0) + 1;

  gameState.awakenGauge = Math.min(100, (gameState.awakenGauge ?? 0) + 0.1 + (gameState.upgrades?.['awaken_gauge'] ?? 0) * 0.05);

  playSound(isCritical ? 'critical' : gained >= TAP_EFFECT_THRESHOLDS.large ? 'tapLarge' : 'tap');
  spawnFloatText(e, `+${fmt(gained)}`, isCritical);
  spawnTapEffect(e, gained, isCritical);

  const el = document.getElementById('character-img');
  el.classList.add('tapped');
  setTimeout(() => el.classList.remove('tapped'), 90);

  updateDisplay();
}

function spawnFloatText(e, text, isCritical = false) {
  const el = document.createElement('span');
  el.className = isCritical ? 'float-text crit' : 'float-text';
  el.textContent = isCritical ? `${text} CRIT!` : text;
  const x = e.touches ? e.touches[0].clientX : e.clientX;
  const y = e.touches ? e.touches[0].clientY : e.clientY;
  el.style.left = `${x - 16}px`;
  el.style.top  = `${y - 20}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 750);
}

// エフェクトのしきい値（1タップ獲得量）
const TAP_EFFECT_THRESHOLDS = {
  large: 10,
};

function spawnTapEffect(e, gained, isCritical = false) {
  const fx = IMAGE_CONFIG.effects;
  const x  = e.touches ? e.touches[0].clientX : e.clientX;
  const y  = e.touches ? e.touches[0].clientY : e.clientY;

  let effectSrc;
  if (gameState.isAwakened)                       effectSrc = fx.awakened;
  else if (isCritical)                            effectSrc = fx.critical;
  else if (gained >= TAP_EFFECT_THRESHOLDS.large) effectSrc = fx.large;
  else                                            effectSrc = fx.normal;

  // メインエフェクト
  const img = document.createElement('img');
  img.className = 'tap-effect';
  img.src = effectSrc;
  img.style.left = `${x - 60}px`;
  img.style.top  = `${y - 60}px`;
  document.body.appendChild(img);
  setTimeout(() => img.remove(), 600);

  // テキストオーバーレイ（バシュ！/ 増殖！）
  const textSrc = gameState.isAwakened                       ? fx.textMuzoku
                : (isCritical || gained >= TAP_EFFECT_THRESHOLDS.large) ? fx.textBashu
                : null;
  if (textSrc) {
    const txt = document.createElement('img');
    txt.className = 'tap-text-effect';
    txt.src = textSrc;
    txt.style.left = `${x - 50}px`;
    txt.style.top  = `${y - 90}px`;
    document.body.appendChild(txt);
    setTimeout(() => txt.remove(), 700);
  }
}

// ========== 自動収益ループ（1秒ごと） ==========

function gameLoop() {
  // アクティブ効果の期限切れチェック
  const nowMs = Date.now();
  if (gameState.activeEffects) {
    for (const [key, end] of Object.entries(gameState.activeEffects)) {
      if (nowMs >= end) {
        delete gameState.activeEffects[key];
        if (key === 'auto_click') stopAutoClicker();
      }
    }
  }

  const awakenMult   = gameState.isAwakened ? 5 * getPrestigeBonus('awakenMult') : 1;
  const eventMult    = gameState.eventMpsMult ?? 1;
  const mpsBoostMult = isEffectActive('mps_boost') ? 5 : 1;
  const petMpsMult   = getPetMultiplier().mps;
  const gained       = gameState.mokuPerSecond * awakenMult * eventMult * mpsBoostMult * petMpsMult;

  gameState.moku      += gained;
  gameState.totalMoku += gained;

  // 覚醒タイマー
  if (gameState.isAwakened) {
    gameState.awakenTimer -= 1;
    if (gameState.awakenTimer <= 0) deactivateAwaken();
  }

  // イベントタイマー
  if (gameState.activeEvent) {
    gameState.activeEvent.timer -= 1;
    if (gameState.activeEvent.timer <= 0) endEvent();
  }

  // イベントクールダウン
  if (!gameState.activeEvent) {
    gameState.eventCooldown -= 1;
    if (gameState.eventCooldown <= 0) triggerRandomEvent();
  }

  // ペット進化タイマー完了検知 & 60秒未満の秒数カウントダウン更新
  for (const [typeId, pet] of Object.entries(gameState.ownedPets ?? {})) {
    if (!pet.conditionMetAt) { _petWaitingSet.delete(typeId); continue; }
    const stages = getPetStages(typeId);
    const nextStage = stages[(pet.stageIndex ?? 0) + 1];
    if (!nextStage) continue;
    const remaining = nextStage.waitHours * 3_600_000 - (nowMs - pet.conditionMetAt);
    const isReady = remaining <= 0;
    if (!isReady) {
      _petWaitingSet.add(typeId);
      if (remaining < 60_000) {
        const el = document.getElementById(`pet-countdown-${typeId}`);
        if (el) el.textContent = `⏳ 進化準備中... あと${Math.ceil(remaining / 1000)}秒`;
      }
    } else if (_petWaitingSet.has(typeId)) {
      _petWaitingSet.delete(typeId);
      renderPetSection();
    }
  }

  updateDisplay();
  updateEventDisplay();
}

// ========== 覚醒モード ==========

function activateAwaken() {
  if (gameState.awakenGauge < 100 || gameState.isAwakened) return;
  gameState.isAwakened  = true;
  gameState.awakenTimer = 10 + (gameState.upgrades?.['awaken_time'] ?? 0) * 5;
  gameState.awakenGauge = 0;
  const el = document.getElementById('character-img');
  el.classList.add('awakened');
  playSound('awaken');
}

function deactivateAwaken() {
  gameState.isAwakened  = false;
  gameState.awakenTimer = 0;
  const el = document.getElementById('character-img');
  el.classList.remove('awakened');
}

// ========== 強化購入 ==========

function buyUpgrade(upgradeId) {
  const u = UPGRADES.find(x => x.id === upgradeId);
  if (!u) return;
  const count = gameState.upgrades[u.id] ?? 0;
  if (count >= u.maxCount) return;
  const cost = getUpgradeCost(u);
  if (gameState.moku < cost) return;

  gameState.moku -= cost;
  gameState.upgrades[u.id] = count + 1;
  recalcTapPower();
  recalcMPS();
  playSound('buy');
  updateDisplay();
}

// ========== 社員購入 ==========

function buyEmployee(empId) {
  const emp = EMPLOYEES.find(x => x.id === empId);
  if (!emp) return;
  const cost = getEmployeeCost(emp);
  if (gameState.moku < cost) return;

  gameState.moku -= cost;
  gameState.employees[emp.id] = (gameState.employees[emp.id] ?? 0) + 1;
  recalcMPS();
  playSound('buy');
  updateDisplay();
}

// ========== 施設購入 ==========

function buyFacility(facilityId) {
  const f = FACILITIES.find(x => x.id === facilityId);
  if (!f) return;
  const count = gameState.facilities[f.id] ?? 0;
  if (count >= f.maxCount) return;
  const cost = getFacilityCost(f);
  if (gameState.moku < cost) return;

  gameState.moku -= cost;
  gameState.facilities[f.id] = count + 1;
  recalcTapPower();
  recalcMPS();
  playSound('buy');
  updateDisplay();
}

// ========== イベント ==========

function pickRandomEvent() {
  const pool = EVENTS.filter(e => (gameState.unlockedEvents ?? []).includes(e.id));
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

function triggerRandomEvent() {
  const ev = gameState.nextEventId
    ? (EVENTS.find(e => e.id === gameState.nextEventId) ?? pickRandomEvent())
    : pickRandomEvent();
  if (!ev) return;
  gameState.activeEvent  = { id: ev.id, timer: ev.duration };
  gameState.nextEventId  = null;

  if (ev.type === 'tap_mult')   gameState.eventTapMult = ev.value;
  if (ev.type === 'mps_mult')   gameState.eventMpsMult = ev.value;
  if (ev.type === 'all_mult')   { gameState.eventTapMult = ev.value; gameState.eventMpsMult = ev.value; }
  if (ev.type === 'moku_bonus') {
    const bonus = gameState.moku * ev.value;
    gameState.moku      += bonus;
    gameState.totalMoku += bonus;
  }
}

function endEvent() {
  gameState.activeEvent   = null;
  gameState.eventTapMult  = 1;
  gameState.eventMpsMult  = 1;
  gameState.eventCooldown = 60 + Math.floor(Math.random() * 61);
  // 次のイベントを先行決定してプレビュー表示
  const next = pickRandomEvent();
  if (next) gameState.nextEventId = next.id;
}

function updateEventDisplay() {
  // メイン画面バナー更新
  const banner    = document.getElementById('event-banner');
  const bannerIcon = document.getElementById('event-banner-icon');
  const bannerName = document.getElementById('event-banner-name');
  const bannerTimer = document.getElementById('event-banner-timer');
  if (banner) {
    if (gameState.activeEvent && gameState.activeEvent.timer > 0) {
      const ev = EVENTS.find(e => e.id === gameState.activeEvent.id);
      if (ev) {
        const isNeg = ev.value < 1 && ev.type !== 'moku_bonus';
        banner.className = isNeg ? 'event-banner-negative' : 'event-banner-positive';
        bannerIcon.textContent  = ev.icon;
        bannerName.textContent  = `イベント発生中！！ ${ev.name}`;
        bannerTimer.textContent = `残り${gameState.activeEvent.timer}秒`;
        const descEl = document.getElementById('event-banner-desc');
        if (descEl) descEl.textContent = ev.desc;
      }
    } else {
      banner.className = 'hidden';
    }
  }

  const area = document.getElementById('event-area');

  if (gameState.activeEvent && gameState.activeEvent.timer > 0) {
    const ev = EVENTS.find(e => e.id === gameState.activeEvent.id);
    if (!ev) return;
    const imgSrc = IMAGE_CONFIG.events[ev.id];
    const imgTag = imgSrc
      ? `<img class="event-illust" src="${imgSrc}" alt="${ev.name}">`
      : `<div class="event-illust-fallback">${ev.icon}</div>`;
    area.innerHTML = `
      <div id="event-active">
        ${imgTag}
        <div id="event-info">
          <div id="event-name">${ev.name}</div>
          <div id="event-desc">${ev.desc}</div>
          <div id="event-remaining">残り ${gameState.activeEvent.timer}秒</div>
        </div>
      </div>
    `;
  } else {
    const nextEv = gameState.nextEventId ? EVENTS.find(e => e.id === gameState.nextEventId) : null;
    const previewHtml = nextEv
      ? `<div class="event-next-preview">
           <span>${nextEv.icon} 次は「${nextEv.name}」</span>
           <span class="event-next-desc">${nextEv.desc}</span>
         </div>`
      : '';
    const cdText = gameState.eventCooldown > 0
      ? `次のイベントまで約 ${gameState.eventCooldown}秒`
      : '';
    area.innerHTML = `
      <p class="event-standby">イベント待機中...</p>
      ${previewHtml}
      <p id="event-cooldown-display">${cdText}</p>
    `;
  }
}

// ========== パネル描画 ==========

// 初回のみDOM生成、以降はテキスト・クラスだけ更新
function renderUpgradeList() {
  const container = document.getElementById('upgrade-list');
  if (!container) return;

  if (!container.dataset.initialized) {
    container.className = 'item-list';
    for (const u of UPGRADES) {
      const btn = document.createElement('button');
      btn.id = `upgrade-btn-${u.id}`;
      btn.addEventListener('click', () => buyUpgrade(u.id));
      container.appendChild(btn);
    }
    container.dataset.initialized = '1';
  }

  for (const u of UPGRADES) {
    const count  = gameState.upgrades[u.id] ?? 0;
    const cost   = getUpgradeCost(u);
    const maxed  = count >= u.maxCount;
    const canBuy = !maxed && gameState.moku >= cost;
    const btn    = document.getElementById(`upgrade-btn-${u.id}`);

    // カウントドット（10個を5個ずつ2行で表示）
    const dots = Array.from({ length: u.maxCount }, (_, i) =>
      `<div class="item-count-dot${i < count ? ' filled' : ''}"></div>`
    ).join('');

    btn.className = `item-btn${canBuy ? ' can-buy' : ''}${maxed ? ' maxed' : ''}`;
    btn.innerHTML = `
      <div class="item-icon">${u.icon}</div>
      <div class="item-info">
        <div class="item-name">${u.name}</div>
        <div class="item-desc">${u.desc}</div>
        <div class="item-count-bar">${dots}</div>
      </div>
      <div class="item-right">
        <div class="item-cost">${maxed ? 'MAX' : fmt(cost) + ' 藻'}</div>
        <div class="item-count-label">${count} / ${u.maxCount}</div>
      </div>
    `;
  }
}

function renderEmployeeList() {
  const container = document.getElementById('employee-list');
  if (!container) return;

  if (!container.dataset.initialized) {
    container.className = 'item-list';
    for (const emp of EMPLOYEES) {
      const btn = document.createElement('button');
      btn.id = `employee-btn-${emp.id}`;
      btn.addEventListener('click', () => buyEmployee(emp.id));
      container.appendChild(btn);
    }
    container.dataset.initialized = '1';
  }

  for (const emp of EMPLOYEES) {
    const count  = gameState.employees[emp.id] ?? 0;
    const cost   = getEmployeeCost(emp);
    const canBuy = gameState.moku >= cost;
    const btn    = document.getElementById(`employee-btn-${emp.id}`);

    const iconStyle = getEmployeeIconStyle(emp.id);
    btn.className = `item-btn${canBuy ? ' can-buy' : ''}`;
    btn.innerHTML = `
      <div class="item-icon" style="${iconStyle}">${iconStyle ? '' : emp.icon}</div>
      <div class="item-info">
        <div class="item-name">${emp.name}</div>
        <div class="item-desc">+${emp.mpsBonus} / 秒</div>
      </div>
      <div class="item-right">
        <div class="item-cost">${fmt(cost)} 藻</div>
        <div class="item-count-label">所持 ${count}体</div>
      </div>
    `;
  }
}

function renderFacilityList() {
  const container = document.getElementById('facility-list');
  if (!container) return;

  if (!container.dataset.initialized) {
    container.className = 'item-list';
    for (const f of FACILITIES) {
      const btn = document.createElement('button');
      btn.id = `facility-btn-${f.id}`;
      btn.addEventListener('click', () => buyFacility(f.id));
      container.appendChild(btn);
    }
    container.dataset.initialized = '1';
  }

  for (const f of FACILITIES) {
    const count  = gameState.facilities[f.id] ?? 0;
    const cost   = getFacilityCost(f);
    const maxed  = count >= f.maxCount;
    const canBuy = !maxed && gameState.moku >= cost;
    const btn    = document.getElementById(`facility-btn-${f.id}`);

    const iconStyle = getFacilityIconStyle(f.id);
    const dots = Array.from({ length: f.maxCount }, (_, i) =>
      `<div class="item-count-dot${i < count ? ' filled' : ''}"></div>`
    ).join('');

    btn.className = `item-btn${canBuy ? ' can-buy' : ''}${maxed ? ' maxed' : ''}`;
    btn.innerHTML = `
      <div class="item-icon" style="${iconStyle}">${iconStyle ? '' : f.icon}</div>
      <div class="item-info">
        <div class="item-name">${f.name}</div>
        <div class="item-desc">${f.desc}</div>
        <div class="item-count-bar">${dots}</div>
      </div>
      <div class="item-right">
        <div class="item-cost">${maxed ? 'MAX' : fmt(cost) + ' 藻'}</div>
        <div class="item-count-label">${count} / ${f.maxCount}</div>
      </div>
    `;
  }
}

// ========== 消費アイテム処理 ==========

function isEffectActive(effectId) {
  const end = gameState.activeEffects?.[effectId];
  return end != null && Date.now() < end;
}

function getEffectRemaining(effectId) {
  const end = gameState.activeEffects?.[effectId];
  if (!end) return 0;
  return Math.max(0, Math.ceil((end - Date.now()) / 1000));
}

function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}秒`;
}

let _autoClickerTimer = null;

function getCharacterCenter() {
  const el   = document.getElementById('character-img');
  const rect = el ? el.getBoundingClientRect() : { left: 150, top: 300, width: 180, height: 260 };
  const jitter = () => (Math.random() - 0.5) * 60;
  return { clientX: rect.left + rect.width / 2 + jitter(), clientY: rect.top + rect.height / 2 + jitter() };
}

function startAutoClicker() {
  if (_autoClickerTimer) return;
  _autoClickerTimer = setInterval(() => {
    if (!isEffectActive('auto_click')) {
      stopAutoClicker();
      return;
    }
    const awakenMult   = gameState.isAwakened ? 5 * getPrestigeBonus('awakenMult') : 1;
    const eventMult    = gameState.eventTapMult ?? 1;
    const tapBoostMult = isEffectActive('tap_boost') ? 10 : 1;
    const gained       = gameState.tapPower * awakenMult * eventMult * tapBoostMult;
    gameState.moku      += gained;
    gameState.totalMoku += gained;
    gameState.awakenGauge = Math.min(100, (gameState.awakenGauge ?? 0) + 1);

    const fakeE = getCharacterCenter();
    spawnFloatText(fakeE, `+${fmt(gained)}`);
    spawnTapEffect(fakeE, gained, false);
  }, 500); // 500ms = 2回/秒
}

function stopAutoClicker() {
  if (_autoClickerTimer) {
    clearInterval(_autoClickerTimer);
    _autoClickerTimer = null;
  }
}

function useConsumable(itemId) {
  const item  = CONSUMABLE_ITEMS.find(x => x.id === itemId);
  if (!item) return;
  const count = gameState.consumables?.[itemId] ?? 0;
  if (count <= 0) return;

  gameState.consumables[itemId] = count - 1;

  if (item.type === 'timed') {
    const now      = Date.now();
    const existing = gameState.activeEffects?.[item.effect] ?? 0;
    const base     = existing > now ? existing : now;
    gameState.activeEffects = {
      ...(gameState.activeEffects ?? {}),
      [item.effect]: base + item.duration * 1000,
    };
    if (item.effect === 'auto_click') startAutoClicker();
  } else if (item.effect === 'moku_storm') {
    const gained = Math.floor(gameState.mokuPerSecond * 300);
    gameState.moku      += gained;
    gameState.totalMoku += gained;
  } else if (item.effect === 'gacha') {
    doGachaPull(1, true);
  }

  playSound('buy');
  updateDisplay();
}

function buyConsumable(itemId) {
  const item = CONSUMABLE_ITEMS.find(x => x.id === itemId);
  if (!item) return;
  if ((gameState.mokuCoins ?? 0) < item.cost) return;
  if (!confirm(`「${item.name}」を${item.cost}藻コインで購入しますか？`)) return;

  gameState.mokuCoins  = (gameState.mokuCoins  ?? 0) - item.cost;
  gameState.consumables = {
    ...(gameState.consumables ?? {}),
    [itemId]: (gameState.consumables?.[itemId] ?? 0) + 1,
  };
  playSound('buy');
  updateDisplay();
}

const DAILY_INTERVAL_MS = 12 * 60 * 60 * 1000; // 12時間

function timeUntilNextClaim() {
  const last = gameState.lastDailyLogin ?? 0;
  const next = last + DAILY_INTERVAL_MS;
  const diffMs  = Math.max(0, next - Date.now());
  const hours   = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return hours > 0 ? `${hours}時間${minutes}分後` : `${minutes}分後`;
}

function getDailyCoins() {
  const base = gameState.hasRegistered ? 5 : DAILY_COINS;
  const petCoinMult = getPetMultiplier().coin;
  return Math.floor(base * petCoinMult);
}

function claimDailyCoins() {
  const last = gameState.lastDailyLogin ?? 0;
  if (Date.now() - last < DAILY_INTERVAL_MS) return;
  gameState.lastDailyLogin = Date.now();
  const coins = getDailyCoins();
  gameState.mokuCoins = (gameState.mokuCoins ?? 0) + coins;
  saveGame();
  document.getElementById('daily-modal-body').textContent = `🪙 藻コイン ×${coins} を受け取りました！`;
  playSound('buy');
  updateDisplay();
  document.getElementById('daily-modal').classList.remove('hidden');
}

function checkDailyOnStartup() {
  const last = gameState.lastDailyLogin ?? 0;
  if (Date.now() - last >= DAILY_INTERVAL_MS) {
    claimDailyCoins();
  }
}

function exchangeStonesForCoins() {
  // 10石=1コインを1回分だけ交換
  if ((gameState.prestigeStones ?? 0) < COINS_PER_STONE) return;
  gameState.prestigeStones -= COINS_PER_STONE;
  gameState.mokuCoins = (gameState.mokuCoins ?? 0) + 1;
  saveGame();
  playSound('buy');
  updateDisplay();
}

function updateCoinDisplay() {
  const el = document.getElementById('coin-display');
  const coinImg = `<img class="mocoin-icon" src="assets/ui/mocoin.png" alt="藻コイン">`;
  if (el) el.innerHTML = `${coinImg} ${gameState.mokuCoins ?? 0}`;

  const balEl = document.getElementById('coin-balance-val');
  if (balEl) balEl.innerHTML = `${coinImg} ${gameState.mokuCoins ?? 0} コイン`;

  const last     = gameState.lastDailyLogin ?? 0;
  const claimed  = Date.now() - last < DAILY_INTERVAL_MS;
  const dailyBtn = document.getElementById('daily-claim-btn');
  if (dailyBtn) {
    dailyBtn.disabled      = claimed;
    dailyBtn.textContent   = claimed
      ? `📅 受取済み (次回: ${timeUntilNextClaim()})`
      : `📅 デイリー +${getDailyCoins()}`;
    dailyBtn.style.opacity = claimed ? '0.5' : '1';
  }

  const stones = gameState.prestigeStones ?? 0;
  const canEx  = stones >= COINS_PER_STONE;
  const exBtn  = document.getElementById('stone-exchange-btn');
  if (exBtn) {
    exBtn.disabled      = !canEx;
    exBtn.textContent   = canEx
      ? `🔄 10転生石 → 1コイン (残${stones}石)`
      : `🔄 転生石→コイン (10石=1)`;
    exBtn.style.opacity = canEx ? '1' : '0.4';
  }
}

function updateActiveEffectsBar() {
  const bar = document.getElementById('active-effects-bar');
  if (!bar) return;

  const badges = CONSUMABLE_ITEMS
    .filter(item => item.type === 'timed' && isEffectActive(item.effect))
    .map(item => {
      const rem = getEffectRemaining(item.effect);
      return `<div class="effect-badge">${item.icon} ${item.name} ${fmtTime(rem)}</div>`;
    });

  bar.innerHTML = badges.join('');
  bar.style.display = badges.length > 0 ? 'flex' : 'none';
}

function renderConsumableList() {
  const container = document.getElementById('consumable-list');
  if (!container) return;

  if (!container.dataset.initialized) {
    container.className = 'item-list';
    for (const item of CONSUMABLE_ITEMS) {
      const row = document.createElement('div');
      row.className = 'consumable-row';
      row.id = `consumable-row-${item.id}`;

      const buyBtn = document.createElement('button');
      buyBtn.id = `consumable-buy-${item.id}`;
      buyBtn.addEventListener('click', () => buyConsumable(item.id));

      const useBtn = document.createElement('button');
      useBtn.id = `consumable-use-${item.id}`;
      useBtn.className = 'consumable-use-btn';
      useBtn.addEventListener('click', () => useConsumable(item.id));

      row.appendChild(buyBtn);
      row.appendChild(useBtn);
      container.appendChild(row);
    }
    container.dataset.initialized = '1';
  }

  for (const item of CONSUMABLE_ITEMS) {
    const count   = gameState.consumables?.[item.id] ?? 0;
    const canBuy  = (gameState.mokuCoins ?? 0) >= item.cost;
    const active  = item.type === 'timed' && isEffectActive(item.effect);
    const rem     = active ? fmtTime(getEffectRemaining(item.effect)) : '';

    const buyBtn = document.getElementById(`consumable-buy-${item.id}`);
    const useBtn = document.getElementById(`consumable-use-${item.id}`);

    buyBtn.className = `item-btn${canBuy ? ' can-buy' : ''}`;
    buyBtn.innerHTML = `
      <div class="item-icon" style="font-size:1.6rem">${item.icon}</div>
      <div class="item-info">
        <div class="item-name">${item.name}</div>
        <div class="item-desc">${item.desc}</div>
        ${active ? `<div class="effect-active-label">発動中 残り${rem}</div>` : ''}
      </div>
      <div class="item-right">
        <div class="item-cost"><img class="mocoin-icon" src="assets/ui/mocoin.png" alt="藻コイン"> ${item.cost}</div>
        <div class="consumable-count">× ${count}</div>
      </div>
    `;

    useBtn.disabled    = count <= 0;
    useBtn.textContent = count > 0 ? '使用' : '---';
    useBtn.style.opacity = count > 0 ? '1' : '0.35';
  }
}

// ========== アイテム ==========

function buyItem(itemId) {
  const item = ITEMS.find(x => x.id === itemId);
  if (!item) return;

  const purchased = (gameState.purchasedItems ?? []).includes(itemId);

  if (!purchased) {
    if (gameState.moku < item.cost) return;
    gameState.moku -= item.cost;
    gameState.purchasedItems = [...(gameState.purchasedItems ?? []), itemId];
    gameState.equippedItems  = [...(gameState.equippedItems  ?? []), itemId];
    playSound('buy');
  } else {
    const equipped = (gameState.equippedItems ?? []).includes(itemId);
    gameState.equippedItems = equipped
      ? (gameState.equippedItems ?? []).filter(id => id !== itemId)
      : [...(gameState.equippedItems ?? []), itemId];
  }

  updateItemOverlays();
  updateDisplay();
}

function updateItemOverlays() {
  const container = document.getElementById('item-overlays');
  if (!container) return;
  container.innerHTML = '';

  const equipped = gameState.equippedItems ?? [];
  const trophies = [];

  for (const item of ITEMS) {
    if (!equipped.includes(item.id)) continue;
    const src = IMAGE_CONFIG.items[item.id];
    if (!src) continue;

    if (item.overlayPos === 'trophy') {
      trophies.push({ src, name: item.name });
    } else {
      const img = document.createElement('img');
      img.src = src;
      img.className = `item-overlay item-overlay-${item.overlayPos}`;
      img.alt = item.name;
      container.appendChild(img);
    }
  }

  if (trophies.length > 0) {
    const shelf = document.createElement('div');
    shelf.className = 'trophy-shelf';
    trophies.forEach(({ src, name }) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = name;
      shelf.appendChild(img);
    });
    container.appendChild(shelf);
  }
}

// ========== ペット購入・進化・表示 ==========

function buyEgg(typeId) {
  const type = PET_TYPES.find(t => t.id === typeId);
  if (!type) return;
  if ((gameState.ownedPets ?? {})[typeId]) { alert('すでに持っています！'); return; }
  if (type.buyCost.type === 'coins') {
    if ((gameState.mokuCoins ?? 0) < type.buyCost.amount) return;
    gameState.mokuCoins -= type.buyCost.amount;
  } else if (type.buyCost.type === 'moku') {
    if ((gameState.moku ?? 0) < type.buyCost.amount) return;
    gameState.moku -= type.buyCost.amount;
  } else {
    if ((gameState.prestigeStones ?? 0) < type.buyCost.amount) return;
    gameState.prestigeStones -= type.buyCost.amount;
  }
  if (!gameState.ownedPets) gameState.ownedPets = {};
  gameState.ownedPets[typeId] = { stageIndex: 0, conditionMetAt: null };
  if (!gameState.activePetType) gameState.activePetType = typeId;
  playSound('buy');
  saveGame();
  renderPetEggShop();
  renderPetSection();
  renderPetZukan();
  updateDisplay();
}

function switchPet(typeId, slot = 1) {
  if (!(gameState.ownedPets ?? {})[typeId]) return;
  if (slot === 2) {
    if (gameState.activePetType2 === typeId) { gameState.activePetType2 = null; }
    else { if (gameState.activePetType === typeId) gameState.activePetType = null; gameState.activePetType2 = typeId; }
  } else {
    if (gameState.activePetType === typeId) { gameState.activePetType = null; }
    else { if (gameState.activePetType2 === typeId) gameState.activePetType2 = null; gameState.activePetType = typeId; }
  }
  saveGame();
  renderPetEggShop();
  renderPetSection();
  updateDisplay();
}

function tryEvolvePet(slot = 1) {
  const typeId = slot === 2 ? gameState.activePetType2 : gameState.activePetType;
  if (!typeId) return;
  const pet = (gameState.ownedPets ?? {})[typeId];
  const petStages = getPetStages(typeId);
  if (!pet || pet.stageIndex >= petStages.length - 1) return;
  const nextStage = petStages[pet.stageIndex + 1];
  const cond = nextStage.condition;

  if (!pet.conditionMetAt) {
    if (cond.prestigeMin && (gameState.prestigeLevel ?? 0) < cond.prestigeMin) {
      alert(`転生${cond.prestigeMin}回以上が必要です！`); return;
    }
    if (gameState.moku < cond.mokuCost) {
      alert(`藻が足りません！${fmt(cond.mokuCost)} 藻必要です`); return;
    }
    gameState.moku -= cond.mokuCost;
    pet.conditionMetAt = Date.now();
    playSound('buy');
    saveGame();
    renderPetSection();
    updateDisplay();
    return;
  }

  const waitMs = nextStage.waitHours * 3600 * 1000;
  if (Date.now() - pet.conditionMetAt < waitMs) return;

  pet.stageIndex += 1;
  pet.conditionMetAt = null;
  playSound('levelup');
  saveGame();
  renderPetSection();
  renderPetEggShop();
  renderPetZukan();
  updateDisplay();
  showEvolveModal(typeId, pet.stageIndex);
}

function setPetDisplayStage(typeId, stageIndex) {
  const pet = (gameState.ownedPets ?? {})[typeId];
  if (!pet) return;
  if (stageIndex < 0 || stageIndex > (pet.stageIndex ?? 0)) return;
  pet.displayStageIndex = stageIndex;
  saveGame();
  renderPetSection();
}

function unlockPetSlot2() {
  const PRESTIGE_REQ = 5;
  const MOKU_COST    = 500_000_000;
  if ((gameState.prestigeLevel ?? 0) < PRESTIGE_REQ) {
    alert(`転生を${PRESTIGE_REQ}回以上行う必要があります！`); return;
  }
  if ((gameState.moku ?? 0) < MOKU_COST) {
    alert(`藻が足りません！（必要: ${fmt(MOKU_COST)}）`); return;
  }
  gameState.moku -= MOKU_COST;
  gameState.petSlot2Unlocked = true;
  saveGame();
  updateDisplay();
  renderPetSection();
  renderPetEggShop();
  alert('🎉 ペットスロット2が解放されました！2体同時に効果が発動します！');
}

// ========== お知らせ ==========

function hasUnreadUpdate() {
  const lastRead = localStorage.getItem('mzk_last_read_update');
  return UPDATE_LOG.length > 0 && UPDATE_LOG[0].id !== lastRead;
}

function updateNoticeBadge() {
  const badge = document.getElementById('notice-badge');
  if (badge) badge.classList.toggle('hidden', !hasUnreadUpdate());
}

function openNoticeModal() {
  const modal = document.getElementById('notice-modal');
  if (!modal) return;

  const listEl = document.getElementById('notice-list');
  listEl.innerHTML = '';

  const lastRead = gameState.lastReadUpdateId;
  let foundRead = false;

  for (const entry of UPDATE_LOG) {
    const isUnread = !foundRead && entry.id !== lastRead;
    if (entry.id === lastRead) foundRead = true;

    const card = document.createElement('div');
    card.className = `notice-card${isUnread ? ' unread' : ''}`;
    card.innerHTML = `
      <div class="notice-card-header">
        <span class="notice-version">${entry.id}</span>
        <span class="notice-date">${entry.date}</span>
        ${isUnread ? '<span class="notice-new-badge">NEW</span>' : ''}
      </div>
      <div class="notice-title">${entry.title}</div>
      <ul class="notice-items">
        ${entry.items.map(i => `<li>${i}</li>`).join('')}
      </ul>
    `;
    listEl.appendChild(card);
  }

  modal.classList.remove('hidden');

  // 既読にする（クラウド同期に影響されないよう独立キーで保存）
  localStorage.setItem('mzk_last_read_update', UPDATE_LOG[0].id);
  updateNoticeBadge();
}

function showEvolveModal(typeId, stageIndex) {
  const type  = PET_TYPES.find(t => t.id === typeId);
  const stage = getPetStages(typeId)[stageIndex];
  const modal = document.getElementById('pet-evolve-modal');

  document.getElementById('pet-evolve-sprite').style.cssText = getPetSpriteStyle(typeId, stageIndex);
  document.getElementById('pet-evolve-name').textContent  = `${type.icon} ${type.name}`;
  document.getElementById('pet-evolve-stage').textContent = `🌟 ${stage.name} に進化！`;

  // パーティクル生成
  const colors = ['#ffd700','#3dff7a','#ff88ff','#88ddff','#ffffff'];
  const container = document.getElementById('pet-evolve-particles');
  container.innerHTML = '';
  for (let i = 0; i < 24; i++) {
    const p = document.createElement('div');
    p.className = 'evolve-particle';
    p.style.cssText = [
      `left:50%`, `top:50%`,
      `background:${colors[i % colors.length]}`,
      `--tx:${(Math.random()-0.5)*300}px`,
      `--ty:${(Math.random()-0.5)*300}px`,
      `animation-delay:${Math.random()*0.3}s`,
      `animation-duration:${0.8+Math.random()*0.6}s`,
    ].join(';');
    container.appendChild(p);
  }

  // フラッシュリセット（再アニメーション用）
  const flash = document.getElementById('pet-evolve-flash');
  flash.style.animation = 'none';
  flash.offsetHeight; // reflow
  flash.style.animation = '';

  modal.classList.remove('hidden');
  document.getElementById('pet-evolve-ok').onclick = () => modal.classList.add('hidden');
}

function renderPetZukan() {
  const container = document.getElementById('pet-zukan');
  if (!container) return;
  const owned = gameState.ownedPets ?? {};
  container.innerHTML = '';

  for (const type of PET_TYPES) {
    const pet       = owned[type.id];
    const maxStage  = pet ? (pet.stageIndex ?? 0) : -1;

    const row = document.createElement('div');
    row.className = 'zukan-row';
    row.innerHTML = `<div class="zukan-type-name">${type.icon} ${type.name}</div>`;

    const cells = document.createElement('div');
    cells.className = 'zukan-cells';

    const typeStages = getPetStages(type.id);
    for (let i = 0; i < typeStages.length; i++) {
      const stage     = typeStages[i];
      const unlocked  = maxStage >= i;
      const cell      = document.createElement('div');
      cell.className  = `zukan-cell${unlocked ? ' unlocked' : ' locked'}`;

      if (unlocked) {
        cell.style.cssText = getPetSpriteStyle(type.id, i);
        cell.title = `${type.name} - ${stage.name}`;
      } else {
        cell.innerHTML = '<span class="zukan-lock">？</span>';
      }

      const label = document.createElement('div');
      label.className = 'zukan-cell-label';
      label.textContent = unlocked ? stage.name : '？？？';
      cell.appendChild(label);
      cells.appendChild(cell);
    }

    row.appendChild(cells);
    container.appendChild(row);
  }
}

function renderPetEggShop() {
  const container = document.getElementById('pet-egg-shop');
  if (!container) return;
  const owned   = gameState.ownedPets ?? {};
  const active  = gameState.activePetType;
  const active2 = gameState.activePetType2;
  const slot2   = gameState.petSlot2Unlocked;
  container.innerHTML = '';

  for (const type of PET_TYPES) {
    const isOwned  = !!owned[type.id];
    const isActive1 = active  === type.id;
    const isActive2 = active2 === type.id;
    const canAfford = type.buyCost.type === 'coins'
      ? (gameState.mokuCoins ?? 0) >= type.buyCost.amount
      : type.buyCost.type === 'moku'
        ? (gameState.moku ?? 0) >= type.buyCost.amount
        : (gameState.prestigeStones ?? 0) >= type.buyCost.amount;
    const costLabel = type.buyCost.type === 'coins'
      ? `<img class="mocoin-icon" src="assets/ui/mocoin.png" alt="藻コイン"> ${type.buyCost.amount} コイン`
      : type.buyCost.type === 'moku'
        ? `🌿 ${fmt(type.buyCost.amount)} 藻`
        : `<img class="prestige-stone-icon" src="assets/prestige/prestige_stone.png" alt="転生石"> ${type.buyCost.amount} 転生石`;

    const stageIndex = isOwned ? (owned[type.id].stageIndex ?? 0) : 0;
    const stageName  = isOwned ? getPetStages(type.id)[stageIndex].name : '未入手';

    let btnHtml;
    if (!isOwned) {
      const dis = !canAfford ? ' disabled' : '';
      btnHtml = `<button class="pet-egg-btn${dis}" ${dis ? 'disabled' : ''} data-action="buy">購入</button>`;
    } else if (slot2) {
      const s1Class = isActive1 ? ' active' : '';
      const s2Class = isActive2 ? ' active' : '';
      btnHtml = `
        <div class="pet-slot-btns">
          <button class="pet-egg-btn${s1Class}" data-action="slot1">${isActive1 ? '✅ S1' : 'S1'}</button>
          <button class="pet-egg-btn${s2Class}" data-action="slot2">${isActive2 ? '✅ S2' : 'S2'}</button>
        </div>`;
    } else {
      const s1Class = isActive1 ? ' active' : '';
      btnHtml = `<button class="pet-egg-btn${s1Class}" ${isActive1 ? 'disabled' : ''} data-action="slot1">${isActive1 ? '✅ 育成中' : '切り替え'}</button>`;
    }

    const card = document.createElement('div');
    card.className = `pet-egg-card${isActive1 || isActive2 ? ' is-active' : ''}`;
    card.innerHTML = `
      <div class="pet-egg-sprite" style="${getPetSpriteStyle(type.id, stageIndex)}"></div>
      <div class="pet-egg-info">
        <div class="pet-egg-name">${type.icon} ${type.name}</div>
        <div class="pet-egg-effect">${type.effectDesc}</div>
        <div class="pet-egg-cost">${isOwned ? `現在: ${stageName}` : costLabel}</div>
      </div>
      ${btnHtml}
    `;
    card.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'buy')   buyEgg(type.id);
        if (action === 'slot1') switchPet(type.id, 1);
        if (action === 'slot2') switchPet(type.id, 2);
      });
    });
    container.appendChild(card);
  }
}

function buildPetSlotHtml(typeId, slot) {
  const pet = typeId ? (gameState.ownedPets ?? {})[typeId] : null;
  if (!pet) return `<p class="section-note">下のショップからペットを選んでスロット${slot}に装備しよう！</p>`;

  const type      = PET_TYPES.find(t => t.id === typeId);
  const stages    = getPetStages(typeId);
  const stage     = stages[pet.stageIndex];
  const nextStage = stages[pet.stageIndex + 1];
  const mult      = stage.mult;
  const effectLabel = type.effectType === 'tap' ? 'タップ倍率'
    : type.effectType === 'mps' ? 'MPS倍率' : 'デイリー藻コイン倍率';

  let evolveHtml = '';
  if (nextStage) {
    const cond = nextStage.condition;
    if (pet.conditionMetAt) {
      const waitMs    = nextStage.waitHours * 3600 * 1000;
      const remaining = waitMs - (Date.now() - pet.conditionMetAt);
      if (remaining <= 0) {
        evolveHtml = `
          <p class="pet-evolve-ready">✨ 進化の準備完了！</p>
          <button class="pet-evolve-btn ready" id="pet-evolve-btn-${slot}" data-slot="${slot}">👑 進化！</button>`;
      } else {
        const timeLabel = remaining < 3_600_000
          ? `${Math.ceil(remaining / 60_000)}分`
          : `${Math.ceil(remaining / 3_600_000)}時間`;
        evolveHtml = `<p class="pet-evolve-waiting" id="pet-countdown-${typeId}">⏳ 進化準備中... あと約${timeLabel}</p>`;
      }
    } else {
      const prestigeOk = !cond.prestigeMin || (gameState.prestigeLevel ?? 0) >= cond.prestigeMin;
      const mokuOk     = gameState.moku >= cond.mokuCost;
      const canEvolve  = prestigeOk && mokuOk;
      let condText = `藻 ${fmt(cond.mokuCost)} を消費`;
      if (cond.prestigeMin) condText += ` + 転生${cond.prestigeMin}回以上`;
      condText += ` → ${nextStage.waitHours}時間待機後に進化`;
      evolveHtml = `
        <p class="pet-evolve-cond">${condText}</p>
        <button class="pet-evolve-btn${canEvolve ? '' : ' disabled'}" id="pet-evolve-btn-${slot}" data-slot="${slot}" ${canEvolve ? '' : 'disabled'}>
          🌱 進化準備する
        </button>`;
    }
  } else {
    evolveHtml = '<p class="pet-evolve-cond">👑 最終進化形態です</p>';
  }

  const displayIdx = pet.displayStageIndex ?? pet.stageIndex;
  let skinSelectorHtml = '';
  if (pet.stageIndex > 0) {
    const thumbs = stages.slice(0, pet.stageIndex + 1).map((s, i) => `
      <div class="pet-skin-thumb${i === displayIdx ? ' active' : ''}"
           style="${getPetSpriteStyle(typeId, i)}"
           data-type="${typeId}" data-idx="${i}" title="${s.name}"></div>
    `).join('');
    skinSelectorHtml = `<div class="pet-skin-selector"><span class="pet-skin-label">見た目</span>${thumbs}</div>`;
  }

  return `
    <div class="pet-card">
      <div class="pet-sprite" style="${getPetSpriteStyle(typeId, displayIdx)}"></div>
      <div class="pet-info">
        <div class="pet-name">${type.icon} ${type.name}</div>
        <div class="pet-stage-badge">${stage.name}</div>
        <div class="pet-effect-label">${effectLabel} × ${mult}</div>
      </div>
    </div>
    ${skinSelectorHtml}
    <div class="pet-evolve-section">${evolveHtml}</div>
  `;
}

function renderPetSection() {
  const container = document.getElementById('pet-section');
  if (!container) return;
  const typeId  = gameState.activePetType;
  const typeId2 = gameState.activePetType2;

  const hasAnyPet = Object.keys(gameState.ownedPets ?? {}).length > 0;
  const slot1Html = (gameState.ownedPets ?? {})[typeId]
    ? buildPetSlotHtml(typeId, 1)
    : `<p class="section-note">${hasAnyPet ? '下のショップからペットを選んで装備しよう！' : '下のショップから卵を購入してペットを育てよう！'}</p>`;

  let slot2Html;
  if (!gameState.petSlot2Unlocked) {
    const prestige = gameState.prestigeLevel ?? 0;
    const canUnlock = prestige >= 5;
    slot2Html = `
      <div class="pet-slot2-lock">
        <p class="section-note">🔒 スロット2（転生5回 + 🌿500M藻で解放）</p>
        <p class="section-note" style="font-size:11px">2体同時に効果発動！</p>
        <button class="pet-unlock-slot2-btn${canUnlock ? '' : ' disabled'}" id="pet-unlock-slot2-btn" ${canUnlock ? '' : 'disabled'}>
          ${canUnlock ? '🔓 スロット2を解放する（🌿500M藻）' : `🔒 転生${5 - prestige}回後に解放可能`}
        </button>
      </div>`;
  } else {
    slot2Html = buildPetSlotHtml(typeId2, 2);
  }

  container.innerHTML = `
    <div class="pet-slot-block">
      <div class="pet-slot-label">スロット1</div>
      ${slot1Html}
    </div>
    <div class="pet-slot-block">
      <div class="pet-slot-label">スロット2</div>
      ${slot2Html}
    </div>
  `;

  [1, 2].forEach(slot => {
    const btn = document.getElementById(`pet-evolve-btn-${slot}`);
    if (btn && !btn.disabled) btn.addEventListener('click', () => tryEvolvePet(slot));
  });

  container.querySelectorAll('.pet-skin-thumb').forEach(el => {
    el.addEventListener('click', () => setPetDisplayStage(el.dataset.type, Number(el.dataset.idx)));
  });

  const unlockBtn = document.getElementById('pet-unlock-slot2-btn');
  if (unlockBtn && !unlockBtn.disabled) unlockBtn.addEventListener('click', unlockPetSlot2);
}

function renderItemList() {
  const container = document.getElementById('item-list');
  if (!container) return;

  if (!container.dataset.initialized) {
    container.className = 'item-list';
    for (const item of ITEMS) {
      const src       = IMAGE_CONFIG.items[item.id];
      const iconStyle = src
        ? `background-image:url('${src}');background-size:contain;background-position:center;background-repeat:no-repeat;font-size:0;`
        : '';
      const btn = document.createElement('button');
      btn.id = `item-btn-${item.id}`;
      btn.innerHTML = `
        <div class="item-icon" style="${iconStyle}">${iconStyle ? '' : item.icon}</div>
        <div class="item-info">
          <div class="item-name">${item.name}</div>
          <div class="item-desc">${item.desc}</div>
        </div>
        <div class="item-right">
          <div class="item-cost"></div>
        </div>
      `;
      btn.addEventListener('click', () => buyItem(item.id));
      container.appendChild(btn);
    }
    container.dataset.initialized = '1';
  }

  for (const item of ITEMS) {
    const bought   = (gameState.purchasedItems ?? []).includes(item.id);
    const equipped = (gameState.equippedItems  ?? []).includes(item.id);
    const canBuy   = !bought && gameState.moku >= item.cost;
    const btn      = document.getElementById(`item-btn-${item.id}`);
    if (!btn) continue;

    let statusText, extraClass;
    if (!bought) {
      statusText = fmt(item.cost) + ' 藻';
      extraClass = canBuy ? ' can-buy' : '';
    } else if (equipped) {
      statusText = '✅ 装着中';
      extraClass = ' item-equipped';
    } else {
      statusText = '装着する';
      extraClass = ' item-unequipped';
    }

    const newClass = `item-btn${extraClass}`;
    if (btn.className !== newClass) btn.className = newClass;

    const costEl = btn.querySelector('.item-cost');
    if (costEl && costEl.textContent !== statusText) costEl.textContent = statusText;
  }
}

// ========== イベント解放 ==========

function buyEventUnlock(eventId) {
  const ev = EVENTS.find(e => e.id === eventId);
  if (!ev || !ev.unlockCost) return;
  if ((gameState.unlockedEvents ?? []).includes(eventId)) return;
  if (gameState.moku < ev.unlockCost) return;

  gameState.moku -= ev.unlockCost;
  gameState.unlockedEvents = [...(gameState.unlockedEvents ?? []), eventId];
  playSound('buy');
  updateDisplay();
}

function renderEventUnlockList() {
  const container = document.getElementById('event-unlock-list');
  if (!container) return;

  const lockable = EVENTS.filter(e => e.unlockCost > 0);

  if (!container.dataset.initialized) {
    container.className = 'item-list';
    for (const ev of lockable) {
      const btn = document.createElement('button');
      btn.id = `event-unlock-btn-${ev.id}`;
      btn.addEventListener('click', () => buyEventUnlock(ev.id));
      container.appendChild(btn);
    }
    container.dataset.initialized = '1';
  }

  for (const ev of lockable) {
    const unlocked = (gameState.unlockedEvents ?? []).includes(ev.id);
    const canBuy   = !unlocked && gameState.moku >= ev.unlockCost;
    const btn      = document.getElementById(`event-unlock-btn-${ev.id}`);

    btn.className = `item-btn${canBuy ? ' can-buy' : ''}${unlocked ? ' maxed' : ''}`;
    btn.innerHTML = `
      <div class="item-icon">${ev.icon}</div>
      <div class="item-info">
        <div class="item-name">${ev.name}</div>
        <div class="item-desc">${ev.desc}</div>
      </div>
      <div class="item-right">
        <div class="item-cost">${unlocked ? '✅ 解放済み' : fmt(ev.unlockCost) + ' 藻'}</div>
      </div>
    `;
  }
}

function renderUnlockedEventList() {
  const container = document.getElementById('unlocked-event-list');
  if (!container) return;
  const unlocked = gameState.unlockedEvents ?? [];
  const list = EVENTS.filter(e => unlocked.includes(e.id));
  container.innerHTML = list.map(ev => `
    <div class="unlocked-event-row">
      <span class="unlocked-event-icon">${ev.icon}</span>
      <div class="unlocked-event-info">
        <div class="unlocked-event-name">
          ${ev.name}
          ${ev.unlockCost === 0 ? '<span class="event-default-badge">基本イベント</span>' : ''}
        </div>
        <div class="unlocked-event-desc">${ev.desc}</div>
      </div>
    </div>
  `).join('');
}

// ========== ガチャ ==========

function pullOnce(pitied = false) {
  const pool  = pitied ? GACHA_SKINS.filter(s => s.rarity !== 'N') : GACHA_SKINS;
  const total = pool.reduce((s, x) => s + x.prob, 0);
  let r = Math.random() * total;
  for (const skin of pool) { r -= skin.prob; if (r <= 0) return skin; }
  return pool[pool.length - 1];
}

function doGachaPull(count = 1, free = false) {
  if (!free) {
    const cost = count === 1 ? 50 : 450;
    if ((gameState.prestigeStones ?? 0) < cost) return;
    gameState.prestigeStones -= cost;
  }

  const results = [];
  for (let i = 0; i < count; i++) {
    gameState.gachaPity = (gameState.gachaPity ?? 0) + 1;
    const pitied = gameState.gachaPity >= 10;
    const skin   = pullOnce(pitied);
    if (pitied || skin.rarity !== 'N') gameState.gachaPity = 0;
    const isNew  = !(gameState.ownedSkins ?? []).includes(skin.id);
    let dupeStones = 0;
    if (isNew) {
      gameState.ownedSkins = [...(gameState.ownedSkins ?? []), skin.id];
    } else {
      dupeStones = RARITY_DUPE_STONES[skin.rarity] ?? 1;
      gameState.prestigeStones = (gameState.prestigeStones ?? 0) + dupeStones;
    }
    results.push({ skin, isNew, dupeStones });
  }

  showGachaResult(results);
  saveGame();
  updateDisplay();
}

function showGachaResult(results) {
  const modal   = document.getElementById('gacha-result-modal');
  const content = document.getElementById('gacha-result-content');
  if (!modal || !content) return;

  content.innerHTML = results.map(({ skin, isNew, dupeStones }) => {
    const src   = IMAGE_CONFIG.character.suits[skin.suit];
    const color = RARITY_COLOR[skin.rarity];
    return `
      <div class="gacha-card${isNew ? '' : ' gacha-dupe'}" style="border-color:${color};box-shadow:0 0 12px ${color}66">
        <div class="gacha-card-rarity" style="background:${color}">${skin.rarity}</div>
        <img class="gacha-card-img" src="${src}" alt="${skin.name}">
        <div class="gacha-card-name">${skin.name}</div>
        ${isNew
          ? '<div class="gacha-card-new">NEW!</div>'
          : `<div class="gacha-card-dupe"><img class="prestige-stone-icon" src="assets/prestige/prestige_stone.png" alt=""> +${dupeStones}石</div>`}
      </div>`;
  }).join('');

  modal.classList.remove('hidden');
}

function equipSkin(skinId) {
  if (!(gameState.ownedSkins ?? []).includes(skinId)) return;
  gameState.equippedSkin = gameState.equippedSkin === skinId ? null : skinId;
  recalcTapPower();
  recalcMPS();
  updateSuit(gameState.suit);
  updateDisplay();
}

function renderGachaRates() {
  const container = document.getElementById('gacha-rates-table-container');
  if (!container) return;
  const total = GACHA_SKINS.reduce((s, x) => s + x.prob, 0);
  const rows = GACHA_SKINS.map(skin => {
    const pct  = (skin.prob / total * 100).toFixed(2);
    const color = RARITY_COLOR[skin.rarity] ?? '#888';
    const op   = skin.op ? formatSkinOp(skin.op) : '—';
    return `<tr>
      <td style="color:${color};font-weight:bold">${skin.rarity}</td>
      <td>${skin.name}</td>
      <td>${pct}%</td>
      <td>${op}</td>
    </tr>`;
  }).join('');
  container.innerHTML = `
    <table class="gacha-rates-table">
      <tr><th>レア</th><th>スキン名</th><th>排出率</th><th>効果</th></tr>
      ${rows}
    </table>`;
}

function renderSkinCollection() {
  const container = document.getElementById('skin-collection');
  if (!container) return;
  const stones = gameState.prestigeStones ?? 0;

  container.innerHTML = GACHA_SKINS.map(skin => {
    const owned    = (gameState.ownedSkins ?? []).includes(skin.id);
    const equipped = gameState.equippedSkin === skin.id;
    const src      = IMAGE_CONFIG.character.suits[skin.suit];
    const color    = RARITY_COLOR[skin.rarity];
    return `
      <div class="skin-card${owned ? '' : ' skin-locked'}" style="${owned ? `border-color:${color}` : ''}">
        <div class="skin-card-rarity" style="background:${owned ? color : '#333'}">${skin.rarity}</div>
        <img class="skin-card-img" src="${src}" alt="${skin.name}">
        <div class="skin-card-name">${skin.name}</div>
        ${skin.op ? `<div class="skin-card-op" style="color:${color}">${formatSkinOp(skin.op)}</div>` : ''}
        ${owned
          ? `<button class="skin-equip-btn${equipped ? ' equipped' : ''}" onclick="equipSkin('${skin.id}')">${equipped ? '装着中' : '装着'}</button>`
          : '<div class="skin-card-locked">未入手</div>'}
      </div>`;
  }).join('');

  // ガチャUI更新
  const pityEl = document.getElementById('gacha-pity-count');
  if (pityEl) pityEl.textContent = 10 - (gameState.gachaPity ?? 0);
  const btn1  = document.getElementById('gacha-btn-1');
  const btn10 = document.getElementById('gacha-btn-10');
  if (btn1)  btn1.disabled  = stones < 50;
  if (btn10) btn10.disabled = stones < 450;

  const tickets    = (gameState.consumables ?? {})['gacha_coin'] ?? 0;
  const ticketRow  = document.getElementById('gacha-ticket-row');
  const ticketEl   = document.getElementById('gacha-ticket-count');
  if (ticketRow) ticketRow.classList.toggle('hidden', tickets === 0);
  if (ticketEl)  ticketEl.textContent = tickets;
}

// ========== 実績システム ==========

const BADGE_SIZE = 56;
const SHEET_COLS = 6;
const SHEET_ROWS = 6;

function badgePos(col, row) {
  const x = (col / (SHEET_COLS - 1) * 100).toFixed(2);
  const y = (row / (SHEET_ROWS - 1) * 100).toFixed(2);
  return `${x}% ${y}%`;
}

const ACHIEVEMENTS = [
  // 藻収集
  { id: 'moku_1k',    name: '藻の芽吹き',    desc: '累計1,000藻を獲得',      badge: [1,0], reward: { coins: 1  }, check: gs => (gs.totalMoku ?? 0) >= 1_000 },
  { id: 'moku_100k',  name: '藻コレクター',  desc: '累計10万藻を獲得',       badge: [2,0], reward: { coins: 2  }, check: gs => (gs.totalMoku ?? 0) >= 100_000 },
  { id: 'moku_10m',   name: '藻長者',        desc: '累計1,000万藻を獲得',    badge: [3,0], reward: { coins: 5  }, check: gs => (gs.totalMoku ?? 0) >= 10_000_000 },
  { id: 'moku_1b',    name: '伝説の藻王',    desc: '累計10億藻を獲得',       badge: [4,1], reward: { stones: 5 }, check: gs => (gs.totalMoku ?? 0) >= 1_000_000_000 },
  // タップ
  { id: 'tap_100',    name: '連打入門',      desc: '100回タップ',            badge: [0,0], reward: { coins: 1  }, check: gs => (gs.tapCount ?? 0) >= 100 },
  { id: 'tap_1000',   name: '連打マン',      desc: '1,000回タップ',          badge: [0,4], reward: { coins: 2  }, check: gs => (gs.tapCount ?? 0) >= 1_000 },
  { id: 'tap_10000',  name: '連打王',        desc: '10,000回タップ',         badge: [4,2], reward: { coins: 5  }, check: gs => (gs.tapCount ?? 0) >= 10_000 },
  // 転生
  { id: 'prestige_1', name: '初転生',        desc: '初めて転生する',         badge: [3,5], reward: { coins: 5  }, check: gs => (gs.prestigeLevel ?? 0) >= 1 },
  { id: 'prestige_3', name: '転生者',        desc: '3回転生する',            badge: [3,1], reward: { coins: 10 }, check: gs => (gs.prestigeLevel ?? 0) >= 3 },
  { id: 'prestige_5', name: '転生マスター',  desc: '5回転生する',            badge: [5,1], reward: { stones: 10 }, check: gs => (gs.prestigeLevel ?? 0) >= 5 },
  // 社員・施設
  { id: 'employee_1', name: '初雇用',        desc: '社員を初めて雇う',       badge: [3,3], reward: { coins: 1  }, check: gs => Object.values(gs.employees ?? {}).some(n => n > 0) },
  { id: 'facility_1', name: '施設オーナー',  desc: '施設を初めて建設',       badge: [3,4], reward: { coins: 2  }, check: gs => Object.values(gs.facilities ?? {}).some(n => n > 0) },
  // ガチャ・ペット
  { id: 'gacha_1',    name: 'ガチャデビュー', desc: '初めてガチャを引く',    badge: [4,0], reward: { coins: 2  }, check: gs => (gs.ownedSkins ?? []).length > 1 },
  { id: 'pet_1',      name: 'ペットオーナー', desc: '初めてペットを購入',    badge: [4,4], reward: { coins: 2  }, check: gs => Object.keys(gs.ownedPets ?? {}).length > 0 },
  // アイテム
  { id: 'item_royal', name: '社長の証',      desc: 'ロイヤルハートを購入',   badge: [0,3], reward: { coins: 3  }, check: gs => (gs.purchasedItems ?? []).includes('royalheart') },
  { id: 'item_mo',    name: '藻屑界の頂点',  desc: '藻ロイヤルハートを購入', badge: [1,4], reward: { stones: 3 }, check: gs => (gs.purchasedItems ?? []).includes('mo_royalheart') },
];

let _achievementQueue = [];

function checkAchievements() {
  ACHIEVEMENTS.forEach(a => {
    if (gameState.achievements?.[a.id]) return;
    if (!a.check(gameState)) return;
    gameState.achievements = { ...gameState.achievements, [a.id]: Date.now() };
    if (a.reward.coins)  gameState.mokuCoins      = (gameState.mokuCoins ?? 0)      + a.reward.coins;
    if (a.reward.stones) gameState.prestigeStones = (gameState.prestigeStones ?? 0) + a.reward.stones;
    _achievementQueue.push(a);
    showNextAchievementPopup();
  });
}

let _popupShowing = false;
function showNextAchievementPopup() {
  if (_popupShowing || _achievementQueue.length === 0) return;
  const a = _achievementQueue.shift();
  _popupShowing = true;
  const pop = document.getElementById('achievement-popup');
  if (!pop) { _popupShowing = false; return; }
  const [col, row] = a.badge;
  pop.querySelector('.ach-pop-badge').style.backgroundPosition = badgePos(col, row);
  pop.querySelector('.ach-pop-name').textContent = a.name;
  pop.querySelector('.ach-pop-desc').textContent = a.desc;
  const rewardStr = a.reward.coins ? `+${a.reward.coins} コイン` : `+${a.reward.stones} 転生石`;
  pop.querySelector('.ach-pop-reward').textContent = rewardStr;
  pop.classList.add('show');
  setTimeout(() => {
    pop.classList.remove('show');
    setTimeout(() => { _popupShowing = false; showNextAchievementPopup(); }, 400);
  }, 3000);
}

function renderAchievementList() {
  const container = document.getElementById('achievement-list');
  if (!container) return;
  const unlocked = gameState.achievements ?? {};
  const total    = ACHIEVEMENTS.length;
  const count    = Object.keys(unlocked).length;
  document.getElementById('achievement-count').textContent = `${count} / ${total}`;
  container.innerHTML = ACHIEVEMENTS.map(a => {
    const done = !!unlocked[a.id];
    const [col, row] = a.badge;
    const pos = badgePos(col, row);
    const rewardStr = a.reward.coins ? `🪙 +${a.reward.coins}` : `✨ +${a.reward.stones}`;
    return `
      <div class="ach-card ${done ? 'ach-done' : 'ach-locked'}">
        <div class="ach-badge" style="background-position:${pos}"></div>
        <div class="ach-info">
          <div class="ach-name">${done ? a.name : '???'}</div>
          <div class="ach-desc">${done ? a.desc : '未達成'}</div>
        </div>
        <div class="ach-reward">${done ? rewardStr : '🔒'}</div>
      </div>`;
  }).join('');
}

// ========== 転生（プレステージ） ==========

function doPrestige() {
  if ((gameState.totalMoku ?? 0) < getPrestigeThreshold()) return;
  const stonesEarned = Math.min(
    Math.floor(gameState.totalMoku / 1_000_000) * getPrestigeBonus('stoneMult'),
    getPrestigeStoneCap()
  );
  const nextThreshold = (() => {
    const nextLv = (gameState.prestigeLevel ?? 0) + 1;
    return nextLv < PRESTIGE_THRESHOLDS.length ? PRESTIGE_THRESHOLDS[nextLv] : PRESTIGE_THRESHOLD_CAP;
  })();
  if (!confirm(`転生しますか？\n\n獲得: 転生石 +${stonesEarned}個\n次の転生条件: ${fmt(nextThreshold)}藻\n\n藻・強化・社員・施設・イベント解放がリセットされます。\nアイテムとスキルは引き継がれます。`)) return;

  const now   = new Date();
  const entry = {
    no:           (gameState.prestigeLevel ?? 0) + 1,
    date:         `${now.getMonth() + 1}/${now.getDate()}`,
    totalMoku:    gameState.totalMoku ?? 0,
    maxLevel:     calcLevelFromMoku(gameState.totalMoku ?? 0),
    employees:    Object.values(gameState.employees ?? {}).reduce((s, n) => s + n, 0),
    stonesEarned,
  };

  const keep = {
    purchasedItems:  gameState.purchasedItems,
    equippedItems:   gameState.equippedItems,
    prestigeLevel:   (gameState.prestigeLevel ?? 0) + 1,
    prestigeStones:  (gameState.prestigeStones ?? 0) + stonesEarned,
    prestigeSkills:  gameState.prestigeSkills,
    prestigeHistory: [...(gameState.prestigeHistory ?? []), entry],
    ownedSkins:      gameState.ownedSkins,
    equippedSkin:    gameState.equippedSkin,
    gachaPity:       gameState.gachaPity,
    mokuCoins:       gameState.mokuCoins,
    lastDailyLogin:  gameState.lastDailyLogin,
    consumables:     gameState.consumables,
    activeEffects:   gameState.activeEffects,
    hasRegistered:   gameState.hasRegistered,
    tapCount:        gameState.tapCount,
    achievements:    gameState.achievements,
    ownedPets:                gameState.ownedPets,
    activePetType:            gameState.activePetType,
    activePetType2:           gameState.activePetType2,
    petSlot2Unlocked:         gameState.petSlot2Unlocked,
    menheraMode:              gameState.menheraMode,
    soundEnabled:             gameState.soundEnabled,
    registrationBonusClaimed: gameState.registrationBonusClaimed,
    lastReadUpdateId:         gameState.lastReadUpdateId,
    usedCoupons:              gameState.usedCoupons,
    shinStones:               gameState.shinStones ?? 0,
    highlowHighScore:         gameState.highlowHighScore ?? 0,
  };

  gameState = structuredClone(DEFAULT_STATE);
  Object.assign(gameState, keep);
  _minCloudTotalMoku = 0; // 転生でtotalMokuがリセットされるのでクラウド保存ブロックを解除
  updateSuit('black');
  recalcTapPower();
  recalcMPS();
  saveGame();
  updateItemOverlays();
  updateDisplay();
  updateEventDisplay();
  updatePrestigeBar();
  renderPetEggShop();
  renderPetSection();
  showPrestigeCongrats(gameState.prestigeLevel);
}

function showPrestigeCongrats(level) {
  const toast = document.getElementById('prestige-toast');
  const msg   = document.getElementById('prestige-toast-msg');
  if (!toast || !msg) return;
  msg.textContent = `🌿 転生 Lv.${level} おめでとう！楽しんでもらえてたら社長を推してね`;
  toast.classList.remove('hidden');
  requestAnimationFrame(() => toast.classList.add('show'));
  const close = () => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 350);
  };
  document.getElementById('prestige-toast-close').onclick = close;
  setTimeout(close, 8000);
}

function buyPrestigeSkill(skillId) {
  const s  = PRESTIGE_SKILLS.find(x => x.id === skillId);
  if (!s) return;
  if (s.requirePrestige && (gameState.prestigeLevel ?? 0) < s.requirePrestige) return;
  const lv   = gameState.prestigeSkills?.[s.id] ?? 0;
  if (lv >= s.maxLevel) return;
  const cost = s.costs[lv];
  if (s.currencyType === 'shin') {
    if ((gameState.shinStones ?? 0) < cost) return;
    gameState.shinStones -= cost;
  } else {
    if ((gameState.prestigeStones ?? 0) < cost) return;
    gameState.prestigeStones -= cost;
  }
  gameState.prestigeSkills = { ...gameState.prestigeSkills, [s.id]: lv + 1 };
  recalcTapPower();
  recalcMPS();
  playSound('buy');
  updateDisplay();
}

function exchangeToShinStones(amount) {
  const stones = gameState.prestigeStones ?? 0;
  if (stones < 100) return;
  const max   = Math.floor(stones / 100);
  const count = amount === 'all' ? max : Math.min(amount, max);
  if (count < 1) return;
  gameState.prestigeStones -= count * 100;
  gameState.shinStones      = (gameState.shinStones ?? 0) + count;
  playSound('buy');
  updatePrestigeTab();
  updateDisplay();
}

function renderPrestigeSkillList() {
  const container = document.getElementById('prestige-skill-list');
  if (!container) return;

  if (!container.dataset.initialized) {
    container.className = 'item-list';
    let shinHeaderAdded = false;
    for (const s of PRESTIGE_SKILLS) {
      if (s.currencyType === 'shin' && !shinHeaderAdded) {
        const header = document.createElement('div');
        header.id = 'shin-skill-section-header';
        header.className = 'prestige-section-divider';
        header.textContent = '🌟 神話スキルツリー（神転生石）';
        container.appendChild(header);
        shinHeaderAdded = true;
      }
      const btn = document.createElement('button');
      btn.id = `pskill-btn-${s.id}`;
      btn.addEventListener('click', () => buyPrestigeSkill(s.id));
      container.appendChild(btn);
    }
    container.dataset.initialized = '1';
  }

  const prestige = gameState.prestigeLevel ?? 0;

  const shinHeader = document.getElementById('shin-skill-section-header');
  if (shinHeader) shinHeader.classList.remove('hidden');

  for (const s of PRESTIGE_SKILLS) {
    const btn    = document.getElementById(`pskill-btn-${s.id}`);
    if (!btn) continue;
    const isShin = s.currencyType === 'shin';
    btn.classList.remove('hidden');

    const locked = s.requirePrestige && prestige < s.requirePrestige;
    if (locked) {
      btn.className = 'item-btn skill-locked';
      btn.innerHTML = `
        <div class="item-icon">🔒</div>
        <div class="item-info">
          <div class="item-name">${s.name}</div>
          <div class="item-desc" style="color:#666">転生 ${s.requirePrestige} 回で解放</div>
        </div>
        <div class="item-right">
          <div class="item-cost" style="color:#555">転生 ${s.requirePrestige} 回</div>
        </div>
      `;
      continue;
    }

    const lv       = gameState.prestigeSkills?.[s.id] ?? 0;
    const maxed    = lv >= s.maxLevel;
    const cost     = maxed ? 0 : s.costs[lv];
    const owned    = isShin ? (gameState.shinStones ?? 0) : (gameState.prestigeStones ?? 0);
    const canBuy   = !maxed && owned >= cost;
    const iconSrc  = isShin ? 'assets/prestige/prestige_got_stone.png' : 'assets/prestige/prestige_stone.png';
    const iconAlt  = isShin ? '神転生石' : '転生石';
    const currency = isShin ? '神転生石' : '転生石';
    const costColor = isShin ? '#ffaa00' : '#cc88ff';
    const skillIcon = isShin ? '🌟' : '✨';

    const descText = (s.id === 'pStoneCap' || s.id === 'pStoneCap2')
      ? s.desc.replace('{cap}', getPrestigeStoneCap())
      : s.desc;

    const dots = Array.from({ length: s.maxLevel }, (_, i) =>
      `<div class="item-count-dot${i < lv ? ' filled' : ''}"></div>`
    ).join('');

    btn.className = `item-btn${canBuy ? ' can-buy' : ''}${maxed ? ' maxed' : ''}`;
    btn.innerHTML = `
      <div class="item-icon">${skillIcon}</div>
      <div class="item-info">
        <div class="item-name">${s.name}</div>
        <div class="item-desc">${descText}</div>
        <div class="item-count-bar">${dots}</div>
      </div>
      <div class="item-right">
        <div class="item-cost" style="color:${costColor}">${maxed ? 'MAX' : `<img class="prestige-stone-icon" src="${iconSrc}" alt="${iconAlt}"> ${cost} ${currency}`}</div>
        <div class="item-count-label">${lv} / ${s.maxLevel}</div>
      </div>
    `;
  }
}

function updatePrestigeTab() {
  const lvEl     = document.getElementById('prestige-tab-level');
  const stoneEl  = document.getElementById('prestige-tab-stones');
  const shinEl   = document.getElementById('prestige-tab-shin-stones');
  if (lvEl)    lvEl.innerHTML    = `<img class="prestige-badge-icon" src="assets/prestige/prestige_badge.png" alt=""> 転生 Lv.${gameState.prestigeLevel ?? 0}`;
  if (stoneEl) stoneEl.innerHTML = `<img class="prestige-stone-icon" src="assets/prestige/prestige_stone.png" alt="転生石"> 転生石: ${gameState.prestigeStones ?? 0}`;
  const shinVisible = (gameState.prestigeLevel ?? 0) >= 50;
  if (shinEl) {
    shinEl.classList.remove('hidden');
    shinEl.innerHTML = shinVisible
      ? `<img class="prestige-stone-icon" src="assets/prestige/prestige_got_stone.png" alt="神転生石"> 神転生石: ${gameState.shinStones ?? 0}`
      : `🔒 神転生石（転生50回で解放）`;
  }
  const shinExArea = document.getElementById('shin-exchange-area');
  if (shinExArea) {
    shinExArea.classList.remove('hidden');
    const exBtn    = document.getElementById('shin-exchange-btn');
    const exAllBtn = document.getElementById('shin-exchange-all-btn');
    const fromEl   = document.getElementById('shin-ex-from-count');
    const toEl     = document.getElementById('shin-ex-to-count');
    const allLabel = document.getElementById('shin-ex-all-label');
    const stones   = gameState.prestigeStones ?? 0;
    const canGet   = Math.floor(stones / 100);
    const ownedEl = document.getElementById('shin-ex-owned-count');
    if (fromEl)   fromEl.textContent   = stones.toLocaleString();
    if (toEl)     toEl.textContent     = canGet.toLocaleString();
    if (ownedEl)  ownedEl.textContent  = `所持: ${(gameState.shinStones ?? 0).toLocaleString()}個`;
    if (allLabel) allLabel.textContent = canGet > 0 ? `最大 ${canGet}個` : '転生石が足りない';
    const ex10Btn = document.getElementById('shin-exchange-10-btn');
    if (exBtn)    exBtn.disabled    = !shinVisible || stones < 100;
    if (ex10Btn)  ex10Btn.disabled  = !shinVisible || stones < 1000;
    if (exAllBtn) exAllBtn.disabled = !shinVisible || canGet < 1;
    const lockNote = shinExArea.querySelector('.shin-lock-note');
    if (!shinVisible) {
      if (!lockNote) {
        const p = document.createElement('p');
        p.className = 'shin-lock-note section-note';
        p.style.cssText = 'text-align:center;color:#666;margin-bottom:8px';
        p.textContent = '🔒 転生50回で解放';
        shinExArea.querySelector('.shin-exchange-box').prepend(p);
      }
    } else if (lockNote) {
      lockNote.remove();
    }
  }

  const exampleEl = document.getElementById('stone-guide-example');
  if (exampleEl) {
    const total      = gameState.totalMoku ?? 0;
    const rawStones  = Math.floor(total / 1_000_000) * getPrestigeBonus('stoneMult');
    const stones     = Math.min(rawStones, getPrestigeStoneCap());
    const multiplier = getPrestigeBonus('stoneMult');
    const capNote    = rawStones > getPrestigeStoneCap() ? `（上限${getPrestigeStoneCap()}石）` : '';
    const multStr    = multiplier > 1 ? `（転生加速×${multiplier}）` : '';
    exampleEl.textContent = total > 0
      ? `例: 現在 ${fmt(total)}藻 → 転生すると ${stones}石 獲得${multStr}${capNote}`
      : '藻を貯めて転生してみよう！';
  }
  renderSkinCollection();
  renderGachaRates();
  renderPrestigeSkillList();
  renderPrestigeHistory();
}

function renderPrestigeHistory() {
  const container = document.getElementById('prestige-history');
  if (!container) return;
  const history = gameState.prestigeHistory ?? [];

  if (history.length === 0) {
    container.innerHTML = '<p class="history-empty">まだ転生していません。<br>初転生を目指そう！</p>';
    return;
  }

  container.innerHTML = [...history].reverse().map(e => `
    <div class="history-card">
      <div class="history-header">
        <span class="history-no">第${e.no}回転生</span>
        <span class="history-date">${e.date}</span>
      </div>
      <div class="history-stats">
        <span>🌿 ${fmt(e.totalMoku)}藻</span>
        <span>Lv.${e.maxLevel}</span>
        <span>👔 ${e.employees}体</span>
        <span>✨ +${e.stonesEarned}石</span>
      </div>
    </div>
  `).join('');
}

// ========== メンヘラモード ==========

const MENHERA_SHORT = [
  'おかえり…すぐ戻ってきてくれたんだね',
  'ちょっとだけでも会えて嬉しい',
  'ちゃんと戻ってきてくれるって信じてた',
  '離れすぎなくて安心した…',
  '寂しかったよ、少しだけでも',
  'そのくらいなら、まだ許せるかな',
  'ほんの少しでもいないと気になるんだよ',
  '戻ってくるって思ってたけどね',
  'ちょっとだけ不安になった',
  'ちゃんと帰ってきてくれてよかった',
];

const MENHERA_30_60 = [
  'ねえ、ずっと待ってたんだけど…なんで放置するの？',
  '30分もいなかったよね？私のこと忘れてた？',
  'そんなに放置して平気なんだ…ちょっとショック',
  '戻ってくるって信じてたけど、遅すぎない？',
  'その時間、他のゲームしてたんでしょ',
];

const MENHERA_60_180 = [
  'そんなに長い間いなくても平気なんだね…私のこと',
  '1時間以上放置とか、さすがにひどくない？',
  '私より優先するものがあるんだ…へぇ',
  'ずっと待ってたんだけど…普通に辛い',
  'もう戻ってこないと思ってたよ',
];

const MENHERA_OVER = [
  'もういいよ…どうせまた放置するんでしょ',
  'ここまで放置されるとさすがに冷めるよ',
  '私いなくても平気なんだね',
  'こんなに待ったのに…なんかバカみたい',
  '戻ってきたの？へぇ…',
];

function getMenheraMessage(elapsedSec) {
  const min = Math.floor(elapsedSec / 60);
  const rand = arr => arr[Math.floor(Math.random() * arr.length)];
  if (min < 30)  return rand(MENHERA_SHORT);
  if (min < 60)  return rand(MENHERA_30_60);
  if (min < 180) return rand(MENHERA_60_180);
  return rand(MENHERA_OVER);
}

function updateMenheraToggle() {
  const btn  = document.getElementById('menhera-toggle-btn');
  const note = document.getElementById('menhera-toggle-note');
  if (!btn) return;
  const unlocked = (gameState.prestigeLevel ?? 0) >= 5;
  if (unlocked) {
    const on = gameState.menheraMode;
    btn.textContent = on ? 'ON' : 'OFF';
    btn.className   = on ? 'menhera-btn on' : 'menhera-btn';
    btn.disabled    = false;
    note.textContent = on ? '💔 おかえりメッセージがメンヘラになります' : '';
  } else {
    btn.textContent  = '🔒 転生5回で解放';
    btn.className    = 'menhera-btn locked';
    btn.disabled     = true;
    note.textContent = `あと転生${5 - (gameState.prestigeLevel ?? 0)}回で解放`;
  }
}

// ========== オフライン収益 ==========

function checkOfflineEarnings() {
  if (!gameState.lastSaved || gameState.lastSaved === 0) return;
  if (gameState.mokuPerSecond <= 0) return;

  const now        = Date.now();
  const elapsedSec = Math.floor((now - gameState.lastSaved) / 1000);
  const MIN_SEC       = 60;
  const isMenhera     = gameState.menheraMode && (gameState.prestigeLevel ?? 0) >= 5;
  const MODAL_MIN_SEC = isMenhera ? 60 : 1800; // メンヘラは1分、通常は30分
  const MAX_SEC       = 28800; // 8時間

  if (elapsedSec < MIN_SEC) return;

  const cappedSec   = Math.min(elapsedSec, MAX_SEC);
  const offlineRate = gameState.hasRegistered ? 0.8 : 0.5;
  const earned      = Math.floor(gameState.mokuPerSecond * cappedSec * offlineRate);
  if (earned <= 0) return;

  gameState.moku      += earned;
  gameState.totalMoku += earned;

  if (elapsedSec < MODAL_MIN_SEC) return;

  const hours   = Math.floor(elapsedSec / 3600);
  const minutes = Math.floor((elapsedSec % 3600) / 60);
  const timeStr = hours > 0 ? `${hours}時間${minutes}分` : `${minutes}分`;
  const capped  = elapsedSec > MAX_SEC ? `（最大8時間で計算）` : '';

  const rateLabel = gameState.hasRegistered ? '80%' : '50%';
  const title = isMenhera ? getMenheraMessage(elapsedSec) : 'おかえり！🌿';
  document.getElementById('offline-title').textContent  = title;
  document.getElementById('offline-time').textContent   = `${timeStr}ぶりのお帰り！${capped}`;
  document.getElementById('offline-earned').textContent = `+${fmt(earned)} 藻`;
  document.getElementById('offline-note').textContent   = `（MPS × ${rateLabel} × 離脱時間）`;
  document.getElementById('offline-modal').classList.remove('hidden');
}

// ========== セーブ / ロード / リセット ==========

function saveGame() {
  gameState.lastSaved = Date.now();
  const json = JSON.stringify(gameState);
  localStorage.setItem(SAVE_KEY, json);
  localStorage.setItem(CHECKSUM_KEY, computeChecksum(json));
}

function saveGameCloud() {
  const json = localStorage.getItem(SAVE_KEY);
  if (!json || !currentUser()) return;
  if (json === _lastCloudSave) return;
  // 空の状態・クラウドより進捗が低い状態でクラウドを上書きしない
  try {
    const s = JSON.parse(json);
    const isEmpty = (s.moku ?? 0) === 0
      && Object.keys(s.employees ?? {}).length === 0
      && (s.tapCount ?? 0) === 0;
    if (isEmpty) return;
    const localTotalMoku = s.totalMoku ?? 0;
    if (localTotalMoku < _minCloudTotalMoku) return;
  } catch (_) { return; }
  _lastCloudSave = json;
  saveGameData(json).catch(e => { console.warn('[mokuzu] クラウド保存失敗:', e); });
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return;

  // チェックサム不一致はデータを消さず警告のみ表示
  const storedCs = localStorage.getItem(CHECKSUM_KEY);
  if (storedCs && computeChecksum(raw) !== storedCs) {
    alert('⚠️ セーブデータに異常が検出されました。\n会員登録をしていないとデータが消える可能性があります。\n設定からぜひ会員登録をお願いします！');
  }

  let saved;
  try {
    saved = JSON.parse(raw);
  } catch {
    console.warn('[mokuzu] セーブデータの解析に失敗。初期値で起動します。');
    return;
  }

  if (saved.saveVersion !== SAVE_VERSION) {
    console.warn(`[mokuzu] バージョン不一致 (${saved.saveVersion} → ${SAVE_VERSION})。初期値で起動します。`);
    return;
  }

  Object.assign(gameState, saved);
  recalcTapPower();
  recalcMPS();
}

function resetGame() {
  if (!confirm('リセットしますか？\nすべての進捗が失われます。')) return;
  gameState = structuredClone(DEFAULT_STATE); // 先にメモリをリセット（visibilitychange の誤上書き防止）
  localStorage.removeItem(SAVE_KEY);
  location.reload();
}

// ========== ミニゲーム ロビー ==========

function showMinigameLobby() {
  document.getElementById('minigame-lobby').classList.remove('hidden');
  document.querySelectorAll('[id^="minigame-game-"]').forEach(el => el.classList.add('hidden'));
}

function showMinigame(gameId) {
  document.getElementById('minigame-lobby').classList.add('hidden');
  document.querySelectorAll('[id^="minigame-game-"]').forEach(el => el.classList.add('hidden'));
  document.getElementById(`minigame-game-${gameId}`).classList.remove('hidden');
  if (gameId === 'highlow')  { if (!_hlCard) initHighLow(); else _hlRender(); }
  if (gameId === 'roulette') initRoulette();
  if (gameId === 'slot')     initSlot();
}

// ========== ハイロー ミニゲーム ==========

const HL_VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const HL_SUITS  = ['♠', '♥', '♦', '♣'];

let _hlCard   = null;   // 現在表示中のカード
let _hlPhase  = 'idle'; // 'idle' | 'playing' | 'result'
let _hlBet    = 1;
let _hlStreak = 0;

// 確率連動倍率: 1.1 ÷ 勝率（cap 12.0）
function _hlGetMult(rank, choice) {
  const p = choice === 'high' ? (13 - rank) / 13 : (rank - 1) / 13;
  if (p <= 0) return null;
  return Math.min(2.0, Math.round(1.1 / p * 10) / 10);
}

function _hlDraw() {
  const idx = Math.floor(Math.random() * 13);
  return { value: HL_VALUES[idx], suit: HL_SUITS[Math.floor(Math.random() * 4)], rank: idx + 1 };
}

function _hlCardHTML(card) {
  const isRed = card.suit === '♥' || card.suit === '♦';
  return `<div class="hl-card${isRed ? ' hl-card-red' : ''}">
    <div class="hl-corner hl-tl"><div class="hl-rank">${card.value}</div><div class="hl-suit">${card.suit}</div></div>
    <div class="hl-center">${card.suit}</div>
    <div class="hl-corner hl-br"><div class="hl-rank">${card.value}</div><div class="hl-suit">${card.suit}</div></div>
  </div>`;
}

function _hlCardBackHTML() {
  return `<div class="hl-card hl-card-back"><span>?</span></div>`;
}

function _syncBetActive(selector, bet, coins) {
  document.querySelectorAll(selector).forEach(btn => {
    const v = btn.dataset.bet;
    btn.classList.toggle('bet-active',
      v === 'all' ? bet >= coins : parseInt(v) === bet
    );
  });
}

function _hlRender() {
  const coins = gameState.mokuCoins ?? 0;
  _hlBet = Math.max(1, Math.min(_hlBet, Math.max(1, coins)));

  const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  setTxt('hl-coin-count',   coins);
  setTxt('hl-bet-val',      _hlBet);
  setTxt('hl-streak-val',   _hlStreak);
  _syncBetActive('.hl-bet-preset', _hlBet, coins);
  setTxt('hl-highscore-val', gameState.highlowHighScore ?? 0);

  const curEl = document.getElementById('hl-current-wrap');
  const nxtEl = document.getElementById('hl-next-wrap');
  if (curEl) curEl.innerHTML = _hlCard ? _hlCardHTML(_hlCard) : _hlCardBackHTML();
  if (nxtEl) nxtEl.innerHTML = _hlCardBackHTML();

  const resultEl = document.getElementById('hl-result');
  if (resultEl) { resultEl.className = 'hl-result'; resultEl.innerHTML = ''; }

  const canPlay = _hlPhase === 'playing' && coins >= 1;
  const hBtn = document.getElementById('hl-high-btn');
  const lBtn = document.getElementById('hl-low-btn');
  const hMult = _hlCard ? _hlGetMult(_hlCard.rank, 'high') : null;
  const lMult = _hlCard ? _hlGetMult(_hlCard.rank, 'low')  : null;
  if (hBtn) {
    hBtn.disabled  = !canPlay || !hMult;
    hBtn.textContent = hMult ? `⬆️ HIGH ×${hMult}` : '⬆️ HIGH —';
  }
  if (lBtn) {
    lBtn.disabled  = !canPlay || !lMult;
    lBtn.textContent = lMult ? `⬇️ LOW ×${lMult}` : '⬇️ LOW —';
  }

  if (coins <= 0 && _hlPhase === 'playing' && resultEl) {
    resultEl.className = 'hl-result hl-result-lose';
    resultEl.textContent = '💸 コインが足りません！デイリーログインでもらおう';
  }
}

function initHighLow() {
  _hlCard  = _hlDraw();
  _hlPhase = 'playing';
  _hlRender();
}

function hlChoose(choice) {
  if (_hlPhase !== 'playing') return;
  const coins = gameState.mokuCoins ?? 0;
  if (coins < 1) { _hlRender(); return; }

  const bet  = Math.min(_hlBet, coins);
  const mult = _hlGetMult(_hlCard.rank, choice) ?? 1.1;
  const next = _hlDraw();
  const win  = (choice === 'high' && next.rank > _hlCard.rank) ||
               (choice === 'low'  && next.rank < _hlCard.rank);

  _hlPhase = 'result';

  const curEl    = document.getElementById('hl-current-wrap');
  const nxtEl    = document.getElementById('hl-next-wrap');
  const resultEl = document.getElementById('hl-result');
  const hBtn     = document.getElementById('hl-high-btn');
  const lBtn     = document.getElementById('hl-low-btn');

  if (curEl) curEl.innerHTML = _hlCardHTML(_hlCard);
  if (nxtEl) nxtEl.innerHTML = _hlCardHTML(next);
  if (hBtn)  hBtn.disabled   = true;
  if (lBtn)  lBtn.disabled   = true;

  if (win) {
    const gain = Math.max(1, Math.floor(bet * (mult - 1)));
    gameState.mokuCoins = coins + gain;
    _hlStreak++;
    if (_hlStreak > (gameState.highlowHighScore ?? 0)) gameState.highlowHighScore = _hlStreak;

    const returned = bet + gain;
    if (_hlStreak % 5 === 0) {
      gameState.mokuCoins = (gameState.mokuCoins ?? 0) + 10;
      if (resultEl) {
        resultEl.innerHTML  = `<span class="hl-win">✅ 正解！×${mult} ${bet} → ${returned}コイン (+${gain})</span><br><span class="hl-bonus">🎉 ${_hlStreak}連続ボーナス！+10コイン！</span>`;
        resultEl.className  = 'hl-result hl-result-win';
      }
    } else {
      if (resultEl) {
        resultEl.innerHTML = `<span class="hl-win">✅ 正解！×${mult} ${bet} → ${returned}コイン (+${gain})</span>`;
        resultEl.className = 'hl-result hl-result-win';
      }
    }
  } else {
    gameState.mokuCoins = Math.max(0, coins - bet);
    _hlStreak = 0;
    const isTie = next.rank === _hlCard.rank;
    if (resultEl) {
      resultEl.innerHTML = `<span class="hl-lose">${isTie ? '😵 引き分け（負け） ' : '❌ 不正解！ '}-${bet}コイン</span>`;
      resultEl.className = 'hl-result hl-result-lose';
    }
  }

  const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  setTxt('hl-coin-count',    gameState.mokuCoins);
  setTxt('hl-streak-val',    _hlStreak);
  setTxt('hl-highscore-val', gameState.highlowHighScore ?? 0);

  saveGame();
  updateDisplay();

  setTimeout(() => {
    _hlCard  = next;
    _hlPhase = 'playing';
    _hlRender();
  }, 1800);
}

// ========== ルーレット ミニゲーム ==========

const RL_RED_NUMS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const RL_BET_LABELS = {
  red: '🔴 赤 (×2)', black: '⚫ 黒 (×2)', odd: '奇数 (×2)', even: '偶数 (×2)',
  low: '1-18 (×2)', high: '19-36 (×2)',
  col1: '列1下段 (×3)', col2: '列2中段 (×3)', col3: '列3上段 (×3)',
  dozen1: '1st 12 (×3)', dozen2: '2nd 12 (×3)', dozen3: '3rd 12 (×3)',
};
// 欧州ルーレット標準ホイール順（時計回り）
const RL_WHEEL_ORDER = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];

let _rlBetType       = null;
let _rlBetNum        = null;
let _rlBet           = 1;
let _rlSpinning      = false;
let _rlWheelRotation = 0;

function _rlColor(n) {
  if (n === 0) return 'green';
  return RL_RED_NUMS.has(n) ? 'red' : 'black';
}

function _rlBuildWheel() {
  const wheel = document.getElementById('rl-wheel');
  if (!wheel || wheel.dataset.built === 'svg1') return;

  const S = 260, cx = 130, cy = 130, Ro = 127, Ri = 16, Rt = 102;
  const n  = RL_WHEEL_ORDER.length;
  const sr = (2 * Math.PI) / n;
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${S} ${S}`);
  svg.setAttribute('width', S); svg.setAttribute('height', S);
  svg.style.display = 'block';

  for (let i = 0; i < n; i++) {
    const num = RL_WHEEL_ORDER[i];
    const a0 = i * sr - Math.PI / 2, a1 = (i + 1) * sr - Math.PI / 2;
    const am = (a0 + a1) / 2;
    const c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);

    const g = document.createElementNS(NS, 'g');
    g.dataset.num = num;

    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d',
      `M ${cx+Ri*c0} ${cy+Ri*s0} L ${cx+Ro*c0} ${cy+Ro*s0}` +
      ` A ${Ro} ${Ro} 0 0 1 ${cx+Ro*c1} ${cy+Ro*s1}` +
      ` L ${cx+Ri*c1} ${cy+Ri*s1}` +
      ` A ${Ri} ${Ri} 0 0 0 ${cx+Ri*c0} ${cy+Ri*s0} Z`
    );
    path.setAttribute('fill', num === 0 ? '#1a7a2a' : RL_RED_NUMS.has(num) ? '#c0392b' : '#1a1a1a');
    path.setAttribute('stroke', '#666'); path.setAttribute('stroke-width', '0.5');
    g.appendChild(path);

    const tx = cx + Rt * Math.cos(am), ty = cy + Rt * Math.sin(am);
    const text = document.createElementNS(NS, 'text');
    text.setAttribute('x', tx); text.setAttribute('y', ty);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'central');
    text.setAttribute('font-size', num < 10 ? '11' : '8.5');
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('fill', '#fff');
    text.setAttribute('transform', `rotate(${am * 180 / Math.PI + 90}, ${tx}, ${ty})`);
    text.setAttribute('pointer-events', 'none');
    text.textContent = num;
    g.appendChild(text);
    svg.appendChild(g);
  }

  const rim = document.createElementNS(NS, 'circle');
  rim.setAttribute('cx', cx); rim.setAttribute('cy', cy); rim.setAttribute('r', Ro);
  rim.setAttribute('fill', 'none'); rim.setAttribute('stroke', '#aaa'); rim.setAttribute('stroke-width', '2');
  svg.appendChild(rim);

  wheel.style.background = 'none';
  wheel.innerHTML = '';
  wheel.appendChild(svg);
  wheel.dataset.built = 'svg1';
}

function _rlClearHighlights() {
  document.querySelectorAll('#rl-wheel svg g[data-num] path').forEach(p => {
    p.setAttribute('stroke', '#666'); p.setAttribute('stroke-width', '0.5');
    p.style.filter = '';
  });
}

function _rlHighlightSelected() {
  _rlClearHighlights();
  if (_rlBetType === 'number' && _rlBetNum !== null) {
    const g = document.querySelector(`#rl-wheel svg g[data-num="${_rlBetNum}"]`);
    if (g) {
      const p = g.querySelector('path');
      p.setAttribute('stroke', '#00cfff'); p.setAttribute('stroke-width', '2.5');
      p.style.filter = 'drop-shadow(0 0 4px #00cfff)';
    }
  }
}

function _rlHighlightResult(result) {
  _rlClearHighlights();
  const g = document.querySelector(`#rl-wheel svg g[data-num="${result}"]`);
  if (g) {
    const p = g.querySelector('path');
    p.setAttribute('stroke', '#ffd700'); p.setAttribute('stroke-width', '3');
    p.style.filter = 'drop-shadow(0 0 6px #ffd700)';
  }
}

function _rlSpinWheel(result, onDone) {
  _rlBuildWheel();
  const wheel = document.getElementById('rl-wheel');
  if (!wheel) { onDone(); return; }

  const segDeg = 360 / RL_WHEEL_ORDER.length;
  const idx = RL_WHEEL_ORDER.indexOf(result);
  const centerAngle = (idx + 0.5) * segDeg;
  // 目的の番号がポインター（12時）に来る回転量を計算
  const targetMod = (360 - centerAngle % 360 + 360) % 360;
  const currentMod = ((_rlWheelRotation % 360) + 360) % 360;
  let diff = (targetMod - currentMod + 360) % 360;
  if (diff < 90) diff += 360;

  _rlWheelRotation += diff + 360 * 5;

  const spinMs = 3800;
  wheel.style.transition = `transform ${spinMs}ms cubic-bezier(0.05, 0.85, 0.3, 1.0)`;
  wheel.style.transform = `rotate(${_rlWheelRotation}deg)`;

  setTimeout(onDone, spinMs + 80);
}

function _rlIsWin(result) {
  switch (_rlBetType) {
    case 'red':    return RL_RED_NUMS.has(result);
    case 'black':  return result !== 0 && !RL_RED_NUMS.has(result);
    case 'odd':    return result !== 0 && result % 2 === 1;
    case 'even':   return result !== 0 && result % 2 === 0;
    case 'low':    return result >= 1 && result <= 18;
    case 'high':   return result >= 19 && result <= 36;
    case 'number': return result === _rlBetNum;
    case 'col1':   return result !== 0 && result % 3 === 1;
    case 'col2':   return result !== 0 && result % 3 === 2;
    case 'col3':   return result !== 0 && result % 3 === 0;
    case 'dozen1': return result >= 1  && result <= 12;
    case 'dozen2': return result >= 13 && result <= 24;
    case 'dozen3': return result >= 25 && result <= 36;
  }
  return false;
}

function _rlMultiplier() {
  if (_rlBetType === 'number') return 36;
  if (['col1','col2','col3','dozen1','dozen2','dozen3'].includes(_rlBetType)) return 3;
  return 2;
}

function rlRender() {
  const coins = gameState.mokuCoins ?? 0;
  _rlBet = Math.max(1, Math.min(_rlBet, Math.max(1, coins)));
  const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  setTxt('rl-coin-count', coins);
  setTxt('rl-bet-val', _rlBet);
  _syncBetActive('.rl-bet-preset', _rlBet, coins);

  const labelEl = document.getElementById('rl-bet-label');
  if (labelEl) {
    if (_rlBetType === 'number' && _rlBetNum !== null) {
      labelEl.textContent = `単番 ${_rlBetNum}番 (×36)`;
    } else if (_rlBetType) {
      labelEl.textContent = RL_BET_LABELS[_rlBetType] ?? _rlBetType;
    } else {
      labelEl.textContent = 'テーブルをタップ';
    }
  }

  const canSpin = !_rlSpinning && coins >= 1 && _rlBetType !== null &&
                  !(_rlBetType === 'number' && _rlBetNum === null);
  const spinBtn = document.getElementById('rl-spin-btn');
  if (spinBtn) spinBtn.disabled = !canSpin;

  const resultEl = document.getElementById('rl-result');
  if (coins <= 0 && resultEl && !resultEl.innerHTML) {
    resultEl.className = 'rl-result rl-result-lose';
    resultEl.textContent = '💸 コインが足りません！デイリーログインでもらおう';
  }
}

function rlSpin() {
  if (_rlSpinning || !_rlBetType) return;
  if (_rlBetType === 'number' && _rlBetNum === null) return;
  const coins = gameState.mokuCoins ?? 0;
  if (coins < 1) return;

  const bet    = Math.min(_rlBet, coins);
  const result = Math.floor(Math.random() * 37);
  _rlSpinning  = true;

  const dispEl   = document.getElementById('rl-display');
  const numEl    = document.getElementById('rl-display-num');
  const resultEl = document.getElementById('rl-result');
  const spinBtn  = document.getElementById('rl-spin-btn');

  if (resultEl) { resultEl.className = 'rl-result'; resultEl.innerHTML = ''; }
  if (spinBtn)  spinBtn.disabled = true;
  if (dispEl)   dispEl.className = 'rl-display rl-display-spinning';
  if (numEl)    numEl.textContent = '?';
  _rlClearHighlights();

  _rlSpinWheel(result, () => {
    if (numEl)  numEl.textContent = result;
    if (dispEl) dispEl.className  = `rl-display rl-display-${_rlColor(result)}`;

    const win = _rlIsWin(result);
    if (win) {
      const gain = bet * (_rlMultiplier() - 1);
      gameState.mokuCoins = coins + gain;
      if (resultEl) {
        resultEl.innerHTML = `<span class="hl-win">✅ 当たり！ ${bet} → ${bet + gain}コイン (+${gain})</span>`;
        resultEl.className = 'rl-result rl-result-win';
      }
    } else {
      gameState.mokuCoins = Math.max(0, coins - bet);
      if (resultEl) {
        resultEl.innerHTML = `<span class="hl-lose">❌ ハズレ -${bet}コイン</span>`;
        resultEl.className = 'rl-result rl-result-lose';
      }
    }

    _rlSpinning = false;
    saveGame();
    updateDisplay();
    rlRender();
    _rlHighlightResult(result);
  });
}

function initRoulette() {
  const table = document.querySelector('.rl-table');
  if (table && !table.dataset.ready) {
    table.addEventListener('click', e => {
      if (_rlSpinning) return;
      const cell = e.target.closest('[data-bet]');
      if (!cell) return;
      _rlBetType = cell.dataset.bet;
      _rlBetNum  = cell.dataset.num !== undefined ? parseInt(cell.dataset.num) : null;
      table.querySelectorAll('.rl-selected').forEach(el => el.classList.remove('rl-selected'));
      cell.classList.add('rl-selected');
      rlRender();
      _rlHighlightSelected();
    });
    table.dataset.ready = '1';
  }
  const _w = document.getElementById('rl-wheel');
  if (_w) delete _w.dataset.built;
  _rlBuildWheel();
  _rlSpinning = false;
  rlRender();
}

// ========== スロット ミニゲーム ==========

// { file, mult } — mult=0 は外れ扱い
const SLOT_SYMBOLS = [
  { file: '1_png.png', mult: 0   },  // X（外れ）
  { file: '2_.png',    mult: 2   },  // たまご
  { file: '3_.png',    mult: 3   },  // ひよこ
  { file: '5_.png',    mult: 5   },  // 帽子
  { file: '30_.png',   mult: 30  },  // BAR
  { file: '50_.png',   mult: 50  },  // 赤7
  { file: '100_.png',  mult: 100 },  // 青7
];
// 出現重み（Xが最多、高倍率ほど低頻度）
const SLOT_WEIGHTS = [50, 22, 14, 9, 3, 1.5, 0.5];

let _slotSpinning = false;
let _slotBet      = 1;

function _slotPick() {
  const weights = SLOT_WEIGHTS.map((w, i) =>
    (i === _slotEventSymIdx) ? w * _slotEventBoost : w
  );
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return 0;
}

function slotRender() {
  const coins = gameState.mokuCoins ?? 0;
  _slotBet = Math.max(1, Math.min(_slotBet, Math.max(1, coins)));
  const el = document.getElementById('slot-coin-count');
  if (el) el.textContent = coins;
  const bv = document.getElementById('slot-bet-val');
  if (bv) bv.textContent = _slotBet;
  _syncBetActive('.slot-bet-preset', _slotBet, coins);
  const btn = document.getElementById('slot-spin-btn');
  if (btn) btn.disabled = _slotSpinning || coins < 1;

  const resultEl = document.getElementById('slot-result');
  if (coins <= 0 && resultEl && !resultEl.innerHTML) {
    resultEl.className = 'slot-result slot-result-lose';
    resultEl.textContent = '💸 コインが足りません！デイリーログインでもらおう';
  }
}

// 個数ボーナス倍率（3個以上で当たり）
const SLOT_COUNT_MULT = { 3: 1, 4: 2, 5: 5, 6: 10, 7: 20, 8: 50, 9: 100 };

let _slotEventSymIdx = -1; // 次スピンで確率UPする絵柄（-1=なし）
let _slotEventBoost  = 1;  // UP倍率

// 9マス中3個以上揃う確率（二項分布）
function _slot3plusProb(p) {
  const C9 = [1, 9, 36, 84, 126, 126, 84, 36, 9, 1];
  let prob = 0;
  for (let k = 3; k <= 9; k++) {
    prob += C9[k] * Math.pow(p, k) * Math.pow(1 - p, 9 - k);
  }
  return prob;
}

function _slotUpdateProbs() {
  const weights = SLOT_WEIGHTS.map((w, i) =>
    (i === _slotEventSymIdx) ? w * _slotEventBoost : w
  );
  const total = weights.reduce((a, b) => a + b, 0);
  for (let i = 1; i < SLOT_SYMBOLS.length; i++) {
    const el = document.getElementById(`slot-prob-${i}`);
    if (!el) continue;
    const p    = weights[i] / total;
    const winP = _slot3plusProb(p) * 100;
    el.textContent = winP.toFixed(1) + '%';
    el.classList.toggle('slot-prob-boosted', i === _slotEventSymIdx);
  }
}

function _slotMaybeEvent() {
  if (Math.random() > 0.22) return; // 約22%でイベント発生
  const symIdx = 1 + Math.floor(Math.random() * (SLOT_SYMBOLS.length - 1)); // X除く
  const boost  = [2, 3, 5, 7, 20][Math.floor(Math.random() * 5)];
  _slotEventSymIdx = symIdx;
  _slotEventBoost  = boost;
  const sym = SLOT_SYMBOLS[symIdx];
  const el  = document.getElementById('slot-event');
  if (el) {
    el.innerHTML = `<img src="assets/slot/${sym.file}" class="slot-event-img"> NEXT確率 ×${boost} UP！`;
    el.classList.remove('hidden');
  }
  _slotUpdateProbs();
}

function slotSpin() {
  if (_slotSpinning) return;
  const coins = gameState.mokuCoins ?? 0;
  if (coins < 1) return;

  const bet = Math.min(_slotBet, coins);
  _slotSpinning = true;

  const resultEl = document.getElementById('slot-result');
  if (resultEl) { resultEl.className = 'slot-result'; resultEl.innerHTML = ''; }
  const spinBtn = document.getElementById('slot-spin-btn');
  if (spinBtn) spinBtn.disabled = true;

  // イベントブーストを適用した結果を先に確定
  const results = Array.from({length: 9}, () => _slotPick());

  // イベント・ハイライトをリセット
  _slotEventSymIdx = -1;
  _slotEventBoost  = 1;
  document.getElementById('slot-event')?.classList.add('hidden');
  _slotUpdateProbs();
  document.querySelectorAll('.slot-cell-wrap').forEach(el => el.classList.remove('slot-hit'));

  // 行ごとに止まる（0-2行目）
  const stopTimes = [
    900, 1050, 1200,
    1700, 1850, 2000,
    2500, 2650, 2800,
  ];

  for (let i = 0; i < 9; i++) {
    const img = document.getElementById(`slot-cell-${i}`);
    if (!img) continue;
    img.classList.add('slot-spinning');

    const timer = setInterval(() => {
      const r = Math.floor(Math.random() * SLOT_SYMBOLS.length);
      img.src = `assets/slot/${SLOT_SYMBOLS[r].file}`;
    }, 80);

    setTimeout(() => {
      clearInterval(timer);
      img.classList.remove('slot-spinning');
      img.src = `assets/slot/${SLOT_SYMBOLS[results[i]].file}`;

      if (i === 8) {
        setTimeout(() => _slotEvaluate(bet, coins, results, resultEl), 400);
      }
    }, stopTimes[i]);
  }
}

function _slotEvaluate(bet, coins, results, resultEl) {
  // 各絵柄の出現回数を集計（Xは除外）
  const counts = {};
  results.forEach(idx => {
    if (SLOT_SYMBOLS[idx].mult > 0) {
      counts[idx] = (counts[idx] || 0) + 1;
    }
  });

  // 最多一致の絵柄を選出（同数ならより高倍率を優先）
  let bestIdx = -1, bestCount = 0;
  Object.entries(counts).forEach(([idxStr, cnt]) => {
    const idx = parseInt(idxStr);
    if (cnt > bestCount || (cnt === bestCount && SLOT_SYMBOLS[idx].mult > (SLOT_SYMBOLS[bestIdx]?.mult ?? 0))) {
      bestCount = cnt;
      bestIdx = idx;
    }
  });

  let msg = '';
  const countMult = SLOT_COUNT_MULT[bestCount] ?? 0;

  if (bestIdx >= 0 && countMult > 0) {
    const sym   = SLOT_SYMBOLS[bestIdx];
    const total = bet * sym.mult * countMult;
    const gain  = total - bet;
    gameState.mokuCoins = coins + gain;
    msg = `<span class="hl-win"><img src="assets/slot/${sym.file}" class="slot-result-sym"> ×${sym.mult} が ${bestCount}個！ ${bet} → ${total}コイン (+${gain})</span>`;
    if (resultEl) resultEl.className = 'slot-result slot-result-win';
    // 揃ったセルをハイライト
    results.forEach((idx, i) => {
      if (idx === bestIdx) {
        document.getElementById(`slot-cell-${i}`)?.closest('.slot-cell-wrap')?.classList.add('slot-hit');
      }
    });
  } else {
    gameState.mokuCoins = Math.max(0, coins - bet);
    msg = `<span class="hl-lose">❌ ハズレ -${bet}コイン</span>`;
    if (resultEl) resultEl.className = 'slot-result slot-result-lose';
  }

  if (resultEl) resultEl.innerHTML = msg;
  _slotSpinning = false;
  saveGame();
  updateDisplay();
  slotRender();
  _slotMaybeEvent(); // 次スピンのイベント抽選
}

function initSlot() {
  _slotSpinning = false;
  document.querySelectorAll('.slot-cell-wrap').forEach(el => el.classList.remove('slot-hit'));
  // 代表画像のサイズからセル幅・高さを決定
  const probe = new Image();
  probe.onload = () => {
    const cellW = Math.floor((Math.min(window.innerWidth, 480) - 72) / 3);
    const cellH = Math.round(probe.naturalHeight * cellW / probe.naturalWidth);
    document.querySelectorAll('.slot-cell-wrap').forEach(el => {
      el.style.width  = `${cellW}px`;
      el.style.height = `${cellH}px`;
    });
    document.querySelectorAll('.slot-symbol').forEach(img => {
      img.style.width  = `${cellW}px`;
      img.style.height = `${cellH}px`;
    });
  };
  probe.src = 'assets/slot/50_.png';
  _slotUpdateProbs();
  slotRender();
}

// ========== タブ切り替え ==========

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.getElementById(`tab-${tabId}`).classList.add('active');
      btn.classList.add('active');
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      if (tabId === 'ranking') loadRanking();
      if (tabId === 'pet') { renderPetSection(); renderPetEggShop(); }
      if (tabId === 'minigame') showMinigameLobby();
    });
  });

  const inner = document.getElementById('tab-nav-inner');
  if (inner) {
    inner.addEventListener('wheel', e => {
      e.preventDefault();
      inner.scrollLeft += e.deltaY;
    }, { passive: false });
  }
}

// ========== 起動 ==========

function init() {
  loadGame();
  checkOfflineEarnings();

  // 初回起動 or 旧セーブ：待機中なら次のイベントを先行決定
  if (!gameState.nextEventId && !gameState.activeEvent) {
    const next = pickRandomEvent();
    if (next) gameState.nextEventId = next.id;
  }

  updateSuit(gameState.suit);
  updateItemOverlays();

  // オートクリッカーがセーブ時に発動中だった場合は復元
  if (isEffectActive('auto_click')) startAutoClicker();

  renderPrestigeSkillList();
  renderUpgradeList();
  renderEventUnlockList();
  renderEmployeeList();
  renderFacilityList();
  renderItemList();
  renderConsumableList();
  renderUnlockedEventList();
  renderPetEggShop();
  renderPetSection();
  renderPetZukan();
  updateDisplay();
  updateEventDisplay();

  // キャラタップ（キャラ画像＋ヒントテキスト両方）
  const charEl = document.getElementById('character-img');
  charEl.addEventListener('touchstart', onTap, { passive: false });
  charEl.addEventListener('click', onTap);
  const hintEl = document.getElementById('tap-hint');
  hintEl.addEventListener('touchstart', onTap, { passive: false });
  hintEl.addEventListener('click', onTap);

  // 覚醒ボタン
  document.getElementById('awaken-btn').addEventListener('click', activateAwaken);

  // セーブ・リセット
  document.getElementById('save-btn').addEventListener('click', () => {
    saveGame();
    const btn = document.getElementById('save-btn');
    btn.textContent = '✅ 保存済み';
    setTimeout(() => { btn.textContent = '💾 セーブ'; }, 1500);
  });
  document.getElementById('reset-btn').addEventListener('click', resetGame);

  if (localStorage.getItem('mzk_debug') === '1') {
    document.getElementById('debug-section').classList.remove('hidden');
    document.getElementById('debug-add-stones').addEventListener('click', () => {
      gameState.prestigeStones = (gameState.prestigeStones ?? 0) + 10000;
      saveGame();
      updateDisplay();
    });
    document.getElementById('debug-add-moku').addEventListener('click', () => {
      gameState.moku = (gameState.moku ?? 0) + 100_000_000;
      saveGame();
      updateDisplay();
    });
    document.getElementById('debug-add-coins').addEventListener('click', () => {
      gameState.mokuCoins = (gameState.mokuCoins ?? 0) + 100;
      saveGame();
      updateDisplay();
    });
  }

  document.getElementById('menhera-toggle-btn').addEventListener('click', () => {
    if ((gameState.prestigeLevel ?? 0) < 5) return;
    gameState.menheraMode = !gameState.menheraMode;
    saveGame();
    updateMenheraToggle();
  });

  document.getElementById('coupon-btn').addEventListener('click', async () => {
    const btn  = document.getElementById('coupon-btn');
    const code = document.getElementById('coupon-input').value;
    btn.disabled = true;
    await redeemCoupon(code);
    document.getElementById('coupon-input').value = '';
    btn.disabled = false;
  });

  document.getElementById('offline-ok').addEventListener('click', () => {
    document.getElementById('offline-modal').classList.add('hidden');
  });

  document.getElementById('daily-modal-ok').addEventListener('click', () => {
    document.getElementById('daily-modal').classList.add('hidden');
  });

  document.getElementById('regbonus-ok').addEventListener('click', () => {
    document.getElementById('regbonus-modal').classList.add('hidden');
  });

  document.getElementById('gacha-btn-1')   .addEventListener('click', () => doGachaPull(1));
  document.getElementById('gacha-btn-10')  .addEventListener('click', () => doGachaPull(10));
  document.getElementById('gacha-btn-free').addEventListener('click', () => {
    const tickets = (gameState.consumables ?? {})['gacha_coin'] ?? 0;
    if (tickets <= 0) return;
    gameState.consumables['gacha_coin'] = tickets - 1;
    doGachaPull(1, true);
  });
  document.getElementById('gacha-result-close').addEventListener('click', () => {
    document.getElementById('gacha-result-modal').classList.add('hidden');
  });

  document.getElementById('daily-claim-btn').addEventListener('click', claimDailyCoins);

  document.getElementById('password-toggle').addEventListener('click', () => {
    const input = document.getElementById('auth-password');
    const btn   = document.getElementById('password-toggle');
    if (input.type === 'password') {
      input.type = 'text';
      btn.textContent = '🙈';
    } else {
      input.type = 'password';
      btn.textContent = '👁️';
    }
  });
  document.getElementById('stone-exchange-btn').addEventListener('click', exchangeStonesForCoins);

  document.getElementById('settings-btn').addEventListener('click', () => {
    document.getElementById('settings-modal').classList.remove('hidden');
    updateMenheraToggle();
  });

  document.getElementById('notice-btn').addEventListener('click', openNoticeModal);
  document.getElementById('notice-modal-close').addEventListener('click', () => {
    document.getElementById('notice-modal').classList.add('hidden');
  });

  updateNoticeBadge();
  document.getElementById('settings-close-btn').addEventListener('click', () => {
    document.getElementById('settings-modal').classList.add('hidden');
  });
  document.getElementById('settings-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('settings-modal')) {
      document.getElementById('settings-modal').classList.add('hidden');
    }
  });

  document.getElementById('sound-btn').addEventListener('click', () => {
    gameState.soundEnabled = !gameState.soundEnabled;
    updateSoundBtn();
    if (gameState.soundEnabled) playSound('buy');
  });

  initTabs();

  initFirebase();

  setInterval(gameLoop, 1000);          // ゲームループ
  setInterval(saveGame, 30_000);        // ローカルオートセーブ（30秒ごと）
  setInterval(saveGameCloud, 300_000);  // クラウドオートセーブ（5分ごと・変化時のみ）

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      if (_cloudCheckDone) {
        saveGame();
        saveGameCloud();
      }
    } else {
      checkOfflineEarnings();
    }
  });
}

document.addEventListener('DOMContentLoaded', init);

// ========== クーポンコード ==========

async function redeemCoupon(code) {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return;

  const used = gameState.usedCoupons ?? [];
  if (used.includes(trimmed)) {
    alert('このコードはすでに使用済みです。');
    return;
  }

  // ① まずキャンペーンコード（coupons.json）を確認
  let coupon = null;
  try {
    const res  = await fetch(`coupons.json?t=${Date.now()}`);
    const list = await res.json();
    coupon = list[trimmed] ?? null;
  } catch (_) {}

  if (coupon) {
    applyReward(coupon, trimmed);
    return;
  }

  // ② 見つからなければ個人補填コード（Firestore）を確認
  const result = await redeemPersonalCoupon(trimmed);
  if (result.error === 'login_required') {
    alert('個人補填コードの使用にはログインが必要です。\n設定からログインしてください。');
    return;
  }
  if (result.error === 'used') {
    alert('このコードはすでに使用済みです。');
    return;
  }
  if (result.error === 'network') {
    alert('通信エラーが発生しました。時間をおいて再試行してください。');
    return;
  }
  if (result.error === 'invalid') {
    alert('無効なコードです。');
    return;
  }

  applyReward(result, trimmed);
}

function applyReward(coupon, code) {
  if (coupon.reward === 'coins')     gameState.mokuCoins      = (gameState.mokuCoins      ?? 0) + coupon.amount;
  if (coupon.reward === 'stones')    gameState.prestigeStones  = (gameState.prestigeStones ?? 0) + coupon.amount;
  if (coupon.reward === 'moku')      { gameState.moku = (gameState.moku ?? 0) + coupon.amount; gameState.totalMoku = (gameState.totalMoku ?? 0) + coupon.amount; }
  if (coupon.reward === 'gacha_coin') {
    gameState.consumables = gameState.consumables ?? {};
    gameState.consumables['gacha_coin'] = (gameState.consumables['gacha_coin'] ?? 0) + coupon.amount;
  }
  gameState.usedCoupons = [...(gameState.usedCoupons ?? []), code];
  saveGame();
  updateDisplay();
  renderSkinCollection();
  alert(`🎁 ${coupon.desc}\n報酬を受け取りました！`);
}

// ========== バージョンポーリング ==========

async function checkForUpdate() {
  try {
    const res  = await fetch(`version.json?t=${Date.now()}`);
    const data = await res.json();
    if (data.version !== CURRENT_VERSION) {
      const banner = document.getElementById('update-banner');
      if (banner) banner.classList.remove('hidden');
    }
  } catch (_) {}
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('update-banner-btn')?.addEventListener('click', () => {
    saveGame();
    location.href = location.pathname + '?_cb=' + Date.now();
  });
  document.getElementById('shin-exchange-btn')?.addEventListener('click', () => exchangeToShinStones(1));
  document.getElementById('shin-exchange-10-btn')?.addEventListener('click', () => exchangeToShinStones(10));
  document.getElementById('shin-exchange-all-btn')?.addEventListener('click', () => exchangeToShinStones('all'));

  // ミニゲーム ロビー
  document.querySelectorAll('.mg-card').forEach(btn => {
    btn.addEventListener('click', () => showMinigame(btn.dataset.game));
  });
  document.getElementById('minigame-back-btn')?.addEventListener('click', showMinigameLobby);
  document.getElementById('roulette-back-btn')?.addEventListener('click', showMinigameLobby);

  // ルーレット
  document.querySelectorAll('.rl-bet-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.bet;
      const coins = gameState.mokuCoins ?? 0;
      _rlBet = val === 'all' ? Math.max(1, coins) : Math.min(parseInt(val), Math.max(1, coins));
      const betEl = document.getElementById('rl-bet-val');
      if (betEl) betEl.textContent = _rlBet;
    });
  });
  document.getElementById('rl-spin-btn')?.addEventListener('click', rlSpin);

  // スロット
  document.getElementById('slot-back-btn')?.addEventListener('click', showMinigameLobby);
  document.getElementById('slot-spin-btn')?.addEventListener('click', slotSpin);
  document.querySelectorAll('.slot-bet-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.bet;
      const coins = gameState.mokuCoins ?? 0;
      _slotBet = val === 'all' ? Math.max(1, coins) : Math.min(parseInt(val), Math.max(1, coins));
      slotRender();
    });
  });

  // ハイロー ミニゲーム
  document.querySelectorAll('.hl-bet-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const val   = btn.dataset.bet;
      const coins = gameState.mokuCoins ?? 0;
      _hlBet = val === 'all' ? Math.max(1, coins) : Math.min(parseInt(val), Math.max(1, coins));
      const betEl = document.getElementById('hl-bet-val');
      if (betEl) betEl.textContent = _hlBet;
    });
  });
  document.getElementById('hl-high-btn')?.addEventListener('click', () => hlChoose('high'));
  document.getElementById('hl-low-btn')?.addEventListener('click',  () => hlChoose('low'));
  const vLabel = document.getElementById('settings-version-label') ?? document.querySelector('.settings-version-label');
  if (vLabel) vLabel.textContent = `バージョン ${CURRENT_VERSION}`;
  setTimeout(checkForUpdate, 3_000);
  setInterval(checkForUpdate, 5 * 60 * 1000);
});

// デバッグ用（コンソールからアクセス可能にする）
window._gs = () => gameState;
window._save = saveGame;

// インラインonclickから呼ばれる関数をグローバルに公開
window.equipSkin = equipSkin;

// ========== Firebase 連携 ==========

import {
  registerUser, loginUser, logoutUser,
  onAuthChanged, currentUser,
  saveScore, fetchRanking, changeDisplayName,
  saveGameData, loadGameData,
  redeemPersonalCoupon,
  claimPendingRewards,
} from './firebase.js';

let _authMode = 'login'; // 'login' | 'register'

function initFirebase() {
  // 認証状態の監視
  onAuthChanged(async user => {
    const authSec        = document.getElementById('auth-section');
    const loggedSec      = document.getElementById('loggedin-section');
    const nameEl         = document.getElementById('user-name-display');
    const rankingPrompt  = document.getElementById('ranking-login-prompt');
    const rankingUserBar = document.getElementById('ranking-user-bar');
    const rankingUserName = document.getElementById('ranking-user-name');
    const scoreNote      = document.getElementById('score-upload-note');
    if (user) {
      authSec.classList.add('hidden');
      loggedSec.classList.remove('hidden');
      rankingPrompt.classList.add('hidden');
      rankingUserBar.classList.remove('hidden');
      if (scoreNote) scoreNote.classList.remove('hidden');
      if (nameEl) nameEl.textContent = user.displayName ?? '名無し';
      if (rankingUserName) rankingUserName.textContent = `👋 ${user.displayName ?? '名無し'}`;

      // ① クラウドセーブを先に確認（登録ボーナスより前に行う）
      // ※ 登録ボーナスで saveGame() すると lastSaved が更新されてクラウドより新しく見えてしまい
      //   クラウドデータが上書き消去されるバグを防ぐため、必ずクラウド比較を先に行う
      try {
        const cloudJson = await loadGameData();
        if (cloudJson) {
          const cloudState = JSON.parse(cloudJson);
          const localSaved = gameState.lastSaved ?? 0;
          const cloudSaved = cloudState.lastSaved ?? 0;
          const localTotalMoku = gameState.totalMoku ?? 0;
          const cloudTotalMoku = cloudState.totalMoku ?? 0;
          const localPrestige = gameState.prestigeLevel ?? 0;
          const cloudPrestige = cloudState.prestigeLevel ?? 0;
          // クラウドのtotalMokuを記録（saveGameCloudで低品質上書き防止に使用）
          _minCloudTotalMoku = cloudTotalMoku;
          // 転生回数を優先比較（totalMokuは転生でリセットされるため巻き戻り判定に使えない）
          const cloudIsNewer = cloudSaved > localSaved;
          const cloudHasMoreProgress = cloudPrestige > localPrestige ||
            (cloudPrestige === localPrestige && cloudTotalMoku > localTotalMoku);

          const localIsEmpty = (gameState.moku ?? 0) === 0
            && Object.keys(gameState.employees ?? {}).length === 0
            && (gameState.tapCount ?? 0) === 0;

          const applyCloudRestore = () => {
            // ownedSkins / usedCoupons はローカルとクラウドを合わせて引き継ぐ
            // （クラウドより新しいローカルで取得したスキンが上書き消去されるバグを防止）
            const mergedSkins   = [...new Set([...(cloudState.ownedSkins  ?? []), ...(gameState.ownedSkins  ?? [])])];
            const mergedCoupons = [...new Set([...(cloudState.usedCoupons ?? []), ...(gameState.usedCoupons ?? [])])];
            Object.assign(gameState, cloudState);
            gameState.ownedSkins  = mergedSkins;
            gameState.usedCoupons = mergedCoupons;
            recalcTapPower();
            recalcMPS();
            // lastSaved を更新せずに保存（リロード後のオフライン収益計算のため）
            const json = JSON.stringify(gameState);
            localStorage.setItem(SAVE_KEY, json);
            localStorage.setItem(CHECKSUM_KEY, computeChecksum(json));
            location.reload();
          };

          if (cloudIsNewer || cloudHasMoreProgress) {
            if (localIsEmpty) {
              // ローカルが空なら確認不要で自動復元
              applyCloudRestore();
              return;
            }
            const d = new Date(cloudSaved);
            const dateStr = `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
            if (confirm(`☁️ クラウドにセーブデータが見つかりました！\n保存日時: ${dateStr}\n\nクラウドのデータを引き継ぎますか？`)) {
              applyCloudRestore();
              return;
            }
          } else {
            // ローカルが新しければクラウドを自動更新
            // ただしローカルが空状態（moku=0 かつ従業員なし）の場合は上書きしない
            if (!localIsEmpty) {
              saveGameData(JSON.stringify(gameState)).catch(() => {});
            }
          }
        }
      } catch (e) {
        console.warn('[mokuzu] クラウドセーブの読み込みに失敗', e);
      }
      _cloudCheckDone = true;

      // ② 登録ボーナス付与（クラウド比較の後）
      if (!gameState.registrationBonusClaimed) {
        gameState.registrationBonusClaimed = true;
        const isPrestiged = (gameState.prestigeLevel ?? 0) >= 1;
        const bonusLines = [
          '☁️ クラウドセーブ有効化',
          '📅 デイリーボーナス +5コイン（毎回）',
          '🌙 オフライン補填 80% にアップ！',
        ];
        if (isPrestiged) {
          gameState.mokuCoins = (gameState.mokuCoins ?? 0) + 10;
          bonusLines.push('🪙 藻コイン +10枚 プレゼント！');
        } else {
          gameState.prestigeStones = (gameState.prestigeStones ?? 0) + 10;
          bonusLines.push('✨ 転生石 +10石 プレゼント！');
        }
        gameState.hasRegistered = true;
        saveGame();
        updateDisplay();
        document.getElementById('regbonus-list').innerHTML =
          bonusLines.map(l => `<p class="regbonus-line">${l}</p>`).join('');
        document.getElementById('regbonus-modal').classList.remove('hidden');
      } else {
        gameState.hasRegistered = true;
        saveGame();
      }

      checkDailyOnStartup();

      // pendingRewardsを確認・適用
      try {
        const rewards = await claimPendingRewards();
        if (rewards.length > 0) {
          for (const reward of rewards) {
            if (reward.type === 'coins')      gameState.mokuCoins      = (gameState.mokuCoins      ?? 0) + reward.amount;
            if (reward.type === 'stones')     gameState.prestigeStones  = (gameState.prestigeStones ?? 0) + reward.amount;
            if (reward.type === 'moku')       { gameState.moku = (gameState.moku ?? 0) + reward.amount; gameState.totalMoku = (gameState.totalMoku ?? 0) + reward.amount; }
            if (reward.type === 'gacha_coin') {
              gameState.consumables = gameState.consumables ?? {};
              gameState.consumables['gacha_coin'] = (gameState.consumables['gacha_coin'] ?? 0) + reward.amount;
            }
            if (reward.type === 'pet' && reward.id) {
              if (!gameState.ownedPets) gameState.ownedPets = {};
              const current  = gameState.ownedPets[reward.id];
              const newStage = reward.stageIndex ?? 0;
              if (!current || current.stageIndex < newStage) {
                gameState.ownedPets[reward.id] = { stageIndex: newStage, conditionMetAt: null };
                if (!gameState.activePetType) gameState.activePetType = reward.id;
              }
            }
          }
          saveGame();
          updateDisplay();
          renderPetEggShop();
          renderPetSection();
          renderPetZukan();
          alert(`🎁 管理者から補填が届いています！\n${rewards.map(r => r.desc ?? '').filter(Boolean).join('\n')}`);
        }
      } catch (e) {
        console.warn('[mokuzu] pendingRewards の取得に失敗', e);
      }
    } else {
      _cloudCheckDone = false;
      authSec.classList.remove('hidden');
      loggedSec.classList.add('hidden');
      rankingPrompt.classList.remove('hidden');
      rankingUserBar.classList.add('hidden');
      if (scoreNote) scoreNote.classList.add('hidden');
      checkDailyOnStartup();
    }
    loadRanking();
  });

  // ログイン/登録タブ切り替え
  document.getElementById('auth-tab-login').addEventListener('click', () => {
    _authMode = 'login';
    document.getElementById('auth-tab-login').classList.add('active');
    document.getElementById('auth-tab-register').classList.remove('active');
    document.getElementById('register-name-wrap').classList.add('hidden');
    document.getElementById('auth-submit-btn').textContent = 'ログイン';
    document.getElementById('auth-error').textContent = '';
  });

  document.getElementById('auth-tab-register').addEventListener('click', () => {
    _authMode = 'register';
    document.getElementById('auth-tab-register').classList.add('active');
    document.getElementById('auth-tab-login').classList.remove('active');
    document.getElementById('register-name-wrap').classList.remove('hidden');
    document.getElementById('auth-submit-btn').textContent = '登録する';
    document.getElementById('auth-error').textContent = '';
  });

  // 送信
  document.getElementById('auth-submit-btn').addEventListener('click', async () => {
    const email    = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const errorEl  = document.getElementById('auth-error');
    errorEl.textContent = '';

    try {
      if (_authMode === 'register') {
        const name = document.getElementById('auth-name').value.trim();
        if (!name) { errorEl.textContent = 'プレイヤー名を入力してください'; return; }
        await registerUser(name, email, password);
        // onAuthChanged は updateProfile より先に発火するので登録後に名前を手動更新
        const nameEl2 = document.getElementById('user-name-display');
        const rankEl2 = document.getElementById('ranking-user-name');
        if (nameEl2) nameEl2.textContent = name;
        if (rankEl2) rankEl2.textContent = `👋 ${name}`;
      } else {
        await loginUser(email, password);
      }
    } catch (e) {
      const code = e?.code ?? '';
      if (_authMode === 'register') {
        if (code === 'auth/email-already-in-use') {
          errorEl.textContent = 'このメールアドレスはすでに使われています';
        } else if (code === 'auth/invalid-email') {
          errorEl.textContent = 'メールアドレスの形式が正しくありません（例: test@test.com）';
        } else if (code === 'auth/weak-password') {
          errorEl.textContent = 'パスワードは6文字以上にしてください';
        } else {
          errorEl.textContent = `登録に失敗しました（${code}）`;
        }
      } else {
        errorEl.textContent = 'メールアドレスまたはパスワードが間違っています';
      }
    }
  });

  // ログアウト
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await logoutUser();
  });

  // プレイヤー名変更
  document.getElementById('name-change-btn').addEventListener('click', async () => {
    const input  = document.getElementById('name-change-input');
    const msgEl  = document.getElementById('name-change-msg');
    const newName = input.value.trim();
    if (!newName) { msgEl.textContent = '名前を入力してください'; msgEl.style.color = '#ff5566'; return; }
    const btn = document.getElementById('name-change-btn');
    btn.disabled = true;
    btn.textContent = '変更中...';
    try {
      await changeDisplayName(newName);
      document.getElementById('user-name-display').textContent = newName;
      input.value = '';
      msgEl.textContent = '✅ 名前を変更しました！';
      msgEl.style.color = '#3dff7a';
      const historyTotal = (gameState.prestigeHistory ?? []).reduce((sum, e) => sum + (e.totalMoku ?? 0), 0);
      const lifetimeTotal = historyTotal + (gameState.totalMoku ?? 0);
      await saveScore(lifetimeTotal, gameState.prestigeLevel ?? 0);
      await loadRanking();
    } catch {
      msgEl.textContent = '❌ 変更に失敗しました';
      msgEl.style.color = '#ff5566';
    }
    btn.disabled = false;
    btn.textContent = '変更';
    setTimeout(() => { msgEl.textContent = ''; }, 3000);
  });

  // スコア登録
  document.getElementById('score-upload-btn').addEventListener('click', async () => {
    const btn = document.getElementById('score-upload-btn');
    btn.disabled = true;
    btn.textContent = '送信中...';
    try {
      const historyTotal = (gameState.prestigeHistory ?? []).reduce((sum, e) => sum + (e.totalMoku ?? 0), 0);
      const lifetimeTotal = historyTotal + (gameState.totalMoku ?? 0);
      await saveScore(lifetimeTotal, gameState.prestigeLevel ?? 0);
      btn.textContent = '✅ 登録しました！';
      await loadRanking();
    } catch {
      btn.textContent = '❌ 失敗しました';
    }
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = '📤 スコアを登録する';
    }, 2000);
  });

  // ランキング更新
  document.getElementById('ranking-refresh-btn').addEventListener('click', loadRanking);

  // ランキングタブの設定を開くボタン
  document.getElementById('open-settings-from-ranking').addEventListener('click', () => {
    document.getElementById('settings-modal').classList.remove('hidden');
  });
}

async function loadRanking() {
  const list = document.getElementById('ranking-list');
  const btn  = document.getElementById('ranking-refresh-btn');
  if (!list) return;

  if (btn) { btn.disabled = true; btn.textContent = '⏳ 読み込み中...'; }

  try {
    const combined = (await fetchRanking()).map((r, i) => ({ rank: i + 1, ...r }));
    if (combined.length === 0) {
      list.innerHTML = '<p class="section-note">まだ誰も登録していません！</p>';
      return;
    }
    const me = currentUser();
    const header = `
      <div class="ranking-row ranking-header-row">
        <span class="ranking-rank"></span>
        <span class="ranking-name">名前</span>
        <span class="ranking-score">全転生累計獲得藻</span>
        <span class="ranking-prestige">転生回数</span>
      </div>`;
    list.innerHTML = header + combined.map(r => {
      const medal     = r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : `${r.rank}.`;
      const isMe      = me && r.name === me.displayName;
      const highlight = isMe ? ' ranking-me' : '';
      return `
        <div class="ranking-row${highlight}">
          <span class="ranking-rank">${medal}</span>
          <span class="ranking-name">${r.name}</span>
          <span class="ranking-score">${fmt(r.totalMoku)} 藻</span>
          <span class="ranking-prestige">${r.prestigeLevel ?? 0}回</span>
        </div>
      `;
    }).join('');
  } catch {
    list.innerHTML = '<p class="section-note">読み込みに失敗しました</p>';
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '🔄 更新'; }
  }
}


// ========== Service Worker 解除 ==========
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
}

