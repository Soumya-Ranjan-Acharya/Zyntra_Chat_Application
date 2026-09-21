import React, { useState } from 'react';
import { Shield, KeyRound, Plus, Trash2, Check, RefreshCw } from 'lucide-react';
import { sampleMembers, workspacePolicies } from '../../data/mockData';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import useWorkspaceStore from '../../store/useWorkspaceStore';

const roleBadgeVariant = {
  'workspace-owner': 'danger',
  'workspace-admin': 'warning',
  'group-admin': 'accent',
  moderator: 'success',
  member: 'default',
};

const WorkspaceSettings = () => {
  const { workspaces, activeWorkspace } = useWorkspaceStore();
  const [selectedWs, setSelectedWs] = useState(activeWorkspace?.id || 'ws-giet');
  const currentWsObj = workspaces.find((w) => w.id === selectedWs) || workspaces[0];
  const [policy, setPolicy] = useState(workspacePolicies[selectedWs] || workspacePolicies['ws-giet']);
  const [members, setMembers] = useState(sampleMembers);
  const [generatedCode, setGeneratedCode] = useState(selectedWs === 'ws-abc' ? 'ZYN-ABC-0892' : 'ZYN-GIET-0001');

  const handleTogglePolicy = (key) => {
    setPolicy((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleGenerateCode = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    const shortPrefix = (currentWsObj?.name || 'ZYN').substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X');
    setGeneratedCode(`ZYN-${shortPrefix}-${random}`);
  };

  const handleRemoveMember = (id) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div style={{ width: '100%', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      {/* Header Row with Workspace Dropdown */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '16px',
          gap: '16px'
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.025em',
              margin: '0 0 3px 0'
            }}
          >
            Workspace Governance
          </h2>
          <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
            Administrative policies, communication rules, and role permissions.
          </p>
        </div>

        {/* Workspace Selector Dropdown */}
        <select
          value={selectedWs}
          onChange={(e) => {
            const wsId = e.target.value;
            setSelectedWs(wsId);
            setPolicy(workspacePolicies[wsId] || workspacePolicies['ws-giet']);
            setGeneratedCode(wsId === 'ws-abc' ? 'ZYN-ABC-0892' : 'ZYN-GIET-0001');
          }}
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            fontSize: '12px',
            fontWeight: 600,
            color: '#0f172a',
            outline: 'none',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
          }}
        >
          {workspaces.map((ws) => (
            <option key={ws.id} value={ws.id}>
              {ws.name} ({ws.isOwner ? 'Owner' : 'Member'})
            </option>
          ))}
        </select>
      </div>

      {/* 1. COMMUNICATION POLICY CONTROLS */}
      <div style={{ marginBottom: '18px' }}>
        <h3
          style={{
            fontSize: '11px',
            fontWeight: 800,
            color: '#0f172a',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            margin: '0 0 2px 0'
          }}
        >
          COMMUNICATION POLICY CONTROLS
        </h3>
        <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 10px 0' }}>
          Toggles determine available features in chat composer for this workspace.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '640px' }}>
          {/* Emoji Reactions & Picker */}
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
                Emoji Reactions & Picker
              </div>
              <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                Allow rich emojis in messages and reaction popovers
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleTogglePolicy('emoji')}
              style={{
                padding: '4px 14px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: policy.emoji ? '#1d63ff' : '#e2e8f0',
                color: policy.emoji ? '#ffffff' : '#64748b',
                transition: 'all 0.15s'
              }}
            >
              {policy.emoji ? 'Enabled' : 'Restricted'}
            </button>
          </div>

          {/* Message Reactions */}
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
                Message Reactions
              </div>
              <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                Allow members to add reaction counters to bubbles
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleTogglePolicy('reactions')}
              style={{
                padding: '4px 14px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: policy.reactions ? '#1d63ff' : '#e2e8f0',
                color: policy.reactions ? '#ffffff' : '#64748b',
                transition: 'all 0.15s'
              }}
            >
              {policy.reactions ? 'Enabled' : 'Restricted'}
            </button>
          </div>

          {/* Message Editing */}
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
                Message Editing
              </div>
              <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                Allow authors to edit sent messages
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleTogglePolicy('editMessage')}
              style={{
                padding: '4px 14px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: policy.editMessage ? '#1d63ff' : '#e2e8f0',
                color: policy.editMessage ? '#ffffff' : '#64748b',
                transition: 'all 0.15s'
              }}
            >
              {policy.editMessage ? 'Enabled' : 'Restricted'}
            </button>
          </div>

          {/* Message Deletion */}
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
                Message Deletion
              </div>
              <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                Allow users to retract or purge their sent messages
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleTogglePolicy('deleteMessage')}
              style={{
                padding: '4px 14px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: policy.deleteMessage ? '#1d63ff' : '#e2e8f0',
                color: policy.deleteMessage ? '#ffffff' : '#64748b',
                transition: 'all 0.15s'
              }}
            >
              {policy.deleteMessage ? 'Enabled' : 'Restricted'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. WORKSPACE ROOT JOIN CODE */}
      <div style={{ marginBottom: '18px', maxWidth: '640px' }}>
        <h3
          style={{
            fontSize: '11px',
            fontWeight: 800,
            color: '#0f172a',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            margin: '0 0 8px 0'
          }}
        >
          WORKSPACE ROOT JOIN CODE
        </h3>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyRound size={15} color="#1d63ff" />
            <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
              {generatedCode}
            </span>
          </div>
          <button
            type="button"
            onClick={handleGenerateCode}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              fontSize: '11px',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={11} />
            Regenerate
          </button>
        </div>
      </div>

      {/* 3. ROSTER & GOVERNANCE ROLES */}
      <div style={{ maxWidth: '640px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h3
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#0f172a',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              margin: 0
            }}
          >
            ROSTER & GOVERNANCE ROLES ({members.length})
          </h3>
          <button
            type="button"
            onClick={() => alert('Invite member dialog active (Demo)')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '11px',
              fontWeight: 700,
              color: '#1d63ff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Plus size={13} />
            Invite User
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {members.map((m) => {
            const roleKey = m.role.replace('workspace-', '').replace('group-', '');
            const roleColors = {
              owner: '#ef4444',
              admin: '#f59e0b',
              moderator: '#10b981',
              member: '#64748b'
            };
            const roleColor = roleColors[roleKey] || '#64748b';

            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#1d63ff',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700
                    }}
                  >
                    {m.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                      {m.name}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#94a3b8', fontFamily: 'monospace' }}>
                      @{m.username}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: roleColor,
                      textTransform: 'lowercase'
                    }}
                  >
                    {roleKey}
                  </span>
                  {m.id !== 'user-1' ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(m.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Remove Member"
                    >
                      <Trash2 size={13} />
                    </button>
                  ) : (
                    <span style={{ width: '17px' }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSettings;
