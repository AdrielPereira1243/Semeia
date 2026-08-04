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
            <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              {title}
            </h3>
          </div>
          <div className={cn("text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white mt-1", statusClass)}>
            {value}
          </div>
        </div>
        {description && (
          <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 truncate font-medium">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
