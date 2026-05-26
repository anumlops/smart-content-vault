"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SearchBar } from "@/components/search/SearchBar";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentSaves } from "@/components/dashboard/RecentSaves";
import { CategoryCards } from "@/components/dashboard/CategoryCards";
import { TimelineWidget } from "@/components/dashboard/TimelineWidget";

import { CategoryPie } from "@/components/dashboard/CategoryPie";
import { useDashboard } from "@/hooks/useInsights";
import { Bookmark, Tag, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const { stats, isLoading, mutate } = useDashboard();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">{greeting}</h1>
          <p className="text-muted-foreground">Your personal content archive</p>
        </div>

        <SearchBar autoFocus={false} />

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
          <StatsCard title="Total Saves" value={stats?.totalSaves ?? 0} icon={<Bookmark className="h-5 w-5" />} />
          <StatsCard title="Categories" value={Object.keys(stats?.categoryDistribution ?? {}).length} icon={<Tag className="h-5 w-5" />} />
          <StatsCard title="Top Topic" value={stats?.topTags?.[0]?.tag ?? "N/A"} icon={<TrendingUp className="h-5 w-5" />} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <RecentSaves items={stats?.recentSaves ?? []} />
            <CategoryCards distribution={stats?.categoryDistribution ?? {}} />
            <TimelineWidget items={stats?.recentSaves ?? []} />
          </div>
          <div className="space-y-6">
            <CategoryPie data={stats?.categoryDistribution ?? {}} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
