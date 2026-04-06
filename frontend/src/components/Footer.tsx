import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      textAlign: 'center',
      padding: '1.5rem 2rem',
      backgroundColor: '#2d3748',
      color: '#a0aec0',
      fontSize: '0.875rem',
    }}>
      <p>&copy; {new Date().getFullYear()} Haven Light Philippines. All rights reserved.</p>
      <Link to="/privacy" style={{ color: '#cbd5e0', textDecoration: 'underline' }}>
        Privacy Policy
      </Link>
    </footer>
  );
}
