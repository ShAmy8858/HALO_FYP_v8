import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { CheckCircle2, Loader2, Circle, ArrowLeft, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest, ApiClientError } from "@/lib/api";
import type { ApplicationStatus as ApplicationStatusType } from "@/types/api";

export default function ApplicationStatus() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [applicationId, setApplicationId] = useState(params.get("applicationId") || "");
  const [status, setStatus] = useState<{
    applicationId: string;
    hospitalName: string;
    status: ApplicationStatusType;
    submittedAt: string | null;
    reviewedAt: string | null;
    rejectionReason: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const lookupStatus = async () => {
    if (!applicationId.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest<{ application: typeof status }>(`/hospital-applications/status/${applicationId.trim().toUpperCase()}`);
      setStatus(data.application);
    } catch (err) {
      setStatus(null);
      setError(err instanceof ApiClientError ? err.message : "Unable to find application.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (applicationId) {
      void lookupStatus();
    }
  }, []);

  const computedStages = [
    { label: "Application Submitted", desc: "Your application has been received", status: status ? "done" : "pending" },
    { label: "Under Review", desc: "Our team is reviewing your documents", status: status?.status === "SUBMITTED" || status?.status === "UNDER_REVIEW" ? "current" : status?.status === "APPROVED" || status?.status === "REJECTED" ? "done" : "pending" },
    { label: status?.status === "REJECTED" ? "Rejected" : "Decision Made", desc: status?.status === "REJECTED" ? "Your application needs attention" : "A decision has been made", status: status?.status === "APPROVED" || status?.status === "REJECTED" ? "done" : "pending" },
    { label: "Activated", desc: "Your hospital is live on HALO", status: status?.status === "APPROVED" ? "done" : "pending" },
  ] as const;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #e0f7fa 0%, #e8eaf6 40%, #fce4ec 100%)" }}>
      {/* Floating Orbs */}
      <div className="absolute top-[-120px] right-[-80px] w-[350px] h-[350px] rounded-full opacity-30 animate-pulse" style={{ background: "radial-gradient(circle, #00ACC1 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-100px] left-[-60px] w-[300px] h-[300px] rounded-full opacity-25 animate-pulse" style={{ background: "radial-gradient(circle, #1976D2 0%, transparent 70%)", animationDelay: "2s" }} />

      <div className="w-full max-w-[720px] relative z-10">
        {/* Back button */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm font-medium text-[#546E7A] hover:text-[#00ACC1] transition-colors px-3 py-1.5 rounded-lg hover:bg-white/50">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </button>
          <button onClick={() => navigate("/register")} className="flex items-center gap-2 text-sm font-medium text-[#00ACC1] hover:text-[#0097A7] transition-colors px-3 py-1.5 rounded-lg hover:bg-white/50">
            Register Hospital
          </button>
        </div>

        <div className="rounded-3xl border border-white/40 shadow-2xl p-8 animate-slide-up" style={{ background: "rgba(255,255,255,0.78)", backdropFilter: "blur(20px)" }}>
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-3" style={{ background: "linear-gradient(135deg, #00ACC1, #1976D2)" }}>
              <Search className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold" style={{ background: "linear-gradient(135deg, #1a3a5c, #263238)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Application Status</h1>
            <p className="text-sm text-[#78909C] mt-1">Enter your application ID to track your registration progress</p>
          </div>

          {/* Search */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-5">
            <Input
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              placeholder="Enter Application ID (e.g. HALO-XXXXXX)"
              className="max-w-xs bg-white/80 border-white/60 focus:border-[#00ACC1] rounded-xl"
              onKeyDown={(e) => e.key === "Enter" && lookupStatus()}
            />
            <Button
              onClick={lookupStatus}
              disabled={loading}
              className="text-white font-bold rounded-xl px-6 shadow-lg"
              style={{ background: "linear-gradient(135deg, #00ACC1, #1976D2)" }}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              {loading ? "Checking..." : "Check Status"}
            </Button>
          </div>

          {error && (
            <div className="text-center mt-4 p-3 rounded-xl" style={{ background: "rgba(239,83,80,0.08)", border: "1px solid rgba(239,83,80,0.2)" }}>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {status && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <StatusBadge status="info" label={status.applicationId} />
              <span className="text-sm text-[#546E7A] font-medium">{status.hospitalName}</span>
            </div>
          )}

          {/* Timeline */}
          <div className="mt-10 ml-4">
            {computedStages.map((s, i) => (
              <div key={i} className="flex gap-4 pb-8 last:pb-0">
                <div className="flex flex-col items-center">
                  {s.status === "done" ? (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md" style={{ background: "linear-gradient(135deg, #66BB6A, #43A047)" }}>
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                  ) : s.status === "current" ? (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md animate-pulse" style={{ background: "linear-gradient(135deg, #FFB74D, #FF9800)" }}>
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 border-gray-200" style={{ background: "rgba(255,255,255,0.7)" }}>
                      <Circle className="h-4 w-4 text-gray-300" />
                    </div>
                  )}
                  {i < computedStages.length - 1 && (
                    <div className={cn("w-0.5 flex-1 mt-1 rounded-full")} style={{ background: s.status === "done" ? "linear-gradient(180deg, #66BB6A, #43A047)" : "rgba(0,0,0,0.08)" }} />
                  )}
                </div>
                <div>
                  <p className={cn("font-semibold", s.status === "pending" ? "text-[#B0BEC5]" : "text-[#1a3a5c]")}>
                    {s.label}
                  </p>
                  <p className="text-xs text-[#90A4AE] mt-0.5">{s.desc}</p>
                  {s.status === "current" && (
                    <p className="text-xs text-amber-600 font-medium mt-1">⏳ Estimated review time: 2-3 business days</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {status && (
            <div className="mt-8 rounded-2xl p-4 text-center" style={{ background: status.status === "REJECTED" ? "rgba(239,83,80,0.06)" : "rgba(0,172,193,0.06)", border: `1px solid ${status.status === "REJECTED" ? "rgba(239,83,80,0.15)" : "rgba(0,172,193,0.15)"}` }}>
              <p className="text-sm font-medium text-foreground">
                Current status: <strong className={status.status === "REJECTED" ? "text-red-600" : "text-[#00ACC1]"}>{status.status.replace("_", " ").toLowerCase()}</strong>
              </p>
              {status.rejectionReason && <p className="text-sm text-red-600 mt-1">Reason: {status.rejectionReason}</p>}
              <p className="text-xs text-[#90A4AE] mt-1">Contact support@halo.pk for questions.</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Button variant="ghost" onClick={() => navigate("/login")} className="text-[#546E7A] hover:text-[#00ACC1]">
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
