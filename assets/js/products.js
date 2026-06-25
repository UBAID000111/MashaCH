import {
    CLOUD_NAME,
    UPLOAD_PRESET
} from "../js/cloudinary.js";

async function uploadImage(file){

    const formData = new FormData();

    formData.append("file", file);

    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(

        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,

        {
            method:"POST",
            body:formData
        }

    );

    const data = await response.json();

    return data.secure_url;

}
import { db } from "../firebase/firebase-config.js";

import {
collection,
addDoc,
getDocs,
deleteDoc,
updateDoc,
doc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ===========================
   DOM
=========================== */

const form=document.getElementById("productForm");

const showBtn=document.getElementById("showProductForm");

const saveBtn=document.getElementById("saveProduct");

const table=document.getElementById("productTable");

const category=document.getElementById("productCategory");

const search=document.getElementById("searchProduct");

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
   LOAD CATEGORY
=========================== */

async function loadCategories(){

category.innerHTML=

`<option value="">Select Category</option>`;

const snapshot=

await getDocs(collection(db,"categories"));

snapshot.forEach((item)=>{

const data=item.data();

category.innerHTML+=`

<option value="${data.name}">

${data.name}

</option>

`;

});

}

/* ===========================
   SAVE PRODUCT
=========================== */

saveBtn.onclick = async () => {

     let imageUrl = "";

    const file = document.getElementById("mainImage").files[0];

    if(file){

        imageUrl = await uploadImage(file);

    }

    

else{
    imageUrl = document.querySelector("#productTable img").src;
}

    const product = {

        name: document.getElementById("productName").value.trim(),

        slug: document.getElementById("productSlug").value.trim(),

        category: category.value,

        description: document.getElementById("productDescription").value.trim(),

        price: Number(document.getElementById("productPrice").value),

        oldPrice: Number(document.getElementById("oldPrice").value),

        discount: Number(document.getElementById("discount").value),

        stock: Number(document.getElementById("stock").value),

        sku: document.getElementById("sku").value.trim(),

        colors: document.getElementById("colors").value.trim(),

        featured: document.getElementById("featured").checked,

        newArrival: document.getElementById("newArrival").checked,

        onSale: document.getElementById("onSale").checked,

        trending: document.getElementById("trending").checked,

        showHome: document.getElementById("showHome").checked,

        status: document.getElementById("productStatus").value,

        image: imageUrl,

        createdAt: serverTimestamp()

    };

    if(product.name===""){

        alert("Enter Product Name");

        return;

    }

    if(product.category===""){

        alert("Select Category");

        return;

    }

    await addDoc(

        collection(db,"products"),

        product

    );

    alert("Product Added Successfully");

    form.reset();

    form.style.display="none";

    showBtn.innerText="+ Add Product";

    loadProducts();

};

/* ===========================
   LOAD PRODUCTS
=========================== */

async function loadProducts(){

    table.innerHTML="";

    const snapshot=

    await getDocs(collection(db,"products"));

    snapshot.forEach((item)=>{

        const p=item.data();

        table.innerHTML+=`

<tr>

<td>

<img

src="${
p.image
?
p.image
:
'https://placehold.co/80x100?text=No+Image'
}"

width="70">

</td>

<td>${p.name}</td>

<td>${p.category}</td>

<td>₹${p.price}</td>

<td>${p.stock}</td>

<td>${p.status}</td>

<td>

${p.featured ? "⭐" : "-"}

</td>

<td>

<div class="action-buttons">

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

</div>

</td>

</tr>

`;

    });

    addDeleteEvents();
    addEditEvents();

}

/* ===========================
   LIVE SEARCH
=========================== */

search.addEventListener("keyup", () => {

    const value = search.value.toLowerCase();

    const rows = table.querySelectorAll("tr");

    rows.forEach((row) => {

        row.style.display = row.innerText
            .toLowerCase()
            .includes(value)
            ? ""
            : "none";

    });

});


/* ===========================
   AUTO SLUG
=========================== */

const productName = document.getElementById("productName");
const productSlug = document.getElementById("productSlug");

productName.addEventListener("keyup", () => {

    productSlug.value = productName.value

        .toLowerCase()

        .trim()

        .replace(/ /g, "-")

        .replace(/[^\w-]+/g, "");

});


/* ===========================
   EDIT PRODUCT
=========================== */

let editId = "";

function addEditEvents() {

    document.querySelectorAll(".edit-btn").forEach((btn) => {

        btn.onclick = async () => {

            editId = btn.dataset.id;

            const snapshot = await getDocs(collection(db, "products"));

            snapshot.forEach((docSnap) => {

                if (docSnap.id === editId) {

                    const p = docSnap.data();

                    form.style.display = "block";

                    showBtn.innerText = "Close";

                    document.getElementById("productName").value = p.name;

                    document.getElementById("productSlug").value = p.slug;

                    category.value = p.category;

                    document.getElementById("productDescription").value = p.description;

                    document.getElementById("productPrice").value = p.price;

                    document.getElementById("oldPrice").value = p.oldPrice;

                    document.getElementById("discount").value = p.discount;

                    document.getElementById("stock").value = p.stock;

                    document.getElementById("sku").value = p.sku;

                    document.getElementById("colors").value = p.colors;

                    document.getElementById("featured").checked = p.featured;

                    document.getElementById("newArrival").checked = p.newArrival;

                    document.getElementById("onSale").checked = p.onSale;

                    document.getElementById("trending").checked = p.trending;

                    document.getElementById("showHome").checked = p.showHome;

                    document.getElementById("productStatus").value = p.status;

                    saveBtn.style.display = "none";

                    document.getElementById("updateProduct").style.display = "inline-block";

                }

            });

        };

    });

}

/* ===========================
   UPDATE PRODUCT
=========================== */

const updateBtn = document.getElementById("updateProduct");

updateBtn.onclick = async () => {

    if(editId==="") return;

    const product = {

        name: document.getElementById("productName").value.trim(),

        slug: document.getElementById("productSlug").value.trim(),

        category: category.value,

        description: document.getElementById("productDescription").value.trim(),

        price: Number(document.getElementById("productPrice").value),

        oldPrice: Number(document.getElementById("oldPrice").value),

        discount: Number(document.getElementById("discount").value),

        stock: Number(document.getElementById("stock").value),

        sku: document.getElementById("sku").value.trim(),

        colors: document.getElementById("colors").value.trim(),

        featured: document.getElementById("featured").checked,

        newArrival: document.getElementById("newArrival").checked,

        onSale: document.getElementById("onSale").checked,

        trending: document.getElementById("trending").checked,

        showHome: document.getElementById("showHome").checked,

        status: document.getElementById("productStatus").value

    };

    await updateDoc(doc(db,"products",editId),product);

    alert("Product Updated Successfully");

    form.reset();

    editId="";

    saveBtn.style.display="inline-block";

    updateBtn.style.display="none";

    form.style.display="none";

    showBtn.innerText="+ Add Product";

    loadProducts();

};


/* ===========================
   AUTO DISCOUNT
=========================== */

const price=document.getElementById("productPrice");

const oldPrice=document.getElementById("oldPrice");

const discount=document.getElementById("discount");

function calculateDiscount(){

    const p=Number(price.value);

    const o=Number(oldPrice.value);

    if(p>0 && o>0 && o>p){

        discount.value=

        Math.round(((o-p)/o)*100);

    }

}

price.addEventListener("keyup",calculateDiscount);

oldPrice.addEventListener("keyup",calculateDiscount);


/* ===========================
   IMAGE PREVIEW
=========================== */

const mainImage=document.getElementById("mainImage");

const preview=document.getElementById("imagePreview");

mainImage.addEventListener("change",()=>{

    preview.innerHTML="";

    const file=mainImage.files[0];

    if(!file) return;

    const reader=new FileReader();

    reader.onload=function(e){

        preview.innerHTML=`

<img src="${e.target.result}">

`;

    }

    reader.readAsDataURL(file);

});


/* ===========================
   RESET FORM
=========================== */

form.addEventListener("reset",()=>{

    preview.innerHTML="";

    saveBtn.style.display="inline-block";

    updateBtn.style.display="none";

    editId="";

});


/* ===========================
   START
=========================== */

loadCategories();

loadProducts();