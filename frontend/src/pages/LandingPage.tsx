import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import heroBeach from "../assets/hero-beach.png";
import DonationPrompt from "../components/DonationPrompt";
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

const volumeAnimationByVideo = new WeakMap<HTMLVideoElement, number>();

function fadeVideoMute(video: HTMLVideoElement, shouldMute: boolean, durationMs = 240) {
  const existingAnimation = volumeAnimationByVideo.get(video);
  if (existingAnimation != null) {
    cancelAnimationFrame(existingAnimation);
    volumeAnimationByVideo.delete(video);
  }

  if (shouldMute) {
    const startVolume = Math.max(0, Math.min(1, video.volume || 1));
    if (startVolume <= 0.01 || video.muted) {
      video.muted = true;
      video.volume = 0;
      return;
    }
    const startedAt = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - startedAt) / durationMs, 1);
      video.volume = startVolume * (1 - t);
      if (t < 1) {
        volumeAnimationByVideo.set(video, requestAnimationFrame(tick));
        return;
      }
      video.muted = true;
      video.volume = 0;
      volumeAnimationByVideo.delete(video);
    };
    volumeAnimationByVideo.set(video, requestAnimationFrame(tick));
    return;
  }

  video.muted = false;
  const startVolume = Math.max(0, Math.min(1, video.volume || 0));
  const startedAt = performance.now();
  const tick = (now: number) => {
    const t = Math.min((now - startedAt) / durationMs, 1);
    video.volume = startVolume + (1 - startVolume) * t;
    if (t < 1) {
      volumeAnimationByVideo.set(video, requestAnimationFrame(tick));
      return;
    }
    video.volume = 1;
    volumeAnimationByVideo.delete(video);
  };
  volumeAnimationByVideo.set(video, requestAnimationFrame(tick));
}

export default function LandingPage() {
  const [donationAmount, setDonationAmount] = useState<number | null>(1000);
  const [needsSoundTap, setNeedsSoundTap] = useState(false);
  const missionVideoRef = useRef<HTMLVideoElement | null>(null);
  const missionVideoStartedRef = useRef(false);
  const { user } = useAuth();
  const location = useLocation();
  const amounts = [500, 1000, 2500, 5000];
  const donateConfirmPath = `/donate/confirm?amount=${donationAmount ?? 1000}`;
  const donateHref = user ? donateConfirmPath : `/login?redirect=${encodeURIComponent(donateConfirmPath)}`;

  useLayoutEffect(() => {
    if (location.pathname !== "/") return;
    if (location.hash !== "#donate") return;
    const el = document.getElementById("donate");
    if (!el) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const video = missionVideoRef.current;
    if (!video) return;
    let pendingUserGestureRetry = false;

    const tryPlayWithAudio = async () => {
      if (video.readyState >= 1 && video.currentTime < 1) {
        video.currentTime = 1;
      }
      video.muted = false;
      video.volume = 1;
      try {
        await video.play();
        pendingUserGestureRetry = false;
        setNeedsSoundTap(false);
      } catch {
        // Browser blocked unmuted autoplay; start muted immediately so it's not a black frame.
        try {
          video.muted = true;
          await video.play();
        } catch {
          // Ignore secondary failure.
        }
        pendingUserGestureRetry = true;
        setNeedsSoundTap(true);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const ratio = entry?.intersectionRatio ?? 0;
        // Mute whenever the video is mostly out of view.
        if (!entry?.isIntersecting || ratio < 0.25) {
          fadeVideoMute(video, true);
          return;
        }
        if (!missionVideoStartedRef.current) {
          missionVideoStartedRef.current = true;
          void tryPlayWithAudio();
          return;
        }
        // Re-entering viewport: resume and try to restore audio.
        void tryPlayWithAudio();
      },
      { threshold: [0, 0.25, 0.6, 1] },
    );

    observer.observe(video);

    const keepPlaying = () => {
      if (!missionVideoStartedRef.current) return;
      if (video.ended) return;
      void video.play().catch(() => {});
    };
    video.addEventListener("pause", keepPlaying);
    const onVisibilityChange = () => {
      if (document.hidden) fadeVideoMute(video, true);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const retryAfterGesture = (event?: Event) => {
      // Don't override explicit mute/unmute gestures on the video itself.
      const target = event?.target as Node | null;
      const path = (event as Event & { composedPath?: () => EventTarget[] })?.composedPath?.();
      if ((target && video.contains(target)) || (path && path.includes(video))) return;
      
      // Only retry if browser policy previously blocked unmuted autoplay.
      if (pendingUserGestureRetry) {
        void tryPlayWithAudio();
      }
    };
    window.addEventListener("pointerdown", retryAfterGesture);
    window.addEventListener("click", retryAfterGesture);
    window.addEventListener("keydown", retryAfterGesture);
    window.addEventListener("touchstart", retryAfterGesture);

    return () => {
      observer.disconnect();
      video.removeEventListener("pause", keepPlaying);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pointerdown", retryAfterGesture);
      window.removeEventListener("click", retryAfterGesture);
      window.removeEventListener("keydown", retryAfterGesture);
      window.removeEventListener("touchstart", retryAfterGesture);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden">
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
          <div className="mx-auto mt-10 max-w-3xl p-2 text-center">
            <h3 className="font-heading text-2xl font-semibold text-foreground">Explore the Impact Dashboard</h3>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              View donor-facing, anonymized insights on outcomes, progress, and how resources are used.
            </p>
            <Link
              to="/impact"
              className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground no-underline transition-opacity hover:opacity-90"
            >
              View Impact Dashboard <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
            <div className="mt-3">
              <Link
                to="/gallery"
                className="inline-flex items-center justify-center rounded-md border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground no-underline transition-colors hover:bg-muted"
              >
                Visit Gallery
              </Link>
            </div>
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

      <section aria-label="Our mission video" className="w-full bg-black">
        <div className="relative">
          <video
            ref={missionVideoRef}
            className="block h-auto w-full"
            playsInline
            preload="metadata"
            controls={false}
            onLoadedMetadata={() => {
              const video = missionVideoRef.current;
              if (!video) return;
              if (video.currentTime < 1) video.currentTime = 1;
            }}
            onClick={() => {
              const video = missionVideoRef.current;
              if (!video) return;
              const isAudible = !video.muted && video.volume > 0.01;
              fadeVideoMute(video, isAudible);
              if (isAudible) return;
              setNeedsSoundTap(false);
            }}
            onPointerDown={(event) => {
              // Keep global gesture listeners from racing this explicit toggle interaction.
              event.stopPropagation();
            }}
            onTouchStart={(event) => {
              event.stopPropagation();
            }}
          >
            <source src="/Our_Mission_Video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {needsSoundTap ? (
            <div className="pointer-events-none absolute bottom-4 right-4 rounded-md bg-black/70 px-3 py-1.5 text-xs font-semibold text-white">
              Tap video for sound
            </div>
          ) : null}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-warm via-warm/35 via-60% to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-background via-background/45 via-65% to-transparent" />
        </div>
      </section>

      <section id="donate" className="scroll-mt-24 pt-40 pb-20">
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
            to={donateHref}
            className="inline-flex w-full items-center justify-center rounded-md bg-accent px-6 py-3 text-base font-semibold text-accent-foreground transition hover:opacity-90"
          >
            Donate ₱{donationAmount?.toLocaleString() ?? "—"} <Heart className="ml-2 h-4 w-4" />
          </Link>
          <p className="mt-4 font-body text-xs text-muted-foreground">
            Haven Light Philippines is a registered nonprofit. All donations are tax-deductible.
          </p>
        </div>
      </section>

      <DonationPrompt />
    </div>
  );
}
