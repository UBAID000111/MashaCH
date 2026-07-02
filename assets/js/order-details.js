import { auth, db } from "../firebase/firebase-config.js";

import {
doc,
getDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
optimizeImage
} from "./services/imageService.js";

const loading =
document.getElementById("loadingOrder");

const container =
document.getElementById("orderContainer");

const params =
new URLSearchParams(location.search);

const orderId =
params.get("id");

onAuthStateChanged(auth, async(user)=>{

if(!user){

location.href="login.html";

return;

}

if(!orderId){

container.innerHTML="<h2>Order not found.</h2>";

loading.style.display="none";

return;

}

await loadOrder();

});

async function loadOrder(){

try{

const snap = await getDoc(

doc(db,"orders",orderId)

);

loading.style.display="none";

if(!snap.exists()){

container.innerHTML="<h2>Order not found.</h2>";

return;

}

const order={

id:snap.id,

...snap.data()

};

container.innerHTML=createPage(order);

}catch(err){

console.log(err);

loading.style.display="none";

container.innerHTML="<h2>Unable to load order.</h2>";

}

}

function createPage(order){

const item=order.items?.[0] || {};

const image=item.image
? optimizeImage(item.image,700)
: "assets/images/no-image.png";

const date=order.createdAt?.toDate
? order.createdAt.toDate().toLocaleDateString("en-IN",{

day:"numeric",
month:"long",
year:"numeric"

})
:"-";

return`

<div class="order-card">

<div class="order-header">

<div>

<h2>

Order #${order.id.slice(0,10)}

</h2>

<p>

Placed on ${date}

</p>

</div>

<div class="order-status">

${order.status}

</div>

</div>

`;
}

