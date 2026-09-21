import React, { useState } from 'react';
import { Lock, Eye, CheckCircle2, ShieldCheck, UserX } from 'lucide-react';

const PrivacySettings = () => {
  const [readReceipts, setReadReceipts] = useState(true);
  const [typingIndicators, setTypingIndicators] = useState(true);
  const [lastSeen, setLastSeen] = useState(true);

  return (
    <div style={{ width: '100%', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      {/* Title */}
      <div style={{ marginBottom: '16px' }}>
        <h2
          style={{
            fontSize: '22px',
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.025em',
            margin: '0 0 3px 0'
          }}
        >
          Privacy & Encryption
        </h2>
        <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
          Zyntra guarantees end-to-end encrypted messaging with zero server-side plaintext logging.
        </p>
      </div>

      {/* E2EE Certificate Card matching mockup */}
      <div
        style={{
          maxWidth: '640px',
          padding: '14px 18px',
          borderRadius: '12px',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}
      >
        <ShieldCheck size={22} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#14532d', marginBottom: '3px' }}>
            End-to-End Encryption Protocol Active
          </div>
          <p style={{ fontSize: '11px', color: '#15803d', margin: '0 0 6px 0', lineHeight: 1.45 }}>
            Your messages are encrypted on your device and can only be decrypted by the verified recipient. Keys are generated client-side.
          </p>
          <div
            style={{
              fontSize: '10px',
              fontFamily: 'monospace',
              fontWeight: 700,
              color: '#166534',
              backgroundColor: '#dcfce7',
              padding: '2px 8px',
              borderRadius: '4px',
              display: 'inline-block'
            }}
          >
            Fingerprint: 88AF-39C2-911E-4802
          </div>
        </div>
      </div>

      {/* Privacy Toggles matching mockup */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '640px' }}>
        {/* Read Receipts */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
              Read Receipts
            </div>
            <div style={{ fontSize: '10.5px', color: '#64748b' }}>
              Show when you have viewed messages in direct chats
            </div>
          </div>
          <button
            type="button"
            onClick={() => setReadReceipts(!readReceipts)}
            style={{
              padding: '4px 14px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: readReceipts ? '#1d63ff' : '#e2e8f0',
              color: readReceipts ? '#ffffff' : '#64748b',
              transition: 'all 0.15s'
            }}
          >
            {readReceipts ? 'On' : 'Off'}
          </button>
        </div>

        {/* Typing Indicators */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
              Typing Indicators
            </div>
            <div style={{ fontSize: '10.5px', color: '#64748b' }}>
              Let other participants see when you are drafting a message
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTypingIndicators(!typingIndicators)}
            style={{
              padding: '4px 14px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: typingIndicators ? '#1d63ff' : '#e2e8f0',
              color: typingIndicators ? '#ffffff' : '#64748b',
              transition: 'all 0.15s'
            }}
          >
            {typingIndicators ? 'On' : 'Off'}
          </button>
        </div>

        {/* Online Status & Last Seen */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
              Online Status & Last Seen
            </div>
            <div style={{ fontSize: '10.5px', color: '#64748b' }}>
              Broadcast your presence dot to mutual contacts
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLastSeen(!lastSeen)}
            style={{
              padding: '4px 14px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: lastSeen ? '#1d63ff' : '#e2e8f0',
              color: lastSeen ? '#ffffff' : '#64748b',
              transition: 'all 0.15s'
            }}
          >
            {lastSeen ? 'On' : 'Off'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;
