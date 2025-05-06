"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { LogIn } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const isAuthed = false; // Replace with your auth logic

  return (
    <header className="top-0 z-50 sticky bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur border-b border-border/40 w-full">
      <div className="flex items-center h-16 container">
        <div className="hidden md:flex mr-4">
          <Link href="/" className="flex items-center space-x-2 mr-6">
            <span className="hidden sm:inline-block font-bold">
              HackathonApp
            </span>
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Features</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="gap-3 grid lg:grid-cols-[.75fr_1fr] p-6 md:w-[400px] lg:w-[500px]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex flex-col justify-end bg-gradient-to-b from-muted/50 to-muted focus:shadow-md p-6 rounded-md outline-none w-full h-full no-underline select-none"
                          href="/"
                        >
                          <div className="mt-4 mb-2 font-medium text-lg">
                            HackathonApp
                          </div>
                          <p className="text-muted-foreground text-sm leading-tight">
                            A beautiful and functional frontend for your hackathon project.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <ListItem href="/dashboard" title="Dashboard">
                      View and manage all your projects in one place.
                    </ListItem>
                    <ListItem href="/features/analytics" title="Analytics">
                      Powerful insights into your application usage.
                    </ListItem>
                    <ListItem href="/features/integrations" title="Integrations">
                      Connect with your favorite tools and services.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/pricing" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Pricing
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/about" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    About
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex flex-1 justify-between md:justify-end items-center space-x-2">
          <div className="flex-1 md:flex-none w-full md:w-auto">
            {/* Mobile Menu - Implement if needed */}
          </div>
          <nav className="flex items-center space-x-2">
            <ModeToggle />
            {isAuthed ? (
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/auth/login">
                    <LogIn className="mr-2 w-4 h-4" />
                    Login
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="font-medium text-sm leading-none">{title}</div>
          <p className="text-muted-foreground text-sm line-clamp-2 leading-snug">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";