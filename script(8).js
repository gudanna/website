const POSITIONS = ['back', 'mid', 'front'];
let stack = ['main', 'about', 'projects'];

function render() {
  stack.forEach((id, i) => {
    const el = document.querySelector(`.folder[data-id="${id}"]`);
    if (el) el.setAttribute('data-pos', POSITIONS[i]);
  });
  // update dot nav
  document.querySelectorAll('.dot-item').forEach(dot => {
    dot.classList.toggle('active', dot.dataset.target === stack[2]);
  });
}

function openFolder(id) {
  if (stack.indexOf(id) === 2) return;
  stack.splice(stack.indexOf(id), 1);
  stack.push(id);
  render();
}

// ── Keyboard: 1 2 3 ──
document.addEventListener('keydown', e => {
  if (e.key === '1') openFolder('main');
  if (e.key === '2') openFolder('about');
  if (e.key === '3') openFolder('projects');
});

// ── Touch swipe ──
let touchStartX = 0;
document.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
document.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) < 40) return;
  const order = ['main', 'about', 'projects'];
  const current = stack[2];
  const idx = order.indexOf(current);
  if (dx < 0 && idx < order.length - 1) openFolder(order[idx + 1]);
  if (dx > 0 && idx > 0) openFolder(order[idx - 1]);
});

// ── Expandable project cards ──
function toggleCard(card) {
  const wasOpen = card.classList.contains('open');
  document.querySelectorAll('.proj-card.open').forEach(c => c.classList.remove('open'));
  if (!wasOpen) card.classList.add('open');
}

render();
