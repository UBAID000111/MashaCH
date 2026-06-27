import { db } from "../firebase/firebase-config.js";

import { getCategories } from "./services/categoryService.js";

import { optimizeImage } from "./services/imageService.js";

async function loadHomeCategories(){

const grid=document.getElementById("categoryGrid");

grid.innerHTML="";

const categories=await getCategories();

categories.forEach(c=>{

if(c.status==="Active" && c.showHome){

grid.innerHTML+=`

<div
class="category-card"
onclick="location.href='shop.html?category=${encodeURIComponent(c.name)}'">

<img
loading="lazy"
decoding="async"
src="${optimizeImage(c.image,500)}"
alt="${c.name}">

<h3>${c.name}</h3>

</div>

`;

}

});

}

loadHomeCategories();