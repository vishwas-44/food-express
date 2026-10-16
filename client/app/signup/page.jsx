'use client';

import { useState } from 'react';
import Link from 'next/link';

import OtpVerification from '../../components/OtpVerification';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [showOtp, setShowOtp] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage('');
    setError(false);

    try {
      const response = await fetch(
        'http://localhost:8000/api/user/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(true);
        setMessage(
          data.message || 'Registration failed.'
        );
        return;
      }

      setError(false);
      setMessage(
        data.message ||
          'Registration successful. OTP sent to your email.'
      );

      setShowOtp(true);
    } catch (error) {
      setError(true);
      setMessage(
        'Unable to connect to the server. Please try again.'
      );
    }
  };

  if (showOtp) {
    return (
      <main style={{ paddingTop: '100px' }}>
        <OtpVerification
          email={formData.email}
          onVerificationSuccess={() => {
            window.location.href = '/login';
          }}
        />
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '120px 20px 60px',
        background: '#f7f7f7',
      }}
    >
      <div
        style={{
          maxWidth: '450px',
          margin: '0 auto',
          padding: '35px',
          background: '#fff',
          border: '1px solid #ddd',
          borderRadius: '12px',
        }}
      >
        <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>
          Create Account
        </h1>

        <p
          style={{
            textAlign: 'center',
            color: '#666',
            marginBottom: '30px',
          }}
        >
          Sign up to order your favourite food
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '7px',
                fontWeight: 'bold',
              }}
            >
              Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                fontSize: '15px',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '7px',
                fontWeight: 'bold',
              }}
            >
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                fontSize: '15px',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '7px',
                fontWeight: 'bold',
              }}
            >
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                fontSize: '15px',
              }}
            />
          </div>

          {message && (
            <p
              style={{
                color: error ? '#d32f2f' : '#2e7d32',
                marginBottom: '20px',
              }}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '13px',
              border: 'none',
              borderRadius: '7px',
              background: '#ff5722',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Sign Up
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            marginTop: '25px',
            color: '#666',
          }}
        >
          Already have an account?{' '}
          <Link
            href="/login"
            style={{
              color: '#ff5722',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}