const express = require('express');
const router = express.Router();

const { getProducts, newProduct, getSingleProduct, updateProduct, deleteProduct } = require('../controller/productController');

router.get('/products', getProducts);
router.get('/product/:id', getSingleProduct);

router.post('/admin/product/new', newProduct);
router.put('/admin/product/:id', updateProduct);
router.delete('/admin/product/:id', deleteProduct);

module.exports = router;