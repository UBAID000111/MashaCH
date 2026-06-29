import { auth, db } from "../firebase/firebase-config.js";

import {
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const btn = document.getElementById("savePhone");

let currentUser = null;

onAuthStateChanged(auth, (user) => {

    if (!user) {

        location.href = "login.html";

        return;

    }

    currentUser = user;

});

btn.onclick = async () => {

    const phone = document.getElementById("phone").value.trim();

    if (!/^[6-9]\d{9}$/.test(phone)) {

        alert("Enter valid mobile number");

        return;

    }

    try {

        await updateDoc(
            doc(db, "users", currentUser.uid),
            {
                phone: phone
            }
        );

        alert("Profile Updated Successfully");

        location.href = "profile.html";

    } catch (e) {

        console.error(e);

        alert(e.message);

    }

};