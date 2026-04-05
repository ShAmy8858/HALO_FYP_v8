import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { CheckCircle2, Clock, Loader2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const stages = [
  { label: "Application Submitted", status: "done" as const },
  { label: "Under Review", status: "current" as const },
  { label: "Decision Made", status: "pending" as const },
  { label: "Activated", status: "pending" as const },
];

export default function ApplicationStatus() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[720px] bg-card rounded-xl border border-border shadow-card p-8 animate-slide-up">
        <h1 className="text-h1 text-foreground text-center">Application Status</h1>
        <div className="flex items-center justify-center gap-3 mt-3">
          <StatusBadge status="info" label="APP-2024-0042" />
          <span className="text-body text-muted-foreground">Submitted Oct 12, 2024</span>
        </div>

        {/* Timeline */}
        <div className="mt-10 ml-4">
          {stages.map((s, i) => (
            <div key={i} className="flex gap-4 pb-8 last:pb-0">
              <div className="flex flex-col items-center">
                {s.status === "done" ? (
                  <CheckCircle2 className="h-6 w-6 text-success shrink-0" />
                ) : s.status === "current" ? (
                  <Loader2 className="h-6 w-6 text-warning animate-spin shrink-0" />
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground/40 shrink-0" />
                )}
                {i < stages.length - 1 && (
                  <div className={cn("w-0.5 flex-1 mt-1", s.status === "done" ? "bg-success" : "bg-muted")} />
                )}
              </div>
              <div>
                <p className={cn("text-body font-medium", s.status === "pending" ? "text-muted-foreground" : "text-foreground")}>
                  {s.label}
                </p>
                {s.status === "current" && (
                  <p className="text-label text-muted-foreground mt-1">Estimated review time: 2-3 business days</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-status-info-bg rounded-lg p-4 text-center">
          <p className="text-body text-foreground">Your application is currently under review.</p>
          <p className="text-label text-muted-foreground mt-1">Contact support@halo.pk for questions.</p>
        </div>

        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={() => navigate("/login")} className="text-muted-foreground">
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
}
