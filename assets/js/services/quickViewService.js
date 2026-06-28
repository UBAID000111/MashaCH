import { getProduct } from "./productService.js";
import { optimizeImage } from "./imageService.js";

let currentProduct = null;
let currentVariant = null;
let qty = 1;

const modal = document.getElementById("quickViewModal");
const content = document.getElementById("quickContent");

/* ==========================================
OPEN QUICK VIEW
========================================== */

export async function quickView(productId){

const product = await getProduct(productId);

if(!product) return;

currentProduct = product;

currentVariant = product.variants[0];

qty = 1;

render();

modal.classList.add("active");

document.body.style.overflow = "hidden";

}

/* ==========================================
CLOSE
========================================== */

export function closeQuickView(){

modal.classList.remove("active");

document.body.style.overflow = "";

}

/* ==========================================
RENDER
========================================== */

function render(){

const oldPrice =
Number(currentVariant.oldPrice || currentVariant.price);

const price =
Number(currentVariant.price);

const discount =
oldPrice>price
?
Math.round(
((oldPrice-price)/oldPrice)*100
)
:0;

const saving =
oldPrice-price;

content.innerHTML = `

<div class="quick-content">

<div class="quick-images">

<div
class="quick-thumbs"
id="quickThumbs">

${renderThumbs()}

</div>

<div class="quick-main">

<img
id="quickMainImage"
src="${optimizeImage(currentVariant.image,900)}">

</div>

</div>

<div class="quick-info">

<div class="quick-category">

${currentProduct.category}

</div>

<h2>

${currentProduct.name}

</h2>

<div class="quick-rating">

★★★★★
(${currentProduct.rating || "4.8"})

</div>

<div class="quick-price">

<div class="quick-current">

₹${price}

</div>

<div class="quick-old">

₹${oldPrice}

</div>

</div>

${
discount>0
?

`<div class="quick-save">

Save ₹${saving}
(${discount}% OFF)

</div>`

:""

}

<div class="quick-title">

Colors

</div>

<div
class="quick-colors"
id="quickColors">

${renderColors()}

</div>

<div class="quick-title">

Sizes

</div>

<div
class="quick-sizes"
id="quickSizes">

${renderSizes()}

</div>

<div class="quick-title">

Quantity

</div>

<div class="quick-qty">

<button
id="qtyMinus">

−

</button>

<span
id="qtyValue">

${qty}

</span>

<button
id="qtyPlus">

+

</button>

</div>

<div class="quick-actions">

<button
class="quick-cart">

Add To Cart

</button>

<button
class="quick-buy">

Buy Now

</button>

</div>

</div>

</div>

`;

bindEvents();

}

/* ==========================================
THUMBNAILS
========================================== */

function renderThumbs(){

let html = `

<img
class="active"
src="${optimizeImage(currentVariant.image,200)}">

`;

(currentVariant.gallery || []).forEach(img=>{

html += `

<img
src="${optimizeImage(img,200)}">

`;

});

return html;

}

/* ==========================================
COLORS
========================================== */

function renderColors(){

let html = "";

currentProduct.variants.forEach((variant,index)=>{

html += `

<div

class="quick-color
${variant.color.name===currentVariant.color.name?"active":""}"

data-index="${index}"

style="background:${variant.color.hex}">

</div>

`;

});

return html;

}

/* ==========================================
SIZES
========================================== */

function renderSizes(){

let html = "";

(currentVariant.sizes || []).forEach((size,index)=>{

html += `

<div

class="quick-size
${index===0?"active":""}">

${size}

</div>

`;

});

return html;

}

/* ==========================================
EVENTS
========================================== */

function bindEvents(){

document
.querySelectorAll(".quick-color")
.forEach(color=>{

color.onclick=()=>{

currentVariant =
currentProduct.variants[
Number(color.dataset.index)
];

render();

};

});

document
.querySelectorAll(".quick-size")
.forEach(size=>{

size.onclick=()=>{

document
.querySelectorAll(".quick-size")
.forEach(s=>s.classList.remove("active"));

size.classList.add("active");

};

});

document
.getElementById("qtyPlus")
.onclick=()=>{

qty++;

document
.getElementById("qtyValue")
.innerText=qty;

};

document
.getElementById("qtyMinus")
.onclick=()=>{

if(qty>1){

qty--;

document
.getElementById("qtyValue")
.innerText=qty;

}

};

document
.querySelector(".quick-close")
.onclick=closeQuickView;

document
.querySelector(".quick-overlay")
.onclick=closeQuickView;

document
.onkeydown=e=>{

if(e.key==="Escape"){

closeQuickView();

}

};

}