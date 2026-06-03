import "./globals.css";
import React from 'react';

export const metadata = {
  title: "Personal Finance Dashboard & Budget Tracker",
  description: "A premium, dark-themed personal finance manager, budget setter, and expense tracker built with Next.js and MongoDB Atlas.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
