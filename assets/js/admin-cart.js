import { db } from "../firebase/firebase-config.js";

import {
    collection,
    getDocs,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const table = document.getElementById("cartTable");

const modal = document.getElementById("cartModal");

const cartDetails = document.getElementById("cartDetails");

const closeBtn = document.getElementById("closeCartModal");

/* ===========================
LOAD CART LEADS
=========================== */

async function loadCartLeads() {

    table.innerHTML = "";

    const mobileList = document.getElementById("mobileCartList");

    mobileList.innerHTML = "";

    const snap = await getDocs(collection(db, "adminCart"));

    if (snap.empty) {

        table.innerHTML = `
        <tr>
            <td colspan="5" style="text-align:center;padding:30px;">
                No Customer Carts
            </td>
        </tr>
        `;

        mobileList.innerHTML = `
        <div class="lead-card">
            <h3>No Customer Carts</h3>
        </div>
        `;

        return;

    }

    snap.forEach(d => {

        const user = d.data();

        /* ---------- Desktop Table ---------- */

        table.innerHTML += `

<tr>

<td>${user.contacted ? "🟢 Contacted" : "🟠 New"}</td>

<td>${user.userName || "-"}</td>

<td>${user.phone || "-"}</td>

<td>${user.email || "-"}</td>

<td>

<button class="view-btn"
onclick="viewCart('${user.userId}')">

View

</button>

<button class="done-btn"
onclick="markDone('${user.userId}')">

✓

</button>

</td>

</tr>

`;

        /* ---------- Mobile Card ---------- */

        mobileList.innerHTML += `

<div class="lead-card">

<div class="lead-top">

<div>

<h3>${user.userName || "Customer"}</h3>

<p>${user.email || "-"}</p>

<p>${user.phone || "-"}</p>

</div>

<div class="${user.contacted ? "status-green" : "status-orange"}">

${user.contacted ? "✓ Contacted" : "New"}

</div>

</div>

<div class="lead-actions">

<button onclick="viewCart('${user.userId}')">

View Cart

</button>

<button onclick="markDone('${user.userId}')">

✓ Done

</button>

</div>

</div>

`;

    });

}

loadCartLeads();

/* ===========================
MARK CONTACTED
=========================== */

window.markDone = async (uid) => {

    await updateDoc(

        doc(db, "adminCart", uid),

        {
            contacted: true,
            status: "Contacted"
        }

    );

    loadCartLeads();

};

/* ===========================
VIEW CUSTOMER CART
=========================== */

window.viewCart = async (uid) => {

    modal.classList.add("active");

    cartDetails.innerHTML = "<p>Loading...</p>";

    const snap = await getDocs(

        collection(db, "users", uid, "cart")

    );

    cartDetails.innerHTML = "";

    if (snap.empty) {

        cartDetails.innerHTML = `
        <p style="text-align:center;padding:30px;">
            Cart is Empty
        </p>
        `;

        return;

    }

    let total = 0;

    snap.forEach(docSnap => {

        const item = docSnap.data();

        total += item.price * item.quantity;

        cartDetails.innerHTML += `

<div class="cart-item">

<img src="${item.image}" alt="">

<div class="cart-info">

<h3>${item.productName}</h3>

<p>

${item.selectedColor?.name || ""}

|

Size ${item.selectedSize}

</p>

<p>

Qty : ${item.quantity}

</p>

<h4>

₹${item.price}

</h4>

</div>

</div>

`;

    });

    cartDetails.innerHTML += `

<hr>

<h2 style="text-align:right">

Total : ₹${total}

</h2>

`;

};

/* ===========================
CLOSE MODAL
=========================== */

closeBtn.onclick = () => {

    modal.classList.remove("active");

};

modal.onclick = (e) => {

    if (e.target === modal) {

        modal.classList.remove("active");

    }

};