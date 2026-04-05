import { PageHeader } from "@/components/PageHeader";
import { KPICard } from "@/components/KPICard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MessageSquare, UserPlus, XCircle, Download } from "lucide-react";
import { cn } from "@/lib/utils";

const heatmapData = [
  [1,2,4,6,8,7,5,4,3,2,1,0],
  [2,3,5,7,9,8,6,5,4,3,2,1],
  [1,2,4,8,10,9,7,6,5,3,2,1],
  [2,3,6,9,10,8,7,5,4,3,1,0],
  [1,2,5,7,8,7,6,4,3,2,1,0],
  [0,1,2,3,4,3,2,1,0,0,0,0],
  [0,0,1,2,2,1,1,0,0,0,0,0],
];
const dayLabels = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const hourLabels = ["8","9","10","11","12","1","2","3","4","5","6","7"];

export default function HospitalAnalytics() {
  return (
    <div>
      <PageHeader title="Reports & Analytics" subtitle="Hospital performance analytics">
        <Select defaultValue="30"><SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="7">Last 7 Days</SelectItem><SelectItem value="30">Last 30 Days</SelectItem><SelectItem value="90">Last 3 Months</SelectItem></SelectContent></Select>
        <Button variant="outline" className="text-primary border-primary"><Download className="h-4 w-4 mr-2" /> Export</Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Appointments" value={342} icon={Calendar} trend={{ value: "+15%", positive: true }} bgClass="bg-kpi-teal-bg" />
        <KPICard title="Online Bookings" value={218} icon={MessageSquare} bgClass="bg-kpi-green-bg" />
        <KPICard title="Walk-in Bookings" value={124} icon={UserPlus} bgClass="bg-kpi-amber-bg" />
        <KPICard title="Cancellation Rate" value="8.2%" icon={XCircle} trend={{ value: "-2%", positive: true }} bgClass="bg-kpi-blue-bg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-card rounded-xl border border-border shadow-card p-6">
          <h3 className="text-h3 text-foreground mb-4">Daily Appointments</h3>
          {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d,i) => (
            <div key={d} className="flex items-center gap-3 mb-2">
              <span className="text-label text-muted-foreground w-8">{d}</span>
              <div className="flex-1 flex gap-0.5 h-5">
                <div className="bg-primary rounded-l h-full" style={{width:`${[35,40,45,42,38,20,10][i]}%`}} />
                <div className="bg-warning rounded-r h-full" style={{width:`${[15,18,20,17,15,10,5][i]}%`}} />
              </div>
            </div>
          ))}
          <div className="flex gap-4 mt-3"><div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-primary" /><span className="text-label text-muted-foreground">Online</span></div><div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-warning" /><span className="text-label text-muted-foreground">Walk-in</span></div></div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-card p-6">
          <h3 className="text-h3 text-foreground mb-4">Doctor Utilization</h3>
          {[{name:"Dr. Ahmad",count:89},{name:"Dr. Sara",count:72},{name:"Dr. Faisal",count:65},{name:"Dr. Hina",count:58},{name:"Dr. Omar",count:45}].map(d => (
            <div key={d.name} className="flex items-center gap-3 mb-3">
              <span className="text-body text-foreground w-24 truncate">{d.name}</span>
              <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden"><div className="h-full bg-primary rounded-full" style={{width:`${(d.count/89)*100}%`}} /></div>
              <span className="text-label text-muted-foreground w-8 text-right">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border shadow-card p-6">
          <h3 className="text-h3 text-foreground mb-4">Peak Hours Heatmap</h3>
          <div className="overflow-x-auto">
            <div className="flex gap-0.5 mb-1 ml-10">{hourLabels.map(h => <span key={h} className="text-[10px] text-muted-foreground w-7 text-center">{h}</span>)}</div>
            {heatmapData.map((row, ri) => (
              <div key={ri} className="flex items-center gap-0.5 mb-0.5">
                <span className="text-[10px] text-muted-foreground w-8">{dayLabels[ri]}</span>
                {row.map((v, ci) => (
                  <div key={ci} className="w-7 h-6 rounded-sm" style={{backgroundColor: `hsl(193 88% ${95 - v * 6}%)`}} title={`${v} appointments`} />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border shadow-card p-6">
          <h3 className="text-h3 text-foreground mb-4">Status Breakdown</h3>
          <div className="flex justify-center py-6">
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(var(--success))" strokeWidth="4" strokeDasharray="45 55" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(var(--primary))" strokeWidth="4" strokeDasharray="30 70" strokeDashoffset="-45" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(var(--destructive))" strokeWidth="4" strokeDasharray="15 85" strokeDashoffset="-75" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(var(--warning))" strokeWidth="4" strokeDasharray="10 90" strokeDashoffset="-90" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            {[{l:"Completed",c:"bg-success",v:154},{l:"Confirmed",c:"bg-primary",v:102},{l:"Cancelled",c:"bg-destructive",v:52},{l:"Rescheduled",c:"bg-warning",v:34}].map(s => (
              <div key={s.l} className="flex items-center justify-between"><div className="flex items-center gap-2"><div className={cn("w-3 h-3 rounded",s.c)} /><span className="text-body text-foreground">{s.l}</span></div><span className="text-body text-muted-foreground">{s.v}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
