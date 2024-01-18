import Provider from "./components/apolloProvider/Provider";
import AuthProvider from "./components/hooks/authHook";
import { Inter } from "next/font/google";
import type { Metadata } from "next";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Municipalities Ratios",
  description: "Add Municipalities Ratios",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider>
          <AuthProvider>{children}</AuthProvider>
        </Provider>
      </body>
    </html>
  );
}

// const file = new Blob([value], { type: "text/plain" });
