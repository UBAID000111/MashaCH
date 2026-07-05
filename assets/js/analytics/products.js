import { db } from "../../firebase/firebase-config.js";

import{
collection,
getDocs
}from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";



export async function loadProductsAnalytics(){

const table=document.getElementById("productAnalyticsTable");

if(!table) return;

table.innerHTML="";


let lowStock = 0;
 let outStock = 0;

let bestSeller = {
    name: "-",
    sold: 0
};

let highestRevenue = {
    name: "-",
    revenue: 0
};

let mostViewed = {
    name: "-",
    views: 0
};

let mostWishlisted = {
    name: "-",
    wishlist: 0
};

const products=await getDocs(

collection(db,"products")

);

const orders=await getDocs(

collection(db,"orders")

);

const revenueMap={};

const soldMap={};

orders.forEach(doc=>{

const order=doc.data();

(order.items||[]).forEach(item=>{

soldMap[item.productId]=

(soldMap[item.productId]||0)+

item.quantity;

revenueMap[item.productId]=

(revenueMap[item.productId]||0)+

(item.price*item.quantity);

});

});

products.forEach(doc=>{



const product=doc.data();

const id=doc.id;

let stock = 0;

(product.variants || []).forEach(variant => {

    stock += Number(variant.stock || 0);

});

const views=product.views||0;

const wishlist=product.wishlist||0;

if(views>mostViewed.views){

mostViewed.views=views;

mostViewed.name=product.name;

}

if(wishlist>mostWishlisted.wishlist){

mostWishlisted.wishlist=wishlist;

mostWishlisted.name=product.name;

}

const sold=soldMap[id]||0;

if(sold>bestSeller.sold){

bestSeller.sold=sold;

bestSeller.name=product.name;

}

const revenue=revenueMap[id]||0;

if(revenue>highestRevenue.revenue){

highestRevenue.revenue=revenue;

highestRevenue.name=product.name;

}

if(stock==0){

outStock++;

}

else if(stock<=5){

lowStock++;

}

const badge = stock == 0
? '<span class="badge danger">Out Of Stock</span>'
: stock <= 5
? '<span class="badge warning">Low Stock</span>'
: '<span class="badge success">In Stock</span>';

table.innerHTML+=`

<tr>

<td>

<img

src="${product.variants?.[0]?.image || ''}"

style="width:70px;height:70px;object-fit:cover;border-radius:12px;">

</td>

<td>

${product.name}

</td>

<td>
${product.views||0}

</td>

<td>

${product.wishlist||0}

</td>

<td>

${product.cartAdds||0}

</td>

<td>

${soldMap[id]||0}

</td>

<td>

₹${(revenueMap[id]||0).toLocaleString("en-IN")}

</td>

<td>

${stock}

</td>

<td>
${badge}
</td>



</tr>

`;

}


);

document.getElementById("bestSellerProduct").textContent=
bestSeller.name;

document.getElementById("highestRevenueProduct").textContent=
highestRevenue.name;

document.getElementById("mostViewedProduct").textContent=
mostViewed.name;

document.getElementById("mostWishlistedProduct").textContent=
mostWishlisted.name;

document.getElementById("lowStockProducts").textContent=
lowStock;

document.getElementById("outStockProducts").textContent=
outStock;



}