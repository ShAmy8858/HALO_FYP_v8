import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Upload, X, ArrowLeft, ArrowRight, Copy, Eye, EyeOff, UserCog, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest, ApiClientError } from "@/lib/api";
import type { HospitalApplication } from "@/types/api";

/** Client-side cap aligned with platform default; server enforces real limit from settings. */
const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;

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
  const [submittedApplication, setSubmittedApplication] = useState<HospitalApplication | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    // Hospital Info
    name: "", facilityType: "", licenseNumber: "", address: "", city: "", province: "", postalCode: "",
    phone: "", email: "", description: "",
    // Manager Credentials
    managerName: "", managerEmail: "", managerPhone: "",
    managerPassword: "", managerConfirmPassword: "",
  });
  const [docs, setDocs] = useState<({ name: string; type: string; file: File } | undefined)[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateForm = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => { const e = { ...prev }; delete e[key]; return e; });
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.name) e.name = "Hospital name is required";
    if (!form.facilityType) e.facilityType = "Please select a facility type";
    if (!form.licenseNumber) e.licenseNumber = "License number is required";
    if (!form.address) e.address = "Address is required";
    if (!form.city) e.city = "City is required";
    if (!form.province) e.province = "Province is required";
    if (!form.postalCode) e.postalCode = "Postal code is required";
    if (!form.phone) e.phone = "Phone is required";
    if (!form.email) e.email = "Hospital email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Please enter a valid email address";
    if (!form.managerName) e.managerName = "Manager name is required";
    if (!form.managerEmail) e.managerEmail = "Manager email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.managerEmail)) e.managerEmail = "Please enter a valid email address";
    if (!form.managerPhone) e.managerPhone = "Manager phone is required";
    if (!form.managerPassword) e.managerPassword = "Password is required";
    if (form.managerPassword && form.managerPassword.length < 8) e.managerPassword = "Password must be at least 8 characters";
    if (form.managerPassword !== form.managerConfirmPassword) e.managerConfirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2) {
      if (!docs[0] || !docs[1]) {
        setErrors({ documents: "Upload both required documents: registration certificate and medical license." });
        return;
      }
      const oversize = [docs[0], docs[1], docs[2]].filter((d): d is NonNullable<typeof d> => Boolean(d)).find((d) => d.file.size > MAX_DOCUMENT_BYTES);
      if (oversize) {
        setErrors({ documents: `Each file must be 5 MB or smaller. "${oversize.file.name}" is too large.` });
        return;
      }
    }
    setStep(step + 1);
  };

  const handleFileChange = (index: number, fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;
    if (file.size > MAX_DOCUMENT_BYTES) {
      setErrors((prev) => ({
        ...prev,
        documents: `"${file.name}" exceeds 5 MB. Choose a smaller file or compress the document.`,
      }));
      return;
    }
    setDocs((prev) => {
      const next = [...prev];
      next[index] = { name: file.name, type: file.type || "document", file };
      return next;
    });
    setErrors((prev) => { const e = { ...prev }; delete e.documents; return e; });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const regDoc = docs[0];
      const licDoc = docs[1];
      if (!regDoc || !licDoc) {
        setSubmitError("Please upload both required documents before submitting.");
        return;
      }
      for (const d of [regDoc, licDoc, docs[2]].filter(Boolean) as NonNullable<(typeof docs)[number]>[]) {
        if (d.file.size > MAX_DOCUMENT_BYTES) {
          setSubmitError(`"${d.file.name}" exceeds 5 MB. Replace it with a smaller file.`);
          return;
        }
      }

      const formData = new FormData();
      formData.append("hospitalName", form.name);
      formData.append("facilityType", form.facilityType);
      formData.append("licenseNumber", form.licenseNumber);
      formData.append("businessEmail", form.email);
      formData.append("phone", form.phone);
      formData.append("province", form.province);
      formData.append("city", form.city);
      formData.append("postalCode", form.postalCode);
      if (form.address.trim()) formData.append("address", form.address);
      formData.append("managerName", form.managerName);
      formData.append("managerEmail", form.managerEmail);
      formData.append("managerContactNumber", form.managerPhone);
      formData.append("managerPassword", form.managerPassword);
      formData.append("registrationCertificate", regDoc.file, regDoc.file.name);
      formData.append("medicalLicense", licDoc.file, licDoc.file.name);
      if (docs[2]) {
        formData.append("additionalDocument", docs[2]!.file, docs[2]!.file.name);
      }

      const submittedData = await apiRequest<{ application: HospitalApplication }>("/hospital-applications/register-complete", {
        method: "POST",
        body: formData,
      });
      setSubmittedApplication(submittedData.application);
      setSubmitted(true);
    } catch (error) {
      if (error instanceof ApiClientError) {
        // Parse Zod validation details into specific field messages
        const details = error.details as { fieldErrors?: Record<string, string[]> } | undefined;
        if (error.code === "VALIDATION_ERROR" && details?.fieldErrors) {
          const fieldMap: Record<string, string> = {
            hospitalName: "name", businessEmail: "email", licenseNumber: "licenseNumber",
            phone: "phone", province: "province", city: "city", postalCode: "postalCode",
            address: "address", managerName: "managerName", managerEmail: "managerEmail",
            managerContactNumber: "managerPhone", managerPassword: "managerPassword",
            facilityType: "facilityType",
          };
          const fieldErrors: Record<string, string> = {};
          for (const [backendField, messages] of Object.entries(details.fieldErrors)) {
            const frontendField = fieldMap[backendField] || backendField;
            fieldErrors[frontendField] = (messages as string[])[0] || "Invalid value";
          }
          if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
            setSubmitError("Some fields have validation errors. Please go back and correct them.");
            setStep(1);
          } else {
            setSubmitError(error.message);
          }
        } else {
          setSubmitError(error.message);
        }
      } else {
        setSubmitError("Unable to submit application.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const strength = getPasswordStrength(form.managerPassword);

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #e0f7fa 0%, #e8eaf6 40%, #fce4ec 100%)" }}>
        <div className="absolute top-[-120px] left-[-80px] w-[320px] h-[320px] rounded-full opacity-40 animate-pulse" style={{ background: "radial-gradient(circle, #00ACC1 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-100px] right-[-60px] w-[280px] h-[280px] rounded-full opacity-30 animate-pulse" style={{ background: "radial-gradient(circle, #1976D2 0%, transparent 70%)", animationDelay: "1s" }} />
        <div className="w-full max-w-[720px] rounded-3xl border border-white/40 shadow-2xl p-8 text-center animate-slide-up relative" style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(20px)" }}>
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5 animate-scale-in" style={{ background: "linear-gradient(135deg, #66BB6A, #43A047)" }}>
            <CheckCircle2 className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold mb-2" style={{ background: "linear-gradient(135deg, #00ACC1, #1976D2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Application Submitted!</h2>
          <p className="text-muted-foreground mb-4">Your hospital registration is now under review</p>
          <div className="mt-4 rounded-2xl p-4 inline-flex items-center gap-3" style={{ background: "linear-gradient(135deg, #E0F7FA, #E8EAF6)", border: "1px solid rgba(0,172,193,0.2)" }}>
            <span className="text-foreground font-mono text-xl font-bold tracking-wider">{submittedApplication?.applicationId}</span>
            <button className="text-[#00ACC1] hover:text-[#0097A7] transition-colors" onClick={() => { navigator.clipboard.writeText(submittedApplication?.applicationId || ""); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
              {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <div className="mt-5 p-4 rounded-2xl text-left" style={{ background: "rgba(0,172,193,0.06)", border: "1px solid rgba(0,172,193,0.15)" }}>
            <p className="text-sm font-bold text-foreground mb-2">🔐 Manager Login Credentials Created</p>
            <p className="text-sm text-muted-foreground">Email: <strong className="text-[#00ACC1]">{form.managerEmail}</strong></p>
            <p className="text-xs text-muted-foreground mt-1">Use these credentials to sign in after admin approval.</p>
          </div>
          <p className="text-sm text-muted-foreground mt-4">📧 You will be notified via email when your application is reviewed.</p>
          <div className="flex gap-3 justify-center mt-6">
            <Button className="bg-gradient-to-r from-[#00ACC1] to-[#1976D2] hover:shadow-lg text-white font-bold px-6 py-2.5 rounded-xl" onClick={() => navigate(`/application-status?applicationId=${submittedApplication?.applicationId || ""}`)}>
              Track Application Status
            </Button>
            <Button variant="outline" onClick={() => navigate("/login")} className="rounded-xl border-2">
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0" style={{ background: "linear-gradient(135deg, #e0f7fa 0%, #e1f5fe 20%, #e8eaf6 45%, #f3e5f5 70%, #fce4ec 100%)" }}>
      {/* Floating Orbs — static background */}
      <div className="absolute top-[-150px] left-[-100px] w-[400px] h-[400px] rounded-full opacity-30 animate-pulse" style={{ background: "radial-gradient(circle, #00ACC1 0%, transparent 70%)" }} />
      <div className="absolute top-[40%] right-[-120px] w-[350px] h-[350px] rounded-full opacity-20 animate-pulse" style={{ background: "radial-gradient(circle, #1976D2 0%, transparent 70%)", animationDelay: "1.5s" }} />
      <div className="absolute bottom-[-100px] left-[30%] w-[300px] h-[300px] rounded-full opacity-25 animate-pulse" style={{ background: "radial-gradient(circle, #E91E63 0%, transparent 70%)", animationDelay: "3s" }} />
      <div className="absolute top-[20%] left-[60%] w-[200px] h-[200px] rounded-full opacity-15 animate-pulse" style={{ background: "radial-gradient(circle, #FF9800 0%, transparent 70%)", animationDelay: "2s" }} />
      <div className="absolute bottom-[20%] right-[20%] w-[250px] h-[250px] rounded-full opacity-15 animate-pulse" style={{ background: "radial-gradient(circle, #4CAF50 0%, transparent 70%)", animationDelay: "4s" }} />

      {/* Full-height flex column layout */}
      <div className="relative z-10 flex flex-col h-full max-w-[800px] mx-auto px-4">
        {/* ── FIXED HEADER (does NOT scroll) ── */}
        <div className="flex-shrink-0 pt-6 pb-4">
          {/* Top nav bar */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm font-medium text-[#546E7A] hover:text-[#00ACC1] transition-colors px-3 py-1.5 rounded-lg hover:bg-white/50"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </button>
          </div>

          {/* Header */}
          <div className="text-center mb-5">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #00ACC1, #1976D2)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" /><path d="M12 8v8M8 12h8" />
                </svg>
              </div>
              <span className="text-2xl font-extrabold tracking-wide" style={{ background: "linear-gradient(135deg, #1a3a5c, #00ACC1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>HALO</span>
              <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-md shadow" style={{ background: "linear-gradient(135deg, #00ACC1, #1976D2)", verticalAlign: "super" }}>AI</span>
            </div>
            <h1 className="text-2xl font-extrabold" style={{ background: "linear-gradient(135deg, #1a3a5c, #263238)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Hospital Registration</h1>
            <p className="text-xs text-[#78909C] mt-0.5">Register your hospital and create manager login credentials</p>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-center">
            {[{ label: "Basic Info" }, { label: "Documents" }, { label: "Review" }].map((s, i) => {
              const n = i + 1;
              return (
                <div key={n} className="flex items-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-md",
                      step > n ? "text-white shadow-green-200" :
                      step === n ? "text-white shadow-lg shadow-cyan-200" : "text-[#90A4AE]"
                    )} style={{
                      background: step > n ? "linear-gradient(135deg, #66BB6A, #43A047)" :
                        step === n ? "linear-gradient(135deg, #00ACC1, #1976D2)" : "rgba(255,255,255,0.7)"
                    }}>
                      {step > n ? <CheckCircle2 className="h-5 w-5" /> : n}
                    </div>
                    <span className={cn("text-xs font-semibold hidden sm:block", step === n ? "text-[#00ACC1]" : "text-[#90A4AE]")}>{s.label}</span>
                  </div>
                  {i < 2 && <div className={cn("w-16 sm:w-24 h-0.5 mx-2 mb-4 rounded-full")} style={{ background: step > n ? "linear-gradient(90deg, #66BB6A, #43A047)" : "rgba(0,0,0,0.08)" }} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── SCROLLABLE FORM AREA ── */}
        <div className="flex-1 overflow-y-auto pb-8 min-h-0" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(0,172,193,0.3) transparent" }}>
        <div className="rounded-3xl border shadow-2xl p-6 sm:p-8 relative overflow-hidden" style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "blur(24px)", borderColor: "rgba(0,172,193,0.18)", boxShadow: "0 20px 60px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.6) inset, 0 0 80px rgba(0,172,193,0.06) inset" }}>
          {/* Decorative top gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "linear-gradient(90deg, #00ACC1, #1976D2, #7C4DFF, #E91E63, #FF9800)" }} />
          {/* ── STEP 1: Hospital Info + Manager Credentials ── */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Manager Credentials — FIRST */}
              <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, rgba(25,118,210,0.04), rgba(124,77,255,0.04))", border: "1px solid rgba(25,118,210,0.12)" }}>
                <h3 className="text-base font-bold mb-1 flex items-center gap-3" style={{ color: "#0D2137" }}>
                  <span className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md" style={{ background: "linear-gradient(135deg, #1976D2, #1565C0)", color: "white" }}>
                    <UserCog className="h-4 w-4" />
                  </span>
                  <span style={{ background: "linear-gradient(135deg, #1565C0, #1976D2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Hospital Manager Information</span>
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
                      <Input value={form.managerPhone} onChange={(e) => updateForm("managerPhone", e.target.value)} placeholder="+92-XXX-XXXXXXX" className={errors.managerPhone ? "border-destructive" : ""} />
                      {errors.managerPhone && <p className="text-xs text-destructive mt-1">{errors.managerPhone}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-label text-muted-foreground mb-1.5 block">Manager Email * <span className="text-[10px] text-primary">(login identifier)</span></Label>
                      <Input type="email" value={form.managerEmail} onChange={(e) => updateForm("managerEmail", e.target.value)} placeholder="manager@yourhospital.com" className={errors.managerEmail ? "border-destructive" : ""} />
                      {errors.managerEmail && <p className="text-xs text-destructive mt-1">{errors.managerEmail}</p>}
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

              {/* Hospital Details — SECOND */}
              <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, rgba(0,172,193,0.04), rgba(25,118,210,0.04))", border: "1px solid rgba(0,172,193,0.12)" }}>
                <h3 className="text-base font-bold mb-4 flex items-center gap-3" style={{ color: "#0D2137" }}>
                  <span className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-md" style={{ background: "linear-gradient(135deg, #00ACC1, #0097A7)", color: "white" }}>🏥</span>
                  <span style={{ background: "linear-gradient(135deg, #00838F, #00ACC1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Hospital Information</span>
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
                    <div>
                      <Label className="text-label text-muted-foreground mb-1.5 block">Registration / License Number *</Label>
                      <Input value={form.licenseNumber} onChange={(e) => updateForm("licenseNumber", e.target.value)} placeholder="e.g. HRA-2026-001" className={errors.licenseNumber ? "border-destructive" : ""} />
                      {errors.licenseNumber && <p className="text-xs text-destructive mt-1">{errors.licenseNumber}</p>}
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
                        <SelectTrigger className={errors.province ? "border-destructive" : ""}><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{provinces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                      </Select>
                      {errors.province && <p className="text-xs text-destructive mt-1">{errors.province}</p>}
                    </div>
                    <div>
                      <Label className="text-label text-muted-foreground mb-1.5 block">Postal Code</Label>
                      <Input value={form.postalCode} onChange={(e) => updateForm("postalCode", e.target.value)} placeholder="44000" className={errors.postalCode ? "border-destructive" : ""} />
                      {errors.postalCode && <p className="text-xs text-destructive mt-1">{errors.postalCode}</p>}
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
            </div>
          )}

          {/* ── STEP 2: Documents ── */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Hospital Documents */}
              <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, rgba(0,172,193,0.04), rgba(25,118,210,0.04))", border: "1px solid rgba(0,172,193,0.12)" }}>
                <h3 className="text-base font-bold mb-3 flex items-center gap-3" style={{ color: "#0D2137" }}>
                  <span className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-md" style={{ background: "linear-gradient(135deg, #00ACC1, #0097A7)", color: "white" }}>📄</span>
                  <span style={{ background: "linear-gradient(135deg, #00838F, #00ACC1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Hospital Documents</span>
                </h3>
                <p className="text-xs text-muted-foreground mb-4">Upload your hospital registration certificate and medical license. Accepted formats: PDF, Word (DOCX), PNG, JPEG, WebP, HEIC. Max 5MB per file.</p>
                {errors.documents && <p className="text-sm text-destructive mb-3">{errors.documents}</p>}
                {["Hospital Registration Certificate *", "Medical License / PMDC Registration *", "Additional Document (optional)"].map((label, i) => (
                  <div key={i} className="mb-3">
                    <Label className="text-label text-muted-foreground mb-2 block">{label}</Label>
                    {docs[i] ? (
                      <div className="flex items-center justify-between bg-status-success-bg rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          <span className="text-body text-foreground">{docs[i].name}</span>
                        </div>
                        <button onClick={() => setDocs(prev => { const n = [...prev]; n[i] = undefined; return n; })} className="text-muted-foreground hover:text-destructive">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-full border-2 border-dashed rounded-2xl p-6 flex flex-col items-center gap-2 transition-all cursor-pointer" style={{ borderColor: "rgba(0,172,193,0.25)", background: "linear-gradient(135deg, rgba(0,172,193,0.02), rgba(25,118,210,0.02))" }} onMouseOver={(e) => { e.currentTarget.style.borderColor = '#00ACC1'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,172,193,0.06), rgba(25,118,210,0.06))'; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(0,172,193,0.25)'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,172,193,0.02), rgba(25,118,210,0.02))'; }}>
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Click to browse or drag file here</span>
                        <input className="hidden" type="file" accept=".pdf,.jpg,.jpeg,.png,.docx" onChange={(e) => handleFileChange(i, e.target.files)} />
                      </label>
                    )}
                  </div>
                ))}
              </div>

              {/* Manager CNIC */}
              <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, rgba(25,118,210,0.04), rgba(124,77,255,0.04))", border: "1px solid rgba(25,118,210,0.12)" }}>
                <h3 className="text-base font-bold mb-3 flex items-center gap-3" style={{ color: "#0D2137" }}>
                  <span className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md" style={{ background: "linear-gradient(135deg, #1976D2, #1565C0)", color: "white" }}>
                    <UserCog className="h-4 w-4" />
                  </span>
                  <span style={{ background: "linear-gradient(135deg, #1565C0, #1976D2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Manager CNIC Verification</span>
                </h3>
                <p className="text-xs text-muted-foreground mb-4">Upload clear photos of the manager's CNIC (National Identity Card) for identity verification.</p>
                {errors.cnic && <p className="text-sm text-destructive mb-3">{errors.cnic}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["CNIC Front Side *", "CNIC Back Side *"].map((label, idx) => {
                    const cnicIdx = idx + 3; // indices 3 and 4 in docs array
                    return (
                      <div key={cnicIdx}>
                        <Label className="text-label text-muted-foreground mb-2 block">{label}</Label>
                        {docs[cnicIdx] ? (
                          <div className="flex items-center justify-between bg-status-success-bg rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-success" />
                              <span className="text-body text-foreground text-xs truncate max-w-[150px]">{docs[cnicIdx].name}</span>
                            </div>
                            <button onClick={() => setDocs(prev => { const n = [...prev]; n[cnicIdx] = undefined; return n; })} className="text-muted-foreground hover:text-destructive">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="w-full border-2 border-dashed rounded-2xl p-6 flex flex-col items-center gap-2 transition-all cursor-pointer" style={{ borderColor: "rgba(25,118,210,0.25)", background: "linear-gradient(135deg, rgba(25,118,210,0.02), rgba(124,77,255,0.02))" }} onMouseOver={(e) => { e.currentTarget.style.borderColor = '#1976D2'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(25,118,210,0.06), rgba(124,77,255,0.06))'; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(25,118,210,0.25)'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(25,118,210,0.02), rgba(124,77,255,0.02))'; }}>
                            <Upload className="h-6 w-6 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{idx === 0 ? "Front side photo" : "Back side photo"}</span>
                            <input className="hidden" type="file" accept=".jpg,.jpeg,.png" onChange={(e) => handleFileChange(cnicIdx, e.target.files)} />
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Review ── */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2" style={{ background: "linear-gradient(135deg, #00838F, #1976D2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>✅ Review Your Application</h3>
              <div className="rounded-2xl p-4" style={{ background: "linear-gradient(135deg, rgba(0,172,193,0.05), rgba(25,118,210,0.03))", border: "1px solid rgba(0,172,193,0.15)" }}>
                <h4 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "#00838F" }}>🏥 Hospital Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Hospital Name", form.name || "—"],
                    ["Facility Type", form.facilityType || "—"],
                    ["License Number", form.licenseNumber || "—"],
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
              <div className="rounded-2xl p-4" style={{ background: "linear-gradient(135deg, rgba(25,118,210,0.05), rgba(124,77,255,0.03))", border: "1px solid rgba(25,118,210,0.15)" }}>
                <h4 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "#1565C0" }}>👤 Manager Credentials</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Manager Name", form.managerName || "—"],
                    ["Manager Email", form.managerEmail || "—"],
                    ["Manager Phone", form.managerPhone || "—"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p className="text-label text-muted-foreground text-xs">{k}</p>
                      <p className="text-body text-foreground text-sm font-medium">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl p-4" style={{ background: "linear-gradient(135deg, rgba(76,175,80,0.05), rgba(0,172,193,0.03))", border: "1px solid rgba(76,175,80,0.15)" }}>
                <h4 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "#2E7D32" }}>📄 Uploaded Documents</h4>
                {docs.filter(Boolean).map((d, i) => (
                  <p key={i} className="text-body text-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" /> {d!.name}
                  </p>
                ))}
              </div>
              {submitError && <p className="text-sm text-destructive">{submitError}</p>}
              <p className="text-label text-muted-foreground text-sm">
                By submitting, you confirm that all information is accurate. Your application will be reviewed within 2-3 business days.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button variant="ghost" onClick={() => step === 1 ? navigate("/") : setStep(step - 1)} className="text-[#546E7A] hover:text-[#00ACC1]">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            {step < 3 ? (
              <Button onClick={handleNext} className="text-white font-bold rounded-xl px-6 shadow-lg hover:shadow-xl transition-all" style={{ background: "linear-gradient(135deg, #00ACC1, #1976D2)" }}>
                Next <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting} className="text-white font-bold rounded-xl px-6 shadow-lg hover:shadow-xl transition-all" style={{ background: submitting ? "#90A4AE" : "linear-gradient(135deg, #00ACC1, #1976D2)" }}>
                {submitting ? "Submitting..." : "Submit Application"}
              </Button>
            )}
          </div>
        </div>
        </div>{/* end scrollable form area */}
      </div>{/* end flex column */}
    </div>
  );
}
