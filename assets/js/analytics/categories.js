import { db } from "../../firebase/firebase-config.js";

import {
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

let revenueChart;
let productsChart;

export async function loadCategoryAnalytics(){

const products = await getDocs(collection(db,"products"));

const orders = await getDocs(collection(db,"orders"));

const categories = {};

products.forEach(doc=>{

const p = doc.data();

const cat = p.category || "Other";

if(!categories[cat]){

categories[cat]={

products:0,

sold:0,

revenue:0,

stock:0

};

}

categories[cat].products++;

(p.variants||[]).forEach(v=>{

categories[cat].stock += Number(v.stock||0);

});

});

orders.forEach(doc=>{

const order = doc.data();

(order.items||[]).forEach(item=>{

const cat=item.category||"Other";

if(!categories[cat]) return;

categories[cat].sold += Number(item.quantity||0);

categories[cat].revenue += Number(item.price||0)*Number(item.quantity||0);

});

});

renderTable(categories);

renderCharts(categories);

}

function renderTable(categories){

const tbody=document.getElementById("categoryTable");

tbody.innerHTML="";

Object.entries(categories).forEach(([name,data])=>{

tbody.innerHTML+=`

<tr>

<td>${name}</td>

<td>${data.products}</td>

<td>${data.sold}</td>

<td>₹${data.revenue.toLocaleString("en-IN")}</td>

<td>${data.stock}</td>

</tr>

`;

});

}

function renderCharts(categories){

const labels=Object.keys(categories);

const revenue=labels.map(c=>categories[c].revenue);

const products=labels.map(c=>categories[c].products);

if(revenueChart) revenueChart.destroy();

revenueChart=new Chart(

document.getElementById("categoryRevenueChart"),

{

type:"pie",

data:{

labels,

datasets:[{

data:revenue

}]

}

}

);

if(productsChart) productsChart.destroy();

productsChart=new Chart(

document.getElementById("categoryProductsChart"),

{

type:"bar",

data:{

labels,

datasets:[{

label:"Products",

data:products

}]

}

}

);

}

