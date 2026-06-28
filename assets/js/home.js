import {
loadCategories,
loadNewArrival,
loadBestSeller,
loadAllProducts
} from "./services/homeService.js";

async function initHome(){

await loadCategories();

await loadNewArrival();

await loadBestSeller();

await loadAllProducts();

}

initHome();