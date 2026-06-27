import { db, auth } from "../firebase/firebase-config.js";

import {
collection,
doc,
getDoc,
getDocs,
deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

/* ==========================
DOM
========================== */

const grid=document.getElementById("wishlistGrid");
const search=document.getElementById("wishlistSearch");
const count=document.getElementById("wishlistCount");

let allProducts=[];

/* ==========================
AUTH
========================== */

onAuthStateChanged(auth,user=>{

if(!user){

window.location="login.html";

return;

}

loadWishlist(user.uid);

});

/* ==========================
LOAD WISHLIST
========================== */

async function loadWishlist(uid){

grid.innerHTML="";

allProducts=[];

const wishSnapshot=await getDocs(
collection(db,"users",uid,"wishlist")
);

if(wishSnapshot.empty){

showEmpty();

return;

}

for(const wish of wishSnapshot.docs){

const productId=wish.id;

const productSnap=await getDoc(

doc(db,"products",productId)

);

if(productSnap.exists()){

const p=productSnap.data();

p.id=productSnap.id;

allProducts.push(p);

}

}

renderWishlist(allProducts);

}

/* ==========================
RENDER
========================== */

function renderWishlist(products){

count.innerText=`${products.length} Items`;

grid.innerHTML="";

products.forEach(product=>{

if (!product.variants || product.variants.length === 0) return;

const variant = product.variants[0];

grid.innerHTML+=`

<div class="wishlist-card">

<img src="${variant.image}">

<div class="card-content">

<h3>${product.name}</h3>

<div class="card-category">

${product.category}

</div>

<div class="price">

<span class="current">

₹${variant.price}

</span>

<del class="old">

₹${variant.oldPrice}

</del>

</div>

<div class="card-buttons">

<button
class="view-btn"
onclick="location.href='product.html?id=${product.id}'">

View Product

</button>

<button
class="remove-btn"
onclick="removeWishlist('${product.id}')">

❤

</button>

</div>

</div>

</div>

`;

});

}

/* ==========================
REMOVE
========================== */

window.removeWishlist=async(id)=>{

const user=auth.currentUser;

if(!user) return;

await deleteDoc(

doc(db,"users",user.uid,"wishlist",id)

);

allProducts=allProducts.filter(

p=>p.id!==id

);

if(allProducts.length===0){

showEmpty();

return;

}

renderWishlist(allProducts);

};

/* ==========================
SEARCH
========================== */

search.addEventListener("input",()=>{

const key=search.value.toLowerCase();

const filtered=allProducts.filter(product=>

product.name.toLowerCase().includes(key)

||

product.category.toLowerCase().includes(key)

);

renderWishlist(filtered);

});

/* ==========================
EMPTY
========================== */

function showEmpty(){

count.innerText="0 Items";

grid.innerHTML=`

<div class="empty-wishlist">

<img src="assets/images/empty-wishlist.png">

<h2>

Wishlist Empty

</h2>

<p>

Save your favourite products here.

</p>

<a href="shop.html">

Continue Shopping

</a>

</div>

`;

}