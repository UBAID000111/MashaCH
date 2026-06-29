import { auth } from "../firebase/firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";


import { showToast } from "./services/toastService.js";

// ===============================
// Admin Authentication
// ===============================

const ADMIN_EMAIL = "mashaweblink@gmail.com"; // Replace with your admin email

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "login.html";
        return;

    }

    if (user.email !== ADMIN_EMAIL) {

        showToast("Access Denied");

        window.location.href = "index.html";

        return;

    }

    startDashboard();

});
// ===============================
// Dashboard
// ===============================

function startDashboard() {

    const contentArea = document.getElementById("contentArea");
    const pageTitle = document.getElementById("pageTitle");

    const menus = document.querySelectorAll(".menu li");

    const menuBtn = document.getElementById("menuBtn");

    const sidebar = document.querySelector(".sidebar");

    const overlay = document.getElementById("overlay");

    // Mobile Menu

    menuBtn.onclick = () => {

        sidebar.classList.add("active");
        overlay.classList.add("active");

    };

    overlay.onclick = () => {

        sidebar.classList.remove("active");
        overlay.classList.remove("active");

    };

    function closeMenu() {

        sidebar.classList.remove("active");
        overlay.classList.remove("active");

    }

    function setActive(id) {

        menus.forEach(item => item.classList.remove("active"));

        document.getElementById(id).classList.add("active");

    }

async function loadPage(title, file) {

    pageTitle.innerText = title;

    const response = await fetch(file);

    contentArea.innerHTML = await response.text();

    switch(file){

        case "admin/products.html":
            await import("./products.js");
            break;

        case "admin/categories.html":
            await import("./categories.js");
            break;

        case "admin-media.html":
            await import("./media.js");
            break;

        case "admin-cart.html":
            await import("./admin-cart.js");
            break;

        case "admin/orders.html":
            await import("./orders.js");
            break;

        case "admin/customers.html":
            await import("./customers.js");
            break;

        case "admin/coupons.html":
            await import("./coupons.js");
            break;

        case "admin/homepage.html":
            await import("./homepage.js");
            break;

        case "admin/newsletter.html":
            await import("./newsletter.js");
            break;

    }

}

    // Dashboard

    document.getElementById("dashboardBtn").onclick = () => {

        closeMenu();

        setActive("dashboardBtn");

        loadPage("Dashboard", "admin/dashboard.html");

    };

    // Categories

    document.getElementById("categoryBtn").onclick = () => {

        closeMenu();

        setActive("categoryBtn");

        loadPage("Categories", "admin/categories.html");

    };

    // Products

    document.getElementById("productBtn").onclick = () => {

        closeMenu();

        setActive("productBtn");

        loadPage("Products", "admin/products.html");

    };

    // Homepage

    document.getElementById("homepageBtn").onclick = () => {

        closeMenu();

        setActive("homepageBtn");

        loadPage("Homepage", "admin/homepage.html");

    };

    // Orders

    document.getElementById("ordersBtn").onclick = () => {

        closeMenu();

        setActive("ordersBtn");

        loadPage("Orders", "admin/orders.html");

    };

    // Media

    document.getElementById("mediaBtn").onclick = () => {

    closeMenu();

    setActive("mediaBtn");

    loadPage("Media Manager", "admin/media.html");

};

  // Lead Cart

  document.getElementById("cartLeadBtn").onclick = () => {

    closeMenu();

    setActive("cartLeadBtn");

    loadPage("Cart Leads", "admin/cart-leads.html");

};

    // Customers

    document.getElementById("customerBtn").onclick = () => {

        closeMenu();

        setActive("customerBtn");

        loadPage("Customers", "admin/customers.html");

    };

    // Coupons

    document.getElementById("couponBtn").onclick = () => {

        closeMenu();

        setActive("couponBtn");

        loadPage("Coupons", "admin/coupons.html");

    };

    // Newsletter

    document.getElementById("newsletterBtn").onclick = () => {

        closeMenu();

        setActive("newsletterBtn");

        loadPage("Newsletter", "admin/newsletter.html");

    };

    // Settings

    document.getElementById("settingBtn").onclick = () => {

        closeMenu();

        setActive("settingBtn");

        loadPage("Settings", "admin/settings.html");

    };

    //logout
    document.getElementById("logoutBtn").onclick = () => {
        window.location.href = "login.html";
    }

    // Default Page

    loadPage("Dashboard", "admin/dashboard.html");

}