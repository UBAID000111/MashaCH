import { db } from "../../firebase/firebase-config.js";

import {
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

let revenueChart;

export async function initCharts(){

const orders = await getDocs(

collection(db,"orders")

);

const monthlyRevenue = Array(12).fill(0);

const monthlyOrders = Array(12).fill(0);

orders.forEach(doc=>{

const order = doc.data();

if(!order.createdAt) return;

const date = order.createdAt.toDate();

const month = date.getMonth();

monthlyRevenue[month] += Number(order.total||0);

monthlyOrders[month]++;

});

createRevenueChart(monthlyRevenue);

createOrdersChart(monthlyOrders);

}

function createRevenueChart(data){

const ctx=document.getElementById("revenueChart");

if(!ctx) return;

if(revenueChart){

revenueChart.destroy();

}

revenueChart=new Chart(ctx,{

type:"line",

data:{

labels:[

"Jan",

"Feb",

"Mar",

"Apr",

"May",

"Jun",

"Jul",

"Aug",

"Sep",

"Oct",

"Nov",

"Dec"

],

datasets:[{

label:"Revenue",

data,

borderColor:"#7b1632",

backgroundColor:"rgba(123,22,50,.15)",

fill:true,

tension:.35,

borderWidth:3

}]

},

options:{

responsive:true,

maintainAspectRatio:false,

plugins:{

legend:{

display:false

}

}

}

});

}

function createOrdersChart(data){

const ctx=document.getElementById("ordersChart");

if(!ctx) return;

new Chart(ctx,{

type:"bar",

data:{

labels:[

"Jan",

"Feb",

"Mar",

"Apr",

"May",

"Jun",

"Jul",

"Aug",

"Sep",

"Oct",

"Nov",

"Dec"

],

datasets:[{

label:"Orders",

data

}]

},

options:{

responsive:true,

maintainAspectRatio:false,

plugins:{

legend:{

display:false

}

}

}

});

}