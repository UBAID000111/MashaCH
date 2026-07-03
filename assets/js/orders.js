import { auth, db } from "../firebase/firebase-config.js";

import {
collection,
query,
where,
getDocs,
orderBy
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
optimizeImage
} from "./services/imageService.js";

/*=============================
DOM
=============================*/

const loading =
document.getElementById("ordersLoading");

const empty =
document.getElementById("emptyOrders");

const container =
document.getElementById("ordersContainer");

const search =
document.getElementById("searchOrder");

let allOrders=[];

/*=============================
AUTH
=============================*/

onAuthStateChanged(auth,async(user)=>{

if(!user){

location.href="login.html";

return;

}

await loadOrders(user.uid);

});

/*=============================
CREATE CARD
=============================*/

function createCard(order){

const item = order.items?.[0] || {};

const image = item.image
? optimizeImage(item.image,500)
: "assets/images/no-image.png";

const date = order.createdAt?.toDate
? order.createdAt.toDate().toLocaleDateString("en-IN",{
day:"numeric",
month:"short",
year:"numeric"
})
: "-";

const paymentStatus =
order.paymentStatus || "Paid";

const orderStatus =
order.status || "Pending";

const paymentClass =
paymentStatus==="Paid"
? "badge-paid"
: "badge-cod";

return `

<div class="order-card">

<div class="order-top">

<div class="order-top-left">

<div class="order-top-item">

<span>Order ID</span>

<strong>#${order.id.slice(0,10)}</strong>

</div>

<div class="order-top-item">

<span>Placed On</span>

<strong>${date}</strong>

</div>

<div class="order-top-item">

<span>Total</span>

<strong>₹${order.total}</strong>

</div>

</div>

<div class="order-status ${statusClass(orderStatus)}">

${orderStatus}

</div>

</div>

<div class="order-product">

<div class="order-image">

<img
src="${image}"
alt="${item.productName}">

</div>

<div class="order-info">

<h3>

${item.productName || "Product"}

</h3>

<div class="order-category">

${item.category || ""}

</div>

<div class="order-variant">

Color :
<strong>

${item.selectedColor?.name || "-"}

</strong>

</div>

<div class="order-variant">

Size :
<strong>

${item.selectedSize || "-"}

</strong>

</div>

<div class="order-variant">

Qty :
<strong>

${item.quantity || 1}

</strong>

</div>

<div class="order-price">

₹${item.price || 0}

</div>

</div>

<div class="order-right">

<div class="delivery-date">

Ordered on

<strong>

${date}

</strong>

</div>

<div class="badge ${paymentClass}">

${paymentStatus}

</div>

<div class="order-buttons">

<button

class="order-btn view-btn"

data-id="${order.id}">

View Details

</button>

<button

class="order-btn invoice-btn"

data-id="${order.id}">

Invoice

</button>

</div>

</div>

</div>

${timeline(orderStatus)}

<div class="order-total">

<div class="total-label">

Grand Total

</div>

<div class="total-price">

₹${order.total}

</div>

</div>

<div class="order-footer">

<div>

<div class="payment-id">

Payment ID :

<strong>

${order.paymentId || "-"}

</strong>

</div>

</div>

<div class="order-footer-right">

<button
class="order-btn buy-btn"
data-id="${item.productId}">

Buy Again

</button>

${
orderStatus==="Pending"

?

`

<button
class="order-btn cancel-btn"
data-id="${order.id}">

Cancel

</button>

`

:

""

}

${
orderStatus==="Delivered"

?

`

<button
class="order-btn review-btn"
data-order="${order.id}"
data-product="${item.productId}">

⭐ Rate Product

</button>

`

:

""

}

</div>

</div>

</div>

`;

}

/*=============================
DELIVERY TIMELINE
=============================*/

function timeline(status){

const steps=[

{
title:"Ordered",
icon:"📦"
},

{
title:"Confirmed",
icon:"✔"
},

{
title:"Shipped",
icon:"🚚"
},

{
title:"Out For Delivery",
icon:"🚛"
},

{
title:"Delivered",
icon:"🏠"
}

];

let activeStep=0;

switch(status){

case "Pending":
activeStep=0;
break;

case "Confirmed":
activeStep=1;
break;

case "Shipped":
activeStep=2;
break;

case "Out For Delivery":
activeStep=3;
break;

case "Delivered":
activeStep=4;
break;

default:
activeStep=0;

}

const progress=(activeStep/4)*100;

return `

<div class="order-timeline">

<div class="timeline-title">

Delivery Progress

</div>

<div class="timeline">

<div
class="timeline-progress"
style="width:${progress}%">

</div>

${steps.map((step,index)=>`

<div class="timeline-step
${index<=activeStep?"active":""}">

<div class="timeline-circle">

${step.icon}

</div>

<span>

${step.title}

</span>

</div>

`).join("")}

</div>

</div>

`;

}


/*=============================
LOAD ORDERS
=============================*/

async function loadOrders(uid){

loading.style.display="flex";

container.innerHTML="";

empty.style.display="none";

try{

const q=query(

collection(db,"orders"),

where("userId","==",uid),

orderBy("createdAt","desc")

);

const snap=await getDocs(q);

loading.style.display="none";

if(snap.empty){

empty.style.display="block";

return;

}

allOrders=[];

snap.forEach(doc=>{

allOrders.push({

id:doc.id,

...doc.data()

});

});

renderOrders(allOrders);

}catch(err){

console.log(err);

loading.style.display="none";

}

}

/*=============================
RENDER ORDERS
=============================*/

function renderOrders(list){

container.innerHTML="";

list.forEach(order=>{

container.innerHTML+=createCard(order);

});

}

/*=============================
STATUS CLASS
=============================*/

function statusClass(status){

switch(status){

case "Pending":
return "status-pending";

case "Confirmed":
return "status-confirmed";

case "Shipped":
return "status-shipped";

case "Out For Delivery":
return "status-out";

case "Delivered":
return "status-delivered";

case "Cancelled":
return "status-cancelled";

default:
return "status-pending";

}

}

/*=============================
CANCEL ORDER
=============================*/

async function cancelOrder(id){

try{

await updateDoc(

doc(db,"orders",id),

{

status:"Cancelled"

}

);

const index=allOrders.findIndex(

o=>o.id===id

);

if(index!==-1){

allOrders[index].status="Cancelled";

}

renderOrders(allOrders);

alert("Order Cancelled");

}catch(err){

console.log(err);

alert("Unable to cancel order");

}

}



/*==================================
SEARCH
==================================*/

search.addEventListener("input",()=>{

const value=search.value.toLowerCase().trim();

const filtered=allOrders.filter(order=>{

const item=order.items?.[0] || {};

return(

order.id.toLowerCase().includes(value)

||

(item.productName||"")

.toLowerCase()

.includes(value)

||

(order.status||"")

.toLowerCase()

.includes(value)

);

});

renderOrders(filtered);

});

/*==================================
BUTTON EVENTS
==================================*/

document.addEventListener("click",async(e)=>{

/* View Details */

if(e.target.classList.contains("view-btn")){

const id=e.target.dataset.id;

location.href=`order-details.html?id=${id}`;

}

/* Buy Again */

if(e.target.classList.contains("buy-btn")){

const productId=e.target.dataset.id;

location.href=`product.html?id=${productId}`;

}

/* Download Invoice */

if(e.target.classList.contains("invoice-btn")){

const id=e.target.dataset.id;

location.href=`invoice.html?id=${id}`;

}

/* Review */

if(e.target.classList.contains("review-btn")){

const orderId=e.target.dataset.order;

const productId=e.target.dataset.product;

location.href=

`review.html?order=${orderId}&product=${productId}`;

}

/* Cancel Order */

if(e.target.classList.contains("cancel-btn")){

const id=e.target.dataset.id;

const ok=confirm(

"Cancel this order?"

);

if(!ok) return;

await cancelOrder(id);

}

});

