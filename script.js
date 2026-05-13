/* ─── Typed text animation ─── */
const phrases = [
  'clean, scalable web apps.',
  'full-stack solutions.',
  'RESTful APIs you can trust.',
  'great user experiences.',
];

let phraseIdx = 0, charIdx = 0, deleting = false;
const typedEl = document.getElementById('typed');

function type() {
  const current = phrases[phraseIdx];
  if (deleting) {
    typedEl.textContent = current.slice(0, --charIdx);
  } else {
    typedEl.textContent = current.slice(0, ++charIdx);
  }

  let delay = deleting ? 45 : 80;
  if (!deleting && charIdx === current.length) {
    delay = 1800; deleting = true;
  } else if (deleting && charIdx === 0) {
    deleting = false;
    phraseIdx = (phraseIdx + 1) % phrases.length;
    delay = 400;
  }
  setTimeout(type, delay);
}
type();

/* ─── Navbar shadow on scroll ─── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.style.background = window.scrollY > 30
    ? 'rgba(255, 255, 255, 0.95)'
    : 'rgba(255, 255, 255, 0.9)';
});

/* ─── Fade-in on scroll ─── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });

document.querySelectorAll(
  '.project-card, .skill-card, .contact-card, .coming-soon-card, .about-text, .skills-grid'
).forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

/* ─── Image Carousel ─── */
const carouselState = {};   // { carouselId: currentIndex }

function initCarousel(id) {
  const wrap = document.getElementById(id);
  if (!wrap) return;
  const slides = wrap.querySelectorAll('.carousel-slide');
  carouselState[id] = 0;

  // Build dots
  const dotsContainer = document.getElementById('dots-' + id);
  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    d.addEventListener('click', () => goToSlide(id, i));
    dotsContainer.appendChild(d);
  });
}

function goToSlide(id, idx) {
  const wrap = document.getElementById(id);
  const slides = wrap.querySelectorAll('.carousel-slide');
  idx = (idx + slides.length) % slides.length;
  carouselState[id] = idx;
  wrap.querySelector('.carousel-track').style.transform = `translateX(-${idx * 100}%)`;
  wrap.querySelectorAll('.carousel-dot').forEach((d, i) => {
    d.classList.toggle('active', i === idx);
  });
}

function moveCarousel(id, dir) {
  const wrap = document.getElementById(id);
  const slides = wrap.querySelectorAll('.carousel-slide');
  const next = (carouselState[id] + dir + slides.length) % slides.length;
  goToSlide(id, next);
}

// Auto-advance every 4 s
function startAutoPlay(id) {
  return setInterval(() => {
    const wrap = document.getElementById(id);
    if (!wrap) return;
    const slides = wrap.querySelectorAll('.carousel-slide');
    const next = (carouselState[id] + 1) % slides.length;
    goToSlide(id, next);
  }, 4000);
}

// Init all carousels on page
document.querySelectorAll('.image-carousel').forEach(c => {
  initCarousel(c.id);
  const timer = startAutoPlay(c.id);
  c.addEventListener('mouseenter', () => clearInterval(timer));
});
