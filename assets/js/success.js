const audio=document.getElementById("anthem");

const play=document.getElementById("playBtn");

const skip=document.getElementById("skipBtn");

play.onclick=()=>{

play.style.display="none";

audio.play();

};

audio.onended=()=>{

location.replace("my-orders.html");

};

skip.onclick=()=>{

location.replace("my-orders.html");

};