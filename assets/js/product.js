import { db } from "../firebase/firebase-config.js";

import { optimizeImage } from "./services/imageService.js";

import { getProduct } from "./services/productService.js";

import {
doc,
getDoc,
setDoc,
deleteDoc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import {
auth
} from "../firebase/firebase-config.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

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

let currentUser = null;

const wishlistBtn = document.getElementById("wishlistBtn");
const mobileWishlist = document.getElementById("mobileWishlist");

/* ===========================
LOAD PRODUCT
=========================== */

async function loadProduct(){

productData = await getProduct(productId);

if(!productData){

document.body.innerHTML = `
<h2 style="padding:50px;text-align:center;">
Product Not Found
</h2>
`;

return;

}

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

        dot.dataset.index=index;

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

mainImage.src = optimizeImage(
    variant.image,
    900
);

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
src="${optimizeImage(variant.image,150)}"
class="active"
onclick="changeMainImage(this,'${variant.image}')">

`;

variant.gallery.forEach(img=>{

thumbnailList.innerHTML+=`

<img
src="${optimizeImage(img,150)}"
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

mainImage.src = optimizeImage(
    image,
    900
);

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




const shareBtn = document.getElementById("shareBtn");

if (shareBtn) {

shareBtn.addEventListener("click", async () => {

    try {

        if (navigator.share) {

            await navigator.share({
                title: productData.name,
                text: productData.name,
                url: window.location.href
            });

        } else {

            await navigator.clipboard.writeText(window.location.href);

            alert("Product link copied successfully.");

        }

    } catch (e) {

        console.log(e);

    }

});

}

function setWishlistUI(active){

if(wishlistBtn){

wishlistBtn.innerHTML=active?"❤":"♡";

wishlistBtn.classList.toggle("active",active);

}

if(mobileWishlist){

mobileWishlist.innerHTML=active?"❤":"♡";

mobileWishlist.classList.toggle("active",active);

}

}

async function toggleWishlist(){

if(!currentUser){

alert("Please login first.");

window.location.href="login.html";

return;

}

const ref=doc(
db,
"users",
currentUser.uid,
"wishlist",
productId
);

try{

const snap=await getDoc(ref);

if(snap.exists()){

await deleteDoc(ref);

setWishlistUI(false);

console.log("Removed from wishlist");

return;

}

const userSnap=await getDoc(
doc(db,"users",currentUser.uid)
);

const userData=userSnap.data();


const selectedVariantIndex=
document.querySelector(".color-dot.active")?.dataset.index || 0;

const selectedVariant=
productData.variants[selectedVariantIndex];

const discount=Math.round(
((selectedVariant.oldPrice-selectedVariant.price)
/selectedVariant.oldPrice)*100
);

await setDoc(ref,{

productId,

productName:productData.name,

category:productData.category,

description:productData.description,

image:selectedVariant.image,

price:selectedVariant.price,

oldPrice:selectedVariant.oldPrice,

discount,

stock:selectedVariant.stock,

color:selectedVariant.color,

sizes:selectedVariant.sizes,

slug:productData.slug,

userName:userData.name,

userEmail:userData.email,

userPhone: userData.phone,

addedAt:serverTimestamp()

});

setWishlistUI(true);

console.log("Added to wishlist");

}catch(err){

console.error(err);

alert(err.message);

}

}

async function checkWishlist(){

if(!currentUser) return;

const wishDoc=await getDoc(

doc(
db,
"users",
currentUser.uid,
"wishlist",
productId
)

);

if(wishDoc.exists()){

setWishlistUI(true);

}else{

setWishlistUI(false);

}

}

onAuthStateChanged(auth, async(user)=>{

currentUser=user;

if(user){

checkWishlist();

}

});

wishlistBtn?.addEventListener("click",toggleWishlist);

mobileWishlist?.addEventListener("click",toggleWishlist);