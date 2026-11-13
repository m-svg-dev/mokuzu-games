export function openModal(title, bodyHTML) {
  const el = document.createElement('div');
  el.className = 'mz-modal';
  el.innerHTML = `<div class="mz-modal-inner"><div class="mz-modal-header"><span></span><button class="mz-modal-close" aria-label="閉じる">✕</button></div><div class="mz-modal-body">${bodyHTML}</div></div>`;
  el.querySelector('.mz-modal-header span').textContent = title;
  const close = () => el.remove();
  el.addEventListener('click', e => {
    if (e.target === el || e.target.closest('.mz-modal-close')) close();
  });
  document.body.appendChild(el);
  return { el, body: el.querySelector('.mz-modal-body'), close };
}
