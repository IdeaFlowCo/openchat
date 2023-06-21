const supabase = require("./_supabase");

/**** USERS ****/

// Get user by uid
function getUser(uid) {
  return supabase.from("users").select("*").eq("id", uid).single().then(handle);
}

// WARNING: If you use this, make sure to bring back other Stripe dependencies and ofc 
// add the neccessary columns to the supabase. Contact alanduong07@gmail.com if you need help.

// Get customer by uid
// function getCustomer(uid) {
//   return supabase
//     .from("customers")
//     .select()
//     .eq("id", uid)
//     .maybeSingle()
//     .then(handle);
// }


// // Get customer by Stripe customer ID
// function getCustomerByStripeCid(id) {
//   return supabase
//     .from("customers")
//     .select()
//     .eq("stripeCustomerId", id)
//     .single()
//     .then(handle);
// }

// Create a new customer
// function createCustomer(id, data) {
//   return supabase
//     .from("customers")
//     .insert([{ id, ...data }])
//     .then(handle);
// }

// Update customer by Stripe customer ID
// function updateCustomerByStripeCid(id, data) {
//   return supabase
//     .from("customers")
//     .update(data)
//     .eq("stripeCustomerId", id)
//     .then(handle);
// }

/**** HELPERS ****/

// Get response data or throw error if there is one
function handle(response) {
  if (response.error) throw response.error;
  return response.data;
}

module.exports = {
  getUser,

  // getCustomer,
  // getCustomerByStripeCid,
  // createCustomer,
  // updateCustomerByStripeCid,
};
