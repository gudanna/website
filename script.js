const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');

menuButton?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

document.getElementById('year').textContent = new Date().getFullYear();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index * 55, 330)}ms`;
  observer.observe(element);
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
animateGlow();

// English / Russian switcher.
const languageButtons = document.querySelectorAll('.lang-btn');
const translatable = document.querySelectorAll('[data-en][data-ru]');

function setLanguage(language) {
  const lang = language === 'ru' ? 'ru' : 'en';
  document.documentElement.lang = lang;
  translatable.forEach((element) => {
    element.textContent = element.dataset[lang];
  });
  languageButtons.forEach((button) => {
    const active = button.dataset.lang === lang;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  localStorage.setItem('site-language', lang);
}

languageButtons.forEach((button) => {
  button.addEventListener('click', () => setLanguage(button.dataset.lang));
});

setLanguage(localStorage.getItem('site-language') || 'en');
