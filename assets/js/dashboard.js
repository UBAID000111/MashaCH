import { db } from "../firebase/firebase-config.js";

import {
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

async function loadDashboardStats(){

    const [

        productSnap,

        categorySnap,

        orderSnap,

        userSnap

    ] = await Promise.all([

        getDocs(collection(db,"products")),

        getDocs(collection(db,"categories")),

        getDocs(collection(db,"orders")),

        getDocs(collection(db,"users"))

    ]);

    document.getElementById("totalProducts").textContent =
    productSnap.size;

    document.getElementById("totalCategories").textContent =
    categorySnap.size;

    document.getElementById("totalOrders").textContent =
    orderSnap.size;

    document.getElementById("customers").textContent =
    userSnap.size;

    let revenue=0;

    let pending=0;

    let lowStock=0;

    let outStock=0;

    orderSnap.forEach(doc=>{

        const order=doc.data();

        if(order.paymentStatus==="Paid"){

            revenue += Number(order.total || 0);

        }

        if(order.status==="Pending"){

            pending++;

        }

    });

    productSnap.forEach(doc=>{

        const product=doc.data();

        (product.variants || []).forEach(v=>{

            const stock=Number(v.stock || 0);

            if(stock===0){

                outStock++;

            }

            else if(stock<=5){

                lowStock++;

            }

        });

    });

    document.getElementById("revenue").textContent =
    "₹"+revenue.toLocaleString("en-IN");

    document.getElementById("pendingOrders").textContent =
    pending;

    document.getElementById("lowStock").textContent =
    lowStock;

    document.getElementById("outStock").textContent =
    outStock;

}

loadDashboardStats();