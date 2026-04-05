import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Download, Eye, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

export default function ApplicationDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [decided, setDecided] = useState<"approved" | "rejected" | null>(null);

  if (decided) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in"
          style={{ backgroundColor: decided === "approved" ? "hsl(152 81% 96%)" : "hsl(0 100% 97%)" }}>
          {decided === "approved" ? <CheckCircle2 className="h-10 w-10 text-success" /> : <XCircle className="h-10 w-10 text-destructive" />}
        </div>
        <h2 className="text-h2 text-foreground">Application {decided === "approved" ? "Approved" : "Rejected"}</h2>
        <p className="text-body text-muted-foreground mt-2">The hospital has been notified.</p>
        <Button className="mt-6 bg-primary hover:bg-primary-dark text-primary-foreground" onClick={() => navigate("/admin/applications")}>Back to Applications</Button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => navigate("/admin/applications")} className="flex items-center gap-2 text-body text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Applications
      </button>
      <PageHeader title={`Application ${id || "APP-2024-0042"}`} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left - Details */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-card rounded-xl border border-border shadow-card p-6">
            <h3 className="text-h3 text-foreground mb-4">Organization Details</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                ["Hospital Name", "City General Hospital"],
                ["Facility Type", "General Hospital"],
                ["Address", "123 Main Street, DHA Phase 5"],
                ["City", "Lahore"],
                ["Province", "Punjab"],
                ["Phone", "+92-300-1234567"],
                ["Email", "admin@citygeneral.pk"],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-label text-muted-foreground">{k}</p>
                  <p className="text-body text-foreground font-medium">{v}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-card p-6">
            <h3 className="text-h3 text-foreground mb-4">Hospital Manager Details</h3>
            <div className="grid grid-cols-2 gap-4">
              {[["Name", "Dr. Ahmed Khan"], ["Email", "ahmed@citygeneral.pk"], ["Phone", "+92-321-7654321"]].map(([k, v]) => (
                <div key={k}>
                  <p className="text-label text-muted-foreground">{k}</p>
                  <p className="text-body text-foreground font-medium">{v}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-card p-6">
            <h3 className="text-h3 text-foreground mb-4">Uploaded Documents</h3>
            <div className="space-y-3">
              {["Hospital Registration Certificate.pdf", "Medical License.pdf"].map((doc) => (
                <div key={doc} className="flex items-center justify-between bg-accent rounded-lg p-3">
                  <span className="text-body text-foreground">{doc}</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right - Decision */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border border-border shadow-card p-6 sticky top-[84px]">
            <div className="text-center mb-6">
              <StatusBadge status="under-review" label="Under Review" className="text-sm" />
              <p className="text-label text-muted-foreground mt-2">Submitted Oct 12, 2024</p>
            </div>

            <Button
              className="w-full bg-success hover:bg-success/90 text-success-foreground mb-3"
              onClick={() => setDecided("approved")}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" /> Approve Application
            </Button>

            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-label text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {!showReject ? (
              <Button variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive/5" onClick={() => setShowReject(true)}>
                <XCircle className="h-4 w-4 mr-2" /> Reject Application
              </Button>
            ) : (
              <div className="space-y-3">
                <Textarea
                  placeholder="Rejection reason (min 20 characters)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                />
                <Button
                  className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  disabled={rejectReason.length < 20}
                  onClick={() => setDecided("rejected")}
                >
                  Confirm Rejection
                </Button>
                <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => setShowReject(false)}>Cancel</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
