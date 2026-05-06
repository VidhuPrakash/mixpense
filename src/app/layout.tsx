import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces, DM_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: "normal",
});

export const metadata: Metadata = {
  title: {
    default: "Mixpense – Personal Expense Tracker",
    template: "%s | Mixpense",
  },
  description:
    "Mixpense is a free personal expense tracker app to manage budgets, track daily spending, monitor subscriptions, and take control of your finances — built for India.",
  keywords: [
    // Core
    "personal expense tracker",
    "expense tracking app",
    "daily expense manager",
    "monthly budget tracker",
    "money management app",
    // Features
    "budget planner app",
    "spending analytics app",
    "income and expense tracker",
    "bill payment tracker",
    "subscription tracker",
    "multi-account expense manager",
    // Long-tail
    "free personal finance tracker app",
    "expense tracker without bank login",
    "manual expense entry app",
    "expense tracker with charts and reports",
    "daily spending tracker India",
    // Problem-solving
    "how to track daily expenses",
    "control overspending app",
    "save money tracker app",
    "household budget manager",
    // India-specific
    "expense tracker India",
    "UPI payment tracker",
    "rupee expense manager",
    "Indian personal finance app",
    // Alternatives
    "Monefy alternative",
    "Money Manager alternative",
    "free alternative to Spendee",
  ],
  authors: [{ name: "Mixpense" }],
  creator: "Mixpense",
  metadataBase: new URL("https://mixpense.vercel.app"),
  openGraph: {
    title: "Mixpense – Personal Expense Tracker",
    description:
      "Track daily expenses, manage budgets, and stay on top of your finances with Mixpense — a free personal finance app for India.",
    url: "https://mixpense.vercel.app",
    siteName: "Mixpense",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Mixpense logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Mixpense – Personal Expense Tracker",
    description:
      "Track daily expenses, manage budgets, and stay on top of your finances with Mixpense — free for India.",
    images: ["/android-chrome-512x512.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
    other: [
      {
        rel: "manifest",
        url: "/site.webmanifest",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${dmMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
