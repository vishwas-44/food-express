'use client';

import { useContext, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { MyContext } from '../../context/ThemeContext';

export default function LoginPage() {
  const router = useRouter();
  const context = useContext(MyContext);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

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
        'http://localhost:8000/api/user/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(true);
        setMessage(
          data.message || 'Login failed.'
        );
        return;
      }

      setError(false);
      setMessage(
        data.message || 'Login successful!'
      );

      // Update global login state
      if (context) {
        context.setIsLoggedIn(true);
        context.setUserDetails(data.data);
      }

      // Redirect based on user role
      if (data.data?.role === 'Admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (error) {
      setError(true);
      setMessage(
        'Unable to connect to the server. Please try again.'
      );
    }
  };

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
        <h1
          style={{
            textAlign: 'center',
            marginBottom: '10px',
          }}
        >
          Welcome Back
        </h1>

        <p
          style={{
            textAlign: 'center',
            color: '#666',
            marginBottom: '30px',
          }}
        >
          Login to continue ordering your favourite food
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

          <div style={{ marginBottom: '10px' }}>
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
              placeholder="Enter your password"
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

          {/* Forgot Password */}
          <div
            style={{
              textAlign: 'right',
              marginBottom: '20px',
            }}
          >
            <Link
              href="/forgot-password"
              style={{
                color: '#ff5722',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
            >
              Forgot Password?
            </Link>
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
            Login
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            marginTop: '25px',
            color: '#666',
          }}
        >
          Don't have an account?{' '}

          <Link
            href="/signup"
            style={{
              color: '#ff5722',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
}