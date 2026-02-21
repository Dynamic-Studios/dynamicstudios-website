// script.js - Dynamic Game Studios
// Carousels, mobile menu, modals

window.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');
  
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => nav.classList.toggle('active'));
  }

  // Buy page carousel (#carouselTrack on buy.html)
  const buySlides = document.querySelectorAll('.carousel-slide');
  const buyTrack = document.getElementById('carouselTrack');
  const buyIndicators = document.getElementById('carouselIndicators');

  if (buyTrack && buySlides.length > 0 && buyIndicators) {
    let buyIndex = 0;
    let startX = 0;
    let endX = 0;

    function clampBuy() {
      if (buyIndex < 0) buyIndex = buySlides.length - 1;
      if (buyIndex >= buySlides.length) buyIndex = 0;
    }

    function updateBuy() {
      buyTrack.style.transform = `translateX(-${buyIndex * 100}%)`;
      buyIndicators.querySelectorAll('.indicator').forEach((d, i) => {
        d.classList.toggle('active', i === buyIndex);
      });
    }

    function goToBuySlide(i) {
      buyIndex = i;
      clampBuy();
      updateBuy();
    }

    // Create indicators if missing
    if (buyIndicators.querySelectorAll('.indicator').length === 0) {
      buySlides.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'indicator' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => goToBuySlide(i));
        buyIndicators.appendChild(dot);
      });
    }

    // Expose for inline onclick in HTML
    window.changeSlide = function (direction) {
      buyIndex += direction;
      clampBuy();
      updateBuy();
    };

    window.goToSlide = function (i) {
      goToBuySlide(i);
    };

    // Touch swipe support
    buyTrack.addEventListener('touchstart', (e) => {
      startX = e.changedTouches[0].screenX;
    });

    buyTrack.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].screenX;
      if (endX < startX - 50) window.changeSlide(1);
      if (endX > startX + 50) window.changeSlide(-1);
    });

    // Auto-advance every 5 seconds
    setInterval(() => window.changeSlide(1), 5000);
  }

  // Social video carousel (#socialCarouselTrack on index.html)
  const socialSlides = document.querySelectorAll('.social-carousel-slide');
  const socialTrack = document.getElementById('socialCarouselTrack');
  const socialIndicators = document.getElementById('socialCarouselIndicators');

  if (socialTrack && socialSlides.length > 0 && socialIndicators) {
    let socialIndex = 0;
    let startX = 0;
    let endX = 0;

    function clampSocial() {
      if (socialIndex < 0) socialIndex = socialSlides.length - 1;
      if (socialIndex >= socialSlides.length) socialIndex = 0;
    }

    function updateSocial() {
      socialTrack.style.transform = `translateX(-${socialIndex * 100}%)`;
      socialIndicators.querySelectorAll('.social-indicator').forEach((d, i) => {
        d.classList.toggle('active', i === socialIndex);
      });
    }

    function goToSocial(i) {
      socialIndex = i;
      clampSocial();
      updateSocial();
    }

    // Create indicators if missing
    if (socialIndicators.querySelectorAll('.social-indicator').length === 0) {
      socialSlides.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'social-indicator' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => goToSocial(i));
        socialIndicators.appendChild(dot);
      });
    }

    // Expose for inline onclick in HTML
    window.changeSocialSlide = function (direction) {
      socialIndex += direction;
      clampSocial();
      updateSocial();
    };

    window.goToSocialSlide = function (i) {
      goToSocial(i);
    };

    // Touch swipe support
    socialTrack.addEventListener('touchstart', (e) => {
      startX = e.changedTouches[0].screenX;
    });

    socialTrack.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].screenX;
      if (endX < startX - 50) window.changeSocialSlide(1);
      if (endX > startX + 50) window.changeSocialSlide(-1);
    });

    // Auto-advance every 7 seconds
    setInterval(() => window.changeSocialSlide(1), 7000);
  }

  // Close modals on outside click
  const modal = document.getElementById('modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  const popup = document.getElementById('newsletterPopup');
  if (popup) {
    popup.addEventListener('click', (e) => {
      if (e.target === popup) closeNewsletter();
    });
  }
});

// Modal functions (called by inline onclick in HTML)
function openModal(cardType) {
  const modal = document.getElementById('modal');
  if (!modal) return;

  let title = 'Card';
  let desc = 'Details coming soon.';

  if (cardType === 'event') {
    title = 'Event Cards';
    desc = 'Special effects that change the game state.';
  } else if (cardType === 'character' || cardType === 'playing') {
    title = 'Playing Cards';
    desc = 'Build your deck with abilities and synergies.';
  } else if (cardType === 'bronze') {
    title = 'Bronze Cards';
    desc = 'Foundation cards with lower values.';
  } else if (cardType === 'silver') {
    title = 'Silver Cards';
    desc = 'Mid-power cards for tempo and flexibility.';
  } else if (cardType === 'gold') {
    title = 'Gold Cards';
    desc = 'High-impact cards used to close out games.';
  }

  const t = document.getElementById('modal-title');
  const d = document.getElementById('modal-desc');
  if (t) t.textContent = title;
  if (d) d.textContent = desc;

  modal.classList.add('show');
}

function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) modal.classList.remove('show');
}

function openNewsletter() {
  const popup = document.getElementById('newsletterPopup');
  if (popup) popup.classList.add('show');
}

function closeNewsletter() {
  const popup = document.getElementById('newsletterPopup');
  if (popup) popup.classList.remove('show');
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;

  const headerOffset = 110;
  const y = el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
  window.scrollTo({ top: y, behavior: 'smooth' });
}
