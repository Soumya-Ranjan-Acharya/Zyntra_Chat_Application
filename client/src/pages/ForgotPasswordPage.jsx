import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: 'you@example.com' }
  });

  useEffect(() => {
    document.title = 'Zyntra — Reset Password';
  }, []);

  const onSubmit = () => {
    setSubmitted(true);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#e2e5ea',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px 16px',
        boxSizing: 'border-box',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div
          style={{
            marginBottom: '12px',
            paddingLeft: '4px',
            fontSize: '13px',
            fontWeight: 500,
            color: '#64748b',
            userSelect: 'none'
          }}
        >
          Zyntra — Account Recovery
        </div>

        <div
          style={{
            width: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.15)',
            padding: '36px 32px',
            border: '1px solid #d1d5db',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: '#eff6ff',
              color: '#1d63ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px'
            }}
          >
            <Mail size={22} />
          </div>

          <h2
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.025em',
              margin: '0 0 6px 0'
            }}
          >
            Reset password
          </h2>
          <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: '0 0 20px 0' }}>
            Enter your email address and we will dispatch a secure reset link.
          </p>

          {submitted ? (
            <div
              style={{
                padding: '14px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                marginBottom: '20px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>
                <CheckCircle2 size={16} />
                Reset link dispatched
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: '#15803d', lineHeight: 1.4 }}>
                Check your inbox for instructions to securely reset your primary password.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register('email', { required: 'Email is required' })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {errors.email && <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#ef4444' }}>{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '11px',
                  backgroundColor: '#1d63ff',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Send reset link
              </button>
            </form>
          )}

          <div style={{ marginTop: '22px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#1d63ff',
                textDecoration: 'none'
              }}
            >
              <ArrowLeft size={14} /> Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
