"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, BarChart3 } from "lucide-react";

interface InsightsWidgetProps {
  insights: string[];
  topTags: { tag: string; count: number }[];
}

export function InsightsWidget({ insights, topTags }: InsightsWidgetProps) {
  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length > 0 ? (
          <div className="space-y-2">
            {insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <p>{insight}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Save more content to receive personalized AI insights about your interests.
          </p>
        )}

        {topTags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <BarChart3 className="h-4 w-4 text-primary" />
              Top Topics
            </div>
            <div className="flex flex-wrap gap-2">
              {topTags.map((t) => (
                <Badge key={t.tag} variant="secondary" className="text-xs">
                  {t.tag} ({t.count})
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
