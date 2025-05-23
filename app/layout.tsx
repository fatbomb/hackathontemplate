import type { Metadata } from "next";
import localFont from 'next/font/local';
import { Toaster } from '../components/ui/toaster'
import "./globals.css";
import { ThemeProvider } from "../components/teme-provider";
import { Footer } from "@/components/landing/footer";
import NavbarWrapper from "@/components/landing/NavbarWrapper";

const inter = localFont({
  src: '../public/Inter.otf', // Path to your downloaded Inter font
  display: 'swap',
});

export const metadata: Metadata = {
  title: "SynthLearn",
  description: "Template for flamekeepers",
  icons: {
    icon: "/atom.png"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning={true} className={`min-h-screen ${inter.className}`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <div className="flex flex-col min-h-screen">
           <NavbarWrapper />
              {children}
          </div>
            <Footer className="px-20" />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}