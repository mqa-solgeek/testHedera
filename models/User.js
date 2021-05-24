const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    },
    id_hedera: {
        type: String,
        required: true
    },
    deleted: {
        type: Boolean,
        required: false,
        default: false,
    }
});

module.exports = User = mongoose.model('user', UserSchema);