"use client";

import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ContentDetail } from "@/components/content/ContentDetail";
import { useContent, useDeleteContent } from "@/hooks/useContent";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
        <div className="space-y-5 w-full max-w-3xl">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="aspect-video rounded-lg" />
          <div className="space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!content) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <h2 className="text-base font-semibold">Content not found</h2>
          <Button variant="link" onClick={() => router.push("/dashboard")}>
            Back to dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-5 w-full max-w-full md:max-w-3xl">
        <Button variant="ghost" onClick={() => router.back()} className="gap-1.5 h-8 text-sm -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <ContentDetail content={content} onDelete={handleDelete} />
      </div>
    </DashboardLayout>
  );
}
