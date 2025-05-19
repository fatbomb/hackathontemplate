import type { Metadata } from "next";
import { Inter } from "next/font/google";
// import { Toaster } from '@/components/ui/toaster'
import { Toaster } from '../components/ui/toaster'
import "./globals.css";
import { ThemeProvider } from "../components/teme-provider";
import { cn } from "@/lib/utils";

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
      <body className={cn("min-h-screen antialiased", inter.className)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}