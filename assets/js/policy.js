/*==========================
FAQ ACCORDION
==========================*/

const faqs = document.querySelectorAll(".faq");

faqs.forEach(faq=>{

const btn = faq.querySelector(".faq-btn");

btn.addEventListener("click",()=>{

faqs.forEach(item=>{

if(item!==faq){

item.classList.remove("active");

}

});

faq.classList.toggle("active");

});

});

/*==========================
SCROLL ANIMATION
==========================*/

const observer = new IntersectionObserver(

(entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("show");

}

});

},

{

threshold:.15

}

);

document.querySelectorAll(

".policy-card,.warning-box,.timeline-section,.contact-card,.faq"

).forEach(el=>{

el.classList.add("hidden");

observer.observe(el);

});

/*==========================
SMOOTH SCROLL
==========================*/

document.querySelectorAll('a[href^="#"]').forEach(link=>{

link.addEventListener("click",function(e){

const target=document.querySelector(

this.getAttribute("href")

);

if(!target) return;

e.preventDefault();

target.scrollIntoView({

behavior:"smooth",

block:"start"

});

});

});

/*==========================
BACK TO TOP
==========================*/

const topBtn=document.createElement("button");

topBtn.className="top-btn";

topBtn.innerHTML='<i class="fa-solid fa-arrow-up"></i>';

document.body.appendChild(topBtn);

window.addEventListener("scroll",()=>{

if(window.scrollY>500){

topBtn.classList.add("show");

}else{

topBtn.classList.remove("show");

}

});

topBtn.onclick=()=>{

window.scrollTo({

top:0,

behavior:"smooth"

});

};