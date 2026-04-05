import { useState, useEffect, useRef, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { DarkModeToggle, useDarkMode } from "@/components/DarkModeToggle";
import { Building2, Cross, Activity, ShieldPlus, HeartPulse, Stethoscope, BriefcaseMedical } from "lucide-react";

// ─── Animated Counter hook ───────────────────────────────────────
function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// ─── Intersection Observer hook ──────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Data ────────────────────────────────────────────────────────
const features = [
  { icon: "🤖", title: "AI Appointment Intelligence", desc: "Smart scheduling engine that learns doctor availability, patient history, and peak load patterns to auto-assign optimal slots with zero conflicts." },
  { icon: "🏥", title: "Multi-Hospital Management", desc: "Manage unlimited hospitals from a single admin console. Each facility gets its own manager portal, data isolation, and custom configuration." },
  { icon: "📲", title: "Walk-In & Online Booking", desc: "Unified queue for walk-in patients and online bookings. Real-time seat allocation prevents overbooking across all departments." },
  { icon: "📊", title: "Live Analytics Dashboard", desc: "Real-time KPIs: appointment volumes, doctor utilization, no-show rates, and revenue metrics — all in one beautiful dashboard." },
  { icon: "🔔", title: "Automated Notifications", desc: "SMS, email, and in-app reminders reduce no-shows by up to 45%. Patients receive appointment confirmations and pre-visit instructions automatically." },
  { icon: "🔐", title: "Role-Based Access Control", desc: "Granular permissions for HALO Admins, Hospital Managers, and Receptionists. Every action is logged with a full audit trail." },
  { icon: "📋", title: "Doctor & Department Setup", desc: "Add, edit, and schedule doctors across departments. Set availability windows, slot durations, and specialty flags effortlessly." },
  { icon: "💳", title: "Subscription & Billing Engine", desc: "Flexible tiered subscriptions per hospital. Admins can assign, upgrade, or suspend plans directly from the platform console." },
];

const steps = [
  { num: "01", title: "Hospital Registers", desc: "Hospital representatives submit their credentials and documents through the onboarding portal. HALO Admin reviews and approves within 24–48 hours." },
  { num: "02", title: "Admin Approves & Assigns Plan", desc: "The HALO super-admin reviews the application, approves the hospital, and assigns an appropriate subscription plan." },
  { num: "03", title: "Managers Configure Facility", desc: "Hospital managers log in to their dedicated portal to set up doctors, departments, schedules, and notification preferences." },
  { num: "04", title: "Patients Book Appointments", desc: "Patients visit the hospital-specific landing page to browse doctors, choose time slots, and confirm appointments instantly — no phone calls needed." },
];

const compliances = [
  { icon: "🏛️", label: "HIPAA Compliant", desc: "Full compliance with U.S. Health Insurance Portability & Accountability Act standards for patient data privacy." },
  { icon: "🔒", label: "End-to-End Encryption", desc: "AES-256 encryption for all data at rest and TLS 1.3 for data in transit across the platform." },
  { icon: "📜", label: "DOHMS Aligned", desc: "Designed in alignment with Pakistan's Department of Health, Management & Social Welfare guidelines." },
  { icon: "🛡️", label: "Role-Based Access", desc: "Granular RBAC ensures every user accesses only what they're authorized for, with full audit trails." },
  { icon: "📁", label: "Full Audit Trails", desc: "Every action on the platform is logged with timestamps, user IDs, and change records for compliance reviews." },
  { icon: "🌐", label: "99.9% Uptime SLA", desc: "Enterprise-grade infrastructure with redundant systems guaranteeing maximum platform availability." },
  { icon: "📱", label: "PEMRA Compliant SMS", desc: "All patient SMS communications follow PEMRA regulations for healthcare-related messaging in Pakistan." },
  { icon: "🏥", label: "HL7 FHIR Ready", desc: "Supports HL7 FHIR standards for health data interoperability and integration with existing HIS systems." },
  { icon: "🔏", label: "ISO 27001 Practices", desc: "Information security management follows ISO 27001 best practices for risk assessment and treatment." },
];

const plans = [
  {
    name: "Starter", price: "PKR 4,999", period: "/month", highlight: false,
    desc: "Perfect for small clinics and solo-specialty hospitals.",
    features: ["Up to 2 Departments", "500 Appointments/month", "Basic Analytics", "Email Notifications", "Standard Support"],
  },
  {
    name: "Professional", price: "PKR 14,999", period: "/month", highlight: true,
    desc: "Built for growing multi-department hospitals.",
    features: ["Up to 10 Departments", "3,000 Appointments/month", "Advanced Analytics", "SMS + Email Notifications", "Walk-in Queue System", "Priority Support"],
    badge: "Most Popular",
  },
  {
    name: "Enterprise", price: "Custom", period: "", highlight: false,
    desc: "For hospital networks and large-scale health systems.",
    features: ["Unlimited Departments", "Unlimited Appointments", "Real-time BI Dashboards", "Multi-Hospital Console", "API Access & Integrations", "Dedicated Account Manager", "SLA Guarantee"],
  },
];

const testimonials = [
  { name: "Dr. Ayesha Siddiqui", role: "Medical Director, Shifa International Hospital, Islamabad", text: "HALO transformed our front desk completely. We went from handling 200+ calls a day to nearly zero — appointments just happen automatically. Our doctors' schedules are optimized, and patients love the experience.", avatar: "AS", stars: 5, color: "#00ACC1" },
  { name: "Tariq Mahmood", role: "Hospital Administrator, Aga Khan Hospital, Karachi", text: "The multi-hospital management feature is a game-changer. We oversee 3 facilities from one dashboard. The AI scheduling alone reduced our no-show rate by 38% in the first month.", avatar: "TM", stars: 5, color: "#1976D2" },
  { name: "Sana Baig", role: "Receptionist Manager, CMH Rawalpindi", text: "Before HALO, we'd spend hours on the phone managing appointments. Now the platform handles everything. The walk-in queue and online booking work together seamlessly — our staff finally have time to focus on patients.", avatar: "SB", stars: 5, color: "#4CAF50" },
  { name: "Prof. Imran Hassan", role: "CEO, Lahore Care Hospital Group", text: "We evaluated 4 hospital management platforms. HALO was the only one built for Pakistan's healthcare reality — Urdu support, local payment integration, and pricing suited to our market. Exceptional product.", avatar: "IH", stars: 5, color: "#FF9800" },
];

const faqs = [
  { q: "How quickly can a hospital go live on HALO?", a: "Once approved by the HALO admin (usually 24–48 hours), hospital managers can configure their facility and go live in under 2 hours. Our onboarding team provides guided setup assistance." },
  { q: "Is HALO compliant with Pakistan's healthcare regulations?", a: "Yes. HALO is designed with DOHMS (Department of Health, Management & Social Welfare) data guidelines in mind. All patient data is encrypted at rest and in transit. We also provide PEMRA-compliant notification messaging." },
  { q: "Can patients book appointments without creating an account?", a: "Yes. Patients can book as guests using their phone number. Returning patients can use their number to view and manage existing appointments without a full account signup." },
  { q: "Does HALO integrate with existing hospital management software?", a: "HALO offers REST APIs for Enterprise plan clients to integrate with existing HIS (Hospital Information Systems), EMR platforms, and billing software. Contact us for a technical assessment." },
  { q: "What happens if a hospital exceeds their appointment limit?", a: "Hospitals receive email alerts at 80% and 95% of their monthly limit. The platform will not block appointments mid-month — we'll work with the hospital to upgrade their plan proactively." },
  { q: "Is training provided for hospital staff?", a: "Absolutely. Every onboarded hospital receives a 1-hour virtual training session covering the manager portal, appointment management, and notification setup. Video tutorials are also available in the app." },
];

const stats = [
  { value: 200, suffix: "+", label: "Hospitals Onboarded" },
  { value: 50000, suffix: "+", label: "Appointments Managed" },
  { value: 45, suffix: "%", label: "No-show Reduction" },
  { value: 99, suffix: ".9%", label: "Platform Uptime" },
];

const trustedBy = [
  { name: "Shifa International Hospital", icon: <Building2 size={16} color="#1976D2" /> },
  { name: "Aga Khan University Hospital", icon: <Activity size={16} color="#00ACC1" /> },
  { name: "CMH Rawalpindi", icon: <ShieldPlus size={16} color="#4CAF50" /> },
  { name: "Lahore General Hospital", icon: <Cross size={16} color="#FF9800" /> },
  { name: "Jinnah Hospital Karachi", icon: <Building2 size={16} color="#1976D2" /> },
  { name: "PIMS Islamabad", icon: <HeartPulse size={16} color="#E91E63" /> },
  { name: "Services Hospital Lahore", icon: <Stethoscope size={16} color="#00ACC1" /> },
  { name: "Holy Family Hospital", icon: <ShieldPlus size={16} color="#4CAF50" /> },
  { name: "Liaquat National Hospital", icon: <BriefcaseMedical size={16} color="#FF9800" /> },
  { name: "Dow University Hospital", icon: <Building2 size={16} color="#1976D2" /> },
  { name: "Fauji Foundation", icon: <Cross size={16} color="#E91E63" /> },
  { name: "South City Hospital", icon: <Activity size={16} color="#00ACC1" /> },
  { name: "Ziauddin Hospital", icon: <Stethoscope size={16} color="#4CAF50" /> },
];

// ─── Navbar ──────────────────────────────────────────────────────
function Navbar({ onLogin, dark, onToggleDark }: { onLogin: () => void; dark: boolean; onToggleDark: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    if (id === "home") { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [["home", "Home"], ["features", "Features"], ["how-it-works", "How It Works"], ["pricing", "Pricing"], ["testimonials", "Testimonials"], ["faq", "FAQ"]];

  return (
    <nav className={`lp-nav ${scrolled ? "lp-nav--scrolled" : ""}`}>
      <div className="lp-nav__inner">
        {/* Logo */}
        <button className="lp-nav__logo" onClick={() => scrollTo("home")}>
          <div className="lp-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
              <path d="M12 8v8M8 12h8" />
            </svg>
          </div>
          <span className="lp-nav__brand">HALO</span>
          <span className="lp-nav__badge">AI</span>
        </button>

        {/* Desktop links */}
        <div className="lp-nav__links">
          {navLinks.map(([id, label]) => (
            <button key={id} className="lp-nav__link" onClick={() => scrollTo(id)}>{label}</button>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="lp-nav__actions">
          <DarkModeToggle dark={dark} onToggle={onToggleDark} variant="light" />
          <button className="lp-nav__signin" onClick={onLogin}>Sign In</button>
          <button className="lp-nav__cta" onClick={() => navigate("/register")}>Register Hospital</button>
        </div>

        {/* Mobile toggle */}
        <div className="lp-nav__mobile-right">
          <DarkModeToggle dark={dark} onToggle={onToggleDark} variant="light" />
          <button className="lp-nav__burger" onClick={() => setMobileOpen(!mobileOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lp-nav__mobile">
          {navLinks.map(([id, label]) => (
            <button key={id} className="lp-nav__mobile-link" onClick={() => scrollTo(id)}>{label}</button>
          ))}
          <div className="lp-nav__mobile-actions">
            <button className="lp-nav__signin" onClick={() => { setMobileOpen(false); onLogin(); }}>Sign In</button>
            <button className="lp-nav__cta" onClick={() => { setMobileOpen(false); navigate("/register"); }}>Register Hospital</button>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Stats Counter ────────────────────────────────────────────────
function StatCard({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { ref, inView } = useInView();
  const count = useCountUp(value, 2200, inView);
  return (
    <div ref={ref} className="lp-stat">
      <div className="lp-stat__number">{count.toLocaleString()}<span>{suffix}</span></div>
      <div className="lp-stat__label">{label}</div>
    </div>
  );
}

// ─── Flip Feature Card ────────────────────────────────────────────
function FlipCard({ icon, title, desc, index }: { icon: string; title: string; desc: string; index: number }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      className={`lp-flip-card ${flipped ? "lp-flip-card--flipped" : ""}`}
      style={{ animationDelay: `${index * 60}ms` }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="lp-flip-card__inner">
        {/* Front */}
        <div className="lp-flip-card__front">
          <div className="lp-flip-card__icon">{icon}</div>
          <h3 className="lp-flip-card__title">{title}</h3>
          <div className="lp-flip-card__hint">Hover to learn more →</div>
          <div className="lp-flip-card__glow" />
        </div>
        {/* Back */}
        <div className="lp-flip-card__back">
          <div className="lp-flip-card__back-icon">{icon}</div>
          <h3 className="lp-flip-card__back-title">{title}</h3>
          <p className="lp-flip-card__desc">{desc}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Trusted By Marquee ───────────────────────────────────────────
function TrustedByMarquee() {
  const doubled = [...trustedBy, ...trustedBy];
  return (
    <section className="lp-trusted">
      <div className="lp-container">
        <div className="lp-trusted__header">
          <div className="lp-eyebrow">Trusted By</div>
          <h2 className="lp-section__h2">Leading Healthcare Institutions <br /><span className="lp-gradient-text">Across Pakistan</span></h2>
        </div>
      </div>
      <div className="lp-marquee-outer">
        <div className="lp-marquee-track">
          {doubled.map((item, i) => (
            <div key={i} className="lp-marquee-item">
              <span className="lp-marquee-dot">{item.icon}</span>
              {item.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { ref: heroRef, inView: heroIn } = useInView(0.05);
  const { dark, setDark } = useDarkMode();

  const handleLogin = () => navigate("/login");

  return (
    <div className="lp-root">
      <Navbar onLogin={handleLogin} dark={dark} onToggleDark={() => setDark(!dark)} />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section id="home" className="lp-hero-section">
        <div className="lp-hero__bg-orb lp-hero__bg-orb--1" />
        <div className="lp-hero__bg-orb lp-hero__bg-orb--2" />
        <div className="lp-hero__bg-orb lp-hero__bg-orb--3" />
        <div className="lp-hero" ref={heroRef}>
          <img src="/main-robot.png" alt="AI Platform Robot" className="lp-hero-center-robot" />

          <div className={`lp-hero__content ${heroIn ? "lp-anim-in" : ""}`}>
            <div className="lp-hero__eyebrow">
              <span className="lp-pulse-dot" />
              Never miss a patient call
            </div>
            <h1 className="lp-hero__h1">
              The AI Receptionist<br />
              <span className="lp-gradient-text">Built for healthcare.</span>
            </h1>
            <p className="lp-hero__sub">
              HALO answers patient calls 24/7, books appointments into your calendar, and handles enquiries, so your front desk can breathe.
            </p>
            <div className="lp-hero__actions">
              <button className="lp-btn-primary lp-btn--lg" onClick={() => navigate("/register")}>
                Register Your Hospital
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
              <button className="lp-btn-ghost lp-btn--lg" onClick={handleLogin}>
                Sign In to Platform
              </button>
              <a href="/hospital.html" className="lp-btn-outline lp-btn--lg" style={{ textDecoration: 'none' }}>
                View Patient Demo
              </a>
            </div>
            <div className="lp-hero__trust">
              <div className="lp-trust-avatars">
                {["AK", "SK", "MH", "FA", "ZB"].map(i => <div key={i} className="lp-trust-avatar">{i}</div>)}
              </div>
              <span>Trusted by <strong>200+</strong> hospitals across Pakistan</span>
            </div>
          </div>

          {/* Hero visual */}
          <div className={`lp-hero__visual ${heroIn ? "lp-anim-in-right" : ""}`}>
            <div className="lp-dashboard-preview">
              <div className="lp-dash-header">
                <div className="lp-dash-dot lp-dash-dot--red" /><div className="lp-dash-dot lp-dash-dot--yellow" /><div className="lp-dash-dot lp-dash-dot--green" />
                <span className="lp-dash-title">HALO Admin Dashboard</span>
              </div>
              <div className="lp-dash-body">
                <div className="lp-dash-kpis">
                  {[["48", "Hospitals"], ["1,247", "Today's Appts"], ["92%", "Utilization"], ["4.8★", "Rating"]].map(([v, l]) => (
                    <div key={l} className="lp-dash-kpi">
                      <span className="lp-dash-kpi__val">{v}</span>
                      <span className="lp-dash-kpi__lbl">{l}</span>
                    </div>
                  ))}
                </div>
                <div className="lp-dash-chart">
                  {[65, 80, 55, 90, 70, 85, 95].map((h, i) => (
                    <div key={i} className="lp-dash-bar-wrap">
                      <div className="lp-dash-bar" style={{ height: `${h}%` }} />
                    </div>
                  ))}
                </div>
                <div className="lp-dash-table">
                  {["City General, Lahore", "Al-Shifa, Islamabad", "Karachi Spine Clinic", "CMH Rawalpindi"].map((h, i) => (
                    <div key={i} className="lp-dash-row">
                      <div className="lp-dash-row__dot" />
                      <span className="lp-dash-row__name">{h}</span>
                      <span className="lp-dash-row__badge">Active</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Floating cards */}
            <div className="lp-float-card lp-float-card--1">
              <span className="lp-float-icon">📅</span>
              <div><div className="lp-float-title">New Appointment</div><div className="lp-float-sub">Dr. Siddiqui • 10:30 AM</div></div>
            </div>
            <div className="lp-float-card lp-float-card--2">
              <span className="lp-float-icon">✅</span>
              <div><div className="lp-float-title">No-shows down 45%</div><div className="lp-float-sub">vs. last month</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAND ────────────────────────────────────────── */}
      <section className="lp-stats-band">
        <div className="lp-container">
          <div className="lp-stats-grid">
            {stats.map(s => <StatCard key={s.label} {...s} />)}
          </div>
        </div>
      </section>

      {/* ── TRUSTED BY ────────────────────────────────────────── */}
      <TrustedByMarquee />

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section id="features" className="lp-section">
        <div className="lp-container">
          <div className="lp-section__header">
            <div className="lp-eyebrow">Core Capabilities</div>
            <h2 className="lp-section__h2">Everything Your Hospital Needs<br /><span className="lp-gradient-text">in One Platform</span></h2>
            <p className="lp-section__sub">HALO centralizes appointment management, patient communications, doctor scheduling, and analytics — replacing fragmented spreadsheets and phone calls with intelligent automation.</p>
          </div>
          <div className="lp-features-grid">
            {features.map((f, i) => (
              <FlipCard key={i} icon={f.icon} title={f.title} desc={f.desc} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section id="how-it-works" className="lp-section lp-section--alt">
        <div className="lp-container">
          <div className="lp-section__header">
            <div className="lp-eyebrow">Simple Process</div>
            <h2 className="lp-section__h2">From Registration to<br /><span className="lp-gradient-text">Live in Under 48 Hours</span></h2>
            <p className="lp-section__sub">HALO was designed for Pakistan's healthcare workforce. Minimal IT overhead, maximum operational gain.</p>
          </div>
          <div className="lp-steps">
            {steps.map((s, i) => (
              <div key={i} className="lp-step">
                <div className="lp-step__num">{s.num}</div>
                {i < steps.length - 1 && <div className="lp-step__connector" />}
                <div className="lp-step__body">
                  <h3 className="lp-step__title">{s.title}</h3>
                  <p className="lp-step__desc">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPLIANCE CARDS ──────────────────────────────────── */}
      <section className="lp-compliance-section">
        <div className="lp-container">
          <div className="lp-section__header">
            <div className="lp-eyebrow" style={{ color: "rgba(255,255,255,0.9)", background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.2)" }}>Security & Compliance</div>
            <h2 className="lp-section__h2" style={{ color: "#fff" }}>Built with Healthcare<br /><span style={{ background: "linear-gradient(135deg,#80DEEA,#81D4FA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Compliance at Its Core</span></h2>
            <p className="lp-section__sub" style={{ color: "rgba(255,255,255,0.65)" }}>HALO is engineered to meet international and local healthcare compliance standards, ensuring your patient data is always protected.</p>
          </div>
          <div className="lp-compliance-grid">
            {compliances.map((c, i) => (
              <div key={i} className="lp-compliance-card">
                <div className="lp-compliance-card__icon">{c.icon}</div>
                <div className="lp-compliance-card__label">{c.label}</div>
                <div className="lp-compliance-card__desc">{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────── */}
      <section id="pricing" className="lp-section">
        <div className="lp-container">
          <div className="lp-section__header">
            <div className="lp-eyebrow">Transparent Pricing</div>
            <h2 className="lp-section__h2">Plans for Every<br /><span className="lp-gradient-text">Scale of Healthcare</span></h2>
            <p className="lp-section__sub">No hidden fees. No lock-in contracts. Upgrade or downgrade anytime. All plans include onboarding support.</p>
          </div>
          <div className="lp-pricing-grid">
            {plans.map((p, i) => (
              <div key={i} className={`lp-plan ${p.highlight ? "lp-plan--highlight" : ""}`}>
                {p.badge && <div className="lp-plan__badge">{p.badge}</div>}
                <div className="lp-plan__name">{p.name}</div>
                <div className="lp-plan__price">
                  {p.price}<span className="lp-plan__period">{p.period}</span>
                </div>
                <p className="lp-plan__desc">{p.desc}</p>
                <ul className="lp-plan__features">
                  {p.features.map(f => (
                    <li key={f} className="lp-plan__feature">
                      <span className="lp-check">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={p.highlight ? "lp-btn-primary lp-btn--full" : "lp-btn-outline lp-btn--full"}
                  onClick={() => navigate("/register")}
                >
                  {p.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section id="testimonials" className="lp-section lp-section--alt">
        <div className="lp-container">
          <div className="lp-section__header">
            <div className="lp-eyebrow">Customer Stories</div>
            <h2 className="lp-section__h2">Loved by Healthcare<br /><span className="lp-gradient-text">Leaders Across Pakistan</span></h2>
          </div>
          <div className="lp-testimonials-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="lp-testimonial" style={{ "--t-color": t.color } as React.CSSProperties}>
                <div className="lp-testimonial__top-bar" style={{ background: t.color }} />
                <div className="lp-testimonial__stars">
                  {Array.from({ length: t.stars }).map((_, si) => <span key={si} className="lp-star">★</span>)}
                </div>
                <div className="lp-testimonial__quotes">"</div>
                <p className="lp-testimonial__text">{t.text}</p>
                <div className="lp-testimonial__author">
                  <div className="lp-testimonial__avatar" style={{ background: `linear-gradient(135deg, ${t.color}, #1976D2)` }}>{t.avatar}</div>
                  <div>
                    <div className="lp-testimonial__name">{t.name}</div>
                    <div className="lp-testimonial__role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INSIGHTS / WHY HALO ───────────────────────────────── */}
      <section className="lp-section lp-insights">
        <div className="lp-container">
          <div className="lp-insights__grid">
            <div className="lp-insights__text">
              <div className="lp-eyebrow">Platform Insights</div>
              <h2 className="lp-section__h2">Pakistan's Healthcare<br /><span className="lp-gradient-text">Deserves Better</span></h2>
              <p className="lp-insights__body">
                Pakistan's public and private hospitals handle over 1 million outpatient visits daily.
                Yet 73% still manage appointments via phone calls, WhatsApp groups, and paper registers.
                HALO replaces this chaos with an intelligent, unified system — purpose-built for the
                realities of Pakistan's healthcare infrastructure.
              </p>
              <div className="lp-insights__bullets">
                {[
                  "Reduce phone call volumes by up to 80%",
                  "Cut average patient wait time from 47 to 12 minutes",
                  "Eliminate double-bookings and scheduling conflicts",
                  "Give every doctor full schedule visibility from their device",
                  "Enable hospital CEOs to monitor all facilities in real time",
                ].map(b => (
                  <div key={b} className="lp-insights__bullet">
                    <span className="lp-insights__check">✓</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
              <button className="lp-btn-primary" onClick={() => navigate("/register")}>
                Start Your Hospital's Journey
              </button>
            </div>
            <div className="lp-insights__metrics">
              {[
                { value: "80%", label: "Reduction in phone call volumes", color: "#00ACC1" },
                { value: "47→12", label: "Minutes average patient wait", color: "#1976D2" },
                { value: "38%", label: "Fewer no-shows after SMS reminders", color: "#4CAF50" },
                { value: "3×", label: "Faster appointment booking speed", color: "#FF9800" },
              ].map((m, i) => (
                <div key={i} className="lp-metric-card" style={{ borderTopColor: m.color }}>
                  <div className="lp-metric-card__val" style={{ color: m.color }}>{m.value}</div>
                  <div className="lp-metric-card__label">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section id="faq" className="lp-section lp-section--alt">
        <div className="lp-container lp-container--narrow">
          <div className="lp-section__header">
            <div className="lp-eyebrow">Common Questions</div>
            <h2 className="lp-section__h2">Frequently Asked<br /><span className="lp-gradient-text">Questions</span></h2>
          </div>
          <div className="lp-faq">
            {faqs.map((f, i) => (
              <div key={i} className={`lp-faq__item ${openFaq === i ? "open" : ""}`}>
                <button className="lp-faq__q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{f.q}</span>
                  <span className="lp-faq__arrow">{openFaq === i ? "−" : "+"}</span>
                </button>
                <div className="lp-faq__a">{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────── */}
      <section className="lp-cta-banner">
        <div className="lp-cta-banner__bg" />
        <div className="lp-container">
          <div className="lp-cta-banner__inner">
            <h2 className="lp-cta-banner__h2">Ready to Transform<br />Your Hospital Operations?</h2>
            <p className="lp-cta-banner__sub">Join 200+ hospitals already using HALO. Get started today with a free onboarding consultation.</p>
            <div className="lp-cta-banner__actions">
              <button className="lp-btn-white lp-btn--lg" onClick={() => navigate("/register")}>
                Register Your Hospital
              </button>
              <button className="lp-btn-ghost-white lp-btn--lg" onClick={handleLogin}>
                Sign In to Platform
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer__grid">
            {/* Brand */}
            <div className="lp-footer__brand">
              <div className="lp-footer__logo">
                <div className="lp-logo-icon lp-logo-icon--sm">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
                    <path d="M12 8v8M8 12h8" />
                  </svg>
                </div>
                <span className="lp-footer__brand-name">HALO</span>
                <span className="lp-nav__badge">AI</span>
              </div>
              <p className="lp-footer__tagline">Hospital AI Liaison &amp; Operations — Pakistan's intelligent appointment management platform.</p>
              <div className="lp-footer__social">
                {["𝕏", "in", "fb"].map(s => <a key={s} href="#" className="lp-footer__social-link">{s}</a>)}
              </div>
            </div>

            {/* Links */}
            <div className="lp-footer__col">
              <div className="lp-footer__col-title">Platform</div>
              {["Features", "How It Works", "Pricing", "Security", "API Docs"].map(l => <a key={l} href="#" className="lp-footer__link">{l}</a>)}
            </div>
            <div className="lp-footer__col">
              <div className="lp-footer__col-title">Hospital</div>
              {["Register Hospital", "Hospital Login", "Manager Guide", "Onboarding", "Support"].map(l => <a key={l} href="#" className="lp-footer__link">{l}</a>)}
            </div>
            <div className="lp-footer__col">
              <div className="lp-footer__col-title">Company</div>
              {["About HALO", "Contact Us", "Privacy Policy", "Terms of Service", "Compliance"].map(l => <a key={l} href="#" className="lp-footer__link">{l}</a>)}
            </div>
          </div>

          <div className="lp-footer__bottom">
            <span>© 2025–2026 HALO Health Technologies. All rights reserved. Built for Pakistan's Healthcare Sector.</span>
            <div className="lp-footer__bottom-links">
              <a href="#" className="lp-footer__link">Privacy</a>
              <a href="#" className="lp-footer__link">Terms</a>
              <a href="#" className="lp-footer__link">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
