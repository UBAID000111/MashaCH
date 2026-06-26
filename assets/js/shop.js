import { db } from "../firebase/firebase-config.js";

import {
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const productsGrid = document.getElementById("productsGrid");
const title = document.getElementById("shopTitle");

const params = new URLSearchParams(window.location.search);
const selectedCategory = params.get("category");

if(selectedCategory){
    title.innerText = selectedCategory;
}

async function loadProducts(){

    productsGrid.innerHTML = "";

    const snapshot = await getDocs(collection(db,"products"));

    snapshot.forEach(docSnap=>{

        const p = docSnap.data();

        if(selectedCategory && p.category !== selectedCategory){
            return;
        }
        if(!p.variants || p.variants.length===0) return;

const firstVariant = p.variants[0];

const colorDots = p.variants.map((v,index)=>`

<span
class="color-dot ${index===0?'active':''}"
style="background:${v.color.hex}"
onclick="changeVariant(this,
'${v.image}',
'${v.price}',
'${v.oldPrice}')">
</span>

`).join("");

productsGrid.innerHTML += `

<div class="product-card">

<a href="product.html?id=${docSnap.id}">

<img
class="product-image"
src="${firstVariant.image}"
alt="${p.name}">

</a>

<h3>${p.name}</h3>

<div class="color-list">

${colorDots}

</div>

<div class="price">

<span class="current-price">

₹${firstVariant.price}

</span>

<del class="old-price">

₹${firstVariant.oldPrice}

</del>

</div>

</div>

`;
    
    });

}

loadProducts();

window.changeVariant=function(dot,image,price,oldPrice){

const card=dot.closest(".product-card");

card.querySelector(".product-image").src=image;

card.querySelector(".current-price").innerText="₹"+price;

card.querySelector(".old-price").innerText="₹"+oldPrice;

card.querySelectorAll(".color-dot").forEach(d=>d.classList.remove("active"));

dot.classList.add("active");

};