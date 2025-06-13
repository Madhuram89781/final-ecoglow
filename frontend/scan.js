// DOM Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const analyzeTextBtn = document.getElementById('analyzeTextBtn');
const wasteInput = document.getElementById('wasteInput');
const resultsDiv = document.getElementById('results');
const loadingSpinner = document.getElementById('loadingSpinner');
const resultsContent = document.getElementById('resultsContent');
const wasteTypeSpan = document.getElementById('wasteType');
const confidenceSpan = document.getElementById('confidence');
const confidenceBar = document.getElementById('confidenceBar');
const compostingSpan = document.getElementById('composting');
const skincareSpan = document.getElementById('skincare');
const recyclingSpan = document.getElementById('recycling');

// Backend API URL - Dynamically set based on environment
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : window.location.origin;

// Check authentication status when page loads
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    initializeScanPage();
});

// Function to check if user is authenticated
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    
    // If no token is found, show login required message
    if (!token) {
        showLoginRequired();
        return false;
    }
    return true;
}

// Function to show login required message
function showLoginRequired() {
    // Hide the main content
    document.querySelector('main').innerHTML = `
        <div class="flex flex-col items-center justify-center h-screen p-6 text-center">
            <div class="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
                <div class="text-center mb-6">
                    <i class="fas fa-lock text-green-600 text-5xl mb-4"></i>
                    <h2 class="text-3xl font-bold text-green-800 mb-2">Login Required</h2>
                    <p class="text-gray-600 mb-6">You need to be logged in to use the Eco Glow Scan Service.</p>
                    <p class="text-gray-600 mb-6">Create an account or login to access our waste analysis tools and unlock personalized recommendations.</p>
                    <a href="./login.html" class="inline-block bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 transition-all">
                        <i class="fas fa-sign-in-alt mr-2"></i> Login to Continue
                    </a>
                </div>
            </div>
        </div>
    `;
}

// Function to initialize scan page functionality
function initializeScanPage() {
    // Only initialize if user is authenticated and elements exist
    if (!checkAuthStatus() || !dropZone || !fileInput) return;
    
    console.log('Initializing scan interface for authenticated user');
    
    // GSAP animations for the scan page
    gsap.from('.scan-intro', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out'
    });

    gsap.from('.scan-options', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 0.3,
        ease: 'power3.out'
    });

    // Drag-and-drop functionality
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('bg-green-100');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('bg-green-100');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('bg-green-100');
        const files = e.dataTransfer.files;
        if (files.length > 0) handleFile(files[0]);
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) handleFile(fileInput.files[0]);
    });

    // Text input analysis
    if (analyzeTextBtn) {
        analyzeTextBtn.addEventListener('click', () => {
            const foodItem = wasteInput.value.trim();
            if (!foodItem) {
                alert("Please enter the name of the organic waste.");
                return;
            }
            analyzeWasteText(foodItem);
        });
    }

    // Also allow Enter key to submit the form
    if (wasteInput) {
        wasteInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const foodItem = wasteInput.value.trim();
                if (foodItem) {
                    analyzeWasteText(foodItem);
                }
            }
        });
    }
}

/**
 * Format text with markdown-style formatting to HTML
 * Handles **bold**, *italic*, and other basic markdown syntax
 */
function formatMarkdownText(text) {
    if (!text) return '';
    
    // Handle bold formatting (**text**)
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-green-700">$1</strong>');
    
    // Handle italic formatting (*text*)
    text = text.replace(/\*(.*?)\*/g, '<em class="text-green-600">$1</em>');
    
    // Handle bullet points
    text = text.replace(/- (.*?)(?:\n|$)/g, '<li class="ml-4">$1</li>');
    
    // Wrap bullet points in ul if any exist
    if (text.includes('<li')) {
        text = '<ul class="list-disc ml-5 my-2">' + text + '</ul>';
    }
    
    // Add paragraph breaks
    text = text.replace(/\n\n/g, '</p><p class="my-2">');
    
    // Wrap in paragraph if not already wrapped in ul
    if (!text.startsWith('<ul')) {
        text = '<p class="my-2">' + text + '</p>';
    }
    
    return text;
}

/**
 * Handle file upload and send to backend for analysis
 */
async function handleFile(file) {
    // Show results section with loading state
    resultsDiv.classList.remove('hidden');
    loadingSpinner.classList.remove('hidden');
    resultsContent.classList.add('hidden');

    try {
        // Create form data with the file
        const formData = new FormData();
        formData.append('image', file);

        // Get token for authentication
        const token = localStorage.getItem('token');
        
        // Send the file to the backend with authentication
        const response = await fetch(`${API_URL}/image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (response.status === 401 || response.status === 403) {
            // Token is invalid or expired
            localStorage.removeItem('token');
            window.location.href = './login.html?redirect=scan';
            return;
        } else if (!response.ok) {
            throw new Error('Failed to analyze image.');
        }

        const data = await response.json();

        // Hide spinner, show results
        loadingSpinner.classList.add('hidden');
        resultsContent.classList.remove('hidden');

        // Update UI with the results
        wasteTypeSpan.textContent = data.objectName;

        // Set confidence value and progress bar
        const confidenceValue = Math.round(data.confidence * 100) || 95;
        confidenceSpan.textContent = confidenceValue;
        confidenceBar.style.width = `${confidenceValue}%`;

        // Update composting information with formatted text
        if (data.recycleInfo && data.recycleInfo.composting) {
            compostingSpan.innerHTML = formatMarkdownText(data.recycleInfo.composting);
        } else {
            compostingSpan.innerHTML = formatMarkdownText(`${data.objectName} can be added to compost but should be broken into smaller pieces for faster decomposition.`);
        }

        // Update skincare information with formatted text
        if (data.recycleInfo && data.recycleInfo.skincare) {
            skincareSpan.innerHTML = formatMarkdownText(data.recycleInfo.skincare);
        } else {
            skincareSpan.innerHTML = formatMarkdownText(`${data.objectName} may contain beneficial nutrients for skin. Research specific properties for safe DIY applications.`);
        }

        // Update recycling information with formatted text
        recyclingSpan.innerHTML = formatMarkdownText(`Check your local recycling guidelines for proper disposal of ${data.objectName}.`);

        // Add fade-in animation to results
        resultsDiv.classList.add('fade-in');

        // Animate results with GSAP
        gsap.from("#resultsContent > div", {
            opacity: 0,
            y: 20,
            duration: 0.5,
            stagger: 0.2,
            ease: "power2.out"
        });

    } catch (error) {
        console.error('Error:', error);

        // Hide spinner, show results with error message
        loadingSpinner.classList.add('hidden');
        resultsContent.classList.remove('hidden');

        wasteTypeSpan.textContent = 'Error analyzing image';
        confidenceSpan.textContent = '0';
        confidenceBar.style.width = '0%';
        compostingSpan.innerHTML = formatMarkdownText('Could not retrieve composting information.');
        skincareSpan.innerHTML = formatMarkdownText('Could not retrieve skincare information.');
        recyclingSpan.innerHTML = formatMarkdownText('Could not retrieve recycling information.');
    }
}

/**
 * Analyze waste by text input
 */
async function analyzeWasteText(wasteText) {
    // Show results section with loading state
    resultsDiv.classList.remove('hidden');
    loadingSpinner.classList.remove('hidden');
    resultsContent.classList.add('hidden');

    try {
        // Get token for authentication
        const token = localStorage.getItem('token');
        
        // Send the text to the backend with authentication
        const response = await fetch(`${API_URL}/scan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ foodItem: wasteText })
        });

        if (response.status === 401 || response.status === 403) {
            // Token is invalid or expired
            localStorage.removeItem('token');
            window.location.href = './login.html?redirect=scan';
            return;
        } else if (!response.ok) {
            throw new Error('Failed to analyze waste text.');
        }

        const data = await response.json();

        // Process response similar to image analysis
        // Hide spinner, show results
        loadingSpinner.classList.add('hidden');
        resultsContent.classList.remove('hidden');

        // Update UI with the results
        wasteTypeSpan.textContent = data.foodItem || wasteText;

        // Set confidence value and progress bar
        const confidenceValue = 95; // Default confidence for text analysis
        confidenceSpan.textContent = confidenceValue;
        confidenceBar.style.width = `${confidenceValue}%`;

        // Update information sections
        compostingSpan.innerHTML = formatMarkdownText(data.composting || `${wasteText} can be added to compost but should be broken into smaller pieces for faster decomposition.`);
        skincareSpan.innerHTML = formatMarkdownText(data.skincare || `${wasteText} may contain beneficial nutrients for skin. Research specific properties for safe DIY applications.`);
        recyclingSpan.innerHTML = formatMarkdownText(`Check your local recycling guidelines for proper disposal of ${wasteText}.`);
        
        // Add fade-in animation to results
        resultsDiv.classList.add('fade-in');

        // Animate results with GSAP
        gsap.from("#resultsContent > div", {
            opacity: 0,
            y: 20,
            duration: 0.5,
            stagger: 0.2,
            ease: "power2.out"
        });

    } catch (error) {
        console.error('Error:', error);

        // Hide spinner, show results with error message
        loadingSpinner.classList.add('hidden');
        resultsContent.classList.remove('hidden');

        wasteTypeSpan.textContent = 'Error analyzing ' + wasteText;
        confidenceSpan.textContent = '0';
        confidenceBar.style.width = '0%';
        compostingSpan.innerHTML = formatMarkdownText('Could not retrieve composting information.');
        skincareSpan.innerHTML = formatMarkdownText('Could not retrieve skincare information.');
        recyclingSpan.innerHTML = formatMarkdownText('Could not retrieve recycling information.');
    }
}