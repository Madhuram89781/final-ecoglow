// Update navigation based on authentication status
function updateNavigation() {
    const username = localStorage.getItem('username');
    const loginButtons = document.querySelectorAll('a[href="login.html"]');

    if (username) {
        loginButtons.forEach(button => {
            button.textContent = username;
            button.href = '#';
            button.classList.add('relative', 'group');
            
            // Create dropdown menu if it doesn't exist
            if (!button.querySelector('.dropdown-menu')) {
                const dropdown = document.createElement('div');
                dropdown.className = 'dropdown-menu absolute hidden group-hover:block right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1';
                dropdown.innerHTML = `
                    <button class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50" onclick="logout()">
                        Logout
                    </button>
                `;
                button.appendChild(dropdown);
            }
        });
    }
}

// Logout function
window.logout = function() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = './login.html';
};

// Mobile menu functionality
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// Update navigation on page load
document.addEventListener('DOMContentLoaded', updateNavigation);

// Leaf animation
function createLeaf() {
    const leaf = document.createElement("div");
    leaf.classList.add("leaf");
    leaf.style.left = Math.random() * 100 + "vw";
    leaf.style.animationDuration = Math.random() * 5 + 5 + "s";
    document.body.appendChild(leaf);
    setTimeout(() => { leaf.remove(); }, 10000);
}

// Create leaves at intervals
setInterval(createLeaf, 2000);

// GSAP Animations (if on homepage)
if (document.querySelector('.hero-title')) {
    // Initialize GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Hero section animations
    gsap.from('.hero-title', {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out'
    });

    gsap.from('.hero-subtitle', {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 0.3,
        ease: 'power3.out'
    });

    gsap.from('.btn-primary, .btn-secondary', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.6,
        stagger: 0.2,
        ease: 'power3.out'
    });

    gsap.from('.hero-image', {
        opacity: 0,
        x: 100,
        duration: 1,
        delay: 0.3,
        ease: 'power3.out'
    });

    // Section animations with ScrollTrigger
    gsap.utils.toArray('.section-intro').forEach(section => {
        gsap.from(section, {
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 50,
            duration: 1,
            ease: 'power3.out'
        });
    });

    gsap.utils.toArray('.feature-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 50,
            duration: 0.6,
            delay: i * 0.1,
            ease: 'power3.out'
        });
    });

    // Timeline animations
    gsap.utils.toArray('.timeline-item').forEach((item, i) => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            x: -50,
            duration: 0.6,
            delay: i * 0.2,
            ease: 'power3.out'
        });
    });
}

// Authentication state observer
firebase.auth().onAuthStateChanged((user) => {
    // Get all login buttons in the navbar (desktop and mobile)
    const loginButtons = document.querySelectorAll('a[href="login.html"]');
    
    if (user) {
        // User is signed in
        console.log('User is signed in:', user.displayName);
        
        // Replace login buttons with user info and logout
        loginButtons.forEach(button => {
            const parentElement = button.parentElement;
            
            // Create user dropdown container
            const userContainer = document.createElement('div');
            userContainer.className = button.className.includes('rounded-full') 
                ? 'relative group bg-white text-green-700 px-4 py-2 rounded-full hover:bg-green-100 transition-all cursor-pointer flex items-center'
                : 'relative group cursor-pointer';
            
            // Create user display
            const userDisplay = document.createElement('div');
            userDisplay.className = 'flex items-center';
            userDisplay.innerHTML = `
                <i class="fas fa-user-circle mr-2"></i>
                <span>${user.displayName || user.email.split('@')[0]}</span>
                <i class="fas fa-chevron-down ml-2 text-sm"></i>
            `;
            
            // Create dropdown
            const dropdown = document.createElement('div');
            dropdown.className = 'absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block';
            dropdown.innerHTML = `
                <a href="#" id="logout-btn" class="block px-4 py-2 text-gray-700 hover:bg-green-100">
                    <i class="fas fa-sign-out-alt mr-2"></i> Logout
                </a>
            `;
            
            // Add to DOM
            userContainer.appendChild(userDisplay);
            userContainer.appendChild(dropdown);
            parentElement.replaceChild(userContainer, button);
            
            // Add event listener to logout button
            const logoutBtn = dropdown.querySelector('#logout-btn');
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                firebase.auth().signOut().then(() => {
                    console.log('User signed out');
                    window.location.reload();
                }).catch((error) => {
                    console.error('Sign out error:', error);
                });
            });
        });
        
    } else {
        // User is signed out or no user
        console.log('No user is signed in');
        
        // Ensure login buttons are visible and correct
        loginButtons.forEach(button => {
            if (button.style.display === 'none') {
                button.style.display = '';
            }
        });
    }
});

// Contact form submission
// Contact Form Handler
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('#contact form');
    if (contactForm) {
        // Pre-fill form with provided details
        document.getElementById('name').value = 'Madhu ram';
        document.getElementById('email').value = 'madhuramsundara5@gmail.com';
        document.getElementById('subject').value = 'developer';
        document.getElementById('message').value = "ecoglow isn't just a website-it's a movement toward a greener,healthier future";

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form values
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };
            
            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();
                
                if (response.ok) {
                    // Clear the form
                    contactForm.reset();
                    alert('Thank you for your message! We will get back to you soon.');
                } else {
                    alert(data.message || 'Error sending message. Please try again.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error sending message. Please try again.');
            }
        });
    }
});