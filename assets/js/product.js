import { db } from "../firebase/firebase-config.js";

import { optimizeImage } from "./services/imageService.js";

import { getProduct } from "./services/productService.js";

import { showToast } from "./services/toastService.js";

import {
doc,
getDoc,
collection,
query,
where,
getDocs,
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

const avgRating=document.getElementById("avgRating");

const totalReviews=document.getElementById("totalReviews");

const reviewsContainer=document.getElementById("reviewsContainer");

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
let galleryImages = [];
let currentImageIndex = 0;

let currentVariantIndex = 0;

let currentUser = null;

const wishlistBtn = document.getElementById("wishlistBtn");
const mobileWishlist = document.getElementById("mobileWishlist");

const mobileCart=document.querySelector(".mobile-cart");
const mobileBuy=document.querySelector(".mobile-buy");

mobileCart.onclick=()=>{

document.getElementById("addCartBtn").click();

};

mobileBuy.onclick=()=>{

document.querySelector(".buy-now").click();

};

mobileWishlist.onclick=()=>{

document.getElementById("wishlistBtn").click();

};

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
await loadReviews();

}

loadProduct();

/* ===========================
IMAGE VIEWER
=========================== */

mainImage.onclick = function(e){

e.preventDefault();

e.stopPropagation();

openImageViewer();

};
mainImage.style.cursor="zoom-in";

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

    currentVariantIndex = index;

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

const addCartBtn = document.getElementById("addCartBtn");
const buyNowBtn = document.querySelector(".buy-now");

const firstSize = variant.sizes[0];

if(firstSize.stock <= 0){

    stock.innerHTML = `
    <span style="
    color:#dc2626;
    font-weight:700;">
    ❌ Out of Stock
    </span>`;

    addCartBtn.disabled = true;
    buyNowBtn.disabled = true;

    addCartBtn.innerText = "OUT OF STOCK";
    buyNowBtn.innerText = "OUT OF STOCK";

}else{

    stock.innerHTML = `
    <span style="
    color:#16a34a;
    font-weight:700;">
   ${firstSize.stock} Available
    </span>`;

    addCartBtn.disabled = false;
    buyNowBtn.disabled = false;

    addCartBtn.innerText = "Add To Cart";
    buyNowBtn.innerText = "Buy Now";

}

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

btn.innerText=size.name;

if(size.stock<=0){

btn.disabled=true;

btn.classList.add("out-of-stock");

}

if(index===0 && size.stock>0){

btn.classList.add("active");

stock.innerHTML=`
<span style="color:#16a34a;font-weight:700;">
${size.stock} Available
</span>`;

}

btn.onclick=()=>{

document.querySelectorAll(".size-btn").forEach(b=>{

b.classList.remove("active");

});

btn.classList.add("active");

if(size.stock<=0){

stock.innerHTML=`
<span style="color:#dc2626;font-weight:700;">
Out of Stock
</span>`;

}else{

stock.innerHTML=`
<span style="color:#16a34a;font-weight:700;">
${size.stock} Available
</span>`;

}

};

sizeList.appendChild(btn);

});

}

/* ===========================
GALLERY
=========================== */

function loadGallery(variant){

galleryImages = [variant.image, ...variant.gallery];

thumbnailList.innerHTML = "";

galleryImages.forEach((img,index)=>{

thumbnailList.innerHTML += `

<img
src="${optimizeImage(img,150)}"
class="${index===0?"active":""}"
onclick="changeMainImage(this,${index})">

`;

});

currentImageIndex = 0;

document.getElementById("imageCount").innerText =
`1 / ${galleryImages.length}`;

}

/* ===========================
MAIN IMAGE
=========================== */

window.changeMainImage=function(el,index){

currentImageIndex=index;

imageLoader.style.display="block";

mainImage.style.display="none";

mainImage.onload=function(){

imageLoader.style.display="none";

mainImage.style.display="block";

};

mainImage.src=optimizeImage(galleryImages[index],1200);

document
.querySelectorAll(".thumbnail-list img")
.forEach(img=>img.classList.remove("active"));

el.classList.add("active");

document.getElementById("imageCount").innerText=
`${index+1} / ${galleryImages.length}`;

}




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

const userData=userSnap.exists() ? userSnap.data() : {};


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

userName: userData.name || "",

userEmail: userData.email || currentUser.email || "",

userPhone: userData.phone || "",

addedAt: serverTimestamp()

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

/* ===========================
QUANTITY
=========================== */

const qtyInput = document.getElementById("quantity");
const plusBtn = document.getElementById("plusQty");
const minusBtn = document.getElementById("minusQty");

let quantity = 1;

plusBtn.onclick = () => {

    const selectedSize =
        document.querySelector(".size-btn.active")?.innerText;

    const sizeData =
        productData.variants[currentVariantIndex]
        .sizes.find(s => s.name === selectedSize);

    const availableStock = sizeData?.stock || 0;

    if(quantity >= availableStock){

        showToast(`Only ${availableStock} item(s) available.`);

        return;

    }

    quantity++;

    qtyInput.value = quantity;

};

minusBtn.onclick = () => {

    if(quantity > 1){

        quantity--;

        qtyInput.value = quantity;

    }

};

import {


addDoc

} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const addCartBtn=document.getElementById("addCartBtn");

addCartBtn?.addEventListener("click",addToCart);

async function addToCart(){

    const variantIndex =
Number(
document.querySelector(".color-dot.active")
?.dataset.index || 0
);

const variant =
productData.variants[variantIndex];

const selectedSize =

document.querySelector(".size-btn.active")?.innerText;

const sizeData=

variant.sizes.find(

s=>s.name===selectedSize

);

if(!sizeData || sizeData.stock<=0){

showToast("Product is Out of Stock");

return;

}

    try{

if(addCartBtn.disabled) return;

addCartBtn.disabled = true;

addCartBtn.innerText = "Adding...";    

if(!currentUser){

location.href="login.html";

return;

}

const variantIndex=

Number(

document.querySelector(".color-dot.active")

?.dataset.index

||0

);

const variant=

productData.variants[variantIndex];

const size=

document.querySelector(".size-btn.active")

?.innerText

||"";

const qty=

Number(document.getElementById("quantity").value);

await addDoc(

collection(

db,

"users",

currentUser.uid,

"cart"

),

{

productId:productId,

productName:productData.name,

category:productData.category,

description:productData.description,

image:variant.image,

price:variant.price,

oldPrice:variant.oldPrice,

quantity:qty,

selectedSize:size,

selectedColor:variant.color,

variantIndex,

sizeStock:
variant.sizes.find(
s=>s.name===size
)?.stock || 0,

createdAt:serverTimestamp()

}

);

showToast("Added To Cart");

const userSnap = await getDoc(
    doc(db, "users", currentUser.uid)
);

const userData = userSnap.exists()
    ? userSnap.data()
    : {};

await setDoc(
doc(db,"adminCart",currentUser.uid),
{

userId:currentUser.uid,

userName:userData.name || "",

email:userData.email || "",

phone:userData.phone || "",

status:"New",

contacted:false,

lastUpdated:serverTimestamp()

},

{merge:true}

);
    }finally{

addCartBtn.disabled = false;

addCartBtn.innerText = "Add To Cart";

}
}

const buyNowBtn = document.querySelector(".buy-now");
buyNowBtn?.addEventListener("click", buyNow);
async function buyNow() {

    const variantIndex =
Number(
document.querySelector(".color-dot.active")
?.dataset.index || 0
);

const selectedSize=

document.querySelector(".size-btn.active")?.innerText;

const sizeData=

productData.variants[variantIndex]

.sizes.find(

s=>s.name===selectedSize

);

if(!sizeData || sizeData.stock<=0){

showToast("Product is Out of Stock");

return;

}

    if (!currentUser) {

        location.href = "login.html";
        return;

    }

    await addToCart();

    location.href = "checkout.html";

}

async function loadReviews(){

const q=query(

collection(db,"reviews"),

where("productId","==",productId)

);

const snap=await getDocs(q);

reviewsContainer.innerHTML="";

let total=0;

snap.forEach(docSnap=>{

const review=docSnap.data();

total+=review.rating;

reviewsContainer.innerHTML+=createReviewCard(review);

});

const count=snap.size;

const average=count

? (total/count).toFixed(1)

: "0.0";

avgRating.textContent=average;

totalReviews.textContent=count;

}

function createReviewCard(review){

const stars="★★★★★".slice(0,review.rating);

return `

<div class="review-card">

<div class="review-top">

<div class="review-user">

<img

src="${
review.userPhoto ||

"assets/images/user.png"
}"

alt="">

<div>

<h3>${review.userName}</h3>

<div class="verified">

✔ Verified Purchase

</div>

</div>

</div>

<div class="review-stars">

${stars}

</div>

</div>

<h4>

${review.title || ""}

</h4>

<p>

${review.review || ""}

</p>

${
review.images?.length

?

`

<div class="review-images">

${review.images.map(img=>`

<img src="${img}">

`).join("")}

</div>

`

:

""

}

</div>

`;

}

function openImageViewer(){

const overlay=document.createElement("div");

overlay.className="image-viewer";

overlay.innerHTML=`

<div class="viewer-wrapper">

<button class="viewer-close">✕</button>

<button class="viewer-prev">❮</button>

<img class="viewer-image">

<button class="viewer-next">❯</button>

</div>

`;

document.body.appendChild(overlay);

const image=overlay.querySelector(".viewer-image");

function show(){

image.src=optimizeImage(
galleryImages[currentImageIndex],
1600
);

}

show();

overlay.querySelector(".viewer-next").onclick=()=>{

currentImageIndex++;

if(currentImageIndex>=galleryImages.length)
currentImageIndex=0;

show();

};

overlay.querySelector(".viewer-prev").onclick=()=>{

currentImageIndex--;

if(currentImageIndex<0)
currentImageIndex=galleryImages.length-1;

show();

};

overlay.querySelector(".viewer-close").onclick=()=>{

overlay.remove();

};

overlay.addEventListener("click",(e)=>{

if(e.target===overlay){

overlay.remove();

}

});

document.onkeydown=(e)=>{

if(e.key==="ArrowRight")
overlay.querySelector(".viewer-next").click();

if(e.key==="ArrowLeft")
overlay.querySelector(".viewer-prev").click();

if(e.key==="Escape"){

overlay.remove();

document.onkeydown=null;

}

};

}