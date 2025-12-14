// Mobile menu
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
    });
}

// Card Modal functions (only on index page)
function openModal(cardType) {
    const modal = document.getElementById('modal');
    if (!modal) return;
    
    let title = '';
    let desc = '';
    
    if (cardType === 'event') {
        title = 'Events Card';
        desc = 'Flip to reveal the front (Steal Card) and back (Events Card). The Events card unleashes unpredictable twists for tactical matches!';
    } else if (cardType === 'character') {
        title = 'Character Card';
        desc = 'Flip to reveal character powers and artwork. Unleash each hero\'s special abilities!';
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

// Newsletter popup functions (only on index page)
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

// Close modals on outside click
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
