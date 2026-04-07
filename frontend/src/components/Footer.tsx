import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      textAlign: 'center',
      padding: '2rem 2rem',
      backgroundColor: '#1a202c',
      color: '#a0aec0',
      fontSize: '0.875rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <FooterLink to="/impact">Impact</FooterLink>
        <FooterLink to="/insights">Insights</FooterLink>
        <FooterLink to="/privacy">Privacy Policy</FooterLink>
      </div>
      <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} Haven Light Philippines. All rights reserved.</p>
    </footer>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      style={{
        color: '#cbd5e0',
        textDecoration: 'none',
        transition: 'color 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = 'white')}
      onMouseLeave={e => (e.currentTarget.style.color = '#cbd5e0')}
    >
      {children}
    </Link>
  );
}
