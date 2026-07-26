const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');

menuButton?.addEventListener('click', () => {
  const open = nav?.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(Boolean(open)));
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Experience accordion: toggle role details open/closed.
document.querySelectorAll('.role-toggle').forEach((button) => {
  button.addEventListener('click', () => {
    const role = button.closest('.role');
    if (!role) return;
    const open = role.classList.toggle('open');
    button.setAttribute('aria-expanded', String(open));
    const label = button.querySelector('.role-toggle-label');
    if (label) {
      label.textContent = open ? button.dataset.labelHide : button.dataset.labelShow;
    }
  });
});

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const observer = !reduceMotion && 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 })
  : null;

document.querySelectorAll('.reveal').forEach((element, index) => {
  if (!observer) {
    element.classList.add('visible');
    return;
  }
  element.style.transitionDelay = `${Math.min(index * 55, 330)}ms`;
  observer.observe(element);
});

// Fill each hard-skill level bar once it scrolls into view.
const skillBarObserver = !reduceMotion && 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const level = entry.target.dataset.level || '0';
          entry.target.style.setProperty('--fill', `${level}%`);
          entry.target.classList.add('filled');
          skillBarObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 })
  : null;

document.querySelectorAll('.skill-bar').forEach((bar, index) => {
  if (!skillBarObserver) {
    bar.style.setProperty('--fill', `${bar.dataset.level || 0}%`);
    bar.classList.add('filled');
    return;
  }
  bar.querySelector('.skill-bar-fill').style.transitionDelay = `${Math.min(index * 90, 450)}ms`;
  skillBarObserver.observe(bar);
});

// Cursor glow follows the pointer smoothly.
const glow = document.querySelector('.cursor-glow');
let targetX = window.innerWidth / 2;
let targetY = window.innerHeight / 2;
let currentX = targetX;
let currentY = targetY;

window.addEventListener('pointermove', (event) => {
  targetX = event.clientX;
  targetY = event.clientY;
});

function animateGlow() {
  currentX += (targetX - currentX) * 0.14;
  currentY += (targetY - currentY) * 0.14;
  if (glow) glow.style.transform = `translate(${currentX - 210}px, ${currentY - 210}px)`;
  requestAnimationFrame(animateGlow);
}
if (!reduceMotion) animateGlow();

// Subtle 3D tilt for the portrait and marketing objects.
const heroVisual = document.getElementById('hero-visual');
const stage = heroVisual?.querySelector('.portrait-stage');
if (heroVisual && stage && !reduceMotion && window.matchMedia('(pointer:fine)').matches) {
  heroVisual.addEventListener('pointermove', (event) => {
    const rect = heroVisual.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    stage.style.setProperty('--rotate-y', `${x * 9}deg`);
    stage.style.setProperty('--rotate-x', `${y * -7}deg`);
    stage.style.setProperty('--shift-x', `${x * 10}px`);
    stage.style.setProperty('--shift-y', `${y * 8}px`);
  });
  heroVisual.addEventListener('pointerleave', () => {
    stage.style.setProperty('--rotate-y', '0deg');
    stage.style.setProperty('--rotate-x', '0deg');
    stage.style.setProperty('--shift-x', '0px');
    stage.style.setProperty('--shift-y', '0px');
  });
}
