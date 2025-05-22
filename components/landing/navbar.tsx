"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import { LogIn, LogOut, Menu, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

interface NavbarProps {
  serverAuth: {
    isAuthed: boolean;
    user: any;
  };
}

export function Navbar({ serverAuth }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [authState, setAuthState] = useState(serverAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fetchAuthStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/status');
      if (!response.ok) throw new Error('Failed to fetch auth status');
      const data = await response.json();
      setAuthState(data);
    } catch (err) {
      console.error('Failed to fetch auth status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthStatus();
  }, []);

  const handleLogout = async () => {
    // Show confirmation dialog
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (!confirmLogout) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        setAuthState({ isAuthed: false, user: null });
        router.refresh();
        setIsMobileMenuOpen(false);
        router.push('/');
      } else {
        throw new Error('Logout failed');
      }
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const NavItems = () => (
    <>
      <NavigationMenuItem>
        <Link href="/tutorials" legacyBehavior passHref>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            Tutorials
          </NavigationMenuLink>
        </Link>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <Link href="/playground" legacyBehavior passHref>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            playground
          </NavigationMenuLink>
        </Link>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <Link href="/gymnasium" legacyBehavior passHref>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            Gymnasium
          </NavigationMenuLink>
        </Link>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <Link href="/chatbot" legacyBehavior passHref>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            Sci-Baba Bot
          </NavigationMenuLink>
        </Link>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <Link href="/environment/result" legacyBehavior passHref>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            Environment
          </NavigationMenuLink>
        </Link>
      </NavigationMenuItem>
    </>
  );

  const AuthButtons = () => (
    <>
      {authState.isAuthed ? (
        <div className="hidden md:flex items-center space-x-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="flex items-center"
            disabled={isLoading}
          >
            <Link href="/">
              <User className="mr-2 w-4 h-4" />
              <span className="hidden sm:inline">{authState.user?.name || 'Profile'}</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="flex items-center"
            disabled={isLoading}
          >
            <LogOut className="mr-2 w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            disabled={isLoading}
          >
            <Link href="/auth/login" className="flex items-center">
              <LogIn className="mr-2 w-4 h-4" />
              <span className="hidden sm:inline">Login</span>
            </Link>
          </Button>
          <Button
            asChild
            size="sm"
            disabled={isLoading}
          >
            <Link href="/auth/signup">
              <span>Sign Up</span>
            </Link>
          </Button>
        </div>
      )}
    </>
  );

  const MobileNavigation = () => (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-5 h-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <Link
              href="/"
              className="font-bold text-lg"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              SynthLearn
            </Link>

          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <SheetClose asChild>
                <Link href="/">
                  <Button variant="ghost" size="sm" className="justify-start w-full">
                    Home
                  </Button>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="/tutorials">
                  <Button variant="ghost" size="sm" className="justify-start w-full">
                    Tutorials
                  </Button>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="playground">
                  <Button variant="ghost" size="sm" className="justify-start w-full">
                    Playground
                  </Button>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="gymnasium">
                  <Button variant="ghost" size="sm" className="justify-start w-full">
                    Gymnasium
                  </Button>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="/chatbot">
                  <Button variant="ghost" size="sm" className="justify-start w-full">
                    Sci-Baba bot
                  </Button>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="/emvorpment/result">
                  <Button variant="ghost" size="sm" className="justify-start w-full">
                    Environment
                  </Button>
                </Link>
              </SheetClose>
            </div>

            <div className="pt-4 border-t border-border">
              {authState.isAuthed ? (
                <>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="flex"
                    disabled={isLoading}
                  >
                    <Link href="/">
                      <User className="mr-2 w-4 h-4" />
                      <span className="hidden sm:inline">{authState.user?.name || 'Profile'}</span>
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start w-full"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={isLoading}
                  >
                    <LogOut className="mr-2 w-4 h-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <SheetClose asChild>
                    <Link href="/auth/login">
                      <Button variant="ghost" size="sm" className="justify-start w-full" disabled={isLoading}>
                        <LogIn className="mr-2 w-4 h-4" />
                        Login
                      </Button>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/auth/signup">
                      <Button size="sm" className="mt-2 w-full" disabled={isLoading}>
                        Sign Up
                      </Button>
                    </Link>
                  </SheetClose>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-center mt-auto mb-4">
            <ModeToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className="top-0 z-50 sticky bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur border-b border-border/40 w-full">
      <div className="flex items-center mx-auto px-4 sm:px-6 md:px-8 lg:px-10 max-w-7xl h-16">
        <div className="flex flex-1 items-center">
          <Link href="/" className="hidden md:block mr-6 font-bold text-lg">
            SynthLearn
          </Link>

          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList>
                <NavItems />
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Mobile menu button */}
          <MobileNavigation />

          {/* Mobile logo (centered) */}
          <div className="md:hidden flex flex-1 justify-center">
            <Link href="/" className="font-bold text-lg">
              SynthLearn
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2">
          <div className="block">
            <ModeToggle />
          </div>
          <div className="flex items-center">
            <AuthButtons />
          </div>
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