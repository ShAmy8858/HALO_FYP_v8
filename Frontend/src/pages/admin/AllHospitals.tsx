import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, CheckCircle2, PauseCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { Hospital, HospitalStatus } from "@/types/api";

export default function AllHospitals() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<HospitalStatus | "all">("all");
  const { data, refetch } = useQuery({
    queryKey: ["admin-hospitals", status],
    queryFn: () => apiRequest<{ hospitals: Hospital[] }>(`/admin/hospitals?status=${status}`),
  });
  const hospitals = data?.hospitals || [];
  const filtered = hospitals.filter(h => h.name.toLowerCase().includes(search.toLowerCase()) || h.hospitalCode.toLowerCase().includes(search.toLowerCase()));

  const updateStatus = async (hospital: Hospital, nextStatus: HospitalStatus) => {
    await apiRequest(`/admin/hospitals/${hospital.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: nextStatus, reason: "Admin dashboard status update" }),
    });
    await refetch();
  };

  return (
    <div>
      <PageHeader title="All Hospitals" subtitle="Manage hospital tenants" />

      <div className="bg-card rounded-xl border border-border shadow-card">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by hospital name" className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={status} onValueChange={(value) => setStatus(value as HospitalStatus | "all")}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
              <SelectItem value="DEACTIVATED">Deactivated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-body">
            <thead>
              <tr className="border-b border-border bg-accent/30">
                {["Hospital Name", "Hospital ID", "Facility Type", "City", "Status", "Plan", "Activated", "Actions"].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-label text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((h) => (
                <tr key={h.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                  <td className="py-3 px-4 text-foreground font-medium">{h.name}</td>
                  <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{h.hospitalCode}</td>
                  <td className="py-3 px-4 text-muted-foreground">{h.facilityType}</td>
                  <td className="py-3 px-4 text-muted-foreground">{h.city}</td>
                  <td className="py-3 px-4"><StatusBadge status={h.status.toLowerCase() as any} label={h.status} /></td>
                  <td className="py-3 px-4 text-foreground">{h.subscriptionTier}</td>
                  <td className="py-3 px-4 text-muted-foreground">{h.activatedAt ? new Date(h.activatedAt).toLocaleDateString() : "-"}</td>
                  <td className="py-3 px-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {h.status !== "ACTIVE" && (
                          <DropdownMenuItem onClick={() => updateStatus(h, "ACTIVE")}>
                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Activate
                          </DropdownMenuItem>
                        )}
                        {h.status !== "SUSPENDED" && (
                          <DropdownMenuItem onClick={() => updateStatus(h, "SUSPENDED")}>
                            <PauseCircle className="mr-2 h-4 w-4 text-amber-500" /> Suspend
                          </DropdownMenuItem>
                        )}
                        {h.status !== "DEACTIVATED" && (
                          <DropdownMenuItem onClick={() => updateStatus(h, "DEACTIVATED")} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950">
                            <Trash2 className="mr-2 h-4 w-4" /> Deactivate
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
