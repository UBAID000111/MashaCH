import { db } from "../../firebase/firebase-config.js";

import {
doc,
setDoc,
updateDoc,
increment,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
/* ===================================
TODAY
=================================== */

function todayKey(){

    return new Date().toISOString().split("T")[0];

}

export async function startSession(){

    await setDoc(

        doc(db,"analytics","overview"),

        {

            onlineVisitors:increment(1),

            activeSessions:increment(1),

            updatedAt:serverTimestamp()

        },

        {merge:true}

    );

}

export async function endSession(){

    await setDoc(

        doc(db,"analytics","overview"),

        {

            onlineVisitors:increment(-1),

            activeSessions:increment(-1),

            updatedAt:serverTimestamp()

        },

        {merge:true}

    );

}

/* ===================================
VISITOR
=================================== */

export async function trackVisitor(){

    const today=todayKey();

    const overviewRef=
    doc(db,"analytics","overview");

    const dailyRef=
    doc(db,"analytics_daily",today);

    /* Every page load */

    await setDoc(overviewRef,{

        totalVisits:increment(1),

        updatedAt:serverTimestamp()

    },{merge:true});

    await setDoc(dailyRef,{

        visits:increment(1),

        updatedAt:serverTimestamp()

    },{merge:true});

    /* Unique visitor once/day */

    if(localStorage.getItem("masha_visit")==today){

        return;

    }

    localStorage.setItem("masha_visit",today);

    await setDoc(overviewRef,{

        totalVisitors:increment(1),

        updatedAt:serverTimestamp()

    },{merge:true});

    await setDoc(dailyRef,{

        visitors:increment(1),

        updatedAt:serverTimestamp()

    },{merge:true});

}

/* ===================================
PRODUCT VIEW
=================================== */

export async function trackProductView(productId){

    if(!productId) return;

    const key="view_"+productId;

    if(sessionStorage.getItem(key)){

        return;

    }

    sessionStorage.setItem(key,"1");

    await setDoc(

        doc(db,"products",productId),

        {

            views:increment(1)

        },

        {merge:true}

    );

    await setDoc(

        doc(db,"analytics_products",productId),

        {

            views:increment(1),

            updatedAt:serverTimestamp()

        },

        {merge:true}

    );

    await setDoc(

        doc(db,"analytics","overview"),

        {

            totalViews:increment(1),
            currentViews:increment(1),
            updatedAt:serverTimestamp()

        },

        {merge:true}

    );

    

}

/* ===================================
CATEGORY VIEW
=================================== */

export async function trackCategory(category){

    if(!category) return;

    await setDoc(

        doc(db,"analytics_categories",category),

        {

            views:increment(1),

            updatedAt:serverTimestamp()

        },

        {merge:true}

    );

}

/* ===================================
SEARCH
=================================== */

export async function trackSearch(keyword){

    keyword=keyword.trim().toLowerCase();

    if(keyword.length<2) return;

    await setDoc(

        doc(db,"analytics_search",keyword),

        {

            count:increment(1),

            updatedAt:serverTimestamp()

        },

        {merge:true}

    );

}

/* ===================================
DEVICE
=================================== */

export async function trackDevice(){

    const today=todayKey();

    const key="device_"+today;

    if(localStorage.getItem(key)){

        return;

    }

    localStorage.setItem(key,"1");

    let device="desktop";

    if(/Tablet|iPad/i.test(navigator.userAgent)){

        device="tablet";

    }
    else if(/Mobile/i.test(navigator.userAgent)){

        device="mobile";

    }

    await setDoc(

        doc(db,"analytics_devices","overview"),

        {

            [device]:increment(1),

            updatedAt:serverTimestamp()

        },

        {merge:true}

    );

}

/* ===================================
WISHLIST
=================================== */

export async function trackWishlist(productId){

    if(!productId) return;

    await setDoc(

        doc(db,"products",productId),

        {

            wishlist:increment(1)

        },

        {merge:true}

    );

    await setDoc(

        doc(db,"analytics","overview"),

        {

            wishlist:increment(1),
            updatedAt:serverTimestamp()

        },

        {merge:true}

    );

}

/* ===================================
ADD TO CART
=================================== */

export async function trackCart(productId){

    if(!productId) return;

    await setDoc(

        doc(db,"products",productId),

        {

            cartAdds:increment(1),
            updatedAt:serverTimestamp()

        },

        {merge:true}

    );

    await setDoc(

        doc(db,"analytics","overview"),

        {

            cartAdds:increment(1)

        },

        {merge:true}

    );

}

/* ===================================
PURCHASE
=================================== */

export async function trackPurchase(productId, qty, amount){

    if(!productId) return;

    // Product document
    await setDoc(

        doc(db,"products",productId),

        {

            sold:increment(qty),

            revenue:increment(amount)

        },

        {merge:true}

    );

    // Analytics product document
    await setDoc(

        doc(db,"analytics_products",productId),

        {

            sold:increment(qty),

            revenue:increment(amount),

            updatedAt:serverTimestamp()

        },

        {merge:true}

    );

    // Overview
    await setDoc(

        doc(db,"analytics","overview"),

        {

            totalRevenue:increment(amount),

            totalOrders:increment(1),

            soldProducts:increment(qty),

            updatedAt:serverTimestamp()

        },

        {merge:true}

    );

}