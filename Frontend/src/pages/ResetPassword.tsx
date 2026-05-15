import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { apiRequest } from "@/lib/api";

function getPasswordStrength(pwd: string) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#EF5350", "#FF9800", "#66BB6A", "#00ACC1"];
  return { score, label: labels[score] || "", color: colors[score] || "" };
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid or missing reset token. Please request a new reset link.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await apiRequest("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setSuccess(true);
    } catch {
      setError("Reset token is invalid or expired. Please request a new one.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout>
        <div className="auth-card animate-auth-in">
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
          <h1 className="auth-heading">Invalid Reset Link</h1>
          <p className="auth-subheading">This link is invalid or has expired. Please request a new password reset.</p>
          <button onClick={() => navigate("/forgot-password")} className="auth-btn-primary" style={{ marginTop: "1rem" }}>
            Request New Link
          </button>
        </div>
      </AuthLayout>
    );
  }

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

        <button onClick={() => navigate("/login")} className="auth-back-btn">
          <ArrowLeft size={16} /> Back to Sign In
        </button>

        {!success ? (
          <>
            <h1 className="auth-heading">Set New Password</h1>
            <p className="auth-subheading">Enter a new password for your account.</p>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label className="auth-label">New Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><Lock size={16} /></span>
                  <input
                    type={showPwd ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="auth-input"
                    required
                    minLength={8}
                    style={{ paddingRight: "40px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#90A4AE" }}
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {password && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                    <div style={{ display: "flex", gap: "3px", flex: 1 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{ height: "4px", flex: 1, borderRadius: "2px", background: i <= strength.score ? strength.color : "#E0E0E0", transition: "background 0.2s" }} />
                      ))}
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: 600, color: strength.color }}>{strength.label}</span>
                  </div>
                )}
              </div>

              <div className="auth-field">
                <label className="auth-label">Confirm Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><Lock size={16} /></span>
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter new password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="auth-input"
                    required
                    minLength={8}
                    style={{ paddingRight: "40px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#90A4AE" }}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && <p className="auth-error">{error}</p>}
              <button type="submit" className="auth-btn-primary" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        ) : (
          <div className="auth-success-state">
            <div className="auth-success-icon">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="auth-heading" style={{ marginTop: "1rem" }}>Password Reset Successfully</h2>
            <p className="auth-subheading">
              Your password has been changed. You can now sign in with your new password.
            </p>
            <button
              className="auth-btn-primary"
              onClick={() => navigate("/login")}
              style={{ marginTop: "1rem" }}
            >
              Go to Sign In
            </button>
          </div>
        )}

        <div className="auth-powered-badge" style={{ marginTop: "1.5rem" }}>
          <span className="auth-powered-dot" />
          Powered by AI · HALO v2.0
        </div>
      </div>
    </AuthLayout>
  );
}
