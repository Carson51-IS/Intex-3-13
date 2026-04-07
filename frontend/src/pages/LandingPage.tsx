import { useState } from "react";
import { Link } from "react-router-dom";
import heroBeach from "../assets/hero-beach.png";
import havenLightLogoMark from "../assets/haven-light-logo-new.svg";
import { useAuth } from "../context/AuthContext";

function IconBase({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {children}
    </svg>
  );
}

const Heart = ({ className }: { className?: string }) => <IconBase className={className}><path d="M12 21s-7.2-4.8-9.4-8.8C1.2 9.6 2.1 6.7 4.5 5.5c2-1 4.3-.4 5.5 1.5 1.2-1.9 3.5-2.5 5.5-1.5 2.4 1.2 3.3 4.1 1.9 6.7C19.2 16.2 12 21 12 21z" /></IconBase>;
const Shield = ({ className }: { className?: string }) => <IconBase className={className}><path d="M12 3l7 3v6c0 4.2-2.6 7.9-7 9-4.4-1.1-7-4.8-7-9V6l7-3z" /></IconBase>;
const BookOpen = ({ className }: { className?: string }) => <IconBase className={className}><path d="M2 6.5A2.5 2.5 0 0 1 4.5 4H11v16H4.5A2.5 2.5 0 0 0 2 22z" /><path d="M22 6.5A2.5 2.5 0 0 0 19.5 4H13v16h6.5A2.5 2.5 0 0 1 22 22z" /></IconBase>;
const Users = ({ className }: { className?: string }) => <IconBase className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9" /><path d="M16 3.1a4 4 0 0 1 0 7.8" /></IconBase>;
const ArrowRight = ({ className }: { className?: string }) => <IconBase className={className}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></IconBase>;
const Mail = ({ className }: { className?: string }) => <IconBase className={className}><path d="M4 4h16v16H4z" /><path d="m4 7 8 6 8-6" /></IconBase>;
const Phone = ({ className }: { className?: string }) => <IconBase className={className}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.3 19.3 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.2 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .8 2.9a2 2 0 0 1-.5 2.1L8.3 10a16 16 0 0 0 5.7 5.7l1.3-1.2a2 2 0 0 1 2.1-.5c.9.4 1.9.7 2.9.8A2 2 0 0 1 22 16.9z" /></IconBase>;
const MapPin = ({ className }: { className?: string }) => <IconBase className={className}><path d="M12 22s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></IconBase>;

const stats = [
  { label: "Girls Served", value: "60+", icon: Heart },
  { label: "Active Safehouses", value: "9", icon: Shield },
  { label: "Years Operating", value: "12", icon: BookOpen },
  { label: "Graduation Rate", value: "89%", icon: Users },
];

const steps = [
  {
    num: "01",
    title: "Rescue & Intake",
    description:
      "Girls are referred through partner agencies, law enforcement, or community reports. Each child receives immediate safety, medical care, and trauma-informed assessment.",
  },
  {
    num: "02",
    title: "Healing & Growth",
    description:
      "Individualized care plans address therapeutic needs, education, life skills, and family dynamics. Licensed social workers guide every step of recovery.",
  },
  {
    num: "03",
    title: "Reintegration",
    description:
      "When safe and appropriate, girls transition to family reunification, kinship care, or supported independent living with ongoing aftercare.",
  },
];

export default function LandingPage() {
  const [donationAmount, setDonationAmount] = useState<number | null>(1000);
  const amounts = [500, 1000, 2500, 5000];
  const { user } = useAuth();

  const loginTarget = !user
    ? "/login"
    : user.roles.includes("Admin")
      ? "/admin"
      : user.roles.includes("Donor")
        ? "/donor"
        : "/";

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-1">
            <img src={havenLightLogoMark} alt="Haven Light logo mark" className="h-10 w-auto" />
            <div className="leading-tight">
              <div className="font-heading text-lg font-semibold text-foreground">Haven Light</div>
              <div className="font-body text-xs tracking-[0.18em] text-muted-foreground">PHILIPPINES</div>
            </div>
          </div>
          <nav className="hidden items-center gap-8 font-body text-sm md:flex">
            <a href="#mission" className="text-muted-foreground transition-colors hover:text-foreground">Mission</a>
            <a href="#impact" className="text-muted-foreground transition-colors hover:text-foreground">Impact</a>
            <a href="#how" className="text-muted-foreground transition-colors hover:text-foreground">How It Works</a>
            <a href="#donate" className="text-muted-foreground transition-colors hover:text-foreground">Donate</a>
            <Link
              to={loginTarget}
              className="rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground shadow-sm transition-all hover:translate-y-[-1px] hover:opacity-95"
            >
              {user ? "Dashboard" : "Login"}
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden pt-16">
        <img src={heroBeach} alt="Girls standing together on a beach at sunrise" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-primary/55" />
        <div className="absolute inset-0 hero-gradient opacity-40" />
        <div className="relative z-10 container mx-auto max-w-3xl px-6 text-center">
          <h1 className="animate-fade-in mb-6 font-heading text-4xl font-bold leading-tight text-primary-foreground md:text-6xl">
            Every Girl Deserves
            <br />
            a Safe Home
          </h1>
          <p
            className="animate-fade-in mx-auto mb-10 max-w-2xl font-body text-lg text-primary-foreground/80 md:text-xl"
            style={{ animationDelay: "0.15s" }}
          >
            Haven Light Philippines provides shelter, healing, and hope to girls who are survivors of abuse and
            trafficking. Together, we restore childhoods.
          </p>
          <div className="animate-fade-in flex flex-col justify-center gap-4 sm:flex-row" style={{ animationDelay: "0.3s" }}>
            <a href="#donate" className="rounded-md bg-accent px-8 py-3 text-base font-semibold text-accent-foreground transition hover:opacity-90">
              Donate Now <ArrowRight className="ml-1 inline h-4 w-4" />
            </a>
            <a href="#mission" className="rounded-md border border-primary-foreground/60 px-8 py-3 text-base font-semibold text-primary-foreground transition hover:bg-primary-foreground/10">
              Learn More
            </a>
          </div>
        </div>
      </section>

      <section id="impact" className="bg-warm py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={stat.label} className="animate-count-up text-center" style={{ animationDelay: `${i * 0.1}s` }}>
                <stat.icon className="mx-auto mb-3 h-8 w-8 text-accent" />
                <div className="font-heading text-3xl font-bold text-foreground md:text-4xl">{stat.value}</div>
                <div className="mt-1 font-body text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="mission" className="py-20">
        <div className="container mx-auto max-w-4xl px-6">
          <h2 className="mb-6 text-center font-heading text-3xl font-bold md:text-4xl">Our Mission</h2>
          <p className="mx-auto mb-12 max-w-2xl text-center font-body text-lg text-muted-foreground">
            Haven Light Philippines operates safe homes where girls who have survived abuse and trafficking find
            protection, professional care, and pathways to a brighter future.
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: Shield, title: "Protection", desc: "24/7 safe housing with trained caregivers in secure, nurturing environments." },
              { icon: Heart, title: "Healing", desc: "Trauma-informed therapy, medical care, and psychosocial support for every child." },
              { icon: BookOpen, title: "Empowerment", desc: "Education, life skills, and vocational training to build independent futures." },
            ].map((item) => (
              <div key={item.title} className="card-shadow hover:card-shadow-hover rounded-lg bg-card p-6 transition-shadow">
                <item.icon className="mb-4 h-10 w-10 text-primary" />
                <h3 className="mb-2 font-heading text-lg font-semibold">{item.title}</h3>
                <p className="font-body text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="bg-warm py-20">
        <div className="container mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center font-heading text-3xl font-bold md:text-4xl">How Our Program Works</h2>
          <div className="space-y-8">
            {steps.map((step) => (
              <div key={step.num} className="flex items-start gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-sm font-bold text-primary-foreground">
                  {step.num}
                </div>
                <div>
                  <h3 className="mb-2 font-heading text-xl font-semibold">{step.title}</h3>
                  <p className="font-body text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="donate" className="py-20">
        <div className="container mx-auto max-w-xl px-6 text-center">
          <h2 className="mb-4 font-heading text-3xl font-bold md:text-4xl">Make a Difference Today</h2>
          <p className="mb-8 font-body text-muted-foreground">
            Your gift provides food, shelter, therapy, and education for girls in our safe homes. Every peso counts.
          </p>
          <div className="mb-6 flex flex-wrap justify-center gap-3">
            {amounts.map((amt) => (
              <button
                key={amt}
                onClick={() => setDonationAmount(amt)}
                className={`rounded-lg border-2 px-6 py-3 font-body text-sm font-medium transition-all ${
                  donationAmount === amt
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-accent/50"
                }`}
              >
                ₱{amt.toLocaleString()}
              </button>
            ))}
          </div>
          <Link
            to="/impact"
            className="inline-flex w-full items-center justify-center rounded-md bg-accent px-6 py-3 text-base font-semibold text-accent-foreground transition hover:opacity-90"
          >
            Donate ₱{donationAmount?.toLocaleString() ?? "—"} <Heart className="ml-2 h-4 w-4" />
          </Link>
          <p className="mt-4 font-body text-xs text-muted-foreground">
            Haven Light Philippines is a registered nonprofit. All donations are tax-deductible.
          </p>
        </div>
      </section>

      <footer className="hero-gradient py-12">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 font-body text-sm text-primary-foreground/80 md:grid-cols-3">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <img src={havenLightLogoMark} alt="Haven Light logo mark" className="h-7 w-auto" />
                <span className="font-heading text-lg font-semibold text-primary-foreground">Haven Light Philippines</span>
              </div>
              <p>Providing safe homes and healing for girls who are survivors of abuse and trafficking since 2013.</p>
            </div>
            <div>
              <h4 className="mb-3 font-heading font-semibold text-primary-foreground">Contact</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> info@havenlight.ph</div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> +63 (2) 8123-4567</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Metro Manila, Philippines</div>
              </div>
            </div>
            <div>
              <h4 className="mb-3 font-heading font-semibold text-primary-foreground">Quick Links</h4>
              <div className="space-y-2">
                <a href="#mission" className="block transition-colors hover:text-primary-foreground">Our Mission</a>
                <a href="#impact" className="block transition-colors hover:text-primary-foreground">Impact</a>
                <a href="#donate" className="block transition-colors hover:text-primary-foreground">Donate</a>
                <Link to="/privacy" className="block transition-colors hover:text-primary-foreground">Privacy Policy</Link>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-primary-foreground/20 pt-6 text-center font-body text-xs text-primary-foreground/50">
            © 2025 Haven Light Philippines. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
