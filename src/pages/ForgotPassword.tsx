import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
    setCooldown(60);
    const interval = setInterval(() => {
      setCooldown((prev) => { if (prev <= 1) { clearInterval(interval); return 0; } return prev - 1; });
    }, 1000);
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

        <button onClick={() => navigate("/login")} className="auth-back-btn">
          <ArrowLeft size={16} /> Back to Sign In
        </button>

        {!sent ? (
          <>
            <h1 className="auth-heading">Reset Password</h1>
            <p className="auth-subheading">Enter your email to receive a secure reset link.</p>

            <form onSubmit={handleSend} className="auth-form">
              <div className="auth-field">
                <label className="auth-label">Email Address</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><Mail size={16} /></span>
                  <input
                    id="forgot-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-input"
                    required
                  />
                </div>
              </div>
              <button id="forgot-submit" type="submit" className="auth-btn-primary">
                Send Reset Link
              </button>
            </form>
          </>
        ) : (
          <div className="auth-success-state">
            <div className="auth-success-icon">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="auth-heading" style={{ marginTop: "1rem" }}>Check Your Email</h2>
            <p className="auth-subheading">
              A reset link was sent to <strong style={{ color: "#2C3E50" }}>{email}</strong>.<br />
              Link expires in 15 minutes.
            </p>
            <button
              className="auth-btn-outline"
              disabled={cooldown > 0}
              onClick={handleSend}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Link"}
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
