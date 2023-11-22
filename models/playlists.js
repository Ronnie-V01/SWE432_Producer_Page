const mongoose = require('mongoose');

const songDataSchema = new mongoose.Schema({
    title: String,
    artist: String,
    songSrc: String
});

const playlistsSchema = new mongoose.Schema({
    djOwner: String,
    totalSongs: Number,
    imgSrc: String,
    songs: [songDataSchema]
});

module.exports = mongoose.model("playlists", playlistsSchema);