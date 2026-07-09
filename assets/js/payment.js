import { auth, db, functions } from "../firebase/firebase-config.js";

import {
httpsCallable
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-functions.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
    collection,
    addDoc,
    deleteDoc,
    getDocs,
    getDoc,
    updateDoc,
    increment,
    serverTimestamp,
    doc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const addressBox = document.getElementById("selectedAddress");
const itemsBox = document.getElementById("paymentItems");
const subtotalEl = document.getElementById("subtotal");
const totalEl = document.getElementById("total");

const processing =
document.getElementById("paymentProcessing");

const processingStep =
document.getElementById("processingStep");

const discountRow =
document.getElementById("discountRow");

const payBtn = document.getElementById("payNowBtn");

let currentUser = null;
let grandTotal = 0;
let discount = 0;

let appliedPromotion = null;

const savedPromotion = sessionStorage.getItem("promotion");

if(savedPromotion){

    appliedPromotion = JSON.parse(savedPromotion);

}

discount = Number(

    sessionStorage.getItem("discount") || 0

);

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

discountRow.textContent = `-₹${discount}`;

totalEl.textContent = `₹${grandTotal-discount}`;

}

async function saveOrder(payment){

    // Get selected address
    const userDoc = await getDoc(
        doc(db,"users",currentUser.uid)
    );

    const addressId = userDoc.data().selectedAddressId;

    const addressSnap = await getDoc(
        doc(
            db,
            "users",
            currentUser.uid,
            "addresses",
            addressId
        )
    );

    const address = addressSnap.data();

    // Get cart
    const cartSnap = await getDocs(
        collection(
            db,
            "users",
            currentUser.uid,
            "cart"
        )
    );

    const items=[];

    cartSnap.forEach(doc=>{

        items.push({

            id:doc.id,

            ...doc.data()

        });

    });

    // Save Order
    await addDoc(

        collection(db,"orders"),

        {

            userId:currentUser.uid,

            email:currentUser.email,

            items,

            address,

            subtotal: grandTotal,

discount: discount,

shipping: 0,

total: grandTotal - discount,

promotion: appliedPromotion
?{
    code: appliedPromotion.code,
    type: appliedPromotion.type,
    discountType: appliedPromotion.discountType,
    discountValue: appliedPromotion.discountValue,
    discount: discount
}
:null,

            paymentId:
            payment.razorpay_payment_id,

            razorpayOrderId:
            payment.razorpay_order_id,

            paymentStatus:"Paid",

            status:"Pending",

            createdAt:serverTimestamp()

        }

    );

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

const payableAmount = grandTotal - discount;        
const response = await createOrder({
    amount: payableAmount,
    receipt: "MCH_" + Date.now()
});


console.log("Function Response:", response.data);

        const order = response.data.order;

        console.log("Order:", order.id);

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

        handler: async function(payment){

    try{

        processing.classList.add("active");

        payBtn.disabled = true;

        processingStep.innerText = "Saving your order...";

        await saveOrder(payment);

        const cartSnap = await getDocs(
collection(db,"users",currentUser.uid,"cart")
);



        processingStep.innerText = "Updating inventory...";

        await updateProductStock();

        if(appliedPromotion){

            processingStep.innerText = "Applying coupon...";

            await updateDoc(

                doc(db,"promotions",appliedPromotion.code),

                {
                    used: increment(1)
                }

            );

        }

        processingStep.innerText = "Cleaning your cart...";

        await clearCart();

        processingStep.innerText = "Redirecting...";

        sessionStorage.removeItem("promotion");
        sessionStorage.removeItem("discount");

        window.location.replace("my-orders.html?anthem=1");

    }catch(err){

        console.error(err);

        processing.classList.remove("active");

        payBtn.disabled = false;

        payBtn.innerHTML = "🔒 Pay Securely";

        alert("Payment received but order could not be saved.");

    }



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


async function updateProductStock(){

    const cartSnap = await getDocs(

        collection(
            db,
            "users",
            currentUser.uid,
            "cart"
        )

    );

    for(const cartDoc of cartSnap.docs){

        const item = cartDoc.data();

        const productRef = doc(
            db,
            "products",
            item.productId
        );

        const productSnap = await getDoc(productRef);

        if(!productSnap.exists()) continue;

        const product = productSnap.data();

        const variants = product.variants || [];

        const variant = variants[item.variantIndex];

        if(!variant) continue;

        const size = variant.sizes.find(

            s => s.name === item.selectedSize

        );

        if(size){

            size.stock = Math.max(

                0,

                size.stock - item.quantity

            );

        }

        await updateDoc(productRef,{

            variants

        });

    }

    localStorage.removeItem("mashach_products");

    localStorage.removeItem("mashach_products_time");

}


async function clearCart(){

    const snap = await getDocs(

        collection(
            db,
            "users",
            currentUser.uid,
            "cart"
        )

    );

    const promises=[];

    snap.forEach(item=>{

        promises.push(

            deleteDoc(item.ref)

        );

    });

    await Promise.all(promises);

}