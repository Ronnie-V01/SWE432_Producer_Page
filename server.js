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
// Uses Title and cssFile vars to change the necessary dynamic values when rendered
app.get('/', function(req, res) {
  const title = 'Producer Home Screen';
  const cssFile = '/css/style.css';
  res.render('pages/ProducerPage', {title, cssFile});
});

// dj Playlist Page
// Uses Title and cssFile vars to change the necessary dynamic values when rendered
app.get('/djPlaylist', function(req, res) {
  const title = 'DJ Playlist Screen';
  const cssFile = '/css/dj.css';
  res.render('pages/djPlaylist', {title, cssFile});
});

app.listen(8080);
console.log('Server is listening on port 8080');

app.set('view engine', 'ejs');

