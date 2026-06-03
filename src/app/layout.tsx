import "./globals.css";
import React from 'react';
 
export const metadata = {
  title: "Personal Finance Dashboard & Budget Tracker",
  description: "A premium, dark-themed personal finance manager, budget setter, and expense tracker built with Next.js and MongoDB Atlas.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MyFinance",
  },
};
 
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <meta name="theme-color" content="#05080f" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
