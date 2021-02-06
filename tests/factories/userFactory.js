const mongoose = require('mongoose');

const User = mongoose.model('User');

exports.userFactory = () => {
    return new User({}).save();
};