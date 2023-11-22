const mongoose = require('mongoose');

const songDataSchema = new mongoose.Schema({
    title: String,
    artist: String,
    songSrc: String
});

module.exports = mongoose.model("songData", songDataSchema);