import { auth, db } from "../firebase/firebase-config.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {

collection,
getDocs,
addDoc,
doc,
getDoc,
updateDoc,
deleteDoc,
serverTimestamp

} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

let currentUser=null;
let editId=null;
let deleteId=null;

const list=document.getElementById("addressList");

const modal=document.getElementById("addressModal");
const addBtn=document.getElementById("addAddressBtn");
const closeBtn=document.getElementById("closeAddress");

const form=document.getElementById("addressForm");

const deleteModal=document.getElementById("deleteModal");

const cancelDelete=document.getElementById("cancelDelete");
const confirmDelete=document.getElementById("confirmDelete");

const modalTitle=document.getElementById("modalTitle");

/*=========================
LOGIN
=========================*/

onAuthStateChanged(auth,user=>{

if(!user){

location.href="login.html";

return;

}

currentUser=user;

loadAddresses();

});

/*=========================
MODAL
=========================*/

addBtn.onclick=()=>{

editId=null;

modalTitle.innerHTML="Add Address";

form.reset();

country.value="India";

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

/*=========================
SAVE
=========================*/

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

loadAddresses();

});

/*=========================
LOAD
=========================*/

async function loadAddresses(){

const userDoc=await getDoc(

doc(db,"users",currentUser.uid)

);

const defaultId=userDoc.exists()

?userDoc.data().selectedAddressId

:"";

const snap=await getDocs(

collection(db,"users",currentUser.uid,"addresses")

);

if(snap.empty){

list.innerHTML=`

<div class="empty-address">

📍

<h3>No Saved Address</h3>

<p>Add your first address.</p>

</div>

`;

return;

}

list.innerHTML="";

snap.forEach(d=>{

const a=d.data();

list.innerHTML+=`

<div class="address-card">

<div class="address-top">

<div class="address-type">

${a.type}

</div>

${defaultId===d.id?

'<div class="default-badge">⭐ Default</div>'

:''}

</div>

<h3>${a.fullName}</h3>

<p>${a.phone}</p>

<p>${a.house}</p>

<p>${a.area}</p>

<p>${a.city}, ${a.state}</p>

<p>${a.pincode}</p>

<div class="address-actions">

<button

class="edit-btn"

onclick="editAddress('${d.id}')">

Edit

</button>

<button

class="delete-btn"

onclick="deleteAddress('${d.id}')">

Delete

</button>

${
defaultId!==d.id?

`

<button

class="default-btn"

onclick="setDefault('${d.id}')">

Set Default

</button>

`

:""

}

</div>

</div>

`;

});

}

/*=========================
EDIT
=========================*/

window.editAddress=async(id)=>{

editId=id;

modalTitle.innerHTML="Edit Address";

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
defaultAddress.checked=a.isDefault||false;

modal.classList.add("active");

};

/*=========================
DELETE
=========================*/

window.deleteAddress=id=>{

deleteId=id;

deleteModal.classList.add("active");

};

cancelDelete.onclick=()=>{

deleteModal.classList.remove("active");

};

confirmDelete.onclick=async()=>{

await deleteDoc(

doc(db,"users",currentUser.uid,"addresses",deleteId)

);

deleteModal.classList.remove("active");

loadAddresses();

};

/*=========================
DEFAULT
=========================*/

window.setDefault=async(id)=>{

const snap=await getDocs(

collection(db,"users",currentUser.uid,"addresses")

);

for(const d of snap.docs){

await updateDoc(d.ref,{

isDefault:d.id===id

});

}

await updateDoc(

doc(db,"users",currentUser.uid),

{

selectedAddressId:id

}

);

loadAddresses();

};