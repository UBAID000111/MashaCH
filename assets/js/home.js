import {
loadCategories,
loadNewArrival,
loadBestSeller,
loadAllProducts
} from "./services/homeService.js";

import {
trackVisitor
} from "./services/analyticsService.js";

async function initHome(){

await loadCategories();

await loadNewArrival();

await loadBestSeller();

await loadAllProducts();

trackVisitor();

}

initHome();

