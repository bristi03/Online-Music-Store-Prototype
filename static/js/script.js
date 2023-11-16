//An array of objects, where each object is a song. 
// {songs} means destructuring the ojbect from the right.
//Note: the destructing should be key specific. 
//If songs is an key in the object, then only it will get the songs array.

var songs;
// Getting required elemets, const to not allow reinitialization
// let for reinitialization of that elements to update from DOM.

var playerHead = document.getElementById("player");
let playBtn = document.getElementById("playBtn");
let pauseBtn = document.getElementById("pauseBtn");
let seekBar = document.querySelector("#seek-bar");
let forwardBtn = document.getElementById("forward-btn");
let backwardBtn = document.getElementById("backward-btn");
let repeatBtn = document.getElementById("repeat-btn");
let shuffleBtn = document.getElementById("shuffle-btn");
let durationTime = document.querySelector(".duration-time");
const currTime = document.getElementById("current-time");
let cardCollection = document.querySelectorAll(".card__collection_main");
let currentSong = new Audio();
var currentSongId = 0;
var locked=false;
var randomized=false;
//Player is hidden by default and is visible only when a song is clicked.
playerHead.style.display = "none";

let context = null;
let source = null;
let analyser = null;
function mute_unmute(){
    if(currentSong.volume!=0){
        currentSong.pause();
        playBtn.style.display = "inline";
        pauseBtn.style.display = "none"; 
        currentSong.volume=0;
        document.getElementById("volume-bar").value=0;
        document.getElementById("mute").className = "fas fa-volume-down";
    }else{
        currentSong.volume=1;
        document.getElementById("volume-bar").value = 1;
        document.getElementById("mute").className = "fas fa-volume-up";
        currentSong.play();
        playBtn.style.display = "none"; 
        pauseBtn.style.display = "inline";
    }
}
//Function to create card and add functionality to update player head.

const createCard = (song) => {
   
    const card = document.createElement("div");
    const img = document.createElement("img");
    const cardInfo = document.createElement("div");
    const cardName = document.createElement("p");
    const cardArtist = document.createElement("p");

    //Assigning Classes to the elements created.
    card.className = "card";
    cardInfo.className = "card_info";
    cardName.className = "card_name";
    cardArtist.className = "card_artist";

    //Adding the song details to the card.
    cardName.innerHTML = song.name;
    cardArtist.innerHTML = song.artist;
    img.src = song.image_path;
    img.alt = song.name;

    //Structuring the card
    cardInfo.append(cardName, cardArtist);
    card.append(img, cardInfo);

    //Adding functionality to the card to update the player head on click
    card.onclick = function(){
        playerHead.style.display = "flex";
        currentSong = updatePlayer(song);
        currentSongId=song.id;
        playPauseFunc(currentSong);
        forwdBackwdFunc();
    }
    
    //Return the dynamic card element.
    return card;
}

const createTab = (song) => {
   
    const tab = document.createElement("div");
    const img = document.createElement("img");
    const tabInfo = document.createElement("div");
    const tabName = document.createElement("p");
    const tabArtist = document.createElement("p");

    //Assigning Classes to the elements created.
    tab.className = "tab";
    tabInfo.className = "tab_info";
    tabName.className = "tab_name";
    tabArtist.className = "tab_artist";

    //Adding the song details to the card.
    tabName.innerHTML = song.name;
    tabArtist.innerHTML = song.artist;
    img.src = song.image_path;
    img.alt = song.name;

    //Structuring the card
    tabInfo.append(tabName, tabArtist);
    tab.append(img, tabInfo);

    //Adding functionality to the card to update the player head on click
    tab.onclick = function(){
        playerHead.style.display = "flex";
        currentSong = updatePlayer(song);
        currentSongId=song.id;
        playPauseFunc(currentSong);
        forwdBackwdFunc();
    }
    
    //Return the dynamic card element.
    return tab;
}

//Adds functionality to the play and pause buttons to play the current song.
const playPauseFunc = (song) => {
    //Reinitialize the buttons.
    playBtn = document.getElementById("playBtn");
    pauseBtn = document.getElementById("pauseBtn");
    forwardBtn = document.getElementById("forward-btn");
    backwardBtn = document.getElementById("backward-btn");
    repeatBtn = document.getElementById("repeat-btn");
    
    //When the pause button is clicked, the song is paused.
    pauseBtn.addEventListener("click", () => {
        song.pause();
        playBtn.style.display = "inline";
        pauseBtn.style.display = "none"; 
    });

    playBtn.addEventListener("click", () => {
        song.play();
        playBtn.style.display = "none";
        pauseBtn.style.display = "inline";
    });

    
}

const forwdBackwdFunc = () =>{

    forwardBtn.addEventListener('click', ()=> {
        if (currentSongId + 1 >= songs.length) {
            currentSongId = 0;
        } else {
            currentSongId += 1;
        }
        
        currentSong = updatePlayer(songs[currentSongId]);
    });

    backwardBtn.addEventListener('click', () => {
        if (currentSongId == 0) {
            currentSongId = songs.length - 1;
        } else {
            currentSongId -= 1;
        }
        currentSong = updatePlayer(songs[currentSongId]);
    });


    repeatBtn.addEventListener('click', () => {
        if (randomized) {
            shuffleBtn.click();
        }
        locked=!locked;
        if (repeatBtn.style.color == "white"){
            repeatBtn.style.color="rgb(82,82,82)";
        }else{
            repeatBtn.style.color = "white";
        }
        
    });

    shuffleBtn.addEventListener('click', () => {
        
        if(locked){
            repeatBtn.click();
        }
        randomized = !randomized;
        if (shuffleBtn.style.color == "white") {
            shuffleBtn.style.color = "rgb(82,82,82)";
        } else {
            shuffleBtn.style.color = "white";
        }
    });

let volumeBar = document.getElementById("volume-bar");

currentSong.volume = 1;

// Add an event listener to update the volume when the volume bar changes
volumeBar.addEventListener("input", () => {
    currentSong.volume = volumeBar.value;
});

};

const setMusic =(i) => {
    seekBar.value = 0;
    let song =songs[i];
    currentSong = i;

    currTime.innerHTML = '00:00';
    setTimeout(()=>{
        seekBar.max = currentSong.duration;
    },300);
}
//Like and unlike the song and update the card collection for liked songs.
const likeSong = (id, likeBtn, songName) => {
    //id - the id of the song, on which the button is clicked for.
    //likeBtn - The acutal element to update the styling.
    //songName - The name of the song for which button is clicked
    //           as we don't have id for every card, only the name is 
    //           is unique, so we use it cross check the songs object.

    //Reinitialize the collection to get the updated collection from DOM.
    cardCollection = document.querySelectorAll(".card__collection_main");
    //Get the current liked songs from the above collection.
    let likedSongs = cardCollection[0].children;
    //Since it returns a HTMLCollection, array functions can not be performed
    //The likedSongs is converted into an array using the Array object
    //converting it to an actual array using Array.from()l
    likedSongs = Array.from(likedSongs);

    //Check if the global song object is liked or not
    //if liked before, then unlike it, change color of like button
    //and remove that song from the liked songs collection.
    console.log(songs[id]);
    var data={
        "id":id,
    }
    $.ajax({
        type: "POST",
        url: "/like",
        data: JSON.stringify(data),
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (response) {
            console.log(response);
        },
        error: function (error) {
            console.error(error);
            alert(error.responseJSON.message);
        }
    });

    if(songs[id].liked){
        songs[id].liked = false;
        likeBtn.style.color = "grey";
        likedSongs.forEach(songCard => {
            const name = songCard.lastChild.firstChild.innerHTML;
            if(name == songName){
                songCard.style.display = "none";
                songCard.remove();
            }
        });
    //If song is not liked, then like the song,
    //change the color of like button
    //and add that song in the liked song collection.
    } else {
        songs[id].liked = true;
        likeBtn.style.color = "red";
        cardCollection[0].append(createCard(songs[id]));
    }
    //updateStorage();
}

const formatTime =(time) =>{
    let min = Math.floor(time/60);
    if(min<10){
        min = `0${min}`;
    }
    let sec = Math.floor(time%60);
    if(sec<10){
        sec = `0${sec}`;
    }
    return `${min} : ${sec}`;
}

function playNextSong(){
    if(locked){
       currentSong= updatePlayer(songs[currentSongId]);
    }else if(randomized){
        var randomIndex ;
        do {
            randomIndex = Math.floor(Math.random() * songs.length);
        } while (randomIndex === currentSongId);
        currentSongId=randomIndex;
        currentSong=updatePlayer(songs[randomIndex]);
    }else{
        if (currentSongId + 1 >= songs.length) {
            currentSongId = 0;
        } else {
            currentSongId += 1;
        }
        currentSong = updatePlayer(songs[currentSongId]);
    }
}

//update the player head whenever a new song is clicked. 
const updatePlayer = ({ name, artist, song_path, image_path, id, duration,liked }) => {
    //The arugument of the function is a song object
    //We are destructuing it in the arguments directly and using it.
    console.log(id);

    //Setting the new song for the global song object.
    currentSong.setAttribute("src", song_path);

    //Getting the required elements from the player head.
    const songContainer = document.querySelector(".song");
    const artistContainer = document.querySelector(".artist");
    const likeBtn = document.querySelector(".likeBtn");
    const artistImage = document.querySelector(".artist_image");
    const endTime = document.getElementById("end_time");

    playBtn = document.getElementById("playBtn");
    pauseBtn = document.getElementById("pauseBtn");

    //Setting the default to the player head pause and play buttons.
    playBtn.style.display = "inline";
    pauseBtn.style.display = "none";
    
    //Adding the selected song details in the player head.
    songContainer.innerHTML = name;
    artistContainer.innerHTML = artist;
    artistImage.src =image_path;
    
    //Assign the id of the song to the button,
    //Check is song is liked and add the color based on song.liked.
    likeBtn.id = id;
    likeBtn.style.color = "grey";
    
    if(liked){
        likeBtn.style.color = "red";
    }

    //Adding a onclick functionlity to the like button.
    likeBtn.onclick = function () {
        likeSong(likeBtn.id, likeBtn, name);
    }   

    //When the current song is loaded, set it's duration and add it 
    //to the end time element.
    currentSong.onloadedmetadata = () => {
        endTime.innerHTML = duration;

    }
    currentSong.addEventListener('play', function () {
        visualize();
    });
    currentSong.play();
    playBtn.style.display = "none";
    pauseBtn.style.display = "inline"; 
    
    //Return the current song 
    return currentSong;
}

setInterval(()=>{
    seekBar.value = currentSong.currentTime;
    seekBar.max = currentSong.duration;
    currTime.innerHTML= formatTime(currentSong.currentTime);
    if (currentSong.duration == currentSong.currentTime) {
        playNextSong();
    }
},500)

seekBar.addEventListener('change',()=>{
    currentSong.currentTime = seekBar.value;
    
})

//main function that calls all other functions.
//updates the collection by creating the cards and adding them.
const updateCollection = () => {
    //Reinitalize the collection to get the latest from DOM.
    cardCollection = document.querySelectorAll(".card__collection_main");
    //For all collections, using ForEach, we pass in the songs
    //and create cards for each collection.
    cardCollection.forEach((collection, index) => {
        //First collection is always for liked songs, so put
        //liked songs alone in that collection.
        if(index === 0){
            songs.forEach((song) => {
                if(song.liked){
                    collection.append(createCard(song))
                }
            })
        //all other collections put all songs.
        } else {
            songs.forEach((song) => {
                collection.append(createCard(song));
            });
        }
        //for every odd collection, reverse the order of the collection.
        if(index%2 !== 0){
            collection.classList.toggle("reverse");
        }
    })
}


// Once the document if fully loaded, call the update collection function
// and add the functionality to the Spotify Clone.
document.addEventListener("DOMContentLoaded", async () => {
    await fetch('/get_songs') // Update the path accordingly
        .then(response => response.json())
        .then(data => {
            // Destructure the 'songs' array from the data
            
            songs=data.songs;
            // Use the 'songs' variable here or perform any operations needed
            console.log(songs);
             // Just an example to display the 'songs' array in the console
             console.log(location.href);
        })
        .catch(error => {
            console.error('Error fetching the data:', error);
        });
    if (location.href.endsWith("search")) {
        displayAllSongs();
    }
    else if(location.href.startsWith("http://127.0.0.1:8080/playlist")){
        let query_params = new URLSearchParams(window.location.search);
        let category = query_params.get("category");
        filter_songs(category);
    }
    else
        updateCollection();
});

function confirm_logout(){
    let result=confirm("You are about to logout!");
    if(result){
        $.ajax({
            type: "GET",
            url: "/logout",
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (response) {
                console.log(response);
                window.location.href = "/";
            },
            error: function (error) {
                console.error(error);
                alert(error.responseJSON.message);
            }
        });
    }
}


function addSong() {
    const songName = document.getElementById('songName').value;
    const artistName = document.getElementById('artistName').value;
    const category = document.getElementById('category').value;
    const songFile = document.getElementById('songFile').files[0];
    const imageFile = document.getElementById('imageFile').files[0];

    const formData = new FormData();
    formData.append('name', songName);
    formData.append('artist', artistName);
    formData.append('category',category);
    formData.append('song', songFile);
    formData.append('image', imageFile);
    closeModal();
    fetch('/upload_song', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Network response was not ok.');
        })
        .then(data => {
            console.log('Song details uploaded:', data);
            location.reload();
            // Handle success response here
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}



let searchinp = document.getElementById("search-input");
let searchoup = document.getElementById("search-output");

// Function to update the search results in the search-output div
const updateSearchResults = (searchResults) => {
    searchoup.innerHTML = "";

    searchResults.forEach((song) => {
        searchoup.appendChild(createCard(song));
    });
    if(searchResults.length==0){
        searchoup.innerHTML = `<h3 style="color:white">No Mathes Found! You may have mispelled or Song may not yet be available.</h3>`;
    }
};

const searchSongs = (searchTerm) => {
    return songs.filter((song) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const lowerCaseSongName = song.name.toLowerCase();
        const lowerCaseArtist = song.artist.toLowerCase();

        return (
            lowerCaseSongName.includes(lowerCaseSearchTerm) ||
            lowerCaseArtist.includes(lowerCaseSearchTerm)
        );
    });
};

// Function to display all song cards initially
const displayAllSongs = () => {
    songs.forEach((song) => {
        searchoup.appendChild(createCard(song));
    });
};

// Event listener for the search button
const search= () => {
    event.preventDefault();
    const searchTerm = $('#search-input').val().trim().toLowerCase();

    if (searchTerm !== "") {
        const searchResults = searchSongs(searchTerm);
        updateSearchResults(searchResults);
    } else {
        // If the search term is empty, display all songs
        displayAllSongs();
    }
}

function Reset_all() {
    // Get the parent element
    event.preventDefault();
    var parent = document.getElementById('search-output');
    $('#search-input').val('');
    // Remove all children
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
    displayAllSongs();
}

const playlistsongs = (searchTerm) => {
    return songs.filter((song) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const lowerCaseSongName = song.name.toLowerCase();
        const lowerCaseArtist = song.artist.toLowerCase();

        return (
            lowerCaseSongName.includes(lowerCaseSearchTerm) ||
            lowerCaseArtist.includes(lowerCaseSearchTerm)
        );
    });
};

function playlist_bengali(){
    let category_p =document.getElementById("bengali").textContent;
    location.href = "/playlist?category=" + category_p;

}

function playlist_romantic(){
    let category_p =document.getElementById("romantic").textContent;
    location.href = "/playlist?category=" + category_p;

}

function playlist_dance(){
    let category_p =document.getElementById("dance").textContent;
    location.href = "/playlist?category=" + category_p;

}

function playlist_hindi(){
    let category_p =document.getElementById("hindi").textContent;
    location.href = "/playlist?category=" + category_p;

}

function playlist_english(){
    let category_p =document.getElementById("english").textContent;
    location.href = "/playlist?category=" + category_p;

}

function playlist_pop(){
    let category_p =document.getElementById("pop").textContent;
    location.href = "/playlist?category=" + category_p;

}

playlist_out = document.getElementById("playlist-songs")

function filter_songs(category){
    playlist_out.innerHTML ="";
    songs.forEach((song) => {
        if (song.category.toLowerCase().includes(category.toLowerCase())) 
        {
            console.log(song);
            playlist_out.appendChild(createTab(song));
        }
    });
}

function upgrade(){
    window.location.href = "/upgrade";
}


function visualize() {
    
    if (context === null || context.state === 'closed') {
        context = new AudioContext();
        analyser = context.createAnalyser();
        source = context.createMediaElementSource(currentSong);
        source.connect(analyser);
        analyser.connect(context.destination);
    }
    
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    analyser.fftSize = 256;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    const barWidth = (WIDTH / bufferLength) * 2.5;
    let x = 0;

    function renderFrame() {
        requestAnimationFrame(renderFrame);

        x = 0;

        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i] * 0.55;

            const r = barHeight + (20 * (i / bufferLength));
            const g = 210 * (i / bufferLength);
            const b = 60;

            ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
            ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }
    }
    renderFrame();
}