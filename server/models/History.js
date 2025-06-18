const mongoose = require('mongoose');

const suggestionsSchema = new mongoose.Schema({
    comment:String,
    code:String
}, {_id: false});

const historySchema =  new mongoose.Schema({
    code:String,
    suggestions: [suggestionsSchema],
    timestamp: Date
});

module.exports = mongoose.model('History', historySchema);