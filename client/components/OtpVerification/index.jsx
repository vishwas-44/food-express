'use client';

import { useRef, useState } from 'react';

export default function OtpVerification({
  email,
  onVerificationSuccess,
}) {
  const [otp, setOtp] = useState([
    '',
    '',
    '',
    '',
    '',
    '',
  ]);

  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    // Allow only one number
    if (!/^\d?$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;

    setOtp(newOtp);
    setMessage('');
    setError(false);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    // Move to previous input when Backspace is pressed
    if (
      event.key === 'Backspace' &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();

    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError(true);
      setMessage('Please enter the complete 6-digit OTP.');
      return;
    }

    try {
      setMessage('');
      setError(false);

      const response = await fetch(
        'http://localhost:8000/api/user/verify-email',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            otp: otpCode,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(true);
        setMessage(data.message || 'OTP verification failed.');
        return;
      }

      setError(false);
      setMessage(data.message || 'Email verified successfully!');

      if (onVerificationSuccess) {
        onVerificationSuccess();
      }
    } catch (error) {
      setError(true);
      setMessage(
        'Unable to connect to the server. Please try again.'
      );
    }
  };

  return (
    <div
      style={{
        maxWidth: '450px',
        margin: '40px auto',
        padding: '30px',
        border: '1px solid #ddd',
        borderRadius: '12px',
        background: '#fff',
        textAlign: 'center',
      }}
    >
      <h2>Verify Your Email</h2>

      <p style={{ color: '#666', marginBottom: '25px' }}>
        Enter the 6-digit OTP sent to:
      </p>

      <strong>{email}</strong>

      <form onSubmit={handleVerify}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            margin: '30px 0',
          }}
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputRefs.current[index] = element;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(event) =>
                handleChange(index, event.target.value)
              }
              onKeyDown={(event) =>
                handleKeyDown(index, event)
              }
              style={{
                width: '45px',
                height: '50px',
                textAlign: 'center',
                fontSize: '22px',
                fontWeight: 'bold',
                border: '1px solid #ccc',
                borderRadius: '6px',
                outline: 'none',
              }}
            />
          ))}
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
          Verify OTP
        </button>
      </form>
    </div>
  );
}