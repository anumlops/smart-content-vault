"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ContentForm } from "@/components/content/ContentForm";

export default function NewContentPage() {
  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Save Content</h1>
          <p className="text-muted-foreground">
            Paste any link and let AI do the rest
          </p>
        </div>
        <ContentForm />
      </div>
    </DashboardLayout>
  );
}
