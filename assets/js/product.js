import { db } from "../firebase/firebase-config.js";

import {
doc,
getDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ===========================
GET PRODUCT ID
=========================== */

const params = new URLSearchParams(window.location.search);

const productId = params.get("id");

/* ===========================
DOM
=========================== */

const productName = document.getElementById("productName");
const productCategory = document.getElementById("productCategory");
const productDescription = document.getElementById("productDescription");

const mainImage = document.getElementById("mainImage");

const imageLoader=document.getElementById("imageLoader");

const productPrice = document.getElementById("productPrice");
const oldPrice = document.getElementById("oldPrice");

const colorList = document.getElementById("colorList");
const sizeList = document.getElementById("sizeList");

const thumbnailList = document.getElementById("thumbnailList");

const stock = document.getElementById("stock");

let productData;

/* ===========================
LOAD PRODUCT
=========================== */

async function loadProduct(){

const snap = await getDoc(doc(db,"products",productId));

if(!snap.exists()){

document.body.innerHTML="<h2 style='padding:50px;text-align:center;'>Product Not Found</h2>";

return;

}

productData = snap.data();

productName.innerText = productData.name;

productCategory.innerText = productData.category;

productDescription.innerText = productData.description;

loadVariant(0);

loadColorButtons();

}

loadProduct();

/* ===========================
COLOR BUTTONS
=========================== */

function loadColorButtons(){

    colorList.innerHTML="";

    productData.variants.forEach((variant,index)=>{

        const dot=document.createElement("div");

        dot.className="color-dot";

        if(index===0){

            dot.classList.add("active");

        }

        dot.style.background=variant.color.hex;

        dot.title=variant.color.name;

        dot.addEventListener("click",()=>{

            document.querySelectorAll(".color-dot").forEach(d=>{

                d.classList.remove("active");

            });

            dot.classList.add("active");

            loadVariant(index);

        });

        colorList.appendChild(dot);

    });

}



/* ===========================
LOAD VARIANT
=========================== */

function loadVariant(index){

const variant = productData.variants[index];

imageLoader.style.display="block";

mainImage.style.display="none";

mainImage.onload=function(){

imageLoader.style.display="none";

mainImage.style.display="block";

};

mainImage.src=variant.image;

productPrice.innerText = "₹"+variant.price;

oldPrice.innerText = "₹"+variant.oldPrice;


/* ===========================
PRICE & SAVINGS
=========================== */

productPrice.innerText="₹"+variant.price;

oldPrice.innerText="₹"+variant.oldPrice;

const saving=variant.oldPrice-variant.price;

const discount=Math.round(

((variant.oldPrice-variant.price)/variant.oldPrice)*100

);

/* Pink Badge */

const saleBadge=document.querySelector(".sale-badge");

if(saleBadge){

saleBadge.innerText=discount+"% OFF";

}

/* Green Badge */

const discountTag=document.getElementById("discountTag");

if(discountTag){

discountTag.innerHTML=`

<span style="font-weight:700;">✓</span>

Save ₹${saving}

`;

}

stock.innerText = variant.stock+" Available";

loadSizes(variant);

loadGallery(variant);

}

/* ===========================
SIZES
=========================== */

function loadSizes(variant){

    sizeList.innerHTML="";

    variant.sizes.forEach((size,index)=>{

        const btn=document.createElement("button");

        btn.type="button";

        btn.className="size-btn";

        btn.innerText=size;

        if(index===0){
            btn.classList.add("active");
        }

        btn.addEventListener("click",()=>{

            document.querySelectorAll(".size-btn").forEach(b=>{

                b.classList.remove("active");

            });

            btn.classList.add("active");

        });

        sizeList.appendChild(btn);

    });

}

/* ===========================
GALLERY
=========================== */

function loadGallery(variant){

thumbnailList.innerHTML="";

thumbnailList.innerHTML+=`

<img
src="${variant.image}"
class="active"
onclick="changeMainImage(this,'${variant.image}')">

`;

variant.gallery.forEach(img=>{

thumbnailList.innerHTML+=`

<img
src="${img}"
onclick="changeMainImage(this,'${img}')">

`;

});

document.getElementById("imageCount").innerText=

`1 / ${variant.gallery.length+1}`;

}

/* ===========================
MAIN IMAGE
=========================== */

window.changeMainImage=function(el,image){

imageLoader.style.display="block";

mainImage.style.display="none";

mainImage.onload=function(){

imageLoader.style.display="none";

mainImage.style.display="block";

};

mainImage.src=image;

document.querySelectorAll(".thumbnail-list img").forEach(img=>{

img.classList.remove("active");

});

el.classList.add("active");

/* Image Counter */

const images=[...document.querySelectorAll(".thumbnail-list img")];

const current=images.indexOf(el)+1;

document.getElementById("imageCount").innerText=

`${current} / ${images.length}`;

};

document.getElementById("shareBtn")?.addEventListener("click",async()=>{

if(navigator.share){

navigator.share({

title:productData.name,

url:window.location.href

});

}else{

navigator.clipboard.writeText(window.location.href);

alert("Product link copied!");

}

});

const wish=document.getElementById("wishlistBtn");

wish?.addEventListener("click",()=>{

wish.innerHTML="❤";

wish.style.background="#cd104d";

wish.style.color="#fff";

});


const share=document.getElementById("shareBtn");

share?.addEventListener("click",async()=>{

if(navigator.share){

navigator.share({

title:productData.name,

url:window.location.href

});

}else{

navigator.clipboard.writeText(window.location.href);

alert("Product link copied.");

}

});