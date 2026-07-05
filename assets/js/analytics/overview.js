import { db } from "../../firebase/firebase-config.js";

import{
collection,
getDocs
}from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

export async function loadOverview(){

const users=await getDocs(collection(db,"users"));

const products=await getDocs(collection(db,"products"));

const orders=await getDocs(collection(db,"orders"));

const reviews=await getDocs(collection(db,"reviews"));

let revenue = 0;

let sold = 0;

let wishlistItems = 0;
let wishlistUsers = 0;

let cartItems = 0;
let cartUsers = 0;

let totalProducts = products.size;

let outOfStock = 0;

let lowStock = 0;

let totalStock = 0;

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

const p = doc.data();

let productStock = 0;

(p.variants || []).forEach(variant=>{

const stock = Number(variant.stock || 0);

productStock += stock;

});

totalStock += productStock;

if(productStock==0){

outOfStock++;

}

if(productStock>0 && productStock<=5){

lowStock++;

}

});

orders.forEach(doc=>{

const order = doc.data();

revenue += Number(order.total || 0);

(order.items || []).forEach(item=>{

sold += Number(item.quantity || 0);

});

});

document.getElementById("totalVisitors").textContent=users.size;

document.getElementById("customerCount").textContent=users.size;

document.getElementById("wishlistCount").textContent=wishlistItems;

document.getElementById("wishlistUsers").textContent=wishlistUsers;

document.getElementById("cartCount").textContent=cartItems;

document.getElementById("cartLeads").textContent=cartUsers;

document.getElementById("soldProducts").textContent=sold;

document.getElementById("reviewCount").textContent=reviews.size;

document.getElementById("totalOrders").textContent=orders.size;

document.getElementById("totalProducts").textContent = totalProducts;

document.getElementById("totalStock").textContent = totalStock;

document.getElementById("lowStock").textContent = lowStock;

document.getElementById("outOfStock").textContent = outOfStock;



document.getElementById("totalRevenue").textContent=
"₹"+revenue.toLocaleString("en-IN");

const conversion =
users.size
?
((orders.size/users.size)*100).toFixed(1)
:0;

document.getElementById("conversionRate").textContent=
conversion+"%";

}