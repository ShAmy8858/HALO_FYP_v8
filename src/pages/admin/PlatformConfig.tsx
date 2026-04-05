import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2, Plus, Eye } from "lucide-react";
import { useState } from "react";

const plans = [
  { name: "Basic", duration: "1 Month", price: "5,000 PKR", features: "Up to 5 doctors, 200 appointments/month" },
  { name: "Standard", duration: "6 Months", price: "25,000 PKR", features: "Up to 15 doctors, 1000 appointments/month, Analytics" },
  { name: "Premium", duration: "12 Months", price: "45,000 PKR", features: "Unlimited doctors, Unlimited appointments, Priority support" },
];

const templates = ["Booking Confirmation", "Cancellation", "Reminder", "Registration Approval", "Rejection"];

export default function PlatformConfig() {
  const [maintenance, setMaintenance] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);

  return (
    <div>
      <PageHeader title="Platform Configuration" subtitle="Manage platform-wide settings" />

      {/* Subscription Plans */}
      <div className="bg-card rounded-xl border border-border shadow-card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-h3 text-foreground">Subscription Plans</h3>
          <Button size="sm" className="bg-primary hover:bg-primary-dark text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" /> Add New Plan
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-body">
            <thead>
              <tr className="border-b border-border">
                {["Name", "Duration", "Price", "Features", "Actions"].map(h => (
                  <th key={h} className="text-left py-3 text-label text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.name} className="border-b border-border last:border-0">
                  <td className="py-3 text-foreground font-medium">{p.name}</td>
                  <td className="py-3 text-muted-foreground">{p.duration}</td>
                  <td className="py-3 text-foreground">{p.price}</td>
                  <td className="py-3 text-muted-foreground">{p.features}</td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm"><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="sm" className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Maintenance */}
      <div className="bg-card rounded-xl border border-border shadow-card p-6 mb-6">
        <h3 className="text-h3 text-foreground mb-4">Platform Maintenance</h3>
        <div className="flex items-center justify-between mb-4">
          <div>
            <Label className="text-body text-foreground">Maintenance Mode</Label>
            <p className="text-label text-muted-foreground">When enabled, patients and managers will see a maintenance message.</p>
          </div>
          <Switch checked={maintenance} onCheckedChange={setMaintenance} />
        </div>
        {maintenance && (
          <div className="bg-status-warning-bg rounded-lg p-3 mb-4">
            <p className="text-body text-warning font-medium">⚠ Maintenance mode is enabled</p>
          </div>
        )}
        <div>
          <Label className="text-label text-muted-foreground mb-1.5 block">Maintenance Message</Label>
          <Input defaultValue="The platform is currently undergoing scheduled maintenance. Please try again later." />
        </div>
      </div>

      {/* Email Templates */}
      <div className="bg-card rounded-xl border border-border shadow-card p-6 mb-6">
        <h3 className="text-h3 text-foreground mb-4">Email Template Editor</h3>
        <div className="mb-4">
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger className="w-[280px]"><SelectValue /></SelectTrigger>
            <SelectContent>{templates.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Textarea
          className="font-mono text-sm"
          rows={8}
          defaultValue={`<h2>Appointment Confirmed</h2>\n<p>Dear {patient_name},</p>\n<p>Your appointment with Dr. {doctor_name} is confirmed.</p>\n<p>Date: {date} | Time: {time}</p>\n<p>Reference: {reference_id}</p>`}
        />
        <p className="text-label text-muted-foreground mt-2">
          Available variables: {"{patient_name}"}, {"{doctor_name}"}, {"{date}"}, {"{time}"}, {"{reference_id}"}
        </p>
        <div className="flex gap-3 mt-4">
          <Button variant="outline" className="text-primary border-primary"><Eye className="h-4 w-4 mr-2" /> Preview</Button>
          <Button className="bg-primary hover:bg-primary-dark text-primary-foreground">Save Template</Button>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 bg-card border-t border-border p-4 flex justify-end gap-3 -mx-6 -mb-6 rounded-b-xl">
        <Button variant="ghost" className="text-muted-foreground">Reset to Defaults</Button>
        <Button className="bg-primary hover:bg-primary-dark text-primary-foreground">Save All Configuration</Button>
      </div>
    </div>
  );
}
