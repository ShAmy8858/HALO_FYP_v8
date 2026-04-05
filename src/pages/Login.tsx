import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, Shield, Building2, User } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

// ─── Hardcoded credentials ────────────────────────────────────
const ADMIN_CREDENTIALS = { email: "admin@halo.pk", username: "admin", password: "Admin@2025" };
const HOSPITAL_DEMO = { email: "manager@hospital.pk", username: "manager", password: "Hospital@123" };

function matchCredential(input: string, cred: { email: string; username: string }) {
  return input.trim().toLowerCase() === cred.email.toLowerCase() ||
    input.trim().toLowerCase() === cred.username.toLowerCase();
}

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"admin" | "hospital">("admin");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string; auth?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!identifier) newErrors.identifier = "Email or Username is required";
    if (!password) newErrors.password = "Password is required";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (role === "admin") {
        if (matchCredential(identifier, ADMIN_CREDENTIALS) && password === ADMIN_CREDENTIALS.password) {
          sessionStorage.setItem("halo_user", JSON.stringify({ role: "admin", name: "Platform Admin", email: ADMIN_CREDENTIALS.email }));
          navigate("/admin");
        } else {
          setErrors({ auth: "Invalid admin credentials. Please check your email/username and password." });
        }
      } else {
        // Check registered hospitals from registration form
        const registered = JSON.parse(localStorage.getItem("halo_registered_managers") || "[]");
        const found = registered.find((m: { email: string; username: string; password: string }) =>
          matchCredential(identifier, m) && password === m.password
        );
        if (found) {
          sessionStorage.setItem("halo_user", JSON.stringify({ role: "hospital", name: found.managerName || "Hospital Manager", email: found.email, hospital: found.hospitalName || "Your Hospital" }));
          navigate("/hospital");
        } else if (matchCredential(identifier, HOSPITAL_DEMO) && password === HOSPITAL_DEMO.password) {
          sessionStorage.setItem("halo_user", JSON.stringify({ role: "hospital", name: "Hospital Manager", email: HOSPITAL_DEMO.email, hospital: "Demo Hospital" }));
          navigate("/hospital");
        } else {
          setErrors({ auth: "Invalid credentials. Please use your registered hospital manager account." });
        }
      }
    }, 900);
  };

  return (
    <AuthLayout>
      <div className="auth-card animate-auth-in">
        {/* Logo — Enhanced */}
        <div className="auth-logo-wrap auth-logo-wrap--centered">
          <div className="auth-logo-icon auth-logo-icon--lg">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
              <path d="M12 8v8M8 12h8" />
            </svg>
          </div>
          <div className="auth-logo-text-block">
            <div className="auth-logo-title-row">
              <span className="auth-logo-text">HALO</span>
              <span className="auth-logo-ai-badge">AI</span>
            </div>
            <p className="auth-logo-tagline">Hospital AI Liaison &amp; Operations</p>
          </div>
        </div>

        <h1 className="auth-heading">Welcome Back</h1>
        <p className="auth-subheading">Sign in to your hospital appointment system</p>

        {/* Role Toggle */}
        <div className="auth-role-toggle">
          <button onClick={() => { setRole("admin"); setErrors({}); }} className={`auth-role-btn ${role === "admin" ? "active" : ""}`}>
            <Shield size={15} /> Administrator
          </button>
          <button onClick={() => { setRole("hospital"); setErrors({}); }} className={`auth-role-btn ${role === "hospital" ? "active" : ""}`}>
            <Building2 size={15} /> Hospital Manager
          </button>
        </div>

        {/* Auth-level error */}
        {errors.auth && (
          <div className="auth-alert-error">
            <span>⚠️</span> {errors.auth}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Email / Username */}
          <div className="auth-field">
            <label className="auth-label">Email Address / Username</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon"><User size={16} /></span>
              <input
                id="login-identifier"
                type="text"
                placeholder={role === "admin" ? "admin@halo.pk or admin" : "manager@hospital.pk or manager"}
                value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); setErrors({}); }}
                className={`auth-input ${errors.identifier ? "error" : ""}`}
                autoComplete="username"
              />
            </div>
            {errors.identifier && <p className="auth-error">{errors.identifier}</p>}
          </div>

          {/* Password */}
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon"><Lock size={16} /></span>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors({}); }}
                className={`auth-input ${errors.password ? "error" : ""}`}
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="auth-input-toggle">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="auth-error">{errors.password}</p>}
          </div>

          {/* Remember + Forgot */}
          <div className="auth-remember-row">
            <label className="auth-remember">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="auth-checkbox" />
              <span>Remember me</span>
            </label>
            <button type="button" onClick={() => navigate("/forgot-password")} className="auth-link">
              Forgot Password?
            </button>
          </div>

          {/* Demo hint */}
          <div className="auth-demo-hint">
            {role === "admin"
              ? <span>Demo: <strong>admin@halo.pk</strong> / <strong>Admin@2025</strong></span>
              : <span>Demo: <strong>manager@hospital.pk</strong> / <strong>Hospital@123</strong></span>
            }
          </div>

          {/* Submit */}
          <button id="login-submit" type="submit" disabled={loading} className="auth-btn-primary">
            {loading ? <span className="auth-spinner" /> : `Sign In as ${role === "admin" ? "Administrator" : "Hospital Manager"}`}
          </button>
        </form>

        <div className="auth-divider">
          <span className="auth-divider-line" />
          <span className="auth-divider-text">or</span>
          <span className="auth-divider-line" />
        </div>

        <p className="auth-switch">
          New hospital?{" "}
          <button onClick={() => navigate("/register")} className="auth-link-accent">Register Your Hospital</button>
        </p>

        <div className="auth-powered-badge">
          <span className="auth-powered-dot" />
          Powered by AI · HALO v2.0
        </div>
      </div>
    </AuthLayout>
  );
}
