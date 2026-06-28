import { db } from "../firebase/firebase-config.js";

import {
collection,
addDoc,
getDocs,
deleteDoc,
doc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ===========================
CLOUDINARY
=========================== */

const CLOUD_NAME="dsg1xbls";
const UPLOAD_PRESET="MashaCh-Video";

/* ===========================
DOM
=========================== */

const titleInput=document.getElementById("videoTitle");
const fileInput=document.getElementById("videoFile");
const uploadBtn=document.getElementById("uploadVideo");
const videoGrid=document.getElementById("videoGrid");

/* ===========================
UPLOAD
=========================== */

uploadBtn.addEventListener("click",uploadVideo);

/* ===========================
UPLOAD VIDEO
=========================== */

async function uploadVideo(){

const title=titleInput.value.trim();

const file=fileInput.files[0];

if(!title){

alert("Enter video title");

return;

}

if(!file){

alert("Select a video");

return;

}

uploadBtn.disabled=true;

uploadBtn.innerText="Uploading...";

try{

const form=new FormData();

form.append("file",file);

form.append("upload_preset",UPLOAD_PRESET);

const res=await fetch(

`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,

{

method:"POST",

body:form

}

);

const json=await res.json();

await addDoc(

collection(db,"media"),

{

title,

url:json.secure_url,

publicId:json.public_id,

active:true,

order:Date.now(),

createdAt:serverTimestamp()

}

);

titleInput.value="";

fileInput.value="";

loadVideos();

alert("Video Uploaded");

}catch(err){

console.log(err);

alert("Upload Failed");

}

uploadBtn.disabled=false;

uploadBtn.innerText="Upload Video";

}

/* ===========================
LOAD VIDEOS
=========================== */

async function loadVideos(){

videoGrid.innerHTML="Loading...";

const snap=await getDocs(collection(db,"media"));

videoGrid.innerHTML="";

const docs=[];

snap.forEach(d=>{

docs.push({

id:d.id,

...d.data()

});

});

docs.sort((a,b)=>a.order-b.order);

docs.forEach(video=>{

videoGrid.innerHTML+=`

<div class="video-card">

<video
src="${video.url}"
muted
loop
controls>

</video>

<div class="video-content">

<div class="status">

${video.active?"Active":"Inactive"}

</div>

<div class="video-title">

${video.title}

</div>

<div class="video-buttons">

<button

class="edit-btn"

onclick="editVideo('${video.id}','${video.title}')">

Edit

</button>

<button

class="delete-btn"

onclick="removeVideo('${video.id}')">

Delete

</button>

</div>

</div>

</div>

`;

});

}

/* ===========================
DELETE
=========================== */

window.removeVideo=async(id)=>{

if(!confirm("Delete Video?")) return;

await deleteDoc(

doc(db,"media",id)

);

loadVideos();

};

/* ===========================
EDIT TITLE
=========================== */

window.editVideo=async(id,title)=>{

const newTitle=prompt(

"Edit Video Title",

title

);

if(!newTitle) return;

const {updateDoc}=await import(

"https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js"

);

await updateDoc(

doc(db,"media",id),

{

title:newTitle

}

);

loadVideos();

};

/* ===========================
INIT
=========================== */

loadVideos();