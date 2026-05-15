import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const subscriptions = [
  { name: "PIMS Hospital", city: "Islamabad", plan: "Premium", start: "Jan 1, 2024", end: "Dec 31, 2024", days: 80, status: "active" as const },
  { name: "CMH Rawalpindi", city: "Rawalpindi", plan: "Standard", start: "Jun 1, 2024", end: "Nov 15, 2024", days: 34, status: "active" as const },
  { name: "Shaukat Khanum", city: "Lahore", plan: "Premium", start: "Apr 1, 2024", end: "Mar 30, 2025", days: 170, status: "active" as const },
  { name: "Test Clinic", city: "Multan", plan: "Basic", start: "Jul 1, 2024", end: "Oct 1, 2024", days: 0, status: "suspended" as const },
  { name: "Quetta Medical", city: "Quetta", plan: "Standard", start: "Apr 1, 2024", end: "Sep 30, 2024", days: 0, status: "expired" as const },
];

export default function SubscriptionManagement() {
  return (
    <div>
      <PageHeader title="Subscription Management" subtitle="Manage hospital subscription plans" />

      <div className="bg-card rounded-xl border border-border shadow-card">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by hospital name" className="pl-10" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-body">
            <thead>
              <tr className="border-b border-border bg-accent/30">
                {["Hospital", "City", "Plan", "Start", "End", "Days Left", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-label text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((s, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                  <td className="py-3 px-4 text-foreground font-medium">{s.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{s.city}</td>
                  <td className="py-3 px-4 text-foreground">{s.plan}</td>
                  <td className="py-3 px-4 text-muted-foreground">{s.start}</td>
                  <td className="py-3 px-4 text-muted-foreground">{s.end}</td>
                  <td className="py-3 px-4">
                    <span className={cn("font-medium", s.days > 30 ? "text-success" : s.days > 10 ? "text-warning" : "text-destructive")}>
                      {s.days > 0 ? s.days : "—"}
                    </span>
                  </td>
                  <td className="py-3 px-4"><StatusBadge status={s.status} /></td>
                  <td className="py-3 px-4">
                    <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
