import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";

export default function AdminProfile() {
  return (
    <div>
      <PageHeader title="Profile" subtitle="Manage your account settings" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Profile Card */}
        <div className="bg-card rounded-xl border border-border shadow-card p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
            <User className="h-10 w-10 text-primary-foreground" />
          </div>
          <h3 className="text-h3 text-foreground">Admin User</h3>
          <p className="text-body text-muted-foreground mt-1">admin@halo.pk</p>
          <div className="mt-3">
            <span className="inline-flex items-center rounded-pill px-3 py-1 text-label font-semibold bg-primary text-primary-foreground">
              Administrator
            </span>
          </div>
        </div>

        {/* Right - Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl border border-border shadow-card p-6">
            <h3 className="text-h3 text-foreground mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-label text-muted-foreground mb-1.5 block">Full Name</Label>
                <Input defaultValue="Admin User" />
              </div>
              <div>
                <Label className="text-label text-muted-foreground mb-1.5 block">Email Address</Label>
                <Input defaultValue="admin@halo.pk" disabled className="bg-muted" />
              </div>
            </div>
            <Button className="mt-4 bg-primary hover:bg-primary-dark text-primary-foreground">Save Changes</Button>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-card p-6">
            <h3 className="text-h3 text-foreground mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-label text-muted-foreground mb-1.5 block">Current Password</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div>
                <Label className="text-label text-muted-foreground mb-1.5 block">New Password</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div>
                <Label className="text-label text-muted-foreground mb-1.5 block">Confirm New Password</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
            </div>
            <Button className="mt-4 bg-primary hover:bg-primary-dark text-primary-foreground">Save Password</Button>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-card p-6">
            <h3 className="text-h3 text-foreground mb-4">Account Security</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-label text-muted-foreground">Last Login</p>
                <p className="text-body text-foreground">Oct 15, 2024, 09:34 AM</p>
              </div>
              <div>
                <p className="text-label text-muted-foreground">IP Address</p>
                <p className="text-body text-foreground">192.168.1.100</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
