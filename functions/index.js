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
  key_id: "YOUR_RAZORPAY_KEY_ID",
  key_secret: "YOUR_RAZORPAY_KEY_SECRET",
});

/* ===========================
CREATE ORDER
=========================== */

exports.createOrder = onCall(async (request) => {
  try {
    const {amount, receipt} = request.data;

    if (!amount) {
      throw new HttpsError(
          "invalid-argument",
          "Amount is required",
      );
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: receipt || `order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return {
      success: true,
      order,
    };
  } catch (err) {
    logger.error(err);

    throw new HttpsError(
        "internal",
        err.message,
    );
  }
});
