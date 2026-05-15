import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

const doctors = ["All Doctors", "Dr. Ahmad", "Dr. Sara", "Dr. Faisal"];
const hours = Array.from({ length: 12 }, (_, i) => `${(i + 8).toString().padStart(2, "0")}:00`);

const slots: Record<string, { time: string; patient: string; source: "online" | "walk-in"; duration: string }[]> = {
  "Dr. Ahmad": [
    { time: "09:00", patient: "Ali Hassan", source: "online", duration: "30 min" },
    { time: "10:00", patient: "Usman Malik", source: "walk-in", duration: "30 min" },
    { time: "11:30", patient: "Zara Noor", source: "online", duration: "30 min" },
    { time: "14:00", patient: "Ahmed Raza", source: "online", duration: "30 min" },
  ],
  "Dr. Sara": [
    { time: "09:30", patient: "Fatima Khan", source: "online", duration: "30 min" },
    { time: "11:00", patient: "Bilal Ahmed", source: "walk-in", duration: "30 min" },
    { time: "14:30", patient: "Maria Shah", source: "walk-in", duration: "30 min" },
  ],
  "Dr. Faisal": [
    { time: "10:30", patient: "Ayesha Bibi", source: "online", duration: "30 min" },
    { time: "15:00", patient: "Hassan Ali", source: "online", duration: "30 min" },
  ],
};

const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);
const appointmentDays = [3, 7, 10, 12, 15, 18, 22, 25, 28];

export default function DailySchedule() {
  const [selectedDoctor, setSelectedDoctor] = useState("Dr. Ahmad");
  const [selectedDay, setSelectedDay] = useState(15);
  const [detailSlot, setDetailSlot] = useState<string | null>(null);

  const currentSlots = slots[selectedDoctor] || [];

  return (
    <div>
      <PageHeader title="Daily Schedule" subtitle="View appointment schedule by date and doctor" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left - Calendar */}
        <div className="bg-card rounded-xl border border-border shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm"><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-btn text-foreground">October 2024</span>
            <Button variant="ghost" size="sm"><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <span key={i} className="text-label text-muted-foreground py-1">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Offset for October 2024 starting on Tuesday */}
            <div />
            {calendarDays.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "w-8 h-8 rounded-full text-label transition-all relative",
                  selectedDay === day ? "bg-primary text-primary-foreground" : "hover:bg-accent text-foreground",
                )}
              >
                {day}
                {appointmentDays.includes(day) && selectedDay !== day && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>

          <div className="mt-6">
            <label className="text-label text-muted-foreground mb-2 block">Doctor Filter</label>
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{doctors.filter(d => d !== "All Doctors").map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        {/* Right - Timeline */}
        <div className="lg:col-span-3 bg-card rounded-xl border border-border shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm"><ChevronLeft className="h-4 w-4" /></Button>
              <h3 className="text-h3 text-foreground">Tuesday, {selectedDay} October 2024</h3>
              <Button variant="ghost" size="sm"><ChevronRight className="h-4 w-4" /></Button>
            </div>
            <div className="flex gap-2">
              {doctors.filter(d => d !== "All Doctors").map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDoctor(d)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-label transition-all",
                    selectedDoctor === d ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {d} <span className="ml-1 opacity-70">({(slots[d] || []).length})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-0">
            {hours.map(hour => {
              const slot = currentSlots.find(s => s.time === hour);
              return (
                <div key={hour} className="flex gap-4 border-b border-border last:border-0 min-h-[56px]">
                  <span className="text-label text-muted-foreground w-14 py-3 shrink-0">{hour}</span>
                  <div className="flex-1 py-2">
                    {slot ? (
                      <button
                        onClick={() => setDetailSlot(slot.patient)}
                        className={cn(
                          "w-full text-left rounded-lg p-3 transition-all hover:shadow-sm",
                          slot.source === "online" ? "bg-primary/10 border border-primary/20" : "bg-warning/10 border border-warning/20"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-body text-foreground font-medium">{slot.patient}</span>
                          <StatusBadge status={slot.source === "online" ? "info" : "warning"} label={slot.source === "online" ? "Online" : "Walk-in"} />
                        </div>
                        <p className="text-label text-muted-foreground mt-0.5">{slot.duration}</p>
                      </button>
                    ) : (
                      <div className="w-full h-full border border-dashed border-border rounded-lg" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detail Side Panel */}
      {detailSlot && (
        <div className="fixed right-0 top-0 h-screen w-80 bg-card border-l border-border shadow-lg z-40 animate-slide-up p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-h3 text-foreground">Appointment Detail</h3>
            <button onClick={() => setDetailSlot(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
          </div>
          <div className="space-y-4">
            {[["Patient", detailSlot], ["Doctor", selectedDoctor], ["Date", `Oct ${selectedDay}, 2024`], ["Status", "Confirmed"]].map(([k, v]) => (
              <div key={k}>
                <p className="text-label text-muted-foreground">{k}</p>
                <p className="text-body text-foreground font-medium">{v}</p>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-8 border-destructive text-destructive hover:bg-destructive/5">Cancel Appointment</Button>
        </div>
      )}
    </div>
  );
}
