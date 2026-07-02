import { db } from "../firebase/firebase-config.js";

import {
collection,
getDocs,
doc,
updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import {
optimizeImage
} from "./services/imageService.js";

const table=document.getElementById("ordersTable");

const search=document.getElementById("searchOrder");

const pending=document.getElementById("pendingCount");

const confirmed=document.getElementById("confirmedCount");

const shipped=document.getElementById("shippedCount");

const delivered=document.getElementById("deliveredCount");

const revenue=document.getElementById("totalRevenue");

let allOrders=[];

loadOrders();

async function loadOrders(){

const snap=await getDocs(collection(db,"orders"));

allOrders=[];

snap.forEach(docSnap=>{

allOrders.push({

id:docSnap.id,

...docSnap.data()

});

});

calculateStats();

render(allOrders);

}

/*=====================
STATS
=====================*/

function calculateStats(){

let p=0;

let c=0;

let s=0;

let d=0;

let total=0;

allOrders.forEach(order=>{

total+=Number(order.total||0);

switch(order.status){

case "Pending":

p++;

break;

case "Confirmed":

c++;

break;

case "Shipped":

case "Out For Delivery":

s++;

break;

case "Delivered":

d++;

break;

}

});

pending.textContent=p;

confirmed.textContent=c;

shipped.textContent=s;

delivered.textContent=d;

revenue.textContent=`₹${total.toLocaleString()}`;

}

/*=====================
RENDER
=====================*/

function render(list){

table.innerHTML="";

list.forEach(order=>{

const item=order.items?.[0]||{};

const date=order.createdAt?.toDate

?order.createdAt.toDate().toLocaleDateString()

:"-";

table.innerHTML+=`

<tr>

<td>

<div class="product-cell">

<img src="${optimizeImage(item.image||'',300)}">

<div>

<b>${item.productName||""}</b>

<br>

${item.selectedSize||""}

</div>

</div>

</td>

<td>

<div class="customer">

${order.address?.fullName||""}

</div>

${order.email||""}

</td>

<td>

₹${order.total}

</td>

<td>

<span class="status ${statusClass(order.status)}">

${order.status}

</span>

</td>

<td>

<span class="payment">

${order.paymentStatus}

</span>

</td>

<td>

${date}

</td>

<td>

<select

class="status-select"

data-id="${order.id}">

${statusOptions(order.status)}

</select>

<button

class="save-btn"

data-id="${order.id}">

Save

</button>

</td>

</tr>

`;

});

}

/*=====================
STATUS CLASS
=====================*/

function statusClass(status){

switch(status){

case "Pending":

return "pending";

case "Confirmed":

return "confirmed";

case "Shipped":

return "shipped";

case "Out For Delivery":

return "out";

case "Delivered":

return "delivered";

case "Cancelled":

return "cancelled";

default:

return "pending";

}

}

/*=====================
STATUS OPTIONS
=====================*/

function statusOptions(current){

const list=[

"Pending",

"Confirmed",

"Shipped",

"Out For Delivery",

"Delivered",

"Cancelled"

];

return list.map(s=>

`<option

${current===s?"selected":""}>

${s}

</option>`

).join("");

}

/*=====================
SEARCH
=====================*/

search.oninput=()=>{

const value=search.value.toLowerCase();

const filtered=allOrders.filter(order=>{

const item=order.items?.[0]||{};

return(

order.id.toLowerCase().includes(value)

||

(order.email||"")

.toLowerCase()

.includes(value)

||

(item.productName||"")

.toLowerCase()

.includes(value)

||

(order.address?.fullName||"")

.toLowerCase()

.includes(value)

);

});

render(filtered);

};

/*=====================
UPDATE STATUS
=====================*/

document.addEventListener("click",async(e)=>{

if(!e.target.classList.contains("save-btn"))

return;

const id=e.target.dataset.id;

const select=document.querySelector(

`select[data-id="${id}"]`

);

await updateDoc(

doc(db,"orders",id),

{

status:select.value

}

);

const order=allOrders.find(o=>o.id===id);

if(order)

order.status=select.value;

calculateStats();

render(allOrders);

alert("Order Updated");

});