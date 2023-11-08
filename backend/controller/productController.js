const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const APIFeatures = require('../utils/apiFeatures');


//NOTE: only admin can access this route
// create new product that will go to => /api/v1/product/new
exports.newProduct = catchAsyncErrors(async (req, res, next) => {
    
    // ADDING USER WHO CREATED THE PRODUCT. ADDED ONE FIELD IN PRODUCT MODEL
    req.body.user = req.user.id; 

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
// to update some properties of a product (name, description etc.)
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

// Create new review   =>  /api/v1/review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }

    // console.log(req.user._id.toString()) ==> 654abe9d4aa372efc53f87af
    // console.log(req.user._id) ==> new ObjectId('654abe9d4aa372efc53f87af')
    // console.log(req.user.id) ==> 654abe9d4aa372efc53f87af

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(
        review => review.user.toString() === req.user._id.toString()
    );

    if(isReviewed) {
        product.reviews.forEach(review => {
            review.comment = comment;
            review.rating = rating;
            
        })
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true
    })

})

// Get product reviews => /api/v1/reviews
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
})

// Delete product reviews => /api/v1/reviews
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);

    const reviews = product.reviews.filter(
        review => review._id.toString() !== req.query.id.toString()
    )

    const numOfReviews = reviews.length;

    const ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / numOfReviews;

    console.log(ratings);

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true
    })
})