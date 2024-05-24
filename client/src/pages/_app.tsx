import { AuthProvider } from "@/components/AuthContext";
import { Footer } from "@/components/Footer";
import Header from "@/components/Header";
import { fonts } from "@/lib/fonts";
import { theme } from "@/lib/theme";
import "@/styles/globals.css";
import { ChakraProvider } from "@chakra-ui/react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <style jsx global>
        {`
          :root {
            --font-rubik: ${fonts.rubik.style.fontFamily};
          }
        `}
      </style>
      <ChakraProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <GoogleOAuthProvider
              clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
            >
              <Header />

              <div className="flex-1">
                <Component {...pageProps} />
              </div>

              <Footer />
            </GoogleOAuthProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ChakraProvider>
    </div>
  );
}
