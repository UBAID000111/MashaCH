import { db } from "../firebase/firebase-config.js";

import {
doc,
getDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);

const orderId = params.get("id");

const printBtn = document.getElementById("printInvoice");

if(printBtn){

printBtn.onclick=()=>window.print();

}

if(!orderId){

alert("Invoice not found");

throw new Error("Missing Order ID");

}

loadInvoice();

async function loadInvoice(){

const snap=await getDoc(doc(db,"orders",orderId));

if(!snap.exists()){

alert("Order not found");

return;

}

const order=snap.data();

fillInvoice(order);

}

function fillInvoice(order){

document.getElementById("orderId").textContent=orderId;

document.getElementById("paymentMethod").textContent=
order.paymentMethod||"Razorpay";

document.getElementById("paymentType").textContent=
order.paymentMethod||"Razorpay";

document.getElementById("paymentStatusText").textContent=
order.paymentStatus||"-";

const orderStatus = order.status || "Pending";

document.getElementById("deliveryStatus").textContent = orderStatus;

updateOrderBadge(orderStatus);

document.getElementById("transactionId").textContent=
order.paymentId||"-";

document.getElementById("subtotal").textContent=
"₹"+(order.subtotal||0);

document.getElementById("shipping").textContent=
(order.shipping||0)==0
?"FREE"
:"₹"+order.shipping;

document.getElementById("grandTotal").textContent=
"₹"+(order.total||0);

document.getElementById("discount").textContent=
"₹0";

if(order.createdAt){

const d=order.createdAt.toDate();

document.getElementById("invoiceDate").textContent=
d.toLocaleDateString("en-IN");

document.getElementById("orderDate").textContent=
d.toLocaleDateString("en-IN");

const invoiceNumber=
"INV"+
d.getFullYear()+
String(d.getMonth()+1).padStart(2,"0")+
String(d.getDate()).padStart(2,"0")+
orderId.substring(0,5).toUpperCase();

document.getElementById("invoiceNo").textContent=
invoiceNumber;

}

document.getElementById("customerName").textContent=
order.address.fullName;

document.getElementById("customerPhone").textContent=
order.address.phone;

document.getElementById("customerEmail").textContent=
order.email;

document.getElementById("billingAddress").innerHTML=`

${order.address.house},

${order.address.area},

${order.address.landmark}<br>

${order.address.city},

${order.address.state}

${order.address.pincode},

${order.address.country}

`;

document.getElementById("shippingName").textContent=
order.address.fullName;

document.getElementById("shippingPhone").textContent=
order.address.phone;

document.getElementById("shippingAddress").innerHTML=
document.getElementById("billingAddress").innerHTML;

loadProducts(order.items);

}

function loadProducts(items){

const tbody=document.getElementById("invoiceItems");

tbody.innerHTML="";

items.forEach(item=>{

const total=
Number(item.price||0)*
Number(item.quantity||0);

tbody.innerHTML+=`

<tr>

<td>

<div class="product-cell">

<img
src="${item.image}"
alt="">

<div>

<b>

${item.productName}

</b>

<br>

<small>

${item.category||""}

</small>

</div>

</div>

</td>

<td>

${item.selectedSize||"-"}

</td>

<td>

<div
style="display:flex;
align-items:center;
gap:8px;">

<div

style="
width:18px;
height:18px;
border-radius:50%;
background:${item.selectedColor?.hex||"#000"};
border:1px solid #ddd;">

</div>

${item.selectedColor?.name||""}

</div>

</td>

<td>

${item.quantity}

</td>

<td>

₹${item.price}

</td>

<td>

₹${total}

</td>

</tr>

`;

});

}

/*==========================
STATUS BADGES
==========================*/

const paymentBadge=
document.getElementById("paymentBadge");

if(paymentBadge){

const status=
document.getElementById("paymentStatusText").textContent;

paymentBadge.textContent=status;

paymentBadge.className="badge";

if(status==="Paid"){

paymentBadge.classList.add("paid");

}else if(status==="Pending"){

paymentBadge.classList.add("pending");

}else{

paymentBadge.classList.add("failed");

}

}

function updateOrderBadge(status){

const badge = document.getElementById("statusBadge");

if(!badge) return;

badge.textContent = status;

badge.className = "badge";

switch(status){

case "Delivered":
badge.classList.add("delivered");
break;

case "Processing":
badge.classList.add("processing");
break;

case "Cancelled":
badge.classList.add("cancelled");
break;

case "Shipped":
badge.classList.add("shipped");
break;

case "Pending":
badge.classList.add("pending");
break;

default:
badge.classList.add("pending");

}

}

/*==========================
DOWNLOAD PDF
==========================*/

const downloadBtn=
document.getElementById("downloadPdf");

if(downloadBtn){

downloadBtn.onclick=()=>{

window.print();

};

}