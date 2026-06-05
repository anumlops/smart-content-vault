"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Bookmark, Search, Sun, Moon, LogOut, ChevronLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface NavUser {
  username: string;
  name?: string | null;
  email?: string | null;
}

const backRoutes: Record<string, string> = {
  "/content/new": "/dashboard",
  "/search": "/dashboard",
  "/timeline": "/dashboard",
};

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<NavUser | null>(null);
  const [loading, setLoading] = useState(true);

  const showBack = pathname in backRoutes;
  const backUrl = showBack ? backRoutes[pathname] : null;

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-12 md:h-14 items-center px-3 md:px-6 gap-2">
        {showBack ? (
          <button
            onClick={() => router.push(backUrl!)}
            className="flex items-center gap-1 text-sm font-medium text-foreground md:hidden -ml-1 h-8 px-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : null}
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold shrink-0">
          <Bookmark className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          <span className="text-sm md:text-base">Vault</span>
        </Link>

        {showBack && (
          <span className="text-sm font-medium text-foreground truncate ml-1 capitalize hidden md:block">
            {pathname.replace("/", "").replace(/\//g, " \u203A ")}
          </span>
        )}

        <div className="flex-1" />

        <nav className="flex items-center gap-0.5 md:gap-1">
          <Link href="/search">
            <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9" aria-label="Search">
              <Search className="h-4 w-4" />
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:h-9 md:w-9"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            <Sun className={cn("h-4 w-4", theme === "dark" ? "hidden" : "")} />
            <Moon className={cn("h-4 w-4", theme === "light" ? "hidden" : "")} />
          </Button>

          {!loading && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9 rounded-full" aria-label="User menu">
                  <Avatar className="h-6 w-6 md:h-7 md:w-7">
                    <AvatarFallback className="text-[10px] md:text-xs font-medium">
                      {(user.name ?? user.username).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 min-w-[200px]">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm">{user.name ?? user.username}</span>
                    {user.email && <span className="text-xs text-muted-foreground font-normal">{user.email}</span>}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="gap-2 text-sm">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : !loading ? (
            <Link href="/login">
              <Button variant="default" size="sm" className="h-7 md:h-8 text-xs md:text-sm px-3">
                Sign in
              </Button>
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
