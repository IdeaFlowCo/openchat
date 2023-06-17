import Logo from "./atoms/Logo";
import Auth from "./Auth";
import AuthFooter from "./AuthFooter";

export default function NewAuthSection(props) {
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
        <>
            {/*
          This example requires updating your template:
  
          ```
          <html class="h-full bg-white">
          <body class="h-full">
          ```
        */}
            <div className="flex min-h-full flex-1">
                <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                    <div className="mx-auto w-full max-w-sm lg:w-96">
                        <div>
                            {/* <img
                                className="h-10 w-auto"
                                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                                alt="Your Company"
                            /> */}
                            {/* <Logo /> */}
                            <h2 className="mt-8 text-4xl font-medium leading-9 tracking-tight text-gray-900 font-satoshi">
                                {options.title}
                            </h2>
                            {/* <p className="mt-2 text-sm leading-6 text-gray-500">
                                Not a member?{" "}
                                <a
                                    href="#"
                                    className="font-semibold text-indigo-600 hover:text-indigo-500"
                                >
                                    Start a 14 day free trial
                                </a>
                            </p> */}
                        </div>

                        <div className="mt-10">
                            <Auth
                                type={type}
                                buttonAction={options.buttonAction}
                                providers={props.providers}
                                afterAuthPath={props.afterAuthPath}
                                key={type}
                            />
                            {options.showFooter && (
                                <AuthFooter type={type} {...options} />
                            )}
                        </div>
                    </div>
                </div>
                <div className="relative hidden w-0 flex-1 lg:block">
                    <img
                        className="absolute inset-0 h-full w-full object-cover"
                        src="https://images.unsplash.com/photo-1496917756835-20cb06e75b4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1908&q=80"
                        alt=""
                    />
                </div>
            </div>
        </>
    );
}
