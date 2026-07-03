import { auth, db, storage } from "../firebase/firebase-config.js";

import {
doc,
getDoc,
setDoc,
collection,
query,
where,
getDocs,
serverTimestamp,
updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import {
ref,
uploadBytes,
getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import { optimizeImage } from "./services/imageService.js";

const params = new URLSearchParams(location.search);

const productId = params.get("product");
const orderId = params.get("order");

const productBox = document.getElementById("productInfo");
const submitBtn = document.getElementById("submitReview");
const titleInput = document.getElementById("reviewTitle");
const reviewInput = document.getElementById("reviewText");
const imageInput = document.getElementById("reviewImages");

const stars = document.querySelectorAll(".star");

let currentUser = null;
let rating = 0;

onAuthStateChanged(auth, async(user)=>{

if(!user){

location.href="login.html";

return;

}

currentUser=user;

await loadProduct();

await checkExistingReview();

});

async function loadProduct(){

const snap = await getDoc(
doc(db,"products",productId)
);

if(!snap.exists()) return;

const p = snap.data();

const v = p.variants[0];

productBox.innerHTML=`

<img src="${optimizeImage(v.image,500)}">

<div class="product-info">

<h2>${p.name}</h2>

<p>${p.category}</p>

<h3>₹${v.price}</h3>

</div>

`;

}

stars.forEach(star=>{

star.onclick=()=>{

rating = Number(star.dataset.value);

stars.forEach(s=>{

if(Number(s.dataset.value)<=rating){

s.classList.add("active");

}else{

s.classList.remove("active");

}

});

};

});

async function checkExistingReview(){

const q = query(

collection(db,"reviews"),

where("userId","==",currentUser.uid),

where("productId","==",productId)

);

const snap = await getDocs(q);

if(!snap.empty){

submitBtn.disabled=true;

submitBtn.innerHTML="Already Reviewed";

}

}

submitBtn.onclick = async()=>{

if(rating===0){

alert("Please select a rating.");

return;

}

submitBtn.disabled=true;

submitBtn.innerHTML="Submitting...";

try{

const images=[];

for(const file of imageInput.files){

const storageRef = ref(

storage,

`reviews/${productId}/${Date.now()}_${file.name}`

);

await uploadBytes(storageRef,file);

const url = await getDownloadURL(storageRef);

images.push(url);

}

await setDoc(

doc(collection(db,"reviews")),

{

productId,

orderId,

userId:currentUser.uid,

userName:

currentUser.displayName ||

currentUser.email ||

"Customer",

userPhoto:

currentUser.photoURL || "",

rating,

title:titleInput.value.trim(),

review:reviewInput.value.trim(),

images,

verified:true,

helpful:0,

createdAt:serverTimestamp()

}

);

await updateProductSummary();

alert("Thank you for your review ❤️");

location.href="orders.html";

}catch(err){

console.error(err);

alert(err.message);

}

};

async function updateProductSummary(){

const q=query(

collection(db,"reviews"),

where("productId","==",productId)

);

const snap=await getDocs(q);

let total=0;

let count=0;

let r1=0,r2=0,r3=0,r4=0,r5=0;

snap.forEach(doc=>{

const r=doc.data().rating;

total+=r;

count++;

switch(r){

case 1:r1++;break;
case 2:r2++;break;
case 3:r3++;break;
case 4:r4++;break;
case 5:r5++;break;

}

});

const average=

count==0

?0

:Number((total/count).toFixed(1));

await updateDoc(

doc(db,"products",productId),

{

rating:average,

totalReviews:count,

rating1:r1,

rating2:r2,

rating3:r3,

rating4:r4,

rating5:r5

}

);

}

