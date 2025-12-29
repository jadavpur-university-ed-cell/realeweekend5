import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Poppins } from "next/font/google";
import Navbar from "@/components/Navbar";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "900"], // Select weights you need
  variable: "--font-poppins", // Optional: defines a CSS variable
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://eweekend.juecell.com"),

  title: {
    default: "E-Weekend 9.0 | JU E-Cell",
    template: "%s | JU E-Cell",
  },

  description:
    "E-Weekend is JU E-Cell's entrepreneurial event for Jadavpur University freshers. It hosts events such as B-Plan Competition, Case Study and Data Analytics Competitions.",

  keywords: [
    "E-Weekend",
    "Freshers' Event",
    "E-Cell",
    "freshers",
    "JU E-Cell",
    "Jadavpur University",
    "Entrepreneurship",
    "B-Plan Competition",
    "Case Study Competition",
    "Data Analytics Competition",
  ],

  openGraph: {
    type: "website",
    url: "https://eweekend.juecell.com/",
    title: "E-Weekend 9.0 | JU E-Cell",
    description:
      "E-Weekend is JU E-Cell's entrepreneurial event for Jadavpur University freshers. It hosts events such as B-Plan Competition, Case Study and Data Analytics Competitions.",
    siteName: "E-Weekend | JU E-Cell",
    images: [
      {
        url: "/ecell.png",
        width: 1200,
        height: 630,
        alt: "E-Weekend 9.0 by JU E-Cell",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "E-Weekend 9.0 | JU E-Cell",
    description:
      "E-Weekend is JU E-Cell's entrepreneurial event for Jadavpur University freshers.",
    images: ["/ecell.png"],
  },

  icons: {
    icon: "/images/favicon.ico",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={poppins.className}
      >
        <Navbar />
        {children}
        <noscript>
        <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MNZWXJ7K"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
      </body>
    </html>
  );
}
