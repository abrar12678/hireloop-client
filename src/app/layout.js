import { Geist, Geist_Mono, Space_Mono } from "next/font/google";
import { Manrope } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer2 from "@/components/Footer2";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata = {
  title: "HireLoop — AI-Powered Job Recruitment Platform",
  description:
    "HireLoop connects top talent with world-class companies. Browse thousands of curated opportunities and land your next role — faster.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceMono.variable} ${manrope.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="pt-20">{children}</main>
        <Footer2 />
      </body>
    </html>
  );
}
