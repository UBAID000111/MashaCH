import { db } from "../../firebase/firebase-config.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
    query,
    orderBy,
    limit,
    startAfter
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const CACHE_KEY = "mashach_products";
const CACHE_TIME = "mashach_products_time";
const CACHE_DURATION = 30 * 60 * 1000;

let memoryProducts = null;

/* ===========================
GET ALL PRODUCTS
=========================== */

export async function getProducts(){

    // Memory Cache
    if(memoryProducts){

        console.log("Products → Memory");

        return memoryProducts;

    }

    // Local Storage
    const cached = localStorage.getItem(CACHE_KEY);
    const time = localStorage.getItem(CACHE_TIME);

    if(
        cached &&
        time &&
        Date.now() - Number(time) < CACHE_DURATION
    ){

        console.log("Products → Local Storage");

        memoryProducts = JSON.parse(cached);

        return memoryProducts;

    }

    // Firebase
    console.log("Products → Firebase");

    const snapshot = await getDocs(collection(db,"products"));

    const products = [];

    snapshot.forEach(docSnap=>{

        products.push({

            id:docSnap.id,

            ...docSnap.data()

        });

    });

    memoryProducts = products;

    localStorage.setItem(
        CACHE_KEY,
        JSON.stringify(products)
    );

    localStorage.setItem(
        CACHE_TIME,
        Date.now()
    );

    return products;

}

/* ===========================
GET SINGLE PRODUCT
=========================== */

export async function getProduct(productId){

    const products = await getProducts();

    const product = products.find(p => p.id === productId);

    if(product){

        console.log("Product → Cache");

        return product;

    }

    console.log("Product → Firebase");

    const snap = await getDoc(
        doc(db,"products",productId)
    );

    if(!snap.exists()) return null;

    return {

        id:snap.id,

        ...snap.data()

    };

}


/* ===========================
GET NEW ARRIVALS
=========================== */

export async function getNewArrivals(days = 20){

    const products = await getProducts();

    const now = Date.now();

    return products.filter(product => {

        if(!product.createdAt) return false;

        let created;

        if(product.createdAt.seconds){

            created = product.createdAt.seconds * 1000;

        }else{

            created = new Date(product.createdAt).getTime();

        }

        return (now - created) <= (days * 24 * 60 * 60 * 1000);

    });

}


/* ===========================
BEST SELLER
=========================== */

export async function getBestSellers(limit = 10){

    const products = await getProducts();

return products
.filter(product => (product.sold || 0) > 0)
.sort((a,b)=>(b.sold || 0) - (a.sold || 0))
.slice(0,limit);

}

/* ===========================
FEATURED
=========================== */

export async function getFeaturedProducts(){

    const products = await getProducts();

    return products.filter(product => product.featured === true);

}

/* ===========================
CATEGORY
=========================== */

export async function getCategoryProducts(category){

    const products = await getProducts();

    return products.filter(product =>

        product.category === category

    );

}

/* ===========================
ACTIVE
=========================== */

export async function getActiveProducts(){

    const products = await getProducts();

  return products.filter(product =>

    (product.status || "Active") === "Active"

);

}



/* ===========================
CLEAR CACHE
=========================== */

export function clearProductCache(){

    memoryProducts = null;

    localStorage.removeItem(CACHE_KEY);

    localStorage.removeItem(CACHE_TIME);

}

/* ===========================
GET PRODUCTS PAGE
=========================== */

export async function getProductsPage(lastDoc = null, pageSize = 24){

    let q;

    if(lastDoc){

        q = query(

            collection(db,"products"),

            orderBy("createdAt","desc"),

            startAfter(lastDoc),

            limit(pageSize)

        );

    }else{

        q = query(

            collection(db,"products"),

            orderBy("createdAt","desc"),

            limit(pageSize)

        );

    }

    const snap = await getDocs(q);

    const products=[];

    snap.forEach(docSnap=>{

        products.push({

            id:docSnap.id,

            ...docSnap.data()

        });

    });

    return{

        products,

        lastDoc:snap.docs[snap.docs.length-1] || null,

        finished:snap.docs.length<pageSize

    };

}