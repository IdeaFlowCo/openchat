import React from "react";
import Meta from "components/Meta";
import ContactSection from "components/landing/ContactSection";

function AboutPage(props) {
    return (
        <>
            <Meta
                title="About"
                description="Learn about our company and team"
            />
            <ContactSection />
        </>
    );
}

export default AboutPage;
