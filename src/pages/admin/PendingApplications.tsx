import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useState } from "react";

const applications = [
  { id: "APP-2024-0042", name: "City General Hospital", type: "General Hospital", city: "Lahore", date: "Oct 12, 2024", status: "under-review" as const },
  { id: "APP-2024-0041", name: "Al-Shifa Medical Center", type: "Specialty Clinic", city: "Islamabad", date: "Oct 11, 2024", status: "under-review" as const },
  { id: "APP-2024-0040", name: "Karachi Spine Clinic", type: "Specialty Clinic", city: "Karachi", date: "Oct 10, 2024", status: "under-review" as const },
  { id: "APP-2024-0039", name: "Punjab Care Hospital", type: "Teaching Hospital", city: "Faisalabad", date: "Oct 9, 2024", status: "pending" as const },
  { id: "APP-2024-0038", name: "Quetta Medical Complex", type: "General Hospital", city: "Quetta", date: "Oct 8, 2024", status: "under-review" as const },
];

export default function PendingApplications() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = applications.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Pending Applications" subtitle="Review and process hospital applications" />

      <div className="bg-card rounded-xl border border-border shadow-card">
        {/* Filter bar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by hospital name or application ID" className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pending</SelectItem>
              <SelectItem value="review">Under Review</SelectItem>
              <SelectItem value="hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-body text-muted-foreground self-center whitespace-nowrap">Showing {filtered.length} of {applications.length}</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-body">
            <thead>
              <tr className="border-b border-border bg-accent/30">
                {["Application ID", "Hospital Name", "Facility Type", "City", "Submitted", "Status", "Action"].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-label text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => (
                <tr key={app.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors cursor-pointer" onClick={() => navigate(`/admin/applications/${app.id}`)}>
                  <td className="py-3 px-4 text-foreground font-mono text-label">{app.id}</td>
                  <td className="py-3 px-4 text-foreground font-medium">{app.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{app.type}</td>
                  <td className="py-3 px-4 text-muted-foreground">{app.city}</td>
                  <td className="py-3 px-4 text-muted-foreground">{app.date}</td>
                  <td className="py-3 px-4"><StatusBadge status={app.status} /></td>
                  <td className="py-3 px-4">
                    <Button variant="outline" size="sm" className="text-primary border-primary hover:bg-primary/5">Review</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-h3 text-foreground">All Clear!</p>
            <p className="text-body text-muted-foreground mt-1">No applications pending review.</p>
          </div>
        )}
      </div>
    </div>
  );
}
