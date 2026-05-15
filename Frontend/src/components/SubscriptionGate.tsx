import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getAccessToken } from "@/lib/api";
import { Check, Upload, CreditCard, Clock, ChevronRight, Smartphone, Building2, Banknote, X, Loader2, ShieldCheck, Hourglass } from "lucide-react";
import type { SubscriptionPlan, PaymentMethod, SubscriptionPayment, SubscriptionTier } from "@/types/api";

type Step = "plans" | "payment" | "pending";

const PLAN_ICONS: Record<string, string> = { STARTER: "🏥", PROFESSIONAL: "🚀", ENTERPRISE: "🏛️" };
const METHOD_ICONS: Record<string, typeof Smartphone> = { easypaisa: Smartphone, jazzcash: Smartphone, hbl: Building2 };

export function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useQuery({
    queryKey: ["subscription-status"],
    queryFn: () => apiRequest<{ subscriptionTier: SubscriptionTier; latestPayment: SubscriptionPayment | null }>("/subscription/status"),
  });

  if (isLoading) return <>{children}</>;

  const tier = data?.subscriptionTier || "TRIAL";
  const payment = data?.latestPayment;

  // If the hospital has a real plan, show the dashboard
  if (tier !== "TRIAL") return <>{children}</>;

  // If there's a pending payment, show "under review" overlay
  if (payment?.status === "PENDING_REVIEW") {
    return (
      <>
        {children}
        <PendingReviewOverlay payment={payment} />
      </>
    );
  }

  // Otherwise show plan selection
  return (
    <>
      {children}
      <PlanSelectionOverlay />
    </>
  );
}

function PendingReviewOverlay({ payment }: { payment: SubscriptionPayment }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(0,20,40,0.75)", backdropFilter: "blur(12px)" }}>
      <div className="bg-white dark:bg-[#162032] rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-fade-in">
        {/* Gradient header */}
        <div className="relative overflow-hidden px-8 pt-8 pb-6" style={{ background: "linear-gradient(135deg, #00ACC1 0%, #1976D2 50%, #0D47A1 100%)" }}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />
          <div className="relative text-center">
            <div className="w-20 h-20 rounded-full bg-white/15 border-2 border-white/30 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Hourglass className="h-9 w-9 text-white animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Payment Under Review</h2>
            <p className="text-white/80 text-sm">Our team is verifying your payment receipt</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/15 dark:to-orange-900/10 rounded-2xl p-5 mb-5 border border-amber-200/50 dark:border-amber-800/30">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plan Selected</span>
                <span className="text-foreground font-bold">{payment.selectedPlan}</span>
              </div>
              {payment.amount && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="text-[#00ACC1] font-bold">PKR {payment.amount.toLocaleString()}</span>
                </div>
              )}
              {payment.paymentMethod && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="text-foreground font-medium">{payment.paymentMethod}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Submitted</span>
                <span className="text-foreground font-medium">{new Date(payment.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-muted-foreground">Status</span>
                <span className="inline-flex items-center gap-1.5 text-amber-600 font-bold text-xs px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> Pending Review
                </span>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="flex items-center justify-center gap-2 mb-5">
            {[
              { label: "Receipt Submitted", done: true },
              { label: "Admin Review", active: true },
              { label: "Plan Activated", done: false },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  s.done ? "bg-green-500 text-white" : s.active ? "bg-amber-500 text-white animate-pulse" : "bg-gray-200 dark:bg-gray-700 text-muted-foreground"
                }`}>
                  {s.done ? <Check className="h-3.5 w-3.5" /> : s.active ? <Clock className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className={`text-[11px] font-medium ${s.done || s.active ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
                {i < 2 && <ChevronRight className="h-3 w-3 text-muted-foreground/50" />}
              </div>
            ))}
          </div>

          <div className="text-center bg-accent/50 rounded-xl p-4">
            <ShieldCheck className="h-5 w-5 text-[#00ACC1] mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground mb-1">Please wait while we verify your payment</p>
            <p className="text-xs text-muted-foreground">
              The HALO admin team will review your payment receipt and activate your plan within <strong className="text-foreground">24–48 hours</strong>. You'll be notified via email once your plan is active.
            </p>
          </div>

          {/* Action to log out / go home */}
          <div className="mt-6 text-center">
            <button 
              onClick={() => {
                // Clear token and go home
                localStorage.removeItem("halo_access_token");
                window.location.href = "/";
              }}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanSelectionOverlay() {
  const [step, setStep] = useState<Step>("plans");
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [bankRef, setBankRef] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: plansData } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: () => apiRequest<{ plans: SubscriptionPlan[]; paymentMethods: PaymentMethod[] }>("/subscription/plans"),
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPlan || !receiptFile) throw new Error("Missing data");
      const formData = new FormData();
      formData.append("receipt", receiptFile);
      formData.append("selectedPlan", selectedPlan.tier);
      formData.append("amount", String(selectedPlan.price));
      if (selectedMethod) formData.append("paymentMethod", selectedMethod.label);
      if (bankRef) formData.append("bankReference", bankRef);

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api"}/subscription/payment`, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
        Authorization: `Bearer ${getAccessToken() || ""}`,
        },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "Upload failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
      setStep("pending");
    },
  });

  const plans = plansData?.plans || [];
  const paymentMethods = plansData?.paymentMethods || [];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto" style={{ background: "rgba(0,30,60,0.65)", backdropFilter: "blur(8px)" }}>
      <div className="bg-white dark:bg-[#162032] rounded-2xl shadow-2xl max-w-5xl w-full my-8 animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00ACC1] to-[#1976D2] flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {step === "plans" && "Choose Your Plan"}
                {step === "payment" && "Complete Payment"}
                {step === "pending" && "Payment Submitted!"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {step === "plans" && "Select a subscription plan to activate your hospital dashboard."}
                {step === "payment" && `${selectedPlan?.name} Plan — PKR ${selectedPlan?.price.toLocaleString()}${selectedPlan?.period}`}
                {step === "pending" && "Your receipt is under review."}
              </p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-4">
            {["Select Plan", "Make Payment", "Confirmation"].map((label, i) => {
              const active = i === (step === "plans" ? 0 : step === "payment" ? 1 : 2);
              const done = (step === "payment" && i === 0) || (step === "pending" && i <= 1);
              return (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${done ? "bg-green-500 text-white" : active ? "bg-[#00ACC1] text-white" : "bg-accent text-muted-foreground"}`}>
                    {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  <span className={`text-xs font-medium ${active || done ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
                  {i < 2 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-8">
          {step === "plans" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
              {plans.map((plan) => (
                <div
                  key={plan.tier}
                  onClick={() => setSelectedPlan(plan)}
                  className={`relative rounded-xl border-2 p-6 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                    selectedPlan?.tier === plan.tier
                      ? "border-[#00ACC1] bg-[#F0FBFD] dark:bg-[#0a2a3a] shadow-lg"
                      : "border-border hover:border-[#00ACC1]/50 bg-card"
                  } ${plan.popular ? "ring-2 ring-[#00ACC1]/20" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#00ACC1] to-[#1976D2] text-white text-xs font-bold">
                      Most Popular
                    </div>
                  )}
                  <div className="text-2xl mb-2">{PLAN_ICONS[plan.tier] || "📦"}</div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{plan.name}</div>
                  <div className="mt-1">
                    <span className="text-2xl font-extrabold text-foreground">PKR {plan.price.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 mb-4">{plan.description}</p>
                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-[#00ACC1] mt-0.5 shrink-0" />
                        <span className="text-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  {selectedPlan?.tier === plan.tier && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#00ACC1] flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {step === "payment" && selectedPlan && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              {/* Payment Methods */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-3">Select Payment Method</h3>
                <div className="space-y-3">
                  {paymentMethods.map((method) => {
                    const Icon = METHOD_ICONS[method.type] || Banknote;
                    return (
                      <div
                        key={method.type}
                        onClick={() => setSelectedMethod(method)}
                        className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${
                          selectedMethod?.type === method.type
                            ? "border-[#00ACC1] bg-[#F0FBFD] dark:bg-[#0a2a3a]"
                            : "border-border hover:border-[#00ACC1]/50 bg-card"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                            <Icon className="h-5 w-5 text-[#00ACC1]" />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-foreground text-sm">{method.label}</div>
                            <div className="text-xs text-muted-foreground">{method.accountTitle}</div>
                          </div>
                          {selectedMethod?.type === method.type && (
                            <div className="w-5 h-5 rounded-full bg-[#00ACC1] flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        {selectedMethod?.type === method.type && (
                          <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Account Title</span>
                              <span className="text-foreground font-medium">{method.accountTitle}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Account / IBAN</span>
                              <span className="text-foreground font-mono text-xs">{method.accountNumber}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Amount</span>
                              <span className="text-[#00ACC1] font-bold">PKR {selectedPlan.price.toLocaleString()}</span>
                            </div>
                            {method.details && (
                              <p className="text-xs text-muted-foreground italic mt-1">{method.details}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Receipt Upload */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-3">Upload Payment Receipt</h3>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all hover:border-[#00ACC1] ${
                    receiptFile ? "border-green-400 bg-green-50 dark:bg-green-900/10" : "border-border"
                  }`}
                >
                  {previewUrl ? (
                    <div className="relative">
                      <img src={previewUrl} alt="Receipt" className="max-h-48 mx-auto rounded-lg shadow-md" />
                      <button
                        onClick={(e) => { e.stopPropagation(); setReceiptFile(null); setPreviewUrl(null); }}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-3">{receiptFile?.name}</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm font-medium text-foreground">Click to upload receipt screenshot</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG, or PDF up to 10MB</p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>

                {/* Bank reference */}
                <div className="mt-4">
                  <label className="text-sm font-medium text-foreground">Transaction Reference (Optional)</label>
                  <input
                    type="text"
                    value={bankRef}
                    onChange={(e) => setBankRef(e.target.value)}
                    placeholder="e.g., TRX-123456"
                    className="mt-1.5 w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-[#00ACC1] focus:border-transparent transition-all"
                  />
                </div>

                {submitMutation.isError && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-600">
                    {(submitMutation.error as Error).message}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === "pending" && (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-5">
                <Check className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Receipt Submitted Successfully!</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                Your payment receipt has been submitted for review. The HALO admin team will verify your payment and activate your <strong>{selectedPlan?.name}</strong> plan within 24-48 hours.
              </p>
              <div className="bg-accent/50 rounded-xl p-4 max-w-sm mx-auto">
                <ShieldCheck className="h-5 w-5 text-[#00ACC1] mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">
                  You will receive an email notification once the admin approves your payment. In the meantime, your dashboard will display the waiting status.
                </p>
              </div>
            </div>
          )}

          {/* Footer actions */}
          {step !== "pending" && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              {step === "payment" ? (
                <button onClick={() => setStep("plans")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  ← Back to Plans
                </button>
              ) : (
                <div />
              )}
              {step === "plans" && (
                <button
                  disabled={!selectedPlan}
                  onClick={() => setStep("payment")}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00ACC1] to-[#1976D2] text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                >
                  Continue to Payment <ChevronRight className="inline h-4 w-4 ml-1" />
                </button>
              )}
              {step === "payment" && (
                <button
                  disabled={!receiptFile || !selectedMethod || submitMutation.isPending}
                  onClick={() => submitMutation.mutate()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00ACC1] to-[#1976D2] text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg transition-all flex items-center gap-2"
                >
                  {submitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Submit Payment Receipt
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
