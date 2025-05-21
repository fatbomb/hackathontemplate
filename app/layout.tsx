import type { Metadata } from "next";
import { Inter } from "next/font/google";
// import { Toaster } from '@/components/ui/toaster'
import { Toaster } from '../components/ui/toaster'
import "./globals.css";
import { ThemeProvider } from "../components/teme-provider";
// import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import NavbarWrapper from "@/components/landing/NavbarWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FlameKeepers",
  description: "Template for flamekeepers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning={true} className={`min-h-screen ${inter.className}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex flex-col w-screen min-h-screen">
           <NavbarWrapper />
              {children}
            <Footer className="px-20" />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}