const Order = require('../models/order');
const Product = require('../models/productModel');

const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');


// Create a new order 
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
    const { 
        orderItems, 
        shippingInfo, 
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo
    } = req.body;

    const order = await Order.create({
        orderItems, 
        shippingInfo, 
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt: Date.now(),
        user: req.user._id
    })

    res.status(200).json({
        success: true,
        message: 'Order created successfully',
        order
    })

})

// Get single order   =>   /api/v1/order/:id
exports.getSingleOrder = catchAsyncErrors( async (req, res, next) => {

    //  .populate() populates the user field of the Order model with name and email
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if(!order) {
        return next(new ErrorHandler('Order not found', 404));
    }

    res.status(200).json({
        success: true,
        order
    })
})


// Get loggedin user order   =>   /api/v1/orders/me
exports.myOrders = catchAsyncErrors( async (req, res, next) => {
    const orders = await Order.findOne({ user: req.user.id });

    res.status(200).json({
        success: true,
        orders
    })
})

// Get all orders   =>   /api/v1/admin/orders
exports.allOrders = catchAsyncErrors( async (req, res, next) => {
    const orders = await Order.find();

    // To see the total amount for orders(For FRONTEND)
    let totalAmount = 0;
    orders.forEach(order => {
        totalAmount += order.totalPrice;
    })

    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
})

// Update / Process order - ADMIN   =>   /api/v1/admin/order/:id
exports.updateOrder = catchAsyncErrors( async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if(order.orderStatus === 'Delivered') {
        return next(new ErrorHandler('Order is already delivered', 400));
    }

    order.orderItems.forEach(async orderItem => {
        await updateStock(orderItem.product, orderItem.quantity);

    })

    order.orderStatus = req.body.status;
    order.deliveredAt = Date.now();

    await order.save();

    res.status(200).json({
        success: true
    })
})

async function updateStock(productId, quantity){
    const product = await Product.findById(productId);

    product.stock -= quantity;

    await product.save({
        validateBeforeSave: false
    });
}

// Delete order   =>  /api/v1/admin/order/:id
exports.deleteOrder = catchAsyncErrors( async (req, res, next) => {
    const order = await Order.findByIdAndDelete(req.params.id);

    if(!order) {
        return next(new ErrorHandler('Order not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Order deleted successfully'
    })
})