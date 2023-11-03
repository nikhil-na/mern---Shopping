const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Enter your name"],
    },
    email: {
        type: String,
        required: [true, 'Enter your email'],
        lowercase: true,
        unique: true,
        validate: [validator.isEmail, "Enter a valid email"]
    },
    password: {
        type: String,
        required: [true, "Enter a password"],
        minlength: [6, 'Password must be longer than 6 characters'],
        select: false
    },
    // avatar: {
    //     pubic_id: {
    //         type: String,
    //         required: true
    //     }, url : {
    //         type: String,
    //         required: true
    //     }
    // },
    role:{ //Admin or User.
        type: String,
        default: 'user' 
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
})

// Encrypting password
userSchema.pre('save', async function (next) {

    // WHY DOING THIS?? 
    // Without this, the password would be hashed on every save, even when the user is updating unrelated fields. 
    if(!this.isModified('password')){
        next()
    }
    this.password = await bcrypt.hash(this.password, 10);

})

//Compare user password
userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}

// Create JWT token
userSchema.methods.createJwtToken = function(){
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE_TIME
    })
}


module.exports = mongoose.model('user', userSchema);