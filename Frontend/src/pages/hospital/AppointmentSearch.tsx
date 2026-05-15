import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Eye, X } from "lucide-react";

const results = [
  { id: "REF-001", patient: "Ali Hassan", doctor: "Dr. Ahmad", dept: "Cardiology", date: "Oct 15, 2024 09:00 AM", source: "online" as const, status: "confirmed" as const },
  { id: "REF-002", patient: "Fatima Khan", doctor: "Dr. Sara", dept: "Dermatology", date: "Oct 15, 2024 09:30 AM", source: "online" as const, status: "completed" as const },
  { id: "REF-003", patient: "Usman Malik", doctor: "Dr. Ahmad", dept: "Cardiology", date: "Oct 15, 2024 10:00 AM", source: "walk-in" as const, status: "completed" as const },
  { id: "REF-004", patient: "Ayesha Bibi", doctor: "Dr. Faisal", dept: "Orthopedics", date: "Oct 15, 2024 10:30 AM", source: "online" as const, status: "cancelled" as const },
  { id: "REF-005", patient: "Bilal Ahmed", doctor: "Dr. Sara", dept: "Dermatology", date: "Oct 14, 2024 11:00 AM", source: "walk-in" as const, status: "completed" as const },
  { id: "REF-006", patient: "Zara Noor", doctor: "Dr. Ahmad", dept: "Cardiology", date: "Oct 14, 2024 11:30 AM", source: "online" as const, status: "confirmed" as const },
];

export default function AppointmentSearch() {
  return (
    <div>
      <PageHeader title="Search Appointments" subtitle="Search and filter across all appointments">
        <Button variant="outline" className="text-primary border-primary"><Download className="h-4 w-4 mr-2" /> Export CSV</Button>
      </PageHeader>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border shadow-card p-4 mb-6">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by patient name, reference ID, or phone" className="pl-10" />
        </div>
        <div className="flex flex-wrap gap-3">
          <Input type="date" className="w-[160px]" />
          <Input type="date" className="w-[160px]" />
          <Select defaultValue="all-doc"><SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all-doc">All Doctors</SelectItem><SelectItem value="ahmad">Dr. Ahmad</SelectItem><SelectItem value="sara">Dr. Sara</SelectItem></SelectContent>
          </Select>
          <Select defaultValue="all-status"><SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all-status">All Status</SelectItem><SelectItem value="confirmed">Confirmed</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent>
          </Select>
          <Select defaultValue="all-source"><SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all-source">All Sources</SelectItem><SelectItem value="online">Online</SelectItem><SelectItem value="walkin">Walk-in</SelectItem></SelectContent>
          </Select>
          <Button className="bg-primary hover:bg-primary-dark text-primary-foreground">Apply</Button>
          <Button variant="ghost" className="text-muted-foreground">Clear All</Button>
        </div>
        <p className="text-label text-muted-foreground mt-2">Showing {results.length} results</p>
      </div>

      {/* Results */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-x-auto">
        <table className="w-full text-body">
          <thead>
            <tr className="border-b border-border bg-accent/30">
              {["Ref ID", "Patient", "Doctor", "Department", "Date & Time", "Source", "Status", "Actions"].map(h => (
                <th key={h} className="text-left py-3 px-4 text-label text-muted-foreground font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                <td className="py-3 px-4 font-mono text-label text-foreground">{r.id}</td>
                <td className="py-3 px-4 text-foreground font-medium">{r.patient}</td>
                <td className="py-3 px-4 text-muted-foreground">{r.doctor}</td>
                <td className="py-3 px-4 text-muted-foreground">{r.dept}</td>
                <td className="py-3 px-4 text-muted-foreground">{r.date}</td>
                <td className="py-3 px-4"><StatusBadge status={r.source === "online" ? "info" : "warning"} label={r.source === "online" ? "Online" : "Walk-in"} /></td>
                <td className="py-3 px-4"><StatusBadge status={r.status} /></td>
                <td className="py-3 px-4">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm"><Eye className="h-3.5 w-3.5" /></Button>
                    {r.status === "confirmed" && <Button variant="ghost" size="sm" className="text-destructive"><X className="h-3.5 w-3.5" /></Button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
