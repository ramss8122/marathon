import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaRightToBracket,
  FaShieldHalved,
  FaCircleExclamation,
  FaArrowLeft,
  FaDatabase
} from 'react-icons/fa6';
import Logo from '../../components/Logo';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState(null);

  // If already logged in with a valid token, redirect to dashboard
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      // Verify the token is real (not a dev token) before redirecting
      if (!token.startsWith('dev-token-')) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        // Remove stale dev tokens
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    }

    // Check backend health
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setDbStatus(data.database?.connected ? 'connected' : 'disconnected'))
      .catch(() => setDbStatus('offline'));
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        navigate('/admin/dashboard', { replace: true });
      } else {
        setError(data.message || 'Invalid username or password. Please verify your credentials.');
      }
    } catch {
      // Backend is unreachable — do NOT authenticate, show a clear error
      setError('Unable to connect to the server. Please ensure the backend is running and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-container">
        {/* Top Back Link */}
        <div className="admin-login-back-bar">
          <Link to="/" className="admin-back-link">
            <FaArrowLeft className="back-icon" />
            <span>Return to Public Website</span>
          </Link>

          {dbStatus && (
            <div className={`db-pill ${dbStatus === 'connected' ? 'connected' : 'offline'}`}>
              <FaDatabase />
              <span>{dbStatus === 'connected' ? 'MongoDB Online' : 'Server Offline'}</span>
            </div>
          )}
        </div>

        {/* Card */}
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-logo-wrap">
              <Logo size="medium" clickable={false} />
            </div>
            <div className="admin-portal-badge">
              <FaShieldHalved />
              <span>ADMIN CONSOLE</span>
            </div>
            <h1 className="admin-login-title">Administrator Sign In</h1>
            <p className="admin-login-subtitle">
              Secure portal for race coordinators, participant registrations, and contact messages.
            </p>
          </div>

          {error && (
            <div className="admin-login-alert error" role="alert">
              <FaCircleExclamation className="alert-icon" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="admin-form-group">
              <label htmlFor="admin-username" className="admin-form-label">
                Username
              </label>
              <div className="admin-input-wrap">
                <FaUser className="admin-input-icon" />
                <input
                  id="admin-username"
                  type="text"
                  className="admin-input"
                  placeholder="Enter administrator username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label htmlFor="admin-password" className="admin-form-label">
                Password
              </label>
              <div className="admin-input-wrap">
                <FaLock className="admin-input-icon" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  className="admin-input"
                  placeholder="Enter administrator password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="admin-pwd-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block admin-login-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Verifying Credentials...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <FaRightToBracket className="btn-icon" />
                </>
              )}
            </button>
          </form>

          {/* Security Note */}
          <div className="admin-security-note">
            <FaShieldHalved className="sec-icon" />
            <p>
              <strong>Restricted Access:</strong> This portal is for authorized RUNORA administrators only.
              Unauthorized access attempts are logged and may be prosecuted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
