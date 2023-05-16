import React from "react";
import Meta from "components/Meta";
import PricingSection from "components/PricingSection";
import AbstractBg from "components/atoms/AbstractBg";

function PricingPage(props) {
  return (
    <>
      <Meta title="Pricing" />
      <AbstractBg />
      <PricingSection />
    </>
  );
}

export default PricingPage;
