import { auth, db, functions } from "../firebase/firebase-config.js";

import {
httpsCallable
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-functions.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
    collection,
    getDocs,
    getDoc,
    doc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const addressBox = document.getElementById("selectedAddress");
const itemsBox = document.getElementById("paymentItems");
const subtotalEl = document.getElementById("subtotal");
const totalEl = document.getElementById("total");
const payBtn = document.getElementById("payNowBtn");

let currentUser = null;
let grandTotal = 0;

onAuthStateChanged(auth, async user => {

    if (!user) {
        location.href = "login.html";
        return;
    }

    currentUser = user;

    await loadAddress();

    await loadCart();

});

/* ===========================
LOAD DEFAULT ADDRESS
=========================== */

async function loadAddress() {

    const userSnap = await getDoc(
        doc(db, "users", currentUser.uid)
    );

    const selectedId = userSnap.data()?.selectedAddressId;

    if (!selectedId) {

        addressBox.innerHTML = `
        <p>No address selected.</p>
        `;

        return;

    }

    const addressSnap = await getDoc(
        doc(db, "users", currentUser.uid, "addresses", selectedId)
    );

    if (!addressSnap.exists()) return;

    const a = addressSnap.data();

    addressBox.innerHTML = `

    <div class="selected-address">

        <h3>${a.fullName}</h3>

        <p>${a.phone}</p>

        <p>

            ${a.house},
            ${a.area},
            ${a.city},
            ${a.state}
            - ${a.pincode}

        </p>

        <p>${a.country}</p>

    </div>

    `;

}

/* ===========================
LOAD CART
=========================== */

async function loadCart() {

    const snap = await getDocs(
        collection(db, "users", currentUser.uid, "cart")
    );

    itemsBox.innerHTML = "";

    grandTotal = 0;

    if (snap.empty) {

        itemsBox.innerHTML = `
        <h3>Your cart is empty.</h3>
        `;

        payBtn.disabled = true;

        return;

    }

    snap.forEach(docSnap => {

        const item = docSnap.data();

        const itemTotal = item.price * item.quantity;

        grandTotal += itemTotal;

        itemsBox.innerHTML += `

        <div class="payment-item">

            <img src="${item.image}" alt="">

            <div class="payment-info">

                <h3>${item.productName}</h3>

                <p>

                    ${item.selectedColor?.name || ""}

                    |

                    Size ${item.selectedSize}

                </p>

                <p>

                    Qty : ${item.quantity}

                </p>

            </div>

            <div class="payment-price">

                ₹${itemTotal}

            </div>

        </div>

        `;

    });

    subtotalEl.textContent = `₹${grandTotal}`;

    totalEl.textContent = `₹${grandTotal}`;

}

/* ===========================
PAY NOW
=========================== */

payBtn.onclick = async () => {

    if (!currentUser) return;

    payBtn.disabled = true;
    payBtn.innerHTML = "Creating Secure Payment...";

    try{

        console.log("Current User:", auth.currentUser);

const token = await auth.currentUser?.getIdToken();

console.log("ID Token:", token);


        const createOrder = httpsCallable(
            functions,
            "createOrder"
        );
const response = await createOrder({
    amount: grandTotal,
    receipt: "MCH_" + Date.now()
});

console.log("Function Response:", response.data);

        const order = response.data.order;

        console.log("Order:", order);

        const options = {

            key: "rzp_live_T8gJhOFIVYCxkz",

            amount: order.amount,

            currency: order.currency,

            name: "Masha Clothing Hub",

            description: "Secure Payment",

            image: "assets/images/logo.png",

            order_id: order.id,

            prefill:{

                email:currentUser.email

            },

            theme:{

                color:"#B09246"

            },

            handler:function(payment){

                console.log(payment);

                alert("Payment Success");

            }

        };

        const razorpay = new Razorpay(options);

        razorpay.open();

    }catch(err){

        console.error(err);

        alert(err.message);

    }

    payBtn.disabled=false;

    payBtn.innerHTML="🔒 Pay Securely";

};