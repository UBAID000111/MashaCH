


const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");

admin.initializeApp();

const razorpayKeyId = defineSecret("RAZORPAY_KEY_ID");
const razorpayKeySecret = defineSecret("RAZORPAY_KEY_SECRET");

exports.createOrder = onCall(
  {
    secrets: [razorpayKeyId, razorpayKeySecret],
  },
  async (request) => {
    try {
      const razorpay = new Razorpay({
        key_id: razorpayKeyId.value(),
        key_secret: razorpayKeySecret.value(),
      });

      const { amount, receipt } = request.data;

      if (!amount) {
        throw new HttpsError(
          "invalid-argument",
          "Amount is required"
        );
      }

      const order = await razorpay.orders.create({
        amount: amount * 100,
        currency: "INR",
        receipt: receipt || ("MCH_" + Date.now()),
      });

      return { order };

    } catch (err) {
      console.error(err);

      throw new HttpsError(
        "internal",
        err.message
      );
    }
  }
);