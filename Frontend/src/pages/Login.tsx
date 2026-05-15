import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, Shield, Building2, User, ArrowLeft, Search } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { useAuth } from "@/lib/auth-context";
import { ApiClientError } from "@/lib/api";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState<"admin" | "hospital">("admin");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string; auth?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!identifier) newErrors.identifier = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      const data = await login(role === "admin" ? "ADMIN" : "MANAGER", identifier, password);
      setLoading(false);
      if (data.user.role === "ADMIN") {
        navigate("/admin");
        return;
      }

      if (data.user.status === "ACTIVE") {
        navigate("/hospital");
        return;
      }

      const query = data.application?.applicationId ? `?applicationId=${data.application.applicationId}` : "";
      navigate(`/application-status${query}`);
    } catch (error) {
      setLoading(false);
      const message = error instanceof ApiClientError ? error.message : "Unable to sign in. Please try again.";
      setErrors({ auth: message });
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card animate-auth-in">
        {/* Back to Home */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-xs font-medium mb-4 px-2 py-1 rounded-md transition-colors"
          style={{ color: "#78909C", background: "transparent" }}
          onMouseOver={(e) => { e.currentTarget.style.color = '#00ACC1'; e.currentTarget.style.background = 'rgba(0,172,193,0.06)'; }}
          onMouseOut={(e) => { e.currentTarget.style.color = '#78909C'; e.currentTarget.style.background = 'transparent'; }}
        >
          <ArrowLeft size={14} /> Back to Home
        </button>
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
            <label className="auth-label">Email Address</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon"><User size={16} /></span>
              <input
                id="login-identifier"
                type="text"
                placeholder={role === "admin" ? "admin@halo.pk" : "manager@yourhospital.com"}
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
              ? <span>Seed admin: <strong>shamykhan3260@gmail.com</strong> / <strong>shamy@3260</strong></span>
              : <span>New Managers can sign in after submitting registration; dashboard access starts after admin approval.</span>
            }
          </div>

          {/* Submit */}
          <button id="login-submit" type="submit" disabled={loading} className="auth-btn-primary">
            {loading ? <span className="auth-spinner" /> : `Sign In as ${role === "admin" ? "Administrator" : "Hospital Manager"}`}
          </button>
        </form>

        {role === "hospital" && (
          <>
            <div className="auth-divider">
              <span className="auth-divider-line" />
              <span className="auth-divider-text">or</span>
              <span className="auth-divider-line" />
            </div>

            <p className="auth-switch">
              New hospital?{" "}
              <button onClick={() => navigate("/register")} className="auth-link-accent">Register Your Hospital</button>
            </p>

            <button
              onClick={() => navigate("/application-status")}
              className="flex items-center justify-center gap-1.5 text-xs font-medium w-full py-1.5 rounded-md transition-colors mt-1"
              style={{ color: "#00ACC1", background: "transparent" }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(0,172,193,0.06)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <Search size={13} /> Track Registration Status
            </button>
          </>
        )}

        <div className="auth-powered-badge">
          <span className="auth-powered-dot" />
          Powered by AI · HALO v2.0
        </div>
      </div>
    </AuthLayout>
  );
}
