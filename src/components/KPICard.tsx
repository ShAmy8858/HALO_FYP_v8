import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  bgClass?: string;
  subtitle?: string;
}

export function KPICard({ title, value, icon: Icon, trend, bgClass = "bg-kpi-teal-bg", subtitle }: KPICardProps) {
  return (
    <div className={cn("rounded-xl border border-border p-5 shadow-card transition-all duration-200 hover:shadow-card-hover", bgClass)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-label text-muted-foreground">{title}</p>
          <p className="text-kpi text-foreground mt-1">{value}</p>
          {trend && (
            <div className={cn("flex items-center gap-1 mt-2 text-label", trend.positive ? "text-success" : "text-destructive")}>
              {trend.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{trend.value}</span>
            </div>
          )}
          {subtitle && <p className="text-label text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className="rounded-lg bg-card p-2.5 shadow-sm">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
  );
}
