"use client";

import useSWR from "swr";
import type { DashboardStats } from "@shared/index";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useDashboard() {
  const { data, error, isLoading, mutate } = useSWR<DashboardStats>(
    "/api/insights/dashboard",
    fetcher
  );
  return { stats: data, error, isLoading, mutate };
}
