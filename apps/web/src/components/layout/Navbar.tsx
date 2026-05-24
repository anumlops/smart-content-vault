"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Bookmark, Search, LayoutDashboard, Sun, Moon, LogOut, User } from "lucide-react";
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

interface NavUser {
  username: string;
  name?: string | null;
  email?: string | null;
}

export function Navbar() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<NavUser | null>(null);
  const [loading, setLoading] = useState(true);

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
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
      <div className="flex h-14 items-center px-4 gap-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Bookmark className="h-5 w-5 text-primary" />
          <span className="hidden sm:inline">Archive</span>
        </Link>

        <div className="flex-1" />

        <nav className="flex items-center gap-1">
          <Link href="/search">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Search className="h-4 w-4" />
            </Button>
          </Link>

          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <LayoutDashboard className="h-4 w-4" />
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className={cn("h-4 w-4", theme === "dark" ? "hidden" : "")} />
            <Moon className={cn("h-4 w-4", theme === "light" ? "hidden" : "")} />
          </Button>

          {!loading && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {(user.name ?? user.username).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user.name ?? user.username}</span>
                    {user.email && <span className="text-xs text-muted-foreground">{user.email}</span>}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : !loading ? (
            <Link href="/login">
              <Button variant="default" size="sm">
                Sign in
              </Button>
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
