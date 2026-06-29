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
class="collection-video"
muted
loop
autoplay
playsinline
preload="auto">

<source src="${video.url}" type="video/mp4">

</video>

</div>

`).join("");

    initVideoModal();

    startMarquee();

}

function initVideoModal(){

const modal=document.getElementById("videoModal");

const modalVideo=document.getElementById("modalVideo");

const close=document.getElementById("closeVideo");

document.querySelectorAll(".video-card video").forEach(video=>{

video.onclick=()=>{

cancelAnimationFrame(animationId);

modal.classList.add("active");

modalVideo.src=video.querySelector("source").src;

modalVideo.play();

};

});

close.onclick=()=>{

modalVideo.pause();

modalVideo.removeAttribute("src");

modalVideo.load();

modal.classList.remove("active");




initVideoModal();

const videos = document.querySelectorAll(".collection-video");

Promise.all(
    [...videos].map(video => {
        return new Promise(resolve => {
            if (video.readyState >= 2) {
                resolve();
            } else {
                video.onloadeddata = resolve;
            }
        });
    })
).then(() => {
   
startMarquee();

});

};

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

preload="auto"

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


let animationId;

function startMarquee(){

    cancelAnimationFrame(animationId);

    let position = 0;

    const speed = 0.8;

    function move(){

        const width = track.scrollWidth / 3;

        if(width <= 0){

            animationId = requestAnimationFrame(move);

            return;

        }

        position -= speed;

        if(Math.abs(position) >= width){

            position = 0;

        }

        track.style.transform = `translate3d(${position}px,0,0)`;

        animationId = requestAnimationFrame(move);

    }

    move();

}