import { db } from "../firebase/firebase-config.js";

import {

collection,
getDocs,
doc,
updateDoc

} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const table=document.getElementById("cartTable");

const snap=await getDocs(collection(db,"adminCart"));

snap.forEach(d=>{

const user=d.data();

table.innerHTML+=`

<tr>

<td>

${user.contacted ?

'🟢 Contacted'

:

'🟠 New'}

</td>

<td>

${user.userName}

</td>

<td>

${user.phone}

</td>

<td>

${user.email}

</td>

<td>

<button
onclick="viewCart('${user.userId}')">

View

</button>

<button
onclick="markDone('${user.userId}')">

✓

</button>

</td>

</tr>

`;

});

window.markDone=async(uid)=>{

await updateDoc(

doc(db,"adminCart",uid),

{

contacted:true,

status:"Contacted"

}

);

location.reload();

};

window.viewCart=async(uid)=>{

const grid=document.getElementById("cartDetails");

grid.innerHTML="";

const snap=await getDocs(

collection(db,"users",uid,"cart")

);

snap.forEach(doc=>{

const item=doc.data();

grid.innerHTML+=`

<div class="cart-item">

<img
src="${item.image}">

<div>

<h3>

${item.productName}

</h3>

<p>

${item.selectedColor.name}

|

${item.selectedSize}

</p>

<p>

Qty :

${item.quantity}

</p>

<h4>

₹${item.price}

</h4>

</div>

</div>

`;

});

};