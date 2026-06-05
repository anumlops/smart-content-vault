"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchResults } from "@/components/search/SearchResults";
import { useSearch } from "@/hooks/useSearch";
import { cn } from "@/lib/utils";

const searchModes = [
  { key: "hybrid", label: "Hybrid", desc: "Best results" },
  { key: "semantic", label: "Semantic", desc: "By meaning" },
  { key: "keyword", label: "Keyword", desc: "Text match" },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") ?? "";
  const type = searchParams.get("type") ?? "hybrid";

  const { results, total, isLoading } = useSearch(query, type);

  return (
    <DashboardLayout>
      <div className="space-y-5 w-full">
        <div className="page-header">
          <h1 className="page-title">Search</h1>
          <p className="page-subtitle">Search your saved content</p>
        </div>

        <SearchBar initialQuery={query} autoFocus />

        {query && (
          <div className="flex flex-wrap gap-2">
            {searchModes.map((mode) => (
              <button
                key={mode.key}
                onClick={() => router.push(`/search?q=${encodeURIComponent(query)}&type=${mode.key}`)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all touch-manipulation",
                  type === mode.key
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-muted/30 text-muted-foreground border border-border/50 hover:border-border hover:text-foreground"
                )}
              >
                {mode.label}
                {type === mode.key && (
                  <span className="text-[9px] text-muted-foreground ml-0.5">({mode.desc})</span>
                )}
              </button>
            ))}
          </div>
        )}

        <SearchResults results={results} query={query} total={total} loading={isLoading} />
      </div>
    </DashboardLayout>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
