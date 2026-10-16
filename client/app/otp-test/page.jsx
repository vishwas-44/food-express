'use client';

import OtpVerification from '../../components/OtpVerification';

export default function OtpTestPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        paddingTop: '100px',
        background: '#f7f7f7',
      }}
    >
      <OtpVerification
        email="test@example.com"
        onVerificationSuccess={() => {
          alert('OTP verification successful!');
        }}
      />
    </main>
  );
}