import { db } from "../../firebase/firebase-config.js";

import {
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

export async function loadProductsAnalytics(){

const table = document.getElementById("productAnalyticsTable");

if(!table) return;

table.innerHTML = "";

let lowStock = 0;
let outStock = 0;

let bestSeller = {
    name:"-",
    sold:0
};

let highestRevenue = {
    name:"-",
    revenue:0
};

let mostViewed = {
    name:"-",
    views:0
};

let mostWishlisted = {
    name:"-",
    wishlist:0
};

const products = await getDocs(
collection(db,"products")
);

products.forEach(doc=>{

const product = doc.data();

const id = doc.id;

/* ===========================
TOTAL STOCK
=========================== */

let stock = 0;

(product.variants || []).forEach(variant=>{

    (variant.sizes || []).forEach(size=>{

        stock += Number(size.stock || 0);

    });

});

/* ===========================
PRODUCT ANALYTICS
=========================== */

const views = Number(product.views || 0);

const wishlist = Number(product.wishlist || 0);

const cartAdds = Number(product.cartAdds || 0);

const sold = Number(product.sold || 0);

const revenue = Number(product.revenue || 0);

/* ===========================
TOP PRODUCTS
=========================== */

if(views > mostViewed.views){

    mostViewed.views = views;

    mostViewed.name = product.name;

}

if(wishlist > mostWishlisted.wishlist){

    mostWishlisted.wishlist = wishlist;

    mostWishlisted.name = product.name;

}

if(sold > bestSeller.sold){

    bestSeller.sold = sold;

    bestSeller.name = product.name;

}

if(revenue > highestRevenue.revenue){

    highestRevenue.revenue = revenue;

    highestRevenue.name = product.name;

}

/* ===========================
STOCK
=========================== */

if(stock === 0){

    outStock++;

}
else if(stock <= 5){

    lowStock++;

}

/* ===========================
STATUS
=========================== */

const badge =

stock===0

?'<span class="badge danger">Out Of Stock</span>'

:stock<=5

?'<span class="badge warning">Low Stock</span>'

:'<span class="badge success">In Stock</span>';

/* ===========================
TABLE
=========================== */

table.innerHTML += `

<tr>

<td>

<img
src="${product.variants?.[0]?.image || ""}"
style="
width:70px;
height:70px;
object-fit:cover;
border-radius:12px;
">

</td>

<td>

${product.name}

</td>

<td>

${views}

</td>

<td>

${wishlist}

</td>

<td>

${cartAdds}

</td>

<td>

${sold}

</td>

<td>

₹${revenue.toLocaleString("en-IN")}

</td>

<td>

${stock}

</td>

<td>

${badge}

</td>

</tr>

`;

});

/* ===========================
TOP CARDS
=========================== */

document.getElementById("bestSellerProduct").textContent =
bestSeller.name;

document.getElementById("highestRevenueProduct").textContent =
highestRevenue.name;

document.getElementById("mostViewedProduct").textContent =
mostViewed.name;

document.getElementById("mostWishlistedProduct").textContent =
mostWishlisted.name;

document.getElementById("lowStockProducts").textContent =
lowStock;

document.getElementById("outStockProducts").textContent =
outStock;

}