const mongoose = require('mongoose');

const djInfoSchema = new mongoose.Schema({
    name: String,
    imgSrc: String,
});

module.exports = mongoose.model("djInfo", songDataSchema);