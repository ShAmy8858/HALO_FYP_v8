import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Upload } from "lucide-react";

export default function AddEditDoctor() {
  const navigate = useNavigate();
  return (
    <div>
      <PageHeader title="Add New Doctor" subtitle="Create a new doctor profile" />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-card p-6 text-center">
          <div className="w-40 h-40 rounded-full border-2 border-dashed border-border mx-auto flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors cursor-pointer">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-label text-muted-foreground">Upload Photo</span>
          </div>
          <h3 className="text-h3 text-foreground mt-4">Doctor Name</h3>
          <p className="text-body text-muted-foreground">Specialty</p>
        </div>
        <div className="lg:col-span-3 bg-card rounded-xl border border-border shadow-card p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label className="text-label text-muted-foreground mb-1.5 block">Full Name *</Label><Input placeholder="Dr. Full Name" /></div>
            <div><Label className="text-label text-muted-foreground mb-1.5 block">Designation *</Label><Input placeholder="MBBS, FCPS" /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label className="text-label text-muted-foreground mb-1.5 block">Specialty *</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select specialty" /></SelectTrigger>
                <SelectContent>{["Cardiology","Dermatology","Orthopedics","Pediatrics","General Medicine","ENT"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-label text-muted-foreground mb-1.5 block">Department *</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>{["Cardiology","Dermatology","Orthopedics","Pediatrics"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label className="text-label text-muted-foreground mb-1.5 block">Consultation Fee (PKR) *</Label><Input type="number" placeholder="2500" /></div>
            <div><Label className="text-label text-muted-foreground mb-1.5 block">Appointment Duration *</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["10 min","15 min","20 min","30 min","45 min","60 min"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div><Label className="text-label text-muted-foreground mb-1.5 block">About / Bio (optional)</Label><Textarea placeholder="Brief bio..." rows={3} maxLength={300} /></div>
          <div className="flex gap-3 pt-2">
            <Button className="bg-primary hover:bg-primary-dark text-primary-foreground" onClick={() => navigate("/hospital/doctors")}>Save Doctor</Button>
            <Button variant="ghost" className="text-muted-foreground" onClick={() => navigate("/hospital/doctors")}>Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
