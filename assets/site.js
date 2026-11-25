// Progressive enhancement only; all content and language navigation work without JavaScript.
const links = [...document.querySelectorAll('.main-nav a')];
const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
function updateCurrentSection() {
  let active = sections[0];
  for (const section of sections) if (section.getBoundingClientRect().top <= 160) active = section;
  for (const link of links) {
    if (link.hash === `#${active?.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}
let scheduled = false;
window.addEventListener('scroll', () => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => { updateCurrentSection(); scheduled = false; });
}, { passive: true });
updateCurrentSection();

// Links remain usable as full-size image links if dialog support or JS is absent.
for (const trigger of document.querySelectorAll('[data-qr-dialog]')) {
  const dialog = document.getElementById(trigger.dataset.qrDialog);
  if (!dialog || typeof dialog.showModal !== 'function') continue;
  trigger.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    dialog.showModal();
  });
  dialog.querySelector('[data-close-dialog]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => trigger.focus({preventScroll:true}));
}
