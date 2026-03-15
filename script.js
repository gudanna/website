const POSITIONS = ['back', 'mid', 'front'];
let stack = ['main', 'about', 'projects'];
const ORDER = ['main', 'about', 'projects']; // top → bottom on slider

function render() {
  stack.forEach((id, i) => {
    const el = document.querySelector(`.folder[data-id="${id}"]`);
    if (el) el.setAttribute('data-pos', POSITIONS[i]);
  });
  // dot nav (bottom)
  document.querySelectorAll('.dot-item').forEach(dot => {
    dot.classList.toggle('active', dot.dataset.target === stack[2]);
  });
  updateNavSlider();
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

// ── Touch swipe between folders ──
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

// ── Expandable project cards ──
function toggleCard(card) {
  const wasOpen = card.classList.contains('open');
  document.querySelectorAll('.proj-card.open').forEach(c => c.classList.remove('open'));
  if (!wasOpen) card.classList.add('open');
}

// ════ Left Navigation Slider ════
const navThumb   = document.getElementById('navThumb');
const navTrack   = document.querySelector('.nav-slider-track');

function getTrackInfo() {
  const rect = navTrack.getBoundingClientRect();
  return { top: rect.top, height: rect.height };
}

// Position thumb at correct snap point (0, 0.5, 1 of track height)
function updateNavSlider() {
  const activeId = stack[2];
  const idx = ORDER.indexOf(activeId);
  const { height } = getTrackInfo();
  const snapFraction = idx / (ORDER.length - 1); // 0, 0.5, 1
  navThumb.style.top = (snapFraction * height) + 'px';

  // update dots
  document.querySelectorAll('.nav-dot').forEach(d => {
    d.classList.toggle('active', d.dataset.target === activeId);
  });
  // update labels
  document.querySelectorAll('.nav-slider-label').forEach(l => {
    l.classList.toggle('active', l.dataset.target === activeId);
  });
}

// Click on label
document.querySelectorAll('.nav-slider-label').forEach(label => {
  label.addEventListener('click', () => openFolder(label.dataset.target));
});
// Click on dot
document.querySelectorAll('.nav-dot').forEach(dot => {
  dot.addEventListener('click', () => openFolder(dot.dataset.target));
});
// Click on track line to snap nearest
navTrack.addEventListener('click', e => {
  if (e.target === navThumb) return;
  const { top, height } = getTrackInfo();
  const relY = e.clientY - top;
  const fraction = Math.max(0, Math.min(1, relY / height));
  const idx = Math.round(fraction * (ORDER.length - 1));
  openFolder(ORDER[idx]);
});

// ── Drag on thumb ──
let isDragging = false;
let dragStartY = 0;
let dragStartIdx = 0;

navThumb.addEventListener('mousedown', e => {
  isDragging = true;
  dragStartY = e.clientY;
  dragStartIdx = ORDER.indexOf(stack[2]);
  navThumb.classList.add('dragging');
  e.preventDefault();
  e.stopPropagation();
});

document.addEventListener('mousemove', e => {
  if (!isDragging) return;
  const { height } = getTrackInfo();
  const dy = e.clientY - dragStartY;
  const sectionH = height / (ORDER.length - 1);
  const delta = Math.round(dy / sectionH);
  const newIdx = Math.max(0, Math.min(ORDER.length - 1, dragStartIdx + delta));

  // Move thumb live (no transition during drag)
  const liveTop = Math.max(0, Math.min(height, dragStartIdx * (height / (ORDER.length - 1)) + dy));
  navThumb.style.transition = 'none';
  navThumb.style.top = liveTop + 'px';

  // Highlight nearest
  document.querySelectorAll('.nav-dot').forEach((d, i) => d.classList.toggle('active', i === newIdx));
  document.querySelectorAll('.nav-slider-label').forEach((l, i) => l.classList.toggle('active', i === newIdx));
});

document.addEventListener('mouseup', e => {
  if (!isDragging) return;
  isDragging = false;
  navThumb.classList.remove('dragging');
  navThumb.style.transition = '';

  const { top, height } = getTrackInfo();
  const thumbTop = parseFloat(navThumb.style.top) || 0;
  const fraction = Math.max(0, Math.min(1, thumbTop / height));
  const newIdx = Math.round(fraction * (ORDER.length - 1));
  openFolder(ORDER[newIdx]);
});

// ── Touch drag on thumb ──
let touchDragStartY = 0;
let touchDragStartIdx = 0;

navThumb.addEventListener('touchstart', e => {
  touchDragStartY = e.touches[0].clientY;
  touchDragStartIdx = ORDER.indexOf(stack[2]);
  navThumb.classList.add('dragging');
  e.preventDefault();
  e.stopPropagation();
}, { passive: false });

navThumb.addEventListener('touchmove', e => {
  const { height } = getTrackInfo();
  const dy = e.touches[0].clientY - touchDragStartY;
  const sectionH = height / (ORDER.length - 1);
  const newIdx = Math.max(0, Math.min(ORDER.length - 1, Math.round(touchDragStartIdx + dy / sectionH)));

  const liveTop = Math.max(0, Math.min(height, touchDragStartIdx * sectionH + dy));
  navThumb.style.transition = 'none';
  navThumb.style.top = liveTop + 'px';

  document.querySelectorAll('.nav-dot').forEach((d, i) => d.classList.toggle('active', i === newIdx));
  document.querySelectorAll('.nav-slider-label').forEach((l, i) => l.classList.toggle('active', i === newIdx));
  e.preventDefault();
}, { passive: false });

navThumb.addEventListener('touchend', e => {
  navThumb.classList.remove('dragging');
  navThumb.style.transition = '';
  const { height } = getTrackInfo();
  const thumbTop = parseFloat(navThumb.style.top) || 0;
  const fraction = Math.max(0, Math.min(1, thumbTop / height));
  const newIdx = Math.round(fraction * (ORDER.length - 1));
  openFolder(ORDER[newIdx]);
});

render();
