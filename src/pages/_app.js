import React from "react";
import "styles/global.css";
import "util/analytics";
import Chat from "components/CrispChat";
import { AuthProvider } from "util/auth";
import { QueryClientProvider } from "util/db";
import { Toaster } from "react-hot-toast";
import Navbar from "components/Navbar";
import Footer from "components/Footer";

function MyApp({ Component, pageProps }) {
    return (
        <QueryClientProvider>
            <AuthProvider>
                {/* <Chat /> */}
                <>
                    {/* <Navbar /> */}
                    <Navbar />

                    <Component {...pageProps} />
                    <Toaster />
                    <Footer />
                </>
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default MyApp;
