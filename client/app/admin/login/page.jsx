'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage(
        'Please enter your admin email and password.'
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        'http://localhost:8000/api/admin/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Admin login failed'
        );
      }

      router.push('/admin');
    } catch (error) {
      console.error('Admin login error:', error);

      setErrorMessage(
        error.message || 'Invalid admin credentials'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: '#ffffff',
          padding: '35px',
          borderRadius: '12px',
          boxShadow: '0 5px 25px rgba(0,0,0,0.1)',
        }}
      >
        <h1
          style={{
            textAlign: 'center',
            marginBottom: '8px',
          }}
        >
          Admin Login
        </h1>

        <p
          style={{
            textAlign: 'center',
            color: '#777',
            marginBottom: '30px',
          }}
        >
          Sign in to access the admin dashboard
        </p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '18px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '7px',
                fontWeight: '600',
              }}
            >
              Admin Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter admin email"
              autoComplete="username"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '7px',
                fontSize: '15px',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '7px',
                fontWeight: '600',
              }}
            >
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter admin password"
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '7px',
                fontSize: '15px',
              }}
            />
          </div>

          {errorMessage && (
            <div
              style={{
                background: '#ffe5e5',
                color: '#c62828',
                padding: '10px 12px',
                borderRadius: '7px',
                marginBottom: '18px',
                fontSize: '14px',
              }}
            >
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              border: 'none',
              borderRadius: '7px',
              background: '#111827',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading
                ? 'not-allowed'
                : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Logging in...' : 'Admin Login'}
          </button>
        </form>
      </div>
    </main>
  );
}