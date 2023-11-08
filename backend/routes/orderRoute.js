const express = require('express');
const router = express.Router();

const { newOrder, getSingleOrder, myOrders, allOrders } = require('../controller/orderController');

const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

router.post('/order/new', isAuthenticatedUser, newOrder);
router.get('/order/:id', isAuthenticatedUser, getSingleOrder)
router.get('/orders/me', isAuthenticatedUser, myOrders);

router.get('/admin/orders', isAuthenticatedUser, authorizeRoles('admin'), allOrders);

module.exports = router;