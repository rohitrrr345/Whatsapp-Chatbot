const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    address: String,
    phoneNumber: String,
    gender:String,
    age:Number,
    occupation:String,


});

module.exports = mongoose.model('User', userSchema);
