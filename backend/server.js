const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const batchRoutes = require('./routes/batches');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/batches', batchRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
