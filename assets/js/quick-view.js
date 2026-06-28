import {
    quickView,
    closeQuickView
} from "./services/quickViewService.js";

/* ==========================================
GLOBAL
========================================== */

window.quickView = quickView;
window.closeQuickView = closeQuickView;

/* ==========================================
AUTO BIND
========================================== */

document.addEventListener("click",(e)=>{

const btn=e.target.closest(".quick-view-btn");

if(!btn) return;

e.preventDefault();

const productId=btn.dataset.id;

if(productId){

quickView(productId);

}

});

/* ==========================================
CLOSE ON OVERLAY
========================================== */

const modal=document.getElementById("quickViewModal");

if(modal){

modal.addEventListener("click",(e)=>{

if(e.target.classList.contains("quick-overlay")){

closeQuickView();

}

});

}

/* ==========================================
ESC CLOSE
========================================== */

document.addEventListener("keydown",(e)=>{

if(e.key==="Escape"){

closeQuickView();

}

});