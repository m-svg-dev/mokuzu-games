// ========================================
// ミニゲーム：藻屑モンスターズ
// ========================================
// クリッカー本体(script.js)から initMokumon() で呼ばれる。
// セーブは gameState.mokumon に格納し、本体のセーブ処理に乗る。
// 通貨は独立（gameState.mokumon.gold = 藻マネー）。
// ========================================

// ---- マスターデータ（初回ロード時にキャッシュ） ----
let MASTER = { monsters: null, skills: null };
let _loaded = false;
let _initialized = false;

// ---- 外部依存（script.jsから注入） ----
// saveGame: 本体のセーブ関数 / getState: gameStateを返す関数
let _saveGame = null;
let _getState = null;
let _dataVersion = '0';   // JSONキャッシュ破棄用（script.jsから注入）

// ========================================
// 定数
// ========================================

const RANKS = ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS'];

const FAMILIES = {
  moss:      { name: '藻',   color: '#4caf50' },
  deepsea:   { name: '深海', color: '#1565c0' },
  machine:   { name: '機械', color: '#607d8b' },
  spirit:    { name: '精霊', color: '#e91e8c' },
  ghost:     { name: '亡霊', color: '#7b1fa2' },
  corporate: { name: '企業', color: '#1a237e' },
  disaster:  { name: '災厄', color: '#b71c1c' },
  god:       { name: '神',   color: '#f57f17' },
  genesis:   { name: '創世', color: '#1a1a2e' },
};

const RANK_COLORS = {
  F: '#9e9e9e', E: '#8bc34a', D: '#03a9f4', C: '#ff9800',
  B: '#e91e63', A: '#9c27b0', S: '#f44336', SS: '#ffd700',
};

const PARTY_MAX = 3;
const LEVEL_MAX = 99;
const FUSION_VALUE_MAX = 999;
const FARM_MAX = 50;

// ========================================
// 初期セーブデータ
// ========================================

function createInitialData() {
  const starterId = uuid();
  return {
    initialized: true,
    gold: 500,
    party: [starterId, null, null],
    monsters: {
      [starterId]: {
        instanceId: starterId,
        monsterId: 1,
        nickname: '',
        level: 1,
        exp: 0,
        fusionValue: 0,
        mutationType: 'none',
        skills: ['skill_attack', 'skill_moss_heal'],
        traits: ['trait_water_resist'],
        isFavorite: false,
      },
    },
    dex: { '1': { seen: true, owned: true, scoutCount: 0, fusionCount: 0 } },
    record: { battle: 0, win: 0, scout: 0, fusion: 0 },
    items: { item_herb_s: 3, item_onigiri: 2 },  // 初期アイテム
    flags: {},
  };
}

// ========================================
// アイテム定義（マスター）
// ========================================

const ITEMS = {
  // 回復
  item_herb_s:  { name: '藻薬草',     icon: '🌿', kind: 'heal_hp',  power: 50,  desc: '味方1体のHPを50回復', price: 20,  sell: 10,  buyable: true, battle: true },
  item_herb_m:  { name: '上藻薬草',   icon: '🌿', kind: 'heal_hp',  power: 150, desc: '味方1体のHPを150回復', price: 120, sell: 60,  buyable: true, battle: true },
  item_herb_l:  { name: '特藻薬草',   icon: '🌿', kind: 'heal_hp',  power: 500, desc: '味方1体のHPを500回復', price: 500, sell: 250, buyable: true, battle: true },
  item_ether_s: { name: '藻エキス',   icon: '💧', kind: 'heal_mp',  power: 30,  desc: '味方1体のMPを30回復',  price: 80,  sell: 40,  buyable: true, battle: true },
  item_cure:    { name: '万能藻薬',   icon: '✨', kind: 'cure',     power: 0,   desc: '状態異常をすべて回復',  price: 150, sell: 75,  buyable: true, battle: true },
  item_revive:  { name: '蘇生の藻',   icon: '🍀', kind: 'revive',   power: 0.5, desc: '戦闘不能を最大HP50%で復活', price: 600, sell: 300, buyable: true, battle: true },

  // おやつ（スカウト率アップ・戦闘中専用）
  item_onigiri: { name: '藻おにぎり', icon: '🍙', kind: 'scout',    power: 0.10, desc: 'スカウト率を少しUP', price: 100,   sell: 50,    buyable: true, battle: true },
  item_bento:   { name: '藻弁当',     icon: '🍱', kind: 'scout',    power: 0.20, desc: 'スカウト率をUP',     price: 1000,  sell: 500,   buyable: true, battle: true },
  item_gozen:   { name: '藻御膳',     icon: '🍲', kind: 'scout',    power: 0.35, desc: 'スカウト率を大きくUP', price: 10000, sell: 5000,  buyable: true, battle: true },
  item_course:  { name: '藻フルコース', icon: '🍽️', kind: 'scout',  power: 0.55, desc: 'スカウト率を特大UP',  price: 100000,sell: 50000, buyable: true, battle: true },
};

function getItem(id) { return ITEMS[id] ?? null; }

// 所持アイテムを増減（数量0で削除）
function addItem(id, n = 1) {
  const d = data();
  d.items = d.items || {};
  d.items[id] = (d.items[id] ?? 0) + n;
  if (d.items[id] <= 0) delete d.items[id];
}

// ========================================
// ユーティリティ
// ========================================

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function pad3(n) { return String(n).padStart(3, '0'); }
function fmtNum(n) { return n.toLocaleString('ja-JP'); }
function famInfo(id) { return FAMILIES[id] ?? { name: id, color: '#888' }; }
function rankColor(r) { return RANK_COLORS[r] ?? '#888'; }
function escHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
function monImg(id) { return `data/mokumon/normal/monster_${pad3(id)}.webp`; }

// ========================================
// サウンド（クリッカーのAudioContextを借りて自前生成）
// ========================================

// SEのピッチ揺れ（連発時に同じ音が単調にならないよう、再生ごとに少し変える）
let _sePitch = 1;

// 1音を予約再生する基本関数
function beep(at, freq, endFreq, dur, gain, wave) {
  const ctx = window.getAudioCtx ? window.getAudioCtx() : null;
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const vol = ctx.createGain();
  osc.connect(vol); vol.connect(ctx.destination);
  osc.type = wave || 'sine';
  osc.frequency.setValueAtTime(freq * _sePitch, at);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq * _sePitch, at + dur);
  vol.gain.setValueAtTime(gain ?? 0.15, at);
  vol.gain.exponentialRampToValueAtTime(0.001, at + dur);
  osc.start(at);
  osc.stop(at + dur);
}

// ホワイトノイズのバースト（フィルター付き）→ 足音・打撃などの「質感」を作る
function noiseBurst(at, dur, gain, filterType, filterFreq, endFreq, q) {
  const ctx = window.getAudioCtx ? window.getAudioCtx() : null;
  if (!ctx) return;
  const frames = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filt = ctx.createBiquadFilter();
  filt.type = filterType || 'lowpass';
  filt.frequency.setValueAtTime(filterFreq ?? 1000, at);
  if (endFreq) filt.frequency.exponentialRampToValueAtTime(endFreq, at + dur);
  if (q) filt.Q.value = q;
  const vol = ctx.createGain();
  vol.gain.setValueAtTime(gain ?? 0.1, at);
  vol.gain.exponentialRampToValueAtTime(0.0008, at + dur);
  src.connect(filt); filt.connect(vol); vol.connect(ctx.destination);
  src.start(at);
  src.stop(at + dur);
}

// 細いパルス波（ファミコン／GB風）の PeriodicWave を生成＆キャッシュ
let _pulseWaves = {};
let _pulseWaveCtx = null;
function getPulseWave(ctx, duty) {
  if (_pulseWaveCtx !== ctx) { _pulseWaves = {}; _pulseWaveCtx = ctx; }  // ctxが変わったら作り直し
  const key = duty.toFixed(3);
  if (_pulseWaves[key]) return _pulseWaves[key];
  const N = 32;
  const real = new Float32Array(N);
  const imag = new Float32Array(N);
  for (let n = 1; n < N; n++) {
    imag[n] = (2 / (n * Math.PI)) * Math.sin(n * Math.PI * duty);  // デューティ比dのパルスのフーリエ係数
  }
  const w = ctx.createPeriodicWave(real, imag);
  _pulseWaves[key] = w;
  return w;
}

// パルス波を1音鳴らす（チップチューン用：歯切れのよいアタック＋任意で急切り）
function pulse(at, freq, endFreq, dur, gain, duty, opts) {
  const ctx = window.getAudioCtx ? window.getAudioCtx() : null;
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const vol = ctx.createGain();
  osc.setPeriodicWave(getPulseWave(ctx, duty ?? 0.125));
  osc.frequency.setValueAtTime(freq * _sePitch, at);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq * _sePitch, at + dur);
  const g = gain ?? 0.12;
  const a = opts?.attack ?? 0.004;       // 速い立ち上がり＝カチッとした質感
  vol.gain.setValueAtTime(0.0001, at);
  vol.gain.exponentialRampToValueAtTime(g, at + a);
  if (opts?.hardCut) {                    // 急に切る（実機のエンベロープ風）
    vol.gain.setValueAtTime(g, at + Math.max(a, dur - 0.006));
    vol.gain.linearRampToValueAtTime(0.0001, at + dur);
  } else {
    vol.gain.exponentialRampToValueAtTime(0.0008, at + dur);
  }
  osc.connect(vol); vol.connect(ctx.destination);
  osc.start(at);
  osc.stop(at + dur);
}

// 効果音タイプ別
function sfx(type) {
  if (window.isSoundEnabled && !window.isSoundEnabled()) return;
  const ctx = window.getAudioCtx ? window.getAudioCtx() : null;
  if (!ctx) return;
  const t = ctx.currentTime;
  switch (type) {
    case 'step':
      // ひかえめな足音（細パルスの短いコッ・急切り）
      pulse(t, 210, 180, 0.03, 0.03, 0.125, { hardCut: true });
      break;
    case 'bump':
      // ポケモン風の壁ドン（低パルスのブッ＋こもったノイズ一発）
      pulse(t, 130, 100, 0.10, 0.14, 0.25, { hardCut: true });
      noiseBurst(t, 0.04, 0.05, 'lowpass', 420, 200, 1);
      break;
    case 'talk':
      // DQ／ポケモン風メッセージ音（明るい2連ピロッ・細パルス）
      pulse(t, 740, 740, 0.045, 0.11, 0.125, { hardCut: true });
      pulse(t + 0.055, 988, 988, 0.06, 0.09, 0.125, { hardCut: true });
      break;
    case 'select':   pulse(t, 880, 1245, 0.06, 0.12, 0.25, { hardCut: true }); break;
    case 'cancel':   pulse(t, 520, 330, 0.09, 0.12, 0.25, { hardCut: true }); break;
    case 'encounter':
      // 緊迫の遭遇スティング：低音の刻み（ダダダ）＋警報的な上昇を厚く重ねる
      for (let i = 0; i < 3; i++) {
        beep(t + i * 0.10, 196, 196, 0.09, 0.18, 'square');   // 低音の刻み
        pulse(t + i * 0.10, 392, null, 0.09, 0.12, 0.25, { hardCut: true });
      }
      beep(t + 0.34, 220, 440, 0.34, 0.16, 'square');         // 1oct下で厚み
      beep(t + 0.34, 440, 880, 0.34, 0.18, 'sawtooth');       // 緊張の上昇
      break;
    case 'attack':
      // 鋭い斬撃：高→低の細パルス＋空気を切るノイズ（シャキン）
      pulse(t, 560, 120, 0.10, 0.20, 0.5, { hardCut: true });
      noiseBurst(t, 0.07, 0.13, 'highpass', 2600, 5200, 1);
      break;
    case 'magic':
      // 呪文詠唱：きらめく上昇アルペジオ（細パルス）
      [523, 698, 880, 1175].forEach((f, i) => pulse(t + i * 0.045, f, null, 0.10, 0.12, 0.125, { hardCut: true }));
      break;
    case 'hit':
      // 重い着弾「ドンッ」：低音ボディ＋破裂ノイズ
      beep(t, 150, 48, 0.16, 0.26, 'triangle');
      beep(t, 90, 40, 0.16, 0.18, 'sine');
      noiseBurst(t, 0.09, 0.20, 'lowpass', 2800, 600, 1);
      break;
    case 'crit':
      // 会心：鋭い金属ノイズ＋上昇3連＋低音の押し
      noiseBurst(t, 0.12, 0.22, 'highpass', 1400, 3400, 1);
      beep(t, 120, 50, 0.18, 0.20, 'triangle');
      [700, 1000, 1500].forEach((f, i) => beep(t + i * 0.05, f, f * 1.2, 0.10, 0.20, 'square'));
      break;
    case 'heal':
      beep(t, 523, 784, 0.16, 0.13, 'sine');
      beep(t + 0.10, 784, 1047, 0.16, 0.11, 'sine');
      break;
    case 'defeat':
      // 敵がやられる：下降スライド（細パルス）
      pulse(t, 440, 70, 0.32, 0.15, 0.25);
      break;
    case 'gameover': {
      // DQ風の全滅ジングル「てれれれれー↓」：階段状に下降→最後に低く沈む（低音の影を重ねて厚く）
      const seq = [659, 587, 523, 466, 415, 349, 311];
      seq.forEach((f, i) => {
        beep(t + i * 0.16, f, f, 0.16, 0.17, 'triangle');
        beep(t + i * 0.16, f * 0.5, f * 0.5, 0.16, 0.10, 'sine');  // 1oct下の影
      });
      const tn = t + seq.length * 0.16;
      beep(tn, 262, 196, 0.6, 0.18, 'triangle');   // 沈み込む低音
      beep(tn, 131, 98, 0.9, 0.16, 'sine');         // ずーんと重い余韻
      beep(tn + 0.06, 196, 147, 0.7, 0.09, 'triangle'); // 不協和でやるせなさ
      break;
    }
    case 'scoutTry':
      // スカウト投げ：シュッと下降＋ふわっとノイズ
      pulse(t, 940, 320, 0.20, 0.10, 0.25);
      noiseBurst(t, 0.18, 0.05, 'bandpass', 1600, 600, 4);
      break;
    case 'scoutOk':
      [523, 659, 784, 1047, 1319].forEach((f, i) => beep(t + i * 0.08, f, f, 0.12, 0.16, 'sine'));
      break;
    case 'scoutNg':
      // 失敗：がっかりする2連の下降（細パルス）
      pulse(t, 494, 494, 0.12, 0.12, 0.25, { hardCut: true });
      pulse(t + 0.13, 330, 220, 0.22, 0.12, 0.25);
      break;
    case 'levelup':
      [523, 659, 784, 1047].forEach((f, i) => beep(t + i * 0.09, f, f, 0.12, 0.16, 'triangle'));
      break;
    case 'win': {
      // 勝利ファンファーレ：主旋律（square）＋1oct下の厚み＋締めの和音
      const wn = [523, 659, 784, 1047];
      wn.forEach((f, i) => {
        beep(t + i * 0.12, f, f, 0.14, 0.16, 'square');
        beep(t + i * 0.12, f * 0.5, f * 0.5, 0.14, 0.09, 'triangle');
      });
      const tc = t + 4 * 0.12;
      [523, 659, 784, 1047].forEach(f => beep(tc, f, f, 0.55, 0.12, 'square')); // Cメジャー和音
      beep(tc, 262, 262, 0.55, 0.12, 'triangle');                               // ルート低音
      break;
    }
    case 'fusion':
      beep(t, 200, 800, 0.4, 0.18, 'sawtooth');
      beep(t + 0.4, 800, 1400, 0.5, 0.18, 'sine');
      break;
    case 'gold':     beep(t, 900, 1300, 0.12, 0.14, 'sine'); break;

    // ===== スキルエフェクト専用SE（属性ごと）=====
    case 'fx_slash':   // 斬撃：金属的な鋭いシャッ＋リング
      noiseBurst(t, 0.06, 0.16, 'highpass', 3000, 6000, 1);
      pulse(t, 1400, 320, 0.12, 0.16, 0.25, { hardCut: true });
      break;
    case 'fx_impact':  // 打撃：重いドンッ
      beep(t, 130, 45, 0.16, 0.26, 'triangle');
      noiseBurst(t, 0.09, 0.20, 'lowpass', 2200, 500, 1);
      break;
    case 'fx_fire':    // 炎：低い轟き＋パチパチ
      beep(t, 90, 60, 0.34, 0.20, 'sawtooth');
      noiseBurst(t, 0.30, 0.14, 'lowpass', 1400, 700, 1);
      break;
    case 'fx_water':   // 水：ザパァン
      noiseBurst(t, 0.22, 0.18, 'lowpass', 1200, 300, 1);
      beep(t, 300, 160, 0.20, 0.10, 'sine');
      break;
    case 'fx_ice':     // 氷：キンッと砕ける
      [1568, 2093, 2637].forEach((f, i) => beep(t + i * 0.04, f, f, 0.10, 0.12, 'sine'));
      noiseBurst(t + 0.10, 0.16, 'highpass', 3500, 7000, 1);
      break;
    case 'fx_thunder': // 雷：バリバリッ
      beep(t, 2000, 1600, 0.10, 0.14, 'square');
      noiseBurst(t, 0.12, 0.20, 'highpass', 2000, 4500, 1);
      beep(t + 0.10, 1400, 80, 0.16, 0.12, 'sawtooth');
      break;
    case 'fx_poison':  // 毒：ぼこぼこ不気味
      [180, 150, 220, 160].forEach((f, i) => beep(t + i * 0.07, f, f * 0.7, 0.10, 0.12, 'sine'));
      noiseBurst(t, 0.28, 0.06, 'bandpass', 600, 400, 3);
      break;
    case 'fx_dark':    // 闇：低いうねりの轟き
      beep(t, 70, 50, 0.45, 0.20, 'sawtooth');
      beep(t, 104, 98, 0.45, 0.10, 'square');     // 不協和
      noiseBurst(t, 0.30, 0.10, 'lowpass', 800, 300, 1);
      break;
    case 'fx_light':   // 光：神聖な上昇ベル
      [880, 1320, 1760, 2640].forEach((f, i) => beep(t + i * 0.06, f, f, 0.30, 0.13, 'sine'));
      break;
    case 'fx_wind':    // 風：ヒュンと抜ける
      noiseBurst(t, 0.24, 0.12, 'bandpass', 1200, 2600, 5);
      break;
    case 'fx_ultimate': { // 必殺：溜め→大爆発
      beep(t, 200, 1200, 0.45, 0.14, 'sawtooth');           // 溜めの上昇
      const tb = t + 0.45;
      beep(tb, 110, 40, 0.6, 0.26, 'triangle');             // 爆発の低音
      beep(tb, 70, 35, 0.7, 0.18, 'sine');
      noiseBurst(tb, 0.45, 0.26, 'lowpass', 3000, 400, 1);  // 爆風
      [523, 659, 784].forEach((f, i) => beep(tb + 0.1 + i * 0.07, f, f, 0.2, 0.12, 'square'));
      break;
    }
  }
}

function getMonsterMaster(id) {
  return MASTER.monsters?.find(m => m.monsterId === id) ?? null;
}
function getSkillMaster(id) {
  return MASTER.skills?.find(s => s.skillId === id) ?? null;
}

// ========================================
// ステータス再計算
// ========================================

function growthMultiplier(growthType, level) {
  const t = (level - 1) / (LEVEL_MAX - 1);
  switch (growthType) {
    case '早熟': return 1.0 + 4.0 * (1 - Math.pow(1 - t, 2));
    case '晩成': return 1.0 + 4.0 * Math.pow(t, 2);
    default:     return 1.0 + 4.0 * t;
  }
}

function fusionBonus(v) {
  v = Math.min(v ?? 0, FUSION_VALUE_MAX);
  if (v < 100) return 0.01;
  if (v < 300) return 0.03;
  if (v < 500) return 0.06;
  if (v < 700) return 0.10;
  if (v < 900) return 0.15;
  return 0.20;
}

function calcStats(inst) {
  const master = getMonsterMaster(inst.monsterId);
  if (!master) return { hp:1, mp:1, atk:1, def:1, mag:1, mnd:1, spd:1 };
  const gm = growthMultiplier(master.growthType, inst.level);
  const fb = fusionBonus(inst.fusionValue);
  const mb = (inst.mutationType && inst.mutationType !== 'none') ? 1.10 : 1.00;
  const out = {};
  for (const k of ['hp','mp','atk','def','mag','mnd','spd']) {
    out[k] = Math.max(1, Math.floor(master.baseStats[k] * gm * (1 + fb) * mb));
  }
  return out;
}

// ========================================
// セーブデータアクセサ
// ========================================

function data() {
  const gs = _getState();
  if (!gs.mokumon) gs.mokumon = createInitialData();
  return gs.mokumon;
}

function save() {
  if (_saveGame) _saveGame();              // ローカル保存（即時）
  // クラウドも即保存。本体側で「前回と同内容ならスキップ」されるので無駄打ちにならない
  if (window.saveGameCloud) window.saveGameCloud();
}

// ========================================
// エントリポイント（script.jsから呼ばれる）
// ========================================

/**
 * @param {object} deps { saveGame, getState, version }
 */
export async function initMokumon(deps) {
  if (deps) {
    _saveGame = deps.saveGame ?? _saveGame;
    _getState = deps.getState ?? _getState;
    _dataVersion = deps.version ?? _dataVersion;
  }

  // マスターデータ読み込み（初回のみ）
  if (!_loaded) {
    try {
      const v = `?v=${_dataVersion}`;   // バージョン連動でキャッシュ破棄（古いJSONを掴まない）
      const [mRes, sRes] = await Promise.all([
        fetch('data/mokumon-monsters.json' + v),
        fetch('data/mokumon-skills.json' + v),
      ]);
      const monData = await mRes.json();
      // No.順に整列（JSONの並びに依存せず図鑑などを常に番号順表示）
      MASTER.monsters = (monData.monsters ?? []).slice().sort((a, b) => a.monsterId - b.monsterId);
      MASTER.recipes  = monData.fusionRecipes ?? [];
      MASTER.skills   = (await sRes.json()).skills;
      _loaded = true;
    } catch (e) {
      console.error('[mokumon] マスターデータ読み込み失敗:', e);
      renderError();
      return;
    }
  }

  // 初期化（新規プレイヤー）
  const d = data();
  if (!d.initialized) {
    Object.assign(d, createInitialData());
    save();
  }

  // タイトル画面を表示
  renderTitle();
}

// ========================================
// 画面：タイトル
// ========================================

function root() {
  return document.getElementById('minigame-game-mokumon');
}

function renderError() {
  root().innerHTML = `
    <div class="mg-game-header">
      <button id="mokumon-back-btn" class="mg-back-btn">‹ 戻る</button>
      <h2 class="mg-game-title">藻屑モンスターズ</h2>
    </div>
    <div class="mkm-center"><p>データの読み込みに失敗しました。</p></div>
  `;
  bindBack();
}

function renderTitle() {
  root().innerHTML = `
    <div class="mkm-title-screen">
      <div class="mkm-title-logo">
        <img src="data/mokumon/ui/title.webp" alt="藻屑モンスターズ" class="mkm-title-img">
      </div>
      <button class="mkm-start-btn" id="mokumon-start">タップでスタート</button>
      <button class="mg-back-btn mkm-title-back" id="mokumon-back-btn">‹ ミニゲーム一覧へ</button>
      ${isDebug() ? '<button class="mkm-debug-title-btn" id="mokumon-debug-btn">🛠️ デバッグ</button>' : ''}
    </div>
  `;
  document.getElementById('mokumon-start').onclick = () => {
    const d = data();
    d.flags = d.flags || {};
    if (!d.flags.introDone) playIntro();
    else enterVillage();
  };
  if (isDebug()) {
    document.getElementById('mokumon-debug-btn').onclick = () => renderDebug('title');
  }
  bindBack();
}

// ========================================
// 導入イベント（初回のみ）
// ========================================

// 博士のセリフ＋演出を順番に再生する
function playIntro() {
  const d = data();
  // 主人公のスターターを取得（説明で名前を出す）
  const starter = Object.values(d.monsters)[0];
  const starterMaster = starter ? getMonsterMaster(starter.monsterId) : getMonsterMaster(1);
  const starterName = starterMaster ? starterMaster.name : '藻ぷに';

  // 転生前後のキャラ画像
  const DOCTOR  = 'assets/characters/budou_soro.png';
  const MOSSMAN = 'assets/characters/suit_awakened.png';

  const scenes = [
    // ── 第一章：前世 ──
    { speaker: '',      text: '——あぁ、そうだ……。' },
    { speaker: '',      text: 'おれは、医者だった。\nどんな患者も見捨てない、と\n心に決めていた。', showChar: DOCTOR },
    { speaker: '',      text: 'その夜も、夜通しの手術を終えたばかり。\n体は、とっくに限界だった。', showChar: DOCTOR },
    { speaker: '',      text: 'だが——鳴り響く、急患の報せ。\n「先生しかいないんです」\nその一言で、おれは雨の中へ走り出した。', showChar: DOCTOR },
    { speaker: '',      text: '視界を白く染める、激しい嵐——。\nそして……まばゆい光が、おれを包んだ。', showChar: DOCTOR },
    { speaker: '',      text: '…………。' },
    // ── 第二章：覚醒 ──
    { speaker: '',      text: '——っ！？\n……ここは、どこだ……？', showChar: MOSSMAN, flash: true },
    { speaker: '',      text: '見たこともない、緑あふれる世界。\nそして——なんだ、この体はっ……！？', showChar: MOSSMAN },
    { speaker: '',      text: '全身が、藻におおわれている。\n筋骨隆々の、たくましい肉体——！？', showChar: MOSSMAN },
    // ── 第三章：頭の中に響く声 ──
    { speaker: '？？？', text: '《——落ち着いてください。\nそして……おめでとうございます。》', showChar: MOSSMAN, voice: true },
    { speaker: '？？？', text: '《あなたは一度、その命を終えました。\nですが、人々を救い続けたその魂が——\nこの世界に、選ばれたのです。》', showChar: MOSSMAN, voice: true },
    { speaker: '？？？', text: '《ここは「藻界（もかい）」。\n“藻力（もりょく）”という生命の力が\n満ちあふれる、もうひとつの世界。》', showChar: MOSSMAN, voice: true },
    { speaker: '？？？', text: '《その藻力から生まれし命——\nそれが「藻屑モンスター」です。》', showChar: MOSSMAN, voice: true },
    { speaker: '？？？', text: '《彼らを集め、育て、絆を結ぶ者を\nこの世界では“モンスターマスター”と呼びます。》', showChar: MOSSMAN, voice: true },
    { speaker: '？？？', text: '《前世で多くの命を救ったあなたなら——\nきっと、この子たちの良き導き手に\nなれるでしょう。》', showChar: MOSSMAN, voice: true },
    // ── 第四章：相棒と目標 ──
    { speaker: '',      text: `ふと、足元に気配。\n小さな相棒が、おれを見上げていた。\n——「${starterName}」。`, showMon: starter ? starter.monsterId : 1 },
    { speaker: '？？？', text: '《「冒険」で新たな仲間をスカウトし、\n「配合」で新たな命を生み出す。\nそうして、絆を広げていくのです。》', showChar: MOSSMAN, voice: true },
    { speaker: '？？？', text: '《そしてこの世界には、\nひとつの伝説があります。》', showChar: MOSSMAN, voice: true },
    { speaker: '？？？', text: '《すべての藻屑モンスターの頂点に立つ\n創造の神——「藻屑創世神」。》', showChar: MOSSMAN, voice: true },
    { speaker: '？？？', text: '《その座にたどり着いたとき——\nあなたは“転生”の本当の意味を\n知ることになるでしょう。》', showChar: MOSSMAN, voice: true },
    // ── 第五章：決意 ──
    { speaker: '',      text: '……不思議と、恐怖はなかった。\nこの体に、この世界に——\nなぜか、胸が高鳴っている。', showChar: MOSSMAN },
    { speaker: '？？？', text: '《さあ——あなたの“藻生（セカンドライフ）”を\n始めましょう。》', showChar: MOSSMAN, voice: true },
    { speaker: '',      text: 'おれの、第二の人生が始まる。\n——いくぞ、相棒！', showChar: MOSSMAN },
  ];

  // 画像のないシーンのアイコン（名前なし＝暗転で何も出さない）
  const SPEAKER_ICON = { '？？？': '❓' };
  const speakerCharHtml = (speaker) => {
    const icon = SPEAKER_ICON[speaker];
    return icon ? `<div class="mkm-intro-char-icon">${icon}</div>` : '';
  };

  let i = 0;
  const ov = document.createElement('div');
  ov.className = 'mkm-intro';
  ov.innerHTML = `
    <div class="mkm-intro-stage" id="mkm-intro-stage">
      <div class="mkm-intro-spotlight"></div>
      <div class="mkm-intro-char" id="mkm-intro-char"></div>
    </div>
    <div class="mkm-intro-box">
      <div class="mkm-intro-speaker-row">
        <div class="mkm-intro-speaker" id="mkm-intro-speaker"></div>
      </div>
      <div class="mkm-intro-text" id="mkm-intro-text"></div>
      <div class="mkm-intro-next" id="mkm-intro-next">▼ タップで すすむ</div>
    </div>
    <button class="mkm-intro-skip" id="mkm-intro-skip">スキップ »</button>
  `;
  document.body.appendChild(ov);

  const stage    = ov.querySelector('#mkm-intro-stage');
  const charEl   = ov.querySelector('#mkm-intro-char');
  const charIcon = ov.querySelector('#mkm-intro-char-icon');
  const speakerEl = ov.querySelector('#mkm-intro-speaker');
  const textEl    = ov.querySelector('#mkm-intro-text');

  const show = () => {
    const s = scenes[i];
    speakerEl.textContent = s.speaker;
    textEl.textContent = s.text;
    // 頭の中に響く声＝テキストを神秘的なスタイルに
    textEl.classList.toggle('mkm-intro-voice-text', !!s.voice);
    speakerEl.classList.toggle('mkm-intro-voice-name', !!s.voice);
    if (s.showMon) {
      const m = getMonsterMaster(s.showMon);
      const fam = famInfo(m.family);
      charEl.innerHTML = `
        <div class="mkm-intro-mon" style="background:${fam.color}33;box-shadow:0 0 40px ${fam.color}88">
          <img src="${monImg(s.showMon)}" alt=""
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
          <div class="mkm-card-ph" style="background:${fam.color};display:none"><span style="font-size:3rem">${escHtml(m.name[0])}</span></div>
        </div>`;
      sfx('scoutOk');
    } else if (s.showChar) {
      charEl.innerHTML = `
        <div class="mkm-intro-mon mkm-intro-portrait">
          <img src="${s.showChar}" alt="" onerror="this.style.display='none'"/>
        </div>`;
    } else {
      charEl.innerHTML = speakerCharHtml(s.speaker);
    }
    // 転生の閃光演出
    if (s.flash) {
      const fl = document.createElement('div');
      fl.className = 'mkm-intro-flash';
      stage.appendChild(fl);
      sfx('win');
      setTimeout(() => fl.remove(), 800);
    }
    sfx('select');
  };

  const advance = () => {
    i++;
    if (i >= scenes.length) { finish(); return; }
    show();
  };

  const finish = () => {
    d.flags = d.flags || {};
    d.flags.introDone = true;
    save();
    // 暗転 → ロケーションカード → 村へフェードイン
    const fade = document.createElement('div');
    fade.className = 'mkm-scene-fade';
    document.body.appendChild(fade);
    requestAnimationFrame(() => fade.classList.add('on'));
    setTimeout(() => {
      ov.remove();
      enterVillage();                       // 村を暗転の裏で描画
      showLocCard('🌿 始まりの村', '—— 藻生（セカンドライフ）の はじまり ——');
      setTimeout(() => {                     // 暗転を消して村を見せる
        fade.classList.remove('on');
        setTimeout(() => fade.remove(), 800);
      }, 2200);
    }, 700);
  };

  ov.querySelector('#mkm-intro-stage').onclick = advance;
  ov.querySelector('.mkm-intro-box').onclick = advance;
  ov.querySelector('#mkm-intro-skip').onclick = (e) => { e.stopPropagation(); finish(); };

  show();
}

function bindBack() {
  const btn = document.getElementById('mokumon-back-btn');
  if (btn) btn.onclick = () => {
    // 本体のロビーへ戻る（script.js側のshowMinigameLobbyを使う）
    if (window.showMinigameLobby) window.showMinigameLobby();
  };
}

// ========================================
// コンポーネント：モンスターカード
// ========================================

function card(inst, size = 'md', onClick) {
  const master = getMonsterMaster(inst.monsterId);
  const el = document.createElement('div');
  if (!master) { el.className = 'mkm-card'; el.textContent = '？'; return el; }

  const fam = famInfo(master.family);
  const rc = rankColor(master.rank);
  const st = calcStats(inst);
  const name = inst.nickname || master.name;
  const mutant = inst.mutationType && inst.mutationType !== 'none';

  el.className = `mkm-card mkm-card--${size}`;
  el.innerHTML = `
    <div class="mkm-card-rank" style="background:${rc}">${master.rank}</div>
    ${mutant ? '<div class="mkm-card-mut">★</div>' : ''}
    <div class="mkm-card-img" style="background:${fam.color}22">
      <img src="${monImg(master.monsterId)}" alt="${escHtml(master.name)}"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
      <div class="mkm-card-ph" style="background:${fam.color};display:none"><span>${escHtml(master.name[0])}</span></div>
    </div>
    <div class="mkm-card-body">
      <div class="mkm-card-name">${escHtml(name)}</div>
      <div class="mkm-card-sub">
        <span class="mkm-tag" style="background:${fam.color}">${fam.name}</span>
        <span class="mkm-lv">Lv.${inst.level}</span>
      </div>
      ${size === 'md' ? `
        <div class="mkm-card-stats">
          <span>HP ${st.hp}</span><span>攻 ${st.atk}</span><span>守 ${st.def}</span>
          <span>魔 ${st.mag}</span><span>精 ${st.mnd}</span><span>速 ${st.spd}</span>
        </div>` : ''}
    </div>
    ${inst.isFavorite ? '<div class="mkm-card-fav">♥</div>' : ''}
  `;
  if (onClick) { el.style.cursor = 'pointer'; el.onclick = () => onClick(inst); }
  return el;
}

// ========================================
// 画面：牧場
// ========================================

let _farmFilter = { family: 'all', sort: 'dex' };

function renderFarm() {
  root().innerHTML = `
    <div class="mg-game-header">
      <button id="mokumon-back-btn" class="mg-back-btn">‹ 戻る</button>
      <h2 class="mg-game-title">🌿 牧場</h2>
      <span class="mkm-count" id="mkm-farm-count"></span>
    </div>
    <div class="mkm-filter">
      <select id="mkm-filter-family">
        <option value="all">全系統</option>
        ${Object.entries(FAMILIES).map(([k,v]) => `<option value="${k}">${v.name}</option>`).join('')}
      </select>
      <select id="mkm-filter-sort">
        <option value="dex">図鑑順</option>
        <option value="level">レベル順</option>
        <option value="rank">ランク順</option>
      </select>
    </div>
    <div class="mkm-grid" id="mkm-farm-grid"></div>
  `;
  renderFarmList();
  document.getElementById('mkm-filter-family').onchange = e => { _farmFilter.family = e.target.value; renderFarmList(); };
  document.getElementById('mkm-filter-sort').onchange   = e => { _farmFilter.sort   = e.target.value; renderFarmList(); };
  document.getElementById('mokumon-back-btn').onclick   = enterVillage;
}

function renderFarmList() {
  const d = data();
  const grid = document.getElementById('mkm-farm-grid');
  let list = Object.values(d.monsters);

  if (_farmFilter.family !== 'all') {
    list = list.filter(m => getMonsterMaster(m.monsterId)?.family === _farmFilter.family);
  }
  list.sort((a, b) => {
    const ma = getMonsterMaster(a.monsterId), mb = getMonsterMaster(b.monsterId);
    if (_farmFilter.sort === 'level') return b.level - a.level;
    if (_farmFilter.sort === 'rank')  return RANKS.indexOf(mb?.rank) - RANKS.indexOf(ma?.rank);
    return (ma?.monsterId ?? 0) - (mb?.monsterId ?? 0);
  });

  const total = Object.keys(d.monsters).length;
  const countEl = document.getElementById('mkm-farm-count');
  if (countEl) countEl.innerHTML = `${total}<span class="mkm-farm-max"> / ${FARM_MAX}</span>${total >= FARM_MAX ? ' <span class="mkm-farm-full">満員</span>' : ''}`;
  grid.innerHTML = '';
  if (list.length === 0) { grid.innerHTML = '<p class="mkm-empty">モンスターがいません</p>'; return; }
  list.forEach(inst => grid.appendChild(card(inst, 'md', showMonsterDetail)));
}

// ========================================
// 画面：図鑑
// ========================================

let _dexFamily = 'all';

function renderDex() {
  root().innerHTML = `
    <div class="mg-game-header">
      <button id="mokumon-back-btn" class="mg-back-btn">‹ 戻る</button>
      <h2 class="mg-game-title">📖 図鑑</h2>
      <span class="mkm-count" id="mkm-dex-prog"></span>
    </div>
    <div class="mkm-dex-tabs" id="mkm-dex-tabs">
      <button class="mkm-dtab active" data-f="all">全</button>
      ${Object.entries(FAMILIES).map(([k,v]) => `<button class="mkm-dtab" data-f="${k}">${v.name}</button>`).join('')}
    </div>
    <div class="mkm-dex-grid" id="mkm-dex-grid"></div>
  `;
  renderDexGrid();
  document.getElementById('mkm-dex-tabs').onclick = e => {
    const b = e.target.closest('.mkm-dtab');
    if (!b) return;
    document.querySelectorAll('.mkm-dtab').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    _dexFamily = b.dataset.f;
    renderDexGrid();
  };
  document.getElementById('mokumon-back-btn').onclick = enterVillage;
}

function renderDexGrid() {
  const d = data();
  const all = MASTER.monsters;
  const grid = document.getElementById('mkm-dex-grid');
  const list = _dexFamily === 'all' ? all : all.filter(m => m.family === _dexFamily);

  const owned = all.filter(m => d.dex[m.monsterId]?.owned).length;
  document.getElementById('mkm-dex-prog').textContent = `${owned} / ${all.length}`;

  grid.innerHTML = '';
  list.forEach(master => {
    const rec = d.dex[master.monsterId];
    const seen = rec?.seen;
    const fam = famInfo(master.family);
    const item = document.createElement('div');
    item.className = `mkm-dex-item ${seen ? '' : 'mkm-dex-hidden'} ${rec?.owned ? 'mkm-dex-owned' : ''}`;
    if (seen) {
      item.innerHTML = `
        <div class="mkm-dex-no">No.${pad3(master.monsterId)}</div>
        <div class="mkm-dex-img" style="border-color:${fam.color}44">
          <img src="${monImg(master.monsterId)}" alt=""
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
          <div class="mkm-card-ph" style="background:${fam.color};display:none"><span>${escHtml(master.name[0])}</span></div>
          <div class="mkm-dex-rank" style="background:${rankColor(master.rank)}">${master.rank}</div>
        </div>
        <div class="mkm-dex-name">${escHtml(master.name)}</div>
      `;
      item.onclick = () => showDexDetail(master, rec);
    } else {
      item.innerHTML = `
        <div class="mkm-dex-no">No.${pad3(master.monsterId)}</div>
        <div class="mkm-dex-img mkm-dex-unknown"><div class="mkm-card-ph" style="background:#444"><span>？</span></div></div>
        <div class="mkm-dex-name">？？？</div>
      `;
    }
    grid.appendChild(item);
  });
}

function buildFusionTableHtml(master) {
  const mid = master.monsterId;
  const rows = [];

  const chip = (m, filled) => {
    const f = famInfo(m.family);
    return `<span class="mkm-fusion-chip" style="border-color:${f.color}${filled ? `;background:${f.color}18` : ''}">${escHtml(m.name)}</span>`;
  };

  // このモンスターを作るレシピ（result === mid）
  const recipes = (MASTER.recipes ?? []).filter(r => r.result === mid);
  if (recipes.length) {
    rows.push('<div class="mkm-fusion-table-title">⚗️ このモンスターの作り方</div>');
    recipes.forEach(r => {
      const mA = getMonsterMaster(r.a), mB = getMonsterMaster(r.b);
      if (!mA || !mB) return;
      rows.push(`
        <div class="mkm-fusion-row">
          ${chip(mA, false)}
          <span class="mkm-fusion-plus">＋</span>
          ${chip(mB, false)}
          <span class="mkm-fusion-plus">→</span>
          ${chip(master, true)}
        </div>`);
    });
  }

  // このモンスターが素材になるレシピ（a === mid or b === mid）
  const usedIn = (MASTER.recipes ?? []).filter(r => r.a === mid || r.b === mid);
  // fusionResult（チェーン進化）：このモンスター＋なかま → 進化先
  if (master.fusionResult && !usedIn.find(r => r.result === master.fusionResult)) {
    const next = getMonsterMaster(master.fusionResult);
    if (next) {
      rows.push('<div class="mkm-fusion-table-title" style="margin-top:10px">🔗 配合で進化する</div>');
      rows.push(`<div class="mkm-fusion-row">
        ${chip(master, true)}
        <span class="mkm-fusion-plus">＋</span>
        <span class="mkm-fusion-chip" style="border-color:#bbb;color:var(--mkm-muted)">同ランク以下</span>
        <span class="mkm-fusion-plus">→</span>
        ${chip(next, true)}
      </div>`);
    }
  }
  // このモンスターを素材に使うレシピ：このモンスター＋相方 → 結果
  if (usedIn.length) {
    rows.push('<div class="mkm-fusion-table-title" style="margin-top:10px">🔗 配合で生まれる</div>');
    usedIn.forEach(r => {
      const partner = getMonsterMaster(r.a === mid ? r.b : r.a);
      const result = getMonsterMaster(r.result);
      if (!result || !partner) return;
      rows.push(`<div class="mkm-fusion-row">
        ${chip(master, true)}
        <span class="mkm-fusion-plus">＋</span>
        ${chip(partner, false)}
        <span class="mkm-fusion-plus">→</span>
        ${chip(result, true)}
      </div>`);
    });
  }

  if (!rows.length) return '';
  return `<div class="mkm-fusion-table">${rows.join('')}</div>`;
}

function showDexDetail(master, rec) {
  const fam = famInfo(master.family);
  const x = master.dexInfo;
  const owned = rec?.owned ?? false;
  const stars = (n, max, fill) =>
    Array.from({length: max}, (_, i) =>
      `<span style="color:${i < n ? fill : '#ccc'}">${i < n ? '★' : '☆'}</span>`
    ).join('');
  const unknown = `<span style="color:var(--mkm-muted);letter-spacing:2px">？？？</span>`;
  const ov = document.createElement('div');
  ov.className = 'mkm-modal-ov';
  ov.innerHTML = `
    <div class="mkm-modal" style="border-top:3px solid ${fam.color}">
      <button class="mkm-modal-close">✕</button>
      <div class="mkm-detail-head">
        <div class="mkm-dex-no">No.${pad3(master.monsterId)}</div>
        <div class="mkm-detail-img" style="background:${fam.color}22">
          <img alt=""
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
          <div class="mkm-card-ph" style="background:${fam.color};display:none"><span style="font-size:2rem">${escHtml(master.name[0])}</span></div>
        </div>
        <h3 class="mkm-detail-name" style="color:${fam.color}">${escHtml(master.name)}</h3>
        <div class="mkm-detail-tags">
          <span class="mkm-tag" style="background:${fam.color}">${fam.name}系</span>
          <span class="mkm-tag" style="background:${rankColor(master.rank)}">${master.rank}</span>
        </div>
      </div>
      <div class="mkm-info-grid">
        <div class="mkm-info-cell">
          <div class="mkm-info-lbl">身長</div>
          <div class="mkm-info-val">${owned ? escHtml(x.height) : unknown}</div>
        </div>
        <div class="mkm-info-cell">
          <div class="mkm-info-lbl">体重</div>
          <div class="mkm-info-val">${owned ? escHtml(x.weight) : unknown}</div>
        </div>
        <div class="mkm-info-cell">
          <div class="mkm-info-lbl">危険度</div>
          <div class="mkm-stars">${stars(x.danger, 5, '#e53935')}</div>
        </div>
        <div class="mkm-info-cell">
          <div class="mkm-info-lbl">希少度</div>
          <div class="mkm-stars">${owned ? stars(x.rarity, 4, '#f9a825') : unknown}</div>
        </div>
        <div class="mkm-info-cell mkm-info-cell--wide">
          <div class="mkm-info-lbl">生息地</div>
          <div class="mkm-info-val">${escHtml(x.habitat)}</div>
        </div>
        <div class="mkm-info-cell">
          <div class="mkm-info-lbl">好物</div>
          <div class="mkm-info-val">${owned ? escHtml(x.favorite) : unknown}</div>
        </div>
        <div class="mkm-info-cell">
          <div class="mkm-info-lbl">寿命</div>
          <div class="mkm-info-val">${owned ? escHtml(x.lifespan) : unknown}</div>
        </div>
      </div>
      ${owned
        ? `<div class="mkm-detail-desc">${escHtml(x.description)}</div>`
        : `<div class="mkm-detail-desc mkm-dex-locked">🔒 仲間にすると読めるようになる</div>`
      }
      ${buildFusionTableHtml(master)}
    </div>
  `;
  document.body.appendChild(ov);
  ov.querySelector('.mkm-detail-img img').src = monImg(master.monsterId);
  ov.querySelector('.mkm-modal-close').onclick = () => ov.remove();
  ov.onclick = e => { if (e.target === ov) ov.remove(); };
}

// ========================================
// モンスター詳細（牧場から）
// ========================================

function showMonsterDetail(inst) {
  const master = getMonsterMaster(inst.monsterId);
  const fam = famInfo(master.family);
  const st = calcStats(inst);
  const skills = inst.skills.map(id => getSkillMaster(id)).filter(Boolean);

  const atMax = inst.level >= LEVEL_MAX;
  const expCur = atMax ? 0 : inst.exp;
  const expNxt = atMax ? 1 : expToNext(inst.level);
  const expPct = atMax ? 100 : Math.min(100, Math.floor(expCur / expNxt * 100));

  const ov = document.createElement('div');
  ov.className = 'mkm-modal-ov';
  ov.innerHTML = `
    <div class="mkm-modal" style="border-top:3px solid ${fam.color}">
      <button class="mkm-modal-close">✕</button>
      <div class="mkm-detail-head">
        <div class="mkm-detail-img" style="background:${fam.color}40;box-shadow:0 0 20px ${fam.color}60">
          <img src="${monImg(master.monsterId)}" alt=""
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
          <div class="mkm-card-ph" style="background:${fam.color};display:none"><span style="font-size:2rem">${escHtml(master.name[0])}</span></div>
        </div>
        <h3 class="mkm-detail-name">${escHtml(inst.nickname || master.name)}</h3>
        <div class="mkm-detail-tags">
          <span class="mkm-tag" style="background:${fam.color}">${fam.name}系</span>
          <span class="mkm-tag" style="background:${rankColor(master.rank)}">${master.rank}</span>
          <span class="mkm-lv">Lv.${inst.level}</span>
        </div>
        <div class="mkm-exp-bar-wrap">
          <div class="mkm-exp-bar-track">
            <div class="mkm-exp-bar-fill" style="width:${expPct}%;background:${fam.color}"></div>
          </div>
          <div class="mkm-exp-bar-label">
            ${atMax ? '<span style="color:#ffd700">MAX</span>' : `EXP ${fmtNum(expCur)} / ${fmtNum(expNxt)}`}
          </div>
        </div>
      </div>
      <div class="mkm-stat-grid">
        <div class="mkm-stat-cell mkm-stat-hp"><div class="mkm-stat-lbl">HP</div><div class="mkm-stat-val">${st.hp}</div></div>
        <div class="mkm-stat-cell mkm-stat-mp"><div class="mkm-stat-lbl">MP</div><div class="mkm-stat-val">${st.mp}</div></div>
        <div class="mkm-stat-cell mkm-stat-atk"><div class="mkm-stat-lbl">攻撃</div><div class="mkm-stat-val">${st.atk}</div></div>
        <div class="mkm-stat-cell mkm-stat-def"><div class="mkm-stat-lbl">守備</div><div class="mkm-stat-val">${st.def}</div></div>
        <div class="mkm-stat-cell mkm-stat-mag"><div class="mkm-stat-lbl">魔力</div><div class="mkm-stat-val">${st.mag}</div></div>
        <div class="mkm-stat-cell mkm-stat-mnd"><div class="mkm-stat-lbl">精神</div><div class="mkm-stat-val">${st.mnd}</div></div>
        <div class="mkm-stat-cell mkm-stat-spd"><div class="mkm-stat-lbl">素早さ</div><div class="mkm-stat-val">${st.spd}</div></div>
        <div class="mkm-stat-cell mkm-stat-grow"><div class="mkm-stat-lbl">成長</div><div class="mkm-stat-val mkm-stat-val--sm">${master.growthType}</div></div>
      </div>
      <div class="mkm-skill-list">
        <div class="mkm-skill-title">習得特技</div>
        ${skills.map(s => `
          <div class="mkm-skill-item">
            <span class="mkm-skill-name">${escHtml(s.name)}</span>
            <span class="mkm-skill-desc-short">${escHtml(s.desc ?? '')}</span>
            <span class="mkm-skill-mp">MP${s.mpCost}</span>
          </div>`).join('')}
      </div>
      <div class="mkm-detail-actions" id="mkm-detail-actions"></div>
    </div>
  `;
  document.body.appendChild(ov);
  renderDetailActions(ov, inst);
  ov.querySelector('.mkm-modal-close').onclick = () => ov.remove();
  ov.onclick = e => { if (e.target === ov) ov.remove(); };
}

// 詳細画面のアクションボタン群（パーティ・お気に入り・改名）
function renderDetailActions(ov, inst) {
  const d = data();
  const cont = ov.querySelector('#mkm-detail-actions');
  const inParty = d.party.includes(inst.instanceId);
  const partyCount = d.party.filter(Boolean).length;

  cont.innerHTML = `
    <button class="mkm-btn-primary" id="mkm-act-party">
      ${inParty ? '◀ パーティから外す' : '＋ パーティに入れる'}
    </button>
    <div class="mkm-detail-actions-row">
      <button class="mkm-btn-sec" id="mkm-act-fav">${inst.isFavorite ? '♥ ロック中' : '♡ お気に入り'}</button>
      <button class="mkm-btn-sec" id="mkm-act-rename">✏️ なまえ</button>
    </div>
    <button class="mkm-btn-release" id="mkm-act-release" ${inst.isFavorite ? 'disabled title="ロック中は逃がせません"' : ''}>
      🌊 逃がす
    </button>
  `;

  // パーティ入れ替え
  cont.querySelector('#mkm-act-party').onclick = () => {
    if (inParty) {
      d.party = d.party.map(id => id === inst.instanceId ? null : id);
      sfx('cancel');
      toast('パーティから外しました');
    } else {
      const emptyIdx = d.party.indexOf(null);
      if (emptyIdx === -1) { toast('パーティがいっぱいです（最大3体）'); return; }
      d.party[emptyIdx] = inst.instanceId;
      sfx('select');
      toast('パーティに入れました');
    }
    save();
    renderDetailActions(ov, inst);
  };

  // お気に入り
  cont.querySelector('#mkm-act-fav').onclick = () => {
    inst.isFavorite = !inst.isFavorite;
    sfx('select');
    save();
    renderDetailActions(ov, inst);
  };

  // 逃がす
  cont.querySelector('#mkm-act-release').onclick = () => {
    if (inst.isFavorite) return;
    const master = getMonsterMaster(inst.monsterId);
    const name = inst.nickname || master.name;
    showDialog('確認', `「${name}」を自然に逃がしますか？\nこの操作は取り消せません。`, `
      <div class="mkm-area-list">
        <button class="mkm-area-btn mkm-btn-danger-outline" id="mkm-release-yes">🌊 逃がす</button>
        <button class="mkm-area-btn" id="mkm-release-no">やめる</button>
      </div>`, () => {
      document.getElementById('mkm-release-yes').onclick = () => {
        closeDialog();
        // パーティからも除去
        d.party = d.party.map(id => id === inst.instanceId ? null : id);
        delete d.monsters[inst.instanceId];
        save();
        sfx('cancel');
        toast(`${name} は自然へ帰っていった…`);
        ov.remove();
        renderFarm();
      };
      document.getElementById('mkm-release-no').onclick = closeDialog;
    });
  };

  // 改名（ニックネーム）
  cont.querySelector('#mkm-act-rename').onclick = () => {
    const master = getMonsterMaster(inst.monsterId);
    promptModal({
      title: `${master.name} になまえをつける`,
      placeholder: master.name,
      value: inst.nickname || '',
      okLabel: 'つける',
    }, (name) => {
      inst.nickname = name;
      save();
      const nameEl = ov.querySelector('.mkm-detail-name');
      if (nameEl) nameEl.textContent = inst.nickname || master.name;
    });
  };
}

// ========================================
// 画面：パーティ編成
// ========================================

let _tempParty = null;
let _editSlot = null;

function renderParty() {
  _tempParty = [...data().party];
  root().innerHTML = `
    <div class="mg-game-header">
      <button id="mokumon-back-btn" class="mg-back-btn">‹ 戻る</button>
      <h2 class="mg-game-title">⚔️ パーティ編成</h2>
    </div>
    <div class="mkm-party-slots" id="mkm-party-slots"></div>
    <div class="mkm-party-picker" id="mkm-party-picker" style="display:none">
      <div class="mkm-picker-head">
        <span id="mkm-picker-title">モンスターを選択</span>
        <button class="mkm-link" id="mkm-picker-cancel">キャンセル</button>
      </div>
      <div class="mkm-grid" id="mkm-picker-grid"></div>
    </div>
    <div class="mkm-party-footer">
      <button class="mkm-btn-primary" id="mkm-save-party">このパーティで決定</button>
      <button class="mkm-btn-sec" id="mkm-cancel-party">もどる</button>
    </div>
  `;
  renderPartySlots();
  document.getElementById('mkm-save-party').onclick = () => {
    data().party = _tempParty;
    save();
    enterVillage();
  };
  document.getElementById('mkm-cancel-party').onclick = enterVillage;
  document.getElementById('mkm-picker-cancel').onclick = closePicker;
  document.getElementById('mokumon-back-btn').onclick = enterVillage;
}

function renderPartySlots() {
  const d = data();
  const c = document.getElementById('mkm-party-slots');
  c.innerHTML = '';
  for (let i = 0; i < PARTY_MAX; i++) {
    const id = _tempParty[i];
    const slot = document.createElement('div');
    slot.className = 'mkm-pslot';
    if (id && d.monsters[id]) {
      const inst = d.monsters[id];
      const m = getMonsterMaster(inst.monsterId);
      const fam = famInfo(m?.family);
      slot.innerHTML = `
        <div class="mkm-pslot-filled" style="border-color:${fam.color}">
          <div class="mkm-pslot-img" style="background:${fam.color}22">
            <img src="${monImg(inst.monsterId)}" alt=""
                 onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
            <div class="mkm-card-ph" style="background:${fam.color};display:none"><span>${escHtml((m?.name??'？')[0])}</span></div>
          </div>
          <div class="mkm-pslot-info">
            <div class="mkm-pslot-name">${escHtml(inst.nickname || m?.name)}</div>
            <div class="mkm-pslot-sub">Lv.${inst.level} <span style="color:${rankColor(m?.rank)}">${m?.rank}</span></div>
            <div class="mkm-pslot-expbar"><div class="mkm-pslot-expbar-fill" style="width:${inst.level >= LEVEL_MAX ? 100 : Math.min(100, Math.floor((inst.exp ?? 0) / expToNext(inst.level) * 100))}%"></div></div>
          </div>
          <button class="mkm-pslot-remove" data-i="${i}">✕</button>
        </div>`;
      slot.querySelector('.mkm-pslot-remove').onclick = e => {
        e.stopPropagation();
        _tempParty[i] = null;
        renderPartySlots();
      };
    } else {
      slot.innerHTML = `<div class="mkm-pslot-empty"><span>${i+1}番</span><span class="mkm-pslot-add">＋</span></div>`;
    }
    slot.onclick = e => { if (!e.target.classList.contains('mkm-pslot-remove')) openPicker(i); };
    c.appendChild(slot);
  }
}

function openPicker(slotIndex) {
  _editSlot = slotIndex;
  const d = data();
  const sec = document.getElementById('mkm-party-picker');
  const grid = document.getElementById('mkm-picker-grid');
  document.getElementById('mkm-picker-title').textContent = `${slotIndex+1}番に入れるモンスター`;
  sec.style.display = 'block';
  grid.innerHTML = '';
  const used = new Set(_tempParty.filter(Boolean));
  Object.values(d.monsters).sort((a,b)=>a.monsterId-b.monsterId).forEach(inst => {
    const inParty = used.has(inst.instanceId) && _tempParty[slotIndex] !== inst.instanceId;
    const el = card(inst, 'sm', inParty ? null : (x) => {
      _tempParty[slotIndex] = x.instanceId;
      renderPartySlots();
      closePicker();
    });
    if (inParty) el.classList.add('mkm-card--dim');
    grid.appendChild(el);
  });
}

function closePicker() {
  document.getElementById('mkm-party-picker').style.display = 'none';
  _editSlot = null;
}

// ========================================
// フィールド（エリア・エンカウント）
// ========================================

// エリア定義：出現モンスターID（藻系20体から序盤向け）と推奨レベル帯
const AREAS = [
  {
    id: 'wetland',
    name: '大湿原',
    desc: '藻系モンスターが多く生息する はじまりの地',
    emoji: '🌾',
    floors: [
      {
        no: 1, name: 'B1F',
        enemyPool: [
          { monsterId: 1,  weight: 45, lv: [1, 2] },  // 藻ぷに
          { monsterId: 6,  weight: 30, lv: [1, 2] },  // 藻ひも
          { monsterId: 9,  weight: 15, lv: [1, 2] },  // 藻かぶり
          { monsterId: 11, weight: 10, lv: [2, 3] },  // 藻泡
        ],
      },
      {
        no: 2, name: 'B2F',
        enemyPool: [
          { monsterId: 9,  weight: 30, lv: [3, 5] },  // 藻かぶり
          { monsterId: 11, weight: 25, lv: [3, 5] },  // 藻泡
          { monsterId: 2,  weight: 25, lv: [3, 5] },  // 藻もち
          { monsterId: 14, weight: 15, lv: [4, 5] },  // 藻岩
          { monsterId: 1,  weight: 5,  lv: [3, 4] },  // 藻ぷに
          { monsterId: 23, weight: 1,  lv: [5, 7] },  // 藻メタル（激レア）
        ],
      },
      {
        no: 3, name: 'B3F',
        enemyPool: [
          { monsterId: 2,  weight: 28, lv: [5, 8] },  // 藻もち
          { monsterId: 14, weight: 25, lv: [5, 8] },  // 藻岩
          { monsterId: 11, weight: 20, lv: [5, 7] },  // 藻泡
          { monsterId: 19, weight: 15, lv: [6, 8] },  // 藻ざる
          { monsterId: 3,  weight: 12, lv: [6, 8] },  // 藻だんご
          { monsterId: 23, weight: 1,  lv: [7, 9] },  // 藻メタル（激レア）
        ],
      },
      {
        no: 4, name: 'B4F', isBossFloor: true,
        boss: { monsterId: 20, lv: 12 },              // 藻ぬし（ボス）
        enemyPool: [
          { monsterId: 1,  weight: 5, lv: [10, 12] }, // 藻ぷに
          { monsterId: 2,  weight: 5, lv: [10, 12] }, // 藻もち
          { monsterId: 3,  weight: 5, lv: [10, 12] }, // 藻だんご
          { monsterId: 4,  weight: 5, lv: [10, 12] }, // 藻まんじゅう
          { monsterId: 5,  weight: 5, lv: [10, 12] }, // 藻大福
          { monsterId: 6,  weight: 5, lv: [10, 12] }, // 藻ひも
          { monsterId: 7,  weight: 5, lv: [10, 12] }, // 藻なわ
          { monsterId: 8,  weight: 5, lv: [10, 12] }, // 藻むち師
          { monsterId: 9,  weight: 5, lv: [10, 12] }, // 藻かぶり
          { monsterId: 10, weight: 5, lv: [10, 12] }, // 藻かぶり兵
          { monsterId: 11, weight: 5, lv: [10, 12] }, // 藻泡
          { monsterId: 12, weight: 5, lv: [10, 12] }, // 藻バブル
          { monsterId: 13, weight: 5, lv: [10, 12] }, // 藻フォーム
          { monsterId: 14, weight: 5, lv: [10, 12] }, // 藻岩
          { monsterId: 15, weight: 5, lv: [10, 12] }, // 藻巌
          { monsterId: 16, weight: 5, lv: [10, 12] }, // 藻城壁
          { monsterId: 17, weight: 5, lv: [10, 12] }, // 藻おに
          { monsterId: 18, weight: 5, lv: [10, 12] }, // 藻せんせい
          { monsterId: 19, weight: 5, lv: [10, 12] }, // 藻ざる
        ],
      },
    ],
    // 後方互換：floors未対応コードのfallback
    get enemyPool() { return this.floors[0].enemyPool; },
  },
  {
    id: 'deepsea',
    name: '奈落海溝',
    unimplemented: true,
    desc: '深海系モンスターが棲む 暗く深い海',
    emoji: '🌊',
    requires: 'wetland',   // 大湿原クリアで解放
    floors: [
      {
        no: 1, name: 'B1F',
        enemyPool: [
          { monsterId: 100, weight: 35, lv: [10, 12] }, // 深海ぷか
          { monsterId: 104, weight: 25, lv: [10, 12] }, // タコすけ
          { monsterId: 107, weight: 20, lv: [10, 12] }, // イカちび
          { monsterId: 101, weight: 12, lv: [11, 13] }, // どくくらげ
          { monsterId: 122, weight: 1,  lv: [13, 15] }, // 海ぬしの子（激レア）
        ],
      },
      {
        no: 2, name: 'B2F',
        enemyPool: [
          { monsterId: 101, weight: 26, lv: [12, 15] }, // どくくらげ
          { monsterId: 105, weight: 22, lv: [12, 15] }, // タコ法師
          { monsterId: 108, weight: 22, lv: [12, 15] }, // イカ忍者
          { monsterId: 111, weight: 16, lv: [13, 16] }, // ふかうおまる
          { monsterId: 112, weight: 14, lv: [13, 16] }, // グソクムシくん
        ],
      },
      {
        no: 3, name: 'B3F',
        enemyPool: [
          { monsterId: 110, weight: 22, lv: [15, 18] }, // ちょうちんあんこう
          { monsterId: 114, weight: 22, lv: [15, 18] }, // サメこぞう
          { monsterId: 103, weight: 18, lv: [16, 18] }, // 大くらげ
          { monsterId: 106, weight: 16, lv: [16, 18] }, // タコ部長
          { monsterId: 109, weight: 14, lv: [16, 18] }, // イカ課長
          { monsterId: 102, weight: 8,  lv: [16, 19] }, // でんきくらげ
        ],
      },
      {
        no: 4, name: 'B4F', isBossFloor: true,
        boss: { monsterId: 122, lv: 22 },              // 海ぬし（ボス）
        enemyPool: [
          { monsterId: 113, weight: 30, lv: [18, 20] }, // メガグソクムシ
          { monsterId: 115, weight: 28, lv: [18, 20] }, // ノコギリザメ
          { monsterId: 117, weight: 22, lv: [18, 20] }, // クラゲ主任
          { monsterId: 116, weight: 8,  lv: [19, 21] }, // しんかいザメ
          { monsterId: 118, weight: 7,  lv: [19, 21] }, // ダイオウイカ
          { monsterId: 119, weight: 5,  lv: [19, 21] }, // うみへび王子
        ],
      },
    ],
    get enemyPool() { return this.floors[0].enemyPool; },
  },
  {
    id: 'machine',
    name: '機械都市クローム',
    unimplemented: true,
    desc: '機械系モンスターが稼働する 鋼鉄の都市',
    emoji: '⚙️',
    requires: 'deepsea',   // 奈落海溝クリアで解放
    floors: [
      { no: 1, name: 'B1F', enemyPool: [
        { monsterId: 200, weight: 35, lv: [20, 22] },  // ぜんまいくん
        { monsterId: 203, weight: 25, lv: [20, 22] },  // ねじまる
        { monsterId: 205, weight: 20, lv: [20, 22] },  // はぐるま
        { monsterId: 208, weight: 12, lv: [21, 23] },  // でんちくん
        { monsterId: 222, weight: 1,  lv: [23, 25] },  // 鋼ぬしの子（激レア）
      ]},
      { no: 2, name: 'B2F', enemyPool: [
        { monsterId: 201, weight: 26, lv: [22, 25] },  // ぜんまいボット
        { monsterId: 204, weight: 22, lv: [22, 25] },  // ねじゴーレム
        { monsterId: 206, weight: 20, lv: [22, 25] },  // ギアナイト
        { monsterId: 215, weight: 16, lv: [23, 26] },  // サーチアイ
        { monsterId: 209, weight: 16, lv: [23, 26] },  // バッテリー獣
      ]},
      { no: 3, name: 'B3F', enemyPool: [
        { monsterId: 210, weight: 22, lv: [25, 28] },  // ドリルモグ
        { monsterId: 212, weight: 20, lv: [25, 28] },  // 鉄壁ロボ
        { monsterId: 216, weight: 18, lv: [25, 28] },  // 電脳ウィルス
        { monsterId: 202, weight: 16, lv: [26, 28] },  // オートマトン
        { monsterId: 207, weight: 14, lv: [26, 28] },  // ギアロード
        { monsterId: 211, weight: 10, lv: [26, 29] },  // 大型ドリル
      ]},
      { no: 4, name: 'B4F', isBossFloor: true, boss: { monsterId: 222, lv: 32 }, enemyPool: [
        { monsterId: 213, weight: 30, lv: [28, 30] },  // 重装甲ロボ
        { monsterId: 217, weight: 26, lv: [28, 30] },  // メカクラブ
        { monsterId: 214, weight: 8,  lv: [29, 31] },  // 要塞ロボ
        { monsterId: 218, weight: 7,  lv: [29, 31] },  // 戦車型メカ
        { monsterId: 219, weight: 5,  lv: [29, 31] },  // 機械皇子
      ]},
    ],
    get enemyPool() { return this.floors[0].enemyPool; },
  },
  {
    id: 'spirit',
    name: '世界樹の神域',
    unimplemented: true,
    desc: '精霊系モンスターが舞う 聖なる森',
    emoji: '🌳',
    requires: 'machine',
    floors: [
      { no: 1, name: 'B1F', enemyPool: [
        { monsterId: 300, weight: 35, lv: [30, 32] },  // ようせい
        { monsterId: 303, weight: 25, lv: [30, 32] },  // きのこ精
        { monsterId: 305, weight: 20, lv: [30, 32] },  // はなのせい
        { monsterId: 307, weight: 12, lv: [31, 33] },  // ひかりだま
        { monsterId: 322, weight: 1,  lv: [33, 35] },  // 樹ぬしの子（激レア）
      ]},
      { no: 2, name: 'B2F', enemyPool: [
        { monsterId: 301, weight: 24, lv: [32, 35] },  // ひかりようせい
        { monsterId: 304, weight: 22, lv: [32, 35] },  // もり精
        { monsterId: 309, weight: 18, lv: [32, 35] },  // いやしの精
        { monsterId: 313, weight: 16, lv: [33, 36] },  // 風の精
        { monsterId: 314, weight: 14, lv: [33, 36] },  // 水の精
        { monsterId: 306, weight: 12, lv: [34, 36] },  // 花園の精
      ]},
      { no: 3, name: 'B3F', enemyPool: [
        { monsterId: 308, weight: 22, lv: [35, 38] },  // 光球の精
        { monsterId: 311, weight: 20, lv: [35, 38] },  // 森の番人
        { monsterId: 302, weight: 18, lv: [36, 38] },  // 大精霊
        { monsterId: 310, weight: 16, lv: [36, 38] },  // 癒しの大精霊
        { monsterId: 312, weight: 14, lv: [36, 38] },  // 森の守護者
        { monsterId: 315, weight: 10, lv: [36, 39] },  // 光の戦士
      ]},
      { no: 4, name: 'B4F', isBossFloor: true, boss: { monsterId: 322, lv: 42 }, enemyPool: [
        { monsterId: 316, weight: 28, lv: [38, 40] },  // 聖樹の精
        { monsterId: 317, weight: 26, lv: [38, 40] },  // 妖精女王
        { monsterId: 318, weight: 24, lv: [39, 41] },  // 世界樹の化身
        { monsterId: 319, weight: 22, lv: [39, 41] },  // 精霊皇子
      ]},
    ],
    get enemyPool() { return this.floors[0].enemyPool; },
  },
  {
    id: 'ghost',
    name: '黄昏墓地',
    unimplemented: true,
    desc: '亡霊系モンスターが彷徨う 死者の地',
    emoji: '🪦',
    requires: 'spirit',
    floors: [
      { no: 1, name: 'B1F', enemyPool: [
        { monsterId: 400, weight: 35, lv: [38, 40] },  // おばけ藻
        { monsterId: 403, weight: 25, lv: [38, 40] },  // がいこつ兵
        { monsterId: 407, weight: 20, lv: [38, 40] },  // ぞんび藻
        { monsterId: 405, weight: 12, lv: [39, 41] },  // ちょうちん火
        { monsterId: 422, weight: 1,  lv: [41, 43] },  // 霊ぬしの子（激レア）
      ]},
      { no: 2, name: 'B2F', enemyPool: [
        { monsterId: 401, weight: 24, lv: [40, 44] },  // うらみ藻
        { monsterId: 411, weight: 22, lv: [40, 44] },  // ふゆうれい
        { monsterId: 414, weight: 18, lv: [40, 44] },  // やみネコ
        { monsterId: 406, weight: 16, lv: [41, 45] },  // 亡霊火球
        { monsterId: 409, weight: 14, lv: [41, 45] },  // しにがみ藻
        { monsterId: 412, weight: 12, lv: [42, 45] },  // のろい人形
      ]},
      { no: 3, name: 'B3F', enemyPool: [
        { monsterId: 404, weight: 20, lv: [44, 48] },  // がいこつ騎士
        { monsterId: 402, weight: 20, lv: [45, 48] },  // 怨霊
        { monsterId: 408, weight: 18, lv: [45, 48] },  // くされ藻王
        { monsterId: 413, weight: 16, lv: [45, 48] },  // ばんしー
        { monsterId: 415, weight: 16, lv: [45, 48] },  // ふっかつ霊
      ]},
      { no: 4, name: 'B4F', isBossFloor: true, boss: { monsterId: 422, lv: 52 }, enemyPool: [
        { monsterId: 410, weight: 26, lv: [48, 50] },  // 大しにがみ
        { monsterId: 416, weight: 22, lv: [48, 50] },  // じごく番犬
        { monsterId: 417, weight: 20, lv: [49, 51] },  // りっち
        { monsterId: 418, weight: 18, lv: [49, 51] },  // 冥府の使者
        { monsterId: 419, weight: 16, lv: [49, 51] },  // 亡霊皇子
      ]},
    ],
    get enemyPool() { return this.floors[0].enemyPool; },
  },
  {
    id: 'corporate',
    name: '超巨大企業都市',
    unimplemented: true,
    desc: '企業系モンスターが蠢く 欲望の摩天楼',
    emoji: '🏙️',
    requires: 'ghost',
    floors: [
      { no: 1, name: 'B1F', enemyPool: [
        { monsterId: 500, weight: 33, lv: [45, 47] },  // しんにゅう藻
        { monsterId: 503, weight: 25, lv: [45, 47] },  // 藻OL
        { monsterId: 507, weight: 20, lv: [45, 47] },  // 藻新人営業
        { monsterId: 501, weight: 12, lv: [46, 48] },  // 藻社員
        { monsterId: 522, weight: 1,  lv: [48, 50] },  // 社ぬしの子（激レア）
      ]},
      { no: 2, name: 'B2F', enemyPool: [
        { monsterId: 501, weight: 22, lv: [47, 51] },  // 藻社員
        { monsterId: 505, weight: 22, lv: [47, 51] },  // 藻警備員
        { monsterId: 509, weight: 18, lv: [47, 51] },  // 藻経理
        { monsterId: 504, weight: 16, lv: [48, 51] },  // 藻秘書
        { monsterId: 508, weight: 14, lv: [48, 51] },  // 藻トップ営業
        { monsterId: 514, weight: 12, lv: [49, 51] },  // 藻広報
      ]},
      { no: 3, name: 'B3F', enemyPool: [
        { monsterId: 502, weight: 20, lv: [51, 55] },  // 藻課長
        { monsterId: 506, weight: 18, lv: [51, 55] },  // 藻SP
        { monsterId: 510, weight: 18, lv: [51, 55] },  // 藻監査役
        { monsterId: 511, weight: 16, lv: [52, 55] },  // 藻部長
        { monsterId: 513, weight: 16, lv: [52, 55] },  // 藻弁護士
        { monsterId: 515, weight: 12, lv: [52, 55] },  // 藻投資家
      ]},
      { no: 4, name: 'B4F', isBossFloor: true, boss: { monsterId: 522, lv: 60 }, enemyPool: [
        { monsterId: 512, weight: 26, lv: [55, 58] },  // 藻役員
        { monsterId: 516, weight: 22, lv: [55, 58] },  // 藻CEO
        { monsterId: 517, weight: 20, lv: [56, 58] },  // 藻AI
        { monsterId: 518, weight: 18, lv: [56, 58] },  // 藻会長
        { monsterId: 519, weight: 16, lv: [56, 58] },  // 企業皇子
      ]},
    ],
    get enemyPool() { return this.floors[0].enemyPool; },
  },
  {
    id: 'disaster',
    name: '終焉火山',
    unimplemented: true,
    desc: '災厄系モンスターが暴れる 灼熱の地獄',
    emoji: '🌋',
    requires: 'corporate',
    floors: [
      { no: 1, name: 'B1F', enemyPool: [
        { monsterId: 600, weight: 33, lv: [55, 58] },  // ひぶくれ藻
        { monsterId: 603, weight: 22, lv: [55, 58] },  // おにび鬼
        { monsterId: 605, weight: 20, lv: [55, 58] },  // どくづめ
        { monsterId: 601, weight: 12, lv: [56, 59] },  // ようがん藻
        { monsterId: 622, weight: 1,  lv: [58, 61] },  // 災ぬしの子（激レア）
      ]},
      { no: 2, name: 'B2F', enemyPool: [
        { monsterId: 601, weight: 22, lv: [58, 63] },  // ようがん藻
        { monsterId: 607, weight: 20, lv: [58, 63] },  // がんせき魔
        { monsterId: 609, weight: 18, lv: [58, 63] },  // じばく藻
        { monsterId: 604, weight: 16, lv: [59, 63] },  // えんま鬼
        { monsterId: 606, weight: 14, lv: [59, 63] },  // もうどく獣
        { monsterId: 610, weight: 12, lv: [60, 63] },  // やみほのお
        { monsterId: 611, weight: 10, lv: [60, 63] },  // ひとくいばな
      ]},
      { no: 3, name: 'B3F', enemyPool: [
        { monsterId: 602, weight: 22, lv: [63, 68] },  // ごくえん藻王
        { monsterId: 608, weight: 20, lv: [63, 68] },  // ばくえん巨魔
        { monsterId: 612, weight: 18, lv: [64, 68] },  // じごく犬
        { monsterId: 613, weight: 18, lv: [64, 68] },  // さいがい鳥
      ]},
      { no: 4, name: 'B4F', isBossFloor: true, boss: { monsterId: 622, lv: 75 }, enemyPool: [
        { monsterId: 614, weight: 20, lv: [68, 72] },  // ようがん竜
        { monsterId: 615, weight: 18, lv: [68, 72] },  // しんえん魔
        { monsterId: 616, weight: 18, lv: [68, 72] },  // はめつ獣
        { monsterId: 617, weight: 16, lv: [69, 72] },  // えんごく姫
        { monsterId: 618, weight: 16, lv: [69, 72] },  // しゅうまつ竜
        { monsterId: 619, weight: 12, lv: [69, 72] },  // 災厄皇子
      ]},
    ],
    get enemyPool() { return this.floors[0].enemyPool; },
  },
];

function renderField() {
  root().innerHTML = `
    <div class="mg-game-header">
      <button id="mokumon-back-btn" class="mg-back-btn">‹ 戻る</button>
      <h2 class="mg-game-title">⚔️ 冒険</h2>
      <span class="mkm-gold">💰 ${fmtNum(data().gold)}</span>
    </div>
    <div class="mkm-field">
      <p class="mkm-field-note">探索するエリアを選ぼう</p>
      <div class="mkm-area-list" id="mkm-area-list"></div>
    </div>
  `;

  const d = data();
  d.clearedAreas = d.clearedAreas || {};
  const list = document.getElementById('mkm-area-list');
  AREAS.forEach(area => {
    const locked = area.requires && !d.clearedAreas[area.requires];
    const el = document.createElement('button');
    el.className = 'mkm-area-card' + (locked ? ' mkm-area-locked' : '');
    if (locked) {
      const reqArea = AREAS.find(a => a.id === area.requires);
      el.innerHTML = `
        <span class="mkm-area-emoji">🔒</span>
        <div class="mkm-area-info">
          <div class="mkm-area-name">？？？</div>
          <div class="mkm-area-desc">「${escHtml(reqArea?.name ?? '前のエリア')}」の出口に到達すると解放</div>
        </div>
      `;
      el.disabled = true;
    } else {
      const wipBadge = area.unimplemented ? ' <span class="mkm-area-wip">準備中</span>' : '';
      const clearBadge = (!area.unimplemented && d.clearedAreas[area.id]) ? ' <span class="mkm-area-clear">踏破済</span>' : '';
      el.innerHTML = `
        <span class="mkm-area-emoji">${area.emoji}</span>
        <div class="mkm-area-info">
          <div class="mkm-area-name">${escHtml(area.name)}${clearBadge}${wipBadge}</div>
          <div class="mkm-area-desc">${escHtml(area.desc)}</div>
        </div>
        <span class="mg-arrow">›</span>
      `;
      el.onclick = () => enterArea(area);
    }
    list.appendChild(el);
  });

  document.getElementById('mokumon-back-btn').onclick = enterVillage;
}

function enterArea(area) {
  if (area.unimplemented && !isDebug()) {
    showDialog(area.emoji + ' ' + area.name,
      '新しいエリアが解放された！',
      '<p style="text-align:center;color:var(--mkm-muted);padding:12px 0">（現在準備中です。\nアップデートをお楽しみに！）</p>',
    );
    return;
  }
  if (area.unimplemented) toast('🛠️ デバッグ：準備中エリアに入りました');
  // パーティに戦えるモンスターがいるか確認
  const d = data();
  const alive = d.party.some(id => id && d.monsters[id]);
  if (!alive) {
    toast('パーティにモンスターがいません');
    return;
  }
  // マップ探索へ
  enterMap(area);
}

// ========================================
// マップ探索（歩いてエンカウント）
// ========================================

// マップ状態
let MAP = null;
let _mapKeyHandler = null;

// 表示設定
const TILE = 44;            // 1マスのピクセルサイズ
const ENCOUNTER_RATE = 0.10; // 草むら1歩あたりの遭遇率
const MOVE_MS = 160;        // 1マス移動アニメ時間

// タイル文字 → 種別
// '#'=木(壁) '~'=水(壁) '.'=道 ','=草むら 'E'=出口 'S'=スタート 'C'=宝箱
// 'N'=NPC(話しかけ対象、歩けない壁扱い)
const TILE_TYPE = {
  '#': { type: 'tree',        walk: false },
  '~': { type: 'water',       walk: false },
  '.': { type: 'road',        walk: true  },
  ',': { type: 'grass',       walk: true  },
  'E': { type: 'exit',        walk: true  },
  'S': { type: 'road',        walk: true  },
  'C': { type: 'chest',       walk: true  },
  'N': { type: 'npc',         walk: false },
  'D': { type: 'door-closed', walk: false },
};

function tileInfo(ch) {
  return TILE_TYPE[ch] ?? { type: 'tree', walk: false };
}

// 矩形を埋めるヘルパー
function fillRect(grid, x1, y1, x2, y2, ch) {
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      if (grid[y] && grid[y][x] !== undefined) grid[y][x] = ch;
    }
  }
}

// ---- フロア対応マップ生成 ----
function buildFloorMap(areaId, floorNo = 1) {
  if (areaId === 'wetland') {
    switch (floorNo) {
      case 2: return buildWetlandB2F();
      case 3: return buildWetlandB3F();
      case 4: return buildWetlandB4F();
      default: return buildWetlandB1F();
    }
  }
  if (areaId === 'deepsea') {
    switch (floorNo) {
      case 2: return buildDeepseaB2F();
      case 3: return buildDeepseaB3F();
      case 4: return buildDeepseaB4F();
      default: return buildDeepseaMap();
    }
  }
  // 機械〜厄災：B4Fは汎用ボス広間、B1〜B3は各エリア専用マップ
  const bossFloor = BOSS_FLOORS[areaId];
  if (bossFloor && floorNo === 4) return buildBossRoom(bossFloor.wall, bossFloor.npc);
  const builders = FLOOR_BUILDERS[areaId];
  if (builders) return (builders[floorNo - 1] ?? builders[0])();
  return buildAreaMap(areaId);
}

// 各エリアの B1F〜B3F マップ生成関数（floorNo-1 でインデックス）
const FLOOR_BUILDERS = {
  machine:   [buildMachineMap,   buildMachineB2F,   buildMachineB3F],
  spirit:    [buildSpiritMap,    buildSpiritB2F,    buildSpiritB3F],
  ghost:     [buildGhostMap,     buildGhostB2F,     buildGhostB3F],
  corporate: [buildCorporateMap, buildCorporateB2F, buildCorporateB3F],
  disaster:  [buildDisasterMap,  buildDisasterB2F,  buildDisasterB3F],
};

// 各エリアのボス広間設定（壁テーマ＋ボスNPC）
const BOSS_FLOORS = {
  machine: { wall: '#', npc: { id: 'boss_machine', monsterId: 222, name: '鋼ぬし', img: monImg(222), x: 14, y: 3, lines: [
    { text: 'ヴ……ヴゥゥン……\n侵入者を 検知。' },
    { text: 'ここは機械都市の中枢……\nわが管理領域である。' },
    { text: '生体ユニットの 立ち入りは\n許可されていない。' },
    { text: '排除を 実行する。\n——システム、全開。' },
  ] } },
  spirit: { wall: '#', npc: { id: 'boss_spirit', monsterId: 322, name: '樹ぬし', img: monImg(322), x: 14, y: 3, lines: [
    { text: 'よくぞ参った、幼き旅人よ。' },
    { text: 'ここは世界樹の根が眠る聖域……\nわしはその守り手じゃ。' },
    { text: 'そなたの魂、見せてもらおう。' },
    { text: 'いざ——精霊の試練を 受けよ！' },
  ] } },
  ghost: { wall: '#', npc: { id: 'boss_ghost', monsterId: 422, name: '霊ぬし', img: monImg(422), x: 14, y: 3, lines: [
    { text: 'ヒュ……ヒュルル……\nよくぞ墓所の奥まで来たな。' },
    { text: 'ここは死者の眠る黄昏の地……\n生者の来る場所ではない。' },
    { text: 'その温かい魂……\nいただくとしよう。' },
    { text: '逃さぬぞ——闇に 堕ちろ！' },
  ] } },
  corporate: { wall: '#', npc: { id: 'boss_corporate', monsterId: 522, name: '社ぬし', img: monImg(522), x: 14, y: 3, lines: [
    { text: 'ようこそ、我が摩天楼の頂へ。' },
    { text: 'ここは富と権力が支配する世界……\n貴様のような部外者は招かれざる客だ。' },
    { text: 'だが——実力があれば話は別。' },
    { text: '見せてみろ、その価値を！' },
  ] } },
  disaster: { wall: '#', npc: { id: 'boss_disaster', monsterId: 622, name: '災ぬし', img: monImg(622), x: 14, y: 3, lines: [
    { text: 'グォォォ……\n世界の終わりに よくぞ来た。' },
    { text: 'ここは終焉火山の火口……\nすべてが灰に還る場所。' },
    { text: '貴様の覚悟、その身で示せ。' },
    { text: '滅びを——受け入れよ！' },
  ] } },
};

// ---- マップ生成：エリアごとに地形が異なる（24×20・固定） ----
function buildAreaMap(areaId) {
  switch (areaId) {
    case 'deepsea':   return buildDeepseaMap();
    case 'machine':   return buildMachineMap();
    case 'spirit':    return buildSpiritMap();
    case 'ghost':     return buildGhostMap();
    case 'corporate': return buildCorporateMap();
    case 'disaster':  return buildDisasterMap();
    case 'wetland':
    default:          return buildWetlandB1F();
  }
}

// 空グリッド生成（外周＝壁文字、内側＝基本タイル）
function makeGrid(edgeCh, fillCh, W = 24, H = 20) {
  const grid = [];
  for (let y = 0; y < H; y++) {
    const row = [];
    for (let x = 0; x < W; x++) {
      const edge = (x === 0 || x === W - 1 || y === 0 || y === H - 1);
      row.push(edge ? edgeCh : fillCh);
    }
    grid.push(row);
  }
  return grid;
}

// 共通：スタート/出口を設置して周囲を歩けるようにする（24×20用）
function placeStartExit(grid) {
  grid[17][11] = 'S';
  grid[1][12]  = 'E';
  grid[17][12] = '.';
  grid[16][11] = '.';
  grid[2][12]  = '.';
  return { grid, w: 24, h: 20, sx: 11, sy: 17, ex: 12, ey: 1 };
}

// 32×28用スタート/出口設置
function placeStartExitLarge(grid, W = 32, H = 28) {
  const sx = Math.floor(W / 2) - 1; // 15
  const sy = H - 3;                  // 25
  const ex = Math.floor(W / 2);      // 16
  const ey = 1;
  grid[sy][sx] = 'S';
  grid[ey][ex] = 'E';
  grid[sy][ex]      = '.';
  grid[sy - 1][sx]  = '.';
  grid[ey + 1][ex]  = '.';
  return { grid, w: W, h: H, sx, sy, ex, ey };
}

// ========================================
// 始まりの村
// ========================================

// NPCデータ：{ id, x, y, name, icon, talk() }
const VILLAGE_NPCS = [
  {
    id: 'gate', x: 11, y: 1, name: '自警団員', icon: '💂',
    img: 'data/mokumon/tiles/npc_gate.webp',
    talk() {
      showDialog('自警団員', '「どのエリアへ向かうつもりだ？\n気をつけて行けよ！」', `
        <div class="mkm-area-list">
          <button class="mkm-area-btn" id="mkm-npc-gate-go">🗺️ エリアへ向かう</button>
          <button class="mkm-area-btn" id="mkm-npc-gate-no">また今度</button>
        </div>`, () => {
        document.getElementById('mkm-npc-gate-go').onclick = () => { closeDialog(); showAreaSelect(); };
        document.getElementById('mkm-npc-gate-no').onclick = closeDialog;
      });
    },
  },
  {
    id: 'shop', x: 5, y: 6, name: 'カリスマショップ店員あさ', icon: '🛒',
    img: 'data/mokumon/tiles/npc_shop.webp',
    talk() {
      showDialog('カリスマショップ店員あさ', '「いらっしゃい！\nいいものがそろってるよ、買っていく？」', `
        <div class="mkm-area-list">
          <button class="mkm-area-btn" id="mkm-npc-shop-yes">🛒 買い物する</button>
          <button class="mkm-area-btn" id="mkm-npc-shop-no">また今度</button>
        </div>`, () => {
        document.getElementById('mkm-npc-shop-yes').onclick = () => { closeDialog(); renderShop(); };
        document.getElementById('mkm-npc-shop-no').onclick = closeDialog;
      });
    },
  },
  {
    id: 'fusion', x: 18, y: 6, name: '配合士のディル', icon: '⚗️',
    img: 'data/mokumon/tiles/npc_fusion.webp',
    talk() {
      showDialog('配合士のディル', '「ほほう…配合をお望みかな？\n新たな命を生み出そうではないか！」', `
        <div class="mkm-area-list">
          <button class="mkm-area-btn" id="mkm-npc-fusion-yes">⚗️ 配合する</button>
          <button class="mkm-area-btn" id="mkm-npc-fusion-no">また今度</button>
        </div>`, () => {
        document.getElementById('mkm-npc-fusion-yes').onclick = () => { closeDialog(); renderFusion(); };
        document.getElementById('mkm-npc-fusion-no').onclick = closeDialog;
      });
    },
  },
  {
    id: 'farm', x: 5, y: 12, name: '牧場主のペニー', icon: '🌿',
    img: 'data/mokumon/tiles/npc_farm.webp',
    talk() {
      showDialog('牧場主のペニー', '「やあ！\nモンスターたちは元気にしてるよ。\n何か用かい？」', `
        <div class="mkm-area-list">
          <button class="mkm-area-btn" id="mkm-npc-farm">🌿 牧場を見る</button>
          <button class="mkm-area-btn" id="mkm-npc-party">⚔️ パーティ編成</button>
          <button class="mkm-area-btn" id="mkm-npc-farm-no">また今度</button>
        </div>`, () => {
        document.getElementById('mkm-npc-farm').onclick    = () => { closeDialog(); renderFarm(); };
        document.getElementById('mkm-npc-party').onclick   = () => { closeDialog(); renderParty(); };
        document.getElementById('mkm-npc-farm-no').onclick = closeDialog;
      });
    },
  },
  {
    id: 'dex', x: 18, y: 12, name: '図鑑博士のカリ', icon: '📖',
    img: 'data/mokumon/tiles/npc_dex.webp',
    talk() {
      showDialog('図鑑博士のカリ', '「おおっ、来たかね！\n図鑑はいつでも見せてあげるぞ。\nどれだけ集まったか確かめてみるかね？」', `
        <div class="mkm-area-list">
          <button class="mkm-area-btn" id="mkm-npc-dex-yes">📖 図鑑を見る</button>
          <button class="mkm-area-btn" id="mkm-npc-dex-no">また今度</button>
        </div>`, () => {
        document.getElementById('mkm-npc-dex-yes').onclick = () => { closeDialog(); renderDex(); };
        document.getElementById('mkm-npc-dex-no').onclick  = closeDialog;
      });
    },
  },
  {
    id: 'spring', x: 11, y: 9, name: '回復の泉', icon: '💧',
    img: 'data/mokumon/tiles/npc_spring.webp',
    talk() {
      const d = data();
      const party = d.party.filter(id => id && d.monsters[id]);
      if (party.length === 0) { toast('パーティにモンスターがいない'); return; }
      showDialog('回復の泉', '「この泉には癒しの力が宿っておる…\n旅の疲れを癒していくかい？」', `
        <div class="mkm-area-list">
          <button class="mkm-area-btn" id="mkm-npc-spring-yes">💧 回復する</button>
          <button class="mkm-area-btn" id="mkm-npc-spring-no">大丈夫</button>
        </div>`, () => {
        document.getElementById('mkm-npc-spring-yes').onclick = () => {
          closeDialog();
          if (MAP?.hpState) MAP.hpState = {};
          sfx('heal');
          toast('✨ パーティのHP/MPが全回復した！');
        };
        document.getElementById('mkm-npc-spring-no').onclick = closeDialog;
      });
    },
  },
  {
    id: 'board', x: 12, y: 15, name: '掲示板', icon: '📋',
    img: 'data/mokumon/tiles/npc_board.webp',
    blocking: false,
    talk() {
      const content = `
        <div class="mkm-board-section">
          <div class="mkm-board-title">🏘️ 始まりの村 案内板</div>
          <div class="mkm-board-floors">
            <div class="mkm-board-floor">
              <span class="mkm-board-fn">💂</span>
              <span><b>門番</b>　ダンジョンへの入口を管理</span>
            </div>
            <div class="mkm-board-floor">
              <span class="mkm-board-fn">🛒</span>
              <span><b>ショップ</b>　アイテムの売買</span>
            </div>
            <div class="mkm-board-floor">
              <span class="mkm-board-fn">⚗️</span>
              <span><b>配合士</b>　2体から新モンスターを生み出す</span>
            </div>
            <div class="mkm-board-floor">
              <span class="mkm-board-fn">🌿</span>
              <span><b>牧場主</b>　預かり・パーティ編成</span>
            </div>
            <div class="mkm-board-floor">
              <span class="mkm-board-fn">📖</span>
              <span><b>図鑑博士</b>　出会ったモンスターを記録</span>
            </div>
            <div class="mkm-board-floor">
              <span class="mkm-board-fn">💧</span>
              <span><b>回復の泉</b>　HP/MPを全回復</span>
            </div>
          </div>
        </div>
        <div class="mkm-board-tips">
          💡 冒険に出る前にパーティを整えよう！
        </div>`;
      showDialog('始まりの村 案内板', '', content, null);
    },
  },
];

// 村マップ生成（24×20）
function buildVillageMap() {
  const W = 24, H = 20;
  const grid = [];

  // ベース：全部草
  for (let y = 0; y < H; y++) grid.push(Array(W).fill('.'));

  // 外周を木で囲む
  for (let x = 0; x < W; x++) { grid[0][x] = '#'; grid[H-1][x] = '#'; }
  for (let y = 0; y < H; y++) { grid[y][0] = '#'; grid[y][W-1] = '#'; }

  // 北の入口（門）
  grid[0][11] = 'D';

  // 泉（中央 3×3、真ん中にNPC）
  fillRect(grid, 10, 8, 12, 10, '~');

  // スタート地点
  grid[H-2][11] = 'S';

  // ※ NPCはグリッドに書かない → 地面タイルをそのまま表示し、移動判定のみでブロック

  return { grid, w: W, h: H, sx: 11, sy: H-3 };
}

function enterVillage() {
  preloadPlayerSprites();
  // 村マップが既にある場合は位置を保持して再描画するだけ
  if (MAP?.isVillage) {
    renderMap();
    return;
  }
  const m = buildVillageMap();
  MAP = {
    area: { id: 'village', name: '始まりの村' },
    grid: m.grid,
    w: m.w, h: m.h,
    px: m.sx, py: m.sy,
    facing: 'down',
    steps: 0,
    moving: false,
    isVillage: true,
    hpState: {},
  };
  renderMap();
}

// エリア選択（門番から）
function showAreaSelect() {
  const areas = AREAS;
  const d = data();
  const unlocked = d.unlockedAreas || ['wetland'];
  const html = areas.map(a => {
    const ok = unlocked.includes(a.id);
    return `<button class="mkm-area-btn ${ok ? '' : 'mkm-area-locked'}"
      data-id="${a.id}" ${ok ? '' : 'disabled'}>
      ${ok ? '🗺️' : '🔒'} ${escHtml(a.name)}
      ${ok ? '' : '<small>（未解放）</small>'}
    </button>`;
  }).join('');

  showDialog('自警団員', '「どのエリアに行きますか？」',
    `<div class="mkm-area-list">${html}</div>`,
    () => {
      document.querySelectorAll('.mkm-area-btn:not([disabled])').forEach(b => {
        b.onclick = () => {
          closeDialog();
          const area = areas.find(a => a.id === b.dataset.id);
          if (area) enterMap(area);
        };
      });
    }
  );
}

// ダイアログ表示（村NPC会話用）
function showDialog(name, text, extra = '', onMount = null) {
  closeDialog();
  const ov = document.createElement('div');
  ov.id = 'mkm-dialog-ov';
  ov.className = 'mkm-dialog-overlay';
  // インラインで色を強制指定（bodyのダークテーマ継承を防ぐ）
  ov.innerHTML = `
    <div class="mkm-dialog-box" id="mkm-dialog-box" style="background:#f4f4ec;color:#222">
      <div class="mkm-dialog-name" style="color:#4a6a20;font-weight:bold;font-size:12px;margin-bottom:4px">${escHtml(name)}</div>
      ${text ? `<div class="mkm-dialog-text" style="color:#222;font-size:14px;line-height:1.6;margin-bottom:10px">${escHtml(text)}</div>` : ''}
      ${extra}
      <button class="mkm-dialog-close" id="mkm-dialog-close" style="color:#444;background:#deded0">✕ 閉じる</button>
    </div>
  `;
  document.body.appendChild(ov);
  document.getElementById('mkm-dialog-close').onclick = closeDialog;
  if (onMount) onMount();
}

function closeDialog() {
  document.getElementById('mkm-dialog-ov')?.remove();
}

// プレイヤーの向いている方向の1マス先の座標
function facingTile() {
  const d = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] }[MAP.facing];
  return { x: MAP.px + d[0], y: MAP.py + d[1] };
}

// 近くのNPCを探す（隣接1マス）
function findAdjacentNpc() {
  const ft = facingTile();
  // 向いてる1マス先、または隣接2マス以内のNPCを探す
  return VILLAGE_NPCS.find(n =>
    (n.x === ft.x && n.y === ft.y) ||
    (Math.abs(MAP.px - n.x) + Math.abs(MAP.py - n.y) <= 1)
  );
}

// 大湿原：草原ベース、木立ちと小さな水辺が点在
// ========================================
// 大湿原 B1F：開けた草原。一本道で迷わない入門フロア
// フロア看板NPC生成ヘルパー
function makeFloorBoard(floorInfo, bx, by) {
  const monNames = floorInfo.enemyPool.map(e => {
    const m = MASTER.monsters?.find(m => m.monsterId === e.monsterId);
    return m ? m.name : `No.${e.monsterId}`;
  });
  const lvMin = Math.min(...floorInfo.enemyPool.map(e => e.lv[0]));
  const lvMax = Math.max(...floorInfo.enemyPool.map(e => e.lv[1]));
  const isBoss = floorInfo.isBossFloor;

  return {
    id: `board_${floorInfo.name}`, x: bx, y: by,
    name: '看板', icon: '📋',
    img: 'data/mokumon/tiles/npc_board.webp',
    isBoss: false,
    talk() {
      const content = `
        <div class="mkm-board-section">
          <div class="mkm-board-title">📍 ${floorInfo.name} 出現モンスター情報</div>
          <div class="mkm-board-floors">
            <div class="mkm-board-floor ${isBoss ? 'mkm-board-floor--boss' : ''}">
              <span class="mkm-board-fn">${isBoss ? '⚠️' : '🌾'}</span>
              <span>${monNames.join('・')}${isBoss ? '<br>⚠️ ボスが待ち構えている！' : ''}</span>
              <span class="mkm-board-lv">Lv.${lvMin}〜${lvMax}</span>
            </div>
          </div>
        </div>
        <div class="mkm-board-tips">
          💡 草むらを歩いていると突然モンスターが現れるぞ！
        </div>`;
      showDialog(`${floorInfo.name} 看板`, '', content, null);
    },
  };
}

// ========================================
function buildWetlandB1F() {
  const W = 32, H = 28;
  const grid = makeGrid('#', ',', W, H);

  // 中央縦道
  fillRect(grid, 14, 1, 17, H - 2, '.');
  // 下部広場
  fillRect(grid, 10, 22, 21, H - 2, '.');
  // 上部広場
  fillRect(grid, 10, 1, 21, 5, '.');
  // 左の横道
  fillRect(grid, 1, 12, 14, 14, '.');
  // 右の横道
  fillRect(grid, 17, 12, W - 2, 14, '.');

  // 装飾：小さな木立
  fillRect(grid, 4, 4, 6, 7, '#');
  fillRect(grid, 25, 4, 28, 7, '#');
  fillRect(grid, 3, 18, 6, 20, '#');
  fillRect(grid, 25, 18, 28, 20, '#');

  // 水辺（小）
  fillRect(grid, 8, 8, 11, 10, '~');
  fillRect(grid, 20, 17, 23, 19, '~');

  // 宝箱
  grid[6][3]  = 'C';
  grid[6][28] = 'C';

  const r = placeStartExitLarge(grid, W, H);
  r.npcs = []; // 看板はenterMap時にフロア情報から動的追加
  r.addBoardAt = { x: 18, y: 25 };
  return r;
}

// ========================================
// 大湿原 B2F：水辺が増え道が狭まる。迂回ルートあり
// ========================================
function buildWetlandB2F() {
  const W = 32, H = 28;
  const grid = makeGrid('#', ',', W, H);

  // 中央縦道
  fillRect(grid, 15, 1, 16, H - 2, '.');
  // 中段横道
  fillRect(grid, 1, 10, W - 2, 11, '.');
  fillRect(grid, 1, 18, W - 2, 19, '.');

  // 左側縦ルート
  fillRect(grid, 3, 11, 4, 18, '.');
  // 右側縦ルート
  fillRect(grid, 27, 11, 28, 18, '.');

  // 水辺（大きめ）
  fillRect(grid, 6, 3, 12, 8, '~');
  fillRect(grid, 19, 3, 25, 8, '~');
  fillRect(grid, 2, 20, 8, 26, '~');
  fillRect(grid, 22, 20, 29, 26, '~');
  fillRect(grid, 11, 13, 20, 16, '~');  // 中央の池

  // 中央の池を渡る細道
  fillRect(grid, 15, 13, 16, 16, '.');

  // 木立
  fillRect(grid, 8, 11, 10, 12, '#');
  fillRect(grid, 21, 11, 23, 12, '#');
  fillRect(grid, 8, 18, 10, 19, '#');
  fillRect(grid, 21, 18, 23, 19, '#');

  // 宝箱
  grid[9][3]  = 'C';
  grid[9][28] = 'C';
  grid[21][15] = 'C';

  const r = placeStartExitLarge(grid, W, H);
  r.npcs = [];
  r.addBoardAt = { x: 18, y: 25 };
  return r;
}

// ========================================
// 大湿原 B3F：密林。道が細く入り組む迷路フロア
// ========================================
function buildWetlandB3F() {
  const W = 32, H = 28;
  const grid = makeGrid('#', '#', W, H); // 内側も木（密林）

  // メイン縦道
  fillRect(grid, 15, 1, 16, H - 2, ',');
  // 上部開通
  fillRect(grid, 12, 1, 19, 4, ',');
  // 下部開通
  fillRect(grid, 10, 23, 21, H - 2, ',');

  // 左ルート（下→中）
  fillRect(grid, 3, 15, 15, 16, ',');
  fillRect(grid, 3, 15, 4, 23, ',');
  fillRect(grid, 3, 22, 11, 23, ',');

  // 右ルート（上→中）
  fillRect(grid, 16, 7, 28, 8, ',');
  fillRect(grid, 27, 8, 28, 15, ',');
  fillRect(grid, 16, 14, 28, 15, ',');

  // 行き止まり宝箱ポケット
  fillRect(grid, 1, 7, 6, 9, ',');
  fillRect(grid, 1, 7, 2, 15, ',');
  fillRect(grid, 25, 19, 30, 21, ',');

  // 水辺（迷路の一部）
  fillRect(grid, 7, 5, 12, 8, '~');
  fillRect(grid, 19, 17, 24, 21, '~');

  // 宝箱
  grid[8][2]  = 'C';
  grid[20][29] = 'C';
  grid[5][20] = 'C';

  const r = placeStartExitLarge(grid, W, H);
  r.npcs = [];
  r.addBoardAt = { x: 18, y: 25 };
  return r;
}

// ========================================
// 大湿原 B4F：最深部。廊下を抜けた先にボス広間
// ========================================
function buildWetlandB4F() {
  const W = 32, H = 28;
  const grid = makeGrid('#', '#', W, H); // 内側も木

  // 下部スタート広場
  fillRect(grid, 8, 22, 23, H - 2, ',');

  // 左廊下（上昇）
  fillRect(grid, 8, 10, 10, 22, ',');
  // 右廊下（上昇）
  fillRect(grid, 21, 10, 23, 22, ',');
  // 中央つなぎ
  fillRect(grid, 8, 10, 23, 12, ',');

  // ボス広間（上部）
  fillRect(grid, 7, 2, 24, 9, ',');

  // 広間への入口廊下
  fillRect(grid, 14, 9, 17, 12, ',');

  // 広間の壁装飾（柱）
  fillRect(grid, 8, 3, 9, 4, '#');
  fillRect(grid, 22, 3, 23, 4, '#');
  fillRect(grid, 8, 7, 9, 8, '#');
  fillRect(grid, 22, 7, 23, 8, '#');

  // 水辺（廊下の横）
  fillRect(grid, 2, 12, 7, 20, '~');
  fillRect(grid, 24, 12, 29, 20, '~');

  // 出口は広間の奥中央
  // ※ placeStartExitLarge の ex=16,ey=1 をそのまま使う

  // 宝箱（広間の隅）
  grid[3][8]  = 'C';
  grid[3][23] = 'C';

  const result = placeStartExitLarge(grid, W, H);
  result.addBoardAt = { x: 18, y: 25 };
  // ボスNPC（広間の奥・出口手前）
  result.npcs = [
    makeBossNpc({
      id: 'boss_wetland', monsterId: 20, name: '藻ぬし',
      img: 'data/mokumon/tiles/boss_monster_20.webp',
      x: 14, y: 3, tileW: 3, tileH: 2,
      lines: [
        { text: 'ぬぅ……よくここまで来たな、小僧。' },
        { text: 'この大湿原の最深部……\nここはわしの領域じゃ。' },
        { text: 'お前のような\n藻力（もりょく）の弱いモンスターマスターが\n踏み込んでいい場所ではない。' },
        { text: 'だが……その目、気に入った。\n試してやろう、かかってこい！' },
      ],
    }),
  ];
  return result;
}

// 汎用ボス広間（32×28）：テーマ壁文字＋ボスNPCを配置
function buildBossRoom(wallCh, bossCfg) {
  const W = 32, H = 28, F = ',';   // 床は草（道中エンカウントあり）
  const grid = makeGrid(wallCh, wallCh, W, H);
  fillRect(grid, 8, 22, 23, H - 2, F);   // スタート広場
  fillRect(grid, 8, 10, 10, 22, F);      // 左廊下
  fillRect(grid, 21, 10, 23, 22, F);     // 右廊下
  fillRect(grid, 8, 10, 23, 12, F);      // つなぎ
  fillRect(grid, 7, 2, 24, 9, F);        // ボス広間
  fillRect(grid, 14, 9, 17, 12, F);      // 入口廊下
  fillRect(grid, 8, 3, 9, 4, wallCh);    // 柱
  fillRect(grid, 22, 3, 23, 4, wallCh);
  fillRect(grid, 8, 7, 9, 8, wallCh);
  fillRect(grid, 22, 7, 23, 8, wallCh);
  grid[3][8] = 'C'; grid[3][23] = 'C';
  const result = placeStartExitLarge(grid, W, H);
  result.addBoardAt = { x: 18, y: 25 };
  result.npcs = [makeBossNpc(bossCfg)];
  return result;
}

// 汎用ボスNPC生成（会話 → ボス戦突入 → 撃破後セリフ）
function makeBossNpc(cfg) {
  return {
    id: cfg.id, x: cfg.x, y: cfg.y,
    name: cfg.name, icon: cfg.icon ?? '👾',
    isBoss: true,
    tileW: cfg.tileW ?? 3, tileH: cfg.tileH ?? 2,
    img: cfg.img,
    talk(floorInfo) {
      if (MAP.bossDefeated) {
        showDialog(cfg.name, cfg.afterDefeat ?? '息子を頼んだぞ。\nよく育ててやってくれ。', '', null);
        return;
      }
      const lines = cfg.lines;
      let i = 0;
      const next = () => {
        if (i >= lines.length) {
          closeDialog();
          const bossInst = makeEnemyInstance(floorInfo.boss.monsterId, floorInfo.boss.lv);
          detachMapInput();
          showBossEncounter(bossInst);
          return;
        }
        const l = lines[i++];
        showDialog(l.speaker ?? cfg.name, l.text, `
          <button class="mkm-btn-primary" id="mkm-boss-next">
            ${i >= lines.length ? '⚔️ 戦う！' : '▼ つぎへ'}
          </button>`, () => {
          document.getElementById('mkm-boss-next').onclick = next;
        });
      };
      next();
    },
  };
}

// 奈落海溝：水だらけ。細い陸路（道＝足場）を進む、草むらは少なめ
function buildDeepseaMap() {
  const grid = makeGrid('~', '~');   // 外周も内側も水（通れない）
  // 陸路（道）を縦横に通す＝歩ける経路
  fillRect(grid, 11, 1, 12, 18, '.');
  fillRect(grid, 3, 9, 20, 10, '.');
  fillRect(grid, 4, 4, 10, 5, '.');
  fillRect(grid, 14, 13, 20, 14, '.');
  // 草むら（遭遇する藻場）を足場沿いに配置
  fillRect(grid, 3, 6, 9, 8, ',');
  fillRect(grid, 14, 3, 20, 6, ',');
  fillRect(grid, 3, 12, 9, 16, ',');
  fillRect(grid, 14, 16, 20, 17, ',');
  fillRect(grid, 6, 11, 17, 12, ',');
  // 岩礁（障害物＝木文字を岩として扱う）
  fillRect(grid, 8, 4, 8, 4, '#');
  fillRect(grid, 16, 9, 17, 9, '#');
  grid[6][4] = 'C'; grid[4][18] = 'C'; grid[15][4] = 'C'; grid[16][18] = 'C'; grid[11][8] = 'C';
  return placeStartExit(grid);
}

// 奈落海溝 B2F：曲がりくねった陸路、藻場（草）多め
function buildDeepseaB2F() {
  const grid = makeGrid('~', '~');
  // S字の陸路
  fillRect(grid, 11, 1, 12, 5, '.');
  fillRect(grid, 4, 5, 12, 6, '.');
  fillRect(grid, 4, 6, 5, 13, '.');
  fillRect(grid, 5, 12, 19, 13, '.');
  fillRect(grid, 18, 6, 19, 13, '.');
  fillRect(grid, 11, 13, 12, 18, '.');
  // 藻場（遭遇ポイント）
  fillRect(grid, 6, 3, 10, 5, ',');
  fillRect(grid, 14, 3, 19, 5, ',');
  fillRect(grid, 6, 8, 8, 11, ',');
  fillRect(grid, 15, 8, 17, 11, ',');
  fillRect(grid, 7, 14, 16, 16, ',');
  // 岩礁
  fillRect(grid, 9, 9, 9, 9, '#');
  fillRect(grid, 14, 9, 14, 9, '#');
  grid[4][8] = 'C'; grid[4][16] = 'C'; grid[15][6] = 'C'; grid[15][17] = 'C';
  return placeStartExit(grid);
}

// 奈落海溝 B3F：中央に大きな藻場、四方に通路
function buildDeepseaB3F() {
  const grid = makeGrid('~', '~');
  // 十字の陸路
  fillRect(grid, 11, 1, 12, 18, '.');
  fillRect(grid, 3, 9, 20, 10, '.');
  // 中央の大藻場
  fillRect(grid, 7, 4, 16, 8, ',');
  fillRect(grid, 7, 12, 16, 16, ',');
  fillRect(grid, 4, 6, 6, 13, ',');
  fillRect(grid, 17, 6, 20, 13, ',');
  // 岩礁で変化
  fillRect(grid, 10, 6, 13, 6, '#');
  fillRect(grid, 10, 13, 13, 13, '#');
  grid[5][8] = 'C'; grid[5][15] = 'C'; grid[14][8] = 'C'; grid[14][15] = 'C'; grid[9][4] = 'C';
  return placeStartExit(grid);
}

// 奈落海溝 B4F：最深部。ボス「海ぬし」が待つ広間
function buildDeepseaB4F() {
  const W = 32, H = 28;
  const grid = makeGrid('~', '~'); // 全面水

  // 下部スタート広場（藻場）
  fillRect(grid, 8, 22, 23, H - 2, ',');
  // 左右の上昇廊下
  fillRect(grid, 8, 10, 10, 22, ',');
  fillRect(grid, 21, 10, 23, 22, ',');
  fillRect(grid, 8, 10, 23, 12, ',');
  // ボス広間（上部）
  fillRect(grid, 7, 2, 24, 9, ',');
  // 広間への入口廊下
  fillRect(grid, 14, 9, 17, 12, ',');
  // 広間の柱（岩礁）
  fillRect(grid, 8, 3, 9, 4, '#');
  fillRect(grid, 22, 3, 23, 4, '#');
  fillRect(grid, 8, 7, 9, 8, '#');
  fillRect(grid, 22, 7, 23, 8, '#');
  // 宝箱
  grid[3][8]  = 'C';
  grid[3][23] = 'C';

  const result = placeStartExitLarge(grid, W, H);
  result.addBoardAt = { x: 18, y: 25 };
  result.npcs = [
    makeBossNpc({
      id: 'boss_deepsea', monsterId: 122, name: '海ぬし',
      img: monImg(122),
      x: 14, y: 3, tileW: 3, tileH: 2,
      lines: [
        { text: 'ゴポポ……よくぞ この深淵まで 来たな。' },
        { text: 'ここは光ひとつ届かぬ\n奈落海溝の底……\nわしの治める領域だ。' },
        { text: '地上の藻力（もりょく）など\nこの闇の前では無力よ。' },
        { text: 'だが——その覚悟、見せてもらおう。\n深淵の力、受けてみよ！' },
      ],
    }),
  ];
  return result;
}

// 機械都市：道（舗装）が碁盤目状。壁（建物）が多くブロック状、草むらは隙間に
function buildMachineMap() {
  const grid = makeGrid('#', '.');   // 外周=壁、内側=道（舗装）
  // 建物ブロック（壁）を碁盤目に配置
  fillRect(grid, 2, 2, 5, 5, '#');
  fillRect(grid, 9, 2, 11, 4, '#');
  fillRect(grid, 15, 2, 18, 5, '#');
  fillRect(grid, 2, 8, 4, 11, '#');
  fillRect(grid, 19, 8, 21, 11, '#');
  fillRect(grid, 7, 8, 9, 10, '#');
  fillRect(grid, 14, 8, 16, 10, '#');
  fillRect(grid, 2, 14, 5, 17, '#');
  fillRect(grid, 15, 14, 18, 17, '#');
  fillRect(grid, 9, 15, 11, 17, '#');
  // 縦横の大通りを確保（道は基本なので穴を開ける形）
  fillRect(grid, 11, 1, 12, 18, '.');
  fillRect(grid, 1, 6, 22, 7, '.');
  fillRect(grid, 1, 12, 22, 13, '.');
  // 草むら（機械の隙間に生えた藻＝遭遇ポイント）を点在
  fillRect(grid, 6, 3, 8, 5, ',');
  fillRect(grid, 13, 3, 14, 5, ',');
  fillRect(grid, 5, 9, 6, 11, ',');
  fillRect(grid, 17, 9, 18, 11, ',');
  fillRect(grid, 6, 14, 8, 17, ',');
  fillRect(grid, 13, 14, 14, 17, ',');
  fillRect(grid, 19, 14, 21, 17, ',');
  grid[3][7] = 'C'; grid[4][13] = 'C'; grid[10][5] = 'C'; grid[16][7] = 'C'; grid[15][20] = 'C';
  return placeStartExit(grid);
}

// 世界樹の神域：木が密集した森。草むら多め、曲がりくねった小道
function buildSpiritMap() {
  const grid = makeGrid('#', ',');   // 外周=木、内側=草むら（森）
  // 曲がりくねった小道
  fillRect(grid, 11, 1, 12, 6, '.');
  fillRect(grid, 5, 6, 12, 7, '.');
  fillRect(grid, 5, 7, 6, 13, '.');
  fillRect(grid, 6, 12, 18, 13, '.');
  fillRect(grid, 17, 7, 18, 13, '.');
  fillRect(grid, 11, 13, 12, 18, '.');
  // 木立ちを密集配置（森らしさ）
  fillRect(grid, 2, 2, 4, 4, '#');
  fillRect(grid, 8, 2, 10, 4, '#');
  fillRect(grid, 15, 2, 17, 4, '#');
  fillRect(grid, 19, 3, 21, 6, '#');
  fillRect(grid, 2, 9, 3, 12, '#');
  fillRect(grid, 8, 9, 10, 11, '#');
  fillRect(grid, 14, 9, 15, 10, '#');
  fillRect(grid, 20, 9, 21, 12, '#');
  fillRect(grid, 2, 15, 4, 17, '#');
  fillRect(grid, 14, 15, 16, 17, '#');
  fillRect(grid, 19, 15, 21, 17, '#');
  grid[3][6] = 'C'; grid[8][20] = 'C'; grid[15][7] = 'C'; grid[16][13] = 'C'; grid[2][13] = 'C';
  return placeStartExit(grid);
}

// 黄昏墓地：墓石（壁）が整然と並ぶ。霧の草むら、十字の通路
function buildGhostMap() {
  const grid = makeGrid('#', ',');
  // 十字の通路
  fillRect(grid, 11, 1, 12, 18, '.');
  fillRect(grid, 1, 9, 22, 10, '.');
  // 墓石（壁）を規則正しく並べる
  for (let by = 3; by <= 16; by += 4) {
    for (let bx = 3; bx <= 20; bx += 4) {
      if (bx >= 10 && bx <= 13) continue; // 縦通路を避ける
      if (by >= 8 && by <= 11) continue;  // 横通路を避ける
      grid[by][bx] = '#';
      if (grid[by+1]) grid[by+1][bx] = '#';
    }
  }
  grid[4][6] = 'C'; grid[5][18] = 'C'; grid[14][4] = 'C'; grid[15][19] = 'C'; grid[2][15] = 'C';
  return placeStartExit(grid);
}

// 超巨大企業都市：高層ビル（巨大な壁ブロック）と広い大通り
function buildCorporateMap() {
  const grid = makeGrid('#', '.');   // 外周=壁、内側=道（舗装）
  // 巨大ビル群（大きな壁ブロック）
  fillRect(grid, 2, 2, 6, 6, '#');
  fillRect(grid, 9, 2, 14, 5, '#');
  fillRect(grid, 17, 2, 21, 7, '#');
  fillRect(grid, 2, 9, 5, 14, '#');
  fillRect(grid, 8, 9, 10, 13, '#');
  fillRect(grid, 13, 8, 16, 12, '#');
  fillRect(grid, 19, 10, 21, 16, '#');
  fillRect(grid, 2, 16, 7, 17, '#');
  fillRect(grid, 14, 15, 17, 17, '#');
  // 大通り
  fillRect(grid, 11, 1, 12, 18, '.');
  fillRect(grid, 1, 7, 22, 8, '.');
  fillRect(grid, 1, 14, 22, 15, '.');
  // 街路樹（草むら＝遭遇）
  fillRect(grid, 7, 3, 8, 5, ',');
  fillRect(grid, 15, 3, 16, 5, ',');
  fillRect(grid, 6, 10, 7, 13, ',');
  fillRect(grid, 17, 10, 18, 13, ',');
  fillRect(grid, 8, 16, 13, 17, ',');
  grid[3][8] = 'C'; grid[5][16] = 'C'; grid[11][6] = 'C'; grid[13][18] = 'C'; grid[16][10] = 'C';
  return placeStartExit(grid);
}

// 終焉火山：溶岩（水文字を溶岩として使う）と岩場。狭い足場を進む
function buildDisasterMap() {
  const grid = makeGrid('~', ',');   // 外周=溶岩、内側=草むら（焦土）
  // 岩の足場（道）
  fillRect(grid, 11, 1, 12, 18, '.');
  fillRect(grid, 4, 8, 19, 9, '.');
  fillRect(grid, 4, 4, 5, 9, '.');
  fillRect(grid, 18, 9, 19, 15, '.');
  // 溶岩溜まり（通れない）
  fillRect(grid, 2, 2, 5, 3, '~');
  fillRect(grid, 15, 4, 18, 6, '~');
  fillRect(grid, 6, 12, 9, 15, '~');
  fillRect(grid, 14, 13, 16, 16, '~');
  fillRect(grid, 19, 2, 21, 5, '~');
  // 岩（壁）
  fillRect(grid, 8, 4, 9, 6, '#');
  fillRect(grid, 2, 11, 3, 13, '#');
  fillRect(grid, 12, 10, 13, 11, '#');
  grid[3][7] = 'C'; grid[5][20] = 'C'; grid[11][5] = 'C'; grid[16][11] = 'C'; grid[2][16] = 'C';
  return placeStartExit(grid);
}

// ---- 機械都市 B2F / B3F ----
function buildMachineB2F() {
  const grid = makeGrid('#', '.');
  // ジグザグに建物ブロック
  fillRect(grid, 3, 2, 6, 4, '#');
  fillRect(grid, 16, 3, 19, 6, '#');
  fillRect(grid, 5, 8, 8, 10, '#');
  fillRect(grid, 14, 9, 17, 12, '#');
  fillRect(grid, 3, 14, 6, 16, '#');
  fillRect(grid, 16, 14, 19, 17, '#');
  // 通路（中央縦＋斜め接続）
  fillRect(grid, 11, 1, 12, 18, '.');
  fillRect(grid, 1, 6, 22, 7, '.');
  fillRect(grid, 1, 12, 22, 13, '.');
  // 草むら
  fillRect(grid, 8, 3, 10, 5, ',');
  fillRect(grid, 13, 4, 15, 6, ',');
  fillRect(grid, 3, 10, 4, 12, ',');
  fillRect(grid, 19, 9, 20, 12, ',');
  fillRect(grid, 8, 14, 10, 16, ',');
  grid[3][9] = 'C'; grid[5][14] = 'C'; grid[11][4] = 'C'; grid[15][9] = 'C';
  return placeStartExit(grid);
}
function buildMachineB3F() {
  const grid = makeGrid('#', '.');
  // 中央プラザ＋四隅の建物
  fillRect(grid, 2, 2, 4, 5, '#');
  fillRect(grid, 19, 2, 21, 5, '#');
  fillRect(grid, 2, 14, 4, 17, '#');
  fillRect(grid, 19, 14, 21, 17, '#');
  fillRect(grid, 9, 8, 14, 11, '#');   // 中央の巨大設備
  // 通路（外周回廊＋中央十字の縦）
  fillRect(grid, 11, 1, 12, 7, '.');
  fillRect(grid, 11, 12, 12, 18, '.');
  fillRect(grid, 6, 6, 17, 7, '.');
  fillRect(grid, 6, 12, 17, 13, '.');
  fillRect(grid, 6, 7, 7, 12, '.');
  fillRect(grid, 16, 7, 17, 12, '.');
  // 草むら
  fillRect(grid, 6, 2, 8, 5, ',');
  fillRect(grid, 15, 2, 17, 5, ',');
  fillRect(grid, 6, 14, 8, 17, ',');
  fillRect(grid, 15, 14, 17, 17, ',');
  grid[3][6] = 'C'; grid[3][17] = 'C'; grid[16][6] = 'C'; grid[16][17] = 'C';
  return placeStartExit(grid);
}

// ---- 世界樹の神域 B2F / B3F ----
function buildSpiritB2F() {
  const grid = makeGrid('#', ',');   // 全面が森（草）
  // くねった小道
  fillRect(grid, 11, 1, 12, 4, '.');
  fillRect(grid, 6, 4, 12, 5, '.');
  fillRect(grid, 6, 5, 7, 14, '.');
  fillRect(grid, 7, 13, 17, 14, '.');
  fillRect(grid, 16, 5, 17, 14, '.');
  fillRect(grid, 11, 14, 12, 18, '.');
  // 木立ち
  fillRect(grid, 2, 2, 4, 4, '#');
  fillRect(grid, 14, 2, 16, 4, '#');
  fillRect(grid, 9, 8, 11, 10, '#');
  fillRect(grid, 19, 7, 21, 10, '#');
  fillRect(grid, 2, 13, 4, 16, '#');
  fillRect(grid, 19, 14, 21, 16, '#');
  grid[3][7] = 'C'; grid[8][14] = 'C'; grid[15][9] = 'C'; grid[2][12] = 'C';
  return placeStartExit(grid);
}
function buildSpiritB3F() {
  const grid = makeGrid('#', ',');
  // 3つの広間を縦に結ぶ道
  fillRect(grid, 11, 1, 12, 18, '.');
  fillRect(grid, 5, 4, 8, 5, '.');
  fillRect(grid, 16, 9, 19, 10, '.');
  fillRect(grid, 5, 14, 8, 15, '.');
  // 木立ちで広間を仕切る
  fillRect(grid, 4, 2, 6, 3, '#');
  fillRect(grid, 8, 7, 10, 9, '#');
  fillRect(grid, 14, 6, 16, 8, '#');
  fillRect(grid, 4, 11, 6, 13, '#');
  fillRect(grid, 16, 13, 18, 16, '#');
  fillRect(grid, 8, 15, 10, 17, '#');
  grid[4][5] = 'C'; grid[9][17] = 'C'; grid[14][6] = 'C'; grid[2][12] = 'C';
  return placeStartExit(grid);
}

// ---- 黄昏墓地 B2F / B3F ----
function buildGhostB2F() {
  const grid = makeGrid('#', ',');
  // L字の通路
  fillRect(grid, 11, 1, 12, 12, '.');
  fillRect(grid, 4, 12, 19, 13, '.');
  fillRect(grid, 4, 13, 5, 18, '.');
  fillRect(grid, 18, 13, 19, 18, '.');
  fillRect(grid, 11, 12, 12, 18, '.');
  // 墓石を密に
  for (let by = 3; by <= 9; by += 3) {
    for (let bx = 3; bx <= 20; bx += 3) {
      if (bx >= 10 && bx <= 13) continue;
      grid[by][bx] = '#';
    }
  }
  grid[4][5] = 'C'; grid[4][18] = 'C'; grid[15][7] = 'C'; grid[15][16] = 'C';
  return placeStartExit(grid);
}
function buildGhostB3F() {
  const grid = makeGrid('#', ',');
  // 円環状の通路
  fillRect(grid, 11, 1, 12, 5, '.');
  fillRect(grid, 5, 5, 18, 6, '.');
  fillRect(grid, 5, 6, 6, 14, '.');
  fillRect(grid, 17, 6, 18, 14, '.');
  fillRect(grid, 5, 14, 18, 15, '.');
  fillRect(grid, 11, 15, 12, 18, '.');
  fillRect(grid, 11, 6, 12, 14, '.');   // 中央縦道
  // 中央と隅に墓石
  fillRect(grid, 8, 9, 9, 11, '#');
  fillRect(grid, 14, 9, 15, 11, '#');
  fillRect(grid, 2, 2, 3, 3, '#');
  fillRect(grid, 20, 2, 21, 3, '#');
  grid[5][8] = 'C'; grid[5][15] = 'C'; grid[14][8] = 'C'; grid[14][15] = 'C';
  return placeStartExit(grid);
}

// ---- 超巨大企業都市 B2F / B3F ----
function buildCorporateB2F() {
  const grid = makeGrid('#', '.');
  // 2棟の超高層ビル＋広い大通り
  fillRect(grid, 3, 3, 9, 8, '#');
  fillRect(grid, 14, 3, 20, 8, '#');
  fillRect(grid, 3, 12, 9, 16, '#');
  fillRect(grid, 14, 12, 20, 16, '#');
  // 大通り（十字）
  fillRect(grid, 11, 1, 12, 18, '.');
  fillRect(grid, 1, 9, 22, 11, '.');
  // 街路樹
  fillRect(grid, 10, 4, 10, 7, ',');
  fillRect(grid, 13, 4, 13, 7, ',');
  fillRect(grid, 10, 13, 10, 16, ',');
  fillRect(grid, 13, 13, 13, 16, ',');
  grid[3][10] = 'C'; grid[3][13] = 'C'; grid[16][10] = 'C'; grid[16][13] = 'C';
  return placeStartExit(grid);
}
function buildCorporateB3F() {
  const grid = makeGrid('#', '.');
  // 碁盤目の中小ビル群
  for (let by = 3; by <= 15; by += 4) {
    for (let bx = 3; bx <= 18; bx += 5) {
      if (bx >= 10 && bx <= 13) continue;
      fillRect(grid, bx, by, bx + 2, by + 1, '#');
    }
  }
  fillRect(grid, 11, 1, 12, 18, '.');
  fillRect(grid, 1, 8, 22, 9, '.');
  fillRect(grid, 1, 15, 22, 16, '.');
  // 街路樹
  fillRect(grid, 7, 5, 8, 7, ',');
  fillRect(grid, 15, 5, 16, 7, ',');
  fillRect(grid, 7, 11, 8, 13, ',');
  fillRect(grid, 15, 11, 16, 13, ',');
  grid[4][7] = 'C'; grid[4][16] = 'C'; grid[12][7] = 'C'; grid[12][16] = 'C';
  return placeStartExit(grid);
}

// ---- 終焉火山 B2F / B3F ----
function buildDisasterB2F() {
  const grid = makeGrid('~', ',');   // 外周＝溶岩、内側＝焦土
  // 細い足場（道）
  fillRect(grid, 11, 1, 12, 18, '.');
  fillRect(grid, 5, 5, 18, 6, '.');
  fillRect(grid, 5, 12, 18, 13, '.');
  // 溶岩溜まり
  fillRect(grid, 3, 2, 6, 4, '~');
  fillRect(grid, 16, 2, 19, 4, '~');
  fillRect(grid, 3, 8, 7, 11, '~');
  fillRect(grid, 15, 8, 19, 11, '~');
  fillRect(grid, 3, 15, 6, 17, '~');
  fillRect(grid, 16, 15, 19, 17, '~');
  // 岩
  fillRect(grid, 9, 9, 10, 10, '#');
  fillRect(grid, 13, 9, 14, 10, '#');
  grid[5][8] = 'C'; grid[5][15] = 'C'; grid[12][8] = 'C'; grid[12][15] = 'C';
  return placeStartExit(grid);
}
function buildDisasterB3F() {
  const grid = makeGrid('~', ',');
  // 中央の大溶岩湖を囲む道
  fillRect(grid, 11, 1, 12, 5, '.');
  fillRect(grid, 4, 5, 19, 6, '.');
  fillRect(grid, 4, 6, 5, 14, '.');
  fillRect(grid, 18, 6, 19, 14, '.');
  fillRect(grid, 4, 14, 19, 15, '.');
  fillRect(grid, 11, 15, 12, 18, '.');
  // 中央の溶岩湖
  fillRect(grid, 8, 8, 15, 12, '~');
  // 岩
  fillRect(grid, 2, 2, 3, 3, '#');
  fillRect(grid, 20, 2, 21, 3, '#');
  fillRect(grid, 2, 16, 3, 17, '#');
  grid[5][7] = 'C'; grid[5][16] = 'C'; grid[14][7] = 'C'; grid[14][16] = 'C';
  return placeStartExit(grid);
}

// マップ探索中のパーティHP表示
function partyHpBarsHtml() {
  const d = data();
  return d.party.filter(Boolean).map(id => {
    const inst = d.monsters[id];
    if (!inst) return '';
    const master = getMonsterMaster(inst.monsterId);
    const stats = calcStats(inst);
    const s = MAP && MAP.hpState && MAP.hpState[id];
    const hp = s ? Math.max(0, Math.min(stats.hp, s.hp)) : stats.hp;
    const mp = s ? Math.max(0, Math.min(stats.mp, s.mp)) : stats.mp;
    const hpPctVal = Math.round(hp / stats.hp * 100);
    const mpPctVal = stats.mp ? Math.round(mp / stats.mp * 100) : 0;
    const colorCls = hpPctVal <= 25 ? 'mkm-hp-low' : (hpPctVal <= 50 ? 'mkm-hp-mid' : '');
    const dead = hp <= 0 ? ' mkm-mp-dead' : '';
    const expPctVal = inst.level >= LEVEL_MAX ? 100 : Math.min(100, Math.floor((inst.exp ?? 0) / expToNext(inst.level) * 100));
    return `
      <div class="mkm-mp-ally${dead}">
        <div class="mkm-mp-namerow"><span class="mkm-mp-name">${escHtml(inst.nickname || master.name)}</span><span class="mkm-mp-lv">Lv.${inst.level}</span></div>
        <div class="mkm-hpbar small"><div class="mkm-hpbar-fill ${colorCls}" style="width:${hpPctVal}%"></div></div>
        <div class="mkm-mpbar"><div class="mkm-mpbar-fill" style="width:${mpPctVal}%"></div></div>
        <div class="mkm-exbar" style="height:3px;margin-top:2px"><div class="mkm-exbar-fill" style="width:${expPctVal}%"></div></div>
      </div>`;
  }).join('');
}

// ===== 探索中の道具メニュー（回復薬を使う）=====
function openFieldItemMenu() {
  const d = data();
  d.items = d.items || {};
  const owned = Object.entries(d.items)
    .filter(([id, n]) => n > 0 && getItem(id) && ['heal_hp', 'heal_mp', 'revive'].includes(getItem(id).kind))
    .map(([id, n]) => ({ id, n, m: getItem(id) }));
  const ov = document.createElement('div');
  ov.className = 'mkm-modal-ov';
  ov.innerHTML = `
    <div class="mkm-modal mkm-skill-modal">
      <button class="mkm-modal-close">✕</button>
      <h3 class="mkm-skill-modal-title">どうぐを つかう</h3>
      <div class="mkm-skill-choices" id="mkm-fielditem-list"></div>
    </div>`;
  document.body.appendChild(ov);
  const list = ov.querySelector('#mkm-fielditem-list');
  if (!owned.length) {
    list.innerHTML = '<p class="mkm-empty">つかえる かいふくどうぐが ない</p>';
  } else {
    owned.forEach(({ id, n, m }) => {
      const btn = document.createElement('button');
      btn.className = 'mkm-skill-choice';
      btn.innerHTML = `<span class="mkm-skill-cn">${m.icon} ${escHtml(m.name)} <small>×${n}</small></span><span class="mkm-skill-cd">${escHtml(m.desc)}</span>`;
      btn.onclick = () => { ov.remove(); openFieldHealTarget(id, m); };
      list.appendChild(btn);
    });
  }
  ov.querySelector('.mkm-modal-close').onclick = () => ov.remove();
  ov.onclick = e => { if (e.target === ov) ov.remove(); };
}

function openFieldHealTarget(id, m) {
  const d = data();
  const party = d.party.filter(pid => pid && d.monsters[pid]);
  const ov = document.createElement('div');
  ov.className = 'mkm-modal-ov';
  ov.innerHTML = `
    <div class="mkm-modal mkm-skill-modal">
      <button class="mkm-modal-close">✕</button>
      <h3 class="mkm-skill-modal-title">だれに つかう？</h3>
      <div class="mkm-skill-choices" id="mkm-fieldtarget-list"></div>
    </div>`;
  document.body.appendChild(ov);
  const list = ov.querySelector('#mkm-fieldtarget-list');
  party.forEach(pid => {
    const inst = d.monsters[pid];
    const master = getMonsterMaster(inst.monsterId);
    const st = calcStats(inst);
    const s = MAP?.hpState?.[pid];
    const curHp = s ? Math.max(0, Math.min(st.hp, s.hp)) : st.hp;
    const curMp = s ? Math.max(0, Math.min(st.mp, s.mp)) : st.mp;
    const fainted = curHp <= 0;
    const ok = m.kind === 'revive' ? fainted : !fainted;   // 蘇生は戦闘不能のみ、回復は生存のみ
    const btn = document.createElement('button');
    btn.className = 'mkm-skill-choice' + (ok ? '' : ' mkm-skill-ng');
    if (!ok) btn.disabled = true;
    btn.innerHTML = `<span class="mkm-skill-cn">${escHtml(inst.nickname || master.name)}</span><span class="mkm-skill-cmp">HP ${curHp}/${st.hp}${m.kind === 'heal_mp' ? ` ・ MP ${curMp}/${st.mp}` : ''}</span>`;
    if (ok) btn.onclick = () => { ov.remove(); applyFieldItem(id, m, pid, st, curHp, curMp); };
    list.appendChild(btn);
  });
  ov.querySelector('.mkm-modal-close').onclick = () => ov.remove();
  ov.onclick = e => { if (e.target === ov) ov.remove(); };
}

function applyFieldItem(id, m, pid, st, curHp, curMp) {
  MAP.hpState = MAP.hpState || {};
  const cur = MAP.hpState[pid] || { hp: curHp, mp: curMp };
  let msg = '';
  if (m.kind === 'heal_hp') {
    const v = Math.min(st.hp, cur.hp + m.power) - cur.hp; cur.hp += v; msg = `HPが ${v} かいふく！`;
  } else if (m.kind === 'heal_mp') {
    const v = Math.min(st.mp, cur.mp + m.power) - cur.mp; cur.mp += v; msg = `MPが ${v} かいふく！`;
  } else if (m.kind === 'revive') {
    cur.hp = Math.max(1, Math.floor(st.hp * m.power)); msg = 'ふっかつ！';
  }
  MAP.hpState[pid] = cur;
  addItem(id, -1);
  save();
  sfx('heal');
  toast(`${m.name}！ ${msg}`);
  const partyEl = document.querySelector('.mkm-map-party');
  if (partyEl) partyEl.innerHTML = partyHpBarsHtml();
}

function preloadPlayerSprites() {
  // アニメーションWebP化により不要（互換のため残す）
}

function enterMap(area, floorNo = 1, keepHp = false) {
  preloadPlayerSprites();
  const d = data();
  const validParty = d.party.filter(id => id && d.monsters[id]);
  if (validParty.length === 0) {
    toast('パーティにモンスターがいない！牧場から連れてこよう');
    return;
  }
  const m = buildFloorMap(area.id, floorNo);
  const floorKey = `${area.id}:f${floorNo}`;
  d.openedChests = d.openedChests || {};
  for (let y = 0; y < m.h; y++) {
    for (let x = 0; x < m.w; x++) {
      if (m.grid[y][x] === 'C' && d.openedChests[`${floorKey}:${x}:${y}`]) {
        m.grid[y][x] = '.';
      }
    }
  }
  const prevHp = (keepHp && MAP?.hpState) ? MAP.hpState : {};
  const floorInfo = area.floors?.[floorNo - 1];
  d.flags = d.flags || {};
  const floorNpcs = [...(m.npcs || [])];
  // フロア看板を動的追加
  if (m.addBoardAt && floorInfo) {
    floorNpcs.push(makeFloorBoard(floorInfo, m.addBoardAt.x, m.addBoardAt.y));
  }
  MAP = {
    area,
    floor: floorNo,
    floorKey,
    grid: m.grid,
    w: m.w, h: m.h,
    px: m.sx, py: m.sy,
    facing: 'down',
    steps: 0,
    moving: false,
    bossDefeated: !!d.flags[`boss_${area.id}`],
    floorNpcs,
    hpState: prevHp,
  };
  renderMap();
  // 地名バナー（フロア1＝エリア名＋紹介、以降＝フロア名）
  const fInfo = area.floors?.[floorNo - 1];
  const title = `${area.emoji} ${area.name}${(floorNo > 1 && fInfo) ? ' ・ ' + fInfo.name : ''}`;
  showAreaBanner(title, floorNo === 1 ? area.desc : '');
}

// マップ入場時の地名バナー（黒フェードなしの軽い演出）
function showAreaBanner(title, sub) {
  document.querySelectorAll('.mkm-area-banner').forEach(e => e.remove());
  const card = document.createElement('div');
  card.className = 'mkm-loc-card mkm-area-banner';
  card.innerHTML = `
    <div class="mkm-area-banner-inner">
      <div class="mkm-loc-line"></div>
      <div class="mkm-loc-title">${escHtml(title)}</div>
      ${sub ? `<div class="mkm-loc-sub">${escHtml(sub)}</div>` : ''}
      <div class="mkm-loc-line"></div>
    </div>`;
  document.body.appendChild(card);
  requestAnimationFrame(() => card.classList.add('on'));
  setTimeout(() => {
    card.classList.remove('on');
    setTimeout(() => card.remove(), 700);
  }, 1600);
}

function renderMap() {
  root().innerHTML = `
    <div class="mg-game-header mkm-map-header">
      <button id="mokumon-back-btn" class="mg-back-btn">‹ ${MAP.isVillage ? '藻クエストTOPへ' : '始まりの村へ'}</button>
      <h2 class="mg-game-title">${escHtml(MAP.area.name)}${MAP.floor ? ` <span class="mkm-floor-badge">${currentFloorInfo()?.name ?? ''}</span>` : ''}</h2>
      <span class="mkm-gold">💰 ${fmtNum(data().gold)}</span>
    </div>
    <div class="mkm-map-viewport" id="mkm-viewport">
      <div class="mkm-map-layer mkm-area-${MAP.area.id}" id="mkm-layer"></div>
      <div class="mkm-player" id="mkm-player"></div>
      <!-- ジョイスティック（ビューポート内オーバーレイ） -->
      <div class="mkm-joystick-wrap" id="mkm-joystick-wrap">
        <div class="mkm-joystick-outer" id="mkm-joystick-outer">
          <div class="mkm-joystick-knob" id="mkm-joystick-knob"></div>
        </div>
      </div>
      ${(MAP.isVillage || MAP.floorNpcs?.length) ? '<button class="mkm-dpad-talk mkm-talk-overlay" id="mkm-talk-btn">💬</button>' : ''}
    </div>
    <div class="mkm-map-hud">
      ${MAP.isVillage ? '🏘️ 始まりの村' : `<span>👣 <span id="mkm-steps">${MAP.steps}</span> 歩${MAP.floor && MAP.area.floors ? ` &nbsp;|&nbsp; ${MAP.area.floors.length}階中 ${MAP.floor}階` : ''}</span><button class="mkm-field-item-btn" id="mkm-field-item">🎒 どうぐ</button>`}
    </div>
    <div class="mkm-map-party">${partyHpBarsHtml()}</div>
    <!-- 保険のDパッド -->
    <div class="mkm-dpad">
      <button class="mkm-dpad-btn" data-dir="up">▲</button>
      <div class="mkm-dpad-mid">
        <button class="mkm-dpad-btn" data-dir="left">◀</button>
        <div></div>
        <button class="mkm-dpad-btn" data-dir="right">▶</button>
      </div>
      <button class="mkm-dpad-btn" data-dir="down">▼</button>
    </div>
  `;
  buildMapTiles();
  if (MAP.isVillage) buildNpcSprites();
  if (MAP.floorNpcs?.length) buildFloorNpcSprites();
  centerCamera(false);
  setPlayerSprite(MAP.facing);

  MAP.inputLocked = false;   // 地図再描画＝入力解除（エンカウント・戦闘から復帰）
  document.getElementById('mokumon-back-btn').onclick = exitMap;
  document.querySelectorAll('.mkm-dpad-btn').forEach(b => {
    b.onclick = () => move(b.dataset.dir);
  });
  if (MAP.isVillage || MAP.floorNpcs?.length) {
    const talkBtn = document.getElementById('mkm-talk-btn');
    if (talkBtn) talkBtn.onclick = tryTalkFloor;
  }
  const fieldItemBtn = document.getElementById('mkm-field-item');
  if (fieldItemBtn) fieldItemBtn.onclick = openFieldItemMenu;
  initJoystick();

  // キーボード
  _mapKeyHandler = (e) => {
    const k = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }[e.key];
    if (k) { e.preventDefault(); move(k); }
  };
  document.addEventListener('keydown', _mapKeyHandler);

  // スワイプ
  bindSwipe();
}

// 全タイルを一度だけ生成（カメラはlayerのtransformで動かす）
function buildMapTiles() {
  const layer = document.getElementById('mkm-layer');
  layer.style.width  = (MAP.w * TILE) + 'px';
  layer.style.height = (MAP.h * TILE) + 'px';
  let html = '';
  for (let y = 0; y < MAP.h; y++) {
    for (let x = 0; x < MAP.w; x++) {
      const cls = tileClass(x, y);
      html += `<div class="mkm-tile2 ${cls}" style="left:${x*TILE}px;top:${y*TILE}px;width:${TILE}px;height:${TILE}px"></div>`;
    }
  }
  layer.innerHTML = html;

  // 出口ワープを大きく目立たせる（タイルの上に重ねる・上下に拡張）
  if (MAP.ex != null && MAP.ey != null) {
    const w = TILE * 2.0, h = TILE * 2.8;
    const warp = document.createElement('div');
    warp.className = 'mkm-warp';
    warp.style.width  = w + 'px';
    warp.style.height = h + 'px';
    warp.style.left   = (MAP.ex * TILE + TILE / 2 - w / 2) + 'px';
    warp.style.top    = (MAP.ey * TILE + TILE - h) + 'px';   // 足元を出口マスに合わせ上へ伸ばす
    layer.appendChild(warp);
  }
}

// 隣接タイルを見てエッジクラスを決定する
function tileClass(x, y) {
  const ch = MAP.grid[y]?.[x] ?? '#';
  const info = tileInfo(ch);
  const type = info.type;

  // 道・水のエッジ判定（草に接している面を検出）
  if (type === 'road' || type === 'water') {
    const top    = tileInfo(MAP.grid[y-1]?.[x] ?? '#').type;
    const bottom = tileInfo(MAP.grid[y+1]?.[x] ?? '#').type;
    const left   = tileInfo(MAP.grid[y]?.[x-1] ?? '#').type;
    const right  = tileInfo(MAP.grid[y]?.[x+1] ?? '#').type;

    const adjGrass = (t) => t === 'grass' || t === 'tree';
    const topG    = adjGrass(top);
    const bottomG = adjGrass(bottom);
    const leftG   = adjGrass(left);
    const rightG  = adjGrass(right);

    const edges = [topG, bottomG, leftG, rightG].filter(Boolean).length;

    // 2方向が草 → コーナータイル
    if (edges === 2) {
      if (topG    && leftG)  return `mkm-t-${type}-corner-tl`;
      if (topG    && rightG) return `mkm-t-${type}-corner-tr`;
      if (bottomG && leftG)  return `mkm-t-${type}-corner-bl`;
      if (bottomG && rightG) return `mkm-t-${type}-corner-br`;
    }

    // 1方向だけ草に接している場合はエッジタイル
    if (edges === 1) {
      if (topG)    return `mkm-t-${type}-top`;
      if (bottomG) return `mkm-t-${type}-bottom`;
      if (leftG)   return `mkm-t-${type}-left`;
      if (rightG)  return `mkm-t-${type}-right`;
    }
  }

  return `mkm-t-${type}`;
}

// NPCアイコンをレイヤー上に配置
function buildNpcSprites() {
  const layer = document.getElementById('mkm-layer');
  VILLAGE_NPCS.forEach(npc => {
    const el = document.createElement('div');
    el.className = 'mkm-npc-sprite';
    el.style.left = (npc.x * TILE) + 'px';
    el.style.top  = (npc.y * TILE) + 'px';
    el.style.width  = TILE + 'px';
    el.style.height = TILE + 'px';
    if (npc.img) {
      el.innerHTML = `<img src="${npc.img}" style="width:100%;height:100%;object-fit:contain" alt=""/>`;
    } else {
      el.innerHTML = `<span class="mkm-npc-icon">${npc.icon}</span>`;
    }
    el.onclick = () => {
      const dist = Math.abs(MAP.px - npc.x) + Math.abs(MAP.py - npc.y);
      if (dist <= 2) {
        sfx('talk');
        npc.talk();
      } else {
        toast('もう少し近づいてタップしよう！');
      }
    };
    layer.appendChild(el);
  });
}

// フロアNPCスプライト（ボスNPCなど）
function buildFloorNpcSprites() {
  const layer = document.getElementById('mkm-layer');
  (MAP.floorNpcs || []).forEach(npc => {
    // ボスNPCは撃破後も残す（息子を頼んだぞ会話のため）
    const el = document.createElement('div');
    el.className = `mkm-npc-sprite ${npc.isBoss ? 'mkm-npc-boss' : ''}`;
    el.dataset.npcId = npc.id;
    const tw = (npc.tileW || 1) * TILE;
    const th = (npc.tileH || 1) * TILE;
    el.style.left   = (npc.x * TILE) + 'px';
    el.style.top    = (npc.y * TILE) + 'px';
    el.style.width  = tw + 'px';
    el.style.height = th + 'px';
    if (npc.img) {
      el.innerHTML = `<img src="${npc.img}" style="width:100%;height:100%;object-fit:contain;${npc.isBoss ? 'filter:drop-shadow(0 0 10px rgba(220,50,50,0.8))' : ''}" alt=""
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="mkm-npc-icon" style="display:none">${npc.icon}</span>`;
    } else {
      el.innerHTML = `<span class="mkm-npc-icon">${npc.icon}</span>`;
    }
    el.onclick = () => {
      const dist = Math.abs(MAP.px - npc.x) + Math.abs(MAP.py - npc.y);
      if (dist <= 2) {
        sfx('talk');
        npc.talk(currentFloorInfo());
      } else {
        toast('もう少し近づこう！');
      }
    };
    layer.appendChild(el);
  });
}

// 話すボタン押下（村 or フロアNPC共通）
function tryTalkFloor() {
  // 村
  if (MAP?.isVillage) { tryTalk(); return; }
  // フロアNPC
  const npcs = MAP.floorNpcs || [];
  const adj = npcs.find(n => {
    const w = n.tileW ?? 1, h = n.tileH ?? 1;
    const nearX = MAP.px >= n.x - 1 && MAP.px <= n.x + w;
    const nearY = MAP.py >= n.y - 1 && MAP.py <= n.y + h;
    return nearX && nearY;
  });
  if (adj) {
    sfx('talk');
    adj.talk(currentFloorInfo());
  } else {
    toast('近くに話せる人がいない');
  }
}

// 話すボタン押下（向いてる方向のNPCに話しかける）
function tryTalk() {
  if (!MAP?.isVillage) return;
  const npc = findAdjacentNpc();
  if (npc) {
    sfx('talk');
    npc.talk();
  } else {
    toast('近くに話せる人がいない');
  }
}

// 主人公中心にカメラ（layer）を移動
function centerCamera(animate) {
  const vp = document.getElementById('mkm-viewport');
  const layer = document.getElementById('mkm-layer');
  if (!vp || !layer) return;
  const vw = vp.clientWidth;
  const vh = vp.clientHeight;
  // 主人公がビューポート中央に来るようにlayerをずらす
  const offX = vw / 2 - (MAP.px * TILE + TILE / 2);
  const offY = vh / 2 - (MAP.py * TILE + TILE / 2);
  layer.style.transition = animate ? `transform ${MOVE_MS}ms linear` : 'none';
  layer.style.transform = `translate3d(${offX}px, ${offY}px, 0)`;   // 3D指定でGPU合成を強制
}

// 主人公スプライト切り替え
function setPlayerSprite(dir) {
  const pEl = document.getElementById('mkm-player');
  if (!pEl) return;
  pEl.classList.remove('dir-down', 'dir-up', 'dir-left', 'dir-right');
  pEl.classList.add(`dir-${dir}`);
}
function startWalkAnim(dir) { setPlayerSprite(dir); }
function stopWalkAnim(dir)  { setPlayerSprite(dir); }

function move(dir) {
  if (!MAP || MAP.moving || MAP.inputLocked) return;
  const delta = { up: [0,-1], down: [0,1], left: [-1,0], right: [1,0] }[dir];
  MAP.facing = dir;
  setPlayerSprite(dir);
  const pEl = document.getElementById('mkm-player');
  if (pEl) pEl.style.transform = 'translate(-50%,-50%)';

  const nx = MAP.px + delta[0];
  const ny = MAP.py + delta[1];
  if (nx < 0 || nx >= MAP.w || ny < 0 || ny >= MAP.h) return;
  const ch = MAP.grid[ny][nx];
  if (!tileInfo(ch).walk) { bumpPlayer(); sfx('bump'); return; }
  // NPC衝突判定（グリッドに書かない分をここで補完）
  if (MAP.isVillage && VILLAGE_NPCS.some(n => n.x === nx && n.y === ny)) {
    bumpPlayer(); sfx('bump'); return;
  }
  if (MAP.floorNpcs?.some(n => {
    const w = n.tileW ?? 1, h = n.tileH ?? 1;
    return nx >= n.x && nx < n.x + w && ny >= n.y && ny < n.y + h;
  })) {
    bumpPlayer(); sfx('bump'); return;
  }

  MAP.px = nx;
  MAP.py = ny;
  MAP.steps++;
  const stepsEl = document.getElementById('mkm-steps');
  if (stepsEl) stepsEl.textContent = MAP.steps;
  MAP.moving = true;
  sfx('step');
  startWalkAnim(dir);
  if (pEl) pEl.classList.add('mkm-player-walk');
  centerCamera(false);   // ★アニメ無しの瞬間スナップ（重いタイル層を毎フレーム合成しない＝スマホで軽い）

  setTimeout(() => {
    MAP.moving = false;
    stopWalkAnim(dir);
    if (pEl) pEl.classList.remove('mkm-player-walk');
    const type = tileInfo(ch).type;
    if (type === 'exit') { onReachExit(); return; }
    if (type === 'chest') { openChest(nx, ny); return; }
    if (type === 'grass' && Math.random() < ENCOUNTER_RATE) {
      const enemy = rollEnemy(MAP.area);
      detachMapInput();
      showEncounter(MAP.area, enemy);
    }
  }, MOVE_MS);
}

// ---- 宝箱 ----

function openChest(x, y) {
  // 宝の中身を抽選
  const reward = rollChestReward(MAP.area.id);
  const d = data();
  if (reward.type === 'gold') {
    d.gold += reward.amount;
    sfx('gold');
  } else if (reward.type === 'item') {
    addItem(reward.itemId, reward.amount);
    sfx('gold');
  }
  // 宝箱を開封済み（道）にして、タイルを描き換え
  MAP.grid[y][x] = '.';
  d.openedChests = d.openedChests || {};
  d.openedChests[`${MAP.floorKey ?? MAP.area.id}:${x}:${y}`] = true;
  refreshTileAt(x, y, 'mkm-t-chest-open');
  save();

  // 開封演出
  const ov = document.createElement('div');
  ov.className = 'mkm-modal-ov mkm-input-ov';
  ov.innerHTML = `
    <div class="mkm-modal mkm-chest-modal">
      <div class="mkm-chest-icon">
        <img src="data/mokumon/tiles/tile_chest-open.webp" alt=""
             onerror="this.parentElement.textContent='📦'"/>
      </div>
      <h3 class="mkm-chest-title">宝箱を みつけた！</h3>
      <div class="mkm-chest-reward">${reward.label}</div>
      <button class="mkm-btn-primary" id="mkm-chest-ok">うけとる</button>
    </div>
  `;
  document.body.appendChild(ov);
  setTimeout(() => sfx('win'), 100);
  ov.querySelector('#mkm-chest-ok').onclick = () => ov.remove();
}

// 宝の中身（ゴールド or アイテム）
function rollChestReward(areaId) {
  // エリアごとの宝箱アイテムプール
  const itemPool = {
    wetland: ['item_herb_s', 'item_herb_s', 'item_onigiri', 'item_ether_s', 'item_herb_m'],
    deepsea: ['item_herb_m', 'item_herb_m', 'item_onigiri', 'item_bento', 'item_cure', 'item_revive'],
  };
  // 60%ゴールド / 40%アイテム
  if (Math.random() < 0.6) {
    const amount = randRange(50, 250) + (areaId === 'deepsea' ? randRange(100, 400) : 0);
    return { type: 'gold', amount, label: `💰 ${amount} ゴールド` };
  }
  const pool = itemPool[areaId] ?? itemPool.wetland;
  const itemId = pool[Math.floor(Math.random() * pool.length)];
  const m = getItem(itemId);
  return { type: 'item', itemId, amount: 1, label: `${m.icon} ${m.name} ×1` };
}

// 指定座標のタイルだけ再描画
function refreshTileAt(x, y, tempClass = null) {
  const layer = document.getElementById('mkm-layer');
  if (!layer) return;
  const info = tileInfo(MAP.grid[y][x]);
  const tiles = layer.querySelectorAll('.mkm-tile2');
  const idx = y * MAP.w + x;
  const el = tiles[idx];
  if (!el) return;
  if (tempClass) {
    // 一時的なクラスを当てて後でもとに戻す（開封アニメなど）
    el.className = `mkm-tile2 ${tempClass}`;
    setTimeout(() => { el.className = `mkm-tile2 mkm-t-${info.type}`; }, 800);
  } else {
    el.className = `mkm-tile2 mkm-t-${info.type}`;
  }
}

// 壁にぶつかった時の小さな揺れ
function bumpPlayer() {
  const pEl = document.getElementById('mkm-player');
  if (!pEl) return;
  pEl.classList.add('mkm-player-bump');
  setTimeout(() => pEl.classList.remove('mkm-player-bump'), 200);
}

// スワイプ操作（ジョイスティックがない時のフォールバック）
function bindSwipe() {
  // ジョイスティックで代替するためスワイプは無効化
}

// ========================================
// バーチャルジョイスティック
// ========================================
let _joyTimer = null;
let _joyDir   = null;

function initJoystick() {
  const outer = document.getElementById('mkm-joystick-outer');
  const knob  = document.getElementById('mkm-joystick-knob');
  if (!outer || !knob) return;

  const R = outer.offsetWidth / 2;    // 外円の半径
  const maxR = R * 0.6;               // ノブの最大移動距離

  const getCenter = () => {
    const rect = outer.getBoundingClientRect();
    return { cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2 };
  };

  const dirFromAngle = (dx, dy) => {
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return null;
    return Math.abs(dx) >= Math.abs(dy)
      ? (dx > 0 ? 'right' : 'left')
      : (dy > 0 ? 'down'  : 'up');
  };

  const startMove = (dir) => {
    if (MAP?.inputLocked) return;        // ロック中はジョイスティック移動も開始しない
    if (_joyDir === dir) return;
    stopJoy();
    _joyDir = dir;
    move(dir);
    // タップ（短い接触）は1歩だけ。長押し（350ms以上）で連続移動に入る
    _joyTimer = setTimeout(function rep() {
      move(dir);
      _joyTimer = setTimeout(rep, 180);
    }, 350);
  };

  const stopJoy = () => {
    clearTimeout(_joyTimer);
    _joyTimer = null;
    _joyDir   = null;
    knob.style.transform = 'translate(-50%,-50%)';
  };

  outer.addEventListener('touchstart', e => {
    if (e.cancelable) e.preventDefault();
    const t = e.touches[0];
    const { cx, cy } = getCenter();
    const dx = t.clientX - cx, dy = t.clientY - cy;
    const dist = Math.min(Math.hypot(dx, dy), maxR);
    const angle = Math.atan2(dy, dx);
    knob.style.transform = `translate(calc(-50% + ${Math.cos(angle)*dist}px), calc(-50% + ${Math.sin(angle)*dist}px))`;
    const dir = dirFromAngle(dx, dy);
    if (dir) startMove(dir);
  }, { passive: false });

  outer.addEventListener('touchmove', e => {
    if (e.cancelable) e.preventDefault();
    const t = e.touches[0];
    const { cx, cy } = getCenter();
    const dx = t.clientX - cx, dy = t.clientY - cy;
    const dist = Math.min(Math.hypot(dx, dy), maxR);
    const angle = Math.atan2(dy, dx);
    knob.style.transform = `translate(calc(-50% + ${Math.cos(angle)*dist}px), calc(-50% + ${Math.sin(angle)*dist}px))`;
    const dir = dirFromAngle(dx, dy);
    if (dir) startMove(dir); else stopJoy();
  }, { passive: false });

  outer.addEventListener('touchend',   () => stopJoy(), { passive: true });
  outer.addEventListener('touchcancel',() => stopJoy(), { passive: true });
}

function detachMapInput() {
  if (_mapKeyHandler) { document.removeEventListener('keydown', _mapKeyHandler); _mapKeyHandler = null; }
  // ジョイスティックタイマーも止める（戦闘中に move() が走り続けるバグ防止）
  if (_joyTimer) { clearTimeout(_joyTimer); _joyTimer = null; _joyDir = null; }
  // 入力ロック：地図が再描画されるまで move()・エンカウント判定を一切走らせない
  if (MAP) MAP.inputLocked = true;
}

function exitMap() {
  detachMapInput();
  const wasVillage = MAP?.isVillage;
  MAP = null;
  if (wasVillage) {
    renderTitle();
  } else {
    enterVillage();
    showLocCard('🌿 始まりの村', '—— 冒険から帰還 ——');
  }
}

function showLocCard(title, sub) {
  const card = document.createElement('div');
  card.className = 'mkm-loc-card';
  card.innerHTML = `
    <div class="mkm-loc-line"></div>
    <div class="mkm-loc-title">${title}</div>
    <div class="mkm-loc-sub">${sub}</div>
    <div class="mkm-loc-line"></div>`;
  document.body.appendChild(card);
  requestAnimationFrame(() => card.classList.add('on'));
  sfx('heal');
  setTimeout(() => {
    card.classList.remove('on');
    setTimeout(() => card.remove(), 800);
  }, 2200);
}

// 出口到達ハンドラ（フロア制 or 従来）
function onReachExit() {
  const floorInfo = currentFloorInfo();
  if (!floorInfo) { clearArea(); return; }

  const totalFloors = MAP.area.floors.length;

  if (floorInfo.isBossFloor) {
    // ボス階：出口は常に村へ戻る（ボス戦はNPCに話しかけて開始）
    clearArea();
    return;
  }

  if (MAP.floor < totalFloors) {
    // 次の階へ
    const nextFloor = MAP.floor + 1;
    const nextInfo = MAP.area.floors[nextFloor - 1];
    detachMapInput();
    const ov = document.createElement('div');
    ov.className = 'mkm-result-ov';
    ov.innerHTML = `
      <div class="mkm-result mkm-result-win">
        <h3>${nextInfo.isBossFloor ? '⚠️' : '🚪'} ${nextInfo.name} へ進みますか？</h3>
        <p class="mkm-result-scout">${nextInfo.isBossFloor ? '次の階にはボスが待ち構えているぞ…' : ''}</p>
        <button class="mkm-btn-primary" id="mkm-nextfloor-ok">進む</button>
        <button class="mkm-btn-sec" style="width:100%;margin-top:8px" id="mkm-nextfloor-back">村へ戻る</button>
      </div>
    `;
    document.body.appendChild(ov);
    sfx('select');
    ov.querySelector('#mkm-nextfloor-ok').onclick = () => {
      ov.remove();
      enterMap(MAP?.area ?? ov._area, nextFloor, true);
    };
    // エリア参照を保持（enterMap後にMAPが書き変わるため）
    const savedArea = MAP.area;
    ov.querySelector('#mkm-nextfloor-ok').onclick = () => {
      ov.remove();
      enterMap(savedArea, nextFloor, true);
    };
    ov.querySelector('#mkm-nextfloor-back').onclick = () => { ov.remove(); MAP = null; enterVillage(); };
  } else {
    clearArea();
  }
}

// ボス戦突入
function showBossEncounter(bossInst) {
  const master = getMonsterMaster(bossInst.monsterId);
  const bossName = master?.name ?? '藻ぬし';
  // インスタンスにもnameを付与（startBattle内で参照される）
  bossInst.name = bossName;

  const ov = document.createElement('div');
  ov.className = 'mkm-encounter';
  ov.innerHTML = `
    <div class="mkm-encounter-inner">
      <div class="mkm-encounter-flash"></div>
      <div class="mkm-enc-label">⚠️ ボスが あらわれた！</div>
      <div class="mkm-enc-name">${escHtml(bossName)}</div>
    </div>
  `;
  document.body.appendChild(ov);
  sfx('encounter');
  setTimeout(() => {
    ov.remove();
    startBattle(MAP.area, bossInst, true);
  }, 1400);
}

// 出口に到達＝エリア踏破。次エリア解放
function clearArea() {
  const d = data();
  d.clearedAreas = d.clearedAreas || {};
  const areaId = MAP.area.id;
  const firstClear = !d.clearedAreas[areaId];
  d.clearedAreas[areaId] = true;
  save();
  detachMapInput();
  MAP = null;

  // 新エリア解放チェック
  const unlocked = firstClear ? AREAS.find(a => a.requires === areaId) : null;

  const ov = document.createElement('div');
  ov.className = 'mkm-result-ov';
  ov.innerHTML = `
    <div class="mkm-result mkm-result-win">
      <h3>🚪 エリア踏破！</h3>
      <p class="mkm-result-scout">出口にたどり着いた</p>
      ${unlocked ? `<div class="mkm-result-rewards"><div>🗺️ あたらしいエリア<br><b>${escHtml(unlocked.name)}</b> が 解放された！</div></div>` : ''}
      <button class="mkm-btn-primary" id="mkm-clear-ok">村へ戻る</button>
    </div>
  `;
  document.body.appendChild(ov);
  sfx(unlocked ? 'win' : 'select');
  ov.querySelector('#mkm-clear-ok').onclick = () => { ov.remove(); enterVillage(); };
}

// 戦闘終了後にマップ探索へ戻る（マップが残っていれば同じ位置で再開）
function backToMap() {
  saveBattleHpToMap();  // 戦闘で減ったHP/MPを持ち越す
  if (MAP) {
    renderMap();
  } else {
    renderField();
  }
}

// 現在フロア情報を返す
function currentFloorInfo() {
  if (!MAP?.floor || !MAP.area?.floors) return null;
  return MAP.area.floors[MAP.floor - 1] ?? null;
}

// 重み付き抽選で敵を1体生成する
function rollEnemy(area) {
  const pool = currentFloorInfo()?.enemyPool ?? area.enemyPool;
  const total = pool.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * total;
  let picked = pool[0];
  for (const e of pool) {
    r -= e.weight;
    if (r <= 0) { picked = e; break; }
  }
  const lv = rollLevel(picked.lv[0], picked.lv[1]);
  return makeEnemyInstance(picked.monsterId, lv);
}

function randRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 敵レベルは低い方に偏らせる（2回振って小さい方）→ 序盤がやさしくLv1が出やすい
function rollLevel(min, max) {
  return Math.min(randRange(min, max), randRange(min, max));
}

// 敵モンスターのインスタンスを作る（戦闘用の一時データ）
function makeEnemyInstance(monsterId, level) {
  const master = getMonsterMaster(monsterId);
  const inst = {
    instanceId: 'enemy_' + uuid(),
    monsterId, level,
    fusionValue: 0, mutationType: 'none',
    nickname: '',
    skills: (master?.skills ?? []).filter(s => s.level <= level).map(s => s.skillId),
    traits: master?.traits ?? [],
    isEnemy: true,
  };
  if (inst.skills.length === 0) inst.skills = ['skill_attack'];
  return inst;
}

// エンカウント演出
function showEncounter(area, enemy) {
  sfx('encounter');
  const master = getMonsterMaster(enemy.monsterId);
  const fam = famInfo(master.family);
  const ov = document.createElement('div');
  ov.className = 'mkm-encounter';
  ov.innerHTML = `
    <div class="mkm-enc-inner">
      <div class="mkm-enc-flash"></div>
      <div class="mkm-enc-mon" style="background:${fam.color}22">
        <img alt=""
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
        <div class="mkm-card-ph" style="background:${fam.color};display:none"><span style="font-size:2.4rem">${escHtml(master.name[0])}</span></div>
      </div>
      <p class="mkm-enc-text">${escHtml(master.name)}が あらわれた！</p>
    </div>
  `;
  document.body.appendChild(ov);
  // srcをDOM挿入後にセットして前の画像が一瞬表示されるちらつきを防ぐ
  ov.querySelector('.mkm-enc-mon img').src = monImg(enemy.monsterId);
  setTimeout(() => {
    ov.remove();
    startBattle(area, enemy);
  }, 1300);
}

// ========================================
// 戦闘
// ========================================

let B = null; // 戦闘状態

let _fxPreloaded = false;
function preloadEffects() {
  if (_fxPreloaded) return;
  _fxPreloaded = true;
  Object.values(FX).forEach(fx => { const im = new Image(); im.src = `assets/effects/${fx.img}.webp`; });
}

function startBattle(area, enemy, isBoss = false) {
  preloadEffects();
  const d = data();
  const allies = d.party
    .filter(id => id && d.monsters[id])
    .map(id => makeCombatant(d.monsters[id], false));
  const enemyC = makeCombatant(enemy, true);
  if (isBoss) { enemyC.isBoss = true; }

  B = {
    area,
    allies,
    enemies: [enemyC],
    turn: 0,
    busy: false,
    over: false,
    isBoss,
    scoutTried: 0,
    scoutBonus: 0,
    log: [],
  };

  // 遭遇した時点で図鑑にseen登録（見ただけで載る）
  B.enemies.forEach(e => registerDex(e.monsterId, false));
  save();

  renderBattle();
  pushLog(isBoss ? `⚠️ ${enemyC.name}！ ボスが あらわれた！` : `${enemyC.name} が あらわれた！`);
}

// 戦闘用キャラを作る（ステータス計算＋現在HP/MP）
function makeCombatant(inst, isEnemy) {
  const master = getMonsterMaster(inst.monsterId) ?? {
    name: inst.name ?? `No.${inst.monsterId}`,
    rank: 'F', family: 'moss', growthType: '普通',
    skills: [], traits: [], baseStats: { hp:50, mp:20, atk:15, def:10, mag:10, mnd:10, spd:10 },
  };
  const stats = calcStats(inst);
  // 味方は探索中の持ち越しHP/MPを復元（なければ全快）
  let hp = stats.hp, mp = stats.mp;
  if (!isEnemy && MAP && MAP.hpState && MAP.hpState[inst.instanceId]) {
    const s = MAP.hpState[inst.instanceId];
    hp = Math.max(0, Math.min(stats.hp, s.hp));
    mp = Math.max(0, Math.min(stats.mp, s.mp));
  }
  return {
    ref: inst,
    isEnemy,
    monsterId: inst.monsterId,
    name: inst.nickname || inst.name || master.name,
    master,
    level: inst.level,
    stats,
    hp,
    maxHp: stats.hp,
    mp,
    maxMp: stats.mp,
    skills: inst.skills.slice(),
    defending: false,
    alive: hp > 0,
    ailments: {},   // 状態異常 { 種別: 残りターン }  毒は -1=戦闘終了まで
    buffs: {},      // 能力バフ倍率 { atk:1.3, spd:1.3 ... }
    expPct: inst.level >= LEVEL_MAX ? 100 : Math.min(100, Math.floor((inst.exp ?? 0) / expToNext(inst.level) * 100)),
  };
}

// ========================================
// 状態異常 定義
// ========================================

const AILMENTS = {
  poison:    { name: '毒',   icon: '☠️', color: '#9c27b0' },
  sleep:     { name: '眠り', icon: '💤', color: '#42a5f5' },
  paralysis: { name: '麻痺', icon: '⚡', color: '#fbc02d' },
  confuse:   { name: '混乱', icon: '💫', color: '#ff7043' },
  silence:   { name: '呪封', icon: '🔇', color: '#7e57c2' },
  fear:      { name: '恐怖', icon: '😱', color: '#546e7a' },
  slow:      { name: '鈍足', icon: '🐌', color: '#8d6e63' },
};

// 状態異常を付与（耐性・精神で成功判定）
function tryInflict(target, ailment, baseRate) {
  if (!ailment || !AILMENTS[ailment]) return false;
  if (target.ailments[ailment]) return false;  // 既にかかっている
  // 精神による軽減（05_06準拠）
  const resist = 100 / (100 + target.stats.mnd * 0.5);
  // ボス・高ランクは状態異常に強い
  const rankIdx = RANK_ORDER.indexOf(target.master.rank);
  const rankResist = 1 - Math.min(0.4, rankIdx * 0.05);
  const rate = baseRate * resist * rankResist;
  if (Math.random() >= rate) return false;

  // 持続ターン（毒は戦闘終了まで=-1）
  const turns = ailment === 'poison' ? -1 : randRange(2, 4);
  target.ailments[ailment] = turns;
  return true;
}

// 状態異常が1つでもあるか
// 状態異常を解除
function cureAilments(c, list) {
  if (!list) { c.ailments = {}; return; }
  list.forEach(a => delete c.ailments[a]);
}

// 戦闘後、味方のHP/MPをマップに書き戻す（連戦で持ち越す）
function saveBattleHpToMap() {
  if (!B || !MAP || !MAP.hpState) return;
  B.allies.forEach(a => {
    MAP.hpState[a.ref.instanceId] = { hp: a.hp, mp: a.mp };
  });
}

// ---- 戦闘画面の描画 ----

function renderBattle() {
  root().innerHTML = `
    <div class="mkm-battle">
      <div class="mkm-battle-enemies" id="mkm-bt-enemies"></div>
      <div class="mkm-battle-log" id="mkm-bt-log"></div>
      <div class="mkm-battle-allies" id="mkm-bt-allies"></div>
      <div class="mkm-battle-cmd" id="mkm-bt-cmd"></div>
    </div>
  `;
  renderEnemies();
  renderAllies();
  renderCommand();
  renderLog();
}

function renderEnemies() {
  const c = document.getElementById('mkm-bt-enemies');
  c.innerHTML = '';
  B.enemies.forEach((e, i) => {
    const fam = famInfo(e.master.family);
    const el = document.createElement('div');
    el.className = 'mkm-bt-enemy' + (e.alive ? '' : ' mkm-bt-dead') + (e.isBoss ? ' mkm-bt-enemy--boss' : '');
    el.id = `mkm-enemy-${i}`;
    el.innerHTML = `
      <div class="mkm-bt-enemy-img${e.isBoss ? ' mkm-bt-enemy-img--boss' : ''}" ${e.isBoss ? '' : `style="background:${fam.color}22"`}>
        <img src="${monImg(e.monsterId)}" alt=""
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
        <div class="mkm-card-ph" style="background:${fam.color};display:none"><span style="font-size:2rem">${escHtml(e.name[0])}</span></div>
      </div>
      <div class="mkm-bt-enemy-info">
        <span class="mkm-bt-name">${escHtml(e.name)} <small>Lv.${e.level}</small></span>
        <div class="mkm-hpbar"><div class="mkm-hpbar-fill ${hpPct(e) <= 25 ? 'mkm-hp-low' : hpPct(e) <= 50 ? 'mkm-hp-mid' : ''}" id="mkm-enemy-hp-${i}" style="width:${hpPct(e)}%"></div></div>
        <div class="mkm-ailments">${ailmentIconsHtml(e)}</div>
      </div>
    `;
    c.appendChild(el);
  });
}

// 状態異常アイコンのHTML
function ailmentIconsHtml(c) {
  return Object.keys(c.ailments).map(a => {
    const info = AILMENTS[a];
    return info ? `<span class="mkm-ailment" title="${info.name}">${info.icon}</span>` : '';
  }).join('');
}

function renderAllies() {
  const c = document.getElementById('mkm-bt-allies');
  c.innerHTML = '';
  B.allies.forEach((a, i) => {
    const el = document.createElement('div');
    el.className = 'mkm-bt-ally' + (a.alive ? '' : ' mkm-bt-dead');
    el.id = `mkm-ally-${i}`;
    el.innerHTML = `
      <div class="mkm-bt-ally-img"><img alt="" onerror="this.style.display='none'"/></div>
      <span class="mkm-bt-ally-name">${escHtml(a.name)}${ailmentIconsHtml(a) ? ' <span class="mkm-ail-inline">'+ailmentIconsHtml(a)+'</span>' : ''}</span>
      <span class="mkm-bt-ally-lv">Lv.${a.level}</span>
      <span class="mkm-bt-hpnum" id="mkm-ally-hpnum-${i}">HP ${String(a.hp).padStart(3)}/${a.maxHp}</span>
      <span class="mkm-bt-mpnum" id="mkm-ally-mpnum-${i}">MP ${String(a.mp).padStart(3)}/${a.maxMp}</span>
      <div class="mkm-hpbar"><div class="mkm-hpbar-fill ${hpPct(a) <= 25 ? 'mkm-hp-low' : hpPct(a) <= 50 ? 'mkm-hp-mid' : ''}" id="mkm-ally-hp-${i}" style="width:${hpPct(a)}%"></div></div>
      <div class="mkm-mpbar"><div class="mkm-mpbar-fill" id="mkm-ally-mp-${i}" style="width:${mpPct(a)}%"></div></div>
      <div class="mkm-exbar"><div class="mkm-exbar-fill" style="width:${a.expPct}%"></div></div>
    `;
    el.querySelector('.mkm-bt-ally-img img').src = monImg(a.monsterId);
    c.appendChild(el);
  });
}

function hpPct(c) { return Math.max(0, Math.round(c.hp / c.maxHp * 100)); }
function mpPct(c) { return c.maxMp === 0 ? 0 : Math.max(0, Math.round(c.mp / c.maxMp * 100)); }

// ---- コマンド ----

function calcCurrentScoutRate() {
  const target = firstEnemy();
  if (!target) return 0;
  const hpRatio = target.hp / target.maxHp;
  const rankPenalty = { F:0, E:0.05, D:0.1, C:0.15, B:0.25, A:0.35, S:0.5, SS:0.6 }[target.master.rank] ?? 0;
  let rate = (0.6 - rankPenalty) * (1.1 - hpRatio) + 0.05;
  rate += (B.scoutBonus ?? 0);
  return Math.max(0.02, Math.min(0.95, rate));
}

function renderCommand() {
  const cmd = document.getElementById('mkm-bt-cmd');
  if (B.busy || B.over) { cmd.innerHTML = ''; return; }
  const scoutRate = calcCurrentScoutRate();
  const scoutPct = Math.round(scoutRate * 100);
  const scoutColor = scoutPct >= 60 ? '#4caf50' : scoutPct >= 30 ? '#ffa726' : '#ef5350';
  const canSwap = B.allies.filter(a => a.alive).length >= 2;
  cmd.innerHTML = `
    <button class="mkm-cmd-btn" data-cmd="attack">たたかう</button>
    <button class="mkm-cmd-btn" data-cmd="skill">とくぎ</button>
    <button class="mkm-cmd-btn" data-cmd="item">どうぐ</button>
    <button class="mkm-cmd-btn" data-cmd="defend">ぼうぎょ</button>
    <button class="mkm-cmd-btn mkm-cmd-swap" data-cmd="swap" ${canSwap ? '' : 'disabled style="opacity:0.35;pointer-events:none"'}>いれかえ</button>
    <button class="mkm-cmd-btn mkm-cmd-run" data-cmd="run">にげる</button>
    <button class="mkm-cmd-btn mkm-cmd-scout mkm-cmd-scout--wide" data-cmd="scout" ${B.isBoss ? 'disabled style="opacity:0.35;pointer-events:none"' : ''}>
      <span class="mkm-scout-label">${B.isBoss ? 'スカウト不可' : `スカウト率 <span style="color:${scoutColor};font-weight:bold">${scoutPct}%</span>`}</span>
      ${B.isBoss ? '' : `<div class="mkm-scout-rate-bar"><div class="mkm-scout-rate-fill" style="width:${scoutPct}%;background:${scoutColor}"></div></div>`}
    </button>
  `;
  cmd.querySelectorAll('.mkm-cmd-btn').forEach(b => {
    b.onclick = () => onCommand(b.dataset.cmd);
  });
}

// プレイヤーの最初の生存味方（簡易版：先頭が行動）
function firstAlly() { return B.allies.find(a => a.alive); }
function firstEnemy() { return B.enemies.find(e => e.alive); }

function onCommand(cmd) {
  if (B.busy || B.over) return;
  const actor = firstAlly();
  if (!actor) return;

  // 行動阻害の状態異常チェック（眠り・麻痺・恐怖）
  const block = checkActionBlock(actor);
  if (block) {
    playerTurn(() => { pushLog(block); afterAction(); });
    return;
  }
  // 混乱：味方を攻撃する場合がある
  if (actor.ailments.confuse && Math.random() < 0.5) {
    actor.defending = false;
    playerTurn(() => {
      pushLog(`${actor.name} は こんらんしている！`);
      doAttack(actor, firstEnemy());  // 簡易：とりあえず敵を攻撃（混乱表現）
    });
    return;
  }
  // 呪封：とくぎ封じ
  if (cmd === 'skill' && actor.ailments.silence) {
    toast('呪封中はとくぎが使えない');
    return;
  }

  if (cmd === 'attack') { actor.defending = false; playerTurn(() => doAttack(actor, firstEnemy())); }
  else if (cmd === 'defend') { actor.defending = true; pushLog(`${actor.name} は みをまもっている`); enemyPhase(); }
  else if (cmd === 'skill') { openSkillMenu(actor); }
  else if (cmd === 'item') { openItemMenu(actor); }
  else if (cmd === 'scout') { actor.defending = false; playerTurn(() => doScout(firstEnemy())); }
  else if (cmd === 'swap') { openSwapMenu(); }
  else if (cmd === 'run') { tryRun(); }
}

function openSwapMenu() {
  const current = firstAlly();
  const candidates = B.allies.filter(a => a.alive && a !== current);
  if (!candidates.length) return;

  const ov = document.createElement('div');
  ov.className = 'mkm-swap-ov';
  const items = candidates.map((a, idx) => {
    const hpCls = hpPct(a) <= 25 ? 'mkm-hp-low' : hpPct(a) <= 50 ? 'mkm-hp-mid' : '';
    return `
      <div class="mkm-swap-item" data-idx="${idx}">
        <img src="${monImg(a.monsterId)}" alt="" onerror="this.style.display='none'"/>
        <div class="mkm-swap-item-info">
          <div class="mkm-swap-item-name">${escHtml(a.name)}</div>
          <div class="mkm-swap-item-sub">Lv.${a.level}　HP ${a.hp}/${a.maxHp}</div>
          <div class="mkm-hpbar small" style="margin-top:4px"><div class="mkm-hpbar-fill ${hpCls}" style="width:${hpPct(a)}%"></div></div>
        </div>
      </div>`;
  }).join('');
  ov.innerHTML = `
    <div class="mkm-swap-panel">
      <div class="mkm-swap-title">だれと いれかえる？（1ターン消費）</div>
      <div class="mkm-swap-list">${items}</div>
      <button class="mkm-swap-cancel">キャンセル</button>
    </div>`;

  document.body.appendChild(ov);
  ov.querySelector('.mkm-swap-cancel').onclick = () => ov.remove();
  ov.querySelectorAll('.mkm-swap-item').forEach((el, i) => {
    el.onclick = () => {
      ov.remove();
      const target = candidates[i];
      const fromIdx = B.allies.indexOf(current);
      const toIdx = B.allies.indexOf(target);
      B.allies[fromIdx] = target;
      B.allies[toIdx] = current;
      renderAllies();
      pushLog(`${target.name} と いれかえた！`);
      enemyPhase();
    };
  });
}

// 行動阻害判定。阻害される場合はログ文字列を返す（行動不能）。されない場合 null
function checkActionBlock(c) {
  if (c.ailments.sleep) {
    // 一定確率で目覚める
    if (Math.random() < 0.4) { delete c.ailments.sleep; return `${c.name} は 目を覚ました！`; }
    return `${c.name} は ねむっている…`;
  }
  if (c.ailments.paralysis && Math.random() < 0.5) {
    return `${c.name} は からだが しびれて動けない！`;
  }
  if (c.ailments.fear && Math.random() < 0.3) {
    return `${c.name} は おそろしくて動けない！`;
  }
  return null;
}

// ---- どうぐメニュー（戦闘中） ----

function openItemMenu(actor) {
  const d = data();
  const owned = Object.entries(d.items || {})
    .filter(([id, n]) => n > 0 && getItem(id)?.battle)
    .map(([id, n]) => ({ id, n, m: getItem(id) }));

  const ov = document.createElement('div');
  ov.className = 'mkm-modal-ov';
  ov.innerHTML = `
    <div class="mkm-modal mkm-skill-modal">
      <button class="mkm-modal-close">✕</button>
      <h3 class="mkm-skill-modal-title">どうぐを つかう</h3>
      <div class="mkm-skill-choices" id="mkm-item-list"></div>
    </div>
  `;
  document.body.appendChild(ov);
  const list = ov.querySelector('#mkm-item-list');
  if (owned.length === 0) {
    list.innerHTML = '<p class="mkm-empty">つかえる どうぐが ない</p>';
  } else {
    owned.forEach(({ id, n, m }) => {
      const btn = document.createElement('button');
      btn.className = 'mkm-skill-choice';
      btn.innerHTML = `
        <span class="mkm-skill-cn">${m.icon} ${escHtml(m.name)} <small>×${n}</small></span>
        <span class="mkm-skill-cd">${escHtml(m.desc)}</span>
      `;
      btn.onclick = () => { ov.remove(); useBattleItem(actor, id); };
      list.appendChild(btn);
    });
  }
  ov.querySelector('.mkm-modal-close').onclick = () => ov.remove();
  ov.onclick = e => { if (e.target === ov) ov.remove(); };
}

function useBattleItem(actor, id) {
  const m = getItem(id);
  if (!m) return;

  // おやつ＝スカウト率アップ（ターン消費する）
  if (m.kind === 'scout') {
    addItem(id, -1);
    // 加算スタック（投げるほど上がる）・上限+60%
    B.scoutBonus = Math.min(0.6, (B.scoutBonus ?? 0) + m.power);
    save();
    sfx('scoutTry');
    const target = firstEnemy();
    pushLog(`${m.name} を なげた！ ${target ? target.name : '敵'}は きをひかれている…（スカウト率UP）`);
    playerTurn(() => { afterAction(); });
    return;
  }

  // 回復系：対象を選ぶ（味方）
  openHealTargetSelect(actor, id, m);
}

function openHealTargetSelect(actor, id, m) {
  const ov = document.createElement('div');
  ov.className = 'mkm-modal-ov';
  ov.innerHTML = `
    <div class="mkm-modal mkm-skill-modal">
      <button class="mkm-modal-close">✕</button>
      <h3 class="mkm-skill-modal-title">だれに つかう？</h3>
      <div class="mkm-skill-choices" id="mkm-heal-targets"></div>
    </div>
  `;
  document.body.appendChild(ov);
  const list = ov.querySelector('#mkm-heal-targets');
  B.allies.forEach(a => {
    // 蘇生は戦闘不能のみ、それ以外は生存のみ
    const ok = m.kind === 'revive' ? !a.alive : a.alive;
    const btn = document.createElement('button');
    btn.className = 'mkm-skill-choice' + (ok ? '' : ' mkm-skill-ng');
    if (!ok) btn.disabled = true;
    btn.innerHTML = `<span class="mkm-skill-cn">${escHtml(a.name)}</span><span class="mkm-skill-cmp">HP ${a.hp}/${a.maxHp}</span>`;
    if (ok) btn.onclick = () => { ov.remove(); applyItemToAlly(actor, id, m, a); };
    list.appendChild(btn);
  });
  ov.querySelector('.mkm-modal-close').onclick = () => ov.remove();
  ov.onclick = e => { if (e.target === ov) ov.remove(); };
}

function applyItemToAlly(actor, id, m, targetAlly) {
  addItem(id, -1);
  save();
  const idx = B.allies.indexOf(targetAlly);
  const elId = `mkm-ally-${idx}`;

  if (m.kind === 'heal_hp') {
    const heal = m.power;
    targetAlly.hp = Math.min(targetAlly.maxHp, targetAlly.hp + heal);
    sfx('heal'); showPopup(elId, `+${heal}`, 'heal');
    pushLog(`${m.name}！ ${targetAlly.name} の HPが ${heal} かいふく！`);
  } else if (m.kind === 'heal_mp') {
    const heal = m.power;
    targetAlly.mp = Math.min(targetAlly.maxMp, targetAlly.mp + heal);
    sfx('heal');
    pushLog(`${m.name}！ ${targetAlly.name} の MPが ${heal} かいふく！`);
  } else if (m.kind === 'revive') {
    targetAlly.hp = Math.floor(targetAlly.maxHp * m.power);
    targetAlly.alive = true;
    sfx('scoutOk'); showPopup(elId, `+${targetAlly.hp}`, 'heal');
    pushLog(`${m.name}！ ${targetAlly.name} が いきかえった！`);
    const el = document.getElementById(elId);
    if (el) el.classList.remove('mkm-bt-dead');
  } else if (m.kind === 'cure') {
    sfx('heal');
    pushLog(`${m.name}！ ${targetAlly.name} の 状態異常が なおった！`);
  }
  updateAllyBars();
  playerTurn(() => { afterAction(); });
}

function playerTurn(actionFn) {
  B.busy = true;
  renderCommand();
  actionFn();
}

// ---- とくぎメニュー ----

function openSkillMenu(actor) {
  const usable = actor.skills.map(getSkillMaster).filter(Boolean);
  const ov = document.createElement('div');
  ov.className = 'mkm-modal-ov';
  ov.innerHTML = `
    <div class="mkm-modal mkm-skill-modal">
      <button class="mkm-modal-close">✕</button>
      <h3 class="mkm-skill-modal-title">とくぎを選ぶ</h3>
      <div class="mkm-skill-choices">
        ${usable.map((s, i) => {
          const ng = s.mpCost > actor.mp;
          return `<button class="mkm-skill-choice ${ng?'mkm-skill-ng':''}" data-i="${i}" ${ng?'disabled':''}>
            <span class="mkm-skill-cn">${escHtml(s.name)}</span>
            <span class="mkm-skill-cmp">MP${s.mpCost}</span>
            <span class="mkm-skill-cd">${escHtml(s.description ?? '')}</span>
          </button>`;
        }).join('')}
      </div>
    </div>
  `;
  document.body.appendChild(ov);
  ov.querySelector('.mkm-modal-close').onclick = () => ov.remove();
  ov.onclick = e => { if (e.target === ov) ov.remove(); };
  ov.querySelectorAll('.mkm-skill-choice:not(.mkm-skill-ng)').forEach(b => {
    b.onclick = () => {
      const skill = usable[+b.dataset.i];
      ov.remove();
      actor.defending = false;
      playerTurn(() => doSkill(actor, skill));
    };
  });
}

// ---- 行動：通常攻撃 ----

function doAttack(actor, target) {
  if (!target) { endPlayerAction(); return; }
  pushLog(`${actor.name} の こうげき！`);
  const crit = rollCrit(actor, target);
  if (crit) pushLog('⚡ 会心の一撃！');
  // 通常攻撃：地味なフラッシュのみ。会心のときだけ斬撃エフェクト2連
  if (crit) {
    playSkillEffect(`mkm-enemy-${B.enemies.indexOf(target)}`, 'slash', 2);
  } else {
    playAttackFlash(`mkm-enemy-${B.enemies.indexOf(target)}`);
  }
  const dmg = calcPhysical(actor, target, 1.0, crit);
  applyDamage(target, dmg, 'enemy', () => {
    pushLog(`${target.name} に ${dmg} のダメージ！`);
    afterAction();
  }, { crit, noHitSfx: true });
}

// ---- 行動：とくぎ ----

// バフの日本語ラベル
const STAT_LABEL = { atk: 'こうげき', def: 'まもり', mag: 'まりょく', mnd: 'せいしん', spd: 'すばやさ' };

// ===== スキルエフェクト（画像＋専用SE）=====
const FX = {
  slash:   { img: '001', se: 'fx_slash' },
  impact:  { img: '002', se: 'fx_impact' },
  wind:    { img: '003', se: 'fx_wind' },
  fire:    { img: '004', se: 'fx_fire' },
  water:   { img: '005', se: 'fx_water' },
  ice:     { img: '006', se: 'fx_ice' },
  thunder: { img: '007', se: 'fx_thunder' },
  poison:  { img: '008', se: 'fx_poison' },
  dark:    { img: '009', se: 'fx_dark' },
  light:   { img: '010', se: 'fx_light' },
  heal:    { img: '011', se: 'heal' },
  debuff:  { img: '012', se: 'fx_dark' },
  // 必殺級（020-024）
  ult_dark:    { img: '020', se: 'fx_ultimate' },
  ult_holy:    { img: '021', se: 'fx_ultimate' },
  ult_fire:    { img: '022', se: 'fx_ultimate' },
  ult_ice:     { img: '023', se: 'fx_ultimate' },
  ult_genesis: { img: '024', se: 'fx_ultimate' },
};

// 技 → エフェクト種別を決定
function effectKindForSkill(skill) {
  if (skill.category === 'recovery') return 'heal';
  if (skill.effect?.type === 'buff') return 'light';
  const el = skill.element;
  const ultimate = (skill.power ?? 0) >= 2.6;
  if (ultimate) {
    return { fire: 'ult_fire', dark: 'ult_dark', ice: 'ult_ice', light: 'ult_holy' }[el] ?? 'ult_genesis';
  }
  if (skill.category === 'ailment' && (!skill.power || skill.power === 0)) {
    return { poison: 'poison', dark: 'dark', water: 'water' }[el] ?? 'debuff';
  }
  if (el && el !== 'none' && el !== 'auto') {
    return { fire: 'fire', water: 'water', ice: 'ice', thunder: 'thunder', poison: 'poison', dark: 'dark', light: 'light' }[el] ?? 'impact';
  }
  return skill.category === 'physical' ? 'slash' : 'wind';
}

// 技ごとの見た目バリエーション（同じ画像でも色相・大きさを変えて単調さを減らす）
function fxVariant(skill) {
  if (!skill) return { hue: 0, scale: 1 };
  let h = 0; const s = skill.skillId || skill.name || '';
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffff;
  return {
    hue: (h % 51) - 25,                          // -25〜+25度の色ずらし
    scale: 0.9 + Math.min(0.5, (skill.power ?? 1) * 0.12), // 威力で大きく
  };
}

// 通常攻撃の地味フラッシュ（SEのみ＋白くフラッシュするだけ）
function playAttackFlash(elId) {
  sfx('attack');
  const host = document.getElementById(elId);
  if (!host) return;
  const el = document.createElement('div');
  el.className = 'mkm-attack-flash';
  host.appendChild(el);
  setTimeout(() => el.remove(), 300);
}

// 対象要素にエフェクトを重ねて再生（count個＝上位技ほど多く）
function playSkillEffect(elId, kind, count = 1, vr = {}) {
  const fx = FX[kind];
  if (!fx) return;
  const host = document.getElementById(elId);
  const hue = vr.hue ?? 0;
  const baseScale = vr.scale ?? 1;
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      _sePitch = 0.92 + Math.random() * 0.16;   // ピッチ揺れ（連発の単調さ回避）
      sfx(fx.se);
      _sePitch = 1;
      if (!host) return;
      const el = document.createElement('div');
      el.className = 'mkm-fx';
      el.style.backgroundImage = `url('assets/effects/${fx.img}.webp')`;
      const sc = baseScale * (count > 1 ? (0.82 + Math.random() * 0.3) : 1);
      el.style.width  = (150 * sc) + '%';
      el.style.height = (150 * sc) + '%';
      if (count > 1) {
        el.style.left = (50 + (Math.random() * 36 - 18)) + '%';
        el.style.top  = (50 + (Math.random() * 36 - 18)) + '%';
      }
      el.style.filter = `hue-rotate(${hue}deg) drop-shadow(0 0 8px rgba(255,255,255,0.3))`;
      host.appendChild(el);
      setTimeout(() => el.remove(), 720);
    }, i * 130);
  }
}

// 上位技ほど多重表示（必殺は1で十分）
function fxCount(skill) {
  if ((skill.power ?? 0) >= 2.6) return 1;
  if ((skill.power ?? 0) >= 2.0) return 3;
  if ((skill.power ?? 0) >= 1.4) return 2;
  return 1;
}

function doSkill(actor, skill) {
  if (skill.mpCost > actor.mp) { endPlayerAction(); return; }
  actor.mp -= skill.mpCost;
  updateAllyBars();
  pushLog(`${actor.name} は ${skill.name} を つかった！`);

  const eff = skill.effect;

  // ① 状態異常解除（cure）
  if (eff && eff.type === 'cure_all') {
    sfx('heal');
    cureAilments(actor);
    updateAllyBars();
    pushLog(`${actor.name} の 状態異常が なおった！`);
    afterAction();
    return;
  }

  // ② バフ（能力上昇）— single_ally=自分 / all_ally=味方全体
  if (eff && eff.type === 'buff') {
    const stat = eff.stat;
    const targets = skill.target === 'all_ally' ? B.allies.filter(a => a.alive) : [actor];
    targets.forEach(a => {
      a.buffs = a.buffs || {};
      a.buffs[stat] = Math.min(2.0, (a.buffs[stat] ?? 1) + 0.3);   // +30%・上限2倍
      playSkillEffect(`mkm-ally-${B.allies.indexOf(a)}`, 'light', 1);
    });
    pushLog(`${targets.length > 1 ? 'みかた全体' : targets[0].name} の ${STAT_LABEL[stat] ?? stat} が あがった！`);
    afterAction();
    return;
  }

  // ③ 回復 — single_ally=自分 / all_ally=味方全体
  if (skill.category === 'recovery' && skill.recoveryRate > 0) {
    const targets = skill.target === 'all_ally' ? B.allies.filter(a => a.alive) : [actor];
    let sePlayed = false;
    targets.forEach(a => {
      const heal = Math.floor(statOf(actor, 'mag') * skill.recoveryRate);
      a.hp = Math.min(a.maxHp, a.hp + heal);
      showPopup(`mkm-ally-${B.allies.indexOf(a)}`, `+${heal}`, 'heal');
      // 回復エフェクト（SEは1回だけ）
      const fx = FX.heal; const host = document.getElementById(`mkm-ally-${B.allies.indexOf(a)}`);
      if (!sePlayed) { sfx(fx.se); sePlayed = true; }
      if (host) { const el = document.createElement('div'); el.className = 'mkm-fx'; el.style.backgroundImage = `url('assets/effects/${fx.img}.webp')`; host.appendChild(el); setTimeout(() => el.remove(), 720); }
    });
    updateAllyBars();
    pushLog(`${targets.length > 1 ? 'みかた全体' : targets[0].name} の HPが かいふくした！`);
    afterAction();
    return;
  }

  // 以降は敵対象
  const aliveEnemies = B.enemies.filter(e => e.alive);
  if (!aliveEnemies.length) { afterAction(); return; }
  const targets = skill.target === 'all_enemy' ? aliveEnemies : [aliveEnemies[0]];

  // ④ 純粋な状態異常付与技（power=0 のailment）
  if (skill.category === 'ailment' && (!skill.power || skill.power === 0)) {
    const kind = effectKindForSkill(skill);
    const vrA = fxVariant(skill);
    let any = false;
    targets.forEach((tg, i) => {
      playSkillEffect(`mkm-enemy-${B.enemies.indexOf(tg)}`, kind, 1, vrA);
      if (eff && eff.ailment && tryInflict(tg, eff.ailment, eff.rate ?? 1.0)) {
        any = true;
        pushLog(`${tg.name} は ${AILMENTS[eff.ailment].name} に かかった！`);
      }
    });
    if (!any) pushLog('しかし きかなかった…');
    renderEnemies();
    afterAction();
    return;
  }

  // ⑤ ダメージ系（全体・多段対応）＋属性エフェクト
  const fxKind = effectKindForSkill(skill);
  const fxN = fxCount(skill);
  const vr = fxVariant(skill);
  targets.forEach(tg => playSkillEffect(`mkm-enemy-${B.enemies.indexOf(tg)}`, fxKind, fxN, vr));
  const hits = Math.max(1, skill.hitCount || 1);
  let pending = 0;
  let critShown = false;
  const finish = () => {
    if (--pending > 0) return;
    // 複合：ダメージ＋状態異常（先頭の生存敵に付与）
    if (eff && eff.type === 'ailment' && eff.ailment) {
      const tg = aliveEnemies.find(e => e.alive);
      if (tg && tryInflict(tg, eff.ailment, eff.rate ?? 1.0)) {
        pushLog(`${tg.name} は ${AILMENTS[eff.ailment].name} に かかった！`);
        renderEnemies();
      }
    }
    afterAction();
  };
  targets.forEach(tg => {
    for (let h = 0; h < hits; h++) {
      if (!tg.alive) break;
      pending++;
      let crit = false;
      if (skill.category === 'physical') {
        crit = rollCrit(actor, tg);
        if (crit && !critShown) { pushLog('⚡ 会心の一撃！'); critShown = true; }
      }
      const dmg = skill.category === 'physical'
        ? calcPhysical(actor, tg, skill.power, crit)
        : calcSpell(actor, tg, skill);
      applyDamage(tg, dmg, 'enemy', () => {
        pushLog(`${tg.name} に ${dmg} のダメージ！`);
        finish();
      }, { crit, noHitSfx: true });   // 着弾音は属性エフェクトSEに任せる
    }
  });
  if (pending === 0) afterAction();   // 念のため（対象が全て即死等）
}

// ---- ダメージ計算（05_08準拠の簡易版） ----

// メタル系（trait_metal）判定：ダメージがほぼ通らない
function isMetal(c) { return !!c?.master?.traits?.includes('trait_metal'); }

// メタルへのダメージは 0〜2 に丸める（まれに会心で2）
function metalDamage() {
  const r = Math.random();
  if (r < 0.55) return 0;
  if (r < 0.95) return 1;
  return 2;
}

// バフ込みの実効ステータス
function statOf(c, key) { return (c.stats[key] ?? 0) * (c.buffs?.[key] ?? 1); }

// 会心（クリティカル）判定：物理のみ・メタルには無効。素早さで微増（6%〜12%）
function rollCrit(actor, target) {
  if (isMetal(target)) return false;
  const rate = 0.06 + Math.min(0.06, statOf(actor, 'spd') / 1800);
  return Math.random() < rate;
}

function calcPhysical(actor, target, power, crit = false) {
  if (isMetal(target)) return metalDamage();
  const a = statOf(actor, 'atk');
  const def = target.defending ? statOf(target, 'def') * 1.5 : statOf(target, 'def');
  let base = (a * a) / (a + def) * power;
  base *= elementMult('none', target);
  base *= rand(0.9, 1.1);
  if (crit) {
    base *= 1.8;                      // 会心：1.8倍＋ガード貫通（防御の0.5減衰を無視）
  } else if (target.defending) {
    base *= 0.5;
  }
  return Math.max(1, Math.floor(base));
}

function calcSpell(actor, target, skill) {
  if (isMetal(target)) return metalDamage();
  let base = statOf(actor, 'mag') * skill.power;
  base *= elementMult(skill.element, target);
  const resist = 100 / (100 + statOf(target, 'mnd') * 0.3);
  base *= resist;
  base *= rand(0.9, 1.1);
  if (target.defending) base *= 0.5;
  return Math.max(1, Math.floor(base));
}

function elementMult(element, target) {
  if (!element || element === 'none' || element === 'auto') return 1.0;
  const m = target.master;
  if (m.absorbs?.includes(element)) return -1.0;
  if (m.weaknesses?.includes(element)) return 1.5;
  if (m.resistances?.includes(element)) return 0.5;
  return 1.0;
}

function rand(min, max) { return Math.random() * (max - min) + min; }

// ---- ダメージ適用＋演出 ----

function applyDamage(target, dmg, side, cb, opts = {}) {
  const idx = side === 'enemy' ? B.enemies.indexOf(target) : B.allies.indexOf(target);
  const elId = side === 'enemy' ? `mkm-enemy-${idx}` : `mkm-ally-${idx}`;

  // 吸収（マイナス）は回復扱い
  if (dmg < 0) {
    sfx('heal');
    target.hp = Math.min(target.maxHp, target.hp - dmg);
    showPopup(elId, `+${-dmg}`, 'heal');
  } else {
    if (opts.crit) sfx('crit'); else if (!opts.noHitSfx) sfx('hit');
    target.hp = Math.max(0, target.hp - dmg);
    showPopup(elId, `${dmg}`, opts.crit ? 'crit' : 'damage');
    shake(elId, opts.crit);
  }
  updateBars();

  if (target.hp <= 0) {
    target.alive = false;
    setTimeout(() => {
      const el = document.getElementById(elId);
      if (el) el.classList.add('mkm-bt-dead');
      sfx('defeat');
      pushLog(`${target.name} を たおした！`);
      cb && cb();
    }, 350);
  } else {
    setTimeout(() => cb && cb(), 300);
  }
}

function updateBars() { updateEnemyBars(); updateAllyBars(); }

// HP割合に応じてバーの色クラスを更新
function applyHpColor(bar, pct) {
  if (!bar) return;
  bar.classList.remove('mkm-hp-mid', 'mkm-hp-low');
  if (pct <= 25) bar.classList.add('mkm-hp-low');
  else if (pct <= 50) bar.classList.add('mkm-hp-mid');
}

function updateEnemyBars() {
  B.enemies.forEach((e, i) => {
    const bar = document.getElementById(`mkm-enemy-hp-${i}`);
    const pct = hpPct(e);
    if (bar) { bar.style.width = pct + '%'; applyHpColor(bar, pct); }
  });
}
function updateAllyBars() {
  B.allies.forEach((a, i) => {
    const hp = document.getElementById(`mkm-ally-hp-${i}`);
    const mp = document.getElementById(`mkm-ally-mp-${i}`);
    const num  = document.getElementById(`mkm-ally-hpnum-${i}`);
    const mnum = document.getElementById(`mkm-ally-mpnum-${i}`);
    const pct = hpPct(a);
    if (hp)   { hp.style.width = pct + '%'; applyHpColor(hp, pct); }
    if (mp)   mp.style.width = mpPct(a) + '%';
    if (num)  num.textContent  = `HP ${String(a.hp).padStart(3)}/${a.maxHp}`;
    if (mnum) mnum.textContent = `MP ${String(a.mp).padStart(3)}/${a.maxMp}`;
  });
}

// ダメージ数字ポップアップ
function showPopup(elId, text, type) {
  const el = document.getElementById(elId);
  if (!el) return;
  const pop = document.createElement('div');
  pop.className = `mkm-dmg-pop mkm-dmg-${type}`;
  pop.textContent = text;
  el.appendChild(pop);
  setTimeout(() => pop.remove(), 800);
}

function shake(elId, strong = false) {
  const el = document.getElementById(elId);
  if (!el) return;
  const cls = strong ? 'mkm-shake-strong' : 'mkm-shake';
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), strong ? 420 : 350);
}

// ---- ターン進行 ----

function afterAction() {
  updateBars();
  // 敵全滅チェック
  if (B.enemies.every(e => !e.alive)) {
    setTimeout(winBattle, 500);
    return;
  }
  enemyPhase();
}

function endPlayerAction() {
  B.busy = false;
  renderCommand();
}

function enemyPhase() {
  setTimeout(() => {
    const enemies = B.enemies.filter(e => e.alive);
    let i = 0;
    const next = () => {
      if (i >= enemies.length) { endEnemyPhase(); return; }
      const e = enemies[i++];
      enemyAct(e, next);
    };
    next();
  }, 400);
}

function enemyAct(enemy, done) {
  // メタル系は数ターンで逃走（ターンが進むほど逃げやすい）
  if (isMetal(enemy)) {
    const fleeChance = 0.35 + B.turn * 0.25;   // turn0:35%, turn1:60%, turn2:85%…
    if (Math.random() < fleeChance) {
      pushLog(`${enemy.name} は すばやく にげだした！`);
      enemy.alive = false;
      enemy.fled = true;
      renderEnemies();
      // 残りの敵がいなければ戦闘終了（報酬なし）
      if (!B.enemies.some(e => e.alive)) {
        B.over = true;
        setTimeout(() => { toast('メタルは にげてしまった…'); backToMap(); }, 800);
        return;
      }
      setTimeout(done, 600);
      return;
    }
  }
  const target = firstAlly();
  if (!target) { done(); return; }
  // 敵の行動阻害（眠り・麻痺・恐怖）
  const block = checkActionBlock(enemy);
  if (block) { pushLog(block); renderEnemies(); setTimeout(done, 500); return; }
  pushLog(`${enemy.name} の こうげき！`);
  const crit = rollCrit(enemy, target);
  if (crit) pushLog('💥 痛恨の一撃！');
  const dmg = calcPhysical(enemy, target, 1.0, crit);
  applyDamage(target, dmg, 'ally', () => {
    pushLog(`${target.name} に ${dmg} のダメージ！`);
    done();
  }, { crit });
}

function endEnemyPhase() {
  updateBars();
  if (B.allies.every(a => !a.alive)) {
    setTimeout(loseBattle, 500);
    return;
  }
  // ターン終了処理（毒ダメージ・状態異常ターン経過）→ その後プレイヤーターンへ
  processTurnEnd(() => {
    if (B.allies.every(a => !a.alive)) { setTimeout(loseBattle, 500); return; }
    if (B.enemies.every(e => !e.alive)) { setTimeout(winBattle, 500); return; }
    B.allies.forEach(a => a.defending = false);
    B.turn++;
    endPlayerAction();
  });
}

// ターン終了：毒ダメージ → 状態異常の残りターン減少
function processTurnEnd(done) {
  const all = [...B.allies, ...B.enemies].filter(c => c.alive);
  // 毒ダメージ処理（順番に演出）
  const poisoned = all.filter(c => c.ailments.poison);
  let i = 0;
  const step = () => {
    if (i >= poisoned.length) { decAilments(); done(); return; }
    const c = poisoned[i++];
    if (!c.alive) { step(); return; }
    const dmg = Math.max(1, Math.floor(c.maxHp * 0.05));
    c.hp = Math.max(0, c.hp - dmg);
    const side = c.isEnemy ? 'enemy' : 'ally';
    const idx = c.isEnemy ? B.enemies.indexOf(c) : B.allies.indexOf(c);
    showPopup(`mkm-${side}-${idx}`, `${dmg}`, 'damage');
    pushLog(`${c.name} は 毒の ダメージ！ ${dmg}`);
    if (c.hp <= 0) { c.alive = false; const el = document.getElementById(`mkm-${side}-${idx}`); if (el) el.classList.add('mkm-bt-dead'); }
    updateBars();
    setTimeout(step, 450);
  };

  // 状態異常のターン経過（毒以外は減算、0で解除）
  const decAilments = () => {
    all.forEach(c => {
      for (const a of Object.keys(c.ailments)) {
        if (a === 'poison') continue;       // 毒は戦闘終了まで
        c.ailments[a]--;
        if (c.ailments[a] <= 0) {
          delete c.ailments[a];
          pushLog(`${c.name} の ${AILMENTS[a].name} が とけた`);
        }
      }
    });
    renderEnemies();
    renderAllies();
  };

  if (poisoned.length > 0) step();
  else { decAilments(); done(); }
}

// ---- スカウト ----

function doScout(target) {
  if (!target) { endPlayerAction(); return; }
  B.scoutTried++;
  sfx('scoutTry');
  pushLog(`${target.name} を スカウトしようとした！`);

  // スカウト率：敵HP割合が低いほど高い ＋ ランク補正
  const hpRatio = target.hp / target.maxHp;
  const rankPenalty = { F:0, E:0.05, D:0.1, C:0.15, B:0.25, A:0.35, S:0.5, SS:0.6 }[target.master.rank] ?? 0;
  let rate = (0.6 - rankPenalty) * (1.1 - hpRatio) + 0.05;
  rate += (B.scoutBonus ?? 0);  // おやつ補正
  rate = Math.max(0.02, Math.min(0.95, rate));

  const success = Math.random() < rate;
  showScoutAnim(target, success, () => {
    if (success) {
      pushLog(`${target.name} が なかまに なった！`);
      scoutSuccess(target);
    } else {
      pushLog(`${target.name} は こころを ひらかなかった…`);
      enemyPhase();
    }
  });
}

// スカウト揺れ演出（ポケボール風）
function showScoutAnim(target, success, cb) {
  const ov = document.createElement('div');
  ov.className = 'mkm-scout-anim';
  ov.innerHTML = `
    <div class="mkm-scout-ball" id="mkm-scout-ball">🎣</div>
    <div class="mkm-scout-text" id="mkm-scout-text"></div>
  `;
  document.body.appendChild(ov);
  const ball = ov.querySelector('#mkm-scout-ball');
  const txt = ov.querySelector('#mkm-scout-text');
  let shakes = 0;
  const maxShakes = success ? 3 : randRange(1, 2);
  const doShake = () => {
    if (shakes >= maxShakes) {
      if (success) {
        txt.textContent = '✨ なかまになった！ ✨';
        ball.classList.add('mkm-scout-success');
        sfx('scoutOk');
      } else {
        txt.textContent = '…にげられた！';
        ball.classList.add('mkm-scout-fail');
        sfx('scoutNg');
      }
      setTimeout(() => { ov.remove(); cb(); }, 900);
      return;
    }
    shakes++;
    txt.textContent = '・'.repeat(shakes);
    ball.classList.add('mkm-scout-shake');
    beep((window.getAudioCtx?window.getAudioCtx().currentTime:0), 700, 700, 0.05, 0.08, 'sine');
    setTimeout(() => ball.classList.remove('mkm-scout-shake'), 400);
    setTimeout(doShake, 600);
  };
  setTimeout(doShake, 400);
}

function scoutSuccess(target) {
  const d = data();
  if (Object.keys(d.monsters).length >= FARM_MAX) {
    toast(`牧場が満員です（${FARM_MAX}体）。誰かを逃がしてください`);
    return;
  }
  const newInst = {
    instanceId: uuid(),
    monsterId: target.monsterId,
    nickname: '',
    level: target.level,
    exp: 0,
    fusionValue: 0,
    mutationType: 'none',
    skills: target.skills.slice(),
    traits: target.master.traits ?? [],
    isFavorite: false,
  };
  d.monsters[newInst.instanceId] = newInst;
  d.record.scout = (d.record.scout ?? 0) + 1;
  registerDex(target.monsterId, true);
  save();
  // スカウトしたら戦闘終了（勝利扱いだが報酬は経験値のみ）
  B.over = true;
  B.scoutedInst = newInst;
  setTimeout(() => showBattleResult({ scouted: target, scoutedInst: newInst, exp: calcExp(B.enemies), gold: 0 }), 300);
}

// ---- にげる ----

function tryRun() {
  if (Math.random() < 0.75) {
    pushLog('うまく にげきれた！');
    B.over = true;
    setTimeout(backToMap, 700);
  } else {
    pushLog('にげられなかった！');
    B.busy = true;
    renderCommand();
    enemyPhase();
  }
}

// ---- 勝敗 ----

function winBattle() {
  B.over = true;
  sfx('win');
  const exp = calcExp(B.enemies);
  const gold = calcGold(B.enemies);
  const d = data();
  d.gold += gold;
  d.record.battle = (d.record.battle ?? 0) + 1;
  d.record.win = (d.record.win ?? 0) + 1;
  B.enemies.forEach(e => registerDex(e.monsterId, false));
  save();
  if (B.isBoss && MAP) {
    d.flags = d.flags || {};
    const flagKey = `boss_${MAP.area.id}`;
    const firstDefeat = !d.flags[flagKey];   // 初回撃破か（子供贈呈は一度きり）
    d.flags[flagKey] = true;
    MAP.bossDefeated = true;
    save();
    showBattleResult({ exp, gold, isBossClear: true, bossEnemy: firstDefeat ? B.enemies[0] : null });
  } else {
    showBattleResult({ exp, gold });
  }
}

function loseBattle() {
  B.over = true;
  sfx('gameover');
  const d = data();
  d.record.battle = (d.record.battle ?? 0) + 1;
  save();
  const ov = document.createElement('div');
  ov.className = 'mkm-result-ov';
  ov.innerHTML = `
    <div class="mkm-result mkm-result-lose">
      <h3>ぜんめつ…</h3>
      <p>パーティは ちからつきた</p>
      <button class="mkm-btn-primary" id="mkm-result-ok">始まりの村へ戻る</button>
    </div>
  `;
  document.body.appendChild(ov);
  ov.querySelector('#mkm-result-ok').onclick = () => {
    // 全回復して始まりの村へ（救済）
    ov.remove();
    MAP = null;
    enterVillage();
  };
}

function calcExp(enemies) {
  const table = { F:16, E:32, D:80, C:190, B:460, A:1000, S:2200, SS:4500 };
  // 逃げた敵は経験値に含めない
  return enemies.filter(e => !e.fled).reduce((s, e) => {
    if (isMetal(e)) return s + 3000 + e.level * 150;   // メタルは特大経験値
    return s + Math.floor((table[e.master.rank] ?? 16) * (1 + e.level * 0.12));
  }, 0);
}
function calcGold(enemies) {
  return enemies.reduce((s, e) => s + randRange(10, 40) + e.level * 3, 0);
}

// ---- 戦闘結果＋経験値＋レベルアップ ----

function showBattleResult({ exp, gold, scouted, scoutedInst, isBossClear = false, bossEnemy = null }) {
  const d = data();
  const levelUps = [];

  // 全メンバーに経験値配分（戦闘不能は50%）
  B.allies.forEach(a => {
    const inst = a.ref;
    const actualExp = a.alive ? exp : Math.floor(exp * 0.5);
    if (actualExp <= 0) return;
    const result = gainExp(inst, actualExp);
    if (result.leveledUp) {
      levelUps.push({ inst, ...result });
      // レベルアップで HP/MP 全回復＋戦闘不能なら復活
      const ns = calcStats(inst);
      a.maxHp = ns.hp; a.maxMp = ns.mp;
      a.hp = ns.hp; a.mp = ns.mp;
      a.alive = true;
    }
  });

  // スカウト時、パーティに空きがあるか
  const canAddParty = scoutedInst && d.party.includes(null);

  const ov = document.createElement('div');
  ov.className = 'mkm-result-ov';
  ov.innerHTML = `
    <div class="mkm-result mkm-result-win">
      <h3>${isBossClear ? '🏆 ボス撃破！' : scouted ? '🎣 スカウト成功！' : '⚔️ しょうり！'}</h3>
      ${isBossClear ? `<p class="mkm-result-scout">出口が解放された！</p>` : ''}
      ${scouted ? `<p class="mkm-result-scout">${escHtml(scouted.name)} が なかまに！</p>` : ''}
      <div class="mkm-result-rewards">
        <div>獲得経験値　<b>${exp}</b></div>
        ${gold > 0 ? `<div>獲得ゴールド　<b>💰${gold}</b></div>` : ''}
      </div>
      <div class="mkm-result-levelups" id="mkm-result-levelups"></div>
      ${scoutedInst ? `<div class="mkm-result-scout-acts" id="mkm-result-scout-acts"></div>` : ''}
      <button class="mkm-btn-primary" id="mkm-result-continue">探索にもどる</button>
      <button class="mkm-btn-sec" id="mkm-result-home">始まりの村へ</button>
    </div>
  `;
  document.body.appendChild(ov);

  const luEl = ov.querySelector('#mkm-result-levelups');
  let anyLearned = false;
  levelUps.forEach(lu => {
    const master = getMonsterMaster(lu.inst.monsterId);
    const name = escHtml(lu.inst.nickname || master.name);
    const div = document.createElement('div');
    div.className = 'mkm-levelup';
    div.innerHTML = `🎉 ${name} は Lv.${lu.newLevel} に あがった！`;
    luEl.appendChild(div);
    // 新しく覚えた特技を告知（ポケモン風のわくわく）
    (lu.learned ?? []).forEach(skillName => {
      anyLearned = true;
      const sd = document.createElement('div');
      sd.className = 'mkm-levelup mkm-skill-learn';
      sd.innerHTML = `✨ ${name} は 「${escHtml(skillName)}」を おぼえた！`;
      luEl.appendChild(sd);
    });
  });
  if (levelUps.length > 0) setTimeout(() => sfx('levelup'), 500);
  if (anyLearned) setTimeout(() => sfx('scoutOk'), 900);   // 習得時はもう一段はなやかに

  // スカウトしたモンスターへの操作（なまえ・パーティ）
  if (scoutedInst) {
    const acts = ov.querySelector('#mkm-result-scout-acts');
    const master = getMonsterMaster(scoutedInst.monsterId);
    const render = () => {
      const added = d.party.includes(scoutedInst.instanceId);
      const hasEmpty = d.party.includes(null);
      acts.innerHTML = `
        <button class="mkm-btn-sec" id="mkm-scout-name">✏️ なまえをつける</button>
        ${added
          ? `<div class="mkm-scout-added">✓ パーティに加わった</div>`
          : (hasEmpty ? `<button class="mkm-btn-primary" id="mkm-scout-party">パーティに入れる</button>` : '')}
      `;
      const nameBtn = acts.querySelector('#mkm-scout-name');
      if (nameBtn) nameBtn.onclick = () => {
        promptModal({
          title: `${master.name} になまえをつける`,
          placeholder: master.name,
          value: scoutedInst.nickname || '',
          okLabel: 'つける',
        }, (nm) => {
          scoutedInst.nickname = nm;
          save();
          const sc = ov.querySelector('.mkm-result-scout');
          if (sc) sc.textContent = `${scoutedInst.nickname || master.name} が なかまに！`;
        });
      };
      const pBtn = acts.querySelector('#mkm-scout-party');
      if (pBtn) pBtn.onclick = () => {
        const idx = d.party.indexOf(null);
        d.party[idx] = scoutedInst.instanceId;
        sfx('select'); save();
        render();
      };
    };
    render();
  }

  save();

  ov.querySelector('#mkm-result-continue').onclick = () => {
    ov.remove();
    if (isBossClear && bossEnemy) {
      showBossChildScene(bossEnemy);
    } else {
      backToMap();
    }
  };
  ov.querySelector('#mkm-result-home').onclick = () => {
    ov.remove();
    if (isBossClear && bossEnemy) {
      showBossChildScene(bossEnemy, true);
    } else {
      MAP = null;
      enterVillage();
    }
  };
}

// ボス撃破後：「息子を頼む」会話 → Lv1の子供を贈呈
function showBossChildScene(bossEnemy, goHome = false) {
  const master = getMonsterMaster(bossEnemy.monsterId);
  const bossName = master?.name ?? bossEnemy.name;

  const d = data();
  // Lv1の子供インスタンスを作成（牧場に追加）
  let childInst = null;
  if (Object.keys(d.monsters).length < FARM_MAX) {
    childInst = {
      instanceId: uuid(),
      monsterId: bossEnemy.monsterId,
      nickname: '',
      level: 1,
      exp: 0,
      fusionValue: 0,
      mutationType: 'none',
      skills: (master?.skills ?? []).slice(0, 2).map(s => s.skillId),
      traits: master?.traits ?? [],
      isFavorite: false,
    };
    d.monsters[childInst.instanceId] = childInst;
    registerDex(bossEnemy.monsterId, true);
    save();
  }

  const lines = [
    { speaker: bossName, text: 'ぬぅ……やるな、小僧。\nわしを倒すとは大したものじゃ。' },
    { speaker: bossName, text: 'ならば頼みがある。\nわしの息子——まだ幼いが、\nお前に預けたい。' },
    { speaker: bossName, text: childInst
        ? `この子をよろしく頼んだぞ。\n「${bossName}の子」が 仲間に加わった！`
        : `頼みたいのだが……\nお前の牧場は満員じゃな。\n余裕ができたらまた来い。` },
  ];

  let i = 0;
  const next = () => {
    if (i >= lines.length) {
      closeDialog();
      if (goHome) { MAP = null; enterVillage(); }
      else backToMap();
      return;
    }
    const l = lines[i++];
    showDialog(l.speaker, l.text, `
      <button class="mkm-btn-primary" id="mkm-bosschild-next">
        ${i >= lines.length ? '✅ わかった' : '▼ つぎへ'}
      </button>`, () => {
      document.getElementById('mkm-bosschild-next').onclick = next;
    });
  };
  next();
}

// 経験値付与＋レベルアップ判定
function gainExp(inst, amount) {
  inst.exp = (inst.exp ?? 0) + amount;
  let leveledUp = false;
  let newLevel = inst.level;
  const learned = [];
  while (inst.level < LEVEL_MAX && inst.exp >= expToNext(inst.level)) {
    inst.exp -= expToNext(inst.level);
    inst.level++;
    newLevel = inst.level;
    leveledUp = true;
    learned.push(...learnSkillsOnLevel(inst));
  }
  return { leveledUp, newLevel, learned };
}

// 次のレベルまでの必要経験値（簡易曲線）
function expToNext(level) {
  return Math.floor(20 * Math.pow(level, 1.8)) + 10;
}

// レベルアップ時の特技習得
function learnSkillsOnLevel(inst) {
  const master = getMonsterMaster(inst.monsterId);
  const learned = [];
  if (!master?.skills) return learned;
  master.skills.forEach(s => {
    if (s.level === inst.level && !inst.skills.includes(s.skillId)) {
      if (inst.skills.length < 8) {
        inst.skills.push(s.skillId);
        learned.push(getSkillMaster(s.skillId)?.name ?? s.skillId);
      }
    }
  });
  return learned;
}

// ---- 図鑑登録 ----

function registerDex(monsterId, owned) {
  const d = data();
  const key = String(monsterId);
  if (!d.dex[key]) d.dex[key] = { seen: false, owned: false, scoutCount: 0, fusionCount: 0 };
  const wasNew = !d.dex[key].seen;
  d.dex[key].seen = true;
  if (owned) {
    d.dex[key].owned = true;
    d.dex[key].scoutCount = (d.dex[key].scoutCount ?? 0) + 1;
  }
  return wasNew;
}

// ---- ログ ----

function pushLog(msg) {
  if (!B) return;
  B.log.push(msg);
  if (B.log.length > 30) B.log.shift();
  renderLog();
}

function renderLog() {
  const el = document.getElementById('mkm-bt-log');
  if (!el) return;
  el.innerHTML = B.log.slice(-4).map(m => `<div class="mkm-log-line">${escHtml(m)}</div>`).join('');
  el.scrollTop = el.scrollHeight;
}

// ---- トースト ----

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'mkm-toast';
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 1800);
}

// ゲーム内デザインの入力モーダル（標準promptの代替）
// onOk(value) を呼ぶ。キャンセル時は何もしない。
function promptModal({ title, placeholder = '', value = '', maxLength = 8, okLabel = '決定' }, onOk) {
  const ov = document.createElement('div');
  ov.className = 'mkm-modal-ov mkm-input-ov';
  ov.innerHTML = `
    <div class="mkm-modal mkm-input-modal">
      <h3 class="mkm-input-title">${escHtml(title)}</h3>
      <input type="text" class="mkm-input-field" id="mkm-input-field"
             maxlength="${maxLength}" placeholder="${escHtml(placeholder)}" value="${escHtml(value)}" />
      <div class="mkm-input-actions">
        <button class="mkm-btn-sec" id="mkm-input-cancel">キャンセル</button>
        <button class="mkm-btn-primary" id="mkm-input-ok">${escHtml(okLabel)}</button>
      </div>
    </div>
  `;
  document.body.appendChild(ov);
  const field = ov.querySelector('#mkm-input-field');
  field.focus();

  const close = () => ov.remove();
  const submit = () => {
    const v = field.value.trim().slice(0, maxLength);
    sfx('select');
    close();
    onOk(v);
  };
  ov.querySelector('#mkm-input-ok').onclick = submit;
  ov.querySelector('#mkm-input-cancel').onclick = () => { sfx('cancel'); close(); };
  field.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
  ov.addEventListener('click', e => { if (e.target === ov) close(); });
}

// ========================================
// 配合システム
// ========================================

const FUSION_COST = 500;            // 通常配合費用
const RANK_ORDER = ['F','E','D','C','B','A','S','SS'];

// 配合状態
let FU = { parentA: null, parentB: null };

// 子のランク決定（仕様04準拠：基本=低い方の親、同系統30%でランクアップ）
function fuseRank(mA, mB) {
  const iA = RANK_ORDER.indexOf(mA.rank);
  const iB = RANK_ORDER.indexOf(mB.rank);
  let base = Math.min(iA, iB);
  // 同系統なら30%でランクアップ
  if (mA.family === mB.family && Math.random() < 0.3) {
    base = Math.min(base + 1, RANK_ORDER.length - 1);
  }
  return RANK_ORDER[base];
}

// 子の系統決定
function fuseFamily(mA, mB) {
  if (mA.family === mB.family) {
    return Math.random() < 0.8 ? mA.family : randomFamily();
  }
  return Math.random() < 0.5 ? mA.family : mB.family;
}

function randomFamily() {
  const keys = Object.keys(FAMILIES);
  return keys[Math.floor(Math.random() * keys.length)];
}

// 2親から子モンスターを決定する（レシピ→fusionResult→ランダムの優先順）
function resolveChildMonster(mA, mB) {
  const idA = mA.monsterId, idB = mB.monsterId;

  // ① fusionRecipesで完全一致チェック（A+B / B+A どちらでもOK）
  const recipe = (MASTER.recipes ?? []).find(r =>
    (r.a === idA && r.b === idB) || (r.a === idB && r.b === idA)
  );
  if (recipe) {
    const master = getMonsterMaster(recipe.result);
    if (master) return master;
  }

  // ② fusionResult（単体チェーン）
  const rA = mA.fusionResult ?? null;
  const rB = mB.fusionResult ?? null;
  if (rA || rB) {
    const resultId = (rA && rB)
      ? (RANK_ORDER.indexOf(mA.rank) >= RANK_ORDER.indexOf(mB.rank) ? rA : rB)
      : (rA ?? rB);
    const master = getMonsterMaster(resultId);
    if (master) return master;
  }

  // ③ ランク×系統ランダム（フォールバック）
  return pickChildMonster(fuseRank(mA, mB), fuseFamily(mA, mB));
}

// 指定ランク・系統に合致する子モンスター候補を選ぶ（fusionResultなし時のフォールバック）
function pickChildMonster(rank, family) {
  const exact = MASTER.monsters.filter(m => m.rank === rank && m.family === family);
  if (exact.length) return exact[Math.floor(Math.random() * exact.length)];
  const sameFam = MASTER.monsters.filter(m => m.family === family)
    .sort((a, b) => Math.abs(RANK_ORDER.indexOf(a.rank) - RANK_ORDER.indexOf(rank))
                  - Math.abs(RANK_ORDER.indexOf(b.rank) - RANK_ORDER.indexOf(rank)));
  if (sameFam.length) return sameFam[0];
  const sameRank = MASTER.monsters.filter(m => m.rank === rank);
  if (sameRank.length) return sameRank[Math.floor(Math.random() * sameRank.length)];
  return MASTER.monsters[0];
}

// ---- 配合画面 ----

function renderFusion() {
  FU = { parentA: null, parentB: null };
  root().innerHTML = `
    <div class="mg-game-header">
      <button id="mokumon-back-btn" class="mg-back-btn">‹ 戻る</button>
      <h2 class="mg-game-title">🔬 配合研究所</h2>
      <span class="mkm-gold">💰 ${fmtNum(data().gold)}</span>
    </div>
    <div class="mkm-fusion">
      <p class="mkm-fusion-note">2体を選んで あたらしいモンスターを誕生させよう</p>
      <div class="mkm-fusion-slots">
        <div class="mkm-fslot" id="mkm-fslot-A"><div class="mkm-fslot-empty">親A<br>＋</div></div>
        <div class="mkm-fusion-plus">＋</div>
        <div class="mkm-fslot" id="mkm-fslot-B"><div class="mkm-fslot-empty">親B<br>＋</div></div>
      </div>
      <div class="mkm-fusion-preview" id="mkm-fusion-preview"></div>
      <div class="mkm-fusion-actions">
        <button class="mkm-btn-primary" id="mkm-fuse-go" disabled>配合する（💰${FUSION_COST}）</button>
      </div>
      <div class="mkm-fusion-pick">
        <div class="mkm-fusion-pick-title">配合する2体を選ぶ</div>
        <div class="mkm-grid" id="mkm-fusion-grid"></div>
      </div>
    </div>
  `;
  renderFusionPickList();
  renderFusionSlots();
  document.getElementById('mokumon-back-btn').onclick = enterVillage;
  document.getElementById('mkm-fuse-go').onclick = doFusion;
}

function renderFusionPickList() {
  const d = data();
  const grid = document.getElementById('mkm-fusion-grid');
  grid.innerHTML = '';
  const list = Object.values(d.monsters).sort((a, b) => a.monsterId - b.monsterId);
  if (list.length < 2) {
    grid.innerHTML = '<p class="mkm-empty">配合には2体以上必要です</p>';
    return;
  }
  list.forEach(inst => {
    const selected = (FU.parentA === inst.instanceId || FU.parentB === inst.instanceId);
    const locked = inst.isFavorite;
    const el = card(inst, 'sm', locked ? null : () => toggleFusionPick(inst));
    if (selected) el.classList.add('mkm-card--sel');
    if (locked) { el.classList.add('mkm-card--dim'); el.title = 'お気に入りロック中'; }
    grid.appendChild(el);
  });
}

function toggleFusionPick(inst) {
  const id = inst.instanceId;
  if (FU.parentA === id) { FU.parentA = null; }
  else if (FU.parentB === id) { FU.parentB = null; }
  else if (!FU.parentA) { FU.parentA = id; }
  else if (!FU.parentB) { FU.parentB = id; }
  else { FU.parentA = FU.parentB; FU.parentB = id; } // 3体目は親Bを置き換え
  renderFusionSlots();
  renderFusionPickList();
}

function renderFusionSlots() {
  const d = data();
  fillSlot('mkm-fslot-A', FU.parentA, 'A');
  fillSlot('mkm-fslot-B', FU.parentB, 'B');

  const preview = document.getElementById('mkm-fusion-preview');
  const goBtn = document.getElementById('mkm-fuse-go');
  if (FU.parentA && FU.parentB) {
    const a = d.monsters[FU.parentA], b = d.monsters[FU.parentB];
    const mA = getMonsterMaster(a.monsterId), mB = getMonsterMaster(b.monsterId);
    const newFusionValue = Math.min(FUSION_VALUE_MAX, a.level + b.level);
    const inheritCount = Math.min(3, new Set([...a.skills, ...b.skills].filter(s => {
      const sm = getSkillMaster(s); return sm && sm.inheritable;
    })).size);
    const previewChild = resolveChildMonster(mA, mB);
    const previewFam = famInfo(previewChild.family);
    const isFixed = (mA.fusionResult || mB.fusionResult);
    preview.innerHTML = `
      <div class="mkm-fusion-arrow">▼</div>
      <div class="mkm-fusion-result">
        <div class="mkm-fusion-result-row">
          <span>生まれる子</span>
          <b style="color:${previewFam.color}">${escHtml(previewChild.name)}</b>
          <span style="font-size:10px;color:#888">${isFixed ? '（確定）' : '（候補）'}</span>
        </div>
        <div class="mkm-fusion-result-row"><span>ランク</span><b>${previewChild.rank}</b></div>
        <div class="mkm-fusion-result-row"><span>系統</span><b>${previewFam.name}系</b></div>
        <div class="mkm-fusion-result-row"><span>配合値</span><b>${newFusionValue}</b></div>
        <div class="mkm-fusion-result-row"><span>継承できる特技</span><b>最大${inheritCount}個</b></div>
      </div>
    `;
    const gold = d.gold;
    goBtn.disabled = gold < FUSION_COST;
    goBtn.textContent = gold < FUSION_COST ? `ゴールド不足（💰${FUSION_COST}）` : `配合する（💰${FUSION_COST}）`;
  } else {
    preview.innerHTML = '';
    goBtn.disabled = true;
    goBtn.textContent = `配合する（💰${FUSION_COST}）`;
  }
}

// プレビューのランク表示（同系統はランクアップの可能性を示す）
function fillSlot(elId, instId, label) {
  const el = document.getElementById(elId);
  const d = data();
  if (instId && d.monsters[instId]) {
    const inst = d.monsters[instId];
    const m = getMonsterMaster(inst.monsterId);
    const fam = famInfo(m.family);
    el.className = 'mkm-fslot mkm-fslot-filled';
    el.innerHTML = `
      <div class="mkm-fslot-img" style="background:${fam.color}22">
        <img src="${monImg(inst.monsterId)}" alt=""
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
        <div class="mkm-card-ph" style="background:${fam.color};display:none"><span>${escHtml(m.name[0])}</span></div>
      </div>
      <div class="mkm-fslot-name">${escHtml(inst.nickname || m.name)}</div>
      <div class="mkm-fslot-sub">Lv.${inst.level} <span style="color:${rankColor(m.rank)}">${m.rank}</span></div>
    `;
    el.onclick = () => { if (label === 'A') FU.parentA = null; else FU.parentB = null; renderFusionSlots(); renderFusionPickList(); };
  } else {
    el.className = 'mkm-fslot';
    el.innerHTML = `<div class="mkm-fslot-empty">親${label}<br>＋</div>`;
    el.onclick = null;
  }
}

// ---- 配合実行 ----

function doFusion() {
  const d = data();
  if (!FU.parentA || !FU.parentB) return;
  if (d.gold < FUSION_COST) { toast('ゴールドが足りません'); return; }

  const a = d.monsters[FU.parentA];
  const b = d.monsters[FU.parentB];
  const mA = getMonsterMaster(a.monsterId);
  const mB = getMonsterMaster(b.monsterId);

  // 継承特技の選択へ
  openInheritSelect(a, b, mA, mB);
}

function openInheritSelect(a, b, mA, mB) {
  // 継承可能な特技（重複除去・固有除外）
  const pool = [...new Set([...a.skills, ...b.skills])]
    .map(getSkillMaster)
    .filter(s => s && s.inheritable);
  const maxInherit = 3;
  let selected = [];

  const ov = document.createElement('div');
  ov.className = 'mkm-modal-ov';
  ov.innerHTML = `
    <div class="mkm-modal">
      <button class="mkm-modal-close">✕</button>
      <h3 class="mkm-skill-modal-title">継承する特技を選ぶ（最大${maxInherit}個）</h3>
      <p class="mkm-inherit-note">選ばなくてもOK。子が元々覚える特技は別枠です。</p>
      <div class="mkm-skill-choices" id="mkm-inherit-list"></div>
      <button class="mkm-btn-primary" id="mkm-inherit-go" style="margin-top:14px">この内容で配合</button>
    </div>
  `;
  document.body.appendChild(ov);

  const listEl = ov.querySelector('#mkm-inherit-list');
  const render = () => {
    listEl.innerHTML = '';
    pool.forEach((s, i) => {
      const on = selected.includes(s.skillId);
      const btn = document.createElement('button');
      btn.className = 'mkm-skill-choice' + (on ? ' mkm-skill-on' : '');
      btn.innerHTML = `
        <span class="mkm-skill-cn">${on ? '✓ ' : ''}${escHtml(s.name)}</span>
        <span class="mkm-skill-cmp">MP${s.mpCost}</span>
        <span class="mkm-skill-cd">${escHtml(s.description ?? '')}</span>
      `;
      btn.onclick = () => {
        if (on) selected = selected.filter(x => x !== s.skillId);
        else if (selected.length < maxInherit) selected.push(s.skillId);
        else toast(`継承は最大${maxInherit}個まで`);
        render();
      };
      listEl.appendChild(btn);
    });
    if (pool.length === 0) listEl.innerHTML = '<p class="mkm-empty">継承できる特技がありません</p>';
  };
  render();

  ov.querySelector('.mkm-modal-close').onclick = () => ov.remove();
  ov.querySelector('#mkm-inherit-go').onclick = () => {
    ov.remove();
    executeFusion(a, b, mA, mB, selected);
  };
}

function executeFusion(a, b, mA, mB, inheritedSkills) {
  const d = data();
  d.gold -= FUSION_COST;

  // 子の決定（fusionResultを優先、なければランク×系統ランダム）
  const childMaster = resolveChildMonster(mA, mB);
  const fusionValue = Math.min(FUSION_VALUE_MAX, a.level + b.level);

  // 子が元々覚える特技（Lv1習得分）＋継承特技
  const baseSkills = (childMaster.skills ?? [])
    .filter(s => s.level <= 1).map(s => s.skillId);
  const skills = [...new Set([...baseSkills, ...inheritedSkills])].slice(0, 8);
  if (skills.length === 0) skills.push('skill_attack');

  // 特性継承（親Aから1個、神/創世/系統王は不可…今は通常のみ）
  const childTraits = (childMaster.traits ?? []).slice();

  const child = {
    instanceId: uuid(),
    monsterId: childMaster.monsterId,
    nickname: '',
    level: 1,
    exp: 0,
    fusionValue,
    mutationType: 'none',
    skills,
    traits: childTraits,
    isFavorite: false,
  };

  // 親を消滅・パーティから除去
  delete d.monsters[a.instanceId];
  delete d.monsters[b.instanceId];
  d.party = d.party.map(id => (id === a.instanceId || id === b.instanceId) ? null : id);

  // 子を登録
  d.monsters[child.instanceId] = child;
  d.record.fusion = (d.record.fusion ?? 0) + 1;
  registerDex(child.monsterId, true);
  if (d.dex[child.monsterId]) d.dex[child.monsterId].fusionCount = (d.dex[child.monsterId].fusionCount ?? 0) + 1;

  save();
  showFusionResult(child, childMaster);
}

// ---- 配合結果演出 ----

function showFusionResult(child, master) {
  sfx('fusion');
  const fam = famInfo(master.family);
  const ov = document.createElement('div');
  ov.className = 'mkm-result-ov';
  ov.innerHTML = `
    <div class="mkm-result mkm-fusion-birth">
      <div class="mkm-birth-flash"></div>
      <h3>✨ あたらしい命の誕生！ ✨</h3>
      <div class="mkm-birth-img" style="background:${fam.color}22">
        <img src="${monImg(master.monsterId)}" alt=""
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
        <div class="mkm-card-ph" style="background:${fam.color};display:none"><span style="font-size:2.4rem">${escHtml(master.name[0])}</span></div>
      </div>
      <div class="mkm-birth-name">${escHtml(master.name)}</div>
      <div class="mkm-birth-tags">
        <span class="mkm-tag" style="background:${fam.color}">${fam.name}系</span>
        <span class="mkm-tag" style="background:${rankColor(master.rank)}">${master.rank}</span>
        <span class="mkm-lv">配合値 ${child.fusionValue}</span>
      </div>
      <div class="mkm-birth-actions" id="mkm-birth-actions" style="margin-top:16px"></div>
    </div>
  `;
  document.body.appendChild(ov);

  const d = data();
  const hasEmpty = d.party.includes(null);
  const acts = ov.querySelector('#mkm-birth-actions');
  acts.innerHTML = hasEmpty
    ? `<button class="mkm-btn-primary" id="mkm-birth-party">パーティに入れる</button>
       <button class="mkm-btn-sec" id="mkm-birth-ok">牧場へ</button>`
    : `<button class="mkm-btn-primary" id="mkm-birth-ok">やったね！</button>`;

  if (hasEmpty) {
    acts.querySelector('#mkm-birth-party').onclick = () => {
      const idx = d.party.indexOf(null);
      d.party[idx] = child.instanceId;
      save();
      sfx('select');
      toast('パーティに入れました');
      ov.remove();
      renderFusion();
    };
  }
  acts.querySelector('#mkm-birth-ok').onclick = () => {
    ov.remove();
    renderFusion();
  };
}

// ========================================
// 持ち物（どうぐ）画面
// ========================================

function renderBag() {
  const d = data();
  d.items = d.items || {};
  const owned = Object.entries(d.items).filter(([id, n]) => n > 0 && getItem(id));

  root().innerHTML = `
    <div class="mg-game-header">
      <button id="mokumon-back-btn" class="mg-back-btn">‹ 戻る</button>
      <h2 class="mg-game-title">🎒 どうぐ</h2>
      <span class="mkm-gold">💰 ${fmtNum(d.gold)}</span>
    </div>
    <div class="mkm-bag" id="mkm-bag-list"></div>
  `;
  const list = document.getElementById('mkm-bag-list');
  if (owned.length === 0) {
    list.innerHTML = '<p class="mkm-empty">どうぐを もっていない</p>';
  } else {
    owned.forEach(([id, n]) => {
      const m = getItem(id);
      const el = document.createElement('div');
      el.className = 'mkm-bag-item';
      el.innerHTML = `
        <span class="mkm-bag-icon">${m.icon}</span>
        <div class="mkm-bag-info">
          <div class="mkm-bag-name">${escHtml(m.name)} <small>×${n}</small></div>
          <div class="mkm-bag-desc">${escHtml(m.desc)}</div>
        </div>
      `;
      list.appendChild(el);
    });
  }
  document.getElementById('mokumon-back-btn').onclick = enterVillage;
}

// ========================================
// ショップ
// ========================================

// 販売リスト（藻屑商店）
const SHOP_LIST = [
  'item_herb_s', 'item_herb_m', 'item_herb_l',
  'item_ether_s', 'item_cure', 'item_revive',
  'item_onigiri', 'item_bento', 'item_gozen', 'item_course',
];

let _shopTab = 'buy'; // 'buy' | 'sell'

function renderShop() {
  const d = data();
  root().innerHTML = `
    <div class="mg-game-header">
      <button id="mokumon-back-btn" class="mg-back-btn">‹ 戻る</button>
      <h2 class="mg-game-title">🛒 藻屑商店</h2>
      <span class="mkm-gold" id="mkm-shop-gold">💰 ${fmtNum(d.gold)}</span>
    </div>
    <div class="mkm-shop-tabs">
      <button class="mkm-shop-tab ${_shopTab==='buy'?'mkm-shop-tab--active':''}" id="mkm-tab-buy">🛒 買う</button>
      <button class="mkm-shop-tab ${_shopTab==='sell'?'mkm-shop-tab--active':''}" id="mkm-tab-sell">💴 売る</button>
    </div>
    <div class="mkm-shop" id="mkm-shop-list"></div>
  `;
  renderShopList();
  document.getElementById('mokumon-back-btn').onclick = enterVillage;
  document.getElementById('mkm-tab-buy').onclick  = () => { _shopTab = 'buy';  renderShop(); };
  document.getElementById('mkm-tab-sell').onclick = () => { _shopTab = 'sell'; renderShop(); };
}

function renderShopList() {
  const d = data();
  const list = document.getElementById('mkm-shop-list');
  list.innerHTML = '';

  if (_shopTab === 'buy') {
    SHOP_LIST.forEach(id => {
      const m = getItem(id);
      if (!m || !m.buyable) return;
      const owned = d.items?.[id] ?? 0;
      const afford = d.gold >= m.price;
      const el = document.createElement('div');
      el.className = 'mkm-shop-item';
      el.innerHTML = `
        <span class="mkm-bag-icon">${m.icon}</span>
        <div class="mkm-bag-info">
          <div class="mkm-bag-name">${escHtml(m.name)} ${owned > 0 ? `<small>（所持${owned}）</small>` : ''}</div>
          <div class="mkm-bag-desc">${escHtml(m.desc)}</div>
        </div>
        <button class="mkm-shop-buy ${afford ? '' : 'mkm-shop-ng'}" ${afford ? '' : 'disabled'}>
          💰${fmtNum(m.price)}
        </button>
      `;
      el.querySelector('.mkm-shop-buy').onclick = () => buyItem(id);
      list.appendChild(el);
    });
    if (list.children.length === 0) list.innerHTML = '<p class="mkm-empty">商品がありません</p>';

  } else {
    // 売るタブ：所持アイテムを一覧
    const items = Object.entries(d.items || {}).filter(([id, qty]) => qty > 0 && getItem(id)?.sell);
    if (items.length === 0) {
      list.innerHTML = '<p class="mkm-empty">売れるアイテムがありません</p>';
      return;
    }
    items.forEach(([id, qty]) => {
      const m = getItem(id);
      if (!m) return;
      const el = document.createElement('div');
      el.className = 'mkm-shop-item';
      el.innerHTML = `
        <span class="mkm-bag-icon">${m.icon}</span>
        <div class="mkm-bag-info">
          <div class="mkm-bag-name">${escHtml(m.name)} <small>×${qty}</small></div>
          <div class="mkm-bag-desc">${escHtml(m.desc)}</div>
        </div>
        <button class="mkm-shop-buy">
          💴${fmtNum(m.sell)}
        </button>
      `;
      el.querySelector('.mkm-shop-buy').onclick = () => sellItem(id);
      list.appendChild(el);
    });
  }
}

function buyItem(id) {
  const d = data();
  const m = getItem(id);
  if (!m) return;
  if (d.gold < m.price) { toast('ゴールドが足りません'); return; }
  d.gold -= m.price;
  addItem(id, 1);
  save(); sfx('gold');
  toast(`${m.name} を 購入した！`);
  const goldEl = document.getElementById('mkm-shop-gold');
  if (goldEl) goldEl.textContent = `💰 ${fmtNum(d.gold)}`;
  renderShopList();
}

function sellItem(id) {
  const d = data();
  const m = getItem(id);
  if (!m || !m.sell) return;
  if ((d.items?.[id] ?? 0) <= 0) { toast('持っていません'); return; }
  d.gold += m.sell;
  addItem(id, -1);
  save(); sfx('gold');
  toast(`${m.name} を ${fmtNum(m.sell)}G で売った！`);
  const goldEl = document.getElementById('mkm-shop-gold');
  if (goldEl) goldEl.textContent = `💰 ${fmtNum(d.gold)}`;
  renderShopList();
}

// ========================================
// デバッグ機能（localhost / ?mkmdebug のみ）
// ========================================

function isDebug() {
  const h = location.hostname;
  return h === 'localhost' || h === '127.0.0.1' || location.search.includes('mkmdebug');
}

function renderDebug(from = 'village') {
  root().innerHTML = `
    <div class="mg-game-header">
      <button id="mokumon-back-btn" class="mg-back-btn">‹ 戻る</button>
      <h2 class="mg-game-title">🛠️ デバッグ</h2>
      <span class="mkm-gold">💰 ${fmtNum(data().gold)}</span>
    </div>
    <p class="mkm-field-note">テスト用機能（ローカルのみ表示）</p>
    <div class="mkm-debug-list">
      <button class="mkm-debug-item" data-act="gold">💰 ゴールド +100,000</button>
      <button class="mkm-debug-item" data-act="allmon">🧪 全モンスターを1体ずつ入手（40体）</button>
      <button class="mkm-debug-item" data-act="fusetest">⚗️ No.1〜20を2匹ずつ入手（配合テスト）</button>
      <button class="mkm-debug-item" data-act="dupe">👥 パーティ先頭をコピー（配合用）</button>
      <button class="mkm-debug-item" data-act="lv">⭐ パーティ全員 Lv+10</button>
      <button class="mkm-debug-item" data-act="items">🎁 全アイテム ×10 入手</button>
      <button class="mkm-debug-item" data-act="filldex">📖 図鑑を全部うめる（全部発見済み）</button>
      <button class="mkm-debug-item" data-act="fxgallery">🎬 エフェクト確認モード</button>
      <button class="mkm-debug-item" data-act="skillgallery">🧪 スキル確認モード（技→演出）</button>
      <button class="mkm-debug-item" data-act="unlockareas">🗺️ 全エリア解放</button>
      <button class="mkm-debug-item" data-act="heal">❤️ パーティ全回復（マップHP）</button>
      <button class="mkm-debug-item mkm-debug-danger" data-act="reset">🗑️ セーブをリセット</button>
    </div>
  `;
  document.querySelectorAll('.mkm-debug-item').forEach(b => {
    b.onclick = () => debugAction(b.dataset.act);
  });
  document.getElementById('mokumon-back-btn').onclick = from === 'title' ? renderTitle : enterVillage;
}

function debugAction(act) {
  const d = data();
  switch (act) {
    case 'gold':
      d.gold += 100000;
      sfx('gold'); toast('ゴールド +100,000');
      break;
    case 'allmon': {
      let n = 0;
      MASTER.monsters.forEach(m => {
        const id = uuid();
        d.monsters[id] = {
          instanceId: id, monsterId: m.monsterId, nickname: '',
          level: 1, exp: 0, fusionValue: 0, mutationType: 'none',
          skills: (m.skills ?? []).filter(s => s.level <= 1).map(s => s.skillId).slice(0, 8),
          traits: m.traits ?? [], isFavorite: false,
        };
        if (d.monsters[id].skills.length === 0) d.monsters[id].skills = ['skill_attack'];
        registerDex(m.monsterId, true);
        n++;
      });
      sfx('scoutOk'); toast(`${n}体を入手した！`);
      break;
    }
    case 'fusetest': {
      let n = 0;
      for (let mid = 1; mid <= 20; mid++) {
        const m = getMonsterMaster(mid);
        if (!m) continue;
        for (let k = 0; k < 2; k++) {
          const id = uuid();
          d.monsters[id] = {
            instanceId: id, monsterId: mid, nickname: '',
            level: 5, exp: 0, fusionValue: 0, mutationType: 'none',
            skills: (m.skills ?? []).filter(s => s.level <= 5).map(s => s.skillId).slice(0, 8),
            traits: m.traits ?? [], isFavorite: false,
          };
          if (d.monsters[id].skills.length === 0) d.monsters[id].skills = ['skill_attack'];
          registerDex(mid, true);
          n++;
        }
      }
      sfx('scoutOk'); toast(`No.1〜20を2匹ずつ（${n}体）入手！`);
      break;
    }
    case 'dupe': {
      const headId = d.party.find(Boolean);
      if (!headId || !d.monsters[headId]) { toast('パーティにモンスターがいません'); break; }
      const src = d.monsters[headId];
      const id = uuid();
      d.monsters[id] = { ...src, instanceId: id, isFavorite: false, skills: src.skills.slice(), traits: src.traits.slice() };
      sfx('select'); toast('コピーを牧場に追加');
      break;
    }
    case 'lv': {
      d.party.filter(Boolean).forEach(id => {
        const m = d.monsters[id];
        if (m) m.level = Math.min(99, m.level + 10);
      });
      sfx('levelup'); toast('パーティ Lv+10');
      break;
    }
    case 'items':
      Object.keys(ITEMS).forEach(id => addItem(id, 10));
      sfx('gold'); toast('全アイテム ×10');
      break;
    case 'filldex': {
      let n = 0;
      MASTER.monsters.forEach(m => {
        registerDex(m.monsterId, true);   // seen + owned
        n++;
      });
      sfx('scoutOk'); toast(`図鑑を ${n}体 ぶん うめた！`);
      break;
    }
    case 'fxgallery':
      renderFxGallery();
      return;
    case 'skillgallery':
      renderSkillGallery();
      return;
    case 'unlockareas':
      d.clearedAreas = d.clearedAreas || {};
      AREAS.forEach(a => { d.clearedAreas[a.id] = true; });
      sfx('win'); toast('全エリア解放');
      break;
    case 'heal':
      if (MAP && MAP.hpState) MAP.hpState = {};
      sfx('heal'); toast('HP全回復');
      break;
    case 'reset':
      if (confirm('セーブをリセットします。よろしいですか？')) {
        const gs = _getState();
        gs.mokumon = createInitialData();
        save();
        toast('リセット完了');
        renderTitle();
        return;
      }
      break;
  }
  save();
  renderDebug();
}

// エフェクト確認モード（全エフェクト＋SEを試せる）
const FX_LABEL = {
  slash: '⚔️ 斬撃', impact: '💥 打撃', wind: '🌀 風', fire: '🔥 炎', water: '💧 水',
  ice: '❄️ 氷', thunder: '⚡ 雷', poison: '☠️ 毒', dark: '🌑 闇', light: '✨ 光',
  heal: '🍀 回復', debuff: '🔻 弱体',
  ult_fire: '🔥必殺 火', ult_ice: '❄️必殺 氷', ult_dark: '🌑必殺 闇',
  ult_holy: '🌟必殺 聖', ult_genesis: '🌌必殺 創世',
};
function renderFxGallery() {
  const kinds = Object.keys(FX);
  preloadEffects();
  root().innerHTML = `
    <div class="mg-game-header">
      <button id="mokumon-back-btn" class="mg-back-btn">‹ 戻る</button>
      <h2 class="mg-game-title">🎬 エフェクト確認</h2>
    </div>
    <p class="mkm-field-note">タップで再生（エフェクト＋専用SE）</p>
    <div class="mkm-fx-gallery">
      ${kinds.map(k => `
        <button class="mkm-fx-card" data-kind="${k}">
          <div class="mkm-fx-stage" id="fxprev-${k}"></div>
          <span class="mkm-fx-name">${FX_LABEL[k] ?? k}</span>
        </button>`).join('')}
    </div>
  `;
  document.querySelectorAll('.mkm-fx-card').forEach(btn => {
    btn.onclick = () => {
      const k = btn.dataset.kind;
      const host = document.getElementById('fxprev-' + k);
      host.querySelectorAll('.mkm-fx').forEach(e => e.remove());  // 連打対応
      playSkillEffect('fxprev-' + k, k, k.startsWith('ult_') ? 1 : 2);
    };
  });
  document.getElementById('mokumon-back-btn').onclick = () => renderDebug();
}

// スキル確認モード（技を選ぶと→実際のエフェクト＋SE＋情報）
const ELEM_COLOR = {
  none:'#8a9', fire:'#ff5722', water:'#29b6f6', ice:'#4dd0e1', thunder:'#ffca28',
  poison:'#ab47bc', dark:'#7e57c2', light:'#ffd54f', auto:'#9ccc65',
};
function renderSkillGallery() {
  preloadEffects();
  const skills = (MASTER.skills ?? []).slice().sort((a, b) =>
    (a.element || '').localeCompare(b.element || '') || (a.power || 0) - (b.power || 0));
  const catLabel = { physical:'物理', spell:'呪文', recovery:'回復', support:'補助', ailment:'状態', unique:'固有' };
  root().innerHTML = `
    <div class="mg-game-header">
      <button id="mokumon-back-btn" class="mg-back-btn">‹ 戻る</button>
      <h2 class="mg-game-title">🧪 スキル確認（${skills.length}）</h2>
    </div>
    <p class="mkm-field-note">タップで その技のエフェクト＋SEを再生</p>
    <div class="mkm-fx-gallery mkm-skill-gallery">
      ${skills.map((s, i) => `
        <button class="mkm-fx-card mkm-skill-card" data-i="${i}">
          <div class="mkm-fx-stage" id="skprev-${i}"></div>
          <span class="mkm-skill-gname">${escHtml(s.name)}</span>
          <span class="mkm-skill-gmeta" style="color:${ELEM_COLOR[s.element] ?? '#aaa'}">
            ${catLabel[s.category] ?? s.category}${s.power ? ' / 威'+s.power : ''}${s.mpCost ? ' / MP'+s.mpCost : ''}
          </span>
        </button>`).join('')}
    </div>
  `;
  document.querySelectorAll('.mkm-skill-card').forEach(btn => {
    btn.onclick = () => {
      const s = skills[+btn.dataset.i];
      const host = document.getElementById('skprev-' + btn.dataset.i);
      host.querySelectorAll('.mkm-fx').forEach(e => e.remove());
      const kind = effectKindForSkill(s);
      playSkillEffect('skprev-' + btn.dataset.i, kind, fxCount(s), fxVariant(s));
    };
  });
  document.getElementById('mokumon-back-btn').onclick = () => renderDebug();
}
