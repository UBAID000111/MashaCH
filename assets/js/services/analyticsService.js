import { db } from "../../firebase/firebase-config.js";

import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  increment,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


/* ===================================
   DATE HELPERS
=================================== */

function todayKey() {

  const d = new Date();

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;

}


/* ===================================
   UNIQUE VISITOR ID
=================================== */

function getVisitorId() {

  let visitorId =
    localStorage.getItem("masha_visitor_id");

  if (!visitorId) {

    visitorId = crypto.randomUUID();

    localStorage.setItem(
      "masha_visitor_id",
      visitorId
    );

  }

  return visitorId;

}


/* ===================================
   SESSION ID
=================================== */

function getVisitId() {

  let visitId =
    sessionStorage.getItem("masha_visit_id");

  if (!visitId) {

    visitId = crypto.randomUUID();

    sessionStorage.setItem(
      "masha_visit_id",
      visitId
    );

  }

  return visitId;

}


/* ===================================
   START SESSION
=================================== */

export async function startSession() {

  const visitId = getVisitId();

  const sessionRef =
    doc(db, "analytics_sessions", visitId);

  const snap = await getDoc(sessionRef);

  // Already recorded this browsing session
  if (snap.exists()) return;

  const visitorId = getVisitorId();
  const today = todayKey();

  await setDoc(sessionRef, {

    visitorId,

    startedAt: serverTimestamp(),

    date: today

  });

  const overviewRef =
    doc(db, "analytics", "overview");

  const dailyRef =
    doc(db, "analytics_daily", today);

  await setDoc(

    overviewRef,

    {

      totalVisits: increment(1),

      updatedAt: serverTimestamp()

    },

    { merge: true }

  );

  await setDoc(

    dailyRef,

    {

      visits: increment(1),

      updatedAt: serverTimestamp()

    },

    { merge: true }

  );

}


/* ===================================
   END SESSION

   Historical sessions are NOT reduced
   when user leaves.

   Live sessions are handled by
   liveService.js.
=================================== */

export async function endSession() {

  // Intentionally empty.

}


/* ===================================
   UNIQUE VISITOR
=================================== */

export async function trackVisitor() {

  const visitorId = getVisitorId();

  const today = todayKey();

  const visitorRef =
    doc(db, "analytics_visitors", visitorId);

  const visitorSnap =
    await getDoc(visitorRef);

  const overviewRef =
    doc(db, "analytics", "overview");

  const dailyRef =
    doc(db, "analytics_daily", today);


  /* =================================
     FIRST EVER VISIT
  ================================= */

  if (!visitorSnap.exists()) {

    await setDoc(

      visitorRef,

      {

        firstVisit: serverTimestamp(),

        lastVisit: serverTimestamp(),

        lastVisitDate: today

      }

    );

    await setDoc(

      overviewRef,

      {

        totalVisitors: increment(1),

        updatedAt: serverTimestamp()

      },

      { merge: true }

    );

  }

  /* =================================
     EXISTING VISITOR
  ================================= */

  else {

    await updateDoc(

      visitorRef,

      {

        lastVisit: serverTimestamp(),

        lastVisitDate: today

      }

    );

  }


  /* =================================
     DAILY UNIQUE VISITOR
     
     Same visitor can count once
     per day for daily statistics.
  ================================= */

  const dailyVisitorRef = doc(

    db,

    "analytics_daily_visitors",

    `${today}_${visitorId}`

  );

  const dailyVisitorSnap =
    await getDoc(dailyVisitorRef);

  if (!dailyVisitorSnap.exists()) {

    await setDoc(

      dailyVisitorRef,

      {

        visitorId,

        date: today

      }

    );

    await setDoc(

      dailyRef,

      {

        visitors: increment(1),

        updatedAt: serverTimestamp()

      },

      { merge: true }

    );

  }

}


/* ===================================
   PRODUCT VIEW
=================================== */

export async function trackProductView(productId) {

  if (!productId) return;

  const key = "view_" + productId;

  if (sessionStorage.getItem(key)) {

    return;

  }

  sessionStorage.setItem(key, "1");

  const today = todayKey();


  await setDoc(

    doc(db, "products", productId),

    {

      views: increment(1)

    },

    { merge: true }

  );


  await setDoc(

    doc(db, "analytics_products", productId),

    {

      views: increment(1),

      updatedAt: serverTimestamp()

    },

    { merge: true }

  );


  await setDoc(

    doc(db, "analytics", "overview"),

    {

      totalViews: increment(1),

      updatedAt: serverTimestamp()

    },

    { merge: true }

  );


  /* DAILY VIEWS */

  await setDoc(

    doc(db, "analytics_daily", today),

    {

      views: increment(1),

      updatedAt: serverTimestamp()

    },

    { merge: true }

  );

}


/* ===================================
   CATEGORY
=================================== */

export async function trackCategory(category) {

  if (!category) return;

  await setDoc(

    doc(db, "analytics_categories", category),

    {

      views: increment(1),

      updatedAt: serverTimestamp()

    },

    { merge: true }

  );

}


/* ===================================
   SEARCH
=================================== */

export async function trackSearch(keyword) {

  keyword =
    keyword.trim().toLowerCase();

  if (keyword.length < 2) return;

  await setDoc(

    doc(db, "analytics_search", keyword),

    {

      count: increment(1),

      updatedAt: serverTimestamp()

    },

    { merge: true }

  );

}


/* ===================================
   DEVICE
=================================== */

export async function trackDevice() {

  const visitorId = getVisitorId();

  const today = todayKey();

  const key =
    `device_${today}_${visitorId}`;

  if (localStorage.getItem(key)) {

    return;

  }

  localStorage.setItem(key, "1");

  let device = "desktop";

  if (/Tablet|iPad/i.test(navigator.userAgent)) {

    device = "tablet";

  }

  else if (/Mobile/i.test(navigator.userAgent)) {

    device = "mobile";

  }


  await setDoc(

    doc(db, "analytics_devices", "overview"),

    {

      [device]: increment(1),

      updatedAt: serverTimestamp()

    },

    { merge: true }

  );

}


/* ===================================
   WISHLIST
=================================== */

export async function trackWishlist(productId) {

  if (!productId) return;

  await setDoc(

    doc(db, "products", productId),

    {

      wishlist: increment(1)

    },

    { merge: true }

  );

  await setDoc(

    doc(db, "analytics", "overview"),

    {

      wishlist: increment(1),

      updatedAt: serverTimestamp()

    },

    { merge: true }

  );

}


/* ===================================
   CART
=================================== */

export async function trackCart(productId) {

  if (!productId) return;

  await setDoc(

    doc(db, "products", productId),

    {

      cartAdds: increment(1),

      updatedAt: serverTimestamp()

    },

    { merge: true }

  );

  await setDoc(

    doc(db, "analytics", "overview"),

    {

      cartAdds: increment(1),

      updatedAt: serverTimestamp()

    },

    { merge: true }

  );

}


/* ===================================
   PURCHASE
=================================== */

export async function trackPurchase(
  productId,
  qty,
  amount
) {

  if (!productId) return;

  await setDoc(

    doc(db, "products", productId),

    {

      sold: increment(qty),

      revenue: increment(amount)

    },

    { merge: true }

  );


  await setDoc(

    doc(db, "analytics_products", productId),

    {

      sold: increment(qty),

      revenue: increment(amount),

      updatedAt: serverTimestamp()

    },

    { merge: true }

  );


  await setDoc(

    doc(db, "analytics", "overview"),

    {

      totalRevenue: increment(amount),

      totalOrders: increment(1),

      soldProducts: increment(qty),

      updatedAt: serverTimestamp()

    },

    { merge: true }

  );


  const today = todayKey();

  await setDoc(

    doc(db, "analytics_daily", today),

    {

      revenue: increment(amount),

      orders: increment(1),

      soldProducts: increment(qty),

      updatedAt: serverTimestamp()

    },

    { merge: true }

  );

}