import { db } from "../firebase/firebase-config.js";

import {
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const track=document.getElementById("videoTrack");

const section=document.querySelector(".video-marquee-section");

/* ==========================
LOAD VIDEOS
========================== */

async function loadVideos(){

try{

const snapshot=await getDocs(collection(db,"media"));

let videos=[];

snapshot.forEach(doc=>{

const data=doc.data();

if(data.active){

videos.push({

id:doc.id,

...data

});

}

});

videos.sort((a,b)=>

(a.order||0)-(b.order||0)

);

if(videos.length===0){

section.style.display="none";

return;

}

renderVideos(videos);

}catch(err){

console.log(err);

section.style.display="none";

}

}

/* ==========================
RENDER
========================== */

function renderVideos(videos){

track.innerHTML="";

const list=[...videos,...videos,...videos];

track.innerHTML=list.map(video=>`

<div class="video-card">

<video
autoplay
muted
loop
playsinline
preload="metadata">

<source src="${video.url}" type="video/mp4">

</video>

</div>

`).join("");

}

/* ==========================
CARD
========================== */

function createCard(video){

return `

<div class="video-card">

<video

playsinline

autoplay

muted

loop

preload="metadata"

loading="lazy"

>

<source

src="${video.url}"

type="video/mp4">

</video>

</div>

`;

}

/* ==========================
INIT
========================== */

loadVideos();