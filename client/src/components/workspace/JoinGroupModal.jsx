import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { KeyRound, Sparkles } from 'lucide-react';

const JoinGroupModal = ({ isOpen, onClose, onSubmit }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const formatCode = (val) => {
    const raw = val.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (raw.length <= 3) return raw;
    if (raw.length <= 7) return `${raw.slice(0, 3)}-${raw.slice(3)}`;
    return `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 12)}`;
  };

  const handleChange = (e) => {
    setError('');
    setCode(formatCode(e.target.value));
  };

  const handleQuickPaste = (sample) => {
    setCode(sample);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length < 8) {
      setError('Please enter a valid format: ZYN-XXXX-XXXX');
      return;
    }

    if (onSubmit) {
      const result = await onSubmit(code);
      if (result && !result.success) {
        setError(result.error || 'Invalid code');
        return;
      }
    }

    setCode('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join Group with Code" size="sm">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
          Enter the official channel join code provided by your workspace administrator or team leader.
        </p>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 700,
              color: '#1e293b',
              marginBottom: '6px'
            }}
          >
            Channel Join Code
          </label>
          <input
            value={code}
            onChange={handleChange}
            placeholder="ZYN-XXXX-XXXX"
            style={{
              width: '100%',
              padding: '11px 14px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '13.5px',
              color: '#0f172a',
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.15)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#cbd5e1';
              e.target.style.boxShadow = 'none';
            }}
            autoFocus
          />
          {error && (
            <p style={{ marginTop: '6px', fontSize: '12px', color: '#ef4444', fontWeight: 600 }}>
              {error}
            </p>
          )}
        </div>

        {/* Quick Demo Test Buttons */}
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '10.5px',
              fontWeight: 700,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            <Sparkles size={13} color="#3b82f6" />
            <span>Quick Demo Test Codes (Click to try)</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickPaste('ZYN-GIET-1132')}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                fontSize: '11px',
                fontFamily: 'monospace',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.color = '#1d63ff';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.color = '#334155';
              }}
            >
              ZYN-GIET-1132 (Frontend)
            </button>
            <button
              type="button"
              onClick={() => handleQuickPaste('ZYN-ABC-1210')}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                fontSize: '11px',
                fontFamily: 'monospace',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.color = '#1d63ff';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.color = '#334155';
              }}
            >
              ZYN-ABC-1210 (React Team)
            </button>
          </div>
        </div>

        <div
          style={{
            paddingTop: '16px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#475569',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!code.trim()}
            style={{
              padding: '9px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: code.trim() ? '#1d63ff' : '#94a3b8',
              color: '#ffffff',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: code.trim() ? 'pointer' : 'not-allowed',
              boxShadow: code.trim() ? '0 2px 6px rgba(29, 99, 255, 0.25)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Join Channel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default JoinGroupModal;
