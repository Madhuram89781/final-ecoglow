/**
 * Authentication utility functions for the backend server
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Path to users.json file
const usersFilePath = path.join(__dirname, 'users.json');

/**
 * Load users from the JSON file
 * @returns {Array} Array of user objects
 */
const loadUsers = () => {
    try {
        if (fs.existsSync(usersFilePath)) {
            const userData = fs.readFileSync(usersFilePath, 'utf8');
            return JSON.parse(userData);
        }
        return [];
    } catch (error) {
        console.error('Error loading users:', error);
        return [];
    }
};

/**
 * Save users to the JSON file
 * @param {Array} users - Array of user objects
 */
const saveUsers = (users) => {
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('Error saving users:', error);
    }
};

/**
 * Create a new user account
 * @param {string} name - User's name
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Object} Result object with success status and message
 */
const createUser = async (name, email, password) => {
    try {
        const users = loadUsers();
        
        // Check if user already exists
        if (users.find(user => user.email === email)) {
            return { success: false, message: 'User already exists' };
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        const newUser = {
            id: users.length + 1,
            name,
            email,
            password: hashedPassword
        };
        
        users.push(newUser);
        saveUsers(users);
        
        return { success: true, message: 'User created successfully' };
    } catch (error) {
        console.error('Error creating user:', error);
        return { success: false, message: 'Error creating user' };
    }
};

/**
 * Authenticate a user and generate JWT token
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Object} Result object with token and user info if successful
 */
const loginUser = async (email, password) => {
    try {
        const users = loadUsers();
        
        // Find user
        const user = users.find(user => user.email === email);
        if (!user) {
            return { success: false, message: 'Invalid credentials' };
        }
        
        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return { success: false, message: 'Invalid credentials' };
        }
        
        // Create token
        const token = jwt.sign(
            { userId: user.id, email: user.email, name: user.name },
            process.env.JWT_SECRET || 'eco_glow_secure_jwt_secret_key',
            { expiresIn: '1h' }
        );
        
        return { 
            success: true, 
            token, 
            username: user.name 
        };
    } catch (error) {
        console.error('Error logging in:', error);
        return { success: false, message: 'Error logging in' };
    }
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload if valid, null if invalid
 */
const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET || 'eco_glow_secure_jwt_secret_key'
        );
        return decoded;
    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
};

/**
 * Middleware to authenticate requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
    
    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    
    const user = verifyToken(token);
    if (!user) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    req.user = user;
    next();
};

/**
 * Get user by ID
 * @param {number} userId - User ID to find
 * @returns {Object|null} User object if found, null if not found
 */
const getUserById = (userId) => {
    const users = loadUsers();
    return users.find(user => user.id === userId) || null;
};

// Export authentication functions
module.exports = {
    loadUsers,
    saveUsers,
    createUser,
    loginUser,
    verifyToken,
    authenticateToken,
    getUserById
};