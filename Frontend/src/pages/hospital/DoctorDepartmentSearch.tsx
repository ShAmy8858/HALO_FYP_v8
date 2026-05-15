import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";

const doctorsData = [
  { name: "Dr. Ahmad Khan", specialty: "Cardiology", dept: "Cardiology", fee: "2,500 PKR", duration: "30 min", available: true },
  { name: "Dr. Sara Malik", specialty: "Dermatology", dept: "Dermatology", fee: "2,000 PKR", duration: "20 min", available: true },
  { name: "Dr. Faisal Iqbal", specialty: "Orthopedics", dept: "Orthopedics", fee: "3,000 PKR", duration: "30 min", available: false },
  { name: "Dr. Hina Shah", specialty: "Pediatrics", dept: "Pediatrics", fee: "1,800 PKR", duration: "20 min", available: true },
  { name: "Dr. Omar Ali", specialty: "General Medicine", dept: "General Medicine", fee: "1,500 PKR", duration: "15 min", available: true },
  { name: "Dr. Nadia Qureshi", specialty: "ENT", dept: "ENT", fee: "2,200 PKR", duration: "20 min", available: false },
];

const specialties = ["All", "Cardiology", "Dermatology", "Orthopedics", "Pediatrics", "General Medicine", "ENT"];

export default function DoctorDepartmentSearch() {
  const [tab, setTab] = useState<"doctors" | "departments">("doctors");
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All");

  const filtered = doctorsData.filter(d =>
    (specialty === "All" || d.specialty === specialty) &&
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Search" subtitle="Find doctors and departments" />

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab("doctors")} className={cn("px-4 py-2 rounded-lg text-btn transition-all", tab === "doctors" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-border")}>Doctors</button>
        <button onClick={() => setTab("departments")} className={cn("px-4 py-2 rounded-lg text-btn transition-all", tab === "departments" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-border")}>Departments</button>
      </div>

      {tab === "doctors" && (
        <>
          <div className="mb-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or specialty" className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {specialties.map(s => (
                <button key={s} onClick={() => setSpecialty(s)} className={cn(
                  "px-3 py-1.5 rounded-pill text-label whitespace-nowrap transition-all",
                  specialty === s ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
                )}>{s}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((d) => (
              <div key={d.name} className="bg-card rounded-xl border border-border shadow-card p-5 hover:shadow-card-hover transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-body text-foreground font-semibold">{d.name}</h4>
                      <span className={cn("w-2 h-2 rounded-full", d.available ? "bg-success" : "bg-destructive")} />
                    </div>
                    <p className="text-label text-muted-foreground">{d.specialty} • {d.dept}</p>
                    <div className="flex items-center gap-4 mt-2 text-label text-muted-foreground">
                      <span>{d.fee}</span>
                      <span>{d.duration}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" className="text-primary border-primary"><Calendar className="h-3 w-3 mr-1" /> Schedule</Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground">Profile</Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "departments" && (
        <div className="bg-card rounded-xl border border-border shadow-card">
          {["Cardiology", "Dermatology", "Orthopedics", "Pediatrics", "General Medicine", "ENT"].map((dept) => (
            <div key={dept} className="flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-accent/30 transition-colors cursor-pointer">
              <div>
                <p className="text-body text-foreground font-medium">{dept}</p>
                <p className="text-label text-muted-foreground">{Math.floor(Math.random() * 4) + 1} doctors assigned</p>
              </div>
              <Button variant="ghost" size="sm" className="text-primary">View →</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
