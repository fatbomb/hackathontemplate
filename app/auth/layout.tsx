import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 bg-muted/40 min-h-screen">
      <div className="hidden md:flex flex-col justify-between bg-gradient-to-b from-primary to-primary/60 p-10 text-white">
        <div>
          <Link href="/" className="font-bold text-xl">
            SynthLearn
          </Link>
        </div>
        <div className="space-y-4">
          <h1 className="font-bold text-3xl">Welcome to SynthLearn</h1>
          <p className="opacity-90 text-lg">
            Learn with fun interactive exercises, play with the AI, and improve your science proficiency
          </p>
        </div>
        <div className="opacity-70 text-sm">
          © {new Date().getFullYear()} FlameKeepers. All rights reserved.
        </div>
      </div>
      <div className="flex flex-col p-4 md:p-10">
        <div className="flex justify-end mb-6">
          <ModeToggle />
        </div>
        <div className="flex flex-1 justify-center items-center">
          <div className="space-y-6 w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}