import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Building2,
  Plus,
  Shield,
  Settings,
  LogOut,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Lock,
  KeyRound,
  AlertTriangle,
  Crown,
  Users
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useWorkspaceStore from '../store/useWorkspaceStore';
import Modal from '../components/ui/Modal';
import ZyntraOpeningAnimation from '../components/animation/ZyntraOpeningAnimation';

const HomePage = () => {
  const { user, setActiveContext, addContext, logout } = useAuthStore();
  const {
    workspaces: workspaceList,
    createWorkspace,
    leaveWorkspace,
    joinGroupByCode,
    setActiveWorkspace
  } = useWorkspaceStore();
  const navigate = useNavigate();

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [leaveConfirmWs, setLeaveConfirmWs] = useState(null);

  // Form states
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newContextUsername, setNewContextUsername] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinError, setJoinError] = useState('');

  // Opening Animation State
  const [showOpeningAnim, setShowOpeningAnim] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    if (params.get('splash') === '1') return true;
    if (params.get('splash') === 'done') return false;
    return false;
  });

  useEffect(() => {
    document.title = 'Zyntra — Context Navigator';
    if (window.location.search.includes('create=1')) {
      setCreateModalOpen(true);
    }
  }, []);

  // Auto-generate contextual username when typing workspace name
  const handleNameChange = (e) => {
    const val = e.target.value;
    setNewWorkspaceName(val);
    const cleanSlug = val.toLowerCase().replace(/[^a-z0-9]/g, '');
    const primary = user?.primaryUsername || 'user';
    setNewContextUsername(cleanSlug ? `${primary}.${cleanSlug}` : '');
  };

  const handleSelectContext = (contextType, wsId = null) => {
    const primary = user?.primaryUsername || 'user';
    if (contextType === 'personal') {
      const personalCtx = user?.contexts?.find((c) => c.type === 'personal');
      setActiveContext(
        personalCtx || {
          id: 'ctx-personal',
          type: 'personal',
          name: 'Personal',
          username: `${primary}.personal`
        }
      );
      navigate('/personal');
    } else if (wsId) {
      const ws = workspaceList.find((w) => w.id === wsId);
      if (ws) {
        setActiveWorkspace(ws);
        const wsCtx = {
          id: `ctx-${ws.id}`,
          type: 'workplace',
          name: ws.name,
          username: ws.contextualUsername || `${primary}.${ws.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`
        };
        addContext(wsCtx);
        setActiveContext(wsCtx);
        navigate(`/workspace/${ws.id}`);
      }
    }
  };

  // Create workspace - No organization type required
  const handleCreateWorkspace = (e) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    const newWs = createWorkspace({
      name: newWorkspaceName.trim(),
      contextualUsername: newContextUsername.trim(),
    });

    if (newWs) {
      const wsCtx = {
        id: `ctx-${newWs.id}`,
        type: 'workplace',
        name: newWs.name,
        username: newWs.contextualUsername
      };
      addContext(wsCtx);
      setNewWorkspaceName('');
      setNewContextUsername('');
      setCreateModalOpen(false);

      // Navigate to the new workspace
      handleSelectContext('workplace', newWs.id);
    }
  };

  // Join workspace via code
  const handleJoinWorkspace = (e) => {
    e.preventDefault();
    setJoinError('');
    if (!joinCodeInput.trim()) return;

    const res = joinGroupByCode(joinCodeInput.trim());
    if (res.success) {
      setJoinCodeInput('');
      setJoinModalOpen(false);
      navigate(`/workspace/${res.node.parentId || 'ws-giet'}`);
    } else {
      setJoinError(res.error || 'Invalid join code. Please try again.');
    }
  };

  // Confirm leave workspace
  const handleConfirmLeaveWorkspace = () => {
    if (!leaveConfirmWs) return;
    leaveWorkspace(leaveConfirmWs.id);
    setLeaveConfirmWs(null);
  };

  // Partition workspaces into Created vs Joined
  const createdWorkspaces = workspaceList.filter((ws) => ws.isOwner);
  const joinedWorkspaces = workspaceList.filter((ws) => !ws.isOwner);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f1f3f6',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
      }}
    >
      {/* Top Application Bar */}
      <header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '14px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#05091a',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.25)',
              overflow: 'hidden',
              padding: '3px',
              flexShrink: 0
            }}
          >
            <img
              src="/zyntra-unicorn-transparent.png"
              alt="Zyntra"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <div>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Zyntra
            </span>
            <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '8px', fontWeight: 500 }}>
              Identity & Workspace Hub
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Replay Brand Opening Animation */}
          <button
            onClick={() => setShowOpeningAnim(true)}
            title="Play Zyntra 3-4s Mobile App Opening Animation"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 13px',
              borderRadius: '8px',
              backgroundColor: '#070b19',
              color: '#38bdf8',
              fontSize: '12px',
              fontWeight: 600,
              border: '1px solid rgba(56, 189, 248, 0.45)',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(6, 182, 212, 0.15)',
              transition: 'all 0.15s ease'
            }}
          >
            <Sparkles size={14} color="#38bdf8" />
            <span>Replay Intro</span>
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '8px',
              backgroundColor: '#1d63ff',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(29, 99, 255, 0.2)'
            }}
          >
            <Plus size={15} />
            Create Workplace
          </button>

          <button
            onClick={() => setJoinModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: '12px',
              fontWeight: 600,
              border: '1px solid #cbd5e1',
              cursor: 'pointer'
            }}
          >
            <KeyRound size={14} color="#64748b" />
            Join with Code
          </button>

          <div style={{ width: '1px', height: '20px', backgroundColor: '#e2e8f0', margin: '0 4px' }} />

          <button
            onClick={() => navigate('/settings/profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Settings size={15} />
            Settings
          </button>

          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: '8px',
              border: '1px solid #fee2e2',
              backgroundColor: '#fff5f5',
              color: '#dc2626',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '36px 24px 60px 24px',
          boxSizing: 'border-box'
        }}
      >
        {/* Welcome Section */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.025em',
              margin: '0 0 8px 0'
            }}
          >
            Welcome, {user?.name || 'Friend'}
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: '#64748b',
              margin: '0 auto',
              maxWidth: '560px',
              lineHeight: 1.5
            }}
          >
            Your single permanent identity connects you to personal messaging and contextual organizational workspaces.
          </p>
        </div>

        {/* Identity Header Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.07)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            marginBottom: '28px'
          }}
        >
          <div
            style={{
              backgroundColor: '#0a1128',
              background: 'linear-gradient(135deg, #091129 0%, #11204d 100%)',
              padding: '24px 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #1e293b'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  backgroundColor: '#1d63ff',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '22px',
                  fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(29, 99, 255, 0.35)',
                  flexShrink: 0
                }}
              >
                {(user?.name || user?.primaryUsername || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: '#93c5fd',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Shield size={12} /> Primary Verified Identity
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '1px 8px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(16, 185, 129, 0.2)',
                      color: '#6ee7b7',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <CheckCircle2 size={10} /> Active
                  </span>
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                  {user?.name || 'Verified User'}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace', marginTop: '2px' }}>
                  @{user?.primaryUsername || 'user'}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.07)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                padding: '10px 16px',
                backdropFilter: 'blur(8px)'
              }}
            >
              <Lock size={18} color="#60a5fa" />
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff' }}>
                  E2EE Secured Session
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                  Contextual routing active
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '28px 32px' }}>
            {/* Section 1: Personal Context */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 2px 0' }}>
                  Personal Space
                </h2>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                  Direct 1-on-1 private messaging and casual groups using your permanent personal handle.
                </p>
              </div>

              <div
                onClick={() => handleSelectContext('personal')}
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '18px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#1d63ff';
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.boxShadow = '0 8px 20px -6px rgba(29, 99, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      backgroundColor: '#dbeafe',
                      color: '#1d63ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <User size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                        Personal Direct Messages & Groups
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '10px',
                          backgroundColor: '#eff6ff',
                          color: '#1d63ff',
                          border: '1px solid #bfdbfe'
                        }}
                      >
                        Personal
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      {user?.primaryUsername === 'soumya'
                        ? 'Chat with Aarav Patel, Priya Sharma, Rahul Kumar · Context handle: '
                        : 'Direct private messaging and contact chats · Context handle: '}
                      <code style={{ color: '#1d63ff', fontWeight: 600 }}>@{user?.primaryUsername || 'user'}.personal</code>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    color: '#1d63ff'
                  }}
                >
                  <span>Open Personal</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>

            {/* Section 2: Organizations You Created */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Organizations You Created
                    </h2>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: '#eff6ff',
                        color: '#1d63ff',
                        padding: '1px 8px',
                        borderRadius: '10px'
                      }}
                    >
                      {createdWorkspaces.length}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                    Workspaces where you are the administrator and primary owner.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setCreateModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#eff6ff',
                    color: '#1d63ff',
                    border: '1px solid #bfdbfe',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={14} /> New Workplace
                </button>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '16px'
                }}
              >
                {createdWorkspaces.map((ws) => (
                  <div
                    key={ws.id}
                    onClick={() => handleSelectContext('workplace', ws.id)}
                    style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      minHeight: '190px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#1d63ff';
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.boxShadow = '0 10px 24px -8px rgba(29, 99, 255, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: '#eff6ff',
                            color: '#1d63ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Building2 size={20} />
                        </div>
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 10px',
                            borderRadius: '12px',
                            backgroundColor: '#fef3c7',
                            color: '#b45309',
                            border: '1px solid #fde68a'
                          }}
                        >
                          <Crown size={11} /> Workspace Owner
                        </span>
                      </div>

                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                        {ws.name}
                      </h3>
                      <p style={{ fontSize: '11.5px', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                        {ws.description || 'Organizational hierarchy and departmental channels.'}
                      </p>
                    </div>

                    <div
                      style={{
                        paddingTop: '14px',
                        borderTop: '1px solid #e2e8f0',
                        marginTop: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>
                          Context handle
                        </span>
                        <span style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 700, color: '#1d63ff' }}>
                          @{ws.contextualUsername || `${user?.primaryUsername || 'user'}.${ws.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          color: '#1d63ff'
                        }}
                      >
                        <span>Open</span>
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Inline Add Card */}
                <div
                  onClick={() => setCreateModalOpen(true)}
                  style={{
                    backgroundColor: '#fafbfc',
                    border: '2px dashed #cbd5e1',
                    borderRadius: '16px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    minHeight: '190px',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#1d63ff';
                    e.currentTarget.style.backgroundColor = '#eff6ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.backgroundColor = '#fafbfc';
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      color: '#1d63ff',
                      border: '1px solid #bfdbfe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '8px'
                    }}
                  >
                    <Plus size={20} />
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1d63ff' }}>
                    Create New Organization
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    Define workspace structure
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Organizations You Joined */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Organizations You Joined
                    </h2>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        padding: '1px 8px',
                        borderRadius: '10px'
                      }}
                    >
                      {joinedWorkspaces.length}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                    Workspaces you have joined as a member via invitation or join code.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setJoinModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <KeyRound size={13} /> Join by Code
                </button>
              </div>

              {joinedWorkspaces.length === 0 ? (
                <div
                  style={{
                    padding: '32px 24px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '16px',
                    border: '1px dashed #cbd5e1',
                    textAlign: 'center',
                    color: '#64748b'
                  }}
                >
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    No joined organizations yet
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px', maxWidth: '420px', margin: '0 auto 14px auto', lineHeight: '1.5' }}>
                    Have an invitation code from your university, department, or company? Enter it below to join with your verified identity.
                  </div>
                  <button
                    type="button"
                    onClick={() => setJoinModalOpen(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#1d63ff',
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                    }}
                  >
                    <KeyRound size={14} /> Enter Join Code
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '16px'
                  }}
                >
                  {joinedWorkspaces.map((ws) => (
                    <div
                      key={ws.id}
                      style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease',
                        minHeight: '190px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '10px',
                              backgroundColor: '#f5f3ff',
                              color: '#7c3aed',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Building2 size={20} />
                          </div>
                          <span
                            style={{
                              fontSize: '10.5px',
                              fontWeight: 700,
                              padding: '3px 10px',
                              borderRadius: '12px',
                              backgroundColor: '#f3e8ff',
                              color: '#7e22ce',
                              border: '1px solid #e9d5ff'
                            }}
                          >
                            Joined Member
                          </span>
                        </div>

                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                          {ws.name}
                        </h3>
                        <p style={{ fontSize: '11.5px', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                          Created by {ws.creatorName || 'Administrator'} · {ws.memberCount || 1200} members
                        </p>
                      </div>

                      <div
                        style={{
                          paddingTop: '14px',
                          borderTop: '1px solid #e2e8f0',
                          marginTop: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>
                            Context handle
                          </span>
                          <span style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 700, color: '#475569' }}>
                            @{ws.contextualUsername || `${user?.primaryUsername || 'user'}.${ws.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLeaveConfirmWs(ws);
                            }}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              backgroundColor: '#ffffff',
                              border: '1px solid #fecaca',
                              color: '#dc2626',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Leave
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSelectContext('workplace', ws.id)}
                            style={{
                              padding: '4px 12px',
                              borderRadius: '6px',
                              backgroundColor: '#1d63ff',
                              border: 'none',
                              color: '#ffffff',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                          >
                            Open <ArrowRight size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ================= MODAL: CREATE NEW WORKPLACE ================= */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Workplace"
        size="md"
      >
        <form onSubmit={handleCreateWorkspace} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
              Workplace Name
            </label>
            <input
              placeholder="e.g. Acme Innovations or Stanford University"
              value={newWorkspaceName}
              onChange={handleNameChange}
              autoFocus
              style={{
                width: '100%',
                padding: '11px 14px',
                backgroundColor: '#ffffff',
                border: '1.5px solid #3b82f6',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#0f172a',
                boxSizing: 'border-box',
                outline: 'none',
                boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
              }}
            />
          </div>

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
              Contextual Username in this Organization
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '12px', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>
                @
              </span>
              <input
                placeholder="soumya.acme"
                value={newContextUsername}
                onChange={(e) => setNewContextUsername(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 28px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#0f172a',
                  boxSizing: 'border-box',
                  fontFamily: 'monospace'
                }}
              />
            </div>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0' }}>
              Members of this workplace will see this identity while your permanent account remains @{user?.primaryUsername || 'soumya'}.
            </p>
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
              onClick={() => setCreateModalOpen(false)}
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
              disabled={!newWorkspaceName.trim()}
              style={{
                padding: '9px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#1d63ff',
                color: '#ffffff',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: newWorkspaceName.trim() ? 'pointer' : 'not-allowed',
                opacity: newWorkspaceName.trim() ? 1 : 0.5,
                boxShadow: '0 2px 6px rgba(29, 99, 255, 0.25)'
              }}
            >
              Create & Launch
            </button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL: JOIN VIA CODE ================= */}
      <Modal
        isOpen={joinModalOpen}
        onClose={() => {
          setJoinModalOpen(false);
          setJoinError('');
        }}
        title="Join Workspace or Channel"
        size="sm"
      >
        <form onSubmit={handleJoinWorkspace} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Enter Join Code
            </label>
            <input
              placeholder="e.g. ZYN-ABC-0001 or ZYN-GIET-1132"
              value={joinCodeInput}
              onChange={(e) => {
                setJoinCodeInput(e.target.value.toUpperCase());
                setJoinError('');
              }}
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '13px',
                fontFamily: 'monospace',
                fontWeight: 700,
                boxSizing: 'border-box'
              }}
            />
            {joinError && (
              <p style={{ fontSize: '11px', color: '#dc2626', margin: '4px 0 0 0' }}>
                {joinError}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '10px' }}>
            <button
              type="button"
              onClick={() => setJoinModalOpen(false)}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '12px',
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#1d63ff',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Join Channel
            </button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL: CONFIRM LEAVE WORKSPACE ================= */}
      {leaveConfirmWs && (
        <Modal
          isOpen={true}
          onClose={() => setLeaveConfirmWs(null)}
          title={`Leave ${leaveConfirmWs.name}?`}
          size="sm"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#b91c1c' }}>
              <AlertTriangle size={20} />
              <span style={{ fontSize: '13px', fontWeight: 700 }}>
                Confirm Workspace Departure
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
              Are you sure you want to leave <strong>{leaveConfirmWs.name}</strong>? You will lose access to all affiliated channels and groups in this organization. You can rejoin at any time using a valid join code.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '10px' }}>
              <button
                type="button"
                onClick={() => setLeaveConfirmWs(null)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '12px',
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLeaveWorkspace}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Leave Workspace
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Zyntra Brand Opening Animation Overlay */}
      {showOpeningAnim && (
        <ZyntraOpeningAnimation
          mode="fullscreen"
          autoplay={true}
          enableSound={true}
          onComplete={() => setShowOpeningAnim(false)}
        />
      )}
    </div>
  );
};

export default HomePage;
