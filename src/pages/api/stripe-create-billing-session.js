// WARNING: If you use this, make sure to bring back other Stripe dependencies and ofc
// add the neccessary columns to the supabase database. Contact alanduong07@gmail if you need help.
// const requireAuth = require("./_require-auth.js");
// const { getCustomer } = require("./_db.js");
// const stripe = require("./_stripe.js");

// export default requireAuth(async (req, res) => {
//   const body = req.body;
//   const user = req.user;

//   try {
//     const { stripeCustomerId } = await getCustomer(user.id);

//     // Create a billing portal session
//     const session = await stripe.billingPortal.sessions.create({
//       customer: stripeCustomerId,
//       return_url: body.returnUrl,
//     });

//     // Return success response
//     res.send({ status: "success", data: session });
//   } catch (error) {
//     console.log("stripe-create-billing-session error", error);

//     // Return error response
//     res.send({ status: "error", code: error.code, message: error.message });
//   }
// });
