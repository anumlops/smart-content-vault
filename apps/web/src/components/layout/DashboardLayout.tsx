"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <div className="min-h-screen bg-background">
          <Navbar />
          <Sidebar />
          <main className="lg:pl-64 pt-14">
            <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </ThemeProvider>
    </SessionProvider>
  );
}
