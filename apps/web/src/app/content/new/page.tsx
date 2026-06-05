"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ContentForm } from "@/components/content/ContentForm";

export default function NewContentPage() {
  return (
    <DashboardLayout>
      <div className="w-full max-w-full md:max-w-xl">
        <div className="page-header">
          <h1 className="page-title">Save Content</h1>
          <p className="page-subtitle">Paste a link and save it instantly</p>
        </div>
        <ContentForm />
      </div>
    </DashboardLayout>
  );
}
