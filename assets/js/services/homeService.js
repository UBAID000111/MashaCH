import {
    getCategories
} from "./categoryService.js";

import {
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

categoryGrid.innerHTML = "";

categories.forEach(category=>{

if(category.status==="Active" && category.showHome){

categoryGrid.innerHTML += `

<div class="swiper-slide">

<div
class="category-card"
onclick="location.href='shop.html?category=${encodeURIComponent(category.name)}'">

<img
loading="lazy"
decoding="async"
src="${optimizeImage(category.image,500)}"
alt="${category.name}">

<h3>${category.name}</h3>

</div>

</div>

`;

}

});

function initCategorySwiper(){

new Swiper(".categorySwiper",{

loop:true,

slidesPerView:2,

spaceBetween:15,

speed:350,

grabCursor:true,

centeredSlides:true,

breakpoints:{

640:{
slidesPerView:3
},

768:{
slidesPerView:4
},

1200:{
slidesPerView:5
}

}

});

}

initCategorySwiper();

}


/* Render Product Card */

function renderProductCard(product){

const variant = product.variants[0];

return `

<div class="product-card">

<a href="product.html?id=${product.id}">

<img

loading="lazy"

decoding="async"

src="${optimizeImage(variant.image,700)}"

alt="${product.name}">

</a>

<h3>${product.name}</h3>

<p>

₹${variant.price}

</p>

</div>

`;

}

/* Render Products */

function renderProducts(grid,products){

grid.innerHTML="";

products.forEach(product=>{

grid.innerHTML += renderProductCard(product);

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

