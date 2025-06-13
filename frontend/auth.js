// DOM Elements
const loginTab = document.getElementById('login-tab');
const signupTab = document.getElementById('signup-tab');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const authMessage = document.getElementById('auth-message');

// Backend API URL
const API_URL = process.env.API_URL || 'http://localhost:3000';

// Tab switching functionality
loginTab.addEventListener('click', () => {
    loginTab.classList.add('text-green-600', 'border-b-2', 'border-green-600');
    signupTab.classList.remove('text-green-600', 'border-b-2', 'border-green-600');
    loginTab.classList.remove('text-gray-500');
    signupTab.classList.add('text-gray-500');
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
});

signupTab.addEventListener('click', () => {
    signupTab.classList.add('text-green-600', 'border-b-2', 'border-green-600');
    loginTab.classList.remove('text-green-600', 'border-b-2', 'border-green-600');
    signupTab.classList.remove('text-gray-500');
    loginTab.classList.add('text-gray-500');
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
});

// Form Validation
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

// Helper function to show messages
function showMessage(message, type = 'info') {
    authMessage.textContent = message;
    authMessage.className = 'mt-4 text-center p-3 rounded';
    
    if (type === 'error') {
        authMessage.classList.add('bg-red-100', 'text-red-700');
    } else if (type === 'success') {
        authMessage.classList.add('bg-green-100', 'text-green-700');
    } else {
        authMessage.classList.add('bg-blue-100', 'text-blue-700');
    }

    authMessage.classList.remove('hidden');

    // Hide message after 5 seconds
    setTimeout(() => {
        authMessage.classList.add('hidden');
    }, 5000);
}

// Handle Signup
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const terms = document.getElementById('terms').checked;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showMessage('Please fill in all fields', 'error');
        return;
    }

    if (!validateEmail(email)) {
        showMessage('Please enter a valid email', 'error');
        return;
    }

    if (!validatePassword(password)) {
        showMessage('Password must be at least 6 characters long', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }

    if (!terms) {
        showMessage('Please accept the Terms of Service', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                email,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Account created successfully! Please log in.', 'success');
            // Switch to login tab
            loginTab.click();
            signupForm.reset();
        } else {
            showMessage(data.message || 'Error creating account', 'error');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showMessage('Error connecting to server', 'error');
    }
});

// Handle Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }

    if (!validateEmail(email)) {
        showMessage('Please enter a valid email', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Store the token and username
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            
            // Update navigation bar
            const loginButtons = document.querySelectorAll('a[href="login.html"]');
            loginButtons.forEach(button => {
                button.textContent = data.username;
                button.href = '#';
                button.classList.add('relative', 'group');
                
                // Create dropdown menu
                const dropdown = document.createElement('div');
                dropdown.className = 'absolute hidden group-hover:block right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1';
                dropdown.innerHTML = `
                    <button class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50" onclick="logout()">
                        Logout
                    </button>
                `;
                button.appendChild(dropdown);
            });
            
            // Add logout function
            window.logout = function() {
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                window.location.href = './login.html';
            };
            
            // Check for redirect parameter
            const urlParams = new URLSearchParams(window.location.search);
            const redirectPage = urlParams.get('redirect');
            
            // Log success message
            console.log('Login successful, redirecting...');
            
            // Redirect to the specified page or default to scan page
            window.location.href = redirectPage ? `./${redirectPage}.html` : './scan.html';
        } else {
            showMessage(data.message || 'Invalid credentials', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Error connecting to server', 'error');
    }
});