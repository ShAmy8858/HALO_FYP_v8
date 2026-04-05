import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Upload, X, ArrowLeft, ArrowRight, Copy, Eye, EyeOff, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";

const facilityTypes = ["General Hospital", "Specialty Clinic", "Teaching Hospital", "Day Care Center", "Rehabilitation Center"];
const cities = ["Islamabad", "Lahore", "Karachi", "Peshawar", "Quetta", "Rawalpindi", "Faisalabad", "Multan"];
const provinces = ["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "ICT"];

function getPasswordStrength(pwd: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#EF5350", "#FF9800", "#66BB6A", "#00ACC1"];
  return { score, label: labels[score] || "", color: colors[score] || "" };
}

export default function HospitalRegistration() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    // Hospital Info
    name: "", facilityType: "", address: "", city: "", province: "", postalCode: "",
    phone: "", email: "", description: "",
    // Manager Credentials
    managerName: "", managerEmail: "", managerUsername: "", managerPhone: "",
    managerPassword: "", managerConfirmPassword: "",
  });
  const [docs, setDocs] = useState<{ name: string; type: string }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateForm = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => { const e = { ...prev }; delete e[key]; return e; });
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.name) e.name = "Hospital name is required";
    if (!form.facilityType) e.facilityType = "Please select a facility type";
    if (!form.address) e.address = "Address is required";
    if (!form.city) e.city = "City is required";
    if (!form.phone) e.phone = "Phone is required";
    if (!form.email) e.email = "Hospital email is required";
    if (!form.managerName) e.managerName = "Manager name is required";
    if (!form.managerEmail) e.managerEmail = "Manager email is required";
    if (!form.managerUsername) e.managerUsername = "Username is required";
    if (!form.managerPassword) e.managerPassword = "Password is required";
    if (form.managerPassword && form.managerPassword.length < 8) e.managerPassword = "Password must be at least 8 characters";
    if (form.managerPassword !== form.managerConfirmPassword) e.managerConfirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    setStep(step + 1);
  };

  const handleSubmit = () => {
    // Save manager credentials to localStorage for login
    const existing = JSON.parse(localStorage.getItem("halo_registered_managers") || "[]");
    existing.push({
      email: form.managerEmail,
      username: form.managerUsername,
      password: form.managerPassword,
      managerName: form.managerName,
      hospitalName: form.name,
    });
    localStorage.setItem("halo_registered_managers", JSON.stringify(existing));
    setSubmitted(true);
  };

  const strength = getPasswordStrength(form.managerPassword);

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-[720px] bg-card rounded-xl border border-border shadow-card p-8 text-center animate-slide-up">
          <div className="w-20 h-20 rounded-full bg-status-success-bg flex items-center justify-center mx-auto mb-4 animate-scale-in">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <h2 className="text-h2 text-foreground font-bold text-2xl mb-2">Application Submitted Successfully</h2>
          <div className="mt-4 bg-muted rounded-lg p-4 inline-flex items-center gap-3">
            <span className="text-h3 text-foreground font-mono text-xl">APP-2024-0042</span>
            <button className="text-primary hover:text-primary-dark"><Copy className="h-4 w-4" /></button>
          </div>
          <div className="mt-4 p-4 bg-accent rounded-lg text-left">
            <p className="text-sm font-semibold text-foreground mb-2">Manager Login Credentials Created:</p>
            <p className="text-sm text-muted-foreground">Email: <strong className="text-primary">{form.managerEmail}</strong></p>
            <p className="text-sm text-muted-foreground">Username: <strong className="text-primary">{form.managerUsername}</strong></p>
            <p className="text-sm text-muted-foreground mt-1 text-xs">Save these credentials — they'll be used to sign in to your hospital dashboard after approval.</p>
          </div>
          <p className="text-body text-muted-foreground mt-4">You will be notified via email when your application is reviewed.</p>
          <div className="flex gap-3 justify-center mt-6">
            <Button className="bg-primary hover:bg-primary-dark text-primary-foreground" onClick={() => navigate("/application-status")}>
              Track Application Status
            </Button>
            <Button variant="outline" onClick={() => navigate("/login")}>
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[760px] animate-slide-up">
        {/* Back to landing */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" /><path d="M12 8v8M8 12h8" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-foreground tracking-wide">HALO</span>
            <span className="text-[10px] font-bold text-white bg-primary px-1.5 py-0.5 rounded" style={{ verticalAlign: "super" }}>AI</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Hospital Registration</h1>
          <p className="text-sm text-muted-foreground mt-1">Register your hospital and create manager login credentials</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-8">
          {[{ label: "Hospital Info" }, { label: "Documents" }, { label: "Review" }].map((s, i) => {
            const n = i + 1;
            return (
              <div key={n} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all",
                    step > n ? "bg-success text-white" :
                    step === n ? "bg-primary text-white shadow-lg" : "bg-muted text-muted-foreground"
                  )}>
                    {step > n ? <CheckCircle2 className="h-5 w-5" /> : n}
                  </div>
                  <span className={cn("text-xs font-medium hidden sm:block", step === n ? "text-primary" : "text-muted-foreground")}>{s.label}</span>
                </div>
                {i < 2 && <div className={cn("w-16 sm:w-24 h-0.5 mx-2 mb-4", step > n ? "bg-success" : "bg-muted")} />}
              </div>
            );
          })}
        </div>

        <div className="bg-card rounded-xl border border-border shadow-card p-6 sm:p-8">
          {/* ── STEP 1: Hospital Info + Manager Credentials ── */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Hospital Details */}
              <div>
                <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">🏥</span>
                  Hospital Information
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-label text-muted-foreground mb-1.5 block">Hospital Official Name *</Label>
                      <Input value={form.name} onChange={(e) => updateForm("name", e.target.value)} placeholder="Enter hospital name" className={errors.name ? "border-destructive" : ""} />
                      {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <Label className="text-label text-muted-foreground mb-1.5 block">Facility Type *</Label>
                      <Select value={form.facilityType} onValueChange={(v) => updateForm("facilityType", v)}>
                        <SelectTrigger className={errors.facilityType ? "border-destructive" : ""}><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>{facilityTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                      {errors.facilityType && <p className="text-xs text-destructive mt-1">{errors.facilityType}</p>}
                    </div>
                  </div>
                  <div>
                    <Label className="text-label text-muted-foreground mb-1.5 block">Street Address *</Label>
                    <Input value={form.address} onChange={(e) => updateForm("address", e.target.value)} placeholder="Enter street address" className={errors.address ? "border-destructive" : ""} />
                    {errors.address && <p className="text-xs text-destructive mt-1">{errors.address}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-label text-muted-foreground mb-1.5 block">City *</Label>
                      <Select value={form.city} onValueChange={(v) => updateForm("city", v)}>
                        <SelectTrigger className={errors.city ? "border-destructive" : ""}><SelectValue placeholder="Select city" /></SelectTrigger>
                        <SelectContent>{cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                      {errors.city && <p className="text-xs text-destructive mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <Label className="text-label text-muted-foreground mb-1.5 block">Province</Label>
                      <Select value={form.province} onValueChange={(v) => updateForm("province", v)}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{provinces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-label text-muted-foreground mb-1.5 block">Postal Code</Label>
                      <Input value={form.postalCode} onChange={(e) => updateForm("postalCode", e.target.value)} placeholder="44000" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-label text-muted-foreground mb-1.5 block">Primary Contact Phone *</Label>
                      <Input value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} placeholder="+92-XXX-XXXXXXX" className={errors.phone ? "border-destructive" : ""} />
                      {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                      <Label className="text-label text-muted-foreground mb-1.5 block">Official Hospital Email *</Label>
                      <Input type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} placeholder="info@hospital.com" className={errors.email ? "border-destructive" : ""} />
                      {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                    </div>
                  </div>
                  <div>
                    <Label className="text-label text-muted-foreground mb-1.5 block">Brief Description (optional)</Label>
                    <Textarea value={form.description} onChange={(e) => updateForm("description", e.target.value.slice(0, 300))} placeholder="Briefly describe your hospital..." rows={3} />
                    <p className="text-label text-muted-foreground mt-1 text-right">{form.description.length}/300</p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-border pt-6">
                <h3 className="text-base font-bold text-foreground mb-1 flex items-center gap-2">
                  <UserCog className="h-5 w-5 text-primary" />
                  Hospital Manager Credentials
                </h3>
                <p className="text-xs text-muted-foreground mb-4">These credentials will be used to sign in to the hospital manager dashboard after your application is approved.</p>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-label text-muted-foreground mb-1.5 block">Manager Full Name *</Label>
                      <Input value={form.managerName} onChange={(e) => updateForm("managerName", e.target.value)} placeholder="Dr. Ahmad Khan" className={errors.managerName ? "border-destructive" : ""} />
                      {errors.managerName && <p className="text-xs text-destructive mt-1">{errors.managerName}</p>}
                    </div>
                    <div>
                      <Label className="text-label text-muted-foreground mb-1.5 block">Manager Phone</Label>
                      <Input value={form.managerPhone} onChange={(e) => updateForm("managerPhone", e.target.value)} placeholder="+92-XXX-XXXXXXX" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-label text-muted-foreground mb-1.5 block">Manager Email * <span className="text-[10px] text-primary">(login identifier)</span></Label>
                      <Input type="email" value={form.managerEmail} onChange={(e) => updateForm("managerEmail", e.target.value)} placeholder="manager@yourhospital.com" className={errors.managerEmail ? "border-destructive" : ""} />
                      {errors.managerEmail && <p className="text-xs text-destructive mt-1">{errors.managerEmail}</p>}
                    </div>
                    <div>
                      <Label className="text-label text-muted-foreground mb-1.5 block">Username * <span className="text-[10px] text-primary">(login identifier)</span></Label>
                      <Input value={form.managerUsername} onChange={(e) => updateForm("managerUsername", e.target.value.replace(/\s/g, "").toLowerCase())} placeholder="e.g. ahmadkhan" className={errors.managerUsername ? "border-destructive" : ""} />
                      {errors.managerUsername && <p className="text-xs text-destructive mt-1">{errors.managerUsername}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-label text-muted-foreground mb-1.5 block">Password *</Label>
                      <div className="relative">
                        <Input
                          type={showPwd ? "text" : "password"}
                          value={form.managerPassword}
                          onChange={(e) => updateForm("managerPassword", e.target.value)}
                          placeholder="Min. 8 characters"
                          className={cn("pr-10", errors.managerPassword ? "border-destructive" : "")}
                        />
                        <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {form.managerPassword && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex gap-1 flex-1">
                            {[1,2,3,4].map(i => (
                              <div key={i} className="h-1 flex-1 rounded-full transition-all" style={{ background: i <= strength.score ? strength.color : "#E0E0E0" }} />
                            ))}
                          </div>
                          <span className="text-xs font-semibold" style={{ color: strength.color }}>{strength.label}</span>
                        </div>
                      )}
                      {errors.managerPassword && <p className="text-xs text-destructive mt-1">{errors.managerPassword}</p>}
                    </div>
                    <div>
                      <Label className="text-label text-muted-foreground mb-1.5 block">Confirm Password *</Label>
                      <div className="relative">
                        <Input
                          type={showConfirm ? "text" : "password"}
                          value={form.managerConfirmPassword}
                          onChange={(e) => updateForm("managerConfirmPassword", e.target.value)}
                          placeholder="Re-enter password"
                          className={cn("pr-10", errors.managerConfirmPassword ? "border-destructive" : "")}
                        />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.managerConfirmPassword && <p className="text-xs text-destructive mt-1">{errors.managerConfirmPassword}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Documents ── */}
          {step === 2 && (
            <div className="space-y-6">
              <p className="text-body text-muted-foreground">Upload your hospital registration certificate and medical license. Accepted formats: PDF, JPG, PNG. Max 5MB per file.</p>
              {["Hospital Registration Certificate *", "Medical License / PMDC Registration *", "Additional Document (optional)"].map((label, i) => (
                <div key={i}>
                  <Label className="text-label text-muted-foreground mb-2 block">{label}</Label>
                  {docs[i] ? (
                    <div className="flex items-center justify-between bg-status-success-bg rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span className="text-body text-foreground">{docs[i].name}</span>
                      </div>
                      <button onClick={() => setDocs(prev => prev.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDocs(prev => { const d = [...prev]; d[i] = { name: `document_${i+1}.pdf`, type: "PDF" }; return d; })}
                      className="w-full border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center gap-2 hover:border-primary hover:bg-accent transition-colors"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-body text-muted-foreground">Drag file here or click to browse</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── STEP 3: Review ── */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-h3 text-foreground font-semibold">Review Your Application</h3>
              <div className="bg-accent rounded-lg p-4">
                <h4 className="text-btn text-foreground mb-3 font-semibold">Hospital Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Hospital Name", form.name || "—"],
                    ["Facility Type", form.facilityType || "—"],
                    ["Address", form.address || "—"],
                    ["City", form.city || "—"],
                    ["Province", form.province || "—"],
                    ["Phone", form.phone || "—"],
                    ["Email", form.email || "—"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p className="text-label text-muted-foreground text-xs">{k}</p>
                      <p className="text-body text-foreground text-sm font-medium">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-accent rounded-lg p-4">
                <h4 className="text-btn text-foreground mb-3 font-semibold">Manager Credentials</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Manager Name", form.managerName || "—"],
                    ["Manager Email", form.managerEmail || "—"],
                    ["Username", form.managerUsername || "—"],
                    ["Manager Phone", form.managerPhone || "—"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p className="text-label text-muted-foreground text-xs">{k}</p>
                      <p className="text-body text-foreground text-sm font-medium">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-accent rounded-lg p-4">
                <h4 className="text-btn text-foreground mb-3 font-semibold">Uploaded Documents</h4>
                {(docs.length > 0 ? docs : [{ name: "registration.pdf", type: "PDF" }, { name: "license.pdf", type: "PDF" }]).map((d, i) => (
                  <p key={i} className="text-body text-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" /> {d.name}
                  </p>
                ))}
              </div>
              <p className="text-label text-muted-foreground text-sm">
                By submitting, you confirm that all information is accurate. Your application will be reviewed within 2-3 business days.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button variant="ghost" onClick={() => step === 1 ? navigate("/") : setStep(step - 1)} className="text-muted-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            {step < 3 ? (
              <Button onClick={handleNext} className="bg-primary hover:bg-primary-dark text-primary-foreground">
                Next <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-primary hover:bg-primary-dark text-primary-foreground">
                Submit Application
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
