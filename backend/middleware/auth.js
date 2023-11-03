const User = require("../models/user");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require('jsonwebtoken');

// Checks if user is authenticated or not
exports.isAuthenticatedUser = catchAsyncErrors( async (req, res, next) => {
    const { jwt: token } = req.cookies;

    if(!token) {
        return next(new ErrorHandler('Login first to access this recource', 401))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // We have store the id of user in the payload, so we can get the user by that id and store.
    req.user = await User.findById(decoded.id);

    next();
}) 

// Handling users roles
exports.authorizeRoles = (...roles) => { // ...roles ensures any other roles (admin or editor or)
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`Role (${req.user.role}) not authorized!`, 403));
        }
        next();
    }
}
