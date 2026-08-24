import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aryan News Agency Management System (VB6 Edition)',
  description: '1:1 Web Replica of the Original VB6 + MySQL Desktop Software',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#3A6EA5] flex flex-col justify-between">
        {children}
      </body>
    </html>
  );
}
