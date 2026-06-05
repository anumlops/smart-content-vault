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
      <div className="min-h-screen bg-background overflow-x-hidden">
        <Navbar />
        <Sidebar />
        <main className="lg:pl-64 pt-14 pb-20 lg:pb-6 min-h-screen max-w-full">
          <div className="page-container max-w-full overflow-hidden">
            {children}
          </div>
        </main>
        <div className="hidden lg:block">
          <Link
            href="/content/new"
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 h-11 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors px-5 text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Save Link
          </Link>
        </div>
        <BottomNav />
        <InstallPrompt />
      </div>
    </ThemeProvider>
  );
}
