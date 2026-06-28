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
const products = await getProducts();

categoryGrid.innerHTML = "";

categories.forEach(category=>{

if(category.status !== "Active" || !category.showHome) return;

const totalProducts = products.filter(product=>

product.category===category.name &&
(product.status || "Active")==="Active"

).length;

categoryGrid.innerHTML += `

<div class="swiper-slide">

<div
class="category-card"
onclick="location.href='shop.html?category=${encodeURIComponent(category.name)}'">

<div class="category-image">

<img
loading="lazy"
decoding="async"
src="${optimizeImage(category.image,600)}"
alt="${category.name}">

</div>

<div class="category-content">

<h3>${category.name}</h3>

<p>${totalProducts} Products</p>

<span>

Shop Now →

</span>

</div>

</div>

</div>

`;

});

initCategorySwiper();

}

let categorySwiper;

function initCategorySwiper(){

if(categorySwiper){

categorySwiper.destroy(true,true);

}

categorySwiper = new Swiper(".categorySwiper",{

loop:true,

speed:600,

spaceBetween:18,

grabCursor:true,

centeredSlides:true,

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

1400:{slidesPerView:5}

}

});

}


/* Render Product Card */

function renderProductCard(product){

const variant = product.variants?.[0];

if(!variant) return "";

const oldPrice = Number(variant.oldPrice || variant.price);
const price = Number(variant.price);

const discount =

oldPrice > price

? Math.round(((oldPrice-price)/oldPrice)*100)

:0;

const rating=(product.rating || 4.8).toFixed(1);

return `

<div class="swiper-slide">

<div class="product-card">



<div class="product-image">

<a href="product.html?id=${product.id}">

<img

loading="lazy"

decoding="async"

src="${optimizeImage(variant.image,700)}"

alt="${product.name}">

</a>

${
discount>0 ?

`<div class="discount-badge">

-${discount}%

</div>`

:""

}

<button

class="product-wishlist"

data-id="${product.id}">

♡

</button>

</div>

<div class="product-content">

<div class="product-category">

${product.category}

</div>

<h3 class="product-title">

${product.name}

</h3>

<div class="product-rating">

★★★★★

<span>

${rating}

</span>

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

<button

class="add-cart-btn"

data-id="${product.id}">

Add To Cart

</button>

<button

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

slidesPerView:5

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

grid.innerHTML="";

const html = products.map(

product=>renderProductCard(product)

).join("");

grid.innerHTML = html;

initProductButtons();
initProductSliders();

}

function initProductButtons(){

document.querySelectorAll(".add-cart-btn")

.forEach(btn=>{

btn.onclick=()=>{

location.href=

`product.html?id=${btn.dataset.id}`;

};

});

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

