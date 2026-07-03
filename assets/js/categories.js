import { db } from "../firebase/firebase-config.js";

import {

collection,

addDoc,

getDocs,

doc,

getDoc,

updateDoc,

deleteDoc,

serverTimestamp

} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { showToast } from "./services/toastService.js";

/* ===========================
DOM
=========================== */

const form=document.getElementById("categoryForm");

const showBtn=document.getElementById("showCategoryForm");

const saveBtn=document.getElementById("saveCategory");

const updateBtn=document.getElementById("updateCategory");

const table=document.getElementById("categoryTable");

const search=document.getElementById("searchCategory");

const preview=document.getElementById("categoryPreview");

let editId="";

/* ===========================
CLOUDINARY
=========================== */

const CLOUD_NAME="denwuj9ai";

const UPLOAD_PRESET="MashaCH";

/* ===========================
UPLOAD IMAGE
=========================== */

async function uploadImage(file){

const data=new FormData();

data.append("file",file);

data.append("upload_preset",UPLOAD_PRESET);

const res=await fetch(

`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,

{

method:"POST",

body:data

}

);

const json=await res.json();

return json.secure_url;

}

/* ===========================
SHOW / HIDE FORM
=========================== */

showBtn.onclick=()=>{

if(form.style.display==="none"){

form.style.display="block";

showBtn.innerText="Close";

}else{

form.style.display="none";

showBtn.innerText="+ Add Category";

}

};

/* ===========================
AUTO SLUG
=========================== */

document.getElementById("categoryName")

.addEventListener("input",()=>{

document.getElementById("categorySlug").value=

document.getElementById("categoryName")

.value

.toLowerCase()

.trim()

.replace(/[^a-z0-9]+/g,"-")

.replace(/^-|-$/g,"");

});

/* ===========================
IMAGE PREVIEW
=========================== */

document.getElementById("categoryImage")

.onchange=e=>{

preview.innerHTML="";

const file=e.target.files[0];

if(!file) return;

const img=document.createElement("img");

img.src=URL.createObjectURL(file);

preview.appendChild(img);

};

/* ===========================
SAVE CATEGORY
=========================== */

saveBtn.onclick=async()=>{

try{

let image="";

const file=document.getElementById("categoryImage").files[0];

if(file){

image=await uploadImage(file);

}

const category={

name:document.getElementById("categoryName").value.trim(),

slug:document.getElementById("categorySlug").value.trim(),

parent:document.getElementById("parentCategory").value,

description:document.getElementById("categoryDescription").value.trim(),

status:document.getElementById("categoryStatus").value,

displayOrder:Number(document.getElementById("displayOrder").value),

showHome:document.getElementById("showHome").checked,

featured:document.getElementById("featuredCategory").checked,

image,

createdAt:serverTimestamp()

};

await addDoc(collection(db,"categories"),category);

showToast("Category Saved Successfully");

form.reset();

preview.innerHTML="";

form.style.display="none";

showBtn.innerText="+ Add Category";

loadCategories();

}catch(err){

console.error(err);

alert(err.message);

}

};

/* ===========================
LOAD CATEGORIES
=========================== */

async function loadCategories(){

table.innerHTML="";

const snapshot=await getDocs(collection(db,"categories"));

const parent=document.getElementById("parentCategory");

parent.innerHTML='<option value="">None</option>';

snapshot.forEach(item=>{

const c=item.data();

parent.innerHTML+=`

<option value="${c.name}">

${c.name}

</option>

`;

table.innerHTML+=`

<tr>

<td>

<img

src="${c.image}"

style="width:70px;height:70px;object-fit:cover;border-radius:8px;">

</td>

<td>${c.name}</td>

<td>${c.slug}</td>

<td>${c.parent||"-"}</td>

<td>${c.status}</td>

<td>${c.showHome?"✔":"✖"}</td>

<td>

<button

class="edit-btn"

data-id="${item.id}">

Edit

</button>

<button

class="delete-btn"

data-id="${item.id}">

Delete

</button>

</td>

</tr>

`;

});

addEditEvents();

addDeleteEvents();

}

/* ===========================
EDIT CATEGORY
=========================== */

function addEditEvents(){

document.querySelectorAll(".edit-btn").forEach(btn=>{

btn.onclick=async()=>{

editId=btn.dataset.id;

const snap=await getDoc(doc(db,"categories",editId));

const c=snap.data();

form.style.display="block";

showBtn.innerText="Close";

document.getElementById("categoryName").value=c.name;

document.getElementById("categorySlug").value=c.slug;

document.getElementById("parentCategory").value=c.parent;

document.getElementById("categoryDescription").value=c.description;

document.getElementById("categoryStatus").value=c.status;

document.getElementById("displayOrder").value=c.displayOrder;

document.getElementById("showHome").checked=c.showHome;

document.getElementById("featuredCategory").checked=c.featured;

preview.innerHTML=`<img src="${c.image}">`;

preview.dataset.oldImage=c.image;

saveBtn.style.display="none";

updateBtn.style.display="inline-block";

};

});

}

/* ===========================
UPDATE CATEGORY
=========================== */

updateBtn.onclick=async()=>{

try{

let image=preview.dataset.oldImage||"";

const file=document.getElementById("categoryImage").files[0];

if(file){

image=await uploadImage(file);

}

await updateDoc(doc(db,"categories",editId),{

name:document.getElementById("categoryName").value.trim(),

slug:document.getElementById("categorySlug").value.trim(),

parent:document.getElementById("parentCategory").value,

description:document.getElementById("categoryDescription").value.trim(),

status:document.getElementById("categoryStatus").value,

displayOrder:Number(document.getElementById("displayOrder").value),

showHome:document.getElementById("showHome").checked,

featured:document.getElementById("featuredCategory").checked,

image

});

showToast("Category Updated");

form.reset();

preview.innerHTML="";

saveBtn.style.display="inline-block";

updateBtn.style.display="none";

form.style.display="none";

showBtn.innerText="+ Add Category";

loadCategories();

}catch(err){

showToast(err.message);

}

};

/* ===========================
DELETE CATEGORY
=========================== */

function addDeleteEvents(){

document.querySelectorAll(".delete-btn").forEach(btn=>{

btn.onclick=async()=>{

if(!confirm("Delete Category?")) return;

await deleteDoc(doc(db,"categories",btn.dataset.id));

loadCategories();

};

});

}

/* ===========================
SEARCH
=========================== */

search.onkeyup=()=>{

const key=search.value.toLowerCase();

document.querySelectorAll("#categoryTable tr").forEach(row=>{

row.style.display=

row.innerText.toLowerCase().includes(key)

?

""

:

"none";

});

};

/* ===========================
START
=========================== */

loadCategories();