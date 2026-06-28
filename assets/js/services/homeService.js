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

categorySwiper=new Swiper(".categorySwiper",{

loop:true,

speed:350,

spaceBetween:18,

grabCursor:true,

centeredSlides:true,

slidesPerView:2,

breakpoints:{

576:{

slidesPerView:2.4

},

768:{

slidesPerView:3.5

},

1024:{

slidesPerView:4.5

},

1280:{

slidesPerView:5.5

}

}

});

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

