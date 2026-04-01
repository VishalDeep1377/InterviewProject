const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const apiRoutes = require('./routes/api');
const currencyService = require('./services/currencyService');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});


// Main App Routes
app.use('/api', apiRoutes);

// --- Extended Requirements: Integration Layer ---

/**
 * GET /api/analytics/currency
 * Live USD-to-GBP conversion rate fetcher.
 */
app.get('/api/analytics/currency', async (req, res) => {
    const rate = await currencyService.getLiveRate();
    res.json({ success: true, base: "USD", target: "GBP", rate });
});

/**
 * POST /api/orders/sync
 * Mocks a seamless sync of PO data to an external Buyer ERP/System.
 */
app.post('/api/orders/sync', async (req, res) => {
    const { orderId } = req.body;
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log(`[ERP Sync] Successfully pushed Order ID ${orderId} to Buyer API.`);
    res.json({ success: true, message: `PO #${orderId} successfully synced to Buyer ERP.` });
});

app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`PO Insight Backend is running on port ${PORT}`);
  console.log(`CORS is enabled for all origins.`);
});
