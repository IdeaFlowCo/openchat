import React from "react";
import "styles/global.css";
import Navbar from "components/Navbar";
import "util/analytics";
import Chat from "components/CrispChat";
import { AuthProvider } from "util/auth";
import { QueryClientProvider } from "util/db";
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps }) {
  return (
    <QueryClientProvider>
      <AuthProvider>
        <Chat />
        <>
          <Navbar />

          <Component {...pageProps} />
          <Toaster />
        </>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default MyApp;
