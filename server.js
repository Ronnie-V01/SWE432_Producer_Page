var express = require('express');
var session = require('express-session');
var app = express();


const parser = require('body-parser');

// body parser
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));
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
var totalSongs;
var songTitles;

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

    await mongoose.connect(url);
    db = mongoose.connection;

    console.log('connected to db');

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

// calls function for the startup of the db conection
main();


app.post('/getSong', async (req, res) => {

  try{
    const { songTitle } = req.body;
    const { djOwner } = req.body
    console.log({songTitle});

    const song = await songData.findOne({title:songTitle});

    if(song){

      const playlist = await playlists.findOne({djOwner: djOwner});
      if(playlist){
        const newTotalSongs = playlist.totalSongs + 1;
        const condition = {djOwner: djOwner};
        const update = {
          $push: {
            songs: song,
          },

          $set: {
            totalSongs: newTotalSongs,
          },
        }

        if(playlist || playlist.totalSongs < 6){

          playlists.updateOne(condition, update)
          .then(result =>{
            res.json({success: true, song});
          })
          .catch(error =>{
            res.status(404).json({success: false, message: 'Failed to update'});
          })
        }
        else{
          res.json({success: false, message: 'Not enough room for new songs'});
        }
      }
      else{
        res.status(404).json({success: false, message: 'Playlist could not be found'});
      }
    }
    else{
      res.status(404).json({success: false, message: 'Song could not be found'});
    }
  }
  catch(error){
    console.log('Error in server', error);
    res.status(500).json({success: false});
  }
})


app.post('/removeSong', async (req, res) => {

  try{
    const { songTitle } = req.body;
    const { djOwner } = req.body
    console.log(songTitle);
    const song = await songData.findOne({title: songTitle});

    await playlists.findOne({djOwner: djOwner})
    .then(doc =>{

      if(doc){
        console.log(song);
        const index = doc.songs.findIndex(song => song.title == songTitle);

        if(doc.totalSongs == 0){
          res.status(404).json({success: false, message:'No songs to remove in playlist'});
        }
        else if(index != -1){
          doc.totalSongs = doc.totalSongs - 1;
          doc.songs.splice(index, 1);
          doc.save();
          res.json({success: true, doc, index});
        }
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

app.post('/login', (req, res)=>{
  req.session.username = req.body.username;
  res.redirect('/homepage');
})

app.get('/', function(req, res){
  res.render('pages/login');
})

// index page
app.get('/homepage', function(req, res) {
  const title = 'Producer Home Screen';
  const cssFile = '/css/style.css';
  res.render('pages/ProducerPage',{title, cssFile});
});

// about page
app.get('/djPlaylist', async function(req, res) {
  var playlist = await playlists.findOne({djOwner: 'Mitski'});
  const title = 'DJ Playlist Screen';
  const cssFile = '/css/dj.css';

  /*console.log(playlist.songs[0]);*/
  res.render('pages/djPlaylist',{
    title,
    cssFile,
    playlist: playlist
  });
});


app.listen(8080);
console.log('Server is listening on port 8080');

app.set('view engine', 'ejs');

