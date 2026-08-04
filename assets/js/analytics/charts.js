import { db } from "../../firebase/firebase-config.js";

import {
collection,
getDocs,
query,
orderBy
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

let revenueChart;
let ordersChart;
let visitorChart;

export async function initCharts(){

    await loadRevenueChart();

    await loadOrdersChart();

    await loadVisitorsChart();

}

async function loadRevenueChart(){

    const snap = await getDocs(

query(

collection(db,"analytics_daily"),

orderBy("updatedAt","asc")

)

);

    const labels=[];
    const revenue=[];

    snap.forEach(doc=>{

        const d=doc.data();

        labels.push(doc.id.substring(5)); // MM-DD

        revenue.push(d.revenue || 0);

    });

    createRevenueChart(labels,revenue);

}

async function loadOrdersChart(){

    const snap=await getDocs(
        collection(db,"analytics_daily")
    );

    const labels=[];
    const orders=[];

    snap.forEach(doc=>{

        const d=doc.data();

        labels.push(doc.id.substring(5));

        orders.push(d.orders||0);

    });

    createOrdersChart(labels,orders);

}

async function loadVisitorsChart(){

    const snap=await getDocs(
        collection(db,"analytics_daily")
    );

    const labels=[];
    const visitors=[];

    snap.forEach(doc=>{

        const d=doc.data();

        labels.push(doc.id.substring(5));

        visitors.push(d.visitors||0);

    });

    createVisitorsChart(labels,visitors);

}

function createRevenueChart(labels,data){

const ctx=document.getElementById("revenueChart");

if(!ctx) return;

if(revenueChart){

revenueChart.destroy();

}

revenueChart=new Chart(ctx,{

type:"line",

data:{

labels,

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

},

scales:{

y:{

beginAtZero:true

}

}

}

});

}

function createOrdersChart(labels,data){

const ctx=document.getElementById("ordersChart");

if(!ctx) return;

if(ordersChart){

ordersChart.destroy();

}

ordersChart=new Chart(ctx,{

type:"bar",

data:{

labels,

datasets:[{

label:"Orders",

data,

backgroundColor:"#B09246",

borderRadius:8

}]

},

options:{

responsive:true,

maintainAspectRatio:false,

plugins:{

legend:{

display:false

}

},

scales:{

y:{

beginAtZero:true

}

}

}

});

}

function createVisitorsChart(labels,data){

const ctx=document.getElementById("visitorChart");

if(!ctx) return;

if(visitorChart){

visitorChart.destroy();

}

visitorChart=new Chart(ctx,{

type:"line",

data:{

labels,

datasets:[{

label:"Visitors",

data,

borderColor:"#16a34a",

backgroundColor:"rgba(22,163,74,.15)",

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

},

scales:{

y:{

beginAtZero:true

}

}

}

});

}