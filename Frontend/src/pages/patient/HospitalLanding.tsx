import { useState } from "react";
import { MessageSquare, Phone, X, Minus, Send, Mic, Keyboard, CheckCircle2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const initialMessages = [
  { from: "agent", text: "Welcome to HALO! I'm your AI booking assistant. How can I help you today?" },
];

const quickReplies = ["Book Appointment", "Check Availability", "Cancel Appointment", "Talk to Staff"];

export default function HospitalLanding() {
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [mode, setMode] = useState<"text" | "voice" | "phone">("text");
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { from: "patient", text }]);
    setInput("");
    setTimeout(() => {
      if (text.toLowerCase().includes("book")) {
        setMessages(prev => [...prev, { from: "agent", text: "I'd be happy to help you book an appointment! Let me show you available slots with Dr. Ahmad Khan (Cardiology)." }]);
        setTimeout(() => setShowConfirmation(true), 1000);
      } else {
        setMessages(prev => [...prev, { from: "agent", text: "Thank you for your message. Let me help you with that. Would you like to book an appointment?" }]);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hospital Website Mock */}
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center"><span className="text-primary-foreground font-bold text-sm">H</span></div>
            <span className="text-h3 text-foreground">City General Hospital</span>
          </div>
          <nav className="hidden md:flex gap-6 text-nav text-muted-foreground">
            <a href="#" className="hover:text-foreground">Home</a><a href="#" className="hover:text-foreground">Services</a>
            <a href="#" className="hover:text-foreground">Doctors</a><a href="#" className="hover:text-foreground">Contact</a>
          </nav>
          <Button size="sm" className="bg-destructive text-destructive-foreground">Emergency</Button>
        </div>
      </header>

      <section className="bg-primary py-20 px-6 text-center">
        <h1 className="text-4xl font-bold text-primary-foreground mb-4">City General Hospital</h1>
        <p className="text-primary-foreground/80 text-lg mb-8">Excellence in Healthcare Since 1985</p>
        <Button size="lg" className="bg-card text-primary hover:bg-card/90" onClick={() => setWidgetOpen(true)}>
          Book an Appointment
        </Button>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-h2 text-foreground text-center mb-8">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["Cardiology", "Dermatology", "Orthopedics"].map(s => (
            <div key={s} className="bg-card rounded-xl border border-border shadow-card p-6 text-center hover:shadow-card-hover transition-all">
              <h3 className="text-h3 text-foreground">{s}</h3>
              <p className="text-body text-muted-foreground mt-2">Expert care from certified specialists.</p>
            </div>
          ))}
        </div>
      </section>

      {/* Phone Number Card */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="bg-card rounded-xl border border-border shadow-card p-6 max-w-sm mx-auto text-center">
          <Phone className="h-8 w-8 text-primary mx-auto mb-3" />
          <h3 className="text-h3 text-foreground">Book via Phone</h3>
          <p className="text-kpi text-foreground mt-2">+92-51-1234567</p>
          <p className="text-body text-muted-foreground mt-1">Tap to call our AI booking assistant</p>
          <Button className="mt-4 bg-primary hover:bg-primary-dark text-primary-foreground w-full" asChild>
            <a href="tel:+925112345678">Call Now</a>
          </Button>
          <p className="text-label text-muted-foreground mt-2">Available 24/7 in English and Urdu</p>
        </div>
      </section>

      {/* Floating Button */}
      {!widgetOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-card rounded-pill px-3 py-1 text-label text-foreground shadow-card mb-2 text-center">Book Appointment</div>
          <button onClick={() => setWidgetOpen(true)} className="w-[60px] h-[60px] rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg animate-pulse-ring hover:bg-primary-dark transition-colors">
            <MessageSquare className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Chat Widget */}
      {widgetOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[560px] bg-card rounded-2xl shadow-xl border border-border flex flex-col animate-slide-up overflow-hidden">
          {/* Header */}
          <div className="h-[60px] bg-primary flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center"><span className="text-primary-foreground font-bold text-sm">H</span></div>
              <span className="text-primary-foreground font-semibold text-sm">HALO — City General</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-primary-foreground/70 text-[10px] border border-primary-foreground/30 rounded px-1.5 py-0.5">EN</span>
              <button onClick={() => setWidgetOpen(false)} className="text-primary-foreground/70 hover:text-primary-foreground p-1"><Minus className="h-4 w-4" /></button>
              <button onClick={() => setWidgetOpen(false)} className="text-primary-foreground/70 hover:text-primary-foreground p-1"><X className="h-4 w-4" /></button>
            </div>
          </div>

          {mode === "voice" ? (
            /* Voice Mode */
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-accent">
              <div className="flex gap-1 items-end mb-6">
                {[20,35,50,40,30,45,25,40,35].map((h,i) => (
                  <div key={i} className="w-2 bg-primary rounded-full animate-pulse" style={{height: `${h}px`, animationDelay: `${i*0.1}s`}} />
                ))}
              </div>
              <div className="bg-card rounded-lg p-3 w-full mb-4 max-h-24 overflow-y-auto">
                <p className="text-body text-muted-foreground italic">Listening...</p>
              </div>
              <button onClick={() => setMode("text")} className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg animate-pulse-ring mb-4">
                <Mic className="h-8 w-8" />
              </button>
              <button onClick={() => setMode("text")} className="flex items-center gap-2 text-body text-muted-foreground hover:text-foreground">
                <Keyboard className="h-4 w-4" /> Switch to Text
              </button>
            </div>
          ) : (
            /* Text Mode */
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-accent">
                {messages.map((m, i) => (
                  <div key={i} className={cn("max-w-[80%] animate-fade-in", m.from === "agent" ? "mr-auto" : "ml-auto")}>
                    <div className={cn("rounded-xl px-4 py-2.5 text-body", m.from === "agent" ? "bg-card border border-border rounded-bl-sm text-foreground" : "bg-primary text-primary-foreground rounded-br-sm")}>
                      {m.text}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 px-1">{m.from === "agent" ? "HALO" : "You"} • just now</p>
                  </div>
                ))}

                {showConfirmation && !confirmed && (
                  <div className="bg-card border border-border rounded-xl p-4 animate-slide-up">
                    <div className="flex items-center gap-2 mb-3"><CheckCircle2 className="h-4 w-4 text-primary" /><span className="text-btn text-foreground">Booking Summary</span></div>
                    <div className="grid grid-cols-2 gap-2 text-label">
                      {[["Doctor","Dr. Ahmad Khan"],["Specialty","Cardiology"],["Date","Wed, 16 Oct 2024"],["Time","09:00 AM"],["Duration","30 minutes"]].map(([k,v]) => (
                        <div key={k}><span className="text-muted-foreground">{k}</span><p className="text-foreground font-medium">{v}</p></div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button className="text-label text-primary hover:underline">Edit Details</button>
                      <Button size="sm" className="flex-1 bg-primary hover:bg-primary-dark text-primary-foreground" onClick={() => setConfirmed(true)}>Confirm Booking</Button>
                    </div>
                  </div>
                )}

                {confirmed && (
                  <div className="bg-card border border-border rounded-xl p-4 text-center animate-scale-in">
                    <div className="w-12 h-12 rounded-full bg-status-success-bg flex items-center justify-center mx-auto mb-2"><CheckCircle2 className="h-6 w-6 text-success" /></div>
                    <p className="text-btn text-foreground">Booking Confirmed!</p>
                    <div className="flex items-center justify-center gap-2 mt-2 bg-accent rounded-lg p-2">
                      <span className="font-mono text-body text-foreground">REF-2024-0156</span>
                      <Copy className="h-3 w-3 text-primary cursor-pointer" />
                    </div>
                    <p className="text-label text-muted-foreground mt-2">Confirmation email sent</p>
                  </div>
                )}
              </div>

              {/* Quick Replies */}
              {messages.length < 3 && (
                <div className="flex gap-2 px-4 py-2 overflow-x-auto border-t border-border bg-card">
                  {quickReplies.map(q => (
                    <button key={q} onClick={() => sendMessage(q)} className="text-label text-foreground bg-accent border border-border rounded-pill px-3 py-1.5 whitespace-nowrap hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">{q}</button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="h-[60px] border-t border-border flex items-center gap-2 px-4 bg-card shrink-0">
                <Input placeholder="Type a message..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage(input)} className="border-0 shadow-none focus-visible:ring-0" />
                <button onClick={() => setMode("voice")} className="text-muted-foreground hover:text-foreground p-2"><Mic className="h-5 w-5" /></button>
                <button onClick={() => sendMessage(input)} disabled={!input.trim()} className={cn("p-2 rounded-lg transition-colors", input.trim() ? "text-primary hover:bg-primary/10" : "text-muted-foreground/40")}>
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
