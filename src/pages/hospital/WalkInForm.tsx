import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Printer } from "lucide-react";

const doctorsList = [
  { name: "Dr. Ahmad - Cardiology", value: "ahmad" },
  { name: "Dr. Sara - Dermatology", value: "sara" },
  { name: "Dr. Faisal - Orthopedics", value: "faisal" },
];

const timeSlots = ["09:00 AM – 09:30 AM", "09:30 AM – 10:00 AM", "10:30 AM – 11:00 AM", "11:00 AM – 11:30 AM", "02:00 PM – 02:30 PM", "03:00 PM – 03:30 PM"];

export default function WalkInForm() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [doctor, setDoctor] = useState("");

  if (submitted) {
    return (
      <div className="max-w-[640px] mx-auto text-center py-10">
        <div className="bg-card rounded-xl border border-border shadow-card p-8 animate-slide-up">
          <div className="w-20 h-20 rounded-full bg-status-success-bg flex items-center justify-center mx-auto mb-4 animate-scale-in">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <h2 className="text-h2 text-foreground">Walk-in Recorded</h2>
          <div className="bg-accent rounded-lg p-4 mt-4 text-left space-y-2">
            <div className="flex justify-between"><span className="text-label text-muted-foreground">Doctor</span><span className="text-body text-foreground">Dr. Ahmad</span></div>
            <div className="flex justify-between"><span className="text-label text-muted-foreground">Time</span><span className="text-body text-foreground">10:30 AM – 11:00 AM</span></div>
            <div className="flex justify-between"><span className="text-label text-muted-foreground">Patient</span><span className="text-body text-foreground">Walk-in Patient</span></div>
          </div>
          <p className="text-body text-muted-foreground mt-3 font-mono">WLK-2024-0089</p>
          <div className="flex gap-3 justify-center mt-6">
            <Button variant="outline" className="text-primary border-primary"><Printer className="h-4 w-4 mr-2" /> Print Slip</Button>
            <Button className="bg-primary hover:bg-primary-dark text-primary-foreground" onClick={() => setSubmitted(false)}>Record Another</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[640px] mx-auto">
      <PageHeader title="Record Walk-in Appointment" subtitle={`Today: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`} />

      <div className="bg-card rounded-xl border border-border shadow-card p-6 animate-slide-up">
        <div className="space-y-4">
          <div>
            <Label className="text-label text-muted-foreground mb-1.5 block">Patient Full Name *</Label>
            <Input placeholder="Enter patient name" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-label text-muted-foreground mb-1.5 block">Contact Number *</Label>
              <Input placeholder="+92-XXX-XXXXXXX" />
            </div>
            <div>
              <Label className="text-label text-muted-foreground mb-1.5 block">Age (optional)</Label>
              <Input type="number" placeholder="Age" />
            </div>
          </div>
          <div>
            <Label className="text-label text-muted-foreground mb-1.5 block">Visit Reason (optional)</Label>
            <Textarea placeholder="Brief reason for visit..." rows={2} maxLength={200} />
          </div>
          <div>
            <Label className="text-label text-muted-foreground mb-1.5 block">Select Doctor *</Label>
            <Select value={doctor} onValueChange={setDoctor}>
              <SelectTrigger><SelectValue placeholder="Choose a doctor" /></SelectTrigger>
              <SelectContent>{doctorsList.map(d => <SelectItem key={d.value} value={d.value}>{d.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {doctor && (
            <div>
              <Label className="text-label text-muted-foreground mb-1.5 block">Available Time Slots *</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select time slot" /></SelectTrigger>
                <SelectContent>{timeSlots.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          <Button className="w-full bg-primary hover:bg-primary-dark text-primary-foreground mt-4" onClick={() => setSubmitted(true)}>
            Confirm Walk-in
          </Button>
        </div>
      </div>
    </div>
  );
}
