/* ==========================================
UNIVERSAL SLIDER
========================================== */

export function initSlider({

container,

prev,

next,

cardWidth = 270,

gap = 20

}){

if(!container) return;

let position = 0;

const move = cardWidth + gap;

function update(){

container.style.transform = `translateX(-${position}px)`;

container.style.transition = "transform .35s ease";

}

next?.addEventListener("click",()=>{

const max =

container.scrollWidth -

container.parentElement.offsetWidth;

position += move;

if(position > max){

position = 0;

}

update();

});

prev?.addEventListener("click",()=>{

position -= move;

if(position < 0){

position =

container.scrollWidth -

container.parentElement.offsetWidth;

}

update();

});

}