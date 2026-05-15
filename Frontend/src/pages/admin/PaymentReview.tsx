import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Check, X, Eye, CreditCard, Clock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SubscriptionPayment } from "@/types/api";

const PLAN_PRICES: Record<string, number> = { STARTER: 4999, PROFESSIONAL: 14999, ENTERPRISE: 29999 };

export default function PaymentReview() {
  const queryClient = useQueryClient();
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-subscription-payments"],
    queryFn: () => apiRequest<{ payments: SubscriptionPayment[] }>("/subscription/admin/payments"),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, action, notes }: { id: string; action: "APPROVED" | "REJECTED"; notes?: string }) =>
      apiRequest(`/subscription/admin/payments/${id}/review`, {
        method: "POST",
        body: JSON.stringify({ action, adminNotes: notes }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscription-payments"] });
      setReviewingId(null);
      setAdminNotes("");
    },
  });

  const payments = data?.payments || [];
  const pending = payments.filter((p) => p.status === "PENDING_REVIEW");
  const reviewed = payments.filter((p) => p.status !== "PENDING_REVIEW");

  return (
    <div>
      <PageHeader title="Payment Reviews" subtitle="Review subscription payment receipts from hospital managers" />

      {/* Pending Payments */}
      <div className="bg-card rounded-xl border border-border shadow-card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-h3 text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Pending Reviews
          </h3>
          <StatusBadge status="warning" label={`${pending.length} pending`} />
        </div>

        {pending.length === 0 && (
          <p className="text-body text-muted-foreground py-8 text-center">No pending payment reviews.</p>
        )}

        <div className="space-y-4">
          {pending.map((payment) => (
            <div key={payment.id} className="bg-accent/30 rounded-xl border border-border p-5">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Info */}
                <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <p className="text-label text-muted-foreground">Hospital</p>
                    <p className="text-body text-foreground font-medium">{payment.hospitalName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-label text-muted-foreground">Manager</p>
                    <p className="text-body text-foreground">{payment.managerName} {payment.managerLastName}</p>
                    <p className="text-label text-muted-foreground">{payment.managerEmail}</p>
                  </div>
                  <div>
                    <p className="text-label text-muted-foreground">Plan</p>
                    <p className="text-body text-foreground font-bold">{payment.selectedPlan}</p>
                    <p className="text-label text-[#00ACC1] font-medium">PKR {(payment.amount || PLAN_PRICES[payment.selectedPlan] || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-label text-muted-foreground">Submitted</p>
                    <p className="text-body text-foreground">{new Date(payment.createdAt).toLocaleDateString()}</p>
                    {payment.paymentMethod && <p className="text-label text-muted-foreground">via {payment.paymentMethod}</p>}
                    {payment.bankReference && <p className="text-label text-muted-foreground font-mono">Ref: {payment.bankReference}</p>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewingReceipt(payment.receiptUrl)}
                    className="text-[#00ACC1] border-[#00ACC1]"
                  >
                    <Eye className="h-4 w-4 mr-1" /> View Receipt
                  </Button>
                  {reviewingId === payment.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Notes (optional)"
                        className="px-3 py-1.5 rounded-lg border border-border bg-card text-sm w-40"
                      />
                      <Button
                        size="sm"
                        onClick={() => reviewMutation.mutate({ id: payment.id, action: "APPROVED", notes: adminNotes })}
                        disabled={reviewMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => reviewMutation.mutate({ id: payment.id, action: "REJECTED", notes: adminNotes })}
                        disabled={reviewMutation.isPending}
                      >
                        <X className="h-4 w-4 mr-1" /> Reject
                      </Button>
                      <button onClick={() => setReviewingId(null)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                    </div>
                  ) : (
                    <Button size="sm" onClick={() => setReviewingId(payment.id)} className="bg-[#00ACC1] hover:bg-[#0097A7] text-white">
                      <CreditCard className="h-4 w-4 mr-1" /> Review
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviewed History */}
      {reviewed.length > 0 && (
        <div className="bg-card rounded-xl border border-border shadow-card p-5">
          <h3 className="text-h3 text-foreground mb-4">Review History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-body">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-label text-muted-foreground font-medium">Hospital</th>
                  <th className="text-left py-2 text-label text-muted-foreground font-medium">Plan</th>
                  <th className="text-left py-2 text-label text-muted-foreground font-medium">Amount</th>
                  <th className="text-left py-2 text-label text-muted-foreground font-medium">Status</th>
                  <th className="text-left py-2 text-label text-muted-foreground font-medium">Reviewed</th>
                  <th className="text-right py-2 text-label text-muted-foreground font-medium">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {reviewed.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="py-3 text-foreground font-medium">{p.hospitalName || "—"}</td>
                    <td className="py-3 text-foreground">{p.selectedPlan}</td>
                    <td className="py-3 text-foreground">PKR {(p.amount || 0).toLocaleString()}</td>
                    <td className="py-3">
                      <StatusBadge
                        status={p.status === "APPROVED" ? "success" : "danger"}
                        label={p.status === "APPROVED" ? "Approved" : "Rejected"}
                      />
                    </td>
                    <td className="py-3 text-muted-foreground">{p.reviewedAt ? new Date(p.reviewedAt).toLocaleDateString() : "—"}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => setViewingReceipt(p.receiptUrl)} className="text-[#00ACC1] hover:underline text-sm">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Receipt Viewer Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setViewingReceipt(null)}>
          <div className="bg-white dark:bg-[#162032] rounded-2xl shadow-2xl max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Payment Receipt</h3>
              <div className="flex items-center gap-2">
                <a href={viewingReceipt} target="_blank" rel="noopener noreferrer" className="text-[#00ACC1] hover:underline text-sm flex items-center gap-1">
                  <Download className="h-4 w-4" /> Download
                </a>
                <button onClick={() => setViewingReceipt(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="bg-accent/30 rounded-xl p-2 flex items-center justify-center min-h-[300px]">
              <img src={viewingReceipt} alt="Payment receipt" className="max-w-full max-h-[60vh] rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
