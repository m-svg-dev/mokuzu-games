export const SUBSIDIARY_UNLOCK_PRESTIGE = 3;
export const DISPATCH_MIN_COUNT = 10;
const MAX_LV = 30;
const LV_COST_MULT = 1.3;

export const SUBSIDIARIES = [
  { id: 'suisan',  name: '藻屑水産',         icon: '🐟', reqPrestige: 3,  foundCost: 10_000_000,     effect: 'mps',        perLv: 0.05, profitPerLv: 2, baseCost: 30  },
  { id: 'entame',  name: '藻屑エンタメ',     icon: '🎤', reqPrestige: 5,  foundCost: 100_000_000,    effect: 'tap',        perLv: 0.05, profitPerLv: 3, baseCost: 60  },
  { id: 'fudosan', name: '藻屑不動産',       icon: '🏠', reqPrestige: 10, foundCost: 1_000_000_000,  effect: 'offlineSec', perLv: 600,  profitPerLv: 5, baseCost: 120 },
  { id: 'finance', name: '藻屑ファイナンス', icon: '🏦', reqPrestige: 20, foundCost: 10_000_000_000, effect: 'stoneCap',   perLv: 0.01, profitPerLv: 8, baseCost: 240 },
];

const DISPATCH_BONUS = { algae: 0.1, jellyfish: 0.2, crab: 0.3, coral: 0.4, shark: 0.5 };

let deps = null;
let picker = null;
let lastSignature = '';

const companiesOf = state => state.subsidiary?.companies ?? {};

export function getSubsidiaryBonus(state, type) {
  let value = type === 'offlineSec' ? 0 : 1;
  const companies = companiesOf(state);
  for (const c of SUBSIDIARIES) {
    if (c.effect === type) value += c.perLv * (companies[c.id]?.lv ?? 0);
  }
  return value;
}

function isDispatched(state, empId) {
  return Object.values(companiesOf(state)).some(c => (c.dispatched ?? []).includes(empId));
}

export function isDispatchActive(state, empId) {
  return isDispatched(state, empId) && (state.employees?.[empId] ?? 0) >= DISPATCH_MIN_COUNT;
}

function slotCount(lv) {
  return lv >= 20 ? 3 : lv >= 10 ? 2 : 1;
}

function levelCost(def, lv) {
  return Math.floor(def.baseCost * Math.pow(LV_COST_MULT, lv - 1));
}

function profitPerMin(state, def) {
  const company = companiesOf(state)[def.id];
  if (!company) return 0;
  let bonus = 0;
  for (const empId of company.dispatched ?? []) {
    if (isDispatchActive(state, empId)) bonus += DISPATCH_BONUS[empId] ?? 0;
  }
  return def.profitPerLv * company.lv * (1 + bonus);
}

function totalProfitPerMin(state) {
  return SUBSIDIARIES.reduce((sum, def) => sum + profitPerMin(state, def), 0);
}

export function tickSubsidiary(state, sec) {
  if (!state.subsidiary) return 0;
  const gained = totalProfitPerMin(state) / 60 * sec;
  state.subsidiary.profit = (state.subsidiary.profit ?? 0) + gained;
  return gained;
}

function effectText(def, lv) {
  switch (def.effect) {
    case 'mps':        return `本社MPS +${Math.round(def.perLv * lv * 100)}%`;
    case 'tap':        return `タップ +${Math.round(def.perLv * lv * 100)}%`;
    case 'offlineSec': return `オフライン上限 +${def.perLv * lv / 60}分`;
    case 'stoneCap':   return `転生石上限 +${Math.round(def.perLv * lv * 100)}%`;
  }
  return '';
}

function ensureState(state) {
  state.subsidiary ??= { profit: 0, companies: {} };
  state.subsidiary.companies ??= {};
  return state.subsidiary;
}

function found(defId) {
  const state = deps.getState();
  const def = SUBSIDIARIES.find(c => c.id === defId);
  const sub = ensureState(state);
  if (!def || sub.companies[def.id]) return;
  if ((state.prestigeLevel ?? 0) < def.reqPrestige || state.moku < def.foundCost) return;
  state.moku -= def.foundCost;
  sub.companies[def.id] = { lv: 1, dispatched: [] };
  deps.playSound('levelup');
  deps.onChange();
}

function levelUp(defId) {
  const state = deps.getState();
  const def = SUBSIDIARIES.find(c => c.id === defId);
  const company = companiesOf(state)[defId];
  if (!def || !company || company.lv >= MAX_LV) return;
  const cost = levelCost(def, company.lv);
  if (state.subsidiary.profit < cost) return;
  state.subsidiary.profit -= cost;
  company.lv += 1;
  deps.playSound('buy');
  deps.onChange();
}

function setDispatch(defId, slot, empId) {
  const state = deps.getState();
  const company = companiesOf(state)[defId];
  if (!company) return;
  company.dispatched ??= [];
  if (empId === null) {
    company.dispatched.splice(slot, 1);
  } else {
    if (isDispatched(state, empId)) return;
    if ((state.employees?.[empId] ?? 0) < DISPATCH_MIN_COUNT) return;
    if (slot < company.dispatched.length) company.dispatched[slot] = empId;
    else company.dispatched.push(empId);
    deps.playSound('buy');
  }
  picker = null;
  deps.onChange();
}

function cardHtml(state, def) {
  const company = companiesOf(state)[def.id];
  if (!company) {
    const prestigeOk = (state.prestigeLevel ?? 0) >= def.reqPrestige;
    const canFound = prestigeOk && state.moku >= def.foundCost;
    return `
      <div class="sub-card sub-locked">
        <div class="sub-head">
          <span class="sub-icon">${def.icon}</span>
          <div class="sub-title"><div class="sub-name">${def.name}</div>
          <div class="sub-effect">Lvごとに ${effectText(def, 1)}</div></div>
          <span class="sub-lv">🔒</span>
        </div>
        <div class="sub-cond">設立条件: <span class="${prestigeOk ? 'ok' : 'ng'}">転生${def.reqPrestige}回</span> ＋ <span class="${state.moku >= def.foundCost ? 'ok' : 'ng'}">藻 ${deps.fmt(def.foundCost)}</span></div>
        <button class="sub-btn${canFound ? ' can-buy' : ''}" data-act="found" data-id="${def.id}" ${canFound ? '' : 'disabled'}>設立する</button>
      </div>`;
  }

  const lv = company.lv;
  const slots = slotCount(lv);
  const dispatched = company.dispatched ?? [];
  let chips = '';
  for (let i = 0; i < slots; i++) {
    const emp = deps.employees.find(e => e.id === dispatched[i]);
    if (emp) {
      const active = isDispatchActive(state, emp.id);
      chips += `<button class="sub-chip${active ? '' : ' resting'}" data-act="pick" data-id="${def.id}" data-slot="${i}">${emp.icon} ${emp.name}${active ? '' : '（休職中）'}</button>`;
    } else {
      chips += `<button class="sub-chip empty" data-act="pick" data-id="${def.id}" data-slot="${Math.min(i, dispatched.length)}">＋ 出向させる</button>`;
    }
  }
  const nextSlot = lv < 10 ? 'Lv10で出向枠+1' : lv < 20 ? 'Lv20で出向枠+1' : '';

  let pickerHtml = '';
  if (picker?.id === def.id) {
    const current = dispatched[picker.slot];
    const rows = deps.employees.map(emp => {
      const count = state.employees?.[emp.id] ?? 0;
      const bonus = Math.round((DISPATCH_BONUS[emp.id] ?? 0) * 100);
      if (emp.id === current) {
        return `<button class="sub-pick-row selected" data-act="clear" data-id="${def.id}" data-slot="${picker.slot}">${emp.icon} ${emp.name}<span>出向を解除</span></button>`;
      }
      const elsewhere = isDispatched(state, emp.id);
      const short = count < DISPATCH_MIN_COUNT;
      const note = elsewhere ? '他社に出向中' : short ? `${DISPATCH_MIN_COUNT}体必要（所持${count}体）` : `利益 +${bonus}%`;
      return `<button class="sub-pick-row" data-act="assign" data-id="${def.id}" data-slot="${picker.slot}" data-emp="${emp.id}" ${elsewhere || short ? 'disabled' : ''}>${emp.icon} ${emp.name}<span>${note}</span></button>`;
    }).join('');
    pickerHtml = `<div class="sub-picker"><p class="sub-picker-note">出向中は、その社員の本社MPSが半分になります</p>${rows}</div>`;
  }

  const maxed = lv >= MAX_LV;
  const cost = levelCost(def, lv);
  const canUp = !maxed && state.subsidiary.profit >= cost;
  return `
    <div class="sub-card">
      <div class="sub-head">
        <span class="sub-icon">${def.icon}</span>
        <div class="sub-title"><div class="sub-name">${def.name}</div>
        <div class="sub-effect">${effectText(def, lv)}　💴 +${deps.fmt(profitPerMin(state, def))}/分</div></div>
        <span class="sub-lv">Lv.${lv}</span>
      </div>
      <div class="sub-dispatch"><span class="sub-dispatch-label">出向</span>${chips}</div>
      ${nextSlot ? `<div class="sub-next-slot">${nextSlot}</div>` : ''}
      ${pickerHtml}
      <button class="sub-btn${canUp ? ' can-buy' : ''}" data-act="levelup" data-id="${def.id}" ${canUp ? '' : 'disabled'}>${maxed ? 'Lv MAX' : `Lvアップ　💴 ${deps.fmt(cost)}`}</button>
    </div>`;
}

export function renderSubsidiary(force = false) {
  if (!deps) return;
  const root = document.getElementById('subsidiary-root');
  if (!root || !document.getElementById('tab-subsidiary')?.classList.contains('active')) return;
  const state = deps.getState();

  if ((state.prestigeLevel ?? 0) < SUBSIDIARY_UNLOCK_PRESTIGE) {
    const signature = `locked:${state.prestigeLevel ?? 0}`;
    if (signature === lastSignature && !force) return;
    lastSignature = signature;
    root.innerHTML = `<div class="sub-gate">🔒 転生${SUBSIDIARY_UNLOCK_PRESTIGE}回で解放<br><span>あと転生${SUBSIDIARY_UNLOCK_PRESTIGE - (state.prestigeLevel ?? 0)}回</span></div>`;
    return;
  }

  const sub = ensureState(state);
  const profitEl = document.getElementById('subsidiary-profit');
  if (profitEl) profitEl.textContent = `💴 利益 ${deps.fmt(sub.profit)}　（+${deps.fmt(totalProfitPerMin(state))} / 分）`;

  const signature = JSON.stringify([
    sub.companies, picker, state.prestigeLevel,
    SUBSIDIARIES.map(def => {
      const company = sub.companies[def.id];
      return company ? sub.profit >= levelCost(def, company.lv) : state.moku >= def.foundCost;
    }),
    deps.employees.map(emp => (state.employees?.[emp.id] ?? 0) >= DISPATCH_MIN_COUNT),
    Math.floor(totalProfitPerMin(state)),
  ]);
  if (signature === lastSignature && !force) return;
  lastSignature = signature;
  root.innerHTML = SUBSIDIARIES.map(def => cardHtml(state, def)).join('');
}

export function initSubsidiary(d) {
  deps = d;
  const root = document.getElementById('subsidiary-root');
  if (!root) return;
  root.addEventListener('click', e => {
    const btn = e.target.closest('[data-act]');
    if (!btn || btn.disabled) return;
    const { act, id, emp } = btn.dataset;
    const slot = Number(btn.dataset.slot);
    if (act === 'found')   found(id);
    if (act === 'levelup') levelUp(id);
    if (act === 'assign')  setDispatch(id, slot, emp);
    if (act === 'clear')   setDispatch(id, slot, null);
    if (act === 'pick') {
      picker = picker?.id === id && picker.slot === slot ? null : { id, slot };
      renderSubsidiary(true);
    }
  });
}
