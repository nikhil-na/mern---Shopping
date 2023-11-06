const User = require('../models/user');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');


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

// Forgot password => /api/v1/password/forgot
exports.forgotPassword = catchAsyncErrors(async(req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if(!user){
        return next(new ErrorHandler('User not found with this email', 401));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset password URL
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is:\n ${resetUrl}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Shopper password recovery',
            message
        })

        res.status(200).json({
            success: true,
            message: `Email sent to: ${user.email}`
        })
    } catch(err) {

        // See https://chat.openai.com/share/ff7a1f73-55e1-43a9-aaad-4ec796e73bcb 
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });
        
        return next(new ErrorHandler(err.message, 500));

    }
})

// Reset password => /api/v1/password/forgot
exports.resetPassword = catchAsyncErrors(async(req, res, next) => {

    // Hash URL token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        // This token is only available for 30 mins. 
        resetPasswordExpire : { $gt: Date.now() } //Greater than Date.now()
    })

    if(!user){
        return next(new ErrorHandler('Password reset token is invalid or has been expired', 400));
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler('Password does not match', 400));
    }

    //Setup new password
    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);

})

// Get currently logged in user details => /api/v1/me
exports.getUserProfile = catchAsyncErrors( async(req, res, next) => {

    // In auth middleware, we are assigning the id of the currently logged in user in req.user
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
        success: true,
        user
    })
    
}) 

// Update / Change password  =>  /api/v1/password/update 
exports.updatePassword = catchAsyncErrors( async(req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

     // Compare the password. User enters the oldPassword(postman) 
    const isMatched = await user.comparePassword(req.body.oldPassword); 
    
    if(!isMatched){
        return next(new ErrorHandler('Password did not match!', 400));
    }

    // user password in db = entered PW by user
    user.password = req.body.password;

    await user.save();
    
    sendToken(user, 200, res);

})

// Update user profile   => /api/v1/me/update
exports.updateUser = catchAsyncErrors( async(req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    // TODO: UPDATE THE AVATAR

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    if(!user){
        return next(new ErrorHandler('User not found!', 400));
    }

    res.status(200).json({
        success: true,
        user
    })
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


// ADMIN ROUTES

// Get all users   =>   /api/v1/admin/users
exports.allUsers = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        sucess: true,
        users
    })
})

// Get user details  =>   /api/v1/admin/user/:id
exports.getUserDetails = catchAsyncErrors( async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler('User not found!', 400));
    }
    
    res.status(200).json({
        sucess: true,
        user
    })
})

// Update user profile   => /api/v1/admin/user/:id
exports.updateUserProfile = catchAsyncErrors( async(req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    // TODO: UPDATE THE AVATAR

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    if(!user){
        return next(new ErrorHandler('User not found!', 400));
    }

    res.status(200).json({
        success: true,
        user
    })
})

//Delete user profile   => /api/v1/admin/user/:id
exports.deleteUser = catchAsyncErrors( async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if(!user){
        return next(new ErrorHandler('User not found!', 400));
    }

    // TODO: DELETE THE AVATAR

    res.status(200).json({
        success: true,
        message: 'User deleted!'
    })
})