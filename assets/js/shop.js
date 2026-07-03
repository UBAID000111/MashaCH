import { db } from "../firebase/firebase-config.js";

import {
getProductsPage
} from "./services/productService.js";

import { optimizeImage } from "./services/imageService.js";

import { showToast } from "./services/toastService.js";

/* ==========================================
DOM
========================================== */

const productsGrid=document.getElementById("productsGrid");

const searchInput=document.getElementById("searchInput");

const sortProducts=document.getElementById("sortProducts");

const shopTitle=document.getElementById("shopTitle");

const categoryFilters=document.getElementById("categoryFilters");

const sizeFilters=document.getElementById("sizeFilters");

const colorFilters=document.getElementById("colorFilters");

/* ==========================================
URL CATEGORY
========================================== */

const params=new URLSearchParams(window.location.search);

let selectedCategory=params.get("category");


if(selectedCategory){

shopTitle.innerText=selectedCategory;

}

/* ==========================================
GLOBAL VARIABLES
========================================== */

let allProducts=[];

let filteredProducts=[];

let lastFirestoreDoc=null;

let loadingProducts=false;

let finishedLoading=false;

/* ==========================================
LOAD PRODUCTS
========================================== */

async function loadProducts(){

if(loadingProducts || finishedLoading) return;

loadingProducts=true;

productsGrid.innerHTML+=`

<div class="product-loader"></div>
<div class="product-loader"></div>
<div class="product-loader"></div>
<div class="product-loader"></div>

`;

const result=

await getProductsPage(

lastFirestoreDoc,

24

);

lastFirestoreDoc=result.lastDoc;

finishedLoading=result.finished;

allProducts.push(...result.products);

filteredProducts=[...allProducts];

productsGrid.innerHTML="";

renderProducts(filteredProducts);

loadingProducts=false;

}

/* ==========================================
RENDER PRODUCTS
========================================== */



function renderProducts(products){

productsGrid.innerHTML = "";



productsGrid.innerHTML="";

if(products.length===0){

productsGrid.innerHTML=`

<div class="no-products">

<h2>No Products Found</h2>

</div>

`;

return;

}

console.log(products);

products.forEach(product=>{

console.log(product.name, product.category);


const firstVariant=product.variants[0];

const colorDots=product.variants.map((variant,index)=>`

<span
class="color-dot ${index===0?"active":""}"
style="background:${variant.color.hex};"
data-image="${optimizeImage(variant.image,500)}"
data-price="${variant.price}"
data-oldprice="${variant.oldPrice}">

</span>

`).join("");

productsGrid.innerHTML+=`

<div class="product-card">

<a href="product.html?id=${product.id}">

<img
class="product-image"
src="${optimizeImage(firstVariant.image,500)}"
alt="${product.name}">

</a>

<h3>${product.name}</h3>

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

activateColorSwitch();

}

/* ==========================================
COLOR SWITCH
========================================== */

function activateColorSwitch(){

document.querySelectorAll(".product-card").forEach(card=>{

const image=card.querySelector(".product-image");

const currentPrice=card.querySelector(".current-price");

const oldPrice=card.querySelector(".old-price");

card.querySelectorAll(".color-dot").forEach(dot=>{

dot.addEventListener("click",()=>{

card.querySelectorAll(".color-dot").forEach(d=>{

d.classList.remove("active");

});

dot.classList.add("active");

image.src=dot.dataset.image;

currentPrice.innerText="₹"+dot.dataset.price;

oldPrice.innerText="₹"+dot.dataset.oldprice;

});

});

});

}

/* ==========================================
SEARCH
========================================== */

searchInput.addEventListener("input",applyFilters);

/* ==========================================
SORT
========================================== */

sortProducts.addEventListener("change",applyFilters);

/* ==========================================
APPLY FILTERS
========================================== */

function applyFilters(){

let products=[...allProducts];

products = products.filter(product =>

    (!selectedCategory || product.category === selectedCategory) &&

    product.status !== "Inactive" &&

    product.variants &&
    product.variants.length > 0 &&
    product.variants[0] &&
    product.variants[0].image

);

/* URL Category */

if(selectedCategory){

products=products.filter(product=>

product.category===selectedCategory

);

}

/* Category Dropdown */

const category=document.getElementById("categorySelect")?.value;

if(category){

products=products.filter(product=>

product.category===category

);

}

/* Search */

const keyword=searchInput.value.trim().toLowerCase();

if(keyword){

products=products.filter(product=>

product.name.toLowerCase().includes(keyword)

||

product.category.toLowerCase().includes(keyword)

||

product.description.toLowerCase().includes(keyword)

);

}

/* Size */

const size=document.getElementById("sizeSelect")?.value;

if(size){

products=products.filter(product=>

product.variants.some(v=>

v.sizes.includes(size)

)

);

}

/* Color */

const color=document.getElementById("colorSelect")?.value;

if(color){

products=products.filter(product=>

product.variants.some(v=>

v.color.name===color

)

);

}

/* Price */

/* Price */

const price=document.getElementById("priceSelect")?.value;

if(price){

products=products.filter(product=>{

const amount=product.variants[0].price;

switch(price){

case "0-999":
return amount<=999;

case "1000-1999":
return amount>=1000 && amount<=1999;

case "2000-2999":
return amount>=2000 && amount<=2999;

case "3000":
return amount>=3000;

default:
return true;

}

});

}

/* Sort */

switch(sortProducts.value){

case "low":

products.sort((a,b)=>a.variants[0].price-b.variants[0].price);

break;

case "high":

products.sort((a,b)=>b.variants[0].price-a.variants[0].price);

break;

case "name":

products.sort((a,b)=>a.name.localeCompare(b.name));

break;

case "newest":

products.sort((a,b)=>{

const aTime=a.createdAt?.seconds || 0;

const bTime=b.createdAt?.seconds || 0;

return bTime-aTime;

});

break;

}

filteredProducts = products;

currentPage = 1;

renderProducts(filteredProducts);

}

/* ==========================================
CREATE FILTERS
========================================== */
function createCategoryFilter(){

const categories=[...new Set(allProducts.map(product=>product.category))];

categoryFilters.innerHTML=`

<select id="categorySelect">

<option value="">All Categories</option>

${categories.map(category=>`

<option value="${category}" ${selectedCategory===category?"selected":""}>

${category}

</option>

`).join("")}

</select>

`;

const categorySelect=document.getElementById("categorySelect");

categorySelect.addEventListener("change",()=>{

selectedCategory = categorySelect.value || null;

applyFilters();

});

}

/* ==========================================
SIZE
========================================== */

function createSizeFilter(){

const sizes=[];

allProducts.forEach(product=>{

product.variants.forEach(variant=>{

variant.sizes.forEach(size=>{

if(!sizes.includes(size)){

sizes.push(size);

}

});

});

});

sizes.sort();

sizeFilters.innerHTML=`

<select id="sizeSelect">

<option value="">All Sizes</option>

${sizes.map(size=>`

<option value="${size}">

${size}

</option>

`).join("")}

</select>

`;

document.getElementById("sizeSelect")

.addEventListener("change",applyFilters);

}

/* ==========================================
COLOR
========================================== */

function createColorFilter(){

const colors=[];

allProducts.forEach(product=>{

product.variants.forEach(variant=>{

if(!colors.includes(variant.color.name)){

colors.push(variant.color.name);

}

});

});

colorFilters.innerHTML=`

<select id="colorSelect">

<option value="">All Colors</option>

${colors.map(color=>`

<option value="${color}">

${color}

</option>

`).join("")}

</select>

`;

document.getElementById("colorSelect")

.addEventListener("change",applyFilters);

}

/* ==========================================
PRICE
========================================== */



/* ==========================================
CLEAR FILTERS
========================================== */

function clearFilters(){

searchInput.value="";

sortProducts.selectedIndex=0;

document.getElementById("categorySelect").selectedIndex=0;

document.getElementById("sizeSelect").selectedIndex=0;

document.getElementById("colorSelect").selectedIndex=0;

document.getElementById("priceSelect").selectedIndex=0;

applyFilters();

}

/* ==========================================
PRODUCT COUNT
========================================== */

function updateProductCount(){

let count=document.getElementById("productCount");

if(!count){

count=document.createElement("span");

count.id="productCount";

document.querySelector(".shop-header").appendChild(count);

}

count.innerHTML=`${filteredProducts.length} Products`;

}

/* ==========================================
NO PRODUCT MESSAGE
========================================== */

function showNoProducts(){

productsGrid.innerHTML=`

<div class="no-products">

<img
src="assets/images/no-product.png"
style="width:180px;opacity:.9;">

<h2>No Products Found</h2>

<p>

Try changing filters or search keyword.

</p>

<button
class="clear-btn"
onclick="clearFilters()">

Clear Filters

</button>

</div>

`;

}

/* ==========================================
OVERRIDE RENDER
========================================== */

const oldRender=renderProducts;

renderProducts=function(products){

filteredProducts=products;

if(products.length===0){

showNoProducts();

updateProductCount();

return;

}

oldRender(products);

updateProductCount();

}

document.getElementById("clearFiltersBtn")
.addEventListener("click",clearFilters);

/* ===========================
INFINITE SCROLL
=========================== */

let loadingMore = false;

window.addEventListener("scroll",async()=>{

if(

window.innerHeight+

window.scrollY

>=

document.body.offsetHeight-400

){

await loadProducts();

}

});