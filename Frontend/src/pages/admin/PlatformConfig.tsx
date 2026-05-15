import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2, Plus, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import type { EmailTemplate, NotificationLog, PlatformSettings } from "@/types/api";

const plans = [
  { name: "Starter", duration: "Monthly", price: "4,999 PKR", features: "Up to 2 Departments, 500 appointments/month, Basic Analytics" },
  { name: "Professional", duration: "Monthly", price: "14,999 PKR", features: "Up to 10 Departments, 3,000 appointments/month, Advanced Analytics, SMS + Email" },
  { name: "Enterprise", duration: "Monthly", price: "29,999 PKR", features: "Unlimited Departments, Unlimited appointments, BI Dashboards, Priority support" },
];

const templates = ["PASSWORD_RESET", "REGISTRATION_APPROVAL", "REGISTRATION_REJECTION", "HOSPITAL_DEACTIVATED"];

export default function PlatformConfig() {
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [maxUploadSizeMb, setMaxUploadSizeMb] = useState(5);
  const [supportEmail, setSupportEmail] = useState("support@halo.pk");
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [templateSubject, setTemplateSubject] = useState("");
  const [templateBody, setTemplateBody] = useState("");
  const [message, setMessage] = useState("");

  const settingsQuery = useQuery({
    queryKey: ["platform-settings"],
    queryFn: () => apiRequest<{ settings: PlatformSettings }>("/admin/platform-settings"),
  });
  const templateQuery = useQuery({
    queryKey: ["email-template", selectedTemplate],
    queryFn: () => apiRequest<{ template: EmailTemplate }>(`/admin/email-templates/${selectedTemplate}`),
  });
  const failedQuery = useQuery({
    queryKey: ["failed-notifications"],
    queryFn: () => apiRequest<{ notifications: NotificationLog[] }>("/admin/notifications/failed"),
  });

  useEffect(() => {
    const settings = settingsQuery.data?.settings;
    if (settings) {
      setRegistrationEnabled(settings.registrationEnabled);
      setMaxUploadSizeMb(settings.maxUploadSizeMb);
      setSupportEmail(settings.supportEmail);
    }
  }, [settingsQuery.data]);

  useEffect(() => {
    const template = templateQuery.data?.template;
    if (template) {
      setTemplateSubject(template.subject);
      setTemplateBody(template.body);
    }
  }, [templateQuery.data]);

  const saveSettings = async () => {
    await apiRequest("/admin/platform-settings", {
      method: "PATCH",
      body: JSON.stringify({ registrationEnabled, maxUploadSizeMb, supportEmail }),
    });
    setMessage("Platform settings saved.");
    await settingsQuery.refetch();
  };

  const saveTemplate = async () => {
    await apiRequest(`/admin/email-templates/${selectedTemplate}`, {
      method: "PATCH",
      body: JSON.stringify({ subject: templateSubject, body: templateBody }),
    });
    setMessage("Email template saved.");
    await templateQuery.refetch();
  };

  const retryNotification = async (id: string) => {
    await apiRequest(`/admin/notifications/${id}/retry`, { method: "POST" });
    await failedQuery.refetch();
  };

  return (
    <div>
      <PageHeader title="Platform Configuration" subtitle="Manage platform-wide settings" />
      {message && <div className="mb-4 rounded-lg bg-status-success-bg text-success p-3 text-sm">{message}</div>}

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

      {/* Platform Controls */}
      <div className="bg-card rounded-xl border border-border shadow-card p-6 mb-6">
        <h3 className="text-h3 text-foreground mb-4">Onboarding Controls</h3>
        <div className="flex items-center justify-between mb-4">
          <div>
            <Label className="text-body text-foreground">Hospital Registration</Label>
            <p className="text-label text-muted-foreground">When disabled, new hospital applications are blocked at the API.</p>
          </div>
          <Switch checked={registrationEnabled} onCheckedChange={setRegistrationEnabled} />
        </div>
        {!registrationEnabled && (
          <div className="bg-status-warning-bg rounded-lg p-3 mb-4">
            <p className="text-body text-warning font-medium">Hospital registration is disabled.</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-label text-muted-foreground mb-1.5 block">Max Upload Size (MB)</Label>
            <Input type="number" value={maxUploadSizeMb} onChange={(e) => setMaxUploadSizeMb(Number(e.target.value))} />
          </div>
          <div>
            <Label className="text-label text-muted-foreground mb-1.5 block">Support Email</Label>
            <Input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
          </div>
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
        <Input className="mb-3" value={templateSubject} onChange={(e) => setTemplateSubject(e.target.value)} placeholder="Template subject" />
        <Textarea
          className="font-mono text-sm"
          rows={8}
          value={templateBody}
          onChange={(e) => setTemplateBody(e.target.value)}
        />
        <p className="text-label text-muted-foreground mt-2">
          Available variables: {"{patient_name}"}, {"{doctor_name}"}, {"{date}"}, {"{time}"}, {"{reference_id}"}
        </p>
        <div className="flex gap-3 mt-4">
          <Button variant="outline" className="text-primary border-primary"><Eye className="h-4 w-4 mr-2" /> Preview</Button>
          <Button className="bg-primary hover:bg-primary-dark text-primary-foreground" onClick={saveTemplate}>Save Template</Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card p-6 mb-6">
        <h3 className="text-h3 text-foreground mb-4">Failed Notifications</h3>
        <div className="space-y-3">
          {(failedQuery.data?.notifications || []).map((notification) => (
            <div key={notification.id} className="flex items-center justify-between gap-4 rounded-lg bg-accent p-3">
              <div className="min-w-0">
                <p className="text-body text-foreground font-medium truncate">{notification.subject}</p>
                <p className="text-label text-muted-foreground truncate">{notification.recipient} · {notification.lastError || "Delivery failed"}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => retryNotification(notification.id)}>Retry</Button>
            </div>
          ))}
          {failedQuery.data?.notifications?.length === 0 && <p className="text-body text-muted-foreground">No failed notifications.</p>}
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 bg-card border-t border-border p-4 flex justify-end gap-3 -mx-6 -mb-6 rounded-b-xl">
        <Button variant="ghost" className="text-muted-foreground">Reset to Defaults</Button>
        <Button className="bg-primary hover:bg-primary-dark text-primary-foreground" onClick={saveSettings}>Save All Configuration</Button>
      </div>
    </div>
  );
}
