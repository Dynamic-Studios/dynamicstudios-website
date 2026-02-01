// ==========================================
// COUNTDOWN TIMER FOR CROWNS REVEAL
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-mins');
  const secsEl = document.getElementById('cd-secs');

  if (daysEl && hoursEl && minsEl && secsEl) {
    // Set reveal time: 3 days from now
    const now = new Date();
    const revealTime = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Store in localStorage so it persists across page reloads
    if (!localStorage.getItem('crownsRevealTime')) {
      localStorage.setItem('crownsRevealTime', revealTime.getTime());
    }

    const storedRevealTime = new Date(parseInt(localStorage.getItem('crownsRevealTime')));

    function updateCountdown() {
      const now = new Date();
      const diff = storedRevealTime - now;

      if (diff <= 0) {
        // Countdown finished - reveal everything
        daysEl.textContent = '0';
        hoursEl.textContent = '00';
        minsEl.textContent = '00';
        secsEl.textContent = '00';

        // Remove blur from ALL blur effect types
        const blurSelectors = [
          '.blurred-word',
          '.blurred-reveal-text',
          '.blurred-word-pixelated',
          '.blurred-reveal-text-pixelated',
          '.blurred-word-mosaic',
          '.blurred-reveal-text-mosaic',
          '.blurred-word-glitch',
          '.blurred-reveal-text-glitch'
        ];

        blurSelectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => {
            el.style.filter = 'none';
            el.style.userSelect = 'text';
            el.style.pointerEvents = 'auto';
            el.style.webkitUserSelect = 'text';
            el.style.animation = 'none';
            el.style.textShadow = 'none';
            el.style.background = 'none';
          });
        });

        // Remove locked overlays
        document.querySelectorAll('.locked-overlay').forEach(el => {
          el.style.display = 'none';
        });

        // Remove blurred-section stripe effects
        document.querySelectorAll('.blurred-section').forEach(el => {
          el.style.position = 'relative';
        });

        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      daysEl.textContent = String(days);
      hoursEl.textContent = String(hours).padStart(2, '0');
      minsEl.textContent = String(mins).padStart(2, '0');
      secsEl.textContent = String(secs).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }
});


// ==========================================
// BUY PAGE CAROUSEL (runs after DOM loads)
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.carousel-slide');
  const track = document.getElementById('carouselTrack');
  const indicatorsContainer = document.getElementById('carouselIndicators');

  if (!track || slides.length === 0 || !indicatorsContainer) return;

  let currentSlide = 0;

  // Create indicators
  slides.forEach((_, index) => {
    const indicator = document.createElement('div');
    indicator.className = 'indicator' + (index === 0 ? ' active' : '');
    indicator.onclick = () => goToSlide(index);
    indicatorsContainer.appendChild(indicator);
  });

  function updateCarousel() {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    document.querySelectorAll('.indicator').forEach((ind, index) => {
      ind.className = 'indicator' + (index === currentSlide ? ' active' : '');
    });
  }

  window.changeSlide = function(direction) {
    currentSlide += direction;
    if (currentSlide < 0) currentSlide = slides.length - 1;
    if (currentSlide >= slides.length) currentSlide = 0;
    updateCarousel();
  };

  window.goToSlide = function(index) {
    currentSlide = index;
    updateCarousel();
  };

  // Auto-advance every 5 seconds
  setInterval(() => window.changeSlide(1), 5000);
});


// ==========================================
// SOCIAL VIDEO CAROUSEL (YouTube Shorts)
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  const socialSlides = document.querySelectorAll('.social-carousel-slide');
  const socialTrack = document.getElementById('socialCarouselTrack');
  const socialIndicators = document.getElementById('socialCarouselIndicators');

  if (!socialTrack || socialSlides.length === 0) return;

  let currentSocialSlide = 0;

  function updateSocialCarousel() {
    socialTrack.style.transform = `translateX(-${currentSocialSlide * 100}%)`;
    if (socialIndicators) {
      document.querySelectorAll('.social-indicator').forEach((ind, index) => {
        ind.className = 'social-indicator' + (index === currentSocialSlide ? ' active' : '');
      });
    }
  }

  window.changeSocialSlide = function(direction) {
    currentSocialSlide += direction;
    if (currentSocialSlide < 0) currentSocialSlide = socialSlides.length - 1;
    if (currentSocialSlide >= socialSlides.length) currentSocialSlide = 0;
    updateSocialCarousel();
  };

  window.goToSocialSlide = function(index) {
    currentSocialSlide = index;
    updateSocialCarousel();
  };

  // Auto-advance every 7 seconds
  setInterval(() => window.changeSocialSlide(1), 7000);
});


// ==========================================
// MOBILE MENU
// ==========================================
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    nav.classList.toggle('active');
  });
}


// ==========================================
// CARD MODAL FUNCTIONS (index page)
// ==========================================
function openModal(cardType) {
  const modal = document.getElementById('modal');
  if (!modal) return;

  let title = '';
  let desc = '';

  if (cardType === 'event') {
    title = 'Event Cards';
    desc = '🔒 Full details about Event Cards will be revealed after the countdown ends!';
  } else if (cardType === 'character') {
    title = 'Character Cards';
    desc = '🔒 Full details about Character Cards will be revealed after the countdown ends!';
  }

  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-desc').textContent = desc;
  modal.classList.add('show');
}

function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) {
    modal.classList.remove('show');
  }
}


// ==========================================
// NEWSLETTER POPUP FUNCTIONS
// ==========================================
function openNewsletter() {
  const popup = document.getElementById('newsletterPopup');
  if (popup) {
    popup.classList.add('show');
  }
}

function closeNewsletter() {
  const popup = document.getElementById('newsletterPopup');
  if (popup) {
    popup.classList.remove('show');
  }
}


// ==========================================
// CLOSE MODALS ON OUTSIDE CLICK
// ==========================================
const modal = document.getElementById('modal');
if (modal) {
  modal.addEventListener('click', function(e) {
    if (e.target === this) {
      closeModal();
    }
  });
}

const newsletterPopup = document.getElementById('newsletterPopup');
if (newsletterPopup) {
  newsletterPopup.addEventListener('click', function(e) {
    if (e.target === this) {
      closeNewsletter();
    }
  });
}


// ==========================================
// SMOOTH SCROLL TO SECTION (About page nav)
// ==========================================
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;

  const headerOffset = 100;
  const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - headerOffset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
}