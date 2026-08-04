import { db } from "../../firebase/firebase-config.js";

import {
doc,
getDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

let deviceChart;

export async function loadTrafficAnalytics(){

const snap = await getDoc(

doc(db,"analytics_devices","overview")

);

console.log(snap.exists());
console.log(snap.data());
console.log("Traffic Loaded");
if(!snap.exists()) return;

const data = snap.data();

const desktop = Number(data.desktop || 0);

const mobile = Number(data.mobile || 0);

const tablet = Number(data.tablet || 0);

/* ===========================
TOP CARDS
=========================== */

const desktopEl=document.getElementById("desktopUsers");
const mobileEl=document.getElementById("mobileUsers");
const tabletEl=document.getElementById("tabletUsers");

console.log(document.getElementById("desktopUsers"));
console.log(document.getElementById("mobileUsers"));
console.log(document.getElementById("tabletUsers"));

if(desktopEl){

desktopEl.textContent=desktop;

}

if(mobileEl){

mobileEl.textContent=mobile;

}

if(tabletEl){

tabletEl.textContent=tablet;

}

/* ===========================
DEVICE CHART
=========================== */

createDeviceChart(

desktop,

mobile,

tablet

);

}

/* ===========================
CHART
=========================== */

function createDeviceChart(

desktop,

mobile,

tablet

){

const canvas=document.getElementById("deviceUsageChart");

if(!canvas) return;

if(deviceChart){

deviceChart.destroy();

}

deviceChart=new Chart(canvas,{

type:"doughnut",

data:{

labels:[

"Desktop",

"Mobile",

"Tablet"

],

datasets:[{

data:[

desktop,

mobile,

tablet

],

backgroundColor:[

"#2563eb",

"#16a34a",

"#f59e0b"

],

borderWidth:0

}]

},

options:{

responsive:true,

maintainAspectRatio:false,

plugins:{

legend:{

position:"bottom"

}

},

cutout:"65%"

}

});

}