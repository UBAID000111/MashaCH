import { auth, db } from "../firebase/firebase-config.js";

import {
doc,
updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

document.getElementById("savePhone").onclick = async () => {

    const phone = document.getElementById("phone").value.trim();

    if (!/^[6-9]\d{9}$/.test(phone)) {

        alert("Enter a valid 10-digit mobile number.");

        return;

    }

    await updateDoc(
        doc(db, "users", auth.currentUser.uid),
        {
            phone
        }
    );

    window.location.href = "profile.html";

};