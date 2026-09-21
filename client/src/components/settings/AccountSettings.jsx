import React, { useState } from 'react';
import useAuthStore from '../../store/useAuthStore';
import { Shield, Key, AlertTriangle, Check } from 'lucide-react';

const AccountSettings = () => {
  const user = useAuthStore((s) => s.user);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordSaved(true);
    setTimeout(() => {
      setPasswordSaved(false);
      setShowPasswordForm(false);
    }, 1500);
  };

  return (
    <div style={{ width: '100%', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      {/* Title */}
      <div style={{ marginBottom: '18px' }}>
        <h2
          style={{
            fontSize: '22px',
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.025em',
            margin: '0 0 4px 0'
          }}
        >
          Account Security
        </h2>
        <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
          Manage credentials, two-factor authentication, and account access.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '660px' }}>
        {/* Email Address Section */}
        <div style={{ paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            Primary Account Email
          </label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px'
            }}
          >
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a' }}>
              {user?.email || 'soumya@zyntra.com'}
            </span>
            <button
              type="button"
              onClick={() => alert('Email update verification sent')}
              style={{
                fontSize: '11.5px',
                fontWeight: 600,
                color: '#1d63ff',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Update Email
            </button>
          </div>
        </div>

        {/* Password Section */}
        <div style={{ paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            Password & Credentials
          </label>
          {!showPasswordForm ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            >
              <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace', letterSpacing: '0.15em' }}>
                ••••••••••••••••
              </span>
              <button
                type="button"
                onClick={() => setShowPasswordForm(true)}
                style={{
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: '#1d63ff',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Change Password
              </button>
            </div>
          ) : (
            <form
              onSubmit={handlePasswordSubmit}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '14px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  defaultValue="password123"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '12px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '12px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: '#64748b',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '5px 14px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    backgroundColor: '#1d63ff',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {passwordSaved ? 'Updated!' : 'Save New Password'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Two-Factor Authentication */}
        <div style={{ paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                <Shield size={16} color="#16a34a" />
                Two-Factor Authentication (2FA)
              </div>
              <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
                Protect your account using an authenticator app or hardware key.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTwoFactor(!twoFactor)}
              style={{
                padding: '4px 14px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: twoFactor ? '#16a34a' : '#e2e8f0',
                color: twoFactor ? '#ffffff' : '#64748b',
                transition: 'all 0.15s'
              }}
            >
              {twoFactor ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: '10px',
            border: '1px solid #fecaca',
            backgroundColor: '#fef2f2'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b91c1c', fontWeight: 800, fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
            <AlertTriangle size={15} />
            Danger Zone
          </div>
          <p style={{ fontSize: '11px', color: '#991b1b', lineHeight: 1.4, margin: '0 0 12px 0' }}>
            Deleting your account will permanently revoke your primary username and access across all affiliated workspaces.
          </p>
          <button
            type="button"
            onClick={() => alert('Account deletion confirmation dialog (Safety locked in demo)')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              fontSize: '11.5px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Delete Account Permanently
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
