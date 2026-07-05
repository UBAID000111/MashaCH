import { db } from "../../firebase/firebase-config.js";

import{
doc,
setDoc,
updateDoc,
getDoc,
increment,
serverTimestamp
}from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/*==========================
TODAY
==========================*/

function today(){

return new Date()

.toISOString()

.substring(0,10);

}

/*==========================
CREATE DAY
==========================*/

async function ensureDay(){

const ref=doc(

db,

"dailyAnalytics",

today()

);

const snap=await getDoc(ref);

if(snap.exists()) return ref;

await setDoc(ref,{

date:today(),

visitors:0,

views:0,

orders:0,

revenue:0,

wishlist:0,

cart:0,

createdAt:serverTimestamp()

});

return ref;

}

/*==========================
VISITOR
==========================*/

export async function trackVisitor(){

const ref=await ensureDay();

await updateDoc(ref,{

visitors:increment(1)

});

}

/*==========================
PRODUCT VIEW
==========================*/

export async function trackProductView(productId){

const ref=await ensureDay();

await updateDoc(ref,{

views:increment(1)

});

await updateDoc(

doc(db,"products",productId),

{

views:increment(1)

}

);

}

/*==========================
WISHLIST
==========================*/

export async function trackWishlist(productId){

const ref=await ensureDay();

await updateDoc(ref,{

wishlist:increment(1)

});

await updateDoc(

doc(db,"products",productId),

{

wishlist:increment(1)

}

);

}

/*==========================
ADD TO CART
==========================*/

export async function trackCart(productId){

const ref=await ensureDay();

await updateDoc(ref,{

cart:increment(1)

});

await updateDoc(

doc(db,"products",productId),

{

cartAdds:increment(1)

}

);

}

/*==========================
PURCHASE
==========================*/

export async function trackPurchase(

productId,

qty,

amount

){

const ref=await ensureDay();

await updateDoc(ref,{

orders:increment(qty),

revenue:increment(amount)

});

await updateDoc(

doc(db,"products",productId),

{

sold:increment(qty)

}

);

}