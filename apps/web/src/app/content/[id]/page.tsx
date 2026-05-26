"use client";

import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ContentDetail } from "@/components/content/ContentDetail";
import { ContentCard } from "@/components/content/ContentCard";
import { useContent, useDeleteContent } from "@/hooks/useContent";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { SavedContent } from "@shared/index";

export default function ContentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { content, isLoading } = useContent(id);
  const { doDelete } = useDeleteContent();

  async function handleDelete() {
    try {
      await doDelete(id);
      toast({ title: "Content deleted" });
      router.push("/dashboard");
    } catch {
      toast({ variant: "destructive", title: "Failed to delete" });
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="aspect-video rounded-xl" />
          <div className="space-y-3">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!content) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto text-center py-16">
          <h2 className="text-xl font-semibold">Content not found</h2>
          <Button variant="link" onClick={() => router.push("/dashboard")}>
            Back to dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <ContentDetail content={content} onDelete={handleDelete} />
      </div>
    </DashboardLayout>
  );
}
