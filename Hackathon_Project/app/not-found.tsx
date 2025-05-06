import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <div className="flex flex-col justify-center items-center mx-auto max-w-[420px] text-center">
        <h1 className="font-bold text-4xl sm:text-5xl md:text-6xl tracking-tighter">404</h1>
        <p className="mt-4 text-muted-foreground text-xl">
          We couldn't find the page you were looking for.
        </p>
        <div className="mt-8">
          <Button asChild>
            <Link href="/">Go back home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}