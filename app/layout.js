import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ChatWidget from "./components/ChatWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: "Aarya Cuts | Book a Cut",
  description: "Book your next haircut appointment with ease",
  openGraph: {
    title: 'Aarya Cuts',
    description: 'Premium Men’s Grooming',
    images: ['/images/aarya-cuts-logo.jpg'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
