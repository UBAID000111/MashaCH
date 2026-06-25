import { auth, db } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");
const adminPanelBtn = document.getElementById("adminPanelBtn");

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    try {

        // User Information
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {

            const data = userSnap.data();

            userName.textContent = data.name;
            userEmail.textContent = data.email;

        } else {

            userName.textContent = "User";
            userEmail.textContent = user.email;

        }

        // Admin Check
        const adminRef = doc(db, "admins", user.uid);
        const adminSnap = await getDoc(adminRef);

        if (adminSnap.exists()) {

            const adminData = adminSnap.data();

            if (adminData.role === "admin" && adminData.active) {

                adminPanelBtn.style.display = "inline-block";

            }

        }

    } catch (error) {

        console.error(error);

    }

});

logoutBtn.addEventListener("click", async () => {

    await signOut(auth);

    window.location.href = "login.html";

});