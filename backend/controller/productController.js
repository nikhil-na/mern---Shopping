const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const APIFeatures = require('../utils/apiFeatures');


//NOTE: only admin can access this route
// create new product that will go to => /api/v1/product/new
exports.newProduct = catchAsyncErrors(async (req, res, next) => {

    const product = await Product.create(req.body);

    res.status(201).json({
        sucess: true,
        product
    })
});

//get all products => a/pi/v1/products?keyword=apple
exports.getProducts = catchAsyncErrors(async (req, res, next) => {

    const resPerPage = 4;
    const productCount = await Product.countDocuments();

    //Passing (query, queryString). Keyword is retrieved in the search function inside apiFeatures
    const apiFeatures = new APIFeatures(Product.find(), req.query)
                        .search()
                        .filter()
                        .pagination(resPerPage);
    
    const products = await apiFeatures.query;
    res.status(200).json({
        success: true,
        count: products.length,
        products,
        productCount
    })
})

//get single product details => /api/v1/product/:id
exports.getSingleProduct = catchAsyncErrors(async (req, res, next) => {

    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler('Product not found', 404));
    };

    res.status(200).json({
        success: true,
        product
    })
})

// update products => /api/v1/admin/product/:id
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
    
    let product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler('Product not found', 404));
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });
    
    res.status(200).json({
        success: true,
        product
    })
})

//delete product => /api/v1/admin/product/:id
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findByIdAndDelete(req.params.id);

    if(!product){
        return next(new ErrorHandler('Product not found', 404));
    };

    res.status(200).json({
        success: true,
        message: 'The product has been deleted!'
    })
})