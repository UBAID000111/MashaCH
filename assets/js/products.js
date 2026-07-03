import { db } from "../firebase/firebase-config.js";

import { clearProductCache } from "../js/services/productService.js";

import { clearCategoryCache } from "../js/services/categoryService.js";

import { showToast } from "./services/toastService.js";

import {

collection,

addDoc,

getDocs,

getDoc,

updateDoc,

deleteDoc,

doc,

serverTimestamp

} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ===========================
DOM
=========================== */

const form=document.getElementById("productForm");

const showBtn=document.getElementById("showProductForm");

const saveBtn=document.getElementById("saveProduct");

const updateBtn=document.getElementById("updateProduct");

const table=document.getElementById("productTable");

const category=document.getElementById("productCategory");

const search=document.getElementById("searchProduct");

const variantsContainer=document.getElementById("variantsContainer");

const template=document.getElementById("variantTemplate");

const addVariantBtn=document.getElementById("addVariant");

let editId="";

let variantCount=0;

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
SHOW FORM
=========================== */

showBtn.onclick=()=>{

if(form.style.display==="none"){

form.style.display="block";

showBtn.innerText="Close";

}else{

form.style.display="none";

showBtn.innerText="+ Add Product";

}

};

/* ===========================
CREATE VARIANT
=========================== */

function createVariant(data={}){

variantCount++;

const clone=

template.content.cloneNode(true);

const card=

clone.querySelector(".variant-card");

card.dataset.oldImage = data.image || "";

card.dataset.oldGallery = JSON.stringify(data.gallery || []);

card.querySelector(".variant-title").innerText=

"Variant "+variantCount;

card.querySelector(".variantColor").value=

data.color?.name || "";

card.querySelector(".variantHex").value=

data.color?.hex || "#000000";

card.querySelector(".variantPrice").value=

data.price || "";

card.querySelector(".variantOldPrice").value=

data.oldPrice || "";

card.querySelector(".variantStock").value=

data.stock || "";

card.querySelector(".variantSku").value=

data.sku || "";

if(data.sizes){

card.querySelectorAll(".variantSize")

.forEach(box=>{

if(data.sizes.includes(box.value))

box.checked=true;

});

}

const preview=

card.querySelector(".variantPreview");

if(data.image){

preview.innerHTML+=`

<img

src="${data.image}"

style="width:90px;height:110px;object-fit:cover;border-radius:8px;">

`;

}

if(data.gallery){

data.gallery.forEach(img=>{

preview.innerHTML+=`

<img

src="${img}"

style="width:90px;height:110px;object-fit:cover;border-radius:8px;">

`;

});

}

card.querySelector(".remove-variant")

.onclick=()=>{

card.remove();

};

variantsContainer.appendChild(clone);

}

/* ===========================
ADD VARIANT
=========================== */

addVariantBtn.onclick=()=>{

createVariant();

};

/* First Variant */

createVariant();

/* ===========================
COLLECT VARIANTS
=========================== */

async function collectVariants(){

const cards=document.querySelectorAll(".variant-card");

const variants=[];

for(const card of cards){

let image= card.dataset.oldImage || "";

const imageFile=card.querySelector(".variantImage").files[0];

if(imageFile){

image=await uploadImage(imageFile);

}

let gallery = JSON.parse(card.dataset.oldGallery || "[]");

const galleryFiles=

card.querySelector(".variantGallery").files;

for(const file of galleryFiles){

gallery.push(await uploadImage(file));

}

const sizes=[];

card.querySelectorAll(".variantSize:checked").forEach(size=>{

sizes.push(size.value);

});

variants.push({

color:{

name:card.querySelector(".variantColor").value.trim(),

hex:card.querySelector(".variantHex").value

},

price:Number(card.querySelector(".variantPrice").value),

oldPrice:Number(card.querySelector(".variantOldPrice").value),

stock:Number(card.querySelector(".variantStock").value),

sku:card.querySelector(".variantSku").value.trim(),

sizes,

image,

gallery

});

}

return variants;

}

/* ===========================
SAVE PRODUCT
=========================== */

saveBtn.onclick=async()=>{

try{

const variants=await collectVariants();

const product={

name:document.getElementById("productName").value.trim(),

slug:document.getElementById("productSlug").value.trim(),

category:category.value,

description:document.getElementById("productDescription").value.trim(),

featured:document.getElementById("featured").checked,

newArrival:document.getElementById("newArrival").checked,

onSale:document.getElementById("onSale").checked,

trending:document.getElementById("trending").checked,

showHome:document.getElementById("showHome").checked,

status:document.getElementById("productStatus").value,

metaTitle:document.getElementById("metaTitle").value.trim(),

metaDescription:document.getElementById("metaDescription").value.trim(),

variants,

createdAt:serverTimestamp()

};

await addDoc(collection(db,"products"),product);

clearProductCache();

alert("Product Saved");

form.reset();

variantsContainer.innerHTML="";

variantCount=0;

createVariant();

form.style.display="none";

showBtn.innerText="+ Add Product";

loadProducts();

}catch(err){

console.error(err);

alert(err.message);

}

};

/* ===========================
LOAD CATEGORY DROPDOWN
=========================== */

async function loadCategories(){

const select=document.getElementById("productCategory");

select.innerHTML=`<option value="">Select Category</option>`;

const snapshot=await getDocs(collection(db,"categories"));

snapshot.forEach(docSnap=>{

const c=docSnap.data();

if(c.status==="Active"){

select.innerHTML+=`

<option value="${c.name}">

${c.name}

</option>

`;

}

});

}

/* ===========================
LOAD PRODUCTS
=========================== */

async function loadProducts(){

table.innerHTML="";

const snapshot=await getDocs(collection(db,"products"));

snapshot.forEach(item=>{

const p=item.data();

const first=p.variants?.[0] || {};

table.innerHTML+=`

<tr>

<td>

<img
src="${first.image || ""}"
style="width:70px;height:90px;object-fit:cover;border-radius:8px;">

</td>

<td>${p.name}</td>

<td>${p.category}</td>

<td>₹${first.price || 0}</td>

<td>${first.stock || 0}</td>

<td>${p.status}</td>

<td>${p.featured ? "⭐" : "-"}</td>

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
EDIT PRODUCT
=========================== */

function addEditEvents(){

document.querySelectorAll(".edit-btn").forEach(btn=>{

btn.onclick=async()=>{

editId=btn.dataset.id;

const snap=await getDoc(doc(db,"products",editId));

if(!snap.exists()) return;

const p=snap.data();

form.style.display="block";

showBtn.innerText="Close";

document.getElementById("productName").value=p.name||"";

document.getElementById("productSlug").value=p.slug||"";

category.value=p.category||"";

document.getElementById("productDescription").value=p.description||"";

document.getElementById("featured").checked=p.featured||false;

document.getElementById("newArrival").checked=p.newArrival||false;

document.getElementById("onSale").checked=p.onSale||false;

document.getElementById("trending").checked=p.trending||false;

document.getElementById("showHome").checked=p.showHome||false;

document.getElementById("productStatus").value=p.status||"Active";

document.getElementById("metaTitle").value=p.metaTitle||"";

document.getElementById("metaDescription").value=p.metaDescription||"";

variantsContainer.innerHTML="";

variantCount=0;

p.variants.forEach(v=>{

createVariant(v);

});

saveBtn.style.display="none";

updateBtn.style.display="inline-block";

};

});

}

/* ===========================
UPDATE PRODUCT
=========================== */

updateBtn.onclick=async()=>{

try{

const variants=await collectVariants();

const product={

name:document.getElementById("productName").value.trim(),

slug:document.getElementById("productSlug").value.trim(),

category:category.value,

description:document.getElementById("productDescription").value.trim(),

featured:document.getElementById("featured").checked,

newArrival:document.getElementById("newArrival").checked,

onSale:document.getElementById("onSale").checked,

trending:document.getElementById("trending").checked,

showHome:document.getElementById("showHome").checked,

status:document.getElementById("productStatus").value,

metaTitle:document.getElementById("metaTitle").value.trim(),

metaDescription:document.getElementById("metaDescription").value.trim(),

variants

};

await updateDoc(

doc(db,"products",editId),

product

);

clearProductCache();

alert("Product Updated");

saveBtn.style.display="inline-block";

updateBtn.style.display="none";

editId="";

form.reset();

variantsContainer.innerHTML="";

variantCount=0;

createVariant();

form.style.display="none";

showBtn.innerText="+ Add Product";

loadProducts();

}catch(err){

console.error(err);

showToast(err.message);

}

};

/* ===========================
DELETE PRODUCT
=========================== */

function addDeleteEvents(){

document.querySelectorAll(".delete-btn").forEach(btn=>{

btn.onclick=async()=>{

if(!confirm("Delete Product?")) return;

await deleteDoc(doc(db,"products",btn.dataset.id));

clearProductCache();

loadProducts();

};

});

}

/* ===========================
SEARCH
=========================== */

search.onkeyup=()=>{

const key=search.value.toLowerCase();

document.querySelectorAll("#productTable tr").forEach(row=>{

row.style.display=row.innerText.toLowerCase().includes(key) ? "" : "none";

});

};

/* ===========================
START
=========================== */

loadCategories();

loadProducts();



