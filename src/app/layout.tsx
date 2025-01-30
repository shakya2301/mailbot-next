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
      <body>
        {children}
      </body>
      </SessionProvider>
    </html>
  );
}
