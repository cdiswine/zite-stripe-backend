import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const ALLOWED_ORIGIN = "https://book.zite.so"; // your Zite app

export async function handler(event, context) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "OK",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN },
      body: "Method Not Allowed",
    };
  }

  try {
    const { amount, currency = "cad" } = JSON.parse(event.body);

    if (!amount) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ error: "Amount is required." }),
      };
    }

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // in cents
      currency,
      automatic_payment_methods: { enabled: true },
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ clientSecret: paymentIntent.client_secret }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: err.message }),
    };
  }
}
