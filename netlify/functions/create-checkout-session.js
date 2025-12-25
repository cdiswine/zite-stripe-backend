import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Add your Stripe secret key in Netlify env vars
const ALLOWED_ORIGIN = "https://book.zite.so"; // Your Zite app origin

export async function handler(event, context) {
  // Handle CORS preflight request
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

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN },
      body: "Method Not Allowed",
    };
  }

  try {
    // Parse line items from request body
    const { lineItems } = JSON.parse(event.body);

    // Validate lineItems
    if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: "lineItems is required and must be a non-empty array",
        }),
      };
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: "https://vetgo-book.netlify.app/success",
      cancel_url: "https://vetgo-book.netlify.app/cancel",
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: session.id }),
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
