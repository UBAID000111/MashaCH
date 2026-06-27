import { db } from "../../firebase/firebase-config.js";

import {
    collection,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const CACHE_KEY = "mashach_products";
const CACHE_TIME = "mashach_products_time";
const CACHE_DURATION = 10 * 60 * 1000;

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
CLEAR CACHE
=========================== */

export function clearProductCache(){

    memoryProducts = null;

    localStorage.removeItem(CACHE_KEY);

    localStorage.removeItem(CACHE_TIME);

}