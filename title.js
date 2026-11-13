import { openModal } from './modal.js?v=3.3.0';
import { getOfficeTotal } from './office.js?v=3.3.0';
import { SUBSIDIARIES } from './subsidiary.js?v=3.3.0';

const RARITY_ORDER = ['common', 'silver', 'gold', 'rainbow'];
const RARITY_LABEL = { common: '並', silver: '銀', gold: '金', rainbow: '虹' };

export const TITLES = [
  { id: 'prestige_1',   name: '生まれ変わり',         desc: '転生1回',                     rarity: 'common',  check: c => c.prestige >= 1 },
  { id: 'prestige_10',  name: '輪廻の常連',           desc: '転生10回',                    rarity: 'silver',  check: c => c.prestige >= 10 },
  { id: 'prestige_50',  name: '輪廻の達人',           desc: '転生50回',                    rarity: 'gold',    check: c => c.prestige >= 50 },
  { id: 'prestige_100', name: '百回死んだ藻',         desc: '転生100回',                   rarity: 'rainbow', check: c => c.prestige >= 100 },
  { id: 'prestige_200', name: '藻屑の神',             desc: '転生200回',                   rarity: 'rainbow', check: c => c.prestige >= 200 },
  { id: 'moku_t',       name: '藻の成金',             desc: '全転生の累計獲得藻 1T',       rarity: 'common',  check: c => c.lifetime >= 1e12 },
  { id: 'moku_qa',      name: '藻の富豪',             desc: '全転生の累計獲得藻 1Qa',      rarity: 'silver',  check: c => c.lifetime >= 1e15 },
  { id: 'moku_qi',      name: '藻の財閥',             desc: '全転生の累計獲得藻 1Qi',      rarity: 'gold',    check: c => c.lifetime >= 1e18 },
  { id: 'moku_sx',      name: '藻の宇宙',             desc: '全転生の累計獲得藻 1Sx',      rarity: 'rainbow', check: c => c.lifetime >= 1e21 },
  { id: 'sub_1',        name: '起業家',               desc: '子会社を1社設立',             rarity: 'common',  check: c => c.subCount >= 1 },
  { id: 'sub_all',      name: 'グループ会長',         desc: '子会社を4社すべて設立',       rarity: 'silver',  check: c => c.subCount >= SUBSIDIARIES.length },
  { id: 'sub_lv60',     name: '藻屑ホールディングス', desc: '子会社の合計レベル60',        rarity: 'gold',    check: c => c.subLvSum >= 60 },
  { id: 'sub_max',      name: '藻屑コンツェルン',     desc: '子会社4社すべてLv30',         rarity: 'rainbow', check: c => c.subAllMax },
  { id: 'office_15',    name: '模様替え好き',         desc: '部屋ランク「ちゃんとした社長室」', rarity: 'common',  check: c => c.office >= 15 },
  { id: 'office_25',    name: '摩天楼の主',           desc: '部屋ランク「深海の摩天楼」',  rarity: 'gold',    check: c => c.office >= 25 },
  { id: 'office_30',    name: '玉座の主',             desc: '社長室の家具をすべてG5',      rarity: 'rainbow', check: c => c.office >= 30 },
  { id: 'combo_500',    name: '連打の鬼',             desc: '500コンボ',                   rarity: 'silver',  check: c => c.combo >= 500 },
  { id: 'combo_2000',   name: '腱鞘炎',               desc: '2,000コンボ',                 rarity: 'gold',    check: c => c.combo >= 2000 },
  { id: 'pet_all',      name: 'ペット博士',           desc: 'ペットを全種類そろえる',      rarity: 'gold',    check: c => c.petsAll },
  { id: 'skin_all',     name: '着道楽',               desc: 'ガチャのスキンを全種類そろえる', rarity: 'rainbow', check: c => c.skinsAll },
];

let deps = null;

function context(state) {
  const companies = Object.values(state.subsidiary?.companies ?? {});
  return {
    prestige:  state.prestigeLevel ?? 0,
    lifetime:  (state.prestigeHistory ?? []).reduce((sum, e) => sum + (e.totalMoku ?? 0), 0) + (state.totalMoku ?? 0),
    subCount:  companies.length,
    subLvSum:  companies.reduce((sum, c) => sum + (c.lv ?? 0), 0),
    subAllMax: companies.length >= SUBSIDIARIES.length && companies.every(c => (c.lv ?? 0) >= 30),
    office:    getOfficeTotal(state),
    combo:     state.maxCombo ?? 0,
    petsAll:   deps.petTypeIds.every(id => state.ownedPets?.[id]),
    skinsAll:  deps.gachaSkinIds.every(id => (state.ownedSkins ?? []).includes(id)),
  };
}

function titlesOf(state) {
  state.titles ??= { unlocked: [] };
  state.titles.unlocked ??= [];
  return state.titles;
}

export function titleBadgeHTML(id) {
  const t = TITLES.find(x => x.id === id);
  return t ? `<span class="title-badge title-${t.rarity}">${t.name}</span>` : '';
}

function showToast(gained) {
  document.querySelector('.title-toast')?.remove();
  const el = document.createElement('button');
  el.className = 'title-toast';
  el.innerHTML = `<small>🏷️ 称号を獲得！（タップで付け替え）</small>${gained.slice(0, 4).map(t => titleBadgeHTML(t.id)).join('')}${gained.length > 4 ? `<small>ほか${gained.length - 4}個</small>` : ''}`;
  el.addEventListener('click', () => { el.remove(); openTitlePicker(); });
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 6000);
}

export function checkTitles() {
  if (!deps) return;
  const state = deps.getState();
  const titles = titlesOf(state);
  const ctx = context(state);
  const gained = TITLES.filter(t => !titles.unlocked.includes(t.id) && t.check(ctx));
  if (!gained.length) return;
  titles.unlocked.push(...gained.map(t => t.id));
  if (titles.equipped === undefined) {
    titles.equipped = gained.reduce((best, t) => RARITY_ORDER.indexOf(t.rarity) >= RARITY_ORDER.indexOf(best.rarity) ? t : best).id;
  }
  deps.playSound('levelup');
  showToast(gained);
  deps.save();
}

function pickerHTML(state) {
  const titles = titlesOf(state);
  const rows = TITLES.map(t => {
    const owned = titles.unlocked.includes(t.id);
    const on = titles.equipped === t.id;
    return `<button class="title-row${owned ? ' owned' : ''}${on ? ' on' : ''}" data-id="${t.id}" ${owned ? '' : 'disabled'}>
      <span class="title-row-main">${owned ? titleBadgeHTML(t.id) : `<span class="title-badge title-locked">？？？</span>`}<small>${RARITY_LABEL[t.rarity]}｜${t.desc}</small></span>
      <span class="title-row-state">${on ? '使用中' : owned ? '付ける' : '未獲得'}</span></button>`;
  }).join('');
  return `<p class="title-note">獲得 ${titles.unlocked.length} / ${TITLES.length}　付けた称号はランキングと社長室に表示されます。使用中の称号をもう一度押すと外せます。</p>${rows}`;
}

export function openTitlePicker() {
  const state = deps.getState();
  const modal = openModal('🏷️ 称号', pickerHTML(state));
  modal.body.addEventListener('click', e => {
    const row = e.target.closest('.title-row.owned');
    if (!row) return;
    const titles = titlesOf(state);
    titles.equipped = titles.equipped === row.dataset.id ? null : row.dataset.id;
    deps.playSound('buy');
    deps.save();
    modal.body.innerHTML = pickerHTML(state);
  });
}

export function initTitles(d) {
  deps = d;
  document.addEventListener('click', e => {
    if (e.target.closest('.title-open')) openTitlePicker();
  });
}
