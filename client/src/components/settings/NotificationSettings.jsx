import React, { useState } from 'react';
import { Volume2, Mail, Smartphone } from 'lucide-react';
import { workspaces } from '../../data/mockData';

const NotificationSettings = () => {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const [workspaceAlerts, setWorkspaceAlerts] = useState({
    'ws-giet': 'All Alerts',
    'ws-abc': 'All Alerts',
  });

  const toggleAlert = (wsId) => {
    setWorkspaceAlerts((prev) => ({
      ...prev,
      [wsId]: prev[wsId] === 'All Alerts' ? 'Mentions Only' : 'All Alerts',
    }));
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
          Notification Preferences
        </h2>
        <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
          Configure alerts, message previews, and per-workspace notifications.
        </p>
      </div>

      {/* Primary Notification Channels */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '660px',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          overflow: 'hidden',
          marginBottom: '22px'
        }}
      >
        {/* Desktop & Push Alerts */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '11px 16px',
            borderBottom: '1px solid #f1f5f9',
            backgroundColor: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1d63ff'
              }}
            >
              <Smartphone size={19} />
            </div>
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
                Desktop & Push Alerts
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                Receive instant incoming banner notifications
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPushEnabled(!pushEnabled)}
            style={{
              padding: '4px 15px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: pushEnabled ? '#1d63ff' : '#e2e8f0',
              color: pushEnabled ? '#ffffff' : '#64748b',
              transition: 'all 0.15s'
            }}
          >
            {pushEnabled ? 'On' : 'Off'}
          </button>
        </div>

        {/* In-App Audio Chimes */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '11px 16px',
            borderBottom: '1px solid #f1f5f9',
            backgroundColor: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#a855f7'
              }}
            >
              <Volume2 size={19} />
            </div>
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
                In-App Audio Chimes
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                Play subtle sound on incoming direct messages
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              padding: '4px 15px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: soundEnabled ? '#1d63ff' : '#e2e8f0',
              color: soundEnabled ? '#ffffff' : '#64748b',
              transition: 'all 0.15s'
            }}
          >
            {soundEnabled ? 'On' : 'Off'}
          </button>
        </div>

        {/* Email Digest */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '11px 16px',
            backgroundColor: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f97316'
              }}
            >
              <Mail size={19} />
            </div>
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
                Email Digest
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                Daily summary of unread mentions and announcements
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEmailDigest(!emailDigest)}
            style={{
              padding: '4px 15px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: emailDigest ? '#1d63ff' : '#e2e8f0',
              color: emailDigest ? '#ffffff' : '#475569',
              transition: 'all 0.15s'
            }}
          >
            {emailDigest ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      {/* Workspace Alert Overrides */}
      <div style={{ maxWidth: '660px' }}>
        <h3
          style={{
            fontSize: '13px',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 3px 0'
          }}
        >
          Workspace Alert Overrides
        </h3>
        <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 10px 0' }}>
          Mute or prioritize notifications specifically for particular organizations.
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            overflow: 'hidden'
          }}
        >
          {workspaces.map((ws, idx) => (
            <div
              key={ws.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 16px',
                borderBottom: idx < workspaces.length - 1 ? '1px solid #f1f5f9' : 'none',
                backgroundColor: '#ffffff'
              }}
            >
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
                {ws.name}
              </span>
              <button
                type="button"
                onClick={() => toggleAlert(ws.id)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#334155',
                  cursor: 'pointer'
                }}
              >
                {workspaceAlerts[ws.id] || 'All Alerts'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
