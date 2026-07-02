const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");

admin.initializeApp();

const razorpay = new Razorpay({
    key_id: "rzp_live_T8gJhOFIVYCxkz",
    key_secret: "gk33923fxwep3XcBMNO2oy3v"
});

exports.createOrder = onCall(async (request) => {

    try {

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
            receipt: receipt || ("MCH_" + Date.now())
        });

        return {
            order
        };

    } catch (err) {

        console.error(err);

        throw new HttpsError(
            "internal",
            err.message
        );

    }

});