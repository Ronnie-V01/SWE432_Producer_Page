/* The Javascript file for */
class Song{

    constructor(title, artist, src){
        this.title = title;
        this.artist = artist;
        this.src = src;
    }
}

var iBetOnLosingDogs = new Song('I Bet On Losing Dogs', 'Mitski', './media/iBetOnLosingDogs.mp3');
var fadeIntoYou = new Song('Fade Into You', 'Mazzy Star', './media/01 Fade into You.m4a');
var cheers = new Song('Cheers', 'Faye Webster', './media/06 Cheers.m4a');
var thinkAboutIt = new Song('Think About It', 'Dev Lemons', './media/06 Think About It.m4a');
var babyCameHome = new Song('Baby Came Home 2', 'The Neighbourhood', './media/07 Baby Came Home 2 _ Valentines.m4a');
var myLoveMineAllMine = new Song('My Love Mine All Mine', 'Mitski', './media/07 My Love Mine All Mine.m4a');
var thunder = new Song('Thunder', 'Lana Del Rey','./media/10 thunder.m4a');
var ilomilo = new Song('Ilomilo', 'Billie Eilish', './media/11 ilomilo.m4a');
var cornerstone = new Song('Cornerstone', 'Arctic Monkeys', './media/cornerstone.m4a');

var nullSong = new Song('Null', 'Null', 'Null');

let allSongs = [iBetOnLosingDogs, fadeIntoYou, cheers, thinkAboutIt, babyCameHome, myLoveMineAllMine, thunder, ilomilo, cornerstone];

let player = {
    playlist : Array.apply(null, Array(6)),
    status : "paused",
    playlistSize : 0,
    currSong : 0
};

function printSongName(item){

    if(item !== undefined){
      let name = item.title;
       console.log(name);
    }
};

allSongs.forEach(printSongName);

// Add Song
function addSong(title){

    let songFindResult = allSongs.find((Song) => Song.title == title);

    if(songFindResult === undefined){
        console.log('Song could not be found');
        alert('Song could not be found');
    }
    else if(player.playlistSize >= 6){
        console.log('Not enough room for new songs');
        alert('Not enough room for new songs');
    }
    else{
        player.playlist.splice(player.playlistSize, 0, songFindResult);
        ++player.playlistSize;
    }
};


console.log(player.playlistSize);
player.playlist.forEach(printSongName);

// Remove Song
function removeSong(title){

    
    let songFindResult = player.playlist.find((Song) => {
        if(Song != undefined){
            return Song.title == title;
        }
        return undefined;
    });

    let songRemoved = 0;

    if(player.playlistSize <= 0){
        console.log('There are no songs to remove in the current playlist'); 
        alert('There are no songs to remove in the current playlist');
               
    }
    else if(songFindResult === undefined){
        console.log('Song is not in the current playlist');
        alert('Song is not in the current playlist');
        
    }
    else{

        
        for(let index = 0; index < player.playlistSize; index++){

            if(player.playlist[index].title === title && !songRemoved){

                if(player.currSong === index){
                    playNext();
                }

                player.playlist[index] = undefined;
                songRemoved = 1;
                
            }
            else if(songRemoved){
                player.playlist[index - 1] = player.playlist[index];
                player.playlist[index] = undefined;
            }
        }
        --player.playlistSize;
        console.log('Song has been removed');
    }

    if(player.playlistSize === 0){
        audioSource.src = "#";
        document.getElementById("playPause").innerHTML="&#x23F5";
        updatePlayText();
    }
};

// DOM updates
function updateDOM(){

    for(index = 0; index < 6; index++){
        let currSong = undefined;
        switch(index){

            case 0:
                currSong = document.getElementById("song1");
                break;
            case 1:
                currSong = document.getElementById("song2");
                break;
            case 2:
                currSong = document.getElementById("song3");
                break;
            case 3:
                currSong = document.getElementById("song4");
                break;
            case 4:
                currSong = document.getElementById("song5");
                break;
            case 5:
                currSong = document.getElementById("song6");
                break;
            default:
                break;
        }

        if(player.playlist[index] === undefined){
            currSong.innerHTML = "Add Song";
        }
        else{
            currSong.innerHTML = player.playlist[index].title + " - " + player.playlist[index].artist;
        }
    }
    
};


// Add Buttons
const addBtn = document.getElementById("addButton");
const addCancel = document.getElementById("cancelAdd");

let addPopup = document.getElementById("addPopup");

addBtn.addEventListener("click",function(){
    addPopup.classList.add("open-popup");
});

addCancel.addEventListener("click",function(event){
    event.preventDefault();
    addPopup.classList.remove("open-popup");
});


function addValidate(){
    var songName = document.getElementById("addSong");

    if(songName.value.trim() == ""){
        alert('Must not leave the form blank');
        return false
    }
    else{
        addSong(songName.value);
        console.log(songName.value);
        updateDOM();
        addPopup.classList.remove("open-popup");
        songName.value='';
        return false;
    }
}

// Remove Buttons
const removeBtn = document.getElementById("removeButton");
const removeCancel = document.getElementById("cancelRemove");

let removePopup = document.getElementById("removePopup");

removeBtn.addEventListener("click",function(){
    removePopup.classList.add("open-popup");
});

removeCancel.addEventListener("click",function(event){
    event.preventDefault();
    removePopup.classList.remove("open-popup");
});

function remValidate(){
    var songName = document.getElementById("remSong");

    if(songName.value.trim() == ""){
        alert('Must not leave the form blank');
        return false
    }
    else{
        removeSong(songName.value);
        console.log(songName.value);
        updateDOM();
        removePopup.classList.remove("open-popup");
        songName.value='';
        return false;
    }
}

//Player Functionality

var audioPlay = document.getElementById("audio");
var audioSource = document.getElementById("audioSource");
var globalPlaylist = player.playlist

function updatePlayText(){

    var playText = document.getElementById("currPlaying");
    var playlist = player.playlist;

    if(player.playlistSize === 0){
        playText.innerHTML = "Now Playing: ";
        return 0;
    }

    var currTitle = playlist[player.currSong].title;
    var currArtist = playlist[player.currSong].artist;

    playText.innerHTML = "Now Playing: " + currTitle + " - " + currArtist;
}

function playPause(){

    var playlistIndex = player.currSong;


    if(player.playlistSize <= 0){
        alert('There are currently no songs in the playlist to play');
        return 0;
    }

    if(audioSource.getAttribute('src') === "#"){
        audioSource.src = player.playlist[playlistIndex].src;
        audioPlay.load();
        updatePlayText();
    }

    if(audioPlay.paused){
        audioPlay.play();
        document.getElementById("playPause").innerHTML="&#x23F8";
    }
    else{
        audioPlay.pause();
        document.getElementById("playPause").innerHTML="&#x23F5";
    }
}

function playNext(){

    var playlistIndex = player.currSong;
    var playlistSize = player.playlistSize;

    if(playlistSize === 0){
        alert('No songs found in the current playlist');
        return 0;
    }

    if(playlistSize === (playlistIndex + 1)){
        player.currSong = 0;
        playlistIndex = 0;
    }
    else{
        ++player.currSong;
        ++playlistIndex;
    }

    audioSource.src = player.playlist[playlistIndex].src;

    if(!audioPlay.paused){
        audioPlay.load();
        updatePlayText();
        audioPlay.play();
    }
    else{
        audioPlay.load();
        updatePlayText();
    }
}

function playLast(){

    var playlistIndex = player.currSong;
    var playlistSize = player.playlistSize;

    if(playlistSize === 0){
        alert('No songs found in the current playlist');
        return 0;
    }

    if(playlistIndex === 0){
        player.currSong = playlistSize - 1;
        playlistIndex = player.currSong;
    }
    else{
        --player.currSong;
        --playlistIndex;
    }

    audioSource.src = player.playlist[playlistIndex].src;

    if(!audioPlay.paused){
        audioPlay.load();
        updatePlayText();
        audioPlay.play();
    }
    else{
        audioPlay.load();
    }
}


audioPlay.addEventListener("ended", function(){
    playNext();
    audioPlay.play();
});

document.addEventListener('keydown', (event)=>{

    var name = event.key;
    var code = event.code;

    if(event.ctrlKey && code == "Space" ){
        playPause();
    }

    if(event.ctrlKey && name == '.'){
        playNext();

    }

    if(event.ctrlKey && name == ','){
        playLast();
    }

});