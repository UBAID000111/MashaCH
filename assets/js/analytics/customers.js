import { db } from "../../firebase/firebase-config.js";

import {
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

export async function loadCustomerAnalytics(){

const usersSnap=await getDocs(collection(db,"users"));

const ordersSnap=await getDocs(collection(db,"orders"));

const topCustomers=document.getElementById("topCustomers");

if(!topCustomers) return;

const customerMap={};

usersSnap.forEach(doc=>{

const user=doc.data();

customerMap[doc.id]={

id:doc.id,

name:user.name||"Customer",

email:user.email||"",

orders:0,

spent:0,

lastOrder:null

};

});

let pending=0;
let shipped=0;
let delivered=0;
let cancelled=0;

ordersSnap.forEach(doc=>{

const order=doc.data();

const uid=order.userId;

if(customerMap[uid]){

customerMap[uid].orders++;

customerMap[uid].spent+=Number(order.total||0);

if(

!customerMap[uid].lastOrder ||

(order.createdAt &&
order.createdAt.toMillis() >
customerMap[uid].lastOrder.toMillis())

){

customerMap[uid].lastOrder=order.createdAt;

}

}

switch(order.status){

case "Pending":
pending++;
break;

case "Shipped":
shipped++;
break;

case "Delivered":
delivered++;
break;

case "Cancelled":
cancelled++;
break;

}

});

document.getElementById("pendingOrders").textContent=pending;

document.getElementById("shippedOrders").textContent=shipped;

document.getElementById("deliveredOrders").textContent=delivered;

document.getElementById("cancelledOrders").textContent=cancelled;

const list=Object.values(customerMap)

.sort((a,b)=>b.spent-a.spent)

.slice(0,10);

topCustomers.innerHTML="";

list.forEach(customer=>{

topCustomers.innerHTML+=`

<div class="top-customer">

<div>

<h3>${customer.name}</h3>

<p>${customer.email}</p>

</div>

<div>

<b>

₹${customer.spent.toLocaleString("en-IN")}

</b>

<p>

${customer.orders} Orders

</p>

</div>

</div>

`;

});

}