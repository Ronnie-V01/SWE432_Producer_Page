var express = require('express');
// Session inclusion
var session = require('express-session');
var app = express();


const parser = require('body-parser');

// body parser
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

// Attempt at creating a session model
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {secure: false}
}));

// Mongoose Fields
const mongoose = require('mongoose');
var songData = require('./models/songData');
var playlists = require('./models/playlists');

var db;

// Const db url connection
const url = 'mongodb://127.0.0.1:27017/testWeb';

// Static Files
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/javascript', express.static(__dirname + 'public/javascript'));
app.use('/images', express.static(__dirname + 'public/images'));
app.use('/media', express.static(__dirname + 'public/media'));

// set the view engine to ejs
app.set('views', './views');
app.set('view engine', 'ejs');

// Open connection to Mongo db, and fills the song database with songs, if not filled yet
const main = async() => {
  try{

    // Create connection
    await mongoose.connect(url);
    db = mongoose.connection;

    console.log('connected to db');

    // Check if db is filled, if not fill it, with necessary info
    var currSongData = await songData.find({});
    var currPlaylist = await playlists.find({});

    // if Songs have not been added to the database of songs, adds them
    // Otherwise, skips this step
    if(currSongData.length == 0){
      const songs = [ {title: 'I Bet On Losing Dogs', artist: 'Mitski', songSrc: './media/iBetOnLosingDogs.mp3'},
                      {title: 'Fade Into You', artist: 'Mazzy Star',songSrc: './media/01 Fade into You.m4a'},
                      {title: 'Cheers', artist: 'Faye Webster', songSrc: './media/06 Cheers.m4a'},
                      {title: 'Think About It', artist: 'Dev Lemons', songSrc: './media/06 Think About It.m4a'},
                      {title: 'Baby Came Home 2', artist: 'The Neighbourhood', songSrc: './media/07 Baby Came Home 2 _ Valentines.m4a'},
                      {title: 'My Love Mine All Mine', artist: 'Mitski', songSrc: './media/07 My Love Mine All Mine.m4a'},
                      {title: 'Thunder', artist: 'Lana Del Rey',songSrc: './media/10 thunder.m4a'},
                      {title: 'Ilomilo', artist: 'Billie Eilish', songSrc: './media/11 ilomilo.m4a'},
                      {title: 'Cornerstone', artist: 'Arctic Monkeys', songSrc: './media/cornerstone.m4a'}
                    ];

      // CREATE Song Entries to fill db
      for(let i = 0; i < songs.length; i++){

        const newEntry = {
          title: songs[i].title,
          artist: songs[i].artist,
          songSrc: songs[i].songSrc,
        }

        songData.create(newEntry)
        .then(createEntry =>{
          console.log('Entry created successfully:', createEntry);
        })
        .catch(error =>{
          console.error('Error creating new entry:', error);
        })
      }
    }

    // CREATE a sample playlist entry to test functionality
    if(currPlaylist.length == 0){

      const newEntry = {
        djOwner: 'Mitski',
        totalSongs: 0,
        imgSrc: '/images/mitskiPFP.jpg',
        songs: []
      }

      playlists.create(newEntry)
      .then(createEntry =>{
        console.log('Entry created successfully:', createEntry);
      })
      .catch(error =>{
        console.log('Error creating new entry:', error);
      })
    }
  }
  catch(e){
    console.log(e.messsage);
  }
};

// calls main function for the startup of the db conection
main();


// add's a song to a playlist, and UPDATES the playlist accordingly
app.post('/getSong', async (req, res) => {

  try{

    // Retrieve req body fields necessary for query
    const { songTitle } = req.body;
    const { djOwner } = req.body
    console.log({songTitle});

    // Check if song exists in db
    const song = await songData.findOne({title:songTitle});

    // If song exists
    if(song){

      // Check if playlist exists
      const playlist = await playlists.findOne({djOwner: djOwner});

      // If playlist exists
      if(playlist){


        const newTotalSongs = playlist.totalSongs + 1;

        // UPDATE Condition
        const condition = {djOwner: djOwner};
        // UPDATE Query, pushes new song onto array of songs
        const update = {
          $push: {
            songs: song,
          },

          // UPDATES the total number of songs
          $set: {
            totalSongs: newTotalSongs,
          },
        }

        // IF playlist is not full and exists
        if(playlist.totalSongs < 6){

          // Send UPDATE query
          playlists.updateOne(condition, update)
          .then(result =>{
            res.json({success: true, song});
          })
          .catch(error =>{
            res.status(404).json({success: false, message: 'Failed to update'});
          })
        }
        // IF playlist is full send fail, with err message to alert user
        else{
          res.json({success: false, message: 'Not enough room for new songs'});
        }
      }
      else{
        res.status(404).json({success: false, message: 'Playlist could not be found'});
      }
    }
    // Alert user that the song is not in the db
    else{
      res.status(404).json({success: false, message: 'Song could not be found'});
    }
  }
  catch(error){
    console.log('Error in server', error);
    res.status(500).json({success: false});
  }
})


// REMOVE Song from playlist
app.post('/removeSong', async (req, res) => {

  try{
    // Similar to Add song, get req body for query
    const { songTitle } = req.body;
    const { djOwner } = req.body
    console.log(songTitle);
    const song = await songData.findOne({title: songTitle});

    // Find playlist to edit
    await playlists.findOne({djOwner: djOwner})
    .then(doc =>{

      // When found, find first index of song to be removed, and remove it from the array
      if(doc){
        console.log(song);
        const index = doc.songs.findIndex(song => song.title == songTitle);

        // If there are no songs to remove in the playlist, alert the user via message
        if(doc.totalSongs == 0){
          res.status(404).json({success: false, message:'No songs to remove in playlist'});
        }
        // IF song exists and can be removed
        else if(index != -1){
          doc.totalSongs = doc.totalSongs - 1;
          doc.songs.splice(index, 1);

          // Save changes, and return the playlist, and index for dom manipulation
          doc.save();
          res.json({success: true, doc, index});
        }
        // IF song is not in the playlist, alert the user via message
        else{
          res.status(404).json({success: false, message:'Song is not currently in the playlist'});
        }
      }
    })
    .catch(error =>{
      console.log(error);
      res.status(404).json({success: false, message:'Playlist could not be found'});
    })
  }
  catch(error){
    console.log('Error in server', error);
    res.status(500).json({success: false});
  }
})

//for dom manipulation, get playlist, and send to req
app.post('/getUpdate', async (req, res) => {

  try{
    const { djOwner } = req.body

    const playlist = await playlists.findOne({djOwner:djOwner});

    if(playlist){
      res.json({success: true, playlist})
    }
    else{
      res.status(404).json({success: false, message: 'Playlist could not be found'});
    }
  }
  catch(error){
    console.log('Error in server', error);
    res.status(500).json({success: false});
  }
})

// ATTEMPT at a login, redirects, upon session username enter
app.post('/login', (req, res)=>{
  req.session.username = req.body.username;
  res.redirect('/homepage');
})

// Start page
app.get('/', function(req, res){
  res.render('pages/login');
})

// Producer page, passes title and cssFile as passed in ejs variables 
app.get('/homepage', function(req, res) {
  const title = 'Producer Home Screen';
  const cssFile = '/css/style.css';
  res.render('pages/ProducerPage',{title, cssFile});
});

// dj Playlist page, passes in previous ejs variables, and new db doc, for static and dynamic variable creation
app.get('/djPlaylist', async function(req, res) {
  var playlist = await playlists.findOne({djOwner: 'Mitski'});
  const title = 'DJ Playlist Screen';
  const cssFile = '/css/dj.css';

  res.render('pages/djPlaylist',{
    title,
    cssFile,
    playlist: playlist
  });
});


app.listen(8080);
console.log('Server is listening on port 8080');

app.set('view engine', 'ejs');

