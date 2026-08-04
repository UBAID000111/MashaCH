import { db } from "../../firebase/firebase-config.js";

import {
collection,
doc,
getDoc,
getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

export async function loadOverview(){

const users=await getDocs(collection(db,"users"));

const products=await getDocs(collection(db,"products"));

const reviews=await getDocs(collection(db,"reviews"));

const analyticsSnap=await getDoc(
doc(db,"analytics","overview")
);

const analytics=analyticsSnap.exists()
?analyticsSnap.data()
:{};

let wishlistItems=0;
let wishlistUsers=0;

let cartItems=0;
let cartUsers=0;

let totalStock=0;
let lowStock=0;
let outOfStock=0;

const totalProducts=products.size;

for(const user of users.docs){

const wishlist=await getDocs(
collection(db,"users",user.id,"wishlist")
);

wishlistItems+=wishlist.size;

if(wishlist.size>0){
wishlistUsers++;
}

const cart=await getDocs(
collection(db,"users",user.id,"cart")
);

cartItems+=cart.size;

if(cart.size>0){
cartUsers++;
}

}

products.forEach(doc=>{

const product=doc.data();

let stock=0;

(product.variants||[]).forEach(variant=>{

(variant.sizes||[]).forEach(size=>{

stock+=Number(size.stock||0);

});

});

totalStock+=stock;

if(stock===0){

outOfStock++;

}
else if(stock<=5){

lowStock++;

}

});

/* ===========================
TOP CARDS
=========================== */

document.getElementById("totalVisitors").textContent=
analytics.totalVisitors||0;

document.getElementById("customerCount").textContent=
users.size;

document.getElementById("totalViews").textContent=
analytics.totalViews||0;

document.getElementById("wishlistCount").textContent=
wishlistItems;

document.getElementById("wishlistUsers").textContent=
wishlistUsers;

document.getElementById("cartCount").textContent=
cartItems;

document.getElementById("cartLeads").textContent=
cartUsers;

document.getElementById("soldProducts").textContent=
analytics.soldProducts||0;

document.getElementById("reviewCount").textContent=
reviews.size;

document.getElementById("totalOrders").textContent=
analytics.totalOrders||0;

document.getElementById("totalRevenue").textContent=
"₹"+Number(
analytics.totalRevenue||0
).toLocaleString("en-IN");

document.getElementById("conversionRate").textContent=

analytics.totalVisitors

?

(

(analytics.totalOrders||0)

/

analytics.totalVisitors

*100

).toFixed(1)+"%"

:"0%";

document.getElementById("totalProducts").textContent=
totalProducts;

document.getElementById("totalStock").textContent=
totalStock;

document.getElementById("lowStock").textContent=
lowStock;

document.getElementById("outOfStock").textContent=
outOfStock;

}