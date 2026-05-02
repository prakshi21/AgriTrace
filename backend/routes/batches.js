const express = require('express');
const router = express.Router();
const db = require('../config/db');
const fabricGateway = require('../fabricGateway');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Setup for PDF Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'myseedprojectsecretkey');
            req.user = decoded;
            return next();
        } catch (err) {
            return res.status(401).json({ error: 'Invalid Token' });
        }
    }
    return res.status(401).json({ error: 'Authorization required' });
};

// Verify Batch / Get History (Farmer View + Admin View)
// MUST BE PUBLIC!
router.get('/:batchID/history', async (req, res) => {
    try {
        const { batchID } = req.params;
        const bcResult = await fabricGateway.evaluateTransaction('GetBatchHistory', batchID);
        // We can optionally pull real DB stats too
        const [dbResult] = await db.query('SELECT * FROM Inventory WHERE batch_id = ?', [batchID]);
        const currentDetails = dbResult.length > 0 ? dbResult[0] : null;

        res.json({ history: bcResult, currentDetails });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.use(authenticate);

// Initialize Fabric connection
fabricGateway.init().catch(console.error);

// 1. Create Batch (Producer)
router.post('/create', async (req, res) => {
    try {
        const { batchID, cropDetails, quantity, dateOfProduction, dateOfExpiry } = req.body;
        const owner = req.user.name;

        const bcResult = await fabricGateway.submitTransaction('CreateBatch', batchID, cropDetails, quantity.toString(), dateOfProduction, dateOfExpiry, req.user.id.toString(), owner);

        await db.query(
            'INSERT INTO Inventory (user_id, producer_id, batch_id, quantity, crop_details, date_of_production, date_of_expiry, status, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [req.user.id, req.user.id, batchID, quantity, cropDetails, dateOfProduction, dateOfExpiry, 'Created', 'Producer Facility']
        );

        res.status(201).json({ message: 'Batch created', blockchainResult: bcResult });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Send to Lab (Producer)
router.post('/send-to-lab', async (req, res) => {
    try {
        const { batchID, labId } = req.body;
        const bcResult = await fabricGateway.submitTransaction('SendToLab', batchID, labId.toString(), req.user.id.toString(), req.user.name);
        
        await db.query(
            'UPDATE Inventory SET status = ?, lab_id = ?, user_id = ? WHERE batch_id = ?',
            ['Sent to Lab', labId, labId, batchID] // Assign user_id to lab temporarily so they see it
        );
        res.json({ message: 'Sent to lab', blockchainResult: bcResult });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Receive at Lab (Lab)
router.post('/lab-receive', async (req, res) => {
    try {
        const { batchID } = req.body;
        const bcResult = await fabricGateway.submitTransaction('ReceiveAtLab', batchID, req.user.id.toString(), req.user.name);
        
        await db.query('UPDATE Inventory SET status = ?, location = ? WHERE batch_id = ?', ['Received by Lab', 'Quality Lab Facility', batchID]);
        res.json({ message: 'Received at Lab', blockchainResult: bcResult });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Certify / Reject Batch (Lab)
router.post('/evaluate', upload.single('verificationPdf'), async (req, res) => {
    try {
        const { batchID, qualityGrade, status } = req.body; // status: 'Certified' or 'Rejected'
        let pdfHash = 'N/A';

        if (req.file) {
            const fileBuffer = fs.readFileSync(req.file.path);
            const hashSum = crypto.createHash('sha256');
            hashSum.update(fileBuffer);
            pdfHash = hashSum.digest('hex');
        }

        let bcResult;
        if (status === 'Certified') {
            bcResult = await fabricGateway.submitTransaction('CertifyBatch', batchID, qualityGrade, pdfHash, req.user.id.toString(), req.user.name);
        } else {
            bcResult = await fabricGateway.submitTransaction('RejectBatch', batchID, qualityGrade, pdfHash, req.user.id.toString(), req.user.name);
        }
        
        await db.query(
            'UPDATE Inventory SET status = ?, quality_grade = ?, pdf_hash = ? WHERE batch_id = ?',
            [status, qualityGrade, pdfHash, batchID]
        );
        res.json({ message: `Batch ${status}`, pdfHash, blockchainResult: bcResult });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Dispatch to Transport (Lab)
router.post('/dispatch', async (req, res) => {
    try {
        const { batchID, transporterId } = req.body;
        const bcResult = await fabricGateway.submitTransaction('DispatchToTransport', batchID, transporterId.toString(), req.user.id.toString(), req.user.name);
        
        await db.query(
            'UPDATE Inventory SET status = ?, transporter_id = ?, user_id = ? WHERE batch_id = ?',
            ['In Transport', transporterId, transporterId, batchID] // Assign user_id to transporter
        );
        res.json({ message: 'Dispatched to Transport', blockchainResult: bcResult });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6. Update Location (Transporter)
router.post('/update-location', async (req, res) => {
    try {
        const { batchID, location } = req.body;
        const bcResult = await fabricGateway.submitTransaction('UpdateLocation', batchID, location, req.user.id.toString(), req.user.name);
        
        await db.query('UPDATE Inventory SET location = ? WHERE batch_id = ?', [location, batchID]);
        res.json({ message: 'Location updated', blockchainResult: bcResult });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6b. Dropoff (Transporter)
router.post('/dropoff', async (req, res) => {
    try {
        const { batchID, warehouseId } = req.body;
        // Pass visibility to the warehouse, status becomes pending confirmation
        await db.query(
            'UPDATE Inventory SET status = ?, warehouse_id = ?, user_id = ? WHERE batch_id = ?',
            ['Awaiting Warehouse Receipt', warehouseId, warehouseId, batchID]
        );
        res.json({ message: 'Dropped off at warehouse' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 7. Warehouse Receive
router.post('/warehouse-receive', async (req, res) => {
    try {
        const { batchID } = req.body;
        const bcResult = await fabricGateway.submitTransaction('ReceiveAtWarehouse', batchID, req.user.id.toString(), req.user.name);
        
        await db.query(
            'UPDATE Inventory SET status = ?, warehouse_id = ?, user_id = ?, location = ?, date_of_delivery = CURRENT_DATE WHERE batch_id = ?',
            ['With Warehouse', req.user.id, req.user.id, 'Warehouse Facility', batchID]
        );
        res.json({ message: 'Warehouse received', blockchainResult: bcResult });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 8. Warehouse Action (Sell / Expire)
router.post('/warehouse-action', async (req, res) => {
    try {
        const { batchID, action } = req.body; // action: 'Sold' or 'Expired'
        let bcResult;

        if (action === 'Sold') {
            bcResult = await fabricGateway.submitTransaction('MarkSold', batchID, req.user.id.toString(), req.user.name);
            await db.query('UPDATE Inventory SET status = ? WHERE batch_id = ?', ['Sold to Farmer', batchID]);
        } else if (action === 'Expired') {
            bcResult = await fabricGateway.submitTransaction('MarkExpired', batchID, req.user.id.toString(), req.user.name);
            await db.query('UPDATE Inventory SET status = ? WHERE batch_id = ?', ['Expired', batchID]);
        }

        res.json({ message: `Marked as ${action}`, blockchainResult: bcResult });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Dynamic Inventory Querying based on role
router.get('/inventory', async (req, res) => {
    try {
        let query = 'SELECT * FROM Inventory WHERE user_id = ?';
        let params = [req.user.id];
        
        if (req.user.role === 'Admin') {
            query = 'SELECT * FROM Inventory ORDER BY last_updated DESC';
            params = [];
        } else {
            query += ' ORDER BY last_updated DESC';
        }

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Users by Role (helper for dropdowns)
router.get('/users/role/:role', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, name FROM Users WHERE role = ?', [req.params.role]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



module.exports = router;
