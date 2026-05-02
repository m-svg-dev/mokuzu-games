// ========== 定数定義 ==========

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
    royalheart:    'assets/items/royalheart.png',
    mo_royalheart: 'assets/items/mo_royalheart.png',
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
    sprite.style.objectFit = SUIT_COVER_FIT.has(effectiveSuit) ? 'cover' : 'contain';
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
  if (n >= 200) return 50_000_000 + (n - 200) * 2_000_000;
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
  if (totalMoku >= 50_000_000) return 200;
  let level = 1;
  for (let n = 2; n <= 200; n++) {
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

const PET_TYPES = [
  { id: 'green',  name: '緑の精霊',  icon: '🌿', row: 0, buyCost: { type: 'coins',  amount: 30 }, effectType: 'tap',  effectDesc: 'タップ倍率アップ' },
  { id: 'pink',   name: '桜の精霊',  icon: '🌸', row: 1, buyCost: { type: 'stones', amount: 20 }, effectType: 'mps',  effectDesc: 'MPS倍率アップ'   },
  { id: 'purple', name: '月の精霊',  icon: '🌙', row: 2, buyCost: { type: 'stones', amount: 50 }, effectType: 'coin', effectDesc: 'デイリー藻コイン獲得アップ' },
];

const PET_STAGES = [
  { id: 'egg',     name: '卵',     col: 0, mult: 1.0, condition: null,                                             waitHours: 0  },
  { id: 'growth',  name: '成長期', col: 1, mult: 1.1, condition: { mokuCost: 500_000 },                           waitHours: 1  },
  { id: 'mature',  name: '成熟期', col: 2, mult: 1.25,condition: { mokuCost: 3_000_000 },                         waitHours: 12 },
  { id: 'perfect', name: '完全期', col: 3, mult: 1.5, condition: { mokuCost: 20_000_000, prestigeMin: 1 },        waitHours: 24 },
  { id: 'ultimate',name: '究極期', col: 4, mult: 2.0, condition: { mokuCost: 100_000_000, prestigeMin: 3 },       waitHours: 72 },
];

function getPetSpriteStyle(typeId, stageIndex) {
  const stage = PET_STAGES[stageIndex];
  if (!stage) return '';
  const path = `assets/pet/${typeId}_${stage.id}.png`;
  return `background-image:url('${path}');background-size:cover;background-position:center;background-repeat:no-repeat;`;
}

function getPetMultiplier() {
  const typeId = gameState.activePetType;
  if (!typeId) return { tap: 1, mps: 1, coin: 1 };
  const pet  = (gameState.ownedPets ?? {})[typeId];
  if (!pet) return { tap: 1, mps: 1, coin: 1 };
  const mult = PET_STAGES[pet.stageIndex ?? 0]?.mult ?? 1;
  const type = PET_TYPES.find(t => t.id === typeId);
  return {
    tap:  type?.effectType === 'tap'  ? mult : 1,
    mps:  type?.effectType === 'mps'  ? mult : 1,
    coin: type?.effectType === 'coin' ? mult : 1,
  };
}

// ネタアイテム・装飾アイテム（一度きりの購入）
const ITEMS = [
  { id: 'royalheart',    name: 'ロイヤルハート',   icon: '👑', desc: '藻屑界のエリートの証！',     cost: 5_000_000,  overlayPos: 'top-left'  },
  { id: 'mo_royalheart', name: '藻ロイヤルハート', icon: '🌿', desc: '藻屑界の頂点に立つ者の証！', cost: 10_000_000, overlayPos: 'top-right' },
];

// 購入ごとに tapBonus が加算される（baseCost * costMult^購入回数 で価格上昇）
const UPGRADES = [
  { id: 'tap1', name: 'タップ強化 I',   icon: '💪', desc: 'タップ +1',   baseCost: 8,     costMult: 2.0, tapBonus: 1,   maxCount: 10 },
  { id: 'tap2', name: 'タップ強化 II',  icon: '💪', desc: 'タップ +5',   baseCost: 60,    costMult: 2.0, tapBonus: 5,   maxCount: 10 },
  { id: 'tap3', name: 'タップ強化 III', icon: '💪', desc: 'タップ +25',  baseCost: 500,   costMult: 2.0, tapBonus: 25,  maxCount: 10 },
  { id: 'tap4', name: 'タップ強化 IV',  icon: '💪', desc: 'タップ +100', baseCost: 5_000, costMult: 2.0, tapBonus: 100, maxCount: 10 },
];

// 所持数に応じて MPS が増加（baseCost * 1.15^所持数 で価格上昇）
const EMPLOYEES = [
  { id: 'algae',    name: '小型海藻バイト', icon: '🌿', baseCost: 8,      mpsBonus: 0.1  },
  { id: 'jellyfish',name: 'クラゲ社員',     icon: '🪼', baseCost: 80,     mpsBonus: 0.6  },
  { id: 'crab',     name: 'カニ主任',       icon: '🦀', baseCost: 800,    mpsBonus: 3.0  },
  { id: 'coral',    name: 'サンゴ管理職',   icon: '🪸', baseCost: 5_000,  mpsBonus: 10.0 },
  { id: 'shark',    name: 'サメ幹部',       icon: '🦈', baseCost: 30_000, mpsBonus: 40.0 },
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
  { id: 'skin_black',   name: '黒スーツ',         rarity: 'N',   suit: 'black',   prob: 0.60  },
  { id: 'skin_blue',    name: '青スーツ',         rarity: 'R',   suit: 'blue',    prob: 0.125 },
  { id: 'skin_green',   name: '緑スーツ',         rarity: 'R',   suit: 'green',   prob: 0.125 },
  { id: 'skin_red',     name: '赤スーツ',         rarity: 'SR',  suit: 'red',     prob: 0.06  },
  { id: 'skin_gold',    name: '金スーツ',         rarity: 'SR',  suit: 'gold',    prob: 0.06  },
  { id: 'skin_rainbow', name: 'レインボースーツ', rarity: 'SSR', suit: 'rainbow', prob: 0.01  },
  { id: 'skin_silver',  name: 'シルバースーツ',   rarity: 'SSR', suit: 'silver',  prob: 0.01  },
  { id: 'skin_white',   name: 'ホワイトスーツ',   rarity: 'SSR', suit: 'white',   prob: 0.01  },
];

const RARITY_COLOR  = { N: '#888888', R: '#4499ff', SR: '#ffd700', SSR: '#ff44ff' };
const RARITY_DUPE_STONES = { N: 1, R: 5, SR: 15, SSR: 50 };

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
  { id: 'pStone',  name: '転生加速',            desc: '転生石獲得量 ×2',            costs: [500],                  type: 'stoneMult',  value: 2,    maxLevel: 1 },
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
  ownedPets:            {},     // { typeId: { stageIndex, conditionMetAt } }
  activePetType:        null,   // 現在アクティブなペットのtypeId
  lastReadUpdateId:     null,   // 最後に既読にした更新ID
};

let gameState = structuredClone(DEFAULT_STATE);

// ========== ユーティリティ ==========

function fmt(n) {
  n = Math.floor(n);
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B';
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 10_000)        return (n / 1_000).toFixed(1) + 'K';
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
  const isMult = ['tapMult', 'mpsMult', 'awakenMult', 'stoneMult'].includes(type);
  let bonus = isMult ? 1 : 0;
  for (const s of PRESTIGE_SKILLS) {
    if (s.type !== type) continue;
    const lv = gameState.prestigeSkills?.[s.id] ?? 0;
    if (isMult) bonus *= Math.pow(s.value, lv);
    else        bonus += s.value * lv;
  }
  return bonus;
}

function recalcTapPower() {
  let power = 1;
  for (const u of UPGRADES) {
    power += u.tapBonus * (gameState.upgrades[u.id] ?? 0);
  }
  for (const f of FACILITIES) {
    if (f.tapBonus) power += f.tapBonus * (gameState.facilities[f.id] ?? 0);
  }
  gameState.tapPower = power * getPrestigeBonus('tapMult');
}

function recalcMPS() {
  let mps = 0;
  for (const emp of EMPLOYEES) {
    mps += emp.mpsBonus * (gameState.employees[emp.id] ?? 0);
  }
  for (const f of FACILITIES) {
    if (f.mpsBonus) mps += f.mpsBonus * (gameState.facilities[f.id] ?? 0);
  }
  gameState.mokuPerSecond = mps * getPrestigeBonus('mpsMult');
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
  if (levelEl) levelEl.textContent = `Lv.${lv}　${SUIT_LABELS[suit]}スーツ`;

  // XPバー
  const xpCurrent = gameState.totalMoku - mokuForLevel(lv);
  const xpNeeded  = mokuForLevel(lv + 1) - mokuForLevel(lv);
  const xpPct     = lv >= 200 ? 100 : Math.min(100, Math.floor(xpCurrent / xpNeeded * 100));
  const xpBar  = document.getElementById('xp-bar');
  const xpText = document.getElementById('xp-text');
  if (xpBar)  xpBar.style.width = `${xpPct}%`;
  if (xpText) xpText.textContent = lv >= 200 ? 'MAX' : `${fmt(xpCurrent)} / ${fmt(xpNeeded)}`;

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
}

const PRESTIGE_THRESHOLD = 10_000_000;

function updatePrestigeBar() {
  const total   = gameState.totalMoku ?? 0;
  const pct     = Math.min(100, Math.floor(total / PRESTIGE_THRESHOLD * 100));
  const ready   = total >= PRESTIGE_THRESHOLD;

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
    const stonesPreview = Math.floor(total / 1_000_000) * getPrestigeBonus('stoneMult');
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
    remEl.textContent   = `あと ${fmt(PRESTIGE_THRESHOLD - total)} 藻`;
    if (stonePreview) stonePreview.classList.add('hidden');
  }
}

function updateGoalPanel() {
  const labelEl = document.getElementById('goal-label');
  const remEl   = document.getElementById('goal-remaining');
  if (!labelEl || !remEl) return;

  const lv = calcLevelFromMoku(gameState.totalMoku);

  const SUIT_GOALS = [
    { level: 10,  suit: '青',         emoji: '🟦' },
    { level: 25,  suit: '緑',         emoji: '🟩' },
    { level: 50,  suit: '赤',         emoji: '🟥' },
    { level: 100, suit: '金',         emoji: '🌟' },
    { level: 200, suit: 'レインボー', emoji: '🌈' },
  ];

  const next = SUIT_GOALS.find(g => lv < g.level);
  if (!next) {
    labelEl.textContent   = '🌈 全スーツ解放済み！';
    remEl.textContent     = '';
    return;
  }

  const needed = mokuForLevel(next.level) - gameState.totalMoku;
  labelEl.textContent = `🎯 Lv${next.level}で${next.emoji}${next.suit}スーツ解放！`;
  remEl.textContent   = `あと ${fmt(Math.max(0, needed))} 藻`;
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
  el.className = `suit-${suit}`;
  if (gameState.isAwakened) el.classList.add('awakened');
  applyCharacterSprite(suit);
}

// ========== タップ処理 ==========

let tapLocked = false;

function onTap(e) {
  e.preventDefault();
  if (tapLocked) return;
  tapLocked = true;
  setTimeout(() => { tapLocked = false; }, 50);

  const awakenMult   = gameState.isAwakened ? 5 * getPrestigeBonus('awakenMult') : 1;
  const eventMult    = gameState.eventTapMult ?? 1;
  const tapBoostMult = isEffectActive('tap_boost') ? 10 : 1;
  const petTapMult   = getPetMultiplier().tap;
  const critRate     = 0.05 + getPrestigeBonus('critRate');
  const critMult     = 3    + getPrestigeBonus('critMult');
  const isCritical   = Math.random() < critRate;
  const gained       = gameState.tapPower * awakenMult * eventMult * tapBoostMult * petTapMult * (isCritical ? critMult : 1);

  gameState.moku      += gained;
  gameState.totalMoku += gameState.tapPower; // ボーナス倍率は totalMoku に含めない

  gameState.awakenGauge = Math.min(100, (gameState.awakenGauge ?? 0) + 2);

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
  gameState.totalMoku += gameState.mokuPerSecond; // ボーナス倍率は含めない

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

  updateDisplay();
  updateEventDisplay();
}

// ========== 覚醒モード ==========

function activateAwaken() {
  if (gameState.awakenGauge < 100 || gameState.isAwakened) return;
  gameState.isAwakened  = true;
  gameState.awakenTimer = 30;
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
  return pool[Math.floor(Math.random() * pool.length)];
}

function triggerRandomEvent() {
  const ev = gameState.nextEventId
    ? (EVENTS.find(e => e.id === gameState.nextEventId) ?? pickRandomEvent())
    : pickRandomEvent();
  gameState.activeEvent  = { id: ev.id, timer: ev.duration };
  gameState.nextEventId  = null;

  if (ev.type === 'tap_mult')   gameState.eventTapMult = ev.value;
  if (ev.type === 'mps_mult')   gameState.eventMpsMult = ev.value;
  if (ev.type === 'all_mult')   { gameState.eventTapMult = ev.value; gameState.eventMpsMult = ev.value; }
  if (ev.type === 'moku_bonus') gameState.moku += gameState.moku * ev.value;
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
    gameState.totalMoku += gameState.tapPower;
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
    doGachaPull(1);
  }

  playSound('buy');
  updateDisplay();
}

function buyConsumable(itemId) {
  const item = CONSUMABLE_ITEMS.find(x => x.id === itemId);
  if (!item) return;
  if ((gameState.mokuCoins ?? 0) < item.cost) return;

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
      : `📅 デイリー +${DAILY_COINS}`;
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
        <div class="item-cost">🪙 ${item.cost}</div>
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

  for (const item of ITEMS) {
    if (!(gameState.equippedItems ?? []).includes(item.id)) continue;
    const src = IMAGE_CONFIG.items[item.id];
    if (!src) continue;
    const img = document.createElement('img');
    img.src = src;
    img.className = `item-overlay item-overlay-${item.overlayPos ?? 'top-left'}`;
    img.alt = item.name;
    container.appendChild(img);
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
  updateDisplay();
}

function switchPet(typeId) {
  if (!(gameState.ownedPets ?? {})[typeId]) return;
  gameState.activePetType = typeId;
  saveGame();
  renderPetEggShop();
  renderPetSection();
  updateDisplay();
}

function tryEvolvePet() {
  const typeId = gameState.activePetType;
  if (!typeId) return;
  const pet = (gameState.ownedPets ?? {})[typeId];
  if (!pet || pet.stageIndex >= PET_STAGES.length - 1) return;
  const nextStage = PET_STAGES[pet.stageIndex + 1];
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

// ========== お知らせ ==========

function hasUnreadUpdate() {
  const lastRead = gameState.lastReadUpdateId;
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

  // 既読にする
  gameState.lastReadUpdateId = UPDATE_LOG[0].id;
  saveGame();
  updateNoticeBadge();
}

function showEvolveModal(typeId, stageIndex) {
  const type  = PET_TYPES.find(t => t.id === typeId);
  const stage = PET_STAGES[stageIndex];
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

    for (let i = 0; i < PET_STAGES.length; i++) {
      const stage     = PET_STAGES[i];
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
  const owned  = gameState.ownedPets ?? {};
  const active = gameState.activePetType;
  container.innerHTML = '';

  for (const type of PET_TYPES) {
    const isOwned  = !!owned[type.id];
    const isActive = active === type.id;
    const canAfford = type.buyCost.type === 'coins'
      ? (gameState.mokuCoins ?? 0) >= type.buyCost.amount
      : (gameState.prestigeStones ?? 0) >= type.buyCost.amount;
    const costLabel = type.buyCost.type === 'coins'
      ? `<img class="mocoin-icon" src="assets/ui/mocoin.png" alt="藻コイン"> ${type.buyCost.amount} コイン`
      : `<img class="prestige-stone-icon" src="assets/prestige/prestige_stone.png" alt="転生石"> ${type.buyCost.amount} 転生石`;

    let btnLabel, btnClass, btnDisabled;
    if (!isOwned) {
      btnLabel   = '購入';
      btnClass   = canAfford ? '' : ' disabled';
      btnDisabled = !canAfford;
    } else if (isActive) {
      btnLabel   = '✅ 育成中';
      btnClass   = ' active';
      btnDisabled = true;
    } else {
      btnLabel   = '切り替え';
      btnClass   = '';
      btnDisabled = false;
    }

    const stageIndex = isOwned ? (owned[type.id].stageIndex ?? 0) : 0;
    const stageName  = isOwned ? PET_STAGES[stageIndex].name : '未入手';

    const card = document.createElement('div');
    card.className = `pet-egg-card${isActive ? ' is-active' : ''}`;
    card.innerHTML = `
      <div class="pet-egg-sprite" style="${getPetSpriteStyle(type.id, stageIndex)}"></div>
      <div class="pet-egg-info">
        <div class="pet-egg-name">${type.icon} ${type.name}</div>
        <div class="pet-egg-effect">${type.effectDesc}</div>
        <div class="pet-egg-cost">${isOwned ? `現在: ${stageName}` : costLabel}</div>
      </div>
      <button class="pet-egg-btn${btnClass}" ${btnDisabled ? 'disabled' : ''}>${btnLabel}</button>
    `;
    if (!btnDisabled) {
      card.querySelector('.pet-egg-btn').addEventListener('click', () =>
        isOwned ? switchPet(type.id) : buyEgg(type.id)
      );
    }
    container.appendChild(card);
  }
}

function renderPetSection() {
  const container = document.getElementById('pet-section');
  if (!container) return;
  const typeId = gameState.activePetType;
  const pet    = typeId ? (gameState.ownedPets ?? {})[typeId] : null;

  if (!pet) {
    container.innerHTML = '<p class="section-note">下のペット卵ショップから卵を購入してペットを育てよう！</p>';
    return;
  }

  const type      = PET_TYPES.find(t => t.id === typeId);
  const stage     = PET_STAGES[pet.stageIndex];
  const nextStage = PET_STAGES[pet.stageIndex + 1];
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
          <button class="pet-evolve-btn ready" id="pet-evolve-btn">👑 進化！</button>`;
      } else {
        const hours = Math.ceil(remaining / 3_600_000);
        evolveHtml = `<p class="pet-evolve-waiting">⏳ 進化準備中... あと約${hours}時間</p>`;
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
        <button class="pet-evolve-btn${canEvolve ? '' : ' disabled'}" id="pet-evolve-btn" ${canEvolve ? '' : 'disabled'}>
          🌱 進化準備する
        </button>`;
    }
  } else {
    evolveHtml = '<p class="pet-evolve-cond">👑 最終進化形態です</p>';
  }

  container.innerHTML = `
    <div class="pet-card">
      <div class="pet-sprite" style="${getPetSpriteStyle(typeId, pet.stageIndex)}"></div>
      <div class="pet-info">
        <div class="pet-name">${type.icon} ${type.name}</div>
        <div class="pet-stage-badge">${stage.name}</div>
        <div class="pet-effect-label">${effectLabel} × ${mult}</div>
      </div>
    </div>
    <div class="pet-evolve-section">${evolveHtml}</div>
  `;

  const btn = document.getElementById('pet-evolve-btn');
  if (btn && !btn.disabled) btn.addEventListener('click', tryEvolvePet);
}

function renderItemList() {
  const container = document.getElementById('item-list');
  if (!container) return;

  if (!container.dataset.initialized) {
    container.className = 'item-list';
    for (const item of ITEMS) {
      const btn = document.createElement('button');
      btn.id = `item-btn-${item.id}`;
      btn.addEventListener('click', () => buyItem(item.id));
      container.appendChild(btn);
    }
    container.dataset.initialized = '1';
  }

  for (const item of ITEMS) {
    const bought    = (gameState.purchasedItems ?? []).includes(item.id);
    const equipped  = (gameState.equippedItems  ?? []).includes(item.id);
    const canBuy    = !bought && gameState.moku >= item.cost;
    const btn       = document.getElementById(`item-btn-${item.id}`);
    const src       = IMAGE_CONFIG.items[item.id];
    const iconStyle = src
      ? `background-image:url('${src}');background-size:contain;background-position:center;background-repeat:no-repeat;font-size:0;`
      : '';

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

    btn.className = `item-btn${extraClass}`;
    btn.innerHTML = `
      <div class="item-icon" style="${iconStyle}">${iconStyle ? '' : item.icon}</div>
      <div class="item-info">
        <div class="item-name">${item.name}</div>
        <div class="item-desc">${item.desc}</div>
      </div>
      <div class="item-right">
        <div class="item-cost">${statusText}</div>
      </div>
    `;
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

function doGachaPull(count = 1) {
  const cost = count === 1 ? 50 : 450;
  if ((gameState.prestigeStones ?? 0) < cost) return;
  gameState.prestigeStones -= cost;

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
  applyCharacterSprite(gameState.suit);
  updateDisplay();
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
}

// ========== 転生（プレステージ） ==========

function doPrestige() {
  if ((gameState.totalMoku ?? 0) < PRESTIGE_THRESHOLD) return;
  const stonesEarned = Math.floor(gameState.totalMoku / 1_000_000) * getPrestigeBonus('stoneMult');
  if (!confirm(`転生しますか？\n\n獲得: 転生石 +${stonesEarned}個\n\n藻・強化・社員・施設・イベント解放がリセットされます。\nアイテムとスキルは引き継がれます。`)) return;

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
  };

  gameState = structuredClone(DEFAULT_STATE);
  Object.assign(gameState, keep);
  recalcTapPower();
  recalcMPS();
  saveGame();
  updateItemOverlays();
  updateDisplay();
  updateEventDisplay();
  updatePrestigeBar();
}

function buyPrestigeSkill(skillId) {
  const s  = PRESTIGE_SKILLS.find(x => x.id === skillId);
  if (!s) return;
  const lv   = gameState.prestigeSkills?.[s.id] ?? 0;
  if (lv >= s.maxLevel) return;
  const cost = s.costs[lv];
  if ((gameState.prestigeStones ?? 0) < cost) return;

  gameState.prestigeStones -= cost;
  gameState.prestigeSkills = { ...gameState.prestigeSkills, [s.id]: lv + 1 };
  recalcTapPower();
  recalcMPS();
  playSound('buy');
  updateDisplay();
}

function renderPrestigeSkillList() {
  const container = document.getElementById('prestige-skill-list');
  if (!container) return;

  if (!container.dataset.initialized) {
    container.className = 'item-list';
    for (const s of PRESTIGE_SKILLS) {
      const btn = document.createElement('button');
      btn.id = `pskill-btn-${s.id}`;
      btn.addEventListener('click', () => buyPrestigeSkill(s.id));
      container.appendChild(btn);
    }
    container.dataset.initialized = '1';
  }

  for (const s of PRESTIGE_SKILLS) {
    const lv     = gameState.prestigeSkills?.[s.id] ?? 0;
    const maxed  = lv >= s.maxLevel;
    const cost   = maxed ? 0 : s.costs[lv];
    const canBuy = !maxed && (gameState.prestigeStones ?? 0) >= cost;
    const btn    = document.getElementById(`pskill-btn-${s.id}`);

    const dots = Array.from({ length: s.maxLevel }, (_, i) =>
      `<div class="item-count-dot${i < lv ? ' filled' : ''}"></div>`
    ).join('');

    btn.className = `item-btn${canBuy ? ' can-buy' : ''}${maxed ? ' maxed' : ''}`;
    btn.innerHTML = `
      <div class="item-icon">✨</div>
      <div class="item-info">
        <div class="item-name">${s.name}</div>
        <div class="item-desc">${s.desc}</div>
        <div class="item-count-bar">${dots}</div>
      </div>
      <div class="item-right">
        <div class="item-cost" style="color:#cc88ff">${maxed ? 'MAX' : `<img class="prestige-stone-icon" src="assets/prestige/prestige_stone.png" alt=""> ${cost} 転生石`}</div>
        <div class="item-count-label">${lv} / ${s.maxLevel}</div>
      </div>
    `;
  }
}

function updatePrestigeTab() {
  const lvEl     = document.getElementById('prestige-tab-level');
  const stoneEl  = document.getElementById('prestige-tab-stones');
  if (lvEl)    lvEl.innerHTML    = `<img class="prestige-badge-icon" src="assets/prestige/prestige_badge.png" alt=""> 転生 Lv.${gameState.prestigeLevel ?? 0}`;
  if (stoneEl) stoneEl.innerHTML = `<img class="prestige-stone-icon" src="assets/prestige/prestige_stone.png" alt="転生石"> 転生石: ${gameState.prestigeStones ?? 0}`;

  const exampleEl = document.getElementById('stone-guide-example');
  if (exampleEl) {
    const total      = gameState.totalMoku ?? 0;
    const stones     = Math.floor(total / 1_000_000) * getPrestigeBonus('stoneMult');
    const multiplier = getPrestigeBonus('stoneMult');
    const multStr    = multiplier > 1 ? `（転生加速×${multiplier}）` : '';
    exampleEl.textContent = total > 0
      ? `例: 現在 ${fmt(total)}藻 → 転生すると ${stones}石 獲得${multStr}`
      : '藻を貯めて転生してみよう！';
  }
  renderSkinCollection();
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

// ========== オフライン収益 ==========

function checkOfflineEarnings() {
  if (!gameState.lastSaved || gameState.lastSaved === 0) return;
  if (gameState.mokuPerSecond <= 0) return;

  const now        = Date.now();
  const elapsedSec = Math.floor((now - gameState.lastSaved) / 1000);
  const MIN_SEC    = 60;
  const MAX_SEC    = 28800; // 8時間

  if (elapsedSec < MIN_SEC) return;

  const cappedSec   = Math.min(elapsedSec, MAX_SEC);
  const offlineRate = gameState.hasRegistered ? 0.8 : 0.5;
  const earned      = Math.floor(gameState.mokuPerSecond * cappedSec * offlineRate);
  if (earned <= 0) return;

  gameState.moku      += earned;
  gameState.totalMoku += earned;

  const hours   = Math.floor(elapsedSec / 3600);
  const minutes = Math.floor((elapsedSec % 3600) / 60);
  const timeStr = hours > 0 ? `${hours}時間${minutes}分` : `${minutes}分`;
  const capped  = elapsedSec > MAX_SEC ? `（最大8時間で計算）` : '';

  const rateLabel = gameState.hasRegistered ? '80%' : '50%';
  document.getElementById('offline-title').textContent  = 'おかえり！🌿';
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
  _lastCloudSave = json;
  saveGameData(json).catch(() => {});
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return;

  // 改ざん検知
  const storedCs = localStorage.getItem(CHECKSUM_KEY);
  if (storedCs && computeChecksum(raw) !== storedCs) {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(CHECKSUM_KEY);
    alert('🚨 不正はダメだぜ！！\n0から頑張りな！！！');
    return;
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
    });
  });
}

// ========== 起動 ==========

function init() {
  loadGame();
  checkOfflineEarnings();
  checkDailyOnStartup();

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

  document.getElementById('offline-ok').addEventListener('click', () => {
    document.getElementById('offline-modal').classList.add('hidden');
  });

  document.getElementById('daily-modal-ok').addEventListener('click', () => {
    document.getElementById('daily-modal').classList.add('hidden');
  });

  document.getElementById('regbonus-ok').addEventListener('click', () => {
    document.getElementById('regbonus-modal').classList.add('hidden');
  });

  document.getElementById('gacha-btn-1') .addEventListener('click', () => doGachaPull(1));
  document.getElementById('gacha-btn-10').addEventListener('click', () => doGachaPull(10));
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
    if (document.visibilityState === 'hidden') { saveGame(); saveGameCloud(); }
  });
}

document.addEventListener('DOMContentLoaded', init);

// デバッグ用（コンソールからアクセス可能にする）
window._gs = () => gameState;
window._save = saveGame;

// ========== Firebase 連携 ==========

import {
  registerUser, loginUser, logoutUser,
  onAuthChanged, currentUser,
  saveScore, fetchRanking, changeDisplayName,
  saveGameData, loadGameData,
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

      // 登録ボーナス付与
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

      // クラウドセーブとローカルを比較
      try {
        const cloudJson = await loadGameData();
        if (cloudJson) {
          const cloudState = JSON.parse(cloudJson);
          const localSaved = gameState.lastSaved ?? 0;
          const cloudSaved = cloudState.lastSaved ?? 0;
          if (cloudSaved > localSaved) {
            const d = new Date(cloudSaved);
            const dateStr = `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
            if (confirm(`☁️ クラウドにセーブデータが見つかりました！\n保存日時: ${dateStr}\n\nクラウドのデータを引き継ぎますか？`)) {
              Object.assign(gameState, cloudState);
              recalcTapPower();
              recalcMPS();
              saveGame();
              location.reload();
            }
          } else {
            // ローカルが新しければクラウドを自動更新
            saveGameData(JSON.stringify(gameState)).catch(() => {});
          }
        }
      } catch (e) {
        console.warn('[mokuzu] クラウドセーブの読み込みに失敗', e);
      }
    } else {
      authSec.classList.remove('hidden');
      loggedSec.classList.add('hidden');
      rankingPrompt.classList.remove('hidden');
      rankingUserBar.classList.add('hidden');
      if (scoreNote) scoreNote.classList.add('hidden');
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
      await saveScore(gameState.totalMoku ?? 0, gameState.prestigeLevel ?? 0);
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
    list.innerHTML = combined.map(r => {
      const medal     = r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : `${r.rank}.`;
      const isMe      = me && r.name === me.displayName;
      const highlight = isMe ? ' ranking-me' : '';
      return `
        <div class="ranking-row${highlight}">
          <span class="ranking-rank">${medal}</span>
          <span class="ranking-name">${r.name}</span>
          <span class="ranking-score">${fmt(r.totalMoku)} 藻</span>
          <span class="ranking-prestige">転生${r.prestigeLevel ?? 0}回</span>
        </div>
      `;
    }).join('');
  } catch {
    list.innerHTML = '<p class="section-note">読み込みに失敗しました</p>';
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '🔄 更新'; }
  }
}
