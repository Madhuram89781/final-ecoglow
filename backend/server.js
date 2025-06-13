const express = require('express');
const multer = require("multer");
const Groq = require("groq-sdk");
const cors = require("cors");
const { ImageAnnotatorClient } = require("@google-cloud/vision");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the frontend directory
app.use(express.static('../frontend'));

// Specific route for favicon.ico
app.get('/favicon.ico', (req, res) => {
  res.sendFile('favicon.svg', { root: '../frontend' });
});

// Disable the deprecated OutgoingMessage.prototype._headers
process.emitWarning = function(warning, type, code, ctor) {
  if (code === 'DEP0066') {
    return;
  }
  return process._originalEmitWarning(warning, type, code, ctor);
};
process._originalEmitWarning = process.emitWarning;

// Path to users.json file
const usersFilePath = path.join(__dirname, 'users.json');

// Load users from file or create empty array
let users = [];
try {
    if (fs.existsSync(usersFilePath)) {
        const userData = fs.readFileSync(usersFilePath, 'utf8');
        users = JSON.parse(userData);
    }
} catch (error) {
    console.error('Error loading users:', error);
}

// Function to save users to file
const saveUsers = () => {
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('Error saving users:', error);
    }
};

// Authentication endpoints
app.post('/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        if (users.find(user => user.email === email)) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = {
            id: users.length + 1,
            name,
            email,
            password: hashedPassword
        };

        users.push(user);
        saveUsers(); // Save to file

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
});

app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = users.find(user => user.email === email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { userId: user.id, email: user.email, name: user.name },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );

        res.json({ token, username: user.name });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
    
    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Existing code for Google Vision and other features
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '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' });

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Initialize Google Vision client with proper auth
let visionClient;
try {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        visionClient = new ImageAnnotatorClient({
            credentials: {
                type: 'service_account',
                project_id: process.env.GOOGLE_PROJECT_ID,
                private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
                private_key: process.env.GOOGLE_PRIVATE_KEY,
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                client_id: process.env.GOOGLE_CLIENT_ID,
                auth_uri: process.env.GOOGLE_AUTH_URI,
                token_uri: process.env.GOOGLE_TOKEN_URI,
                auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
                client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
                universe_domain: process.env.GOOGLE_UNIVERSE_DOMAIN
            }
        });
        console.log("Vision client initialized with environment variable credentials");
    } else {
        visionClient = new ImageAnnotatorClient({
            keyFilename: './final.json'
        });
        console.log("Vision client initialized with local credentials file");
    }
} catch (error) {
    console.error("Failed to initialize Vision client:", error.message);
}

// Function to get peel uses information
async function getPeelUses(foodItem) {
    try {
        console.log(`Getting information for: ${foodItem}`);
        
        // Create a comprehensive prompt for composting information
        const compostingPrompt = `
I need detailed, scientifically accurate information about composting ${foodItem} peels or parts.

Please provide:
1. What specific nutrients ${foodItem} peels add to compost (e.g., nitrogen, potassium, etc.)
2. How quickly they break down compared to other food waste
3. Any special preparation needed (should they be chopped, dried, etc.)
4. Any potential issues with composting this item (acidity concerns, attraction to pests, etc.)
5. Tips for best practices when adding to home composting systems

Format the response as practical, actionable advice for home composters.
`;

        // Create a comprehensive prompt for skincare information
        const skincarePrompt = `
I need detailed, scientifically-backed information about using ${foodItem} peels or parts in natural skincare.

Please provide:
1. The key beneficial compounds or nutrients in ${foodItem} peels for skin health
2. Step-by-step instructions for 1-2 specific DIY skincare applications (masks, scrubs, etc.)
3. What skin types or conditions would benefit most (dry, oily, acne-prone, aging, etc.)
4. Any precautions or warnings about skin sensitivity or allergies
5. How often these treatments should be used for best results

Format the response as practical advice that prioritizes safety and effectiveness.
`;

        // Query for composting tips using improved prompt
        const compostingResponse = await groq.chat.completions.create({
            model: 'llama3-8b-8192',
            messages: [{ role: 'user', content: compostingPrompt }],
            max_tokens: 250,
            temperature: 0.7
        });
        const compostingTip = compostingResponse.choices[0].message.content.trim();
        
        // Query for skincare tips using improved prompt
        const skincareResponse = await groq.chat.completions.create({
            model: 'llama3-8b-8192', 
            messages: [{ role: 'user', content: skincarePrompt }],
            max_tokens: 300,
            temperature: 0.7
        });
        const skincareTip = skincareResponse.choices[0].message.content.trim();
        
        return { 
            compostingTip, 
            skincareTip 
        };
    } catch (error) {
        console.error("Error fetching information from Groq:", error);
        // Return basic fallback text
        return {
            compostingTip: `${foodItem} can likely be composted. Break into smaller pieces for faster decomposition.`,
            skincareTip: `${foodItem} may contain beneficial nutrients for skin. Research specific properties for safe DIY applications.`
        };
    }
}

// API endpoint to scan food item and return peel uses (protected route)
app.post('/scan', authenticateToken, async (req, res) => {
    const { foodItem } = req.body;
    
    if (!foodItem || typeof foodItem !== 'string') {
        return res.status(400).json({ error: 'Please provide a valid food item name.' });
    }
    
    try {
        const { compostingTip, skincareTip } = await getPeelUses(foodItem);
        res.json({
            foodItem,
            composting: compostingTip,
            skincare: skincareTip
        });
    } catch (error) {
        console.error("Error in /scan endpoint:", error);
        res.status(500).json({
            error: "Failed to process your request",
            message: error.message
        });
    }
});

// API endpoint to analyze image (protected route)
app.post("/image", authenticateToken, upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image file provided" });
        }

        // Check if Vision client is properly initialized
        if (!visionClient) {
            return res.status(500).json({ 
                error: "Image processing service unavailable",
                message: "Vision API client could not be initialized" 
            });
        }
        
        const image = req.file.buffer;
        
        // Use the Google Vision API to detect objects from the image
        const [result] = await visionClient.objectLocalization({
            image: { content: image },
        });
        
        // Extract the object with the highest score
        let objectName = "unknown object";
        let score = 0;
        if (result && result.localizedObjectAnnotations && result.localizedObjectAnnotations.length > 0) {
            // Sort by score and get the object with highest confidence
            const sortedObjects = result.localizedObjectAnnotations.sort((a, b) => b.score - a.score);
            objectName = sortedObjects[0].name;
            score = sortedObjects[0].score;
            console.log("Detected Object:", objectName, "with confidence:", score);
        } 
        // Get recycling and skincare information for the detected object
        const { compostingTip, skincareTip } = await getPeelUses(objectName);
        
        // Return object name and information
        res.json({ 
            objectName, 
            confidence: score,
            recycleInfo: {
                composting: compostingTip,
                skincare: skincareTip
            }
        });
    } catch (error) {
        console.error("Error in /image endpoint:", error.message, error.stack);
        res.status(500).json({
            error: "Failed to process image",
            message: error.message
        });
    }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Here you would typically send an email or store in database
        // For now, we'll just log it
        console.log('Contact Form Submission:', {
            name,
            email,
            subject,
            message,
            timestamp: new Date().toISOString()
        });

        res.status(200).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ message: 'Error sending message' });
    }
});

const port = process.env.PORT || 3000;

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});