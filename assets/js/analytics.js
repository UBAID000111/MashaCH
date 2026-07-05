import { db } from "../firebase/firebase-config.js";

import{
collection,
getDocs
}from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/*====================================
TAB SWITCH
====================================*/

document.querySelectorAll(".tab-btn").forEach(btn=>{

btn.onclick=()=>{

document.querySelectorAll(".tab-btn").forEach(b=>{

b.classList.remove("active");

});

btn.classList.add("active");

document.querySelectorAll(".tab-content").forEach(tab=>{

tab.classList.remove("active");

});

document.getElementById(

btn.dataset.tab+"Tab"

).classList.add("active");

};

});

/*====================================
COUNTER ANIMATION
====================================*/

function animateCounter(el,end,prefix="",suffix=""){

let start=0;

const duration=1200;

const step=end/(duration/16);

const timer=setInterval(()=>{

start+=step;

if(start>=end){

start=end;

clearInterval(timer);

}

el.textContent=

prefix+

Math.round(start).toLocaleString("en-IN")+

suffix;

},16);

}

/*====================================
LOAD DASHBOARD
====================================*/

async function loadDashboard(){

const products=await getDocs(

collection(db,"products")

);

const orders=await getDocs(

collection(db,"orders")

);

const users=await getDocs(

collection(db,"users")

);

const reviews=await getDocs(

collection(db,"reviews")

);

let revenue=0;

let views=0;

let wishlist=0;

let cartAdds=0;

let visitors=users.size;

orders.forEach(doc=>{

revenue+=Number(

doc.data().total||0

);

});

products.forEach(doc=>{

const p=doc.data();

views+=Number(

p.views||0

);

wishlist+=Number(

p.wishlist||0

);

cartAdds+=Number(

p.cartAdds||0

);

});

animateCounter(

document.getElementById("totalVisitors"),

visitors

);

animateCounter(

document.getElementById("totalViews"),

views

);

animateCounter(

document.getElementById("totalOrders"),

orders.size

);

animateCounter(

document.getElementById("customerCount"),

users.size

);

animateCounter(

document.getElementById("wishlistCount"),

wishlist

);

animateCounter(

document.getElementById("cartCount"),

cartAdds

);

animateCounter(

document.getElementById("totalRevenue"),

revenue,

"₹"

);

const conversion=

views

?

((orders.size/views)*100)

.toFixed(1)

:0;

document.getElementById(

"conversionRate"

).textContent=

conversion+"%";

}

loadDashboard();

/*====================================
CHARTS
====================================*/

let revenueChart;
let visitorChart;
let orderChart;
let deviceChart;

function initCharts(){

/* Revenue */

const revenueCtx=document.getElementById("revenueChart");

if(revenueCtx){

console.log(window.Chart);

revenueChart=new Chart(revenueCtx,{

type:"line",

data:{

labels:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],

datasets:[{

label:"Revenue",

data:[12000,18000,15000,25000,22000,30000,27000],

borderColor:"#7b1632",

backgroundColor:"rgba(123,22,50,.12)",

fill:true,

tension:.4

}]

},

options:{

responsive:true,

plugins:{

legend:{display:false}

}

}

});

}

/* Visitors */

const visitorCtx=document.getElementById("visitorChart");

if(visitorCtx){

visitorChart=new Chart(visitorCtx,{

type:"line",

data:{

labels:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],

datasets:[{

label:"Visitors",

data:[42,56,81,74,90,132,118],

borderColor:"#c89b3c",

backgroundColor:"rgba(200,155,60,.15)",

fill:true,

tension:.4

}]

},

options:{

responsive:true,

plugins:{

legend:{display:false}

}

}

});

}

/* Orders */

const orderCtx=document.getElementById("ordersChart");

if(orderCtx){

orderChart=new Chart(orderCtx,{

type:"bar",

data:{

labels:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],

datasets:[{

label:"Orders",

data:[5,8,7,12,10,16,13]

}]

},

options:{

responsive:true,

plugins:{

legend:{display:false}

}

}

});

}

/* Devices */

const deviceCtx=document.getElementById("deviceChart");

if(deviceCtx){

deviceChart=new Chart(deviceCtx,{

type:"doughnut",

data:{

labels:[

"Mobile",

"Desktop",

"Tablet"

],

datasets:[{

data:[88,9,3]

}]

},

options:{

responsive:true,

plugins:{

legend:{

position:"bottom"

}

}

}

});

}

}

initCharts();

/*====================================
REFRESH CHARTS
====================================*/

function updateRevenueChart(data){

if(!revenueChart) return;

revenueChart.data.datasets[0].data=data;

revenueChart.update();

}

function updateVisitorChart(data){

if(!visitorChart) return;

visitorChart.data.datasets[0].data=data;

visitorChart.update();

}

function updateOrderChart(data){

if(!orderChart) return;

orderChart.data.datasets[0].data=data;

orderChart.update();

}


/*====================================
PRODUCT ANALYTICS
====================================*/

async function loadProductAnalytics(){

const tbody=document.getElementById("productAnalyticsTable");

if(!tbody) return;

tbody.innerHTML="";

const productSnap=await getDocs(

collection(db,"products")

);

const orderSnap=await getDocs(

collection(db,"orders")

);

const orderCount={};

const revenueMap={};

orderSnap.forEach(doc=>{

const order=doc.data();

(order.items||[]).forEach(item=>{

orderCount[item.productId]=

(orderCount[item.productId]||0)+item.quantity;

revenueMap[item.productId]=

(revenueMap[item.productId]||0)+

(Number(item.price)*item.quantity);

});

});

productSnap.forEach(doc=>{

const product=doc.data();

const id=doc.id;

const views=product.views||0;

const wishlist=product.wishlist||0;

const cart=product.cartAdds||0;

const orders=orderCount[id]||0;

const revenue=revenueMap[id]||0;

const avgTime=product.averageTime||0;

const conversion=

views

?

((orders/views)*100).toFixed(1)

:0;

tbody.innerHTML+=`

<tr>

<td>

<img

src="${product.variants?.[0]?.image||""}"

style="width:70px;border-radius:10px;">

</td>

<td>

${product.name}

</td>

<td>

${views}

</td>

<td>

${cart}

</td>

<td>

${wishlist}

</td>

<td>

${orders}

</td>

<td>

₹${revenue.toLocaleString("en-IN")}

</td>

<td>

${avgTime}s

</td>

<td>

${conversion}%

</td>

</tr>

`;

});

}

loadProductAnalytics();