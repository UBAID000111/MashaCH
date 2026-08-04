import { db } from "../../firebase/firebase-config.js";

import {
doc,
onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

export function loadLiveAnalytics(){

    const ref = doc(db,"analytics","overview");

    onSnapshot(ref,(snap)=>{

        if(!snap.exists()) return;

        const data = snap.data();

        document.getElementById("onlineVisitors").textContent =
            data.onlineVisitors || 0;

        document.getElementById("activeSessions").textContent =
            data.activeSessions || 0;

        document.getElementById("currentViews").textContent =
            data.currentViews || 0;

    });

}