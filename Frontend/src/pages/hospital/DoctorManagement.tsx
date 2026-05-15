import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Pencil, ToggleLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const doctors = [
  { name: "Dr. Ahmad Khan", specialty: "Cardiology", dept: "Cardiology", fee: "2,500 PKR", interval: "30 min", status: "active" as const, available: true },
  { name: "Dr. Sara Malik", specialty: "Dermatology", dept: "Dermatology", fee: "2,000 PKR", interval: "20 min", status: "active" as const, available: true },
  { name: "Dr. Faisal Iqbal", specialty: "Orthopedics", dept: "Orthopedics", fee: "3,000 PKR", interval: "30 min", status: "active" as const, available: false },
  { name: "Dr. Hina Shah", specialty: "Pediatrics", dept: "Pediatrics", fee: "1,800 PKR", interval: "20 min", status: "active" as const, available: true },
];

export default function DoctorManagement() {
  const navigate = useNavigate();
  return (
    <div>
      <PageHeader title="Doctors" subtitle="Manage all doctors">
        <Button className="bg-primary hover:bg-primary-dark text-primary-foreground" onClick={() => navigate("/hospital/doctors/new")}>+ Add New Doctor</Button>
      </PageHeader>
      <div className="bg-card rounded-xl border border-border shadow-card">
        <div className="p-4 border-b border-border">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search by name or specialty" className="pl-10" /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-body">
            <thead><tr className="border-b border-border bg-accent/30">
              {["Doctor", "Specialty", "Department", "Fee", "Interval", "Status", "Today", "Actions"].map(h => <th key={h} className="text-left py-3 px-4 text-label text-muted-foreground font-medium">{h}</th>)}
            </tr></thead>
            <tbody>{doctors.map((d, i) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                <td className="py-3 px-4 text-foreground font-medium">{d.name}</td>
                <td className="py-3 px-4 text-muted-foreground">{d.specialty}</td>
                <td className="py-3 px-4 text-muted-foreground">{d.dept}</td>
                <td className="py-3 px-4 text-foreground">{d.fee}</td>
                <td className="py-3 px-4 text-muted-foreground">{d.interval}</td>
                <td className="py-3 px-4"><StatusBadge status={d.status} /></td>
                <td className="py-3 px-4"><StatusBadge status={d.available ? "success" : "danger"} label={d.available ? "Available" : "Unavailable"} /></td>
                <td className="py-3 px-4"><div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => navigate("/hospital/doctors/edit")}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm"><ToggleLeft className="h-3.5 w-3.5" /></Button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
