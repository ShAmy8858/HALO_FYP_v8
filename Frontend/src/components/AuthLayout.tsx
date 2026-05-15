import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-root">
      {/* Animated gradient background */}
      <div className="auth-bg-gradient" />

      <div className="auth-container">
        {/* Left Panel — Hospital Image */}
        <div className="auth-image-panel">
          <img
            src="/hospital-receptionist.png?v=2"
            alt="HALO Hospital Reception"
            className="auth-image"
          />
          {/* Overlay gradient blending into right */}
          <div className="auth-image-overlay" />

          {/* Floating glass badge */}
          <div className="auth-image-badge">
            <div className="auth-badge-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
                <path d="M12 8v8M8 12h8" />
              </svg>
            </div>
            <div>
              <p className="auth-badge-title">HALO Platform</p>
              <p className="auth-badge-sub">Hospital AI Liaison & Operations</p>
            </div>
          </div>

          {/* Bottom caption */}
          <div className="auth-image-caption">
            <p className="auth-caption-text">Trusted by 200+ Hospitals Across Pakistan</p>
            <div className="auth-caption-dots">
              <span className="auth-dot active" />
              <span className="auth-dot" />
              <span className="auth-dot" />
            </div>
          </div>
        </div>

        {/* Right Panel — Form */}
        <div className="auth-form-panel">
          <div className="auth-form-scroll">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
