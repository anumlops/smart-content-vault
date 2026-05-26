"use client";

import Link from "next/link";
import { ThemeProvider } from "next-themes";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { InstallPrompt } from "./InstallPrompt";
import { Plus } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="min-h-screen bg-background">
        <Navbar />
        <Sidebar />
        <main className="lg:pl-64 pt-14 pb-16 lg:pb-6">
          <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
            {children}
          </div>
        </main>
        <div className="hidden lg:block">
          <Link
            href="/content/new"
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors px-6"
          >
            <Plus className="h-5 w-5" />
            <span className="text-sm font-medium">Save Link</span>
          </Link>
        </div>
        <BottomNav />
        <InstallPrompt />
      </div>
    </ThemeProvider>
  );
}
