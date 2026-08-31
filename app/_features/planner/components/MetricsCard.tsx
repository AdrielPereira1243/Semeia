import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  statusClass?: string;
}

export function MetricsCard({
  title,
  value,
  description,
  icon,
  className,
  statusClass,
}: MetricsCardProps) {
  return (
    <Card className={cn("flex flex-col justify-between overflow-hidden", className)}>
      <CardContent className="p-5 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center gap-3 mb-3">
            {icon && (
              <div className="size-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                {icon}
              </div>
            )}
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {title}
            </h3>
          </div>
          <div className={cn("mt-1 text-2xl font-extrabold text-foreground sm:text-3xl", statusClass)}>
            {value}
          </div>
        </div>
        {description && (
          <p className="mt-3 truncate text-xs font-medium text-muted-foreground">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
