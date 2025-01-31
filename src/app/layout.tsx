import "./globals.css";
import SessionProvider from '@/contexts/SessionProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <SessionProvider>
      <body className="dark">
        {children}
      </body>
      </SessionProvider>
    </html>
  );
}
