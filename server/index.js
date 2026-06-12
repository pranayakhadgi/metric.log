const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const reportsRouter = require('./routes/reports');

const app = express();

//middleware
app.use(cors());
app.use(express.json());

//request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
    next();
});

// routes
app.use('/api/reports', reportsRouter);

// health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`API endpoints: `);
        console.log(` GET /api/health`);
        console.log(` GET /api/reports`);
        console.log(` GET /api/reports/summary`);
        console.log(` POST /api/reports`);
        console.log(` GET /api/reports/week/:week`);
    });
}

module.exports = app;