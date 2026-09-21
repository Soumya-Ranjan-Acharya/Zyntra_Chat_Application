import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    }
  });

  const handleFillDemo = () => {
    setValue('email', 'soumya@zyntra.com');
    setValue('password', 'password123');
    setApiError(null);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await login(data.email.trim(), data.password);
      if (res && res.success) {
        navigate('/');
      } else {
        setApiError(res?.error || 'Invalid email or password. Please check your credentials.');
      }
    } catch (err) {
      setApiError(err.message || 'Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '380px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
      }}
    >
      {/* Header matching media_1789559066111.png */}
      <div style={{ marginBottom: '22px' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#64748b',
            letterSpacing: '0.05em',
            display: 'block',
            marginBottom: '6px'
          }}
        >
          Secure sign in
        </span>
        <h2
          style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.03em',
            margin: '0 0 4px 0',
            lineHeight: 1.2
          }}
        >
          Welcome back
        </h2>
        <p
          style={{
            fontSize: '12px',
            color: '#64748b',
            margin: 0
          }}
        >
          Sign in to continue to Zyntra
        </p>
      </div>

      {apiError && (
        <div
          style={{
            marginBottom: '14px',
            padding: '10px 12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#b91c1c',
            fontSize: '12.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{apiError}</span>
        </div>
      )}

      {/* Quick Demo Fill Pill */}
      <div style={{ marginBottom: '12px' }}>
        <button
          type="button"
          onClick={handleFillDemo}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            backgroundColor: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 600,
            color: '#475569',
            cursor: 'pointer',
          }}
        >
          <Sparkles size={12} color="#3b82f6" />
          Fill Demo: soumya@zyntra.com
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Email */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: '#334155',
              marginBottom: '6px'
            }}
          >
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
          {errors.email && (
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#ef4444' }}>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: '#334155',
              marginBottom: '6px'
            }}
          >
            Password
          </label>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              {...register('password', { required: 'Password is required' })}
              style={{
                width: '100%',
                padding: '10px 38px 10px 14px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box',
                letterSpacing: showPassword ? 'normal' : '0.15em'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                padding: 0
              }}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#ef4444' }}>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember me & Forgot Password */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '2px'
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              {...register('rememberMe')}
              style={{
                width: '15px',
                height: '15px',
                accentColor: '#1d63ff',
                cursor: 'pointer',
                margin: 0
              }}
            />
            <span style={{ fontSize: '12px', color: '#475569', fontWeight: 500 }}>
              Remember me
            </span>
          </label>
          <Link
            to="/forgot-password"
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#1d63ff',
              textDecoration: 'none'
            }}
          >
            Forgot password?
          </Link>
        </div>

        {/* Sign in button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '11px 16px',
            backgroundColor: '#1d63ff',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
            marginTop: '4px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      {/* Divider */}
      <div
        style={{
          position: 'relative',
          margin: '20px 0',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            height: '1px',
            backgroundColor: '#e2e8f0'
          }}
        />
        <span
          style={{
            position: 'relative',
            padding: '0 10px',
            backgroundColor: '#ffffff',
            fontSize: '11px',
            color: '#94a3b8'
          }}
        >
          New to Zyntra?
        </span>
      </div>

      {/* Create an account button */}
      <Link
        to="/register"
        style={{
          width: '100%',
          padding: '10px 16px',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          color: '#1d63ff',
          fontSize: '13px',
          fontWeight: 600,
          textAlign: 'center',
          textDecoration: 'none',
          backgroundColor: '#ffffff',
          boxSizing: 'border-box',
          display: 'block'
        }}
      >
        Create an account
      </Link>

      {/* Footer */}
      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '10px', color: '#94a3b8', lineHeight: 1.5 }}>
          By continuing, you agree to Zyntra's Terms and Privacy Policy.
        </p>
        <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#94a3b8' }}>
          © Zyntra
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
