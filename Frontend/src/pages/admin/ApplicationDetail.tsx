import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Download, Eye, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, ApiClientError, getAccessToken } from "@/lib/api";
import type { HospitalApplication, HospitalDocument } from "@/types/api";

export default function ApplicationDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [decided, setDecided] = useState<"approved" | "rejected" | null>(null);
  const [actionError, setActionError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-application", id],
    enabled: Boolean(id),
    queryFn: () => apiRequest<{ application: HospitalApplication; documents: HospitalDocument[] }>(`/admin/applications/${id}`),
  });

  const application = data?.application;
  const documents = data?.documents || [];

  const approve = async () => {
    setSubmitting(true);
    setActionError("");
    try {
      await apiRequest(`/admin/applications/${id}/approve`, { method: "POST" });
      setDecided("approved");
    } catch (error) {
      setActionError(error instanceof ApiClientError ? error.message : "Unable to approve application.");
    } finally {
      setSubmitting(false);
    }
  };

  const reject = async () => {
    setSubmitting(true);
    setActionError("");
    try {
      await apiRequest(`/admin/applications/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason: rejectReason }),
      });
      setDecided("rejected");
    } catch (error) {
      setActionError(error instanceof ApiClientError ? error.message : "Unable to reject application.");
    } finally {
      setSubmitting(false);
    }
  };

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

  if (isLoading || !application) {
    return (
      <div className="py-20 text-center">
        <p className="text-body text-muted-foreground">{isLoading ? "Loading application..." : "Application not found."}</p>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => navigate("/admin/applications")} className="flex items-center gap-2 text-body text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Applications
      </button>
      <PageHeader title={`Application ${application.applicationId}`} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left - Details */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-card rounded-xl border border-border shadow-card p-6">
            <h3 className="text-h3 text-foreground mb-4">Organization Details</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                ["Hospital Name", application.hospitalName],
                ["Facility Type", application.facilityType],
                ["License Number", application.licenseNumber],
                ["Address", application.address || "-"],
                ["City", application.city],
                ["Province", application.province],
                ["Phone", application.phone],
                ["Email", application.businessEmail],
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
              {[
                ["Name", `${application.managerFirstName} ${application.managerLastName}`],
                ["Email", application.managerEmail],
                ["Phone", application.managerContactNumber],
              ].map(([k, v]) => (
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
              {documents.map((doc) => {
                const handleDownload = async () => {
                  try {
                    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";
                    const response = await fetch(`${API_BASE_URL}/admin/documents/${doc.id}/download`, {
                      credentials: "include",
                      headers: { Authorization: `Bearer ${getAccessToken() || ""}` },
                    });
                    if (!response.ok) {
                      const err = await response.json().catch(() => null);
                      alert(err?.error?.message || "Download failed");
                      return;
                    }
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = doc.originalFileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  } catch {
                    alert("Failed to download file.");
                  }
                };

                return (
                  <div key={doc.id} className="flex items-center justify-between bg-accent rounded-lg p-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-body text-foreground truncate">{doc.originalFileName}</span>
                      <span className="text-label text-muted-foreground shrink-0">({(doc.sizeBytes / 1024).toFixed(0)} KB)</span>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {doc.secureUrl ? (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => window.open(doc.secureUrl!, "_blank")} title="View in new tab">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={handleDownload} title="Download file">
                            <Download className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <span className="text-label text-amber-600 flex items-center gap-1" title="File stored in development mode — no cloud URL available">
                          <AlertCircle className="h-3.5 w-3.5" /> Dev mode
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {documents.length === 0 && <p className="text-body text-muted-foreground">No documents uploaded.</p>}
            </div>
          </div>
        </div>

        {/* Right - Decision */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border border-border shadow-card p-6 sticky top-[84px]">
            <div className="text-center mb-6">
              <StatusBadge status={application.status.toLowerCase().replace("_", "-") as any} label={application.status.replace("_", " ")} className="text-sm" />
              <p className="text-label text-muted-foreground mt-2">
                {application.submittedAt ? `Submitted ${new Date(application.submittedAt).toLocaleDateString()}` : "Draft"}
              </p>
            </div>
            {actionError && <p className="text-sm text-destructive mb-3">{actionError}</p>}

            <Button
              className="w-full bg-success hover:bg-success/90 text-success-foreground mb-3"
              disabled={submitting}
              onClick={approve}
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
                  disabled={submitting || rejectReason.length < 10}
                  onClick={reject}
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
