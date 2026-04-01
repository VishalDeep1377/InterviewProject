const express = require('express');
const router = express.Router();
const multer = require('multer');

// JWT Auth Middleware Simulation
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || 'supersecretMVPkey999', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Controllers
const authController = require('../controllers/authController');
const uploadController = require('../controllers/uploadController');
const analyticsController = require('../controllers/analyticsController');
const exportController = require('../controllers/exportController');

// Standard Multer Memory Storage Configuration
const mwUpload = multer({ storage: multer.memoryStorage() });

// Public Auth Routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes using authenticateToken
router.post('/upload', authenticateToken, mwUpload.array('files'), uploadController.uploadFiles);

router.get('/orders', authenticateToken, uploadController.getOrders);
router.get('/orders/:id', authenticateToken, uploadController.getOrderDetails);

router.get('/analytics/summary', authenticateToken, analyticsController.getSummary);
router.get('/analytics/supplier', authenticateToken, analyticsController.getSupplierData);
router.get('/analytics/brand', authenticateToken, analyticsController.getBrandData);
router.get('/analytics/categories', authenticateToken, analyticsController.getCategories);
router.get('/analytics/timeline', authenticateToken, analyticsController.getTimelineData);
router.get('/analytics/insights', authenticateToken, analyticsController.getAIInsights);

router.delete('/orders/all', authenticateToken, uploadController.clearAllOrders);
router.delete('/orders/:id', authenticateToken, uploadController.deleteOrder);

router.get('/export/csv', authenticateToken, exportController.exportToCSV);

module.exports = router;
