'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const sendOtp = async (event) => {
    event.preventDefault();

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch(
        'http://localhost:8000/api/user/forgot-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(
          data.message || 'Failed to send OTP.'
        );
        return;
      }

      setSuccessMsg(
        'OTP has been sent to your email address.'
      );

      setStep(2);
    } catch (error) {
      setErrorMsg(
        'Unable to connect to the server. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch(
        'http://localhost:8000/api/user/verify-reset-otp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(
          data.message || 'Invalid OTP.'
        );
        return;
      }

      setSuccessMsg(
        'OTP verified successfully.'
      );

      setStep(3);
    } catch (error) {
      setErrorMsg(
        'Unable to connect to the server. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();

    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setErrorMsg(
        'Password must be at least 6 characters long.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg(
        'Passwords do not match.'
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        'http://localhost:8000/api/user/reset-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            otp,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(
          data.message || 'Failed to reset password.'
        );
        return;
      }

      setSuccessMsg(
        'Password reset successfully!'
      );

      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error) {
      setErrorMsg(
        'Unable to connect to the server. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    padding: '120px 20px 60px',
    background: '#f7f7f7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const cardStyle = {
    width: '100%',
    maxWidth: '450px',
    padding: '35px',
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: '12px',
    boxSizing: 'border-box',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '15px',
    boxSizing: 'border-box',
  };

  const buttonStyle = {
    width: '100%',
    padding: '13px',
    border: 'none',
    borderRadius: '7px',
    background: '#ff5722',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
  };

  return (
    <main style={containerStyle}>
      <div style={cardStyle}>

        {/* Title */}
        <h1
          style={{
            textAlign: 'center',
            marginBottom: '10px',
            fontSize: '32px',
          }}
        >
          {step === 1 && 'Forgot Password'}
          {step === 2 && 'Verify OTP'}
          {step === 3 && 'Create New Password'}
        </h1>

        {/* Description */}
        <p
          style={{
            textAlign: 'center',
            color: '#666',
            marginBottom: '30px',
            lineHeight: '1.5',
          }}
        >
          {step === 1 &&
            'Enter your registered email to receive an OTP.'}

          {step === 2 &&
            `Enter the 6-digit OTP sent to ${email}.`}

          {step === 3 &&
            'Create a new password for your account.'}
        </p>

        {/* Error */}
        {errorMsg && (
          <div
            style={{
              background: '#ffebee',
              color: '#d32f2f',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '14px',
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Success */}
        {successMsg && (
          <div
            style={{
              background: '#e8f5e9',
              color: '#2e7d32',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '14px',
            }}
          >
            {successMsg}
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <form onSubmit={sendOtp}>

            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '7px',
                  fontWeight: 'bold',
                }}
              >
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter your registered email"
                required
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={buttonStyle}
            >
              {loading
                ? 'Sending OTP...'
                : 'Send OTP'}
            </button>
          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form onSubmit={verifyOtp}>

            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '7px',
                  fontWeight: 'bold',
                }}
              >
                6-Digit OTP
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(event) =>
                  setOtp(
                    event.target.value.replace(
                      /\D/g,
                      ''
                    )
                  )
                }
                placeholder="Enter 6-digit OTP"
                required
                style={{
                  ...inputStyle,
                  textAlign: 'center',
                  fontSize: '20px',
                  letterSpacing: '6px',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={
                loading || otp.length !== 6
              }
              style={{
                ...buttonStyle,
                opacity:
                  loading || otp.length !== 6
                    ? 0.6
                    : 1,
              }}
            >
              {loading
                ? 'Verifying...'
                : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp('');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '10px',
                border: 'none',
                background: 'transparent',
                color: '#ff5722',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Change Email
            </button>
          </form>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <form onSubmit={resetPassword}>

            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '7px',
                  fontWeight: 'bold',
                }}
              >
                New Password
              </label>

              <div style={{ position: 'relative' }}>
                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(
                      event.target.value
                    )
                  }
                  placeholder="Enter new password"
                  required
                  style={{
                    ...inputStyle,
                    paddingRight: '45px',
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform:
                      'translateY(-50%)',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#666',
                  }}
                >
                  {showPassword
                    ? 'Hide'
                    : 'Show'}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '7px',
                  fontWeight: 'bold',
                }}
              >
                Confirm Password
              </label>

              <div style={{ position: 'relative' }}>
                <input
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  placeholder="Confirm new password"
                  required
                  style={{
                    ...inputStyle,
                    paddingRight: '45px',
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform:
                      'translateY(-50%)',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#666',
                  }}
                >
                  {showConfirmPassword
                    ? 'Hide'
                    : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={buttonStyle}
            >
              {loading
                ? 'Resetting Password...'
                : 'Reset Password'}
            </button>
          </form>
        )}

        {/* Login link */}
        <p
          style={{
            textAlign: 'center',
            marginTop: '25px',
            color: '#666',
          }}
        >
          Remember your password?{' '}

          <Link
            href="/login"
            style={{
              color: '#ff5722',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            Sign In
          </Link>
        </p>

      </div>
    </main>
  );
}