module.exports = asyncErrorHandler => (req, res, next) => 
    Promise.resolve(asyncErrorHandler(req, res, next))
            .catch(next);



//QUESTION: HOW IS THIS ASYNC ERROR FUNCTION WORKING WITH THE NORMAL ERROR FUNCTION? 
// WHERE IS THE NEXT IN CATCH TAKING US??