// Create and send token and save in the cookie. 

const sendToken = (user, statusCode, res) => {

    // Create Jwt token
    const token = user.createJwtToken();

    // Options for cookie
    const options = {
        maxAge: process.env.COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000,
        httpOnly: true
    }

    res.cookie('jwt', token, options);
    res.status(statusCode).json({
        success: true,
        token,
        user
    })
}

module.exports = sendToken;