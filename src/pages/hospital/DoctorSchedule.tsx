import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const leaveDates = [5, 12, 19, 26];

export default function DoctorSchedule() {
  const [schedule, setSchedule] = useState(days.map((d, i) => ({ day: d, enabled: i < 6, start: "09:00", end: "17:00" })));
  const [selectedMonth] = useState(14);

  return (
    <div>
      <PageHeader title="Doctor Schedule" subtitle="Configure working hours, breaks, and leave" />
      
      <div className="bg-card rounded-xl border border-border shadow-card p-6 mb-6">
        <h3 className="text-h3 text-foreground mb-4">Working Hours</h3>
        <div className="space-y-3">
          {schedule.map((s, i) => (
            <div key={s.day} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
              <span className="text-body text-foreground w-24">{s.day}</span>
              <Switch checked={s.enabled} onCheckedChange={(v) => setSchedule(prev => prev.map((p, idx) => idx === i ? {...p, enabled: v} : p))} />
              <Input type="time" value={s.start} className={cn("w-32", !s.enabled && "opacity-40")} disabled={!s.enabled} onChange={(e) => setSchedule(prev => prev.map((p, idx) => idx === i ? {...p, start: e.target.value} : p))} />
              <span className="text-muted-foreground">to</span>
              <Input type="time" value={s.end} className={cn("w-32", !s.enabled && "opacity-40")} disabled={!s.enabled} onChange={(e) => setSchedule(prev => prev.map((p, idx) => idx === i ? {...p, end: e.target.value} : p))} />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card p-6 mb-6">
        <h3 className="text-h3 text-foreground mb-4">Break Periods</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4 bg-accent rounded-lg p-3">
            <span className="text-body text-foreground w-24">Lunch</span>
            <Input type="time" defaultValue="13:00" className="w-32" />
            <span className="text-muted-foreground">to</span>
            <Input type="time" defaultValue="14:00" className="w-32" />
            <Button variant="ghost" size="sm" className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
          <Button variant="outline" size="sm" className="text-primary border-primary"><Plus className="h-3.5 w-3.5 mr-1" /> Add Break</Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card p-6 mb-6">
        <h3 className="text-h3 text-foreground mb-4">Leave & Holidays</h3>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {["M","T","W","T","F","S","S"].map((d,i) => <span key={i} className="text-label text-muted-foreground py-1">{d}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          <div />
          {Array.from({length: 31}, (_, i) => i + 1).map(day => (
            <button key={day} className={cn(
              "w-8 h-8 rounded-full text-label transition-all",
              leaveDates.includes(day) ? "bg-warning/20 text-warning font-bold" : "hover:bg-accent text-foreground"
            )}>{day}</button>
          ))}
        </div>
        <p className="text-label text-muted-foreground mt-4">Click a date to mark as leave. Changes apply to future bookings only.</p>
      </div>

      <div className="sticky bottom-0 bg-card border-t border-border p-4 flex justify-end gap-3 -mx-6 -mb-6">
        <Button variant="ghost" className="text-muted-foreground">Discard Changes</Button>
        <Button className="bg-primary hover:bg-primary-dark text-primary-foreground">Save Schedule</Button>
      </div>
    </div>
  );
}
