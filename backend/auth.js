// Change this line
const API_URL = 'http://localhost:3000';

// To this
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : process.env.API_URL || 'https://your-backend-url.vercel.app';// DOM Elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginTab = document.getElementById('login-tab');
const signupTab = document.getElementById('signup-tab');
const authMessage = document.getElementById('auth-message');

// Google and Facebook auth providers
const googleLoginBtn = document.getElementById('google-login');
const facebookLoginBtn = document.getElementById('facebook-login');

// Initialize auth providers
const googleProvider = new firebase.auth.GoogleAuthProvider();
const facebookProvider = new firebase.auth.FacebookAuthProvider();

// Tab switching functionality
if (loginTab && signupTab) {
    loginTab.addEventListener('click', () => {
        loginTab.classList.add('text-green-600', 'border-green-600');
        loginTab.classList.remove('text-gray-500');
        signupTab.classList.remove('text-green-600', 'border-green-600');
        signupTab.classList.add('text-gray-500');
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');

        // GSAP animation
        gsap.from(loginForm, {
            opacity: 0,
            y: 10,
            duration: 0.3,
            ease: 'power2.out'
        });
    });

    signupTab.addEventListener('click', () => {
        signupTab.classList.add('text-green-600', 'border-green-600');
        signupTab.classList.remove('text-gray-500');
        loginTab.classList.remove('text-green-600', 'border-green-600');
        loginTab.classList.add('text-gray-500');
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');

        // GSAP animation
        gsap.from(signupForm, {
            opacity: 0,
            y: 10,
            duration: 0.3,
            ease: 'power2.out'
        });
    });
}

// Handle login form submission
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            showMessage('Signing in...', 'text-green-600');

            await firebase.auth().signInWithEmailAndPassword(email, password);

            showMessage('Login successful! Redirecting...', 'text-green-600');

            // Redirect to homepage after successful login
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);

        } catch (error) {
            console.error('Login error:', error);
            showMessage(error.message, 'text-red-600');
        }
    });
}

// Handle signup form submission
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;

        // Validate passwords match
        if (password !== confirmPassword) {
            showMessage('Passwords do not match', 'text-red-600');
            return;
        }

        try {
            showMessage('Creating your account...', 'text-green-600');

            // Create user with email and password
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);

            // Update user profile with name
            await userCredential.user.updateProfile({
                displayName: name
            });

            showMessage('Account created successfully! Redirecting...', 'text-green-600');

            // Redirect to homepage after successful signup
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);

        } catch (error) {
            console.error('Signup error:', error);
            showMessage(error.message, 'text-red-600');
        }
    });
}

// Google Sign In
if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
        try {
            showMessage('Signing in with Google...', 'text-green-600');

            await firebase.auth().signInWithPopup(googleProvider);

            showMessage('Login successful! Redirecting...', 'text-green-600');

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);

        } catch (error) {
            console.error('Google sign-in error:', error);
            showMessage(error.message, 'text-red-600');
        }
    });
}

// Facebook Sign In
if (facebookLoginBtn) {
    facebookLoginBtn.addEventListener('click', async () => {
        try {
            showMessage('Signing in with Facebook...', 'text-green-600');

            await firebase.auth().signInWithPopup(facebookProvider);

            showMessage('Login successful! Redirecting...', 'text-green-600');

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);

        } catch (error) {
            console.error('Facebook sign-in error:', error);
            showMessage(error.message, 'text-red-600');
        }
    });
}

// Helper function to show auth messages
function showMessage(message, className) {
    if (authMessage) {
        authMessage.textContent = message;
        authMessage.className = `mt-4 text-center ${className} fade-in`;
        authMessage.classList.remove('hidden');
    }
}

// Check auth state on page load
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log('User is signed in:', user.displayName);
    } else {
        console.log('No user is signed in');
    }
});
// Add this near the top of auth.js
// Get the redirect URL from query parameters if it exists
function getRedirectUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
    if (redirect) {
        return redirect + '.html';
    }
    return 'index.html';
}

// Modify the login completion handler to use the redirect URL
// In your login form submit handler, change the redirect line:
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        showMessage('Signing in...', 'text-green-600');

        await firebase.auth().signInWithEmailAndPassword(email, password);

        showMessage('Login successful! Redirecting...', 'text-green-600');

        // Redirect to specified page or homepage after successful login
        const redirectUrl = getRedirectUrl();
        // Change your redirect code in auth.js to add source parameter
        setTimeout(() => {
            const redirectUrl = getRedirectUrl();
            window.location.href = redirectUrl + (redirectUrl.includes('?') ? '&' : '?') + 'source=login';
        }, 1500);

    } catch (error) {
        console.error('Login error:', error);
        showMessage(error.message, 'text-red-600');
    }
});

// Do the same for the signup form handler and the social login handlers
// For example, in the Google login handler:
googleLoginBtn.addEventListener('click', async () => {
    try {
        showMessage('Signing in with Google...', 'text-green-600');

        await firebase.auth().signInWithPopup(googleProvider);

        showMessage('Login successful! Redirecting...', 'text-green-600');

        const redirectUrl = getRedirectUrl();
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 1500);

    } catch (error) {
        console.error('Google sign-in error:', error);
        showMessage(error.message, 'text-red-600');
    }
});

// Do the same for Facebook login
// Handle logout
function logoutUser() {
    firebase.auth().signOut().then(() => {
        console.log('User signed out');
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error('Sign out error:', error);
    });
}

// Export the function for use in other files
window.logoutUser = logoutUser;
// This file is not needed as authentication is handled by server.js
// The frontend auth.js handles the client-side authentication logic
// This file can be safely removed or replaced with proper backend authentication middleware