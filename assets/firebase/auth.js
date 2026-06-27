import { auth, db } from "./firebase-config.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import { showToast } from "../js/services/toastService.js";

import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* ---------- SIGNUP ---------- */

const signupForm = document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const name = document.getElementById("signupName").value.trim();
const email = document.getElementById("signupEmail").value.trim();

const phone = document.getElementById("signupPhone").value.trim();

const password = document.getElementById("signupPassword").value;
        const confirm = document.getElementById("confirmPassword").value;

        if (password !== confirm) {
            showToast("Passwords do not match");
            return;
        }

        if(!/^[6-9]\d{9}$/.test(phone)){

showToast("Enter a valid 10-digit mobile number.");

return;

}

        try {

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

           await setDoc(
doc(db,"users",userCredential.user.uid),
{
name,
email,
phone,
createdAt:serverTimestamp()
}
);

            showToast("Account Created Successfully!");

            window.location.href = "profile.html";

        } catch (error) {

            showToast(error.message);

        }

    });

}

/* ---------- LOGIN ---------- */

const loginForm = document.getElementById("loginForm");

const ADMIN_EMAIL = "mashaweblink@gmail.com"; // Replace with your admin email

if (loginForm) {

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        try {

            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            showToast("Login Successful");

            // Admin Login
            if (userCredential.user.email === ADMIN_EMAIL) {

                window.location.href = "admin-dashboard.html";

            } else {

                window.location.href = "profile.html";

            }

        } catch (error) {

            showToast(error.message);

        }

    });

}

/* ---------- GOOGLE LOGIN ---------- */

const provider = new GoogleAuthProvider();

const googleLogin =
    document.getElementById("googleLogin");

const googleSignup =
    document.getElementById("googleSignup");

async function googleAuth() {

    try {

        const result =
            await signInWithPopup(auth, provider);

        const ref =
            doc(db, "users", result.user.uid);

        const snap =
            await getDoc(ref);

        if (!snap.exists()) {

         await setDoc(ref,{
name: result.user.displayName,
email: result.user.email,
phone: "",
createdAt: serverTimestamp()
});

        }

        const ADMIN_EMAIL = "mashaweblink@gmail.com";

if (result.user.email === ADMIN_EMAIL) {

    window.location.href = "admin-dashboard.html";

} else {

    window.location.href = "profile.html";

}

    } catch (error) {

        showToast(error.message);

    }

}

if (googleLogin)
    googleLogin.addEventListener("click", googleAuth);

if (googleSignup)
    googleSignup.addEventListener("click", googleAuth);

/* ---------- FORGOT PASSWORD ---------- */

const forgot =
    document.getElementById("forgotPassword");

if (forgot) {

    forgot.addEventListener("click", async (e) => {

        e.preventDefault();

        const email =
            document.getElementById("loginEmail").value.trim();

        if (!email) {

            showToast("Enter your email first.");

            return;

        }

        try {

            await sendPasswordResetEmail(auth, email);

            showToast("Password reset email sent.");

        } catch (error) {

            showToast(error.message);

        }

    });

}

/* ---------- AUTO LOGIN ---------- */

onAuthStateChanged(auth, (user) => {

    if (user) {

        console.log("Logged in:", user.email);

    }

});

/* ---------- LOGOUT ---------- */

window.logout = async function () {

    await signOut(auth);

    window.location.href = "login.html";

};