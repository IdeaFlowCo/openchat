import React from "react";
import Link from "next/link";
import LegalTerms from "components/landing/LegalTerms";
import LegalPrivacy from "components/landing/LegalPrivacy";
import LegalClaims from "./LegalClaims";

function LegalSection(props) {
    const validSections = {
        "terms-of-service": true,
        "privacy-policy": true,
        "claims": true,
    };

    const section = validSections[props.section]
        ? props.section
        : "terms-of-service";

    const data = {
        domain: "deepform.ai",
        companyName: "Deepform",
    };

    return (
        <section className="py-10 px-4 z-100">
            <div className="flex justify-center space-x-5">
                <Link
                    href="/legal/terms-of-service"
                    className={
                        "" +
                        (section === "terms-of-service" ? " underline" : "")
                    }>
                    
                        Terms of Service
                    
                </Link>
                <Link
                    href="/legal/privacy-policy"
                    className={
                        "" +
                        (section === "privacy-policy" ? " underline" : "")
                    }>
                    
                        Privacy Policy
                    
                </Link>
                <Link
                    href="/legal/claims"
                    className={
                        "" + (section === "claims" ? " underline" : "")
                    }>
                    
                        Claims
                    
                </Link>
            </div>
            <div className="container mx-auto mt-12">
                {section === "terms-of-service" && <LegalTerms {...data} />}

                {section === "privacy-policy" && <LegalPrivacy {...data} />}

                {section === "claims" && <LegalClaims {...data} />}
            </div>
        </section>
    );
}

export default LegalSection;
