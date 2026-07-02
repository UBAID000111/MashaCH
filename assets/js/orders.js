import { auth, db } from "../firebase/firebase-config.js";

import {
collection,
query,
where,
getDocs,
orderBy
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
optimizeImage
} from "./services/imageService.js";

/*=============================
DOM
=============================*/

const loading =
document.getElementById("ordersLoading");

const empty =
document.getElementById("emptyOrders");

const container =
document.getElementById("ordersContainer");

const search =
document.getElementById("searchOrder");

let allOrders=[];

/*=============================
AUTH
=============================*/

onAuthStateChanged(auth,async(user)=>{

if(!user){

location.href="login.html";

return;

}

await loadOrders(user.uid);

});

