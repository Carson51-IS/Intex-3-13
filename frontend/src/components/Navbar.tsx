import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import havenLightLogoMark from '../assets/haven-light-logo-new.svg';

export default function Navbar() {
  const { user, isLoading, isAdmin, isDonor } = useAuth();
  const isRegularUser = Boolean(user && !isAdmin && !isDonor);

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-1 no-underline">
          <img src={havenLightLogoMark} alt="Haven Light logo mark" className="h-10 w-auto" />
          <div className="leading-tight">
            <div className="font-heading text-lg font-semibold text-foreground">Haven Light</div>
            <div className="font-body text-xs tracking-[0.18em] text-muted-foreground">PHILIPPINES</div>
          </div>
        </Link>
        {isLoading ? (
          <span className="text-sm text-muted-foreground">Loading…</span>
        ) : isRegularUser ? null : (
          <nav className="hidden items-center gap-8 font-body text-sm md:flex">
            <a href="/#mission" className="text-muted-foreground transition-colors hover:text-foreground">
              Mission
            </a>
            <a href="/#impact" className="text-muted-foreground transition-colors hover:text-foreground">
              Impact
            </a>
            <a href="/#how" className="text-muted-foreground transition-colors hover:text-foreground">
              How It Works
            </a>
            <a href="/#donate" className="text-muted-foreground transition-colors hover:text-foreground">
              Donate
            </a>
            {!user ? (
              <Link
                to="/login"
                className="rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground shadow-sm transition-all hover:translate-y-[-1px] hover:opacity-95"
              >
                Login
              </Link>
            ) : null}
          </nav>
        )}
      </div>
    </header>
  );
}
