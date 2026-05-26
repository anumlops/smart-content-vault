"use client";

import useSWR from "swr";
import type { SearchResult } from "@shared/index";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useSearch(query: string, type?: string, category?: string) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (type) params.set("type", type);
  if (category) params.set("category", category);

  const { data, error, isLoading } = useSWR<{ results: SearchResult[]; total: number }>(
    query ? `/api/search?${params.toString()}` : null,
    fetcher,
    { keepPreviousData: true }
  );

  return { results: data?.results ?? [], total: data?.total ?? 0, error, isLoading };
}
