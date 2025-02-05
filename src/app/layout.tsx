'use client'

import "./globals.css";
import SessionProvider from '@/contexts/SessionProvider';
import { store } from "@/store";
import { Provider } from "react-redux";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Provider store={store}>
      <SessionProvider>
      <body className="dark">
        {children}
      </body>
      </SessionProvider>
      </Provider>
    </html>
  );
}
