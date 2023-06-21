//TODO: This is usable code, used in deepform.ai. But not using this (yet).
// import { loadStripe } from "@stripe/stripe-js";
// import { apiRequest } from "./util";
// import { getStripePriceId } from "./prices";

// let stripe;
// // Load the Stripe script
// loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, {
//   // Pin to specific version of the Stripe API
//   apiVersion: "2022-11-15",
// }).then((stripeInstance) => {
//   // Set stripe so all functions below have it in scope
//   stripe = stripeInstance;
// });

// export async function redirectToCheckout(planId) {
//   // Create a checkout session
//   const session = await apiRequest("stripe-create-checkout-session", "POST", {
//     priceId: getStripePriceId(planId),
//     successUrl: `${window.location.origin}/dashboard?paid=true`,
//     cancelUrl: `${window.location.origin}/pricing`,
//     subscriptionData: {
//       trial_period_days: 0,
//     }
//   });

//   // Ensure if user clicks browser back button from checkout they go to /pricing
//   // instead of this page or they'll redirect right back to checkout.
//   window.history.replaceState({}, "", "/pricing");

//   // Redirect to checkout
//   return stripe.redirectToCheckout({
//     sessionId: session.id,
//   });
// }

// export async function redirectToBilling() {
//   // Create a billing session
//   const session = await apiRequest("stripe-create-billing-session", "POST", {
//     returnUrl: `${window.location.origin}/settings/general`,
//   });

//   // Ensure if user clicks browser back button from billing they go to /settings/general
//   // instead of this page or they'll redirect right back to billing.
//   window.history.replaceState({}, "", "/settings/general");

//   // Redirect to billing session url
//   window.location.href = session.url;
// }
