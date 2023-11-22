/* The Javascript file for */

var currSong = 0;


// Add Song
async function addSong(title){

    // determine which dj's playlist we need
    let dj = document.getElementById("djTag").innerHTML;

    try{
        console.log(title);

        // Fetch the getSong post
        const response = fetch('/getSong', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Pass in necessary vals for query
            body: JSON.stringify({
                songTitle: title,
                djOwner: dj
            }),

        })
        .then(response => response.json())
        .then(data => {
            console.log('Server Response', data);

            // IF unsuccessful alert user with appropriate message
            if(!data.success){
                console.log(data.message);
                alert(data.message);
            }
            // Otherwise update dom to reflect backend
            else{
                updateDOM();  
            }
        })
        .catch(error => {
            console.error('Fetch Error1', error);
        })
    }
    catch(error){
        console.error('Fetching Error2:', error);
    }

};

// Remove Song
function removeSong(title){

    let dj = document.getElementById("djTag").innerHTML;
    // Fetch removeSong post
    try{
        console.log(title);
        const response = fetch('/removeSong', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Necessary query vals
            body: JSON.stringify({
                songTitle: title,
                djOwner: dj
            }),

        })
        .then(response => response.json())
        .then(data => {
            console.log('Server Response', data);

            // IF unsuccessful, alert user with appropriate message
            if(!data.success){
                console.log(data.message);
                alert(data.message);
            }
            // IF successful update dom to reflect backend
            else{
                updateDOM();
            
                // Update player and global song pointer using the backend to determine
                // If a song change is necessary upon deletion
                // IF last song was deleted 
                if(data.doc.totalSongs <= 0){
                    audioSource.src = "#";
                    audioPlay.load();
                    document.getElementById("playPause").innerHTML="&#x23F5";
                    currSong = 0;
                    updatePlayText();
                }
                //IF song that was currently playing is deleted
                else if(currSong == data.index){
                    --currSong;
                    playNext();
                }
            }
        })
        .catch(error => {
            console.error('Fetch Error1', error);
        })
    }
    catch(error){
        console.error('Fetching Error2:', error);
    }
};

// DOM updates
function updateDOM(){

    let dj = document.getElementById("djTag").innerHTML;

    // Retrieves the playlist to reflect backend changes to frontend
    try{
        const response = fetch('/getUpdate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                djOwner: dj
            }),

        })
        .then(response => response.json())
        .then(data => {
            console.log('Server Response', data);

            // Checks each field, to see if an item exists, if so, update dom to reflect these changes
            // If not, set dom to default display
            if(data.success){
                let playlist = data.playlist.songs;
                document.getElementById('song1').innerHTML = playlist[0] ? (playlist[0].title + ' - ' + playlist[0].artist) : 'Add song';
                document.getElementById('song2').innerHTML = playlist[1] ? (playlist[1].title + ' - ' + playlist[1].artist) : 'Add song';
                document.getElementById('song3').innerHTML = playlist[2] ? (playlist[2].title + ' - ' + playlist[2].artist) : 'Add song';
                document.getElementById('song4').innerHTML = playlist[3] ? (playlist[3].title + ' - ' + playlist[3].artist) : 'Add song';
                document.getElementById('song5').innerHTML = playlist[4] ? (playlist[4].title + ' - ' + playlist[4].artist) : 'Add song';
                document.getElementById('song6').innerHTML = playlist[5] ? (playlist[5].title + ' - ' + playlist[5].artist) : 'Add song';

            }     
        })
        .catch(error => {
            console.error('Fetch Error1', error);
        })
    }
    catch(error){
        console.error('Fetching Error2:', error);
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

// Retrieve playlist to update dom and reflect backend changes
function updatePlayText(){

    let dj = document.getElementById("djTag").innerHTML;
    try{
        const response = fetch('/getUpdate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                djOwner: dj
            }),

        })
        .then(response => response.json())
        .then(data => {
            console.log('Server Response', data);

            // IF successful, update 'currently playing' box accordingly
            if(data.success){
                const playlist = data.playlist.songs;
                var playText = document.getElementById("currPlaying");

                if(data.playlist.totalSongs <= 0){
                    playText.innerHTML = "Now Playing: ";
                    return 0;
                }
            
                var currTitle = playlist[currSong].title;
                var currArtist = playlist[currSong].artist;
            
                playText.innerHTML = "Now Playing: " + currTitle + " - " + currArtist;
            }     
        })
        .catch(error => {
            console.error('Fetch Error1', error);
        })
    }
    catch(error){
        console.error('Fetching Error2:', error);
    }


}

// Retrieve playlist, to update player according to backend
function playPause(){

    let dj = document.getElementById("djTag").innerHTML;
    try{
        const response = fetch('/getUpdate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                djOwner: dj
            }),

        })
        .then(response => response.json())
        .then(data => {
            console.log('Server Response', data);

            // Play the song currently in queue to play, determine what song it is using the db
            // index of the song in the playlist
            if(data.success){

                const playlist = data.playlist.songs;
                const totalSongs = data.playlist.totalSongs;

                if(totalSongs <= 0){
                    alert('There are currently no songs in the playlist to play');
                    return 0;
                }

                if(audioSource.getAttribute('src') === "#"){
                    audioSource.src = playlist[currSong].songSrc;
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
        })
        .catch(error => {
            console.error('Fetch Error1', error);
        })
    }
    catch(error){
        console.error('Fetching Error2:', error);
    }
}
// Retrieve playlist to alter player according to the backend
function playNext(){
    
    let dj = document.getElementById("djTag").innerHTML;
    try{
        const response = fetch('/getUpdate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                djOwner: dj
            }),

        })
        .then(response => response.json())
        .then(data => {
            console.log('Server Response', data);

            if(data.success){

                const playlist = data.playlist.songs;
                var playlistIndex = currSong;

                if(data.playlist.totalSongs <= 0){
                    alert('No songs found in the current playlist');
                    return 0;
                }
            
                if(data.playlist.totalSongs == (currSong + 1)){
                    currSong = 0;
                }
                else{
                    ++currSong;
                }
            
                audioSource.src = playlist[currSong].songSrc;
            
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
        })
        .catch(error => {
            console.error('Fetch Error1', error);
        })
    }
    catch(error){
        console.error('Fetching Error2:', error);
    }
}

// Retrieve playlist to alter player according to the backend
function playLast(){

    let dj = document.getElementById("djTag").innerHTML;
    try{
        const response = fetch('/getUpdate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                djOwner: dj
            }),

        })
        .then(response => response.json())
        .then(data => {
            console.log('Server Response', data);

            if(data.success){
                const playlist = data.playlist.songs;

                if(data.playlist.totalSongs <= 0){
                    alert('No songs found in the current playlist');
                    return 0;
                }
            
                if(currSong == 0){
                    currSong = data.playlist.totalSongs - 1;
                }
                else{
                    --currSong;
                }
            
                audioSource.src = playlist[currSong].songSrc;
            
                if(!audioPlay.paused){
                    audioPlay.load();
                    updatePlayText();
                    audioPlay.play();
                }
                else{
                    audioPlay.load();
                }
            }     
        })
        .catch(error => {
            console.error('Fetch Error1', error);
        })
    }
    catch(error){
        console.error('Fetching Error2:', error);
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