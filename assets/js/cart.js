import { db, auth } from "../firebase/firebase-config.js";

import { optimizeImage } from "./services/imageService.js";

import {
collection,
getDocs,
doc,
getDoc,
updateDoc,
deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import {

onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const checkoutBtn = document.getElementById("checkoutBtn");

const cartGrid=document.getElementById("cartGrid");

let total=0;

onAuthStateChanged(auth,user=>{

if(user){

loadCart(user.uid);

}

});

async function loadCart(uid){

const snap=await getDocs(

collection(db,"users",uid,"cart")

);

cartGrid.innerHTML = `
<div class="cart-loading">
    Loading your cart...
</div>
`;

if (snap.empty) {

    cartGrid.innerHTML = `
        <div class="empty-cart">
            <h2>Your cart is empty</h2>
            <p>Add products to continue shopping.</p>
            <a href="shop.html">Continue Shopping</a>
        </div>
    `;

    document.getElementById("subtotal").textContent = "₹0";
    document.getElementById("total").textContent = "₹0";
    return;
}

total=0;

snap.forEach(docSnap=>{

const item=docSnap.data();

item.id=docSnap.id;

total+=item.price*item.quantity;

renderItem(item);

});

document.getElementById("subtotal").innerHTML=`₹${total}`;

document.getElementById("total").innerHTML=`₹${total}`;

}

function renderItem(item){

cartGrid.innerHTML += `

<div class="cart-card">

<img
loading="lazy"
decoding="async"
src="${optimizeImage(item.image,220)}"
alt="${item.productName}">

<div class="cart-info">

<h3>${item.productName}</h3>

<p>

${item.selectedColor.name}

|

Size ${item.selectedSize}

</p>

<h4>

₹${item.price}

</h4>

<div class="qty">

<button onclick="changeQty('${item.id}',-1)">−</button>

<span>${item.quantity}</span>

<button onclick="changeQty('${item.id}',1)">+</button>

</div>

<button
class="remove-btn"
onclick="removeCart('${item.id}')">

Remove

</button>

</div>

</div>

`;

}


window.changeQty = async (id, change) => {

    const user = auth.currentUser;

    if (!user) return;

    const ref = doc(db, "users", user.uid, "cart", id);

    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    let qty = snap.data().quantity + change;

    if (qty < 1) qty = 1;

    await updateDoc(ref, {
        quantity: qty
    });

    loadCart(user.uid);

};

window.removeCart=async(id)=>{

const user=auth.currentUser;

await deleteDoc(

doc(db,"users",user.uid,"cart",id)

);

loadCart(user.uid);

};

checkoutBtn.onclick = async () => {

const user = auth.currentUser;

if(!user){

location.href="login.html";

return;

}

const snap = await getDocs(

collection(db,"users",user.uid,"cart")

);

if(snap.empty){

alert("Your cart is empty.");

return;

}

location.href = "checkout.html";

};