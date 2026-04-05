import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, Camera } from "lucide-react";

export default function HospitalProfile() {
  return (
    <div>
      <PageHeader title="Profile" subtitle="Manage your profile and preferences" />
      <div className="space-y-6">
        <div className="bg-card rounded-xl border border-border shadow-card p-6">
          <h3 className="text-h3 text-foreground mb-4">Profile Information</h3>
          <div className="flex items-start gap-6">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
                <User className="h-10 w-10 text-primary-foreground" />
              </div>
              <div className="absolute inset-0 rounded-full bg-foreground/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label className="text-label text-muted-foreground mb-1.5 block">Full Name</Label><Input defaultValue="Dr. Ahmed Khan" /></div>
              <div><Label className="text-label text-muted-foreground mb-1.5 block">Email</Label><Input defaultValue="ahmed@hospital.pk" disabled className="bg-muted" /></div>
              <div><Label className="text-label text-muted-foreground mb-1.5 block">Phone</Label><Input defaultValue="+92-321-7654321" /></div>
              <div><Label className="text-label text-muted-foreground mb-1.5 block">Hospital</Label><Input defaultValue="City General Hospital" disabled className="bg-muted" /></div>
            </div>
          </div>
          <Button className="mt-4 bg-primary hover:bg-primary-dark text-primary-foreground">Save Profile</Button>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-card p-6">
          <h3 className="text-h3 text-foreground mb-4">Notification Preferences</h3>
          <div className="space-y-3">
            {["New Booking","Cancellation/Rescheduling","24h Reminders","System Alerts"].map(e => (
              <div key={e} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-body text-foreground">{e}</span>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2"><span className="text-label text-muted-foreground">Email</span><Switch defaultChecked /></div>
                  <div className="flex items-center gap-2"><span className="text-label text-muted-foreground">In-App</span><Switch defaultChecked /></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-card p-6">
          <h3 className="text-h3 text-foreground mb-4">Change Password</h3>
          <div className="space-y-4 max-w-md">
            <div><Label className="text-label text-muted-foreground mb-1.5 block">Current Password</Label><Input type="password" placeholder="••••••••" /></div>
            <div><Label className="text-label text-muted-foreground mb-1.5 block">New Password</Label><Input type="password" placeholder="••••••••" /></div>
            <div><Label className="text-label text-muted-foreground mb-1.5 block">Confirm Password</Label><Input type="password" placeholder="••••••••" /></div>
          </div>
          <Button className="mt-4 bg-primary hover:bg-primary-dark text-primary-foreground">Save Password</Button>
        </div>
      </div>
    </div>
  );
}
