"use client";

import useSWR from "swr";
import type { SavedContent } from "@shared/index";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useContent(id: string) {
  const { data, error, isLoading, mutate } = useSWR<SavedContent>(
    id ? `/api/content/${id}` : null,
    fetcher
  );
  return { content: data, error, isLoading, mutate };
}

export function useContentList(params?: { category?: string; limit?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set("category", params.category);
  if (params?.limit) searchParams.set("limit", String(params.limit));

  const { data, error, isLoading, mutate } = useSWR<{ items: SavedContent[]; total: number }>(
    `/api/content?${searchParams.toString()}`,
    fetcher
  );
  return { items: data?.items ?? [], total: data?.total ?? 0, error, isLoading, mutate };
}

export function useDeleteContent() {
  const doDelete = async (id: string) => {
    const res = await fetch(`/api/content/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete");
    return res.json();
  };
  return { doDelete };
}
