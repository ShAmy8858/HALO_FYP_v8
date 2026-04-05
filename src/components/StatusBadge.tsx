import { cn } from "@/lib/utils";

type StatusType = "active" | "success" | "confirmed" | "completed" |
  "warning" | "pending" | "under-review" | "walk-in" |
  "danger" | "rejected" | "cancelled" | "suspended" | "expired" |
  "info" | "online";

const statusStyles: Record<StatusType, string> = {
  active: "bg-status-success-bg text-success",
  success: "bg-status-success-bg text-success",
  confirmed: "bg-status-success-bg text-success",
  completed: "bg-status-success-bg text-success",
  warning: "bg-status-warning-bg text-warning",
  pending: "bg-status-warning-bg text-warning",
  "under-review": "bg-status-warning-bg text-warning",
  "walk-in": "bg-status-warning-bg text-warning",
  danger: "bg-status-danger-bg text-destructive",
  rejected: "bg-status-danger-bg text-destructive",
  cancelled: "bg-status-danger-bg text-destructive",
  suspended: "bg-status-danger-bg text-destructive",
  expired: "bg-status-danger-bg text-destructive",
  info: "bg-status-info-bg text-info",
  online: "bg-status-info-bg text-info",
};

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-pill px-3 py-1 text-label font-semibold capitalize",
      statusStyles[status] || statusStyles.info,
      className
    )}>
      {label || status.replace("-", " ")}
    </span>
  );
}
