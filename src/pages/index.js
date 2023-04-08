import React from "react";
import Meta from "components/Meta";
import NewsletterSection from "components/NewsletterSection";

function IndexPage(props) {
  return (
    <>
      <Meta />
      <section className="py-12 px-4">
        <div className="container mx-auto">
        Welcome! Deepform trains and deploys AI user researchers to 
        consistently gather deep insights from your users 
        via automated conversational interviews.

        Click "Sign In" to get started for free.
        </div>
      </section>
      <NewsletterSection />
    </>
  );
}

export default IndexPage;
