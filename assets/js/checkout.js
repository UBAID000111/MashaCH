import { auth, db } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const modal = document.getElementById("addressModal");
const addBtn = document.getElementById("addAddressBtn");
const closeBtn = document.getElementById("closeAddress");
const form = document.getElementById("addressForm");
const addressList = document.getElementById("addressList");

const checkoutItems = document.getElementById("checkoutItems");

const subtotalEl = document.getElementById("subtotal");

const totalEl = document.getElementById("total");

let subtotal = 0;

let currentUser = null;

/* ===========================
AUTH
=========================== */

onAuthStateChanged(auth, user => {

    if (!user) {

        location.href = "login.html";

        return;

    }

   currentUser = user;

loadAddresses();

loadCart();

});

/* ===========================
MODAL
=========================== */

addBtn.onclick = () => {

    modal.classList.add("active");

};

closeBtn.onclick = () => {

    modal.classList.remove("active");

};

modal.onclick = e => {

    if (e.target === modal) {

        modal.classList.remove("active");

    }

};

/* ===========================
SAVE ADDRESS
=========================== */

form.addEventListener("submit", async e => {

    e.preventDefault();

    const data = {

        fullName: fullName.value.trim(),
        phone: phone.value.trim(),
        pincode: pincode.value.trim(),
        house: house.value.trim(),
        area: area.value.trim(),
        landmark: landmark.value.trim(),
        city: city.value.trim(),
        state: state.value.trim(),
        country: country.value.trim(),
        type: addressType.value,
        isDefault: defaultAddress.checked,
        createdAt: serverTimestamp()

    };

    const ref = await addDoc(

        collection(db, "users", currentUser.uid, "addresses"),

        data

    );

    if (defaultAddress.checked) {

        await updateDoc(

            doc(db, "users", currentUser.uid),

            {

                defaultAddressId: ref.id

            }

        );

    }

    form.reset();

    country.value = "India";

    modal.classList.remove("active");

    loadAddresses();

});

/* ===========================
LOAD ADDRESSES
=========================== */

async function loadAddresses(){

    const snap = await getDocs(
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

        <div class="address-card">

            <div class="address-top">

                <div class="address-type">

                    🏠 ${a.type}

                </div>

                ${a.isDefault ? '<div class="default-badge">⭐ Default</div>' : ""}

            </div>

            <h3>${a.fullName}</h3>

            <p>${a.phone}</p>

            <p>${a.house}, ${a.area}</p>

            <p>${a.city}, ${a.state} - ${a.pincode}</p>

            <p>${a.country}</p>

            <div class="address-actions">

                <button class="deliver-btn">

                    Deliver Here

                </button>

                <button class="edit-btn">

                    Edit

                </button>

                <button class="delete-btn">

                    Delete

                </button>

            </div>

        </div>

        `;

    });

}

/* ===========================
LOAD CART
=========================== */

async function loadCart() {

    const snap = await getDocs(

        collection(db, "users", currentUser.uid, "cart")

    );

    checkoutItems.innerHTML = "";

    subtotal = 0;

    if (snap.empty) {

        checkoutItems.innerHTML = `

        <div class="empty-address">

            🛒

            <h3>Your Cart is Empty</h3>

        </div>

        `;

        subtotalEl.innerHTML = "₹0";

        totalEl.innerHTML = "₹0";

        return;

    }

    snap.forEach(docSnap => {

        const item = docSnap.data();

        subtotal += item.price * item.quantity;

        checkoutItems.innerHTML += `

<div class="checkout-item">

<img src="${item.image}" alt="">

<div class="checkout-info">

<h4>${item.productName}</h4>

<p>

${item.selectedColor?.name || ""}

|

Size ${item.selectedSize}

</p>

<p>

Qty : ${item.quantity}

</p>

</div>

<h3>

₹${item.price * item.quantity}

</h3>

</div>

`;

    });

    subtotalEl.innerHTML = `₹${subtotal}`;

    totalEl.innerHTML = `₹${subtotal}`;

}