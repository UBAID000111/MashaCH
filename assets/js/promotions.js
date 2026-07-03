import { db } from "../firebase/firebase-config.js";

import {
collection,
doc,
setDoc,
getDocs,
deleteDoc,
updateDoc,
Timestamp,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ===========================
DOM
=========================== */



const grid = document.getElementById("promotionGrid");

const modal = document.getElementById("promotionModal");

const openBtn = document.getElementById("newPromotionBtn");

const closeBtn = document.getElementById("closePromotion");

const saveBtn = document.getElementById("savePromotion");

const search = document.getElementById("searchPromotion");

let promotions = [];

let editingId = null;

openBtn.addEventListener("click", () => {
    alert("Button clicked");
});

/* ===========================
MODAL
=========================== */

openBtn.onclick = () => {

editingId = null;

document.querySelectorAll(".promo-box input").forEach(i=>{

if(i.type!="checkbox") i.value="";

});

document.getElementById("promotionActive").checked=true;

modal.classList.add("active");

};

closeBtn.onclick=()=>{

modal.classList.remove("active");

};

modal.onclick=e=>{

if(e.target===modal){

modal.classList.remove("active");

}

};

/* ===========================
SAVE PROMOTION
=========================== */

saveBtn.onclick=async()=>{

const code=document.getElementById("promotionCode")
.value.trim().toUpperCase();

if(!code){

alert("Coupon code required");

return;

}

const data={

title:
document.getElementById("promotionName").value,

code,

type:
document.getElementById("promotionType").value,

discountType:
document.getElementById("discountType").value,

discountValue:Number(
document.getElementById("discountValue").value
),

minimumOrder:Number(
document.getElementById("minimumOrder").value
),

maximumDiscount:Number(
document.getElementById("maximumDiscount").value
),

usageLimit:Number(
document.getElementById("usageLimit").value
),

used:editingId
?
promotions.find(x=>x.code===editingId)?.used || 0
:
0,

active:
document.getElementById("promotionActive").checked,

startsAt:Timestamp.fromDate(
new Date(
document.getElementById("startDate").value
)
),

expiresAt:Timestamp.fromDate(
new Date(
document.getElementById("expiryDate").value
)
),

createdAt:serverTimestamp()

};

await setDoc(

doc(db,"promotions",code),

data,

{merge:true}

);

modal.classList.remove("active");

loadPromotions();

};

/* ===========================
LOAD PROMOTIONS
=========================== */

async function loadPromotions(){

grid.innerHTML="";

promotions=[];

const snap=await getDocs(

collection(db,"promotions")

);

let active=0;

let coupon=0;

let automatic=0;

let flash=0;

snap.forEach(docSnap=>{

const p=docSnap.data();

promotions.push(p);

if(p.active) active++;

if(p.type=="coupon") coupon++;

if(p.type=="automatic") automatic++;

if(p.type=="flash") flash++;

});

document.getElementById("activeCount").innerHTML=active;

document.getElementById("couponCount").innerHTML=coupon;

document.getElementById("automaticCount").innerHTML=automatic;

document.getElementById("flashCount").innerHTML=flash;

render(promotions);

}

loadPromotions();

function render(list){

grid.innerHTML="";

if(list.length==0){

grid.innerHTML="<h2>No Promotions</h2>";

return;

}

list.forEach(p=>{

const percent=

p.usageLimit==0

?0

:Math.round(

(p.used/p.usageLimit)*100

);

grid.innerHTML+=`

<div class="promo-card">

<div class="promo-top">

<div class="promo-title">

${p.title}

</div>

<div class="promo-type">

${p.type}

</div>

</div>

<div class="promo-info">

<b>Code</b>

: ${p.code}

<br>

<b>Discount</b>

:

${p.discountType=="percent"

?`${p.discountValue}%`

:`₹${p.discountValue}`}

<br>

<b>Minimum</b>

:

₹${p.minimumOrder}

<br>

<b>Usage</b>

:

${p.used}/${p.usageLimit}

</div>

<div class="progress">

<div style="width:${percent}%">

</div>

</div>

<div class="status ${p.active?"active":"disabled"}">

${p.active?"Active":"Disabled"}

</div>

<div class="card-actions">

<button
class="edit-btn"
data-id="${p.code}">

Edit

</button>

<button
class="copy-btn"
data-code="${p.code}">

Copy

</button>

<button
class="toggle-btn"
data-id="${p.code}">

${p.active?"Disable":"Enable"}

</button>

<button
class="delete-btn"
data-id="${p.code}">

Delete

</button>

</div>

</div>

`;

});

}

search.oninput=()=>{

const value=

search.value.toLowerCase();

render(

promotions.filter(p=>

p.title.toLowerCase().includes(value)

||

p.code.toLowerCase().includes(value)

)

);

};

/*==================================
BUTTON EVENTS
==================================*/

document.addEventListener("click", async (e) => {

const code = e.target.dataset.id;

/* EDIT */

if(e.target.classList.contains("edit-btn")){

const p = promotions.find(x => x.code === code);

if(!p) return;

editingId = code;

modal.classList.add("active");

document.getElementById("promotionName").value = p.title;
document.getElementById("promotionCode").value = p.code;
document.getElementById("promotionType").value = p.type;
document.getElementById("discountType").value = p.discountType;
document.getElementById("discountValue").value = p.discountValue;
document.getElementById("minimumOrder").value = p.minimumOrder;
document.getElementById("maximumDiscount").value = p.maximumDiscount;
document.getElementById("usageLimit").value = p.usageLimit;
document.getElementById("promotionActive").checked = p.active;

if(p.startsAt){

document.getElementById("startDate").value =
p.startsAt.toDate().toISOString().slice(0,16);

}

if(p.expiresAt){

document.getElementById("expiryDate").value =
p.expiresAt.toDate().toISOString().slice(0,16);

}

}

/* DELETE */

if(e.target.classList.contains("delete-btn")){

const ok = confirm("Delete this promotion?");

if(!ok) return;

await deleteDoc(doc(db,"promotions",code));

loadPromotions();

}

/* COPY */

if(e.target.classList.contains("copy-btn")){

await navigator.clipboard.writeText(
e.target.dataset.code
);

alert("Coupon copied");

}

/* ENABLE / DISABLE */

if(e.target.classList.contains("toggle-btn")){

const p = promotions.find(x=>x.code===code);

await updateDoc(

doc(db,"promotions",code),

{

active:!p.active

}

);

loadPromotions();

}

});

