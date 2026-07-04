import { db } from "../firebase/firebase-config.js";

import{
collection,
getDocs,
query,
orderBy
}from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ===========================
DOM
=========================== */

const table=document.getElementById("customerTable");

const mobile=document.getElementById("mobileCustomerList");

const search=document.getElementById("customerSearch");

const refresh=document.getElementById("refreshCustomers");

let customers=[];

/* ===========================
LOAD
=========================== */

async function loadCustomers(){

customers=[];

table.innerHTML="";

mobile.innerHTML="";

const userSnap=await getDocs(

query(
collection(db,"users"),
orderBy("createdAt","desc")
)

);

const orderSnap=await getDocs(

collection(db,"orders")

);

const reviewSnap=await getDocs(

collection(db,"reviews")

);

let totalRevenue=0;

let activeCustomers=0;

const orderMap={};

const spentMap={};

const reviewMap={};

orderSnap.forEach(doc=>{

const order=doc.data();

totalRevenue+=Number(order.total||0);

orderMap[order.userId]=(orderMap[order.userId]||0)+1;

spentMap[order.userId]=(spentMap[order.userId]||0)+Number(order.total||0);

});

reviewSnap.forEach(doc=>{

const review=doc.data();

reviewMap[review.userId]=(reviewMap[review.userId]||0)+1;

});

userSnap.forEach(docSnap=>{

const user=docSnap.data();

const uid=docSnap.id;

const orders=orderMap[uid]||0;

const spent=spentMap[uid]||0;

if(orders>0) activeCustomers++;

customers.push({

id:uid,

...user,

orders,

spent,

reviews:reviewMap[uid]||0

});

});

document.getElementById("totalCustomers").textContent=customers.length;

document.getElementById("activeCustomers").textContent=activeCustomers;

document.getElementById("totalRevenue").textContent=
"₹"+totalRevenue.toLocaleString("en-IN");

document.getElementById("averageOrder").textContent=
customers.length
?
"₹"+Math.round(totalRevenue/customers.length).toLocaleString("en-IN")
:
"₹0";

render(customers);

}

loadCustomers();

refresh.onclick=loadCustomers;

/* ===========================
RENDER
=========================== */

function render(list){

table.innerHTML="";

mobile.innerHTML="";

list.forEach(customer=>{

const joined=customer.createdAt?.toDate
?
customer.createdAt.toDate().toLocaleDateString("en-IN")
:
"-";

table.innerHTML+=`

<tr>

<td>

<div class="customer-user">

<img src="${
customer.photoURL||
"assets/images/user.png"
}">

<div>

<h3>${customer.name||"Customer"}</h3>

<p>${customer.uid||""}</p>

</div>

</div>

</td>

<td>${customer.email||"-"}</td>

<td>${customer.phone||"-"}</td>

<td>${customer.orders}</td>

<td>₹${customer.spent.toLocaleString("en-IN")}</td>

<td>${joined}</td>

<td>

<button

class="view-btn"

data-id="${customer.id}">

View

</button>

</td>

</tr>

`;

mobile.innerHTML+=`

<div class="customer-card">

<div class="customer-card-top">

<img src="${
customer.photoURL||
"assets/images/user.png"
}">

<div>

<h3>${customer.name||"Customer"}</h3>

<p>${customer.email||""}</p>

<p>${customer.phone||""}</p>

</div>

</div>

<p>

Orders :

<b>${customer.orders}</b>

</p>

<p>

Spent :

<b>

₹${customer.spent.toLocaleString("en-IN")}

</b>

</p>

<button

class="view-btn"

data-id="${customer.id}">

View Details

</button>

</div>

`;

});

}

/* ===========================
SEARCH
=========================== */

search.oninput=()=>{

const value=search.value.toLowerCase();

render(

customers.filter(c=>

(c.name||"")
.toLowerCase()
.includes(value)

||

(c.email||"")
.toLowerCase()
.includes(value)

||

(c.phone||"")
.includes(value)

)

);

};