// ========== 定数定義 ==========

const SAVE_VERSION = 1;
const SAVE_KEY     = 'mozuku_president_v1';

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
    royalheart: 'assets/items/royalheart.png',
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

function applyCharacterSprite(suit) {
  let effectiveSuit = suit;
  if (gameState.equippedSkin) {
    const skin = GACHA_SKINS.find(s => s.id === gameState.equippedSkin);
    if (skin) effectiveSuit = skin.suit;
  }
  const src = IMAGE_CONFIG.character.suits[effectiveSuit] ?? IMAGE_CONFIG.character.suits.black;
  const sprite = document.getElementById('character-sprite');
  if (sprite) sprite.src = src;
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

// ネタアイテム・装飾アイテム（一度きりの購入）
const ITEMS = [
  { id: 'royalheart', name: 'ロイヤルハート', icon: '👑', desc: '藻屑界のエリートの証！', cost: 5_000_000, overlayPos: 'top-left' },
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
  { id: 'jellyfish',name: 'クラゲ室長',     icon: '🪼', baseCost: 80,     mpsBonus: 0.6  },
  { id: 'crab',     name: 'カニ経営者',     icon: '🦀', baseCost: 800,    mpsBonus: 3.0  },
  { id: 'coral',    name: 'サンゴ工場長',   icon: '🪸', baseCost: 5_000,  mpsBonus: 10.0 },
  { id: 'shark',    name: 'サメ取締役',     icon: '🦈', baseCost: 30_000, mpsBonus: 40.0 },
];

const EVENTS = [
  // ── デフォルト解放済み（unlockCost: 0） ──
  { id: 'bonus_tap',       name: '藻の大発生！',           icon: '🌊', desc: 'タップ効率 ×3（20秒）',           type: 'tap_mult',   value: 3,   duration: 20, unlockCost: 0       },
  { id: 'bonus_mps',       name: '自動収穫強化！',         icon: '⚡', desc: '自動収益 ×2（30秒）',             type: 'mps_mult',   value: 2,   duration: 30, unlockCost: 0       },
  { id: 'bonus_moku',      name: 'ボーナス収穫！',         icon: '💎', desc: '現在の藻 +10%（即時）',           type: 'moku_bonus', value: 0.1, duration: 3,  unlockCost: 0       },
  { id: 'rough_current',   name: '海流が荒れている…',     icon: '🌀', desc: '自動収益 -30%（20秒）',           type: 'mps_mult',   value: 0.7, duration: 20, unlockCost: 0       },
  // ── 藻で解放可能 ──
  { id: 'jellyfish_swarm', name: 'クラゲの大群襲来！',     icon: '🪼', desc: 'タップ効率 ×2（40秒）',           type: 'tap_mult',   value: 2,   duration: 40, unlockCost: 500     },
  { id: 'human_spotted',   name: '人間にバレそうだ！',     icon: '👁️', desc: '話題沸騰！自動収益 ×1.5（30秒）', type: 'mps_mult',   value: 1.5, duration: 30, unlockCost: 1_000   },
  { id: 'moku_bubble',     name: '海流バブル発生！',       icon: '🫧', desc: 'タップ効率 ×5（15秒）',           type: 'tap_mult',   value: 5,   duration: 15, unlockCost: 3_000   },
  { id: 'shark_deal',      name: 'サメが営業に来た！',     icon: '🦈', desc: '自動収益 ×3（45秒）',             type: 'mps_mult',   value: 3,   duration: 45, unlockCost: 8_000   },
  { id: 'deep_factory',    name: '深海工場の稼働！',       icon: '🏭', desc: '自動収益 ×2（60秒）',             type: 'mps_mult',   value: 2,   duration: 60, unlockCost: 15_000  },
  { id: 'deep_treasure',   name: '深海の宝を発見！',       icon: '🪙', desc: '現在の藻 +30%（即時）',           type: 'moku_bonus', value: 0.3, duration: 3,  unlockCost: 25_000  },
  { id: 'record_break',    name: '記録更新！！',           icon: '📈', desc: 'タップ効率 ×10（10秒）',          type: 'tap_mult',   value: 10,  duration: 10, unlockCost: 50_000  },
  { id: 'settlement_bonus',name: '決算ボーナス！',         icon: '💰', desc: '現在の藻 +50%（即時）',           type: 'moku_bonus', value: 0.5, duration: 3,  unlockCost: 100_000 },
  { id: 'tax_bill',        name: '税金の請求書が届いた…', icon: '📄', desc: '自動収益 -50%（30秒）',           type: 'mps_mult',   value: 0.5, duration: 30, unlockCost: 0       },
  { id: 'sea_god',         name: '海神様のお告げだ！',     icon: '🔱', desc: '全収益 ×4（10秒）',               type: 'all_mult',   value: 4,   duration: 10, unlockCost: 500_000 },
];

// ガチャスキン一覧（既存スーツを流用）
const GACHA_SKINS = [
  { id: 'skin_black',   name: '黒スーツ',         rarity: 'N',   suit: 'black',   prob: 0.60  },
  { id: 'skin_blue',    name: '青スーツ',         rarity: 'R',   suit: 'blue',    prob: 0.125 },
  { id: 'skin_green',   name: '緑スーツ',         rarity: 'R',   suit: 'green',   prob: 0.125 },
  { id: 'skin_red',     name: '赤スーツ',         rarity: 'SR',  suit: 'red',     prob: 0.06  },
  { id: 'skin_gold',    name: '金スーツ',         rarity: 'SR',  suit: 'gold',    prob: 0.06  },
  { id: 'skin_rainbow', name: 'レインボースーツ', rarity: 'SSR', suit: 'rainbow', prob: 0.03  },
];

const RARITY_COLOR  = { N: '#888888', R: '#4499ff', SR: '#ffd700', SSR: '#ff44ff' };
const RARITY_DUPE_STONES = { N: 1, R: 5, SR: 15, SSR: 50 };

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

  if (ready) {
    bar.classList.add('prestige-ready');
    labelEl.textContent = '✨ 転生可能！';
    remEl.textContent   = '';
    if (!document.getElementById('prestige-do-btn')) {
      const btn = document.createElement('button');
      btn.id = 'prestige-do-btn';
      btn.textContent = '🌀 転生する';
      btn.addEventListener('click', doPrestige);
      bar.appendChild(btn);
    }
  } else {
    bar.classList.remove('prestige-ready');
    labelEl.textContent = '✨ 転生まで';
    remEl.textContent   = `あと ${fmt(PRESTIGE_THRESHOLD - total)} 藻`;
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

  const awakenMult  = gameState.isAwakened ? 5 * getPrestigeBonus('awakenMult') : 1;
  const eventMult   = gameState.eventTapMult ?? 1;
  const critRate    = 0.05 + getPrestigeBonus('critRate');
  const critMult    = 3    + getPrestigeBonus('critMult');
  const isCritical  = Math.random() < critRate;
  const gained      = gameState.tapPower * awakenMult * eventMult * (isCritical ? critMult : 1);

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
  const awakenMult = gameState.isAwakened ? 5 * getPrestigeBonus('awakenMult') : 1;
  const eventMult  = gameState.eventMpsMult ?? 1;
  const gained     = gameState.mokuPerSecond * awakenMult * eventMult;

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
      ${imgTag}
      <div id="event-name">${ev.name}</div>
      <div id="event-desc">${ev.desc}</div>
      <div id="event-remaining">残り ${gameState.activeEvent.timer}秒</div>
    `;
  } else {
    const nextEv = gameState.nextEventId ? EVENTS.find(e => e.id === gameState.nextEventId) : null;
    const previewHtml = nextEv
      ? `<p class="event-next-preview">${nextEv.icon} 次は「${nextEv.name}」</p>`
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

// ========== アイテム ==========

function buyItem(itemId) {
  const item = ITEMS.find(x => x.id === itemId);
  if (!item) return;
  if ((gameState.purchasedItems ?? []).includes(itemId)) return;
  if (gameState.moku < item.cost) return;

  gameState.moku -= item.cost;
  gameState.purchasedItems = [...(gameState.purchasedItems ?? []), itemId];
  playSound('buy');
  updateItemOverlays();
  updateDisplay();
}

function updateItemOverlays() {
  const container = document.getElementById('item-overlays');
  if (!container) return;
  container.innerHTML = '';

  for (const item of ITEMS) {
    if (!(gameState.purchasedItems ?? []).includes(item.id)) continue;
    const src = IMAGE_CONFIG.items[item.id];
    if (!src) continue;
    const img = document.createElement('img');
    img.src = src;
    img.className = `item-overlay item-overlay-${item.overlayPos ?? 'top-left'}`;
    img.alt = item.name;
    container.appendChild(img);
  }
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
    const canBuy    = !bought && gameState.moku >= item.cost;
    const btn       = document.getElementById(`item-btn-${item.id}`);
    const src       = IMAGE_CONFIG.items[item.id];
    const iconStyle = src
      ? `background-image:url('${src}');background-size:cover;background-position:center;background-repeat:no-repeat;font-size:0;`
      : '';

    btn.className = `item-btn${canBuy ? ' can-buy' : ''}${bought ? ' maxed' : ''}`;
    btn.innerHTML = `
      <div class="item-icon" style="${iconStyle}">${iconStyle ? '' : item.icon}</div>
      <div class="item-info">
        <div class="item-name">${item.name}</div>
        <div class="item-desc">${item.desc}</div>
      </div>
      <div class="item-right">
        <div class="item-cost">${bought ? '✅ 購入済み' : fmt(item.cost) + ' 藻'}</div>
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
          : `<div class="gacha-card-dupe">✨ +${dupeStones}石</div>`}
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
    prestigeLevel:   (gameState.prestigeLevel ?? 0) + 1,
    prestigeStones:  (gameState.prestigeStones ?? 0) + stonesEarned,
    prestigeSkills:  gameState.prestigeSkills,
    prestigeHistory: [...(gameState.prestigeHistory ?? []), entry],
    ownedSkins:      gameState.ownedSkins,
    equippedSkin:    gameState.equippedSkin,
    gachaPity:       gameState.gachaPity,
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
        <div class="item-cost" style="color:#cc88ff">${maxed ? 'MAX' : cost + ' 石'}</div>
        <div class="item-count-label">${lv} / ${s.maxLevel}</div>
      </div>
    `;
  }
}

function updatePrestigeTab() {
  const lvEl     = document.getElementById('prestige-tab-level');
  const stoneEl  = document.getElementById('prestige-tab-stones');
  if (lvEl)    lvEl.textContent    = `転生 Lv.${gameState.prestigeLevel ?? 0}`;
  if (stoneEl) stoneEl.textContent = `✨ 転生石: ${gameState.prestigeStones ?? 0}`;

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

  const cappedSec = Math.min(elapsedSec, MAX_SEC);
  const earned    = Math.floor(gameState.mokuPerSecond * cappedSec * 0.5);
  if (earned <= 0) return;

  gameState.moku      += earned;
  gameState.totalMoku += earned;

  const hours   = Math.floor(elapsedSec / 3600);
  const minutes = Math.floor((elapsedSec % 3600) / 60);
  const timeStr = hours > 0 ? `${hours}時間${minutes}分` : `${minutes}分`;
  const capped  = elapsedSec > MAX_SEC ? `（最大8時間で計算）` : '';

  document.getElementById('offline-title').textContent  = 'おかえり！🌿';
  document.getElementById('offline-time').textContent   = `${timeStr}ぶりのお帰り！${capped}`;
  document.getElementById('offline-earned').textContent = `+${fmt(earned)} 藻`;
  document.getElementById('offline-modal').classList.remove('hidden');
}

// ========== セーブ / ロード / リセット ==========

function saveGame() {
  gameState.lastSaved = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return;

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
    });
  });
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
  renderPrestigeSkillList();
  renderUpgradeList();
  renderEventUnlockList();
  renderEmployeeList();
  renderFacilityList();
  renderItemList();
  updateDisplay();
  updateEventDisplay();

  // キャラタップ
  const charEl = document.getElementById('character-img');
  charEl.addEventListener('touchstart', onTap, { passive: false });
  charEl.addEventListener('click', onTap);

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

  document.getElementById('gacha-btn-1') .addEventListener('click', () => doGachaPull(1));
  document.getElementById('gacha-btn-10').addEventListener('click', () => doGachaPull(10));
  document.getElementById('gacha-result-close').addEventListener('click', () => {
    document.getElementById('gacha-result-modal').classList.add('hidden');
  });

  document.getElementById('sound-btn').addEventListener('click', () => {
    gameState.soundEnabled = !gameState.soundEnabled;
    updateSoundBtn();
    if (gameState.soundEnabled) playSound('buy');
  });

  initTabs();

  setInterval(gameLoop, 1000);          // ゲームループ
  setInterval(saveGame, 30_000);        // オートセーブ（30秒ごと）

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveGame();
  });
}

document.addEventListener('DOMContentLoaded', init);
