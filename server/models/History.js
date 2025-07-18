const mongoose = require('mongoose');

const suggestionsSchema = new mongoose.Schema({
    comment:String,
    code:String
}, {_id: false});

const historySchema =  new mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    code:String,
    suggestions: [suggestionsSchema],
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('History', historySchema);