"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  className?: string;
}

export function StatsCard({ title, value, icon, description, className }: StatsCardProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-3.5 md:p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] md:text-xs text-muted-foreground font-medium">{title}</p>
            <p className="text-lg md:text-xl lg:text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="h-8 w-8 md:h-9 md:w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
