const ErrorHandler = require('../utils/errorHandler');

module.exports = (err, req, res, next) => {
    const statusCode = err.statusCode || 500; 
    const message = err.message || 'Internal Server Error';

    //Wrong mongoose object id error
    if(err.name === 'CastError'){
        const message = `Resource not found, Invalid: ${err.path}`;
        error = new ErrorHandler(message, 400);

        return res.status(statusCode).json({
            sucess: false,
            message
        })
    }

    //Mongoose validation error
    if(err.name === 'ValidationError'){

        // We can see why we doing object.values() if we see the error in postman. 
        // Remove this ERROR HANDLING AND WE CAN SEE!
         const message = Object.values(err.errors).map(value => value.message); 
         error = new ErrorHandler(message, 400);

         return res.status(statusCode).json({
            sucess: false,
            message
        })
    }

    //Mongoose duplicate key errors
    if(err.code === 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        error = new ErrorHandler(message, 400);

        return res.status(statusCode).json({
            sucess: false,
            message
        }) 
    }

    //Wrong JWT error 
    if(err.name === 'JsonWebTokenError'){

         const message = `JSON Web token is invalid. Try Again`; 
         error = new ErrorHandler(message, 400);

         return res.status(statusCode).json({
            sucess: false,
            message
        })
    }

    //Expired JWT error 
    if(err.name === 'TokenExpiredError'){

        const message = `JSON Web token is expired. Try Again`; 
        error = new ErrorHandler(message, 400);

        return res.status(statusCode).json({
           sucess: false,
           message
       })
   }

    res.status(statusCode).json({
        success: false,
        error: err,
        message,
        stack: err.stack
    });
}