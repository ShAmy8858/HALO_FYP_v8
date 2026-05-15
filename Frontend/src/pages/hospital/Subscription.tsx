import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  { name: "Max Doctors", basic: "5", standard: "15", premium: "Unlimited" },
  { name: "Appointments/month", basic: "200", standard: "1,000", premium: "Unlimited" },
  { name: "Analytics Dashboard", basic: false, standard: true, premium: true },
  { name: "Voice Booking", basic: false, standard: false, premium: true },
  { name: "Priority Support", basic: false, standard: false, premium: true },
  { name: "Custom Branding", basic: false, standard: true, premium: true },
];

const history = [
  { plan: "Standard Plan", activated: "Jan 1, 2024", expiry: "Jun 30, 2024", status: "expired" as const, by: "Admin" },
  { plan: "Standard Plan", activated: "Jul 1, 2024", expiry: "Dec 31, 2024", status: "active" as const, by: "Admin" },
];

export default function HospitalSubscription() {
  const daysRemaining = 80;
  const pct = (daysRemaining / 180) * 100;

  return (
    <div>
      <PageHeader title="Subscription & Billing" subtitle="View your plan and billing history" />
      
      <div className="bg-card rounded-xl border border-border shadow-card p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <span className="inline-block bg-primary text-primary-foreground rounded-pill px-4 py-2 text-btn mb-3">Standard Plan</span>
            <div className="space-y-1">
              {["Up to 15 doctors", "1,000 appointments/month", "Analytics Dashboard", "Custom Branding"].map(f => (
                <div key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /><span className="text-body text-foreground">{f}</span></div>
              ))}
            </div>
            <div className="flex gap-4 mt-4 text-body">
              <span className="text-muted-foreground">Start: <span className="text-foreground">Jul 1, 2024</span></span>
              <span className="text-muted-foreground">End: <span className="text-foreground">Dec 31, 2024</span></span>
            </div>
          </div>
          <div className="text-center">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(var(--success))" strokeWidth="3" strokeDasharray={`${pct * 0.88} ${88 - pct * 0.88}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-kpi text-foreground">{daysRemaining}</span>
                <span className="text-label text-muted-foreground">days left</span>
              </div>
            </div>
          </div>
        </div>
        <Button variant="outline" className="mt-4 text-primary border-primary">Request Plan Upgrade</Button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card p-6 mb-6 overflow-x-auto">
        <h3 className="text-h3 text-foreground mb-4">Plan Comparison</h3>
        <table className="w-full text-body">
          <thead><tr className="border-b border-border">
            <th className="text-left py-3 text-label text-muted-foreground font-medium">Feature</th>
            <th className="text-center py-3 text-label text-muted-foreground font-medium">Basic</th>
            <th className="text-center py-3 text-label text-muted-foreground font-medium bg-primary/5">Standard</th>
            <th className="text-center py-3 text-label text-muted-foreground font-medium">Premium</th>
          </tr></thead>
          <tbody>{features.map(f => (
            <tr key={f.name} className="border-b border-border last:border-0">
              <td className="py-3 text-foreground">{f.name}</td>
              {["basic","standard","premium"].map(tier => {
                const v = f[tier as keyof typeof f];
                return (
                  <td key={tier} className={cn("py-3 text-center", tier === "standard" && "bg-primary/5")}>
                    {typeof v === "boolean" ? (v ? <Check className="h-4 w-4 text-success mx-auto" /> : <Minus className="h-4 w-4 text-muted-foreground mx-auto" />) : <span className="text-foreground">{v}</span>}
                  </td>
                );
              })}
            </tr>
          ))}</tbody>
        </table>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card p-6">
        <h3 className="text-h3 text-foreground mb-4">Billing History</h3>
        <table className="w-full text-body">
          <thead><tr className="border-b border-border">
            {["Plan", "Activated", "Expiry", "Status", "Assigned By"].map(h => <th key={h} className="text-left py-3 text-label text-muted-foreground font-medium">{h}</th>)}
          </tr></thead>
          <tbody>{history.map((h, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              <td className="py-3 text-foreground font-medium">{h.plan}</td>
              <td className="py-3 text-muted-foreground">{h.activated}</td>
              <td className="py-3 text-muted-foreground">{h.expiry}</td>
              <td className="py-3"><StatusBadge status={h.status} /></td>
              <td className="py-3 text-muted-foreground">{h.by}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
