const express = require('express');
const router = express.Router();

const { getProducts, newProduct, getSingleProduct, updateProduct, deleteProduct } = require('../controller/productController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');


router.get('/products', getProducts);
router.get('/product/:id', getSingleProduct);

router.post('/admin/product/new', isAuthenticatedUser, authorizeRoles('admin'), newProduct);
router.put('/admin/product/:id', isAuthenticatedUser, authorizeRoles('admin'), updateProduct);
router.delete('/admin/product/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);

module.exports = router;