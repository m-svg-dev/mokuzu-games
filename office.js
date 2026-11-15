import { openModal } from './modal.js?v=3.4.0';

const MAX_GRADE = 5;

// scale: グレードごとの表示倍率（画像はどれも枠いっぱいに描かれているため、ここで大きさの差を付ける）
export const OFFICE_CATS = [
  { id: 'wall',  name: '壁紙',           icon: '🧱', grades: ['はがれたコンクリ', '白い壁紙', '木目パネル', '大理石', '深海が見えるガラス壁'],
    bonus: { type: 'offlineRate', per: 0.005, label: 'オフライン補填' } },
  { id: 'floor', name: '床',             icon: '🟫', grades: ['むき出しの床', '事務用タイル', 'フローリング', '赤じゅうたん', '金糸のじゅうたん'],
    bonus: { type: 'offlineSec', per: 600, label: 'オフライン上限' } },
  { id: 'chair', name: '社長の椅子',     icon: '🪑', grades: ['パイプ椅子', '事務椅子', '革張りの椅子', '重役チェア', '黄金の玉座'],
    pos: { left: 50, top: 62, width: 19, z: 2 }, scale: [0.8, 0.88, 0.95, 1.05, 1.4],
    bonus: { type: 'mps', per: 0.01, label: 'MPS' } },
  { id: 'desk',  name: '社長の机',       icon: '🗄️', grades: ['みかん箱', '長机', '木の机', '役員デスク', '黒曜石の大デスク'],
    pos: { left: 50, top: 82, width: 30, z: 4 }, scale: [0.6, 0.9, 0.9, 1, 1.05],
    bonus: { type: 'tap', per: 0.02, label: 'タップ力' } },
  { id: 'art',   name: '装飾品（絵画）', icon: '🖼️', grades: ['手描きのポスター', '風景画', '水墨画', '金縁の肖像画', '光る深海の絵'],
    pos: { left: 29, top: 38, width: 17, z: 1 }, scale: [0.8, 0.9, 1, 1.1, 1.25],
    bonus: { type: 'critMult', per: 0.02, label: 'クリティカル倍率' } },
  { id: 'deco',  name: '置物',           icon: '🏆', grades: ['藻の鉢植え', '招き猫', 'トロフィー', '宝石の像', '黄金の社長像'],
    pos: { left: 78, top: 75, width: 14, z: 3 }, scale: [0.75, 0.85, 0.95, 1.05, 1.3],
    bonus: { type: 'profit', per: 0.03, label: '子会社の利益' } },
];

const PRICES = [null, { cur: 'moku', amount: 5_000_000 }, { cur: 'moku', amount: 200_000_000 }, { cur: 'mokuCoins', amount: 30 }, { cur: 'prestigeStones', amount: 500 }];
const CUR_LABEL = { moku: '藻', mokuCoins: '藻コイン', prestigeStones: '転生石' };

const RANKS = [
  { at: 6,  name: '倉庫の片すみ',       offlineRate: 0,    mps: 1    },
  { at: 10, name: '小さな事務所',       offlineRate: 0.01, mps: 1    },
  { at: 15, name: 'ちゃんとした社長室', offlineRate: 0.02, mps: 1    },
  { at: 20, name: '役員フロア',         offlineRate: 0.03, mps: 1.02 },
  { at: 25, name: '深海の摩天楼',       offlineRate: 0.04, mps: 1.04 },
  { at: 30, name: '藻屑帝国の玉座',     offlineRate: 0.05, mps: 1.06 },
];

const WALL_STYLE = [
  { base: '#6b7076', line: '#52575d', gap: 40, accent: '#3f4449' },
  { base: '#e8e4d8', line: '#d2ccba', gap: 18, accent: null },
  { base: '#8a5a34', line: '#6b4424', gap: 22, accent: '#a8713f' },
  { base: '#d9dde4', line: '#aab2c0', gap: 46, accent: '#f4f6fa' },
  { base: '#0d4f6e', line: '#3dff7a', gap: 56, accent: '#1a86a8' },
];
const FLOOR_STYLE = [
  { a: '#4a4b50', b: '#434449', size: 34 },
  { a: '#b9bec4', b: '#a3a9b0', size: 24 },
  { a: '#a8743f', b: '#96652f', size: 18 },
  { a: '#a3202c', b: '#8c1823', size: 40 },
  { a: '#7a1220', b: '#d4a52a', size: 30 },
];
// 試練の報酬で手に入る限定の見た目（trial: 対応する試練ID）。looks には文字列のキーで保存する
export const OFFICE_SPECIALS = {
  wall: {
    sp_gold:   { name: '黄金の壁',       trial: 'hadaka',   style: { base: '#c9992a', line: '#f7dc7a', gap: 30, accent: '#8a6412' } },
    sp_neon:   { name: 'サイバーネオン', trial: 'noTap',    style: { base: '#0a0420', line: '#ff3df2', gap: 34, accent: '#3df2ff' } },
    sp_lava:   { name: '溶岩の壁',       trial: 'noUp',     style: { base: '#2a0a05', line: '#ff5a1f', gap: 26, accent: '#ffb347' } },
    sp_sakura: { name: '夜桜',           trial: 'seal',     style: { base: '#2b1230', line: '#3a1a40', gap: 52, accent: null,
      deco: '<circle cx="12" cy="10" r="4" fill="#ff9ecb"/><circle cx="36" cy="30" r="3" fill="#ffc4de"/><circle cx="22" cy="44" r="2.5" fill="#ff7fb8"/><circle cx="44" cy="8" r="2" fill="#ffd9ea"/>' } },
    sp_star:   { name: '満天の星空',     trial: 'hell',     style: { base: '#070b24', line: '#0b1136', gap: 60, accent: null,
      deco: '<circle cx="10" cy="12" r="1.6" fill="#fff"/><circle cx="34" cy="6" r="1" fill="#cfe3ff"/><circle cx="50" cy="26" r="2" fill="#fff6c9"/><circle cx="22" cy="38" r="1.2" fill="#fff"/><circle cx="44" cy="50" r="1.5" fill="#bcd4ff"/><circle cx="8" cy="52" r="1" fill="#fff"/>' } },
  },
  floor: {
    sp_tatami: { name: '畳',             trial: 'noMps',    style: { a: '#9aa86a', b: '#8a9a5b', size: 44 } },
    sp_ice:    { name: '氷の床',         trial: 'noFac',    style: { a: '#bfe9ff', b: '#e6f7ff', size: 36 } },
    sp_grid:   { name: 'ネオングリッド', trial: 'baito',    style: { a: '#05060f', b: '#123a66', size: 16 } },
    sp_magma:  { name: 'マグマの床',     trial: 'recess',   style: { a: '#3a0d06', b: '#c2330f', size: 22 } },
    sp_goldfl: { name: '黄金タイル',     trial: 'speed',    style: { a: '#d4a52a', b: '#f2cf63', size: 26 } },
  },
};

const BOSS_LINES = ['藻は裏切らない。', '今日も増殖だ。', 'この部屋、だいぶ良くなってきたな。', '子会社の報告はまだか？', '転生しても、この椅子は私のものだ。'];

let deps = null;
let lastRoomSignature = '';
let lastListSignature = '';
let bubbleTimer = null;

function gradeOf(state, catId) {
  const g = Math.floor(Number(state.office?.grades?.[catId])) || 1;
  return Math.min(MAX_GRADE, Math.max(1, g));
}

function lookOf(state, catId) {
  const g = gradeOf(state, catId);
  return Math.min(g, Math.max(1, Math.floor(Number(state.office?.looks?.[catId])) || g));
}

function specialOf(state, catId) {
  const key = state.office?.looks?.[catId];
  const table = OFFICE_SPECIALS[catId];
  if (typeof key !== 'string' || !table || !Object.hasOwn(table, key)) return null;
  return state.challenge?.cleared?.[table[key].trial] != null ? { key, ...table[key] } : null;
}

function totalGrade(state) {
  return OFFICE_CATS.reduce((sum, c) => sum + gradeOf(state, c.id), 0);
}

export const getOfficeTotal = totalGrade;

function rankIndex(state) {
  return RANKS.findLastIndex(r => totalGrade(state) >= r.at);
}

const ADDITIVE_TYPES = ['offlineRate', 'offlineSec'];

export function getOfficeBonus(state, type) {
  const rank = RANKS[rankIndex(state)][type];
  const items = OFFICE_CATS.reduce((sum, c) => sum + (c.bonus.type === type ? c.bonus.per * (gradeOf(state, c.id) - 1) : 0), 0);
  return ADDITIVE_TYPES.includes(type) ? (rank ?? 0) + items : (rank ?? 1) * (1 + items);
}

function itemBonusText(cat, g) {
  if (g <= 1) return 'なし';
  const v = cat.bonus.per * (g - 1);
  return cat.bonus.type === 'offlineSec' ? `+${v / 60}分` : `+${Math.round(v * 1000) / 10}%`;
}

function bonusText(rank) {
  const parts = [];
  if (rank.offlineRate) parts.push(`オフライン補填 +${Math.round(rank.offlineRate * 100)}%`);
  if (rank.mps > 1)     parts.push(`MPS +${Math.round((rank.mps - 1) * 100)}%`);
  return parts.length ? parts.join(' ／ ') : 'ボーナスなし';
}

function wallPattern(id, matrix, st) {
  const accent = st.accent ? `<rect x="0" y="${st.gap * 0.45}" width="${st.gap}" height="3" fill="${st.accent}" opacity=".7"/>` : '';
  return `<pattern id="${id}" width="${st.gap}" height="${st.gap}" patternUnits="userSpaceOnUse" patternTransform="${matrix}">
    <rect width="${st.gap}" height="${st.gap}" fill="${st.base}"/><rect x="0" y="0" width="2" height="${st.gap}" fill="${st.line}"/>${accent}${st.deco ?? ''}</pattern>`;
}

function patternDefs(state, sfx) {
  const w = specialOf(state, 'wall')?.style ?? WALL_STYLE[lookOf(state, 'wall') - 1];
  const f = specialOf(state, 'floor')?.style ?? FLOOR_STYLE[lookOf(state, 'floor') - 1];
  const s = f.size;
  return wallPattern(`office-wall-l${sfx}`, 'matrix(1 -0.5 0 1 30 235)', w) +
    wallPattern(`office-wall-r${sfx}`, 'matrix(1 0.5 0 1 200 150)', w) +
    `<pattern id="office-floor${sfx}" width="${s * 2}" height="${s * 2}" patternUnits="userSpaceOnUse" patternTransform="matrix(1 0.5 -1 0.5 200 150)">
       <rect width="${s * 2}" height="${s * 2}" fill="${f.a}"/><rect width="${s}" height="${s}" fill="${f.b}"/><rect x="${s}" y="${s}" width="${s}" height="${s}" fill="${f.b}"/></pattern>`;
}

function viewerRoomHTML(state, bossSrc) {
  const items = OFFICE_CATS.filter(c => c.pos).map(c => {
    const g = lookOf(state, c.id);
    return `<div class="office-item office-item-${c.id}" style="left:${c.pos.left}%;top:${c.pos.top}%;z-index:${c.pos.z};width:${c.pos.width * c.scale[g - 1]}%"><img src="assets/office/${c.id}_${g}.png" alt="${c.grades[g - 1]}"></div>`;
  }).join('');
  return `<div class="office-room">
    <svg viewBox="0 0 400 340" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>${patternDefs(state, '-view')}</defs>
      <polygon points="30,235 200,150 200,40 30,125" fill="url(#office-wall-l-view)"/>
      <polygon points="200,150 370,235 370,125 200,40" fill="url(#office-wall-r-view)"/>
      <polygon points="200,150 370,235 370,125 200,40" fill="#000" opacity=".22"/>
      <polygon points="200,150 370,235 200,320 30,235" fill="url(#office-floor-view)"/>
      <polyline points="30,125 200,40 370,125" fill="none" stroke="#ffffff55" stroke-width="2"/>
      <line x1="200" y1="40" x2="200" y2="150" stroke="#00000066" stroke-width="2"/>
      <polyline points="30,235 200,150 370,235" fill="none" stroke="#00000066" stroke-width="3"/>
      <polygon points="200,150 370,235 200,320 30,235" fill="none" stroke="#0b1622" stroke-width="3"/>
    </svg>
    <div class="office-items">${items}</div>
    ${bossSrc ? `<div class="office-boss"><img src="${bossSrc}" alt="社長"></div>` : ''}
  </div>`;
}

// office: 他プレイヤーのセーブデータから取り出した値（無い場合は未公開として初期状態を表示）
export function openRoomViewer({ name, headHTML = '', save, bossSrc }) {
  const office = save?.office;
  const state = { office, challenge: save?.challenge };
  const ri = rankIndex(state);
  const note = office ? '' : '<p class="office-view-note">この社長はまだ社長室を公開していません（v3.2.0以降でクラウドセーブすると表示されます）</p>';
  openModal(`${name} の社長室`, `${headHTML}${viewerRoomHTML(state, bossSrc)}
    <div class="office-view-rank"><span class="office-rank-name">${RANKS[ri].name}</span><span class="office-stars">${'★'.repeat(ri)}${'☆'.repeat(RANKS.length - 1 - ri)}</span></div>
    <div class="office-sub">グレード合計 ${totalGrade(state)} / ${OFFICE_CATS.length * MAX_GRADE}</div>${note}`);
}

function drawRoom(state, popId) {
  document.getElementById('office-defs').innerHTML = patternDefs(state, '');

  for (const cat of OFFICE_CATS) {
    if (!cat.pos) continue;
    const el = document.getElementById(`office-item-${cat.id}`);
    const g = lookOf(state, cat.id);
    el.style.width = `${cat.pos.width * cat.scale[g - 1]}%`;
    el.classList.toggle('pop', popId === cat.id);
    const src = `assets/office/${cat.id}_${g}.png`;
    if (el.dataset.src === src) continue;
    el.dataset.src = src;
    const img = new Image();
    img.alt = cat.grades[g - 1];
    img.onload = () => { if (el.dataset.src === src) el.replaceChildren(img); };
    img.onerror = () => { if (el.dataset.src === src) el.innerHTML = `<div class="office-ph">${cat.icon}</div>`; };
    img.src = src;
  }

  const boss = document.getElementById('office-boss-img');
  const bossSrc = deps.getBossSrc();
  if (bossSrc && boss.getAttribute('src') !== bossSrc) boss.src = bossSrc;
}

function say(text) {
  const bubble = document.getElementById('office-bubble');
  bubble.textContent = text;
  bubble.classList.add('show');
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => bubble.classList.remove('show'), 1800);
}

function upgrade(catId) {
  const state = deps.getState();
  const cat = OFFICE_CATS.find(c => c.id === catId);
  const g = gradeOf(state, catId);
  const price = PRICES[g];
  if (!cat || !price || (state[price.cur] ?? 0) < price.amount) return;
  const rankBefore = rankIndex(state);
  state[price.cur] -= price.amount;
  state.office ??= { grades: {} };
  state.office.grades ??= {};
  state.office.grades[catId] = g + 1;
  if (state.office.looks) delete state.office.looks[catId];
  const rankAfter = rankIndex(state);
  deps.playSound(rankAfter > rankBefore ? 'combo' : 'levelup', { tier: rankAfter });
  deps.onChange();
  renderOffice(true, catId);
  say(rankAfter > rankBefore ? `部屋が「${RANKS[rankAfter].name}」になった！` : `${cat.grades[g]}、悪くない。`);
}

function setLook(catId, look) {
  const state = deps.getState();
  state.office ??= { grades: {} };
  state.office.looks ??= {};
  if (typeof look === 'string') {
    const sp = OFFICE_SPECIALS[catId]?.[look];
    if (!sp || state.challenge?.cleared?.[sp.trial] == null) return;
  } else if (!(look >= 1 && look <= gradeOf(state, catId))) {
    return;
  }
  if (state.office.looks[catId] === look) return;
  state.office.looks[catId] = look;
  deps.onChange();
  renderOffice(true, catId);
}

export function renderOffice(force = false, popId = null) {
  if (!deps || !document.getElementById('tab-office')?.classList.contains('active')) return;
  const state = deps.getState();

  const roomSignature = JSON.stringify([OFFICE_CATS.map(c => specialOf(state, c.id)?.key ?? lookOf(state, c.id)), deps.getBossSrc()]);
  if (force || roomSignature !== lastRoomSignature) {
    lastRoomSignature = roomSignature;
    drawRoom(state, popId);
  }

  const listSignature = JSON.stringify(OFFICE_CATS.map(c => {
    const g = gradeOf(state, c.id);
    const price = PRICES[g];
    return [g, specialOf(state, c.id)?.key ?? lookOf(state, c.id), Object.keys(state.challenge?.cleared ?? {}).length, price ? (state[price.cur] ?? 0) >= price.amount : null];
  }));
  if (!force && listSignature === lastListSignature) return;
  lastListSignature = listSignature;

  const total = totalGrade(state);
  const ri = rankIndex(state);
  const rank = RANKS[ri];
  const next = RANKS[ri + 1];
  document.getElementById('office-rank').innerHTML = `
    <div class="office-rank-row"><span class="office-rank-name">${rank.name}</span><span class="office-stars">${'★'.repeat(ri)}${'☆'.repeat(RANKS.length - 1 - ri)}</span></div>
    <div class="office-gauge"><div style="width:${next ? (total - rank.at) / (next.at - rank.at) * 100 : 100}%"></div></div>
    <div class="office-sub">グレード合計 ${total} / ${OFFICE_CATS.length * MAX_GRADE}${next ? `（次のランクまで あと ${next.at - total}）` : '（最高ランク）'}</div>
    <div class="office-bonus">ランクボーナス: ${bonusText(rank)}</div>`;

  document.getElementById('office-list').innerHTML = OFFICE_CATS.map(c => {
    const g = gradeOf(state, c.id);
    const price = PRICES[g];
    const can = price && (state[price.cur] ?? 0) >= price.amount;
    const look = lookOf(state, c.id);
    const sp = specialOf(state, c.id);
    const dots = Array.from({ length: MAX_GRADE }, (_, i) =>
      `<button class="office-look${i < g ? ' own' : ''}${!sp && i + 1 === look ? ' sel' : ''}" data-id="${c.id}" data-g="${i + 1}" title="${c.grades[i]}" ${i < g ? '' : 'disabled'}>${i < g ? i + 1 : '🔒'}</button>`).join('') +
      Object.entries(OFFICE_SPECIALS[c.id] ?? {}).filter(([, v]) => state.challenge?.cleared?.[v.trial] != null).map(([key, v]) =>
        `<button class="office-look own special${sp?.key === key ? ' sel' : ''}" data-id="${c.id}" data-sp="${key}" title="${v.name}">★</button>`).join('');
    const showing = sp ? `${sp.name}（試練の報酬）` : look !== g ? c.grades[look - 1] : '';
    const btn = price
      ? `<button class="office-up${can ? ' can-buy' : ''}" data-id="${c.id}" ${can ? '' : 'disabled'}>グレードアップ<small>${CUR_LABEL[price.cur]} ${deps.fmt(price.amount)}</small></button>`
      : `<button class="office-up max" disabled>最高グレード</button>`;
    return `<div class="office-row"><div class="office-ico">${c.icon}</div><div class="office-info"><div class="office-nm">${c.name}</div>
      <div class="office-gr">G${g}　${c.grades[g - 1]}${price ? ` → ${c.grades[g]}` : ''}</div>
      <div class="office-fx">${c.bonus.label} ${itemBonusText(c, g)}${price ? ` → ${itemBonusText(c, g + 1)}` : ''}</div>
      <div class="office-dots"><span>見た目</span>${dots}</div>${showing ? `<div class="office-look-nm">${showing} を表示中</div>` : ''}</div>${btn}</div>`;
  }).join('');
}

export function initOffice(d) {
  deps = d;
  const room = document.getElementById('office-items');
  if (!room) return;
  room.innerHTML = OFFICE_CATS.filter(c => c.pos).map(c =>
    `<div class="office-item" id="office-item-${c.id}" style="left:${c.pos.left}%;top:${c.pos.top}%;z-index:${c.pos.z}"></div>`).join('');
  document.getElementById('office-list').addEventListener('click', e => {
    const btn = e.target.closest('.office-up');
    if (btn && !btn.disabled) upgrade(btn.dataset.id);
    const look = e.target.closest('.office-look');
    if (look && !look.disabled) setLook(look.dataset.id, look.dataset.sp ?? Number(look.dataset.g));
  });
  document.getElementById('office-boss').addEventListener('click', () => say(BOSS_LINES[Math.floor(Math.random() * BOSS_LINES.length)]));
}
