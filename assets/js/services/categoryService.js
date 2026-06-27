import { db } from "../../firebase/firebase-config.js";

import {
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const CACHE_KEY="mashach_categories";

const CACHE_TIME="mashach_categories_time";

const CACHE_DURATION=10*60*1000;

let memoryCategories=null;

export async function getCategories(){

// Memory

if(memoryCategories){

console.log("Categories → Memory");

return memoryCategories;

}

// Local

const cache=localStorage.getItem(CACHE_KEY);

const time=localStorage.getItem(CACHE_TIME);

if(

cache &&

time &&

Date.now()-Number(time)<CACHE_DURATION

){

console.log("Categories → Local Storage");

memoryCategories=JSON.parse(cache);

return memoryCategories;

}

// Firebase

console.log("Categories → Firebase");

const snapshot=await getDocs(collection(db,"categories"));

const categories=[];

snapshot.forEach(doc=>{

categories.push({

id:doc.id,

...doc.data()

});

});

memoryCategories=categories;

localStorage.setItem(

CACHE_KEY,

JSON.stringify(categories)

);

localStorage.setItem(

CACHE_TIME,

Date.now()

);

return categories;

}

export function clearCategoryCache(){

memoryCategories=null;

localStorage.removeItem(CACHE_KEY);

localStorage.removeItem(CACHE_TIME);

}