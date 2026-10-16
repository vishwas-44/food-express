'use client';

import {
  useState,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import Link from 'next/link';

export default function ChangePasswordPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage('');
    setError(false);

    if (
      formData.newPassword !==
      formData.confirmPassword
    ) {
      setError(true);
      setMessage(
        'New password and confirm password do not match.'
      );
      return;
    }

    if (formData.newPassword.length < 6) {
      setError(true);
      setMessage(
        'New password must be at least 6 characters.'
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        'http://localhost:8000/api/user/change-password',
        {
          method: 'PUT',
          headers: {
            'Content-Type':
              'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            currentPassword:
              formData.currentPassword,
            newPassword:
              formData.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(true);
        setMessage(
          data.message ||
            'Failed to change password.'
        );
        return;
      }

      setError(false);
      setMessage(
        data.message ||
          'Password changed successfully.'
      );

      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setTimeout(() => {
        router.push('/profile');
      }, 1000);
    } catch (error) {
      console.error(
        'Change password error:',
        error
      );

      setError(true);
      setMessage(
        'Unable to connect to the server.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        paddingTop: '110px',
        paddingBottom: '60px',
        background: '#f7f7f7',
      }}
    >
      <div
        style={{
          maxWidth: '550px',
          margin: '0 auto',
          padding: '30px 20px',
        }}
      >
        <div
          style={{
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '12px',
            padding: '30px',
          }}
        >
          <h1
            style={{
              marginBottom: '10px',
            }}
          >
            Change Password
          </h1>

          <p
            style={{
              color: '#666',
              marginBottom: '30px',
            }}
          >
            Enter your current password and
            choose a new password.
          </p>

          {message && (
            <div
              style={{
                padding: '12px',
                marginBottom: '20px',
                borderRadius: '7px',
                background: error
                  ? '#ffebee'
                  : '#e8f5e9',
                color: error
                  ? '#d32f2f'
                  : '#2e7d32',
              }}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Current Password */}
            <div
              style={{
                marginBottom: '20px',
              }}
            >
              <label
                style={{
                  display: 'block',
                  marginBottom: '7px',
                  fontWeight: 'bold',
                }}
              >
                Current Password
              </label>

              <input
                type="password"
                name="currentPassword"
                value={
                  formData.currentPassword
                }
                onChange={handleChange}
                placeholder="Enter current password"
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

            {/* New Password */}
            <div
              style={{
                marginBottom: '20px',
              }}
            >
              <label
                style={{
                  display: 'block',
                  marginBottom: '7px',
                  fontWeight: 'bold',
                }}
              >
                New Password
              </label>

              <input
                type="password"
                name="newPassword"
                value={
                  formData.newPassword
                }
                onChange={handleChange}
                placeholder="Enter new password"
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  fontSize: '15px',
                }}
              />
            </div>

            {/* Confirm Password */}
            <div
              style={{
                marginBottom: '25px',
              }}
            >
              <label
                style={{
                  display: 'block',
                  marginBottom: '7px',
                  fontWeight: 'bold',
                }}
              >
                Confirm New Password
              </label>

              <input
                type="password"
                name="confirmPassword"
                value={
                  formData.confirmPassword
                }
                onChange={handleChange}
                placeholder="Confirm new password"
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  fontSize: '15px',
                }}
              />
            </div>

            {/* Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px 22px',
                  border: 'none',
                  borderRadius: '7px',
                  background: '#ff5722',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  cursor: loading
                    ? 'not-allowed'
                    : 'pointer',
                  opacity: loading
                    ? 0.7
                    : 1,
                }}
              >
                {loading
                  ? 'Changing...'
                  : 'Change Password'}
              </button>

              <Link
                href="/profile"
                style={{
                  padding: '12px 22px',
                  border: '1px solid #ddd',
                  borderRadius: '7px',
                  color: '#333',
                  textDecoration: 'none',
                  background: '#fff',
                }}
              >
                Cancel
              </Link>
            </div>
          </form>

          <div
            style={{
              marginTop: '25px',
              paddingTop: '20px',
              borderTop:
                '1px solid #eee',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                color: '#777',
                fontSize: '14px',
              }}
            >
              Forgot your password?
            </span>{' '}

            <Link
              href="/forgot-password"
              style={{
                color: '#ff5722',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              Reset using OTP
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}