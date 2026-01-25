// Mobile Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });
}

// Newsletter Popup Functions
function openNewsletter() {
    const popup = document.getElementById('newsletterPopup');
    if (popup) {
        popup.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeNewsletter() {
    const popup = document.getElementById('newsletterPopup');
    if (popup) {
        popup.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

// Close popup when clicking outside
const newsletterPopup = document.getElementById('newsletterPopup');
if (newsletterPopup) {
    newsletterPopup.addEventListener('click', (e) => {
        if (e.target === newsletterPopup) {
            closeNewsletter();
        }
    });
}

// Card Modal Functions
const cardData = {
    event: {
        title: "Event Cards",
        description: "Event cards are powerful action cards that let you disrupt your opponents' strategies, steal resources, block attacks, and create game-changing moments. Use them wisely to turn the tide of battle in your favour!"
    },
    character: {
        title: "Character Cards",
        description: "Character cards form the backbone of your strategy. Each character has unique abilities and stats that synergise with others. Build your perfect team composition and dominate the battlefield with strategic combinations!"
    }
};

function openModal(cardType) {
    const modal = document.getElementById('modal');
    const title = document.getElementById('modal-title');
    const desc = document.getElementById('modal-desc');

    if (modal && cardData[cardType]) {
        title.textContent = cardData[cardType].title;
        desc.textContent = cardData[cardType].description;
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

// Close modal when clicking outside
const modal = document.getElementById('modal');
if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Smooth scroll to sections
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerOffset = 120;
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Social Media Carousel (if exists on page)
let currentSocialSlide = 0;

function changeSocialSlide(direction) {
    const track = document.getElementById('socialCarouselTrack');
    const slides = document.querySelectorAll('.social-carousel-slide');

    if (!track || slides.length === 0) return;

    currentSocialSlide += direction;
    if (currentSocialSlide < 0) currentSocialSlide = slides.length - 1;
    if (currentSocialSlide >= slides.length) currentSocialSlide = 0;

    track.style.transform = `translateX(-${currentSocialSlide * 100}%)`;

    // Update indicators
    document.querySelectorAll('.social-indicator').forEach((ind, index) => {
        ind.className = 'social-indicator' + (index === currentSocialSlide ? ' active' : '');
    });
}

function goToSocialSlide(index) {
    currentSocialSlide = index;
    const track = document.getElementById('socialCarouselTrack');
    if (track) {
        track.style.transform = `translateX(-${currentSocialSlide * 100}%)`;
        document.querySelectorAll('.social-indicator').forEach((ind, i) => {
            ind.className = 'social-indicator' + (i === currentSocialSlide ? ' active' : '');
        });
    }
}

// Auto-advance social carousel every 8 seconds
setInterval(() => {
    const track = document.getElementById('socialCarouselTrack');
    if (track) {
        changeSocialSlide(1);
    }
}, 8000);