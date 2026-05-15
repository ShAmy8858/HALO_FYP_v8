import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, Camera } from "lucide-react";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function HospitalProfile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({ firstName: "", lastName: "", email: "", contactNumber: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        contactNumber: user.contactNumber || "",
      });
    }
  }, [user]);

  const saveProfile = async () => {
    setMessage("");
    setError("");
    try {
      const data = await apiRequest<{ user: typeof user }>("/users/me", {
        method: "PATCH",
        body: JSON.stringify(profile),
      });
      setUser(data.user);
      setMessage("Profile updated.");
    } catch {
      setError("Unable to update profile.");
    }
  };

  const savePassword = async () => {
    setMessage("");
    setError("");
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    try {
      await apiRequest("/auth/change-password", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }),
      });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setMessage("Password changed.");
    } catch {
      setError("Unable to change password. Check your current password.");
    }
  };

  return (
    <div>
      <PageHeader title="Profile" subtitle="Manage your profile and preferences" />
      {(message || error) && (
        <div className={`mb-4 rounded-lg p-3 text-sm ${error ? "bg-destructive/10 text-destructive" : "bg-status-success-bg text-success"}`}>
          {error || message}
        </div>
      )}
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
              <div><Label className="text-label text-muted-foreground mb-1.5 block">First Name</Label><Input value={profile.firstName} onChange={(e) => setProfile((prev) => ({ ...prev, firstName: e.target.value }))} /></div>
              <div><Label className="text-label text-muted-foreground mb-1.5 block">Last Name</Label><Input value={profile.lastName} onChange={(e) => setProfile((prev) => ({ ...prev, lastName: e.target.value }))} /></div>
              <div><Label className="text-label text-muted-foreground mb-1.5 block">Email</Label><Input value={profile.email} onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))} /></div>
              <div><Label className="text-label text-muted-foreground mb-1.5 block">Phone</Label><Input value={profile.contactNumber} onChange={(e) => setProfile((prev) => ({ ...prev, contactNumber: e.target.value }))} /></div>
            </div>
          </div>
          <Button className="mt-4 bg-primary hover:bg-primary-dark text-primary-foreground" onClick={saveProfile}>Save Profile</Button>
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
            <div><Label className="text-label text-muted-foreground mb-1.5 block">Current Password</Label><Input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords((prev) => ({ ...prev, currentPassword: e.target.value }))} placeholder="••••••••" /></div>
            <div><Label className="text-label text-muted-foreground mb-1.5 block">New Password</Label><Input type="password" value={passwords.newPassword} onChange={(e) => setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))} placeholder="••••••••" /></div>
            <div><Label className="text-label text-muted-foreground mb-1.5 block">Confirm Password</Label><Input type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords((prev) => ({ ...prev, confirmPassword: e.target.value }))} placeholder="••••••••" /></div>
          </div>
          <Button className="mt-4 bg-primary hover:bg-primary-dark text-primary-foreground" onClick={savePassword}>Save Password</Button>
        </div>
      </div>
    </div>
  );
}
