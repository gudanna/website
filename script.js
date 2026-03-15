const POSITIONS = ['back', 'mid', 'front'];
let stack = ['main', 'about', 'projects'];
const ORDER = ['main', 'about', 'projects'];

// Remember scroll position per folder
const savedScroll = { main: 0, about: 0, projects: 0 };

// The invisible div that sets the page's scrollable height
const proxy = document.getElementById('scroll-proxy');

// --- Get the f-scroll of the front folder ---
function getFrontScroll() {
  return document.querySelector(`.folder[data-id="${stack[2]}"] .f-scroll`);
}

// --- Sync page scroll → content inside front folder ---
function onPageScroll() {
  const el = getFrontScroll();
  if (!el) return;
  el.style.transform = `translateY(-${window.scrollY}px)`;
  savedScroll[stack[2]] = window.scrollY;
}

window.addEventListener('scroll', onPageScroll, { passive: true });

// --- Update proxy height = scrollable content height of front folder ---
function updateProxyHeight() {
  const el = getFrontScroll();
  if (!el) {
    proxy.style.height = '0px';
    return;
  }
  // Wait one frame so layout is computed
  requestAnimationFrame(() => {
    const contentH = el.scrollHeight;
    const viewH = window.innerHeight;
    // proxy height makes the page scrollable by exactly (contentH - viewH)
    proxy.style.height = Math.max(0, contentH - viewH) + 'px';
  });
}

// --- Render: update positions, dots, restore scroll ---
function render() {
  // Save scroll for the folder leaving front
  // (already saved continuously via onPageScroll)

  stack.forEach((id, i) => {
    const el = document.querySelector(`.folder[data-id="${id}"]`);
    if (el) el.setAttribute('data-pos', POSITIONS[i]);
  });

  // Dot nav
  document.querySelectorAll('.dot-item').forEach(dot => {
    dot.classList.toggle('active', dot.dataset.target === stack[2]);
  });

  // After transition settles, update proxy and restore scroll
  setTimeout(() => {
    updateProxyHeight();
    const restore = savedScroll[stack[2]] || 0;
    // Reset transform first
    const el = getFrontScroll();
    if (el) el.style.transform = `translateY(-${restore}px)`;
    window.scrollTo({ top: restore, behavior: 'instant' });
  }, 50);
}

function openFolder(id) {
  if (stack.indexOf(id) === 2) return;
  // Save current scroll before switching
  savedScroll[stack[2]] = window.scrollY;
  stack.splice(stack.indexOf(id), 1);
  stack.push(id);
  render();
}

// Keyboard: 1 2 3
document.addEventListener('keydown', e => {
  if (e.key === '1') openFolder('main');
  if (e.key === '2') openFolder('about');
  if (e.key === '3') openFolder('projects');
});

// Touch swipe between folders
let touchStartX = 0;
document.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
document.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) < 40) return;
  const current = stack[2];
  const idx = ORDER.indexOf(current);
  if (dx < 0 && idx < ORDER.length - 1) openFolder(ORDER[idx + 1]);
  if (dx > 0 && idx > 0) openFolder(ORDER[idx - 1]);
});

// Expandable project cards
function toggleCard(card) {
  const wasOpen = card.classList.contains('open');
  document.querySelectorAll('.proj-card.open').forEach(c => c.classList.remove('open'));
  if (!wasOpen) card.classList.add('open');
  // Recalculate proxy height after card expands
  setTimeout(updateProxyHeight, 520);
}

// Initial render
render();
