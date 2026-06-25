// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

const firebaseConfig = {

    apiKey: "AIzaSyC8R4_HTFbXATzv-OSclhVvJKdZfgB7JMk",

    authDomain: "mashaclothinghub.firebaseapp.com",

    projectId: "mashaclothinghub",

    storageBucket: "mashaclothinghub.firebasestorage.app",

    messagingSenderId: "737318582340",

    appId: "1:737318582340:web:657b3328b86089fa4f2411"

};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

export const storage = getStorage(app);