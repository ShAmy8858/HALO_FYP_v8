import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { ApplicationStatus, HospitalApplication } from "@/types/api";

export default function PendingApplications() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ApplicationStatus | "all">("all");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-applications", status],
    queryFn: () => apiRequest<{ applications: HospitalApplication[] }>(`/admin/applications?status=${status}`),
  });
  const applications = data?.applications || [];

  const filtered = applications.filter(a =>
    a.hospitalName.toLowerCase().includes(search.toLowerCase()) || a.applicationId.toLowerCase().includes(search.toLowerCase())
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
          <Select value={status} onValueChange={(value) => setStatus(value as ApplicationStatus | "all")}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              <SelectItem value="SUBMITTED">Submitted</SelectItem>
              <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-body text-muted-foreground self-center whitespace-nowrap">{isLoading ? "Loading..." : `Showing ${filtered.length} of ${applications.length}`}</span>
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
                  <td className="py-3 px-4 text-foreground font-mono text-label">{app.applicationId}</td>
                  <td className="py-3 px-4 text-foreground font-medium">{app.hospitalName}</td>
                  <td className="py-3 px-4 text-muted-foreground">{app.facilityType}</td>
                  <td className="py-3 px-4 text-muted-foreground">{app.city}</td>
                  <td className="py-3 px-4 text-muted-foreground">{app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "Draft"}</td>
                  <td className="py-3 px-4"><StatusBadge status={app.status.toLowerCase().replace("_", "-") as any} label={app.status.replace("_", " ")} /></td>
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
