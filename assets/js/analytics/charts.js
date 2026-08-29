import { db } from "../../firebase/firebase-config.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


let revenueChart = null;

let ordersChart = null;

let visitorChart = null;


/* =========================================
   INITIAL CHARTS
========================================= */

export async function initCharts() {

    await loadChartsForRange(
        getDateDaysAgo(29),
        getTodayKey()
    );

}


/* =========================================
   DATE HELPERS
========================================= */

function getTodayKey() {

    const d = new Date();

    return formatDate(d);

}


function getDateDaysAgo(days) {

    const d = new Date();

    d.setDate(
        d.getDate() - days
    );

    return formatDate(d);

}


function formatDate(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


/* =========================================
   LOAD CHARTS FOR SELECTED RANGE
========================================= */

export async function loadChartsForRange(
    start,
    end
) {

    const snap =
        await getDocs(
            collection(
                db,
                "analytics_daily"
            )
        );


    const rows = [];


    snap.forEach(docSnap => {

        const id =
            docSnap.id;

        if (
            id >= start &&
            id <= end
        ) {

            rows.push({

                date: id,

                data:
                    docSnap.data()

            });

        }

    });


    /* Sort dates */

    rows.sort(
        (a, b) =>
            a.date.localeCompare(
                b.date
            )
    );


    const labels = [];

    const revenue = [];

    const orders = [];

    const visitors = [];


    rows.forEach(row => {

        labels.push(
            row.date.substring(5)
        );


        revenue.push(
            Number(
                row.data.revenue || 0
            )
        );


        orders.push(
            Number(
                row.data.orders || 0
            )
        );


        visitors.push(
            Number(
                row.data.visitors || 0
            )
        );

    });


    createRevenueChart(
        labels,
        revenue
    );


    createOrdersChart(
        labels,
        orders
    );


    createVisitorsChart(
        labels,
        visitors
    );

}


/* =========================================
   REVENUE
========================================= */

function createRevenueChart(
    labels,
    data
) {

    const canvas =
        document.getElementById(
            "revenueChart"
        );

    if (!canvas) return;


    if (revenueChart) {

        revenueChart.destroy();

    }


    revenueChart =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels,

                    datasets: [{

                        label:
                            "Revenue",

                        data,

                        borderColor:
                            "#7b1632",

                        backgroundColor:
                            "rgba(123,22,50,.15)",

                        fill: true,

                        tension: .35,

                        borderWidth: 3

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            display: false

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true

                        }

                    }

                }

            }
        );

}


/* =========================================
   ORDERS
========================================= */

function createOrdersChart(
    labels,
    data
) {

    const canvas =
        document.getElementById(
            "ordersChart"
        );

    if (!canvas) return;


    if (ordersChart) {

        ordersChart.destroy();

    }


    ordersChart =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels,

                    datasets: [{

                        label:
                            "Orders",

                        data,

                        backgroundColor:
                            "#B09246",

                        borderRadius: 8

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            display: false

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true

                        }

                    }

                }

            }

        );

}


/* =========================================
   VISITORS
========================================= */

function createVisitorsChart(
    labels,
    data
) {

    const canvas =
        document.getElementById(
            "visitorChart"
        );

    if (!canvas) return;


    if (visitorChart) {

        visitorChart.destroy();

    }


    visitorChart =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels,

                    datasets: [{

                        label:
                            "Visitors",

                        data,

                        borderColor:
                            "#16a34a",

                        backgroundColor:
                            "rgba(22,163,74,.15)",

                        fill: true,

                        tension: .35,

                        borderWidth: 3

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            display: false

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true

                        }

                    }

                }

            }

        );

}