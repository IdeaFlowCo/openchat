// WARNING: To use this, add the necessary .env key. Contact alanduong07@gmail if you need help.
// Note: Though, I didn't use this so not sure how much can help.
// import Analytics from "analytics";
// import mixpanelPlugin from "@analytics/mixpanel";
// import Router from "next/router";

// // Initialize analytics and plugins
// // Documentation: https://getanalytics.io
// const analytics = Analytics({
//   debug: process.env.NODE_ENV !== "production",
//   plugins: [
//     // Instructions: https://divjoy.com/docs/mixpanel
//     mixpanelPlugin({
//       token: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
//     }),
//   ],
// });

// // Track initial pageview
// if (typeof window !== "undefined") {
//   analytics.page();
// }

// // Track pageview on route change
// Router.events.on("routeChangeComplete", (url) => {
//   analytics.page();
// });

// export default analytics;
