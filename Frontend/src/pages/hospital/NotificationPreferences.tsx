import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const events = [
  { name: "New Appointment Booked", email: true, inApp: true, locked: false },
  { name: "Appointment Cancelled by Patient", email: true, inApp: true, locked: false },
  { name: "Appointment Rescheduled", email: false, inApp: true, locked: false },
  { name: "24-Hour Appointment Reminder", email: true, inApp: true, locked: false },
  { name: "Walk-in Recorded", email: false, inApp: true, locked: false },
  { name: "Subscription Plan Expiry", email: true, inApp: true, locked: true },
  { name: "New System Alert", email: true, inApp: true, locked: false },
];

export default function NotificationPreferences() {
  return (
    <div className="max-w-[720px] mx-auto">
      <PageHeader title="Notification Preferences" subtitle="Configure which notifications you receive" />
      <div className="bg-card rounded-xl border border-border shadow-card p-6">
        <table className="w-full text-body">
          <thead><tr className="border-b border-border">
            <th className="text-left py-3 text-label text-muted-foreground font-medium">Event</th>
            <th className="text-center py-3 text-label text-muted-foreground font-medium w-20">Email</th>
            <th className="text-center py-3 text-label text-muted-foreground font-medium w-20">In-App</th>
          </tr></thead>
          <tbody>{events.map(e => (
            <tr key={e.name} className="border-b border-border last:border-0">
              <td className="py-4 text-foreground">{e.name}{e.locked && <span className="text-label text-muted-foreground ml-2">(required)</span>}</td>
              <td className="py-4 text-center"><Switch defaultChecked={e.email} disabled={e.locked} /></td>
              <td className="py-4 text-center"><Switch defaultChecked={e.inApp} disabled={e.locked} /></td>
            </tr>
          ))}</tbody>
        </table>
        <Button className="w-full mt-6 bg-primary hover:bg-primary-dark text-primary-foreground" onClick={() => toast.success("Preferences saved successfully")}>
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
