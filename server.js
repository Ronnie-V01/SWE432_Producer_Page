var express = require('express');
var app = express();

// Static Files
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/javascript', express.static(__dirname + 'public/javascript'));
app.use('/images', express.static(__dirname + 'public/images'));
app.use('/media', express.static(__dirname + 'public/media'));

// set the view engine to ejs
app.set('views', './views');
app.set('view engine', 'ejs');

// index Page
app.get('/', function(req, res) {
  res.render('pages/ProducerPage');
});

// dj Playlist Page
app.get('/djPlaylist', function(req, res) {
  res.render('pages/djPlaylist');
});

app.listen(8080);
console.log('Server is listening on port 8080');

app.set('view engine', 'ejs');

