import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: 'spring', stiffness: 350, damping: 25 } 
  }
};

const cardHoverVariants = {
  rest: { 
    scale: 1, 
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    borderColor: 'var(--color-border-primary)'
  },
  hover: { 
    scale: 1.02, 
    boxShadow: 'var(--elevation-3)',
    borderColor: 'var(--color-accent)',
    transition: { type: 'spring', stiffness: 400, damping: 25 } 
  },
  tap: {
    scale: 0.98
  }
};

const buttonHoverVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

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

  // Create workspace
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

  const createdWorkspaces = workspaceList.filter((ws) => ws.isOwner);
  const joinedWorkspaces = workspaceList.filter((ws) => !ws.isOwner);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        color: 'var(--color-text-primary)'
      }}
    >
      {/* Top Application Bar */}
      <header
        style={{
          backgroundColor: 'var(--glass-bg)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--color-border-primary)',
          padding: '12px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--elevation-3)',
              overflow: 'hidden',
              padding: '4px',
              flexShrink: 0
            }}
          >
            <img
              src="/zyntra-logo.png"
              alt="Zyntra"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <div>
            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
              Zyntra
            </span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginLeft: '8px', fontWeight: 500 }}>
              Identity & Workspace
            </span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <motion.button
            variants={buttonHoverVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            onClick={() => setShowOpeningAnim(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              color: 'var(--color-text-primary)',
              fontSize: '12px',
              fontWeight: 600,
              border: '1px solid var(--color-border-primary)',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            <Sparkles size={14} style={{ color: 'var(--color-accent)' }} />
            <span>Replay Intro</span>
          </motion.button>

          <motion.button
            variants={buttonHoverVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            onClick={() => setCreateModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-accent)',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px 0 rgba(var(--color-accent-rgb), 0.39)'
            }}
          >
            <Plus size={15} />
            Create Workplace
          </motion.button>

          <motion.button
            variants={buttonHoverVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            onClick={() => setJoinModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-bg-primary)',
              color: 'var(--color-text-primary)',
              fontSize: '12px',
              fontWeight: 600,
              border: '1px solid var(--color-border-primary)',
              cursor: 'pointer'
            }}
          >
            <KeyRound size={14} style={{ color: 'var(--color-text-secondary)' }} />
            Join with Code
          </motion.button>

          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--color-border-primary)', margin: '0 4px' }} />

          <motion.button
            variants={buttonHoverVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            onClick={() => navigate('/settings/profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--color-border-primary)',
              backgroundColor: 'var(--color-bg-primary)',
              color: 'var(--color-text-primary)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Settings size={15} />
            Settings
          </motion.button>

          <motion.button
            variants={buttonHoverVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              color: '#ef4444',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <LogOut size={15} />
            Sign Out
          </motion.button>
        </motion.div>
      </header>

      {/* Main Content Area */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '40px 24px 80px 24px',
          boxSizing: 'border-box'
        }}
      >
        {/* Welcome Section */}
        <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 800,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.03em',
              margin: '0 0 12px 0'
            }}
          >
            Welcome, {user?.name || 'Friend'}
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              margin: '0 auto',
              maxWidth: '560px',
              lineHeight: 1.6
            }}
          >
            Your single permanent identity connects you to personal messaging and contextual organizational workspaces.
          </p>
        </motion.div>

        {/* Identity Header Card */}
        <motion.div
          variants={itemVariants}
          style={{
            backgroundColor: 'var(--color-bg-primary)',
            borderRadius: '24px',
            boxShadow: 'var(--elevation-3)',
            border: '1px solid var(--color-border-primary)',
            overflow: 'hidden',
            marginBottom: '32px'
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-bg-primary)',
              backgroundImage: 'linear-gradient(to right, rgba(var(--color-accent-rgb), 0.05), transparent)',
              padding: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--color-border-primary)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--color-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '28px',
                  fontWeight: 800,
                  boxShadow: '0 8px 16px rgba(var(--color-accent-rgb), 0.3)',
                  flexShrink: 0
                }}
              >
                {(user?.name || user?.primaryUsername || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: 'var(--color-accent)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Shield size={14} /> Primary Verified Identity
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      color: '#10b981',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <CheckCircle2 size={12} /> Active
                  </span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
                  {user?.name || 'Verified User'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'monospace', marginTop: '4px' }}>
                  @{user?.primaryUsername || 'user'}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border-primary)',
                borderRadius: '16px',
                padding: '12px 20px',
              }}
            >
              <Lock size={20} style={{ color: 'var(--color-accent)' }} />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  E2EE Secured Session
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                  Contextual routing active
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '32px' }}>
            {/* Section 1: Personal Context */}
            <motion.div variants={itemVariants} style={{ marginBottom: '40px' }}>
              <div style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 4px 0' }}>
                  Personal Space
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Direct 1-on-1 private messaging and casual groups using your permanent personal handle.
                </p>
              </div>

              <motion.div
                variants={cardHoverVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                onClick={() => handleSelectContext('personal')}
                style={{
                  backgroundColor: 'var(--color-bg-primary)',
                  border: '1px solid var(--color-border-primary)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(var(--color-accent-rgb), 0.1)',
                      color: 'var(--color-accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <User size={24} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        Personal Direct Messages & Groups
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '3px 10px',
                          borderRadius: '12px',
                          backgroundColor: 'rgba(var(--color-accent-rgb), 0.1)',
                          color: 'var(--color-accent)',
                          border: '1px solid rgba(var(--color-accent-rgb), 0.2)'
                        }}
                      >
                        Personal
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
                      {user?.primaryUsername === 'soumya'
                        ? 'Chat with Aarav Patel, Priya Sharma, Rahul Kumar · Context handle: '
                        : 'Direct private messaging and contact chats · Context handle: '}
                      <code style={{ color: 'var(--color-accent)', fontWeight: 600 }}>@{user?.primaryUsername || 'user'}.personal</code>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--color-accent)'
                  }}
                >
                  <span>Open</span>
                  <ArrowRight size={18} />
                </div>
              </motion.div>
            </motion.div>

            {/* Section 2: Organizations You Created */}
            <motion.div variants={itemVariants} style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                      Organizations You Created
                    </h2>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor: 'rgba(var(--color-accent-rgb), 0.1)',
                        color: 'var(--color-accent)',
                        padding: '2px 10px',
                        borderRadius: '12px'
                      }}
                    >
                      {createdWorkspaces.length}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
                    Workspaces where you are the administrator and primary owner.
                  </p>
                </div>

                <motion.button
                  variants={buttonHoverVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  type="button"
                  onClick={() => setCreateModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(var(--color-accent-rgb), 0.1)',
                    color: 'var(--color-accent)',
                    border: '1px solid rgba(var(--color-accent-rgb), 0.2)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={16} /> New Workplace
                </motion.button>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '20px'
                }}
              >
                {createdWorkspaces.map((ws) => (
                  <motion.div
                    key={ws.id}
                    variants={cardHoverVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => handleSelectContext('workplace', ws.id)}
                    style={{
                      backgroundColor: 'var(--color-bg-primary)',
                      border: '1px solid var(--color-border-primary)',
                      borderRadius: '16px',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      minHeight: '200px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(var(--color-accent-rgb), 0.1)',
                            color: 'var(--color-accent)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Building2 size={22} />
                        </div>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            color: '#d97706',
                            border: '1px solid rgba(245, 158, 11, 0.2)'
                          }}
                        >
                          <Crown size={12} /> Workspace Owner
                        </span>
                      </div>

                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 6px 0' }}>
                        {ws.name}
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
                        {ws.description || 'Organizational hierarchy and departmental channels.'}
                      </p>
                    </div>

                    <div
                      style={{
                        paddingTop: '16px',
                        borderTop: '1px solid var(--color-border-primary)',
                        marginTop: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '2px' }}>
                          Context handle
                        </span>
                        <span style={{ fontSize: '13px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-accent)' }}>
                          @{ws.contextualUsername || `${user?.primaryUsername || 'user'}.${ws.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: 'var(--color-accent)'
                        }}
                      >
                        <span>Open</span>
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Inline Add Card */}
                <motion.div
                  variants={cardHoverVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setCreateModalOpen(true)}
                  style={{
                    backgroundColor: 'transparent',
                    border: '2px dashed var(--color-border-primary)',
                    borderRadius: '16px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    minHeight: '200px',
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-bg-primary)',
                      color: 'var(--color-accent)',
                      border: '1px solid var(--color-border-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '12px',
                      boxShadow: 'var(--elevation-3)'
                    }}
                  >
                    <Plus size={24} />
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-accent)' }}>
                    Create New Organization
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    Define workspace structure
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Section 3: Organizations You Joined */}
            <motion.div variants={itemVariants}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                      Organizations You Joined
                    </h2>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor: 'var(--color-bg-secondary)',
                        color: 'var(--color-text-secondary)',
                        padding: '2px 10px',
                        borderRadius: '12px'
                      }}
                    >
                      {joinedWorkspaces.length}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
                    Workspaces you have joined as a member via invitation or join code.
                  </p>
                </div>

                <motion.button
                  variants={buttonHoverVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  type="button"
                  onClick={() => setJoinModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--color-bg-primary)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border-primary)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <KeyRound size={14} /> Join by Code
                </motion.button>
              </div>

              {joinedWorkspaces.length === 0 ? (
                <div
                  style={{
                    padding: '40px 24px',
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderRadius: '16px',
                    border: '1px dashed var(--color-border-primary)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                    No joined organizations yet
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px', maxWidth: '480px', margin: '0 auto 20px auto', lineHeight: '1.6' }}>
                    Have an invitation code from your university, department, or company? Enter it below to join with your verified identity.
                  </div>
                  <motion.button
                    variants={buttonHoverVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                    type="button"
                    onClick={() => setJoinModalOpen(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--color-bg-primary)',
                      border: '1px solid var(--color-border-primary)',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--color-accent)',
                      cursor: 'pointer',
                      boxShadow: 'var(--elevation-3)'
                    }}
                  >
                    <KeyRound size={16} /> Enter Join Code
                  </motion.button>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '20px'
                  }}
                >
                  {joinedWorkspaces.map((ws) => (
                    <motion.div
                      key={ws.id}
                      variants={cardHoverVariants}
                      initial="rest"
                      whileHover="hover"
                      style={{
                        backgroundColor: 'var(--color-bg-primary)',
                        border: '1px solid var(--color-border-primary)',
                        borderRadius: '16px',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '200px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '12px',
                              backgroundColor: 'rgba(124, 58, 237, 0.1)',
                              color: '#7c3aed',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Building2 size={22} />
                          </div>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '4px 10px',
                              borderRadius: '12px',
                              backgroundColor: 'rgba(124, 58, 237, 0.1)',
                              color: '#7c3aed',
                              border: '1px solid rgba(124, 58, 237, 0.2)'
                            }}
                          >
                            Joined Member
                          </span>
                        </div>

                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 6px 0' }}>
                          {ws.name}
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
                          Created by {ws.creatorName || 'Administrator'} · {ws.memberCount || 1200} members
                        </p>
                      </div>

                      <div
                        style={{
                          paddingTop: '16px',
                          borderTop: '1px solid var(--color-border-primary)',
                          marginTop: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '2px' }}>
                            Context handle
                          </span>
                          <span style={{ fontSize: '13px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            @{ws.contextualUsername || `${user?.primaryUsername || 'user'}.${ws.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <motion.button
                            variants={buttonHoverVariants}
                            initial="rest"
                            whileHover="hover"
                            whileTap="tap"
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLeaveConfirmWs(ws);
                            }}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              backgroundColor: 'var(--color-bg-primary)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#ef4444',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Leave
                          </motion.button>

                          <motion.button
                            variants={buttonHoverVariants}
                            initial="rest"
                            whileHover="hover"
                            whileTap="tap"
                            type="button"
                            onClick={() => handleSelectContext('workplace', ws.id)}
                            style={{
                              padding: '6px 16px',
                              borderRadius: '8px',
                              backgroundColor: 'var(--color-accent)',
                              border: 'none',
                              color: '#ffffff',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            Open <ArrowRight size={14} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </motion.main>

      {/* ================= MODAL: CREATE NEW WORKPLACE ================= */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Workplace"
        size="md"
      >
        <form onSubmit={handleCreateWorkspace} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: '8px'
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
                padding: '12px 16px',
                backgroundColor: 'var(--color-bg-primary)',
                border: '1.5px solid var(--color-accent)',
                borderRadius: '8px',
                fontSize: '14px',
                color: 'var(--color-text-primary)',
                boxSizing: 'border-box',
                outline: 'none',
                boxShadow: '0 0 0 3px rgba(var(--color-accent-rgb), 0.1)'
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: '8px'
              }}
            >
              Contextual Username in this Organization
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '16px', color: 'var(--color-text-secondary)', fontSize: '14px', fontWeight: 600 }}>
                @
              </span>
              <input
                placeholder="soumya.acme"
                value={newContextUsername}
                onChange={(e) => setNewContextUsername(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 32px',
                  backgroundColor: 'var(--color-bg-primary)',
                  border: '1px solid var(--color-border-primary)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: 'var(--color-text-primary)',
                  boxSizing: 'border-box',
                  fontFamily: 'monospace'
                }}
              />
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '8px 0 0 0' }}>
              Members of this workplace will see this identity while your permanent account remains @{user?.primaryUsername || 'soumya'}.
            </p>
          </div>

          <div
            style={{
              paddingTop: '20px',
              borderTop: '1px solid var(--color-border-primary)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}
          >
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid var(--color-border-primary)',
                backgroundColor: 'var(--color-bg-primary)',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newWorkspaceName.trim()}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'var(--color-accent)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: newWorkspaceName.trim() ? 'pointer' : 'not-allowed',
                opacity: newWorkspaceName.trim() ? 1 : 0.5,
                boxShadow: '0 4px 14px 0 rgba(var(--color-accent-rgb), 0.39)'
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
        <form onSubmit={handleJoinWorkspace} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
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
                padding: '12px 16px',
                backgroundColor: 'var(--color-bg-primary)',
                border: '1px solid var(--color-border-primary)',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'monospace',
                fontWeight: 700,
                boxSizing: 'border-box',
                color: 'var(--color-text-primary)'
              }}
            />
            {joinError && (
              <p style={{ fontSize: '12px', color: '#ef4444', margin: '8px 0 0 0' }}>
                {joinError}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '12px' }}>
            <button
              type="button"
              onClick={() => setJoinModalOpen(false)}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid var(--color-border-primary)',
                backgroundColor: 'var(--color-bg-primary)',
                fontSize: '13px',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'var(--color-accent)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 14px 0 rgba(var(--color-accent-rgb), 0.39)'
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ef4444' }}>
              <AlertTriangle size={24} />
              <span style={{ fontSize: '14px', fontWeight: 600 }}>
                Confirm Workspace Departure
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
              Are you sure you want to leave <strong>{leaveConfirmWs.name}</strong>? You will lose access to all affiliated channels and groups in this organization. You can rejoin at any time using a valid join code.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '12px' }}>
              <button
                type="button"
                onClick={() => setLeaveConfirmWs(null)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border-primary)',
                  backgroundColor: 'var(--color-bg-primary)',
                  fontSize: '13px',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLeaveWorkspace}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
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
