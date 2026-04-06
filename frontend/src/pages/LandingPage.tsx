import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '5rem 2rem',
        background: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 100%)',
        color: 'white',
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: 700 }}>
          Haven Light Philippines
        </h1>
        <p style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
          Providing safe homes and rehabilitation for girls who are survivors of abuse and trafficking in the Philippines.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link
            to="/impact"
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: 'white',
              color: '#1a365d',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            See Our Impact
          </Link>
          <Link
            to="/login"
            style={{
              padding: '0.75rem 2rem',
              border: '2px solid white',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Staff Portal
          </Link>
        </div>
      </section>

      {/* Mission Section */}
      <section style={{ padding: '4rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '2rem', color: '#1a365d' }}>
          Our Mission
        </h2>
        <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#4a5568', textAlign: 'center' }}>
          We operate safe homes across the Philippines, providing holistic rehabilitation services
          including counseling, education, health care, and family reintegration support. Every girl
          deserves safety, dignity, and the opportunity to heal.
        </p>
      </section>

      {/* Stats Section */}
      <section style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '3rem',
        padding: '3rem 2rem',
        backgroundColor: '#f7fafc',
        flexWrap: 'wrap',
      }}>
        {[
          { label: 'Safehouses', value: '9' },
          { label: 'Girls Served', value: '60+' },
          { label: 'Supporters', value: '60+' },
        ].map((stat) => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#2b6cb0' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '1rem', color: '#718096', marginTop: '0.5rem' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </section>

      {/* CTA Section */}
      <section style={{
        textAlign: 'center',
        padding: '4rem 2rem',
        backgroundColor: '#ebf8ff',
      }}>
        <h2 style={{ fontSize: '1.75rem', color: '#1a365d', marginBottom: '1rem' }}>
          Your generosity changes lives
        </h2>
        <p style={{ color: '#4a5568', maxWidth: '500px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
          Every donation directly supports the safety, education, and healing of girls in our care.
        </p>
        <Link
          to="/impact"
          style={{
            display: 'inline-block',
            padding: '0.75rem 2rem',
            backgroundColor: '#2b6cb0',
            color: 'white',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          View Impact Dashboard
        </Link>
      </section>
    </div>
  );
}
