import { loadOverview } from "./analytics/overview.js";
import { initCharts } from "./analytics/charts.js";

import{

loadProductsAnalytics

}

from"./analytics/products.js";

document.addEventListener("DOMContentLoaded",async()=>{

await loadOverview();

await initCharts();

await loadProductsAnalytics();

});