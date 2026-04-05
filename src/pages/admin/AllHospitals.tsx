import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, MoreHorizontal } from "lucide-react";
import { useState } from "react";

const hospitals = [
  { name: "PIMS Hospital", type: "Teaching Hospital", city: "Islamabad", status: "active" as const, plan: "Premium", expiry: "Dec 31, 2024" },
  { name: "CMH Rawalpindi", type: "General Hospital", city: "Rawalpindi", status: "active" as const, plan: "Standard", expiry: "Nov 15, 2024" },
  { name: "Shaukat Khanum", type: "Specialty Clinic", city: "Lahore", status: "active" as const, plan: "Premium", expiry: "Mar 30, 2025" },
  { name: "Aga Khan University", type: "Teaching Hospital", city: "Karachi", status: "active" as const, plan: "Premium", expiry: "Jun 15, 2025" },
  { name: "Test Clinic", type: "Day Care Center", city: "Multan", status: "suspended" as const, plan: "Basic", expiry: "Oct 1, 2024" },
  { name: "Quetta Medical Complex", type: "General Hospital", city: "Quetta", status: "expired" as const, plan: "Standard", expiry: "Sep 30, 2024" },
  { name: "City General Hospital", type: "General Hospital", city: "Lahore", status: "pending" as const, plan: "—", expiry: "—" },
];

export default function AllHospitals() {
  const [search, setSearch] = useState("");
  const filtered = hospitals.filter(h => h.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader title="All Hospitals" subtitle="Manage hospital tenants" />

      <div className="bg-card rounded-xl border border-border shadow-card">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by hospital name" className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-body">
            <thead>
              <tr className="border-b border-border bg-accent/30">
                {["Hospital Name", "Facility Type", "City", "Status", "Plan", "Expiry", "Actions"].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-label text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((h, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                  <td className="py-3 px-4 text-foreground font-medium">{h.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{h.type}</td>
                  <td className="py-3 px-4 text-muted-foreground">{h.city}</td>
                  <td className="py-3 px-4"><StatusBadge status={h.status} /></td>
                  <td className="py-3 px-4 text-foreground">{h.plan}</td>
                  <td className="py-3 px-4 text-muted-foreground">{h.expiry}</td>
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
