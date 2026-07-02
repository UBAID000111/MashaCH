const {onCall, HttpsError} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

const admin = require("firebase-admin");
const Razorpay = require("razorpay");
// const crypto = require("crypto");

admin.initializeApp();

// const db = admin.firestore();

/* ===========================
RAZORPAY
=========================== */

const razorpay = new Razorpay({
  key_id: "rzp_test_T8YP5dylO0fwGZ",
  key_secret: "Dww3IUbiNsYcJz3weT1nmvQx",
});

/* ===========================
CREATE ORDER
=========================== */



exports.createOrder = onCall(async (request) => {
  return {
    success: true,
    message: "Function is working",
    data: request.data,
    auth: request.auth || null
  };
});