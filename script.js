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
  const src = IMAGE_CONFIG.character.suits[suit] ?? IMAGE_CONFIG.character.suits.black;
  const el  = document.getElementById('character-img');
  el.style.backgroundImage    = `url('${src}')`;
  el.style.backgroundSize     = 'cover';
  el.style.backgroundPosition = 'center top';
  el.style.backgroundRepeat   = 'no-repeat';
  el.textContent = '';
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
  { id: 'facility_plant',   name: '海藻プラント',   icon: '🌱', desc: 'MPS +3/秒',     baseCost: 2_000,     costMult: 2.5, mpsBonus: 3,    maxCount: 5 },
  { id: 'facility_factory', name: '深海工場',       icon: '🏭', desc: 'MPS +20/秒',    baseCost: 15_000,    costMult: 2.5, mpsBonus: 20,   maxCount: 5 },
  { id: 'facility_lab',     name: 'サンゴ研究所',   icon: '🔬', desc: 'タップ +50',    baseCost: 50_000,    costMult: 2.5, tapBonus: 50,   maxCount: 5 },
  { id: 'facility_hq',      name: '海底本社ビル',   icon: '🏢', desc: 'MPS +100/秒',   baseCost: 200_000,   costMult: 2.5, mpsBonus: 100,  maxCount: 5 },
  { id: 'facility_bank',    name: '海流銀行',       icon: '🏦', desc: 'MPS +400/秒',   baseCost: 800_000,   costMult: 2.5, mpsBonus: 400,  maxCount: 5 },
  { id: 'facility_tower',   name: '光合成タワー',   icon: '🗼', desc: 'MPS +1500/秒',  baseCost: 3_000_000, costMult: 2.5, mpsBonus: 1500, maxCount: 5 },
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
  // ポジティブ（タップ強化）
  { id: 'bonus_tap',       name: '藻の大発生！',           icon: '🌊', desc: 'タップ効率 ×3（20秒）',          type: 'tap_mult',   value: 3,   duration: 20 },
  { id: 'moku_bubble',     name: '海流バブル発生！',       icon: '🫧', desc: 'タップ効率 ×5（15秒）',          type: 'tap_mult',   value: 5,   duration: 15 },
  { id: 'jellyfish_swarm', name: 'クラゲの大群襲来！',     icon: '🪼', desc: 'タップ効率 ×2（40秒）',          type: 'tap_mult',   value: 2,   duration: 40 },
  { id: 'record_break',    name: '記録更新！！',            icon: '📈', desc: 'タップ効率 ×10（10秒）',         type: 'tap_mult',   value: 10,  duration: 10 },
  // ポジティブ（自動収益強化）
  { id: 'bonus_mps',       name: '自動収穫強化！',         icon: '⚡', desc: '自動収益 ×2（30秒）',            type: 'mps_mult',   value: 2,   duration: 30 },
  { id: 'shark_deal',      name: 'サメが営業に来た！',     icon: '🦈', desc: '自動収益 ×3（45秒）',            type: 'mps_mult',   value: 3,   duration: 45 },
  { id: 'deep_factory',    name: '深海工場の稼働！',       icon: '🏭', desc: '自動収益 ×2（60秒）',            type: 'mps_mult',   value: 2,   duration: 60 },
  { id: 'human_spotted',   name: '人間にバレそうだ！',     icon: '👁️', desc: '話題沸騰！自動収益 ×1.5（30秒）', type: 'mps_mult',   value: 1.5, duration: 30 },
  // ポジティブ（全体強化）
  { id: 'sea_god',         name: '海神様のお告げだ！',     icon: '🔱', desc: '全収益 ×4（10秒）',              type: 'all_mult',   value: 4,   duration: 10 },
  // ポジティブ（即時獲得）
  { id: 'bonus_moku',      name: 'ボーナス収穫！',         icon: '💎', desc: '現在の藻 +10%（即時）',          type: 'moku_bonus', value: 0.1, duration: 1  },
  { id: 'deep_treasure',   name: '深海の宝を発見！',       icon: '🪙', desc: '現在の藻 +30%（即時）',          type: 'moku_bonus', value: 0.3, duration: 1  },
  { id: 'settlement_bonus',name: '決算ボーナス！',         icon: '💰', desc: '現在の藻 +50%（即時）',          type: 'moku_bonus', value: 0.5, duration: 1  },
  // ネガティブ（たまに来るハプニング）
  { id: 'tax_bill',        name: '税金の請求書が届いた…', icon: '📄', desc: '自動収益 -50%（30秒）',          type: 'mps_mult',   value: 0.5, duration: 30 },
  { id: 'rough_current',   name: '海流が荒れている…',     icon: '🌀', desc: '自動収益 -30%（20秒）',          type: 'mps_mult',   value: 0.7, duration: 20 },
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
  critRate:       0.05,   // クリティカル確率（課金要素で上昇）
  critMult:       3,      // クリティカル倍率（課金要素で上昇）
  eventCooldown:  60,
  activeEvent:    null,   // { id, timer }
  eventTapMult:   1,
  eventMpsMult:   1,
  lastSaved:      0,
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

function recalcTapPower() {
  let power = 1;
  for (const u of UPGRADES) {
    power += u.tapBonus * (gameState.upgrades[u.id] ?? 0);
  }
  for (const f of FACILITIES) {
    if (f.tapBonus) power += f.tapBonus * (gameState.facilities[f.id] ?? 0);
  }
  gameState.tapPower = power;
}

function recalcMPS() {
  let mps = 0;
  for (const emp of EMPLOYEES) {
    mps += emp.mpsBonus * (gameState.employees[emp.id] ?? 0);
  }
  for (const f of FACILITIES) {
    if (f.mpsBonus) mps += f.mpsBonus * (gameState.facilities[f.id] ?? 0);
  }
  gameState.mokuPerSecond = mps;
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

  renderUpgradeList();
  renderEmployeeList();
  renderFacilityList();
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

  const awakenMult  = gameState.isAwakened ? 5 : 1;
  const eventMult   = gameState.eventTapMult ?? 1;
  const isCritical  = Math.random() < (gameState.critRate ?? 0.05);
  const critMult    = isCritical ? (gameState.critMult ?? 3) : 1;
  const gained      = gameState.tapPower * awakenMult * eventMult * critMult;

  gameState.moku      += gained;
  gameState.totalMoku += gameState.tapPower; // ボーナス倍率は totalMoku に含めない

  gameState.awakenGauge = Math.min(100, (gameState.awakenGauge ?? 0) + 2);

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
  const awakenMult = gameState.isAwakened ? 5 : 1;
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
  updateDisplay();
}

// ========== イベント ==========

function triggerRandomEvent() {
  const ev = EVENTS[Math.floor(Math.random() * EVENTS.length)];
  gameState.activeEvent = { id: ev.id, timer: ev.duration };

  if (ev.type === 'tap_mult')   gameState.eventTapMult = ev.value;
  if (ev.type === 'mps_mult')   gameState.eventMpsMult = ev.value;
  if (ev.type === 'all_mult')   { gameState.eventTapMult = ev.value; gameState.eventMpsMult = ev.value; }
  if (ev.type === 'moku_bonus') gameState.moku += gameState.moku * ev.value;
}

function endEvent() {
  gameState.activeEvent   = null;
  gameState.eventTapMult  = 1;
  gameState.eventMpsMult  = 1;
  gameState.eventCooldown = 60 + Math.floor(Math.random() * 61); // 60〜120秒
}

function updateEventDisplay() {
  const area = document.getElementById('event-area');
  const cdEl = document.getElementById('event-cooldown-display');

  if (gameState.activeEvent && gameState.activeEvent.timer > 0) {
    const ev    = EVENTS.find(e => e.id === gameState.activeEvent.id);
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
    area.innerHTML = `<p class="event-standby">イベント待機中...</p>`;
    if (cdEl) area.appendChild(cdEl);
  }

  if (cdEl) {
    cdEl.textContent = gameState.eventCooldown > 0
      ? `次のイベントまで約 ${gameState.eventCooldown}秒`
      : '';
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
  updateSuit(gameState.suit);
  renderUpgradeList();
  renderEmployeeList();
  renderFacilityList();
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

  initTabs();

  setInterval(gameLoop, 1000);          // ゲームループ
  setInterval(saveGame, 30_000);        // オートセーブ（30秒ごと）

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveGame();
  });
}

document.addEventListener('DOMContentLoaded', init);
