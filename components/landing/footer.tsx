import Link from "next/link";
import { cn } from "@/lib/utils";

export function Footer({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn("border-t bg-background", className)}>
      <div className="flex md:flex-row flex-col justify-between items-center gap-4 py-10 md:py-0 md:h-24 container">
        <div className="flex md:flex-row flex-col items-center gap-4 md:gap-2 px-8 md:px-0">
          <p className="text-muted-foreground text-sm md:text-left text-center leading-loose">
            Built with ❤️ for your hackathon project. © {new Date().getFullYear()} FlameKeepers.
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/terms"
            className="text-muted-foreground text-sm hover:underline underline-offset-4"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="text-muted-foreground text-sm hover:underline underline-offset-4"
          >
            Privacy
          </Link>
          <Link
            href="/contact"
            className="text-muted-foreground text-sm hover:underline underline-offset-4"
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}