import { db } from "../firebase/firebase-config.js";

import {
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

async function loadHomeCategories(){

const grid=document.getElementById("categoryGrid");

const snapshot=await getDocs(collection(db,"categories"));

grid.innerHTML="";

snapshot.forEach(doc=>{

const c=doc.data();

if(c.status==="Active" && c.showHome){

grid.innerHTML+=`



<div class="category-card" onclick="location.href='shop.html?category=${encodeURIComponent(c.name)}'">

<img src="${c.image}" alt="${c.name}">

<h3>${c.name}</h3>

</div>

`;



}

});

}

loadHomeCategories();