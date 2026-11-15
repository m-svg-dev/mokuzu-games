import { OFFICE_SPECIALS } from './office.js?v=3.4.0';
import { openModal } from './modal.js?v=3.4.0';

export const CHALLENGE_UNLOCK_PRESTIGE = 10;
const GOAL = 10_000_000;
const REWARD_STONES = 300;
const BLESSING_PER_CLEAR = 0.02;

// est はシミュレーション（毎秒5タップ・覚醒なし）での目安時間
export const CHALLENGES = [
  { id: 'hadaka', name: '裸一貫',       icon: '🩲', rule: '追加の縛りなし。まずは素の実力で。',                           flags: {}, est: '約25分' },
  { id: 'noTap',  name: '腕組み社長',   icon: '🙅', rule: 'タップしても藻が増えない。開始時に100藻を支給。',               flags: { noTap: true }, startMoku: 100, est: '放置で約80分' },
  { id: 'noMps',  name: 'ワンマン経営', icon: '👆', rule: '自動収益（MPS）が0になる。タップだけで稼ぐ。',                 flags: { noMps: true }, est: '約30分' },
  { id: 'noUp',   name: '緊縮財政',     icon: '✂️', rule: '「強化」が買えない。',                                         flags: { noUpgrade: true }, est: '約70分' },
  { id: 'noFac',  name: '更地',         icon: '🏚️', rule: '「施設」が買えない。',                                         flags: { noFacility: true }, est: '約30分' },
  { id: 'baito',  name: 'バイト帝国',   icon: '🌿', rule: 'タップ無効。雇えるのは小型海藻バイトだけ。開始時に100藻を支給。', flags: { noTap: true, onlyEmployee: 'algae' }, startMoku: 100, est: '放置で約3時間' },
  { id: 'recess', name: '大不況',       icon: '📉', rule: 'タップとMPSの収益が30%になる。',                               flags: { incomeMult: 0.3 }, est: '約90分' },
  { id: 'seal',   name: '封印',         icon: '🔒', rule: '覚醒とクリティカルが使えない。',                               flags: { noAwaken: true, noCrit: true }, est: '約30分' },
  { id: 'speed',  name: '電光石火',     icon: '⚡', rule: '20分以内に達成する。時間切れで失敗。',                         flags: {}, timeLimit: 1200, est: '20分以内' },
  { id: 'hell',   name: '地獄の研修',   icon: '🔥', rule: '強化なし・施設なし・覚醒なし・クリティカルなし。',             flags: { noUpgrade: true, noFacility: true, noAwaken: true, noCrit: true }, est: '約90分' },
];

let deps = null;
let lastSignature = '';

function challengeOf(state) {
  state.challenge ??= { active: null, pending: null, cleared: {} };
  state.challenge.cleared ??= {};
  return state.challenge;
}

export function activeChallenge(state) {
  const id = state.challenge?.active?.id;
  return id ? CHALLENGES.find(c => c.id === id) ?? null : null;
}

export function challengeFlag(state, flag) {
  return activeChallenge(state)?.flags[flag];
}

export function clearedCount(state) {
  return CHALLENGES.filter(c => state.challenge?.cleared?.[c.id] != null).length;
}

export function getChallengeBlessing(state) {
  return 1 + BLESSING_PER_CLEAR * clearedCount(state);
}

// doPrestige のリセット直後に呼ぶ。予約していた試練をここから開始する
export function startPendingChallenge(state) {
  const ch = challengeOf(state);
  const def = CHALLENGES.find(c => c.id === ch.pending);
  ch.active = null;
  ch.pending = null;
  if (!def) return;
  ch.active = { id: def.id, startedAt: Date.now() };
  state.moku = def.startMoku ?? 0;
}

function rewardLook(def) {
  for (const table of Object.values(OFFICE_SPECIALS)) {
    const hit = Object.values(table).find(v => v.trial === def.id);
    if (hit) return hit.name;
  }
  return '';
}

function clock(sec) {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const mm = String(Math.floor(s % 3600 / 60)).padStart(h ? 2 : 1, '0');
  return `${h ? `${h}:` : ''}${mm}:${String(s % 60).padStart(2, '0')}`;
}

function elapsedSec(state) {
  return Math.floor((Date.now() - (state.challenge?.active?.startedAt ?? Date.now())) / 1000);
}

function finish(state, def, sec) {
  const ch = challengeOf(state);
  const prev = ch.cleared[def.id];
  const first = prev == null;
  ch.cleared[def.id] = first ? sec : Math.min(prev, sec);
  ch.active = null;
  if (first) state.prestigeStones = (state.prestigeStones ?? 0) + REWARD_STONES;
  deps.onChange();
  deps.playSound('combo', { tier: 3 });
  const blessing = Math.round((getChallengeBlessing(state) - 1) * 100);
  openModal('🎉 試練クリア！', `
    <div class="ch-result"><div class="ch-result-name">${def.icon} ${def.name}</div><div class="ch-result-time">タイム ${clock(sec)}</div>
    ${first ? `<ul>
      <li>転生石 +${REWARD_STONES}</li>
      <li>社長室の限定の見た目「${rewardLook(def)}」</li>
      <li>試練の加護：タップとMPS +2%（合計 +${blessing}%）</li></ul>`
    : `<p>${sec < prev ? `自己ベスト更新！（前回 ${clock(prev)}）` : `自己ベストは ${clock(prev)} です`}</p>`}
    <p class="ch-note">縛りは解除されました。転生スキルなどの効果が戻っています。</p></div>`);
}

function fail(state, def) {
  challengeOf(state).active = null;
  deps.onChange();
  openModal('⌛ 試練失敗', `<div class="ch-result"><div class="ch-result-name">${def.icon} ${def.name}</div>
    <p>時間切れです。縛りは解除されました。もう一度予約すると、次の転生から挑戦できます。</p></div>`);
}

function renderBanner(state, def) {
  let el = document.getElementById('challenge-banner');
  document.body.classList.toggle('in-challenge', !!def);
  document.body.classList.toggle('ch-no-upgrade', !!def?.flags.noUpgrade);
  document.body.classList.toggle('ch-no-facility', !!def?.flags.noFacility);
  document.body.classList.toggle('ch-only-algae', def?.flags.onlyEmployee === 'algae');
  document.body.classList.toggle('ch-no-awaken', !!def?.flags.noAwaken);
  if (!def) { el?.remove(); return; }
  if (!el) {
    el = document.createElement('button');
    el.id = 'challenge-banner';
    el.addEventListener('click', () => {
      const cur = activeChallenge(deps.getState());
      if (cur) openModal(`${cur.icon} 試練中：${cur.name}`, `<div class="ch-result"><p>${cur.rule}</p>
        <p>目標：この周回の総獲得藻 ${deps.fmt(GOAL)}</p>
        <p class="ch-note">試練中は、転生スキル・スキン・ペット・子会社・社長室・ブーストアイテムの効果が無効です。やめるときは「転生」タブの試練一覧から。</p></div>`);
    });
    document.body.appendChild(el);
  }
  const sec = elapsedSec(state);
  const pct = Math.min(100, (state.totalMoku ?? 0) / GOAL * 100);
  const time = def.timeLimit ? `残り ${clock(def.timeLimit - sec)}` : clock(sec);
  el.style.top = `${document.getElementById('header')?.getBoundingClientRect().bottom ?? 56}px`;
  el.innerHTML = `<span class="ch-banner-fill" style="width:${pct}%"></span><span class="ch-banner-text">${def.icon} 試練「${def.name}」 ${pct.toFixed(1)}%　⏱ ${time}</span>`;
}

export function tickChallenge() {
  if (!deps) return;
  const state = deps.getState();
  const def = activeChallenge(state);
  if (def) {
    const sec = elapsedSec(state);
    if ((state.totalMoku ?? 0) >= GOAL) finish(state, def, sec);
    else if (def.timeLimit && sec > def.timeLimit) fail(state, def);
  }
  renderBanner(state, activeChallenge(state));
  renderChallenge();
}

export function renderChallenge(force = false) {
  const panel = document.getElementById('challenge-panel');
  if (!deps || !panel || !document.getElementById('tab-prestige')?.classList.contains('active')) return;
  const state = deps.getState();
  const ch = challengeOf(state);
  const unlocked = (state.prestigeLevel ?? 0) >= CHALLENGE_UNLOCK_PRESTIGE;
  const signature = JSON.stringify([unlocked, ch.active?.id, ch.pending, ch.cleared]);
  if (!force && signature === lastSignature) return;
  lastSignature = signature;

  if (!unlocked) {
    panel.innerHTML = `<h2 class="panel-title">🔥 社長の試練</h2><p class="section-note">転生${CHALLENGE_UNLOCK_PRESTIGE}回で解放されます（現在 ${state.prestigeLevel ?? 0}回）</p>`;
    return;
  }
  const active = activeChallenge(state);
  const cards = CHALLENGES.map(def => {
    const best = ch.cleared[def.id];
    const isActive = active?.id === def.id;
    const isPending = ch.pending === def.id;
    const btn = isActive ? `<button class="ch-btn danger" data-act="quit">あきらめる</button>`
      : isPending ? `<button class="ch-btn" data-act="cancel">予約を取り消す</button>`
      : `<button class="ch-btn go" data-act="reserve" data-id="${def.id}" ${active ? 'disabled' : ''}>${best != null ? 'もう一度挑戦' : '次の転生で挑戦'}</button>`;
    return `<div class="ch-card${isActive ? ' active' : ''}${isPending ? ' pending' : ''}${best != null ? ' cleared' : ''}">
      <div class="ch-icon">${def.icon}</div>
      <div class="ch-info"><div class="ch-name">${def.name}${best != null ? `<span class="ch-best">✅ ${clock(best)}</span>` : ''}</div>
        <div class="ch-rule">${def.rule}</div>
        <div class="ch-meta">目安 ${def.est}　報酬「${rewardLook(def)}」</div>
        ${isActive ? '<div class="ch-state">挑戦中</div>' : isPending ? '<div class="ch-state">予約中：次の転生から始まります</div>' : ''}</div>${btn}</div>`;
  }).join('');
  panel.innerHTML = `<h2 class="panel-title">🔥 社長の試練</h2>
    <p class="section-note">転生スキル・スキン・ペット・子会社・社長室・ブーストアイテムの効果をすべて封じて、ゼロから総獲得藻 ${deps.fmt(GOAL)} を目指します。予約すると次の転生から始まり、達成するかあきらめると元の強さに戻ります。データが消えることはありません。</p>
    <div class="ch-summary">クリア ${clearedCount(state)} / ${CHALLENGES.length}　試練の加護：タップとMPS +${Math.round((getChallengeBlessing(state) - 1) * 100)}%<small>初クリアごとに 転生石+${REWARD_STONES}・限定の見た目・加護+2%</small></div>${cards}`;
}

export function initChallenge(d) {
  deps = d;
  document.getElementById('challenge-panel')?.addEventListener('click', e => {
    const btn = e.target.closest('.ch-btn');
    if (!btn || btn.disabled) return;
    const state = deps.getState();
    const ch = challengeOf(state);
    if (btn.dataset.act === 'reserve') ch.pending = btn.dataset.id;
    if (btn.dataset.act === 'cancel') ch.pending = null;
    if (btn.dataset.act === 'quit') {
      if (!confirm('試練をあきらめますか？\n縛りが解除され、いまの周回はそのまま続きます。')) return;
      ch.active = null;
    }
    deps.playSound('buy');
    deps.onChange();
    renderBanner(state, activeChallenge(state));
    renderChallenge(true);
  });
}
