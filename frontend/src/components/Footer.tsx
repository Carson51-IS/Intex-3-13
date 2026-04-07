import { Link } from 'react-router-dom';
import havenLightLogoMark from '../assets/haven-light-logo-new.svg';

export default function Footer() {
  return (
    <footer className="hero-gradient py-12">
      <div className="container mx-auto px-6">
        <div className="grid gap-8 font-body text-sm text-primary-foreground/80 md:grid-cols-3">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <img src={havenLightLogoMark} alt="Haven Light logo mark" className="h-8 w-auto" />
              <h4 className="font-heading text-lg font-semibold text-primary-foreground">Haven Light Philippines</h4>
            </div>
            <p>Providing safe homes and healing for girls who are survivors of abuse and trafficking since 2013.</p>
          </div>
          <div>
            <h4 className="mb-3 font-heading font-semibold text-primary-foreground">Contact</h4>
            <div className="space-y-2">
              <p>info@havenlight.ph</p>
              <p>+63 (2) 8123-4567</p>
              <p>Metro Manila, Philippines</p>
            </div>
          </div>
          <div>
            <h4 className="mb-3 font-heading font-semibold text-primary-foreground">Quick Links</h4>
            <div className="space-y-2">
              <FooterLink to="/impact">Impact</FooterLink>
              <FooterLink to="/insights">Insights</FooterLink>
              <FooterLink to="/privacy">Privacy Policy</FooterLink>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-primary-foreground/20 pt-6 text-center font-body text-xs text-primary-foreground/50">
          &copy; {new Date().getFullYear()} Haven Light Philippines. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="block transition-colors hover:text-primary-foreground"
    >
      {children}
    </Link>
  );
}
