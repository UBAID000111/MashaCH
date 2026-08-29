import { loadOverview } from "./analytics/overview.js";
import { initCharts } from "./analytics/charts.js";
import { loadProductsAnalytics } from "./analytics/products.js";
import { loadCategoryAnalytics } from "./analytics/categories.js";
import { loadCustomerAnalytics } from "./analytics/customers.js";
import { loadTrafficAnalytics } from "./analytics/traffic.js";
import { loadLiveAnalytics } from "./analytics/live.js";


loadLiveAnalytics();

await loadTrafficAnalytics(
    
);

await loadOverview("today");

await initCharts();

await loadProductsAnalytics();



await loadCategoryAnalytics();

const filters =
  document.querySelectorAll(
    ".analytics-filter button"
  );


filters.forEach(button => {

  button.addEventListener("click", async () => {

    filters.forEach(btn =>
      btn.classList.remove("active")
    );

    button.classList.add("active");

    const filter =
      button.dataset.filter;

    await loadOverview(filter);

  });

});


// ==============================
// TAB SWITCHING
// ==============================

const buttons = document.querySelectorAll(".tab-btn");

const tabs = document.querySelectorAll(".tab-content");

buttons.forEach(button=>{

button.onclick=()=>{

buttons.forEach(btn=>
btn.classList.remove("active")
);

tabs.forEach(tab=>
tab.classList.remove("active")
);

button.classList.add("active");

document
.getElementById(button.dataset.tab+"Tab")
.classList.add("active");

};

});