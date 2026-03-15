const POSITIONS = ['back', 'mid', 'front'];
let stack = ['main', 'about', 'projects'];

function render() {
  stack.forEach((id, i) => {
    const el = document.querySelector(`.folder[data-id="${id}"]`);
    if (el) el.setAttribute('data-pos', POSITIONS[i]);
  });
  document.querySelectorAll('.dot-item').forEach(dot => {
    dot.classList.toggle('active', dot.dataset.target === stack[2]);
  });
  setTimeout(updateScrollbar, 480);
}

function openFolder(id) {
  if (stack.indexOf(id) === 2) return;
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
  const order = ['main', 'about', 'projects'];
  const current = stack[2];
  const idx = order.indexOf(current);
  if (dx < 0 && idx < order.length - 1) openFolder(order[idx + 1]);
  if (dx > 0 && idx > 0) openFolder(order[idx - 1]);
});

// Expandable project cards
function toggleCard(card) {
  const wasOpen = card.classList.contains('open');
  document.querySelectorAll('.proj-card.open').forEach(c => c.classList.remove('open'));
  if (!wasOpen) card.classList.add('open');
  setTimeout(updateScrollbar, 520);
}

// ════ Global Scrollbar ════
const scrollbarTrack = document.querySelector('.global-scrollbar');
const scrollbarThumb = document.querySelector('.global-scrollbar-thumb');

function getActiveScroll() {
  const frontId = stack[2];
  return document.querySelector(`.folder[data-id="${frontId}"] .f-scroll`);
}

function updateScrollbar() {
  const el = getActiveScroll();
  if (!el) return;

  const trackH = scrollbarTrack.clientHeight;
  const { scrollTop, scrollHeight, clientHeight } = el;
  const scrollable = scrollHeight - clientHeight;

  if (scrollable <= 2) {
    scrollbarTrack.classList.remove('visible');
    return;
  }

  scrollbarTrack.classList.add('visible');

  const thumbH = Math.max(28, (clientHeight / scrollHeight) * trackH);
  const thumbTop = scrollable > 0 ? (scrollTop / scrollable) * (trackH - thumbH) : 0;

  scrollbarThumb.style.height = thumbH + 'px';
  scrollbarThumb.style.top = thumbTop + 'px';
}

// Sync when folder scrolls
document.querySelectorAll('.f-scroll').forEach(el => {
  el.addEventListener('scroll', updateScrollbar, { passive: true });
});

// Mouse drag
let isDragging = false;
let dragStartY = 0;
let dragStartScrollTop = 0;

scrollbarThumb.addEventListener('mousedown', e => {
  isDragging = true;
  dragStartY = e.clientY;
  const el = getActiveScroll();
  dragStartScrollTop = el ? el.scrollTop : 0;
  scrollbarThumb.classList.add('dragging');
  e.preventDefault();
});

document.addEventListener('mousemove', e => {
  if (!isDragging) return;
  const el = getActiveScroll();
  if (!el) return;
  const trackH = scrollbarTrack.clientHeight;
  const { scrollHeight, clientHeight } = el;
  const scrollable = scrollHeight - clientHeight;
  const thumbH = Math.max(28, (clientHeight / scrollHeight) * trackH);
  const dy = e.clientY - dragStartY;
  el.scrollTop = Math.max(0, Math.min(scrollable, dragStartScrollTop + (dy / (trackH - thumbH)) * scrollable));
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  scrollbarThumb.classList.remove('dragging');
});

// Click on track to jump
scrollbarTrack.addEventListener('click', e => {
  if (e.target === scrollbarThumb) return;
  const el = getActiveScroll();
  if (!el) return;
  const trackH = scrollbarTrack.clientHeight;
  const { scrollHeight, clientHeight } = el;
  const scrollable = scrollHeight - clientHeight;
  const thumbH = Math.max(28, (clientHeight / scrollHeight) * trackH);
  const rect = scrollbarTrack.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (e.clientY - rect.top - thumbH / 2) / (trackH - thumbH)));
  el.scrollTop = ratio * scrollable;
});

// Touch drag on scrollbar thumb
let touchDragStartY = 0;
let touchDragStartScrollTop = 0;

scrollbarThumb.addEventListener('touchstart', e => {
  touchDragStartY = e.touches[0].clientY;
  const el = getActiveScroll();
  touchDragStartScrollTop = el ? el.scrollTop : 0;
  scrollbarThumb.classList.add('dragging');
  e.preventDefault();
}, { passive: false });

scrollbarThumb.addEventListener('touchmove', e => {
  const el = getActiveScroll();
  if (!el) return;
  const trackH = scrollbarTrack.clientHeight;
  const { scrollHeight, clientHeight } = el;
  const scrollable = scrollHeight - clientHeight;
  const thumbH = Math.max(28, (clientHeight / scrollHeight) * trackH);
  const dy = e.touches[0].clientY - touchDragStartY;
  el.scrollTop = Math.max(0, Math.min(scrollable, touchDragStartScrollTop + (dy / (trackH - thumbH)) * scrollable));
  e.preventDefault();
}, { passive: false });

scrollbarThumb.addEventListener('touchend', () => {
  scrollbarThumb.classList.remove('dragging');
});

render();
updateScrollbar();
