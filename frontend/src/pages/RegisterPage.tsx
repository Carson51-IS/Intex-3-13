import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { registerUser } from '../lib/AuthAPI';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  function handleConfirmPassword(): boolean {
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!handleConfirmPassword()) return;

    setIsSubmitting(true);
    try {
      await registerUser(email, password);
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 200px)', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '2.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', backgroundColor: 'white' }}>
        <h1 style={{ fontSize: '1.5rem', textAlign: 'center', color: '#1a365d', marginBottom: '1.5rem' }}>
          Create Account
        </h1>

        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: '#fed7d7', color: '#c53030', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="registerEmail" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#4a5568' }}>
              Email
            </label>
            <input
              id="registerEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{ width: '100%', padding: '0.625rem', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="registerPassword" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#4a5568' }}>
              Password
            </label>
            <input
              id="registerPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              style={{ width: '100%', padding: '0.625rem', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box' }}
            />
            <small style={{ color: '#718096' }}>
              Use at least 12 characters, including uppercase, lowercase, number, and special character.
            </small>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#4a5568' }}>
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              style={{ width: '100%', padding: '0.625rem', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '1rem', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{ width: '100%', padding: '0.75rem', backgroundColor: isSubmitting ? '#a0aec0' : '#2b6cb0', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
          >
            {isSubmitting ? 'Creating account...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}
