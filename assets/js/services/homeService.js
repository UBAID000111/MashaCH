import { auth, db } from "../../firebase/firebase-config.js";

import {
doc,
getDoc,
setDoc,
deleteDoc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import {
    getCategories
} from "./categoryService.js";

import {
    getProducts,
    getNewArrivals,
    getBestSellers,
    getActiveProducts
} from "./productService.js";

import {
    optimizeImage
} from "./imageService.js";



const categoryGrid =
document.getElementById("categoryGrid");

const newArrivalSection =
document.getElementById("newArrivalSection");

const bestSellerSection =
document.getElementById("bestSellerSection");

const allProductSection =
document.getElementById("allProductSection");

const newArrivalGrid =
document.getElementById("newArrivalGrid");

const bestSellerGrid =
document.getElementById("bestSellerGrid");

const allProductsGrid =
document.getElementById("allProductsGrid");



/*Load Categories*/

export async function loadCategories(){

const categories = await getCategories();

let html = "";

categories.forEach(category=>{

    if(category.status !== "Active" || !category.showHome) return;



    html += `

<div class="swiper-slide">

<div
class="category-card"
onclick="location.href='shop.html?category=${encodeURIComponent(category.name)}'">

<div class="category-image">

<img
loading="lazy"
fetchpriority="high"
decoding="async"
src="${optimizeImage(category.image,400)}"
alt="${category.name}">

</div>

<div class="category-content">

<h3>${category.name}</h3>

<p>Explore Collection</p>

<span>Shop Now →</span>

</div>

</div>

</div>

`;

});

categoryGrid.innerHTML = html;

requestAnimationFrame(()=>{

initCategorySwiper();

});
}

let categorySwiper;

function initCategorySwiper(){

if(categorySwiper){

categorySwiper.destroy(true,true);

}

categorySwiper = new Swiper(".categorySwiper",{

loop:true,

speed:500,

observer: true,

observeParents: true,

updateOnImagesReady: true,


preloadImages: true,

spaceBetween:18,

grabCursor:true,

centeredSlides:false,

slidesPerView:2,

autoplay:{
delay:3000,
disableOnInteraction:false
},

pagination:{
el:".categorySwiper .swiper-pagination",
clickable:true
},

breakpoints:{

576:{slidesPerView:2.2},

768:{slidesPerView:3.2},

1024:{slidesPerView:4.2},

1400:{slidesPerView:4.5}

}

});

setTimeout(()=>{
    categorySwiper.update();
},100);

}


/* Render Product Card */

function renderProductCard(product){

const variant = product.variants?.[0];

const allOutOfStock =
product.variants.every(v => Number(v.stock) <= 0);

if(!variant) return "";

const totalStock = variant.sizes.reduce(
    (sum, size) => sum + Number(size.stock || 0),
    0
);

const outOfStock = totalStock <= 0;

const oldPrice = Number(variant.oldPrice || variant.price);
const price = Number(variant.price);

const discount =

oldPrice > price

? Math.round(((oldPrice-price)/oldPrice)*100)

:0;

const rating = Number(product.rating || 0).toFixed(1);

const totalReviews = Number(product.totalReviews || 0);

return `

<div class="swiper-slide">

<div class="product-card ${allOutOfStock ? "out-stock-card" : ""}">



<div class="product-image">

<a href="product.html?id=${product.id}">

<img

loading="lazy"

decoding="async"

src="${optimizeImage(variant.image,500)}"

alt="${product.name}">

${
allOutOfStock
?
`
<div class="out-stock-badge">

OUT OF STOCK

</div>
`
:
""
}

</a>

${
discount>0 ?

`<div class="discount-badge">

-${discount}%

</div>`

:""

}

${
    outOfStock
    ?
    `
    <div class="stock-badge">
    Out of Stock
    </div>
    `
    :
    ""
}

<button

class="product-wishlist"

data-id="${product.id}">

<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" width="22" height="22" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m12 21l-8.8-8.3A5.6 5.6 0 1 1 12 6a5.6 5.6 0 1 1 8.9 6.6z"></path></svg>
                

</button>

</div>

<div class="product-content">

<div class="product-category">

${product.category}

</div>

<h3 class="product-title">

${product.name}

</h3>

<div class="rating">

${
totalReviews > 0
?
`⭐ ${rating} <span>(${totalReviews} Reviews)</span>`
:
`<span class="no-rating">No Reviews Yet</span>`
}

</div>

<div class="price-row">

<div class="current-price">

₹${price}

</div>

${
oldPrice>price ?

`<div class="old-price">

₹${oldPrice}

</div>`

:""

}

</div>

<div class="product-actions">

${
allOutOfStock
?
`
<button
class="add-cart-btn out-stock-btn"
disabled>

Out Of Stock

</button>
`
:
`
<button
class="add-cart-btn"
data-id="${product.id}"
${outOfStock ? "disabled" : ""}>
${outOfStock ? "Out of Stock" : "Add to Cart"}

</button>
`
}

<button


class="quick-view-btn"

data-id="${product.id}">

👁

</button>

</div>

</div>

</div>

</div>



`;

}

/* Render Products */

let productSwipers=[];

function initProductSliders(){

productSwipers.forEach(swiper=>swiper.destroy(true,true));

productSwipers=[];

document.querySelectorAll(".productSwiper")

.forEach(slider=>{

const swiper=new Swiper(slider,{

loop:true,

grabCursor:true,

speed:600,

spaceBetween:20,

slidesPerView:2,

autoplay:{

delay:3500,

disableOnInteraction:false

},

breakpoints:{

576:{

slidesPerView:2.2

},

768:{

slidesPerView:3.2

},

1024:{

slidesPerView:4.2

},

1400:{

slidesPerView:4.5

}

},

pagination:{

el:slider.querySelector(".swiper-pagination"),

clickable:true

}

});

productSwipers.push(swiper);

});

}

function renderProducts(grid,products){

grid.innerHTML="";


const html = products.map(

product=>renderProductCard(product)

).join("");

grid.innerHTML = html;

initProductButtons();
loadWishlistState();
initProductSliders();

}

function initProductButtons(){

document.querySelectorAll(".add-cart-btn").forEach(btn=>{

btn.onclick=()=>{

if(btn.disabled){

return;

}

location.href=`product.html?id=${btn.dataset.id}`;

};

});

document.querySelectorAll(".quick-view-btn").forEach(btn=>{

btn.onclick=()=>{

location.href=`product.html?id=${btn.dataset.id}`;

};

});

document.querySelectorAll(".product-wishlist").forEach(btn=>{

btn.onclick=async()=>{

const user=auth.currentUser;

if(!user){

location.href="login.html";

return;

}

const productId=btn.dataset.id;

const ref=doc(db,"users",user.uid,"wishlist",productId);

const snap=await getDoc(ref);

if(snap.exists()){

await deleteDoc(ref);

btn.innerHTML="♡";

btn.classList.remove("active");

return;

}

const products=await getProducts();

const product=products.find(p=>p.id===productId);

if(!product) return;

const variant=product.variants[0];

await setDoc(ref,{

productId:product.id,

productName:product.name,

category:product.category,

description:product.description || "",

image:variant.image,

price:variant.price,

oldPrice:variant.oldPrice,

discount:Math.round(((variant.oldPrice-variant.price)/variant.oldPrice)*100),

stock:variant.stock,

color:variant.color,

sizes:variant.sizes,

slug:product.slug || "",

addedAt:serverTimestamp()

});

btn.innerHTML="❤";

btn.classList.add("active");

};

});

}


/*load wishlist state
*/

async function loadWishlistState(){

const user=auth.currentUser;

if(!user) return;

const buttons=document.querySelectorAll(".product-wishlist");

for(const btn of buttons){

const ref=doc(db,"users",user.uid,"wishlist",btn.dataset.id);

const snap=await getDoc(ref);

if(snap.exists()){

btn.innerHTML="❤";

btn.classList.add("active");

}

}

}


/* ===========================
NEW ARRIVALS
=========================== */

export async function loadNewArrival(){

const products = await getNewArrivals();

if(products.length===0){

newArrivalSection.style.display="none";

return;

}

newArrivalSection.style.display="block";

renderProducts(

newArrivalGrid,

products.slice(0,10)

);

}

/* ===========================
BEST SELLER
=========================== */

export async function loadBestSeller(){

const products = await getBestSellers();

if(products.length===0){

bestSellerSection.style.display="none";

return;

}

bestSellerSection.style.display="block";

renderProducts(

bestSellerGrid,

products

);

}

/* ===========================
ALL PRODUCTS
=========================== */

export async function loadAllProducts(){

const products = await getActiveProducts();

renderProducts(

allProductsGrid,

products.slice(0,10)

);

}

