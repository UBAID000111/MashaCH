import { db } from "../../firebase/firebase-config.js";

import {
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

export async function loadCustomerAnalytics(){

const usersSnap = await getDocs(
collection(db,"users")
);

const ordersSnap = await getDocs(
collection(db,"orders")
);

const topCustomers =
document.getElementById("topCustomers");

if(!topCustomers) return;

/* ===========================
CUSTOMER MAP
=========================== */

const customerMap = {};

let newCustomers = 0;

const thirtyDaysAgo = new Date();

thirtyDaysAgo.setDate(
thirtyDaysAgo.getDate()-30
);

usersSnap.forEach(doc=>{

const user = doc.data();

if(

user.createdAt &&

user.createdAt.toDate() > thirtyDaysAgo

){

newCustomers++;

}

customerMap[doc.id]={

id:doc.id,

name:user.name || "Customer",

email:user.email || "",

phone:user.phone || "",

orders:0,

spent:0,

lastOrder:null

};

});

/* ===========================
ORDER STATS
=========================== */

let pending = 0;

let shipped = 0;

let delivered = 0;

let cancelled = 0;

let totalRevenue = 0;

ordersSnap.forEach(doc=>{

const order = doc.data();

const uid = order.userId;

totalRevenue += Number(
order.total || 0
);

if(customerMap[uid]){

customerMap[uid].orders++;

customerMap[uid].spent += Number(
order.total || 0
);

if(

!customerMap[uid].lastOrder ||

(

order.createdAt &&

order.createdAt.toMillis() >

customerMap[uid].lastOrder.toMillis()

)

){

customerMap[uid].lastOrder =
order.createdAt;

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

/* ===========================
CUSTOMER STATS
=========================== */

const returningCustomers =

Object.values(customerMap)

.filter(customer=>customer.orders>1)

.length;

const averageOrderValue =

ordersSnap.size

?

totalRevenue/ordersSnap.size

:0;

const repeatPurchaseRate =

usersSnap.size

?

(

returningCustomers

/

usersSnap.size

*100

).toFixed(1)

:0;

/* ===========================
TOP CARDS
=========================== */

document.getElementById(
"pendingOrders"
).textContent = pending;

document.getElementById(
"shippedOrders"
).textContent = shipped;

document.getElementById(
"deliveredOrders"
).textContent = delivered;

document.getElementById(
"cancelledOrders"
).textContent = cancelled;

document.getElementById(
"newCustomers"
).textContent = newCustomers;

document.getElementById(
"returningCustomers"
).textContent = returningCustomers;

document.getElementById(
"averageOrderValue"
).textContent =
"₹"+averageOrderValue.toFixed(0);

document.getElementById(
"repeatPurchaseRate"
).textContent =
repeatPurchaseRate+"%";

/* ===========================
TOP CUSTOMERS
=========================== */

const list =

Object.values(customerMap)

.sort((a,b)=>b.spent-a.spent)

.slice(0,10);

topCustomers.innerHTML = "";

list.forEach(customer=>{

topCustomers.innerHTML += `

<div class="top-customer">

<div>

<h3>${customer.name}</h3>

<p>${customer.email}</p>

<p>

Last Order :

${
customer.lastOrder

?

customer.lastOrder
.toDate()
.toLocaleDateString()

:

"Never"

}

</p>

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