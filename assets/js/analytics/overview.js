import { db } from "../../firebase/firebase-config.js";

import {
  collection,
  doc,
  getDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


function localDateKey(date = new Date()) {

  const year = date.getFullYear();

  const month =
    String(date.getMonth() + 1).padStart(2, "0");

  const day =
    String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;

}


function getStartDate(filter) {

  const date = new Date();

  if (filter === "week") {

    date.setDate(
      date.getDate() - 6
    );

  }

  else if (filter === "month") {

    date.setDate(
      date.getDate() - 29
    );

  }

  else if (filter === "year") {

    date.setDate(
      date.getDate() - 364
    );

  }

  return localDateKey(date);

}


export async function loadOverview(
  filter = "today"
) {

  const users =
    await getDocs(
      collection(db, "users")
    );

  const products =
    await getDocs(
      collection(db, "products")
    );

  const reviews =
    await getDocs(
      collection(db, "reviews")
    );

  const analyticsSnap =
    await getDoc(
      doc(db, "analytics", "overview")
    );

  const analytics =
    analyticsSnap.exists()
      ? analyticsSnap.data()
      : {};


  /* =================================
     DAILY ANALYTICS
  ================================= */

  const dailySnap =
    await getDocs(
      collection(db, "analytics_daily")
    );


  const startDate =
    getStartDate(filter);


  let periodVisitors = 0;
  let periodVisits = 0;
  let periodViews = 0;
  let periodOrders = 0;
  let periodRevenue = 0;


  dailySnap.forEach(dayDoc => {

    const date = dayDoc.id;

    if (date < startDate) return;

    const d = dayDoc.data();

    periodVisitors +=
      Number(d.visitors || 0);

    periodVisits +=
      Number(d.visits || 0);

    periodViews +=
      Number(d.views || 0);

    periodOrders +=
      Number(d.orders || 0);

    periodRevenue +=
      Number(d.revenue || 0);

  });


  /* =================================
     WISHLIST / CART
  ================================= */

  let wishlistItems = 0;
  let wishlistUsers = 0;

  let cartItems = 0;
  let cartUsers = 0;

  let totalStock = 0;
  let lowStock = 0;
  let outOfStock = 0;


  for (const user of users.docs) {

    const wishlist =
      await getDocs(
        collection(
          db,
          "users",
          user.id,
          "wishlist"
        )
      );

    wishlistItems += wishlist.size;

    if (wishlist.size > 0) {

      wishlistUsers++;

    }


    const cart =
      await getDocs(
        collection(
          db,
          "users",
          user.id,
          "cart"
        )
      );

    cartItems += cart.size;

    if (cart.size > 0) {

      cartUsers++;

    }

  }


  /* =================================
     STOCK
  ================================= */

  products.forEach(productDoc => {

    const product =
      productDoc.data();

    let stock = 0;


    (product.variants || [])
      .forEach(variant => {

        (variant.sizes || [])
          .forEach(size => {

            stock +=
              Number(size.stock || 0);

          });

      });


    totalStock += stock;


    if (stock === 0) {

      outOfStock++;

    }

    else if (stock <= 5) {

      lowStock++;

    }

  });


  /* =================================
     CARDS
  ================================= */

  document.getElementById(
  "totalVisitors"
).textContent =

    filter === "today" ||
    filter === "week" ||
    filter === "month" ||
    filter === "year"

      ? periodVisitors

      : analytics.totalVisitors || 0;


  document.getElementById(
  "totalVisits"
).textContent =

    filter === "today" ||
    filter === "week" ||
    filter === "month" ||
    filter === "year"

      ? periodVisits

      : analytics.totalVisits || 0;


  document.getElementById(
    "totalViews"
  ).textContent =

    filter === "today" ||
    filter === "week" ||
    filter === "month" ||
    filter === "year"

      ? periodViews

      : analytics.totalViews || 0;


  document.getElementById(
    "totalOrders"
  ).textContent =

    filter === "today" ||
    filter === "week" ||
    filter === "month" ||
    filter === "year"

      ? periodOrders

      : analytics.totalOrders || 0;


  document.getElementById(
    "totalRevenue"
  ).textContent =

    "₹" +

    Number(

      filter === "today" ||
      filter === "week" ||
      filter === "month" ||
      filter === "year"

        ? periodRevenue

        : analytics.totalRevenue || 0

    ).toLocaleString("en-IN");


  document.getElementById(
    "customerCount"
  ).textContent = users.size;


  document.getElementById(
    "wishlistCount"
  ).textContent = wishlistItems;


  document.getElementById(
    "wishlistUsers"
  ).textContent = wishlistUsers;


  document.getElementById(
    "cartCount"
  ).textContent = cartItems;


  document.getElementById(
    "cartLeads"
  ).textContent = cartUsers;


  document.getElementById(
    "soldProducts"
  ).textContent =
    analytics.soldProducts || 0;


  document.getElementById(
    "reviewCount"
  ).textContent =
    reviews.size;


  document.getElementById(
    "conversionRate"
  ).textContent =

    periodVisitors

      ? (

          periodOrders /
          periodVisitors *
          100

        ).toFixed(1) + "%"

      : "0%";


  document.getElementById(
    "totalProducts"
  ).textContent =
    products.size;


  document.getElementById(
    "totalStock"
  ).textContent =
    totalStock;


  document.getElementById(
    "lowStock"
  ).textContent =
    lowStock;


  document.getElementById(
    "outOfStock"
  ).textContent =
    outOfStock;

}