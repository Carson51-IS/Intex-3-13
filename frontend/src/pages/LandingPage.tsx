import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '6rem 2rem 5rem',
        background: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 60%, #4299e1 100%)',
        color: 'white',
        position: 'relative',
      }}>
        <h1 style={{ fontSize: '3.25rem', marginBottom: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
          Haven Light Philippines
        </h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '620px', margin: '0 auto 2.5rem', lineHeight: 1.7, opacity: 0.92 }}>
          Providing safe homes and rehabilitation for girls who are survivors of abuse and trafficking in the Philippines.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/impact"
            style={{
              padding: '0.85rem 2.25rem',
              backgroundColor: 'white',
              color: '#1a365d',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'; }}
          >
            See Our Impact
          </Link>
          <Link
            to="/insights"
            style={{
              padding: '0.85rem 2.25rem',
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: 'white',
              border: '2px solid rgba(255,255,255,0.6)',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)')}
          >
            View Insights
          </Link>
        </div>
      </section>

      {/* Mission Section */}
      <section style={{ padding: '4.5rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{
          fontSize: '2rem',
          textAlign: 'center',
          marginBottom: '1.5rem',
          color: '#1a365d',
          fontWeight: 700,
        }}>
          Our Mission
        </h2>
        <p style={{ fontSize: '1.1rem', lineHeight: 1.9, color: '#4a5568', textAlign: 'center' }}>
          We operate safe homes across the Philippines, providing holistic rehabilitation services
          including counseling, education, health care, and family reintegration support. Every girl
          deserves safety, dignity, and the opportunity to heal.
        </p>
      </section>

      {/* Stats Section */}
      <section style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
        padding: '3.5rem 2rem',
        backgroundColor: '#f7fafc',
        flexWrap: 'wrap',
      }}>
        {[
          { label: 'Safehouses', value: '9', color: '#2b6cb0' },
          { label: 'Girls Served', value: '60+', color: '#38a169' },
          { label: 'Supporters', value: '60+', color: '#dd6b20' },
        ].map((stat) => (
          <div key={stat.label} style={{
            textAlign: 'center',
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem 2.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
            borderTop: `4px solid ${stat.color}`,
            minWidth: '160px',
          }}>
            <div style={{ fontSize: '2.75rem', fontWeight: 700, color: stat.color }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.95rem', color: '#718096', marginTop: '0.5rem' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </section>

      {/* ML-Powered Insights Teaser */}
      <section style={{ padding: '4rem 2rem', maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.75rem', color: '#1a365d', marginBottom: '1rem' }}>
          Data-Driven Impact
        </h2>
        <p style={{ color: '#4a5568', maxWidth: '600px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
          We use machine learning to optimize our social media strategy, predict donor engagement,
          and track resident progress — ensuring every resource goes further.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          maxWidth: '700px',
          margin: '0 auto',
        }}>
          {[
            { label: 'ML Models Deployed', value: '6' },
            { label: 'Predictions Generated', value: '500+' },
            { label: 'Platforms Analyzed', value: '7' },
          ].map(s => (
            <div key={s.label} style={{
              backgroundColor: '#ebf8ff',
              borderRadius: '12px',
              padding: '1.25rem',
              border: '1px solid #bee3f8',
            }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#2b6cb0' }}>{s.value}</div>
              <div style={{ fontSize: '0.85rem', color: '#4a5568', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        textAlign: 'center',
        padding: '4rem 2rem',
        background: 'linear-gradient(135deg, #ebf8ff 0%, #e6fffa 100%)',
      }}>
        <h2 style={{ fontSize: '1.75rem', color: '#1a365d', marginBottom: '1rem' }}>
          Your generosity changes lives
        </h2>
        <p style={{ color: '#4a5568', maxWidth: '500px', margin: '0 auto 1.5rem', lineHeight: 1.7 }}>
          Every donation directly supports the safety, education, and healing of girls in our care.
        </p>
        <Link
          to="/impact"
          style={{
            display: 'inline-block',
            padding: '0.85rem 2.25rem',
            backgroundColor: '#2b6cb0',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(43,108,176,0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(43,108,176,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(43,108,176,0.3)'; }}
        >
          View Impact Dashboard
        </Link>
      </section>
    </div>
  );
}
