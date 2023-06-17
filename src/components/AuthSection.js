import React from "react";
import Auth from "./Auth";
import AuthFooter from "./AuthFooter";
import Logo from "./atoms/Logo";
function AuthSection(props) {
    // Options by auth type
    const optionsByType = {
        signup: {
            // Top Title
            title: "Create your account",
            // Button text
            buttonAction: "Sign up",
            // Footer text and links
            showFooter: true,
            signinText: "Already have an account?",
            signinAction: "Sign in",
            signinPath: props.afterAuthPath
                ? `/auth/signin?next=${props.afterAuthPath}`
                : `/auth/signin}`,
            // Terms and privacy policy agreement
            showAgreement: true,
            termsPath: "/legal/terms-of-service",
            privacyPolicyPath: "/legal/privacy-policy",
        },
        signin: {
            title: "Welcome back",
            buttonAction: "Sign in",
            showFooter: true,
            signupAction: "Create an account",
            signupPath: props.afterAuthPath
                ? `/auth/signup?next=${props.afterAuthPath}`
                : `/auth/signup`,
            forgotPassAction: "Forgot Password?",
            forgotPassPath: "/auth/forgotpass",
        },
        forgotpass: {
            title: "Get a new password",
            buttonAction: "Reset password",
            showFooter: true,
            signinText: "Remember it after all?",
            signinAction: "Sign in",
            signinPath: "/auth/signin",
        },
        changepass: {
            title: "Choose a new password",
            buttonAction: "Change password",
        },
    };

    // Ensure we have a valid auth type
    const type = optionsByType[props.type] ? props.type : "signup";

    // Get options object for current auth type
    const options = optionsByType[type];

    return (
        <section className="flex h-screen w-screen items-center justify-center py-12 px-4 b">
            <div className="container mx-auto max-w-sm text-center">
                <div className="fixed top-5 left-8">
                    <Logo />
                </div>

                <h1 className="mb-6 font-satoshi text-3xl font-medium tracking-tight">
                    {options.title}
                </h1>
                <Auth
                    type={type}
                    buttonAction={options.buttonAction}
                    providers={props.providers}
                    afterAuthPath={props.afterAuthPath}
                    key={type}
                />

                {options.showFooter && <AuthFooter type={type} {...options} />}
            </div>
        </section>
    );
}

export default AuthSection;
