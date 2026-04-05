import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const initialDepts = [
  { name: "Cardiology", doctors: 2 },
  { name: "Dermatology", doctors: 1 },
  { name: "Orthopedics", doctors: 1 },
  { name: "Pediatrics", doctors: 1 },
  { name: "General Medicine", doctors: 1 },
  { name: "ENT", doctors: 1 },
];

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState(initialDepts);
  const [newDept, setNewDept] = useState("");

  const addDept = () => {
    if (!newDept.trim()) return;
    setDepartments(prev => [...prev, { name: newDept, doctors: 0 }]);
    setNewDept("");
    toast.success("Department added successfully");
  };

  return (
    <div>
      <PageHeader title="Departments" subtitle="Manage hospital departments" />
      <div className="flex gap-4 mb-4 text-body">
        <span className="text-foreground">Total Departments: <strong>{departments.length}</strong></span>
        <span className="text-foreground">Total Doctors: <strong>{departments.reduce((a, d) => a + d.doctors, 0)}</strong></span>
      </div>
      <div className="bg-card rounded-xl border border-border shadow-card">
        <table className="w-full text-body">
          <thead><tr className="border-b border-border bg-accent/30">
            {["Department Name", "Doctors Assigned", "Actions"].map(h => <th key={h} className="text-left py-3 px-4 text-label text-muted-foreground font-medium">{h}</th>)}
          </tr></thead>
          <tbody>{departments.map((d) => (
            <tr key={d.name} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors animate-fade-in">
              <td className="py-3 px-4 text-foreground font-medium">{d.name}</td>
              <td className="py-3 px-4 text-muted-foreground">{d.doctors}</td>
              <td className="py-3 px-4"><div className="flex gap-1">
                <Button variant="ghost" size="sm"><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="sm" className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div></td>
            </tr>
          ))}</tbody>
        </table>
        <div className="p-4 border-t border-border flex gap-3">
          <Input placeholder="New Department Name" value={newDept} onChange={(e) => setNewDept(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addDept()} />
          <Button className="bg-primary hover:bg-primary-dark text-primary-foreground shrink-0" onClick={addDept}>Add Department</Button>
        </div>
      </div>
    </div>
  );
}
