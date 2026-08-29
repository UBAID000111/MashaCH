import { loadOverview } from "./analytics/overview.js";
import {
    initCharts,
    loadChartsForRange
} from "./analytics/charts.js";

import { loadProductsAnalytics } from "./analytics/products.js";
import { loadCategoryAnalytics } from "./analytics/categories.js";
import { loadCustomerAnalytics } from "./analytics/customers.js";
import { loadTrafficAnalytics } from "./analytics/traffic.js";
import { loadLiveAnalytics } from "./analytics/live.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { db } from "../firebase/firebase-config.js";


/* =========================================
   INITIAL LOAD
========================================= */

await loadLiveAnalytics();

await loadTrafficAnalytics();

await loadOverview();

await loadProductsAnalytics();

await loadCategoryAnalytics();

await loadCustomerAnalytics();

await initCharts();


/* =========================================
   DATE HELPER
========================================= */

function dateKey(date) {

    const year = date.getFullYear();

    const month =
        String(date.getMonth() + 1).padStart(2, "0");

    const day =
        String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


/* =========================================
   GET DATE RANGE
========================================= */

function getDateRange(filter) {

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    let start = new Date(today);

    let end = new Date(today);


    if (filter === "today") {

        // Today only

    }

    else if (filter === "week") {

        // Last 7 days including today

        start.setDate(
            today.getDate() - 6
        );

    }

    else if (filter === "month") {

        // Current month

        start = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );

    }

    else if (filter === "year") {

        // Current year

        start = new Date(
            today.getFullYear(),
            0,
            1
        );

    }


    return {

        start: dateKey(start),

        end: dateKey(end)

    };

}


/* =========================================
   LOAD PERIOD DATA
========================================= */

async function loadPeriodData(filter) {

    const {

        start,
        end

    } = getDateRange(filter);


    console.log(
        `Analytics filter: ${filter}`,
        start,
        end
    );


    const snap = await getDocs(
        collection(
            db,
            "analytics_daily"
        )
    );


    let visitors = 0;

    let visits = 0;

    let views = 0;

    let orders = 0;

    let revenue = 0;

    let soldProducts = 0;


    snap.forEach(docSnap => {

        const id = docSnap.id;

        // Only selected date range

        if (id < start || id > end) {

            return;

        }


        const data = docSnap.data();


        visitors +=
            Number(data.visitors || 0);

        visits +=
            Number(data.visits || 0);

        views +=
            Number(data.views || 0);

        orders +=
            Number(data.orders || 0);

        revenue +=
            Number(data.revenue || 0);

        soldProducts +=
            Number(data.soldProducts || 0);

    });


    /* =====================================
       UPDATE TOP CARDS
    ===================================== */

    const totalVisitors =
        document.getElementById(
            "totalVisitors"
        );

    const totalVisits =
        document.getElementById(
            "totalVisits"
        );

    const totalViews =
        document.getElementById(
            "totalViews"
        );

    const totalOrders =
        document.getElementById(
            "totalOrders"
        );

    const totalRevenue =
        document.getElementById(
            "totalRevenue"
        );

    const soldProductsEl =
        document.getElementById(
            "soldProducts"
        );

    const conversionRate =
        document.getElementById(
            "conversionRate"
        );


    if (totalVisitors) {

        totalVisitors.textContent =
            visitors;

    }


    if (totalVisits) {

        totalVisits.textContent =
            visits;

    }


    if (totalViews) {

        totalViews.textContent =
            views;

    }


    if (totalOrders) {

        totalOrders.textContent =
            orders;

    }


    if (totalRevenue) {

        totalRevenue.textContent =
            "₹" +
            revenue.toLocaleString(
                "en-IN"
            );

    }


    if (soldProductsEl) {

        soldProductsEl.textContent =
            soldProducts;

    }


    /* =====================================
       CONVERSION
    ===================================== */

    if (conversionRate) {

        if (visitors > 0) {

            conversionRate.textContent =
                (
                    orders /
                    visitors *
                    100
                ).toFixed(1) + "%";

        }

        else {

            conversionRate.textContent =
                "0%";

        }

    }


    /* =====================================
       UPDATE CHARTS
    ===================================== */

    await loadChartsForRange(
        start,
        end
    );

}


/* =========================================
   FILTER BUTTONS
========================================= */

const filterButtons =
    document.querySelectorAll(
        ".analytics-filter button"
    );


filterButtons.forEach(button => {

    button.addEventListener(
        "click",
        async () => {

            /* Remove active */

            filterButtons.forEach(btn => {

                btn.classList.remove(
                    "active"
                );

            });


            /* Activate clicked */

            button.classList.add(
                "active"
            );


            const filter =
                button.dataset.filter;


            /* Load selected period */

            await loadPeriodData(
                filter
            );

        }
    );

});


/* =========================================
   DEFAULT = TODAY
========================================= */

await loadPeriodData("today");


/* =========================================
   TAB SWITCHING
========================================= */

const buttons =
    document.querySelectorAll(
        ".tab-btn"
    );

const tabs =
    document.querySelectorAll(
        ".tab-content"
    );


buttons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            buttons.forEach(btn =>
                btn.classList.remove(
                    "active"
                )
            );


            tabs.forEach(tab =>
                tab.classList.remove(
                    "active"
                )
            );


            button.classList.add(
                "active"
            );


            const target =
                document.getElementById(
                    button.dataset.tab +
                    "Tab"
                );


            if (target) {

                target.classList.add(
                    "active"
                );

            }

        }
    );

});