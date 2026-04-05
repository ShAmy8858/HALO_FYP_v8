import { PageHeader } from "@/components/PageHeader";
import { KPICard } from "@/components/KPICard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Building2, UserPlus, Activity, Download } from "lucide-react";

const topHospitals = [
  { name: "PIMS Hospital", count: 324 },
  { name: "CMH Rawalpindi", count: 287 },
  { name: "Shaukat Khanum", count: 256 },
  { name: "Aga Khan University", count: 234 },
  { name: "Combined Military", count: 198 },
];

export default function AdminAnalytics() {
  return (
    <div>
      <PageHeader title="Platform Analytics" subtitle="Platform-wide analytics and reports">
        <Select defaultValue="30">
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="90">Last 3 Months</SelectItem>
            <SelectItem value="180">Last 6 Months</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="text-primary border-primary"><Download className="h-4 w-4 mr-2" /> Export</Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Appointments" value="4,832" icon={Calendar} trend={{ value: "+18%", positive: true }} bgClass="bg-kpi-teal-bg" />
        <KPICard title="Active Hospitals" value={42} icon={Building2} trend={{ value: "+3", positive: true }} bgClass="bg-kpi-green-bg" />
        <KPICard title="New Registrations" value={8} icon={UserPlus} bgClass="bg-kpi-amber-bg" />
        <KPICard title="Platform Uptime" value="99.8%" icon={Activity} bgClass="bg-kpi-blue-bg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Appointment Volume Chart */}
        <div className="bg-card rounded-xl border border-border shadow-card p-6">
          <h3 className="text-h3 text-foreground mb-4">Appointment Volume Over Time</h3>
          <div className="space-y-3">
            {["Oct 1-7", "Oct 8-14", "Oct 15-21", "Oct 22-28"].map((week, i) => (
              <div key={week} className="flex items-center gap-3">
                <span className="text-label text-muted-foreground w-20">{week}</span>
                <div className="flex-1 flex gap-1">
                  <div className="h-6 bg-primary rounded" style={{ width: `${[45, 52, 60, 65][i]}%` }} />
                  <div className="h-6 bg-primary/30 rounded" style={{ width: `${[15, 18, 20, 22][i]}%` }} />
                </div>
                <span className="text-label text-muted-foreground w-12 text-right">{[180, 210, 240, 260][i]}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-primary" /><span className="text-label text-muted-foreground">Online</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-primary/30" /><span className="text-label text-muted-foreground">Walk-in</span></div>
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="bg-card rounded-xl border border-border shadow-card p-6">
          <h3 className="text-h3 text-foreground mb-4">Subscription Plan Distribution</h3>
          <div className="flex items-center justify-center py-6">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(var(--primary))" strokeWidth="4" strokeDasharray="35 65" strokeDashoffset="0" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(var(--secondary))" strokeWidth="4" strokeDasharray="40 60" strokeDashoffset="-35" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(var(--warning))" strokeWidth="4" strokeDasharray="25 75" strokeDashoffset="-75" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-kpi text-foreground">42</span>
                <span className="text-label text-muted-foreground">Total</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { label: "Premium", count: 15, color: "bg-primary" },
              { label: "Standard", count: 17, color: "bg-secondary" },
              { label: "Basic", count: 10, color: "bg-warning" },
            ].map(p => (
              <div key={p.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${p.color}`} />
                  <span className="text-body text-foreground">{p.label}</span>
                </div>
                <span className="text-body text-muted-foreground">{p.count} ({Math.round(p.count / 42 * 100)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top hospitals */}
      <div className="bg-card rounded-xl border border-border shadow-card p-6">
        <h3 className="text-h3 text-foreground mb-4">Top 5 Hospitals by Appointment Volume</h3>
        <div className="space-y-3">
          {topHospitals.map((h) => (
            <div key={h.name} className="flex items-center gap-4">
              <span className="text-body text-foreground w-40 truncate">{h.name}</span>
              <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                <div className="h-full bg-primary rounded-full animate-bar-fill" style={{ "--bar-width": `${(h.count / 324) * 100}%` } as React.CSSProperties} />
              </div>
              <span className="text-label text-muted-foreground w-10 text-right">{h.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
