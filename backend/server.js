const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());



mongoose 
.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch((err)=>console.log(err))
// User Schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isLoggedIn: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Email Schema
const emailSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    isPhishing: {
        type: Boolean,
        required: true
    },
    indicators: [{
        type: String
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);
const Email = mongoose.model('Email', emailSchema);

// Routes

// Register endpoint
app.post('/api/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({
            email,
            password: hashedPassword,
            isLoggedIn: false
        });

        await user.save();
        res.status(201).json({ success: true, message: 'Registration successful' });
    } catch (error) {
        res.status(500).json({ error: 'Error registering user' });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Update login status
        user.isLoggedIn = true;
        await user.save();

        res.json({
            success: true,
            user: {
                email: user.email,
                id: user._id,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'An error occurred while logging in' });
    }
});

// Logout endpoint
app.post('/api/logout', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        
        if (user) {
            user.isLoggedIn = false;
            await user.save();
        }

        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error logging out' });
        res.status(500).json({ error: 'Server error' });
    }
});

// Create Phishing Simulation
app.post('/api/simulations', async (req, res) => {
    try {
        const { sender, subject, body, email } = req.body;

        if (!sender || !subject || !body || !email) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Analyze the email
        const indicators = analyzePhishingIndicators(subject, body);
        const isPhishing = indicators.length > 0;

        const simulation = new Email({
            sender,
            subject,
            body,
            isPhishing,
            indicators,
            createdBy: user._id
        });

        await simulation.save();

        res.status(201).json({
            success: true,
            result: {
                isPhishing,
                indicators,
                simulation: {
                    id: simulation._id,
                    sender,
                    subject,
                    createdAt: simulation.createdAt
                }
            }
        });
    } catch (error) {
        console.error('Simulation error:', error);
        res.status(500).json({
            success: false,
            error: 'Error analyzing email'
        });
    }
});

// Get All Simulations
app.get('/api/simulations', async (req, res) => {
    try {
        const { email } = req.query;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const simulations = await Email.find({ createdBy: user._id })
            .sort({ createdAt: -1 });
        res.json(simulations);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching simulations' });
    }
});

// Analyze Email
app.post('/api/analyze', async (req, res) => {
    try {
        const { sender, subject, body } = req.body;
        const indicators = analyzePhishingIndicators(subject, body);
        const isPhishing = indicators.length > 0;

        res.json({
            isPhishing,
            indicators,
            analysis: {
                sender: analyzeSender(sender),
                subject: analyzeSubject(subject),
                body: analyzeBody(body)
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Helper Functions
function analyzePhishingIndicators(subject, body) {
    const indicators = [];
    const phishingKeywords = [
        'urgent', 'verify', 'account', 'suspended', 'login',
        'confirm', 'bank', 'security', 'update', 'password'
    ];

    // Check subject
    const subjectLower = subject.toLowerCase();
    if (phishingKeywords.some(keyword => subjectLower.includes(keyword))) {
        indicators.push('Suspicious subject keywords');
    }

    // Check urgency in subject
    if (subjectLower.includes('urgent') || subjectLower.includes('immediate')) {
        indicators.push('Urgency in subject');
    }

    // Check body
    const bodyLower = body.toLowerCase();
    if (phishingKeywords.some(keyword => bodyLower.includes(keyword))) {
        indicators.push('Suspicious body keywords');
    }

    // Check for URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = body.match(urlRegex) || [];
    if (urls.length > 0) {
        indicators.push('Contains URLs');
    }

    // Check for personal information requests
    if (bodyLower.includes('ssn') || bodyLower.includes('credit card') || 
        bodyLower.includes('password')) {
        indicators.push('Requests personal information');
    }

    return indicators;
}

function analyzeSender(sender) {
    // Add sender analysis logic
    return {
        suspicious: false,
        reason: 'Sender analysis not implemented'
    };
}

function analyzeSubject(subject) {
    const subjectLower = subject.toLowerCase();
    const urgencyWords = ['urgent', 'immediate', 'action required', 'important'];
    const hasUrgency = urgencyWords.some(word => subjectLower.includes(word));

    return {
        suspicious: hasUrgency,
        reason: hasUrgency ? 'Contains urgency indicators' : 'No urgency detected'
    };
}

function analyzeBody(body) {
    const bodyLower = body.toLowerCase();
    const suspiciousPatterns = [
        'verify your account',
        'confirm your identity',
        'update your information',
        'click here',
        'login to continue'
    ];

    const matches = suspiciousPatterns.filter(pattern => 
        bodyLower.includes(pattern.toLowerCase())
    );

    return {
        suspicious: matches.length > 0,
        matches,
        reason: matches.length > 0 ? 'Contains suspicious patterns' : 'No suspicious patterns detected'
    };
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
