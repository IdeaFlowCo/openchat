import React from "react";
import Link from "next/link";
import { useAuth } from "util/auth";
import { useRouter } from "next/router";
import Logo from "./Logo";
function Navbar(props) {
    const auth = useAuth();
    const router = useRouter();
    // If the url is /forms/[id] then we are on a form page. Don't show navbar.
    if (router.pathname.startsWith("/form") || router.pathname.startsWith("/dashboard")) {
        return null;
    }

    return (
        <header className="relative py-5 px-4 bg-transparent z-10">
            <div className="container flex flex-col flex-wrap items-center mx-auto md:flex-row">
                <Logo />
                <nav className="flex flex-wrap items-center md:ml-auto text-lg">
                    <Link href="/about">
                        <button className="ml-5">About</button>
                    </Link>

                    {(!auth.user || !auth.user.stripeSubscriptionId) && (
                        <Link href="/pricing">
                            <button className="ml-5">Pricing</button>
                        </Link>
                    )}

                    {auth.user && (
                        <>
                            <Link href="/dashboard">
                                <button className="ml-5">Dashboard</button>
                            </Link>
                            <Link href="/settings/general">
                                <button className="ml-5">Settings</button>
                            </Link>
                            <Link href="/auth/signout">
                                <button
                                    className="ml-5"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        auth.signout();
                                    }}
                                >
                                    Sign out
                                </button>
                            </Link>
                        </>
                    )}

                    {!auth.user && (
                        <Link href="/auth/signin">
                            <button className="ml-5">Sign in</button>
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Navbar;
