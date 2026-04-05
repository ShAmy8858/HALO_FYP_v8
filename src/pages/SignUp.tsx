import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User, Phone, CheckCircle } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const levels = [
    { score: 1, label: "Weak", color: "#EF5350" },
    { score: 2, label: "Fair", color: "#FF9800" },
    { score: 3, label: "Good", color: "#29B6F6" },
    { score: 4, label: "Strong", color: "#4CAF50" },
  ];
  return levels[score - 1] ?? { score: 0, label: "", color: "" };
}

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  const passwordStrength = getPasswordStrength(form.password);
  const passwordsMatch = form.confirmPassword && form.password === form.confirmPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.fullName) newErrors.fullName = "Full name is required";
    if (!form.username) newErrors.username = "Username is required";
    if (!form.email) newErrors.email = "Email is required";
    if (!form.phone) newErrors.phone = "Phone number is required";
    if (!form.password) newErrors.password = "Password is required";
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!agreed) newErrors.agreed = "Please accept the terms";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/login");
    }, 1200);
  };

  return (
    <AuthLayout>
      <div className="auth-card animate-auth-in">
        {/* Logo */}
        <div className="auth-logo-wrap">
          <div className="auth-logo-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
              <path d="M12 8v8M8 12h8" />
            </svg>
          </div>
          <div>
            <span className="auth-logo-text">HALO</span>
            <span className="auth-logo-ai-badge">AI</span>
          </div>
        </div>

        <h1 className="auth-heading">Create Your Account</h1>
        <p className="auth-subheading">Start managing appointments efficiently</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Full Name */}
          <div className="auth-field">
            <label className="auth-label">Full Name</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon"><User size={16} /></span>
              <input
                id="signup-fullname"
                type="text"
                placeholder="Dr. Ahmed Khan"
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                className={`auth-input ${errors.fullName ? "error" : ""}`}
              />
            </div>
            {errors.fullName && <p className="auth-error">{errors.fullName}</p>}
          </div>

          {/* Username */}
          <div className="auth-field">
            <label className="auth-label">Username</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </span>
              <input
                id="signup-username"
                type="text"
                placeholder="ahmed_khan"
                value={form.username}
                onChange={(e) => update("username", e.target.value)}
                className={`auth-input ${errors.username ? "error" : ""}`}
              />
            </div>
            {errors.username && <p className="auth-error">{errors.username}</p>}
          </div>

          {/* Email */}
          <div className="auth-field">
            <label className="auth-label">Email Address</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon"><Mail size={16} /></span>
              <input
                id="signup-email"
                type="email"
                placeholder="you@hospital.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className={`auth-input ${errors.email ? "error" : ""}`}
              />
            </div>
            {errors.email && <p className="auth-error">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div className="auth-field">
            <label className="auth-label">Phone Number</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon"><Phone size={16} /></span>
              <input
                id="signup-phone"
                type="tel"
                placeholder="+92-300-0000000"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className={`auth-input ${errors.phone ? "error" : ""}`}
              />
            </div>
            {errors.phone && <p className="auth-error">{errors.phone}</p>}
          </div>

          {/* Password */}
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon"><Lock size={16} /></span>
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                className={`auth-input ${errors.password ? "error" : ""}`}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="auth-input-toggle">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="auth-error">{errors.password}</p>}
            {form.password && (
              <div className="auth-strength">
                <div className="auth-strength-bars">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="auth-strength-bar"
                      style={{ background: i <= passwordStrength.score ? passwordStrength.color : "rgba(0,0,0,0.1)" }}
                    />
                  ))}
                </div>
                <span className="auth-strength-label" style={{ color: passwordStrength.color }}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="auth-field">
            <label className="auth-label">Confirm Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon"><Lock size={16} /></span>
              <input
                id="signup-confirm-password"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                className={`auth-input ${errors.confirmPassword ? "error" : ""}`}
              />
              {form.confirmPassword && passwordsMatch && (
                <span className="auth-input-success"><CheckCircle size={16} /></span>
              )}
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="auth-input-toggle" style={{ right: form.confirmPassword ? "2.5rem" : "0.75rem" }}>
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="auth-error">{errors.confirmPassword}</p>}
          </div>

          {/* Terms */}
          <label className="auth-terms">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => { setAgreed(e.target.checked); setErrors((prev) => { const n = { ...prev }; delete n.agreed; return n; }); }}
              className="auth-checkbox"
            />
            <span>
              I agree to the{" "}
              <button type="button" className="auth-link-accent">Terms of Service</button>
              {" "}and{" "}
              <button type="button" className="auth-link-accent">Privacy Policy</button>
            </span>
          </label>
          {errors.agreed && <p className="auth-error" style={{ marginTop: "-0.5rem" }}>{errors.agreed}</p>}

          {/* Submit */}
          <button id="signup-submit" type="submit" disabled={loading} className="auth-btn-primary">
            {loading ? <span className="auth-spinner" /> : "Create Account"}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span className="auth-divider-line" />
          <span className="auth-divider-text">or</span>
          <span className="auth-divider-line" />
        </div>

        <p className="auth-switch">
          Already have an account?{" "}
          <button onClick={() => navigate("/login")} className="auth-link-accent">Sign In</button>
        </p>

        {/* AI Badge */}
        <div className="auth-powered-badge">
          <span className="auth-powered-dot" />
          Powered by AI · HALO v2.0
        </div>
      </div>
    </AuthLayout>
  );
}
