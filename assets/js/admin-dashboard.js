const contentArea = document.getElementById("contentArea");
const pageTitle = document.getElementById("pageTitle");

const menus = document.querySelectorAll(".menu li");

function setActive(id){

    menus.forEach(item=>item.classList.remove("active"));

    document.getElementById(id).classList.add("active");

}

async function loadPage(title,file){

    pageTitle.innerText=title;

    const response=await fetch(file);

    contentArea.innerHTML=await response.text();

}

document.getElementById("dashboardBtn").onclick=()=>{

    setActive("dashboardBtn");

    loadPage("Dashboard","admin/dashboard.html");

};

document.getElementById("categoryBtn").onclick=()=>{

    setActive("categoryBtn");

    loadPage("Categories","admin/categories.html");

};

document.getElementById("productBtn").onclick=()=>{

    setActive("productBtn");

    loadPage("Products","admin/products.html");

};

document.getElementById("homepageBtn").onclick=()=>{

    setActive("homepageBtn");

    loadPage("Homepage","admin/homepage.html");

};

document.getElementById("ordersBtn").onclick=()=>{

    setActive("ordersBtn");

    loadPage("Orders","admin/orders.html");

};

document.getElementById("customerBtn").onclick=()=>{

    setActive("customerBtn");

    loadPage("Customers","admin/customers.html");

};

document.getElementById("couponBtn").onclick=()=>{

    setActive("couponBtn");

    loadPage("Coupons","admin/coupons.html");

};

document.getElementById("newsletterBtn").onclick=()=>{

    setActive("newsletterBtn");

    loadPage("Newsletter","admin/newsletter.html");

};

document.getElementById("settingBtn").onclick=()=>{

    setActive("settingBtn");

    loadPage("Settings","admin/settings.html");

};

loadPage("Dashboard","admin/dashboard.html");