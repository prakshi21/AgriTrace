const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('jsonwebtoken');

// Simple mock bcrypt for brevity since bcrypt can be tough to compile on Windows without build tools
// In a production app, use real bcrypt
const hashPassword = (password) => `$2b$10$${password}`;
const comparePassword = (password, hash) => hash === `$2b$10$${password}`;

// Hardcoded users to bypass DB
const hardcodedUsers = [
    { id: 1, role: 'Producer', name: 'AgriSeed Co.', email: 'producer@test.com', password_hash: '$2b$10$password123' },
    { id: 2, role: 'QualityLab', name: 'National Seed Lab', email: 'lab@test.com', password_hash: '$2b$10$password123' },
    { id: 3, role: 'WarehouseManager', name: 'Central Warehouse', email: 'warehouse@test.com', password_hash: '$2b$10$password123' },
    { id: 4, role: 'Distributor', name: 'Regional Distributor', email: 'distributor@test.com', password_hash: '$2b$10$password123' },
    { id: 5, role: 'Admin', name: 'Gov Admin', email: 'admin@test.com', password_hash: '$2b$10$password123' },
    { id: 6, role: 'Transporter', name: 'FastTrack Logistics', email: 'transporter@test.com', password_hash: '$2b$10$password123' }
];

// Login Endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = hardcodedUsers.find(u => u.email === email);
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Allow 'password123' for dummy users for testing
        const valid = password === 'password123';
        
        if (!valid) { 
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name }, 
            process.env.JWT_SECRET || 'myseedprojectsecretkey', 
            { expiresIn: '1d' }
        );

        res.json({ token, user: { id: user.id, role: user.role, name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
