import Link from "next/link";
import { cn } from "@/lib/utils";

export function Footer({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn("border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 relative overflow-hidden", className)}>
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="top-0 left-1/4 absolute bg-green-500 blur-3xl rounded-full w-32 h-32"></div>
        <div className="right-1/4 bottom-0 absolute bg-blue-500 blur-2xl rounded-full w-24 h-24"></div>
      </div>

      <div className="z-10 relative flex md:flex-row flex-col justify-between items-center gap-6 py-12 md:py-8 md:h-32 container">
        <div className="flex md:flex-row flex-col items-center gap-6 md:gap-8 px-8 md:px-0">
          {/* Logo/Brand section */}
          <div className="flex items-center gap-3">
            <div className="flex justify-center items-center bg-gradient-to-br from-green-500 to-green-600 shadow-lg rounded-xl w-10 h-10">
              <span className="font-bold text-white text-lg">🔥</span>
            </div>
            <div className="text-left">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">FlameKeepers</h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Synth-Learn</p>
            </div>
          </div>

          {/* Copyright text */}
          <div className="flex md:flex-row flex-col items-center gap-2">
            <p className="text-gray-600 dark:text-gray-300 text-sm md:text-left text-center leading-relaxed">
              Built with <span className="text-red-500 animate-pulse">❤️</span> forSN Bose Science Olympiad
            </p>
            <span className="hidden md:inline text-gray-400 dark:text-gray-500">•</span>
            <p className="text-gray-500 dark:text-gray-400 text-xs">
              © {new Date().getFullYear()} FlameKeepers. All rights reserved.
            </p>
          </div>
        </div>

        {/* Navigation links */}
        <div className="flex items-center gap-8">
          <div className="flex gap-6">
            <Link
              href="/terms"
              className="font-medium text-gray-600 hover:text-green-600 dark:hover:text-green-400 dark:text-gray-300 text-sm hover:underline underline-offset-4 transition-colors duration-200"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="font-medium text-gray-600 hover:text-green-600 dark:hover:text-green-400 dark:text-gray-300 text-sm hover:underline underline-offset-4 transition-colors duration-200"
            >
              Privacy
            </Link>
            <Link
              href="/contact"
              className="font-medium text-gray-600 hover:text-green-600 dark:hover:text-green-400 dark:text-gray-300 text-sm hover:underline underline-offset-4 transition-colors duration-200"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom accent bar */}
      <div className="bg-gradient-to-r from-green-500 via-blue-500 to-green-500 h-1"></div>
    </footer>
  );
}