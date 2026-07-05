import { db } from "../../firebase/firebase-config.js";

import{
collection,
getDocs
}from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

export async function loadProductsAnalytics(){

const table=document.getElementById("productAnalyticsTable");

if(!table) return;

table.innerHTML="";

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

const variant=product.variants?.[0]||{};

const stock=variant.stock||0;

table.innerHTML+=`

<tr>

<td>

<img

src="${variant.image}"

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

${stock==0

?'<span class="danger">Out of Stock</span>'

:stock<=5

?'<span class="warning">Low Stock</span>'

:'<span class="success">In Stock</span>'}

</td>

</tr>

`;

});

}