const Stripe = require("stripe");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY, {
  // Pin to specific version of the Stripe API
  apiVersion: "2022-11-15",
});

module.exports = stripe;
