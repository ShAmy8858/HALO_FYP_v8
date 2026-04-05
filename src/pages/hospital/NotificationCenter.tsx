import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Bell, CreditCard, Settings } from "lucide-react";

const notifications = [
  { type: "appointment", title: "New Appointment Booked", msg: "Ali Hassan booked with Dr. Ahmad for Oct 16, 9:00 AM", time: "5 min ago", read: false },
  { type: "appointment", title: "Appointment Cancelled", msg: "Fatima Khan cancelled her appointment on Oct 17", time: "1 hour ago", read: false },
  { type: "system", title: "System Maintenance", msg: "Scheduled maintenance on Oct 20, 2:00-4:00 AM", time: "3 hours ago", read: false },
  { type: "subscription", title: "Plan Expiry Reminder", msg: "Your Standard plan expires in 30 days", time: "1 day ago", read: true },
  { type: "appointment", title: "Walk-in Recorded", msg: "Walk-in patient Usman Malik recorded for Dr. Ahmad", time: "1 day ago", read: true },
  { type: "appointment", title: "Appointment Reminder", msg: "3 appointments scheduled for tomorrow", time: "2 days ago", read: true },
];

const filters = [
  { label: "All Notifications", icon: Bell, count: 6 },
  { label: "Appointments", icon: Calendar, count: 4 },
  { label: "System Alerts", icon: Settings, count: 1 },
  { label: "Subscription", icon: CreditCard, count: 1 },
];

const borderColors: Record<string, string> = { appointment: "border-l-primary", system: "border-l-warning", subscription: "border-l-destructive" };

export default function NotificationCenter() {
  const [filter, setFilter] = useState("All Notifications");
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = filter === "All Notifications" ? notifications :
    notifications.filter(n => n.type === (filter === "Appointments" ? "appointment" : filter === "System Alerts" ? "system" : "subscription"));

  return (
    <div>
      <PageHeader title="Notifications" subtitle="View all system notifications" />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-xl border border-border shadow-card p-4 space-y-1 h-fit">
          {filters.map(f => (
            <button key={f.label} onClick={() => setFilter(f.label)} className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-body transition-all",
              filter === f.label ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-accent"
            )}>
              <div className="flex items-center gap-2"><f.icon className="h-4 w-4" />{f.label}</div>
              <span className="text-label bg-muted rounded-full px-2 py-0.5">{f.count}</span>
            </button>
          ))}
          <div className="pt-3 border-t border-border mt-3">
            <Button variant="ghost" size="sm" className="w-full text-muted-foreground">Mark All as Read</Button>
          </div>
        </div>
        <div className="lg:col-span-3 space-y-2">
          {filtered.map((n, i) => (
            <button key={i} onClick={() => setExpanded(expanded === i ? null : i)} className={cn(
              "w-full text-left bg-card rounded-xl border border-border shadow-card p-4 transition-all hover:shadow-card-hover border-l-4",
              borderColors[n.type], !n.read && "bg-accent/50"
            )}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={cn("text-body", !n.read ? "text-foreground font-semibold" : "text-foreground")}>{n.title}</p>
                  <p className="text-body text-muted-foreground mt-0.5">{n.msg}</p>
                  {expanded === i && n.type === "appointment" && (
                    <Button variant="outline" size="sm" className="mt-3 text-primary border-primary">View Appointment</Button>
                  )}
                </div>
                <span className="text-label text-muted-foreground whitespace-nowrap ml-4">{n.time}</span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 bg-card rounded-xl border border-border shadow-card">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-h3 text-foreground">All caught up!</p>
              <p className="text-body text-muted-foreground">No notifications yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
