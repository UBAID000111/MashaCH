import { getProducts } from "./services/productService.js";
import { optimizeImage } from "./services/imageService.js";

/* ==========================================
DOM
========================================== */

const stepNo = document.getElementById("stepNo");
const progressFill = document.getElementById("progressFill");

const questionTitle = document.getElementById("questionTitle");
const questionSubtitle = document.getElementById("questionSubtitle");
const questionArea = document.getElementById("questionArea");

const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");

const skipBtn = document.getElementById("skipBtn");

const loadingScreen = document.getElementById("loadingScreen");
const resultsSection = document.getElementById("resultsSection");

const params=new URLSearchParams(location.search);

const mode=params.get("mode");

const query=params.get("q");

if(mode==="ai"){

    document.querySelector(".finder-section").style.display="none";

    loadingScreen.style.display="flex";

    setTimeout(()=>{

        loadingScreen.style.display="none";

        resultsSection.style.display="block";

        searchByText(query);

    },1800);

}

function searchByText(text){

    text = text.toLowerCase().trim();

    const matched = [];

    allProducts.forEach(product=>{

        let score = 0;

        let reasons = [];

        const name =
        (product.name || "").toLowerCase();

        const category =
        (product.category || "").toLowerCase();

        const description =
        (product.description || "").toLowerCase();

        let bestVariant = product.variants[0];

        /* ------------------------
        COLOR
        ------------------------ */

        product.variants.forEach(variant=>{

            const color =
            variant.color.name.toLowerCase();

            if(text.includes(color)){

                score += 35;

                reasons.push(color+" colour");

                bestVariant = variant;

            }

        });

        /* ------------------------
        OCCASION
        ------------------------ */

        const occasionKeywords={

            wedding:[
                "pakistani collection",
                "festive collection",
                "wedding",
                "bridal"
            ],

            festival:[
                "festive collection",
                "summer collection",
                "festival",
                "traditional"
            ],

            eid:[
                "pakistani collection",
                "eid"
            ],

            party:[
                "party",
                "co ord sets",
                "summer collection"
            ],

            office:[
                "office",
                "casual collection",
                "formal"
            ],

            casual:[
                "casual collection",
                "summer collection"
            ],

            travel:[
                "casual collection",
                "summer collection"
            ]

        };

        Object.keys(occasionKeywords).forEach(key=>{

            if(text.includes(key)){

                occasionKeywords[key].forEach(word=>{

                    if(

                        category.includes(word) ||

                        description.includes(word) ||

                        name.includes(word)

                    ){

                        score += 30;

                        reasons.push(key);

                    }

                });

            }

        });

        /* ------------------------
        SIZE
        ------------------------ */

        ["S","M","L","XL","XXL"].forEach(size=>{

            if(text.includes(size.toLowerCase())){

                const hasSize=

                bestVariant.sizes.some(s=>

                    s.name===size &&

                    s.stock>0

                );

                if(hasSize){

                    score+=20;

                    reasons.push(size);

                }

            }

        });

        /* ------------------------
        PRICE
        ------------------------ */

        const price = Number(bestVariant.price);

        const budget=text.match(/\d+/);

        if(budget){

            const value=Number(budget[0]);

            if(price<=value){

                score+=15;

                reasons.push("Within Budget");

            }

        }

        /* ------------------------
        PRODUCT NAME
        ------------------------ */

        text.split(" ").forEach(word=>{

            if(word.length<3) return;

            if(

                name.includes(word) ||

                description.includes(word)

            ){

                score+=5;

            }

        });

        /* ------------------------
        ONLY SHOW MATCHES
        ------------------------ */

        if(score>=30){

            matched.push({

                product,

                variant:bestVariant,

                score:Math.min(score,100),

                reasons:[...new Set(reasons)]

            });

        }

    });

    matched.sort((a,b)=>b.score-a.score);

    renderResults(matched);

    loadRecommended();

    loadTrending();

}

let allProducts = [];

/* ==========================================
LOAD PRODUCTS
========================================== */

(async()=>{

    allProducts = await getProducts();

})();

/* ==========================================
QUESTIONS
========================================== */

const questions=[

{

title:"What's the occasion?",

subtitle:"Choose one option",

type:"single",

key:"occasion",

options:[

"Casual",

"Office",

"Party",

"Wedding",

"Festival",

"Daily Wear",

"Travel",

"Family Function",

"Eid",

"Reception",

"Engagement",

"Mehendi"

]

},

{

title:"Choose your budget",

subtitle:"Select one",

type:"multiple",

key:"budget",

options:[

"0-999",

"1000-1999",

"2000-2999",

"3000+"

]

},

{

title:"Favourite Colours",

subtitle:"Select one or more colours",

type:"multiple",

key:"colors",

options:[

"Black",

"White",

"Blue",

"Green",

"Olive",

"Pink",

"Purple",

"Maroon",

"Red",

"Beige",

"Yellow"

]

},

{

title:"Select your Size",

subtitle:"Choose one",

type:"single",

key:"size",

options:[

"Free Size",


"S",

"M",

"L",

"XL",

"XXL"

]

}

];

/* ==========================================
STATE
========================================== */

let currentStep = 0;

const answers = {

occasion:null,

budget:[],

colors:[],

size:null

};

/* ==========================================
RENDER
========================================== */

renderStep();

function renderStep(){

const step = questions[currentStep];

stepNo.textContent = currentStep+1;

progressFill.style.width=

((currentStep+1)/questions.length)*100+"%";

questionTitle.textContent = step.title;

questionSubtitle.textContent = step.subtitle;

questionArea.innerHTML="";

const wrapper=document.createElement("div");

wrapper.className="options question-enter";

step.options.forEach(option=>{

const card=document.createElement("div");

card.className="option";

card.innerHTML=`<span>${option}</span>`;

const value=answers[step.key];

if(step.type==="single"){

if(value===option){

card.classList.add("active");

}

}

else{

if(value.includes(option)){

card.classList.add("active");

}

}

card.onclick = () => {

    /* SINGLE SELECT */

    if(step.type==="single"){

        wrapper.querySelectorAll(".option")
        .forEach(c=>c.classList.remove("active"));

        card.classList.add("active");

        answers[step.key]=option;

        return;

    }

    /* MULTIPLE BUDGET */

    if(step.key==="budget"){

        card.classList.toggle("active");

        if(card.classList.contains("active")){

            answers.budget.push(option);

        }else{

            answers.budget =
            answers.budget.filter(b=>b!==option);

        }

        return;

    }

    /* MULTIPLE COLORS */

    if(step.key==="colors"){

        card.classList.toggle("active");

        if(card.classList.contains("active")){

            answers.colors.push(option);

        }else{

            answers.colors =
            answers.colors.filter(c=>c!==option);

        }

    }

};

wrapper.appendChild(card);

});

questionArea.appendChild(wrapper);

backBtn.style.visibility=

currentStep===0

?

"hidden"

:

"visible";

nextBtn.innerHTML=

currentStep===questions.length-1

?

"Find My Outfit ✨"

:

"Next →";

}

/* ==========================================
NEXT
========================================== */

nextBtn.onclick=()=>{

const step=questions[currentStep];




if(currentStep<questions.length-1){

currentStep++;

renderStep();

return;

}

/* Finished */

startFinding();

};

/* ==========================================
BACK
========================================== */

backBtn.onclick=()=>{

if(currentStep===0)

return;

currentStep--;

renderStep();

};

/* ==========================================
LOADING
========================================== */

function startFinding(){

    document.querySelector(".finder-section").style.display = "none";

    loadingScreen.style.display = "flex";

    setTimeout(()=>{

        loadingScreen.style.display = "none";

        resultsSection.style.display = "block";

        findProducts();

    },2200);

}

/* ==========================================
OCCASION → FIRESTORE CATEGORY
========================================== */

const occasionMap = {

    "Wedding":[
        "Pakistani Collection",
        "Festive Collection"
    ],

    "Reception":[
        "Pakistani Collection",
        "Festive Collection"
    ],

    "Engagement":[
        "Pakistani Collection",
        "Festive Collection"
    ],

    "Mehendi":[
        "Pakistani Collection",
        "Festive Collection"
    ],

    "Festival":[
        "Pakistani Collection",
        "Festive Collection",
        "Summer Collection"
    ],

    "Eid":[
        "Pakistani Collection"
    ],

    "Party":[
        "Summer Collection",
        "Co Ord Sets",
        "Festive Collection"
    ],

    "Office":[
        "Casual Collection",
        "Co Ord Sets"
    ],

    "Daily Wear":[
        "Casual Collection",
        "Night Wear",
        "Summer Collection"
    ],

    "Travel":[
        "Casual Collection",
        "Co Ord Sets",
        "Summer Collection"
    ],

    "Family Function":[
        "Pakistani Collection",
        "Summer Collection",
        "Festive Collection"
    ],

    "Casual":[
        "Casual Collection",
        "Summer Collection"
    ]

};

function loadTrending(){

    const grid = document.getElementById("trendingGrid");

    grid.innerHTML = "";

    const shuffled = [...allProducts]
        .filter(product => (product.status || "Active") === "Active")
        .sort(() => Math.random() - 0.5)
        .slice(0,8);

    shuffled.forEach(product => {

        grid.innerHTML += createCard({

            product,

            variant: product.variants[0],

            score: Math.floor(Math.random() * 8) + 90,

            reasons: ["Trending This Week"]

        });

    });

}


function loadRecommended(){

const recommended=

allProducts.filter(product=>

product.variants.some(variant=>

variant.sizes.some(size=>

size.name===answers.size &&

size.stock>0

)

)

);

const grid=document.getElementById("recommendedGrid");

grid.innerHTML="";

recommended.slice(0,8).forEach(product=>{

grid.innerHTML+=createCard({

product,

variant:product.variants[0],

score:88,

reasons:["Available in your size"]

});

});

}


/* ==========================================
FIND PRODUCTS
========================================== */

function findProducts(){
let products = [...allProducts];
    
console.log("All Products:", allProducts.length);

if(answers.occasion){
const categories =

occasionMap[answers.occasion] || [];

console.log("Mapped Categories:", categories);

products = products.filter(product =>

    categories.includes(product.category)

);
}




/* Active */


if(answers.budget.length){

products = products.filter(product=>{

const price=Number(product.variants[0].price);

return answers.budget.some(range=>{

switch(range){

case "0-999":
return price<=999;

case "1000-1999":
return price>=1000 && price<=1999;

case "2000-2999":
return price>=2000 && price<=2999;

case "3000+":
return price>=3000;

default:
return true;

}

});

});

}

console.log("After Active:", products.length);

/* Category */



console.log("After Category:", products.length);

console.log("After Category:", products.length);

/* Budget */



/* Match */

const matched=[];

products.forEach(product=>{

const result=

calculateMatch(product);

if(result.score>0){

matched.push(result);

}

});

matched.sort(

(a,b)=>b.score-a.score

);

renderResults(matched);


loadRecommended();

loadTrending();

}


/* ==========================================
MATCH SCORE
========================================== */

function calculateMatch(product){

let score=0;

let reasons=[];

let bestVariant=null;

product.variants.forEach(variant=>{

let variantScore=0;

let why=[];

/* Color */

if(

answers.colors.length===0 || 
answers.colors.includes(variant.color.name)
){

variantScore+=25;

why.push("Matches your favourite colour"

);
}

/* Size */

let hasSize=true;

if(answers.size){

hasSize=

variant.sizes.some(size=>

size.name===answers.size &&
size.stock>0

);

}

if(hasSize){

variantScore+=20;

why.push(

"Available in your size"

);

}

/* Budget */

variantScore+=15;

why.push(

"Within your budget"

);

/* Category */

variantScore+=40;

why.push(

"Perfect for your occasion"

);

if(

!bestVariant ||

variantScore>score

){

score=variantScore;

bestVariant=variant;

reasons=why;

}

});

return{

product,

variant:bestVariant,

score,

reasons

};

}

/* ==========================================
RESULTS
========================================== */

function renderResults(list){

const grid=

document.getElementById(

"productsGrid"

);

grid.innerHTML="";

/* Selected Chips */

document.getElementById(

"selectedFilters"

).innerHTML=

`

<span>${answers.occasion}</span>

<span>${answers.budget}</span>

<span>${answers.size}</span>

${answers.colors.map(color=>

`<span>${color}</span>`

).join("")}

`;

if(list.length===0){

showFallback();

return;

}

document.getElementById(

"noResults"

).style.display="none";

list.forEach(item=>{

grid.innerHTML+=createCard(item);

});

}

function createCard(item){

const product=item.product;

const variant=item.variant;

return`

<div class="result-card fade-in">

<div class="result-image">

<div class="match-badge">

${item.score}% Match

</div>

<img

src="${optimizeImage(

variant.image,

600

)}">

</div>

<div class="result-content">

<div class="result-category">

${product.category}

</div>

<div class="result-title">

${product.name}

</div>

<div class="result-price">

<h3>

₹${variant.price}

</h3>

<del>

₹${variant.oldPrice}

</del>

</div>

<div class="result-reasons">

${item.reasons.map(reason=>

`

<div class="reason">

✔ ${reason}

</div>

`

).join("")}

</div>

<button

class="result-btn"

onclick="location.href='product.html?id=${product.id}'">

View Product

</button>

</div>

</div>

`;

}

/* ==========================================
NO RESULT
========================================== */

function showFallback(){

document.getElementById(

"noResults"

).style.display="block";

const recommended=

allProducts

.filter(product=>

product.variants.some(variant=>

variant.sizes.some(size=>

size.name===answers.size &&

size.stock>0

)

)

)

.slice(0,8);

const grid=

document.getElementById(

"recommendedGrid"

);

grid.innerHTML="";

recommended.forEach(product=>{

grid.innerHTML+=createCard({

product,

variant:product.variants[0],

score:82,

reasons:[

"Available in your size"

]

});

});

}

//SKipBtn

skipBtn.onclick=()=>{
    const step=questions[currentStep];

    if(step.type==="single"){
       answers[step.key]=null;
    }else{
        answers[step.key]=[];
}
if(currentStep<questions.length-1){

    currentStep++;
    renderStep();
}else{
    startFinding();
}
};
