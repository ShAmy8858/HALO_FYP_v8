import { useNavigate } from "react-router-dom";
import { KPICard } from "@/components/KPICard";
import { StatusBadge } from "@/components/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Calendar, MessageSquare, UserPlus, Stethoscope, Search, Clock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const todayAppointments = [
  { time: "09:00 AM", patient: "Ali Hassan", doctor: "Dr. Ahmad", source: "online" as const, status: "confirmed" as const },
  { time: "09:30 AM", patient: "Fatima Khan", doctor: "Dr. Sara", source: "online" as const, status: "confirmed" as const },
  { time: "10:00 AM", patient: "Usman Malik", doctor: "Dr. Ahmad", source: "walk-in" as const, status: "completed" as const },
  { time: "10:30 AM", patient: "Ayesha Bibi", doctor: "Dr. Faisal", source: "online" as const, status: "confirmed" as const },
  { time: "11:00 AM", patient: "Bilal Ahmed", doctor: "Dr. Sara", source: "walk-in" as const, status: "pending" as const },
  { time: "11:30 AM", patient: "Zara Noor", doctor: "Dr. Ahmad", source: "online" as const, status: "confirmed" as const },
];

const reminders = [
  { patient: "Ahmed Raza", time: "2:00 PM", doctor: "Dr. Ahmad", source: "Online" },
  { patient: "Maria Shah", time: "2:30 PM", doctor: "Dr. Sara", source: "Walk-in" },
  { patient: "Hassan Ali", time: "3:00 PM", doctor: "Dr. Faisal", source: "Online" },
  { patient: "Nadia Qureshi", time: "3:30 PM", doctor: "Dr. Ahmad", source: "Online" },
];

export default function HospitalDashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Daily operational overview" />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Today's Appointments" value={28} icon={Calendar} trend={{ value: "+4 vs yesterday", positive: true }} bgClass="bg-kpi-teal-bg" />
        <KPICard title="Online Bookings" value={18} icon={MessageSquare} trend={{ value: "64% of total", positive: true }} bgClass="bg-kpi-green-bg" />
        <KPICard title="Walk-in Bookings" value={10} icon={UserPlus} bgClass="bg-kpi-amber-bg" />
        <KPICard title="Active Doctors Today" value={6} icon={Stethoscope} bgClass="bg-kpi-blue-bg" />
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        {/* Today's Appointments */}
        <div className="lg:col-span-3 bg-card rounded-xl border border-border shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-h3 text-foreground">Today's Appointments</h3>
            <button onClick={() => navigate("/hospital/appointments")} className="text-body text-primary hover:underline">View Full Schedule →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-body">
              <thead>
                <tr className="border-b border-border">
                  {["Time", "Patient", "Doctor", "Source", "Status"].map(h => (
                    <th key={h} className="text-left py-2 text-label text-muted-foreground font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {todayAppointments.map((a, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="py-2.5 text-foreground font-medium">{a.time}</td>
                    <td className="py-2.5 text-foreground">{a.patient}</td>
                    <td className="py-2.5 text-muted-foreground">{a.doctor}</td>
                    <td className="py-2.5"><StatusBadge status={a.source === "online" ? "info" : "warning"} label={a.source === "online" ? "Online" : "Walk-in"} /></td>
                    <td className="py-2.5"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-h3 text-foreground mb-1">Quick Actions</h3>
          {[
            { label: "Add Walk-in", icon: UserPlus, path: "/hospital/walk-ins", color: "bg-primary" },
            { label: "View Schedule", icon: Calendar, path: "/hospital/appointments", color: "bg-info" },
            { label: "Search Appointments", icon: Search, path: "/hospital/appointments/search", color: "bg-primary-dark" },
            { label: "View Reports", icon: Clock, path: "/hospital/reports", color: "bg-secondary" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`w-full ${item.color} text-primary-foreground rounded-xl p-4 flex items-center gap-3 transition-all duration-150 hover:opacity-90 active:scale-[0.98]`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-btn">{item.label}</span>
            </button>
          ))}

          {/* Patient-Facing Website */}
          <a
            href="/hospital.html"
            className="w-full bg-gradient-to-r from-[#0A7EA4] to-[#00C896] text-white rounded-xl p-4 flex items-center gap-3 transition-all duration-150 hover:opacity-90 active:scale-[0.98] no-underline"
          >
            <Globe className="h-5 w-5 shrink-0" />
            <div className="flex flex-col items-start">
              <span className="text-btn leading-tight">View Patient Website</span>
              <span className="text-[11px] opacity-75 leading-tight">HALO City Hospital — AI Booking</span>
            </div>
          </a>
        </div>
      </div>

      {/* Upcoming Reminders */}
      <div className="bg-card rounded-xl border border-border shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-h3 text-foreground">Upcoming Reminders</h3>
          <button className="text-body text-primary hover:underline">View All →</button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {reminders.map((r, i) => (
            <div key={i} className="min-w-[200px] bg-accent rounded-lg p-4 border border-border shrink-0">
              <p className="text-body text-foreground font-medium">{r.patient}</p>
              <p className="text-label text-muted-foreground mt-1">{r.time} • {r.doctor}</p>
              <StatusBadge status={r.source === "Online" ? "info" : "warning"} label={r.source} className="mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
