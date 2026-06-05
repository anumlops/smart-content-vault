"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SearchBar } from "@/components/search/SearchBar";
import { QuickSave } from "@/components/search/QuickSave";
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

  const categoryCount = stats?.categoryDistribution ? Object.keys(stats.categoryDistribution).length : 0;

  return (
    <DashboardLayout>
      <div className="space-y-5 md:space-y-6 w-full">
        <div className="page-header">
          <h1 className="page-title">{greeting}</h1>
          <p className="page-subtitle">
            {isLoading ? "\u00a0" : `${stats?.totalSaves ?? 0} saved items in your vault`}
          </p>
        </div>

        <QuickSave onSaved={() => mutate()} />

        <SearchBar autoFocus={false} />

        <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 w-full">
          <StatsCard
            title="Total Saves"
            value={stats?.totalSaves ?? "\u2014"}
            icon={<Bookmark className="h-4 w-4" />}
          />
          <StatsCard
            title="Categories"
            value={categoryCount || "\u2014"}
            icon={<Tag className="h-4 w-4" />}
          />
          <StatsCard
            title="Top Topic"
            value={stats?.topTags?.[0]?.tag ?? "\u2014"}
            icon={<TrendingUp className="h-4 w-4" />}
          />
        </div>

        <div className="grid gap-5 lg:gap-6 lg:grid-cols-3 w-full">
          <div className="lg:col-span-2 space-y-5 w-full">
            <RecentSaves items={stats?.recentSaves ?? []} />
            <CategoryCards distribution={stats?.categoryDistribution ?? {}} />
            <TimelineWidget items={stats?.recentSaves ?? []} />
          </div>
          <div className="space-y-5 w-full">
            <CategoryPie data={stats?.categoryDistribution ?? {}} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
