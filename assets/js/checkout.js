import { auth, db } from "../firebase/firebase-config.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {

collection,
getDocs,
getDoc,
addDoc,
updateDoc,
deleteDoc,
doc,
serverTimestamp

} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ===========================
DOM
=========================== */

let selectedAddressId = null;

const modal=document.getElementById("addressModal");

const addBtn=document.getElementById("addAddressBtn");

const closeBtn=document.getElementById("closeAddress");

const form=document.getElementById("addressForm");

const addressList=document.getElementById("addressList");

/* ===========================
GLOBAL
=========================== */

let currentUser=null;

let editId=null;

/* ===========================
AUTH
=========================== */

onAuthStateChanged(auth,user=>{

if(!user){

location.href="login.html";

return;

}

currentUser=user;

loadAddresses();

loadCart();      // Part 2

});

/* ===========================
MODAL
=========================== */

addBtn.onclick=()=>{

editId=null;

form.reset();

country.value="India";

document.getElementById("modalTitle").innerHTML="Add Address";

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
SAVE ADDRESS
=========================== */

form.addEventListener("submit",async e=>{

e.preventDefault();

const data={

fullName:fullName.value.trim(),

phone:phone.value.trim(),

pincode:pincode.value.trim(),

house:house.value.trim(),

area:area.value.trim(),

landmark:landmark.value.trim(),

city:city.value.trim(),

state:state.value.trim(),

country:country.value.trim(),

type:addressType.value,

isDefault:defaultAddress.checked,

createdAt:serverTimestamp()

};

if(editId){

await updateDoc(

doc(db,"users",currentUser.uid,"addresses",editId),

data

);

if(defaultAddress.checked){

await updateDoc(

doc(db,"users",currentUser.uid),

{

selectedAddressId:editId

}

);

}

editId=null;

}else{

const ref=await addDoc(

collection(db,"users",currentUser.uid,"addresses"),

data

);

if(defaultAddress.checked){

await updateDoc(

doc(db,"users",currentUser.uid),

{

selectedAddressId:ref.id

}

);

}

}

modal.classList.remove("active");

editId=null;

form.reset();

country.value="India";

loadAddresses();

});

/* ===========================
LOAD ADDRESSES
=========================== */

async function loadAddresses(){

const userSnap=await getDoc(

doc(db,"users",currentUser.uid)

);

const defaultId=userSnap.exists()

?userSnap.data().selectedAddressId

:"";

selectedAddressId = defaultId;

const snap=await getDocs(

collection(db,"users",currentUser.uid,"addresses")

);

if(snap.empty){

addressList.innerHTML=`

<div class="empty-address">

📍

<h3>No Saved Address</h3>

<p>Add your first delivery address.</p>

</div>

`;

return;

}

addressList.innerHTML="";

snap.forEach(docSnap=>{

const a=docSnap.data();

addressList.innerHTML+=`

<div class="address-card ${selectedAddressId===docSnap.id ? "selected-address" : ""}">

<div class="address-top">

<div class="address-type">

🏠 ${a.type}

</div>

${defaultId===docSnap.id ?

'<div class="default-badge">⭐ Default</div>'

:''}

</div>

<h3>${a.fullName}</h3>

<p>${a.phone}</p>

<p>${a.house}, ${a.area}</p>

<p>${a.city}, ${a.state} - ${a.pincode}</p>

<p>${a.country}</p>

<div class="address-actions">

<button
class="deliver-btn"
data-id="${docSnap.id}">

${selectedAddressId===docSnap.id
? "✓ Delivering Here"
: "Deliver Here"}

</button>

<button
class="edit-btn"
data-id="${docSnap.id}">

Edit

</button>

<button
class="delete-btn"
data-id="${docSnap.id}">

Delete

</button>

</div>

</div>

`;

});

bindAddressButtons();

}

/* ===========================
BUTTON EVENTS
=========================== */

function bindAddressButtons(){

document.querySelectorAll(".edit-btn").forEach(btn=>{

btn.onclick=()=>{

editAddress(btn.dataset.id);

};

});

document.querySelectorAll(".delete-btn").forEach(btn=>{

btn.onclick=()=>{

deleteAddress(btn.dataset.id);

};

});

document.querySelectorAll(".deliver-btn").forEach(btn=>{

btn.onclick=()=>{

setDefault(btn.dataset.id);

};

});

}

/* ===========================
EDIT
=========================== */

async function editAddress(id){

editId=id;

const snap=await getDoc(

doc(db,"users",currentUser.uid,"addresses",id)

);

const a=snap.data();

fullName.value=a.fullName;

phone.value=a.phone;

pincode.value=a.pincode;

house.value=a.house;

area.value=a.area;

landmark.value=a.landmark;

city.value=a.city;

state.value=a.state;

country.value=a.country;

addressType.value=a.type;

defaultAddress.checked=a.isDefault || false;

document.getElementById("modalTitle").innerHTML="Edit Address";

modal.classList.add("active");

}

/* ===========================
DELETE
=========================== */

async function deleteAddress(id){

if(!confirm("Delete this address?")) return;

await deleteDoc(

doc(db,"users",currentUser.uid,"addresses",id)

);

loadAddresses();

}

/* ===========================
SET DEFAULT
=========================== */

async function setDefault(id){

selectedAddressId = id;

const snap = await getDocs(

collection(db,"users",currentUser.uid,"addresses")

);

for(const d of snap.docs){

await updateDoc(

d.ref,

{

isDefault:d.id===id

}

);

}

await updateDoc(

doc(db,"users",currentUser.uid),

{

selectedAddressId:id

}

);

loadAddresses();

}

/* ===========================
CART DOM
=========================== */

const checkoutItems = document.getElementById("checkoutItems");

const subtotalEl = document.getElementById("subtotal");

const totalEl = document.getElementById("total");

let subtotal = 0;

/* ===========================
LOAD CART
=========================== */

async function loadCart(){

const snap = await getDocs(

collection(db,"users",currentUser.uid,"cart")

);

checkoutItems.innerHTML="";

subtotal=0;

if(snap.empty){

checkoutItems.innerHTML=`

<div class="empty-address">

🛒

<h3>Your Cart is Empty</h3>

<p>Add some products before checkout.</p>

</div>

`;

subtotalEl.innerHTML="₹0";

totalEl.innerHTML="₹0";

return;

}

snap.forEach(docSnap=>{

const item=docSnap.data();

subtotal += Number(item.price)*Number(item.quantity);

checkoutItems.innerHTML += renderCartItem(item);

});

subtotalEl.innerHTML=`₹${subtotal}`;

totalEl.innerHTML=`₹${subtotal}`;

}

/* ===========================
RENDER CART ITEM
=========================== */

function renderCartItem(item){

return `

<div class="checkout-item">

<div class="checkout-image">

<img
src="${item.image}"
alt="${item.productName}">

</div>

<div class="checkout-info">

<h3>${item.productName}</h3>

<p>

${item.selectedColor?.name || ""}

|

Size ${item.selectedSize}

</p>

<p>

Quantity : ${item.quantity}

</p>

</div>

<div class="checkout-price">

₹${Number(item.price)*Number(item.quantity)}

</div>

</div>

`;

}

/* ===========================
PLACE ORDER BUTTON
=========================== */

const placeOrderBtn=document.getElementById("placeOrderBtn");

if(placeOrderBtn){

placeOrderBtn.onclick=async()=>{

if(!currentUser){

location.href="login.html";

return;

}

const addressSnap=await getDoc(

doc(db,"users",currentUser.uid)

);

const selectedAddressId=

addressSnap.data()?.selectedAddressId;

if(!selectedAddressId){

alert("Please select a delivery address.");

return;

}

const cartSnap=await getDocs(

collection(db,"users",currentUser.uid,"cart")

);

if(cartSnap.empty){

alert("Cart is empty.");

return;

}

const items=[];

cartSnap.forEach(d=>{

items.push(d.data());

});

const addressDoc=await getDoc(

doc(

db,

"users",

currentUser.uid,

"addresses",

selectedAddressId

)

);

await addDoc(

collection(db,"orders"),

{

userId:currentUser.uid,

email:currentUser.email,

address:addressDoc.data(),

items,

subtotal,

shipping:0,

total:subtotal,

status:"Pending",

paymentStatus:"Pending",

createdAt:serverTimestamp()

}

);

for(const d of cartSnap.docs){

await deleteDoc(d.ref);

}

alert("Order Placed Successfully");

location.href="orders.html";

};

}