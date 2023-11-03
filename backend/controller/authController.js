const User = require('../models/user');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');


// Register a user => /api/v1/register
exports.registerUser = catchAsyncErrors(async(req, res, next) => {

    const { name, email, password } = req.body;

    const user = await User.create({
        name, 
        email, 
        password,
        // avatar: {
        //     public_id: 'products/dsvbpny402gelwugv2le',
        //     url: 'https://res.cloudinary.com/bookit/image/upload/v1608062030/products/dsvbpny402gelwugv2le.jpg'
        // }
    })

    sendToken(user, 200, res);
}) 

// Login user => /api/v1/login
exports.loginUser = catchAsyncErrors(async(req, res, next) => {

    const { email, password } = req.body;

    if(!email || !password){
        return next(new ErrorHandler('Enter email and password', 400))
    }

    //Find user in database. Explicitly include the password field in the query results.
    const user = await User.findOne({ email }).select('+password'); 

    if(!user){
        return next(new ErrorHandler('User not found!', 401)); 
    }

    //Checks if password is correct or not
    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler('Invalid password!', 401));
    }

    sendToken(user, 200, res)

})

// Logout users  => /api/v1/logout
exports.logOutUser = catchAsyncErrors(async (req, res, next) => {
    res.cookie('jwt', '', {
        maxAge: 1,
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        message: 'Logged out!'
    })
})