import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MessageCircle,
  Users,
  Plus,
  Building2,
  User,
  ChevronDown,
  Check,
  Hash,
  Sparkles,
  KeyRound,
  X
} from 'lucide-react';
import Avatar from '../ui/Avatar';
import useChatStore from '../../store/useChatStore';
import useWorkspaceStore from '../../store/useWorkspaceStore';
import useAuthStore from '../../store/useAuthStore';
import { api } from '../../services/api';
import WorkspaceHierarchy from '../workspace/WorkspaceHierarchy';
import CreateGroupModal from '../workspace/CreateGroupModal';
import JoinGroupModal from '../workspace/JoinGroupModal';
import AddContactModal from '../contacts/AddContactModal';
import Modal from '../ui/Modal';

const groupGradients = [
  'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', // Rose/Pink
  'linear-gradient(135deg, #10b981 0%, #047857 100%)', // Emerald
  'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', // Indigo
  'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', // Purple
  'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', // Amber
  'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)', // Cyan
];

const getGroupGradient = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return groupGradients[Math.abs(hash) % groupGradients.length];
};

const Sidebar = ({ mode = 'personal' }) => {
  const [search, setSearch] = useState('');
  const [contextDropdownOpen, setContextDropdownOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [joinGroupOpen, setJoinGroupOpen] = useState(
    typeof window !== 'undefined' && window.location.search.includes('join=1')
  );
  const [addContactOpen, setAddContactOpen] = useState(
    typeof window !== 'undefined' && window.location.search.includes('addcontact=1')
  );
  const [createWsModalOpen, setCreateWsModalOpen] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsHandle, setNewWsHandle] = useState('');
  const [directoryResults, setDirectoryResults] = useState([]);
  const [isSearchingDir, setIsSearchingDir] = useState(false);
  const dropdownRef = useRef(null);

  const {
    activeChat,
    setActiveChat,
    contacts: storeContacts = [],
    groups: storeGroups = [],
    addContact,
    addGroup
  } = useChatStore();

  const {
    workspaces = [],
    activeWorkspace,
    setActiveWorkspace,
    activeNodeId,
    createWorkspace,
    createGroup,
    joinGroupByCode
  } = useWorkspaceStore();

  const { user, setActiveContext, addContext } = useAuthStore();
  const navigate = useNavigate();

  // Live Atlas User Directory Search when typing in search bar
  useEffect(() => {
    const clean = search.trim().toLowerCase().replace(/^@/, '');
    if (clean.length < 2) {
      setDirectoryResults([]);
      setIsSearchingDir(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingDir(true);
      try {
        const res = await api.contacts.search(clean);
        if (res.ok && Array.isArray(res.data?.users)) {
          // Filter out users already in personal contacts list or self
          const filtered = res.data.users.filter(
            (u) =>
              u.username !== user?.primaryUsername &&
              !storeContacts.some((c) => c.username?.replace(/^@/, '').toLowerCase() === u.username?.toLowerCase())
          );
          setDirectoryResults(filtered);
        }
      } catch (err) {
        console.warn('Live directory search error:', err);
      } finally {
        setIsSearchingDir(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [search, storeContacts, user?.primaryUsername]);

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSwitchContext = (type, ws = null) => {
    setContextDropdownOpen(false);
    const primary = user?.primaryUsername || 'user';
    if (type === 'personal') {
      const pCtx = user?.contexts?.find((c) => c.type === 'personal') || {
        id: 'ctx-personal',
        type: 'personal',
        name: 'Personal',
        username: `${primary}.personal`
      };
      setActiveContext(pCtx);
      navigate('/personal');
    } else if (ws) {
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
  };

  const handleCreateGroupSubmit = (data) => {
    const parentId = data?.parentId || activeNodeId || activeWorkspace?.rootNodeId;
    createGroup(parentId, data.name, data.description, data.initialMembers || []);
  };

  const handleJoinCodeSubmit = (code) => {
    joinGroupByCode(code);
  };

  const handleStartChatWithUser = async (targetUser) => {
    try {
      const res = await api.contacts.create({
        name: targetUser.name,
        username: targetUser.username,
        avatar: targetUser.avatar,
        bio: targetUser.bio,
      });
      const cleanTarget = (targetUser.username || '').replace(/^@/, '').toLowerCase();
      const cleanSelf = (user?.primaryUsername || '').replace(/^@/, '').toLowerCase();
      const fallbackId = cleanTarget && cleanSelf
        ? `dm_${[cleanSelf, cleanTarget].sort().join('_')}`
        : (targetUser.id || `contact-${Date.now()}`);

      const newContact = res.ok && res.data?.data ? res.data.data : {
        id: fallbackId,
        name: targetUser.name,
        username: targetUser.username,
        avatar: targetUser.avatar,
        status: targetUser.status || 'online',
        lastMessage: 'Connected on Zyntra',
        lastMessageTime: new Date().toISOString(),
      };
      addContact(newContact);
      setActiveChat(newContact.id);
      setSearch('');
    } catch (e) {
      console.warn('handleStartChatWithUser error:', e);
    }
  };

  const handleCreateWorkspaceSubmit = (e) => {
    e.preventDefault();
    if (!newWsName.trim()) return;

    const newWs = createWorkspace({
      name: newWsName.trim(),
      contextualUsername: newWsHandle.trim(),
    });

    if (newWs) {
      const wsCtx = {
        id: `ctx-${newWs.id}`,
        type: 'workplace',
        name: newWs.name,
        username: newWs.contextualUsername
      };
      addContext(wsCtx);
      setNewWsName('');
      setNewWsHandle('');
      setCreateWsModalOpen(false);
      handleSwitchContext('workplace', newWs);
    }
  };

  const createdWorkspaces = (workspaces || []).filter((w) => w.isOwner || w.role === 'owner' || w.id === 'ws-giet');
  const joinedWorkspaces = (workspaces || []).filter((w) => !w.isOwner && w.role !== 'owner' && w.id !== 'ws-giet');

  return (
    <div className="flex flex-col h-full select-none">
      {/* Top Context Switcher Header */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid #142044', backgroundColor: '#070f26', position: 'relative', zIndex: 60 }}>
        <button
          type="button"
          onClick={() => setContextDropdownOpen(!contextDropdownOpen)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px',
            borderRadius: '12px',
            backgroundColor: '#0c1634',
            border: '1px solid #1e2f5e',
            cursor: 'pointer',
            textAlign: 'left',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
            transition: 'all 0.15s ease'
          }}
          className="hover:border-blue-500/50"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '9px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #4338ca 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 'bold',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              {mode === 'personal' ? <User size={16} /> : <Building2 size={16} />}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {mode === 'personal' ? 'Personal Space' : activeWorkspace?.name || 'Workspace'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '1px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', flexShrink: 0 }} />
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#93c5fd', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {mode === 'personal'
                    ? `@${user?.primaryUsername || 'user'}.personal`
                    : `@${activeWorkspace?.contextualUsername || `${user?.primaryUsername || 'user'}.${activeWorkspace?.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'ws'}`}`}
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              flexShrink: 0,
              marginLeft: '6px'
            }}
          >
            <ChevronDown
              size={13}
              style={{
                transform: contextDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
                color: '#cbd5e1'
              }}
            />
          </div>
        </button>

        {/* Dropdown Menu */}
        {contextDropdownOpen && (
          <div
            ref={dropdownRef}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: '12px',
              right: '12px',
              backgroundColor: '#09122a',
              border: '1px solid #1c2e5c',
              borderRadius: '16px',
              boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.1)',
              padding: '10px 8px',
              zIndex: 100,
              maxHeight: '420px',
              overflowY: 'auto'
            }}
            className="custom-scrollbar"
          >
              {/* SECTION 1: PERSONAL SPACE */}
              <div
                style={{
                  padding: '4px 10px 6px 10px',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#64748b',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase'
                }}
              >
                Personal Communication
              </div>

              <button
                type="button"
                onClick={() => handleSwitchContext('personal')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: '10px',
                  border: mode === 'personal' ? '1px solid #2b4894' : '1px solid transparent',
                  backgroundColor: mode === 'personal' ? '#13234d' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s ease',
                  marginBottom: '6px'
                }}
                className="hover:bg-white/[0.06]"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      backgroundColor: mode === 'personal' ? '#2563eb' : '#142044',
                      color: mode === 'personal' ? '#ffffff' : '#60a5fa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: mode === 'personal' ? '0 2px 6px rgba(37, 99, 235, 0.35)' : 'none'
                    }}
                  >
                    <User size={15} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Personal Space
                    </div>
                    <div style={{ fontSize: '10.5px', fontFamily: 'monospace', color: '#93c5fd' }}>
                      @{user?.primaryUsername || 'user'}.personal
                    </div>
                  </div>
                </div>
                {mode === 'personal' && (
                  <Check size={15} style={{ color: '#38bdf8', flexShrink: 0, marginLeft: '6px' }} />
                )}
              </button>

              {/* SECTION 2: ORGANIZATIONS CREATED */}
              {createdWorkspaces.length > 0 && (
                <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #142147' }}>
                  <div
                    style={{
                      padding: '4px 10px 6px 10px',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#64748b',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase'
                    }}
                  >
                    Organizations You Created
                  </div>
                  {createdWorkspaces.map((ws) => {
                    const isActive = mode === 'workspace' && activeWorkspace?.id === ws.id;
                    return (
                      <button
                        key={ws.id}
                        type="button"
                        onClick={() => handleSwitchContext('workplace', ws)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: '10px',
                          border: isActive ? '1px solid #2b4894' : '1px solid transparent',
                          backgroundColor: isActive ? '#13234d' : 'transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 0.15s ease',
                          marginBottom: '3px'
                        }}
                        className="hover:bg-white/[0.06]"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <div
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '8px',
                              backgroundColor: isActive ? '#2563eb' : '#142044',
                              color: isActive ? '#ffffff' : '#fbbf24',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              boxShadow: isActive ? '0 2px 6px rgba(37, 99, 235, 0.35)' : 'none'
                            }}
                          >
                            <Building2 size={15} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {ws.name}
                            </div>
                            <div style={{ fontSize: '10.5px', fontFamily: 'monospace', color: '#94a3b8' }}>
                              @{ws.contextualUsername || `${user?.primaryUsername || 'user'}.${ws.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '6px' }}>
                          <span
                            style={{
                              fontSize: '9.5px',
                              fontWeight: 600,
                              padding: '1px 6px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(245, 158, 11, 0.15)',
                              color: '#fbbf24',
                              border: '1px solid rgba(245, 158, 11, 0.3)'
                            }}
                          >
                            Owner
                          </span>
                          {isActive && <Check size={15} style={{ color: '#38bdf8' }} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* SECTION 3: JOINED ORGANIZATIONS */}
              {joinedWorkspaces.length > 0 && (
                <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #142147' }}>
                  <div
                    style={{
                      padding: '4px 10px 6px 10px',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#64748b',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase'
                    }}
                  >
                    Joined Organizations
                  </div>
                  {joinedWorkspaces.map((ws) => {
                    const isActive = mode === 'workspace' && activeWorkspace?.id === ws.id;
                    return (
                      <button
                        key={ws.id}
                        type="button"
                        onClick={() => handleSwitchContext('workplace', ws)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: '10px',
                          border: isActive ? '1px solid #2b4894' : '1px solid transparent',
                          backgroundColor: isActive ? '#13234d' : 'transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 0.15s ease',
                          marginBottom: '3px'
                        }}
                        className="hover:bg-white/[0.06]"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <div
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '8px',
                              backgroundColor: isActive ? '#2563eb' : '#142044',
                              color: isActive ? '#ffffff' : '#a78bfa',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              boxShadow: isActive ? '0 2px 6px rgba(37, 99, 235, 0.35)' : 'none'
                            }}
                          >
                            <Building2 size={15} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {ws.name}
                            </div>
                            <div style={{ fontSize: '10.5px', fontFamily: 'monospace', color: '#94a3b8' }}>
                              @{ws.contextualUsername || `${user?.primaryUsername || 'user'}.${ws.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '6px' }}>
                          <span
                            style={{
                              fontSize: '9.5px',
                              fontWeight: 600,
                              padding: '1px 6px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(148, 163, 184, 0.12)',
                              color: '#cbd5e1',
                              border: '1px solid rgba(148, 163, 184, 0.25)'
                            }}
                          >
                            Member
                          </span>
                          {isActive && <Check size={15} style={{ color: '#38bdf8' }} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* SECTION 4: ACTIONS */}
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #142147', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setContextDropdownOpen(false);
                    setCreateWsModalOpen(true);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 10px',
                    borderRadius: '8px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#60a5fa',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  className="hover:bg-blue-500/10"
                >
                  <Plus size={14} style={{ color: '#3b82f6' }} />
                  <span>Create New Workplace</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setContextDropdownOpen(false);
                    navigate('/');
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 10px',
                    borderRadius: '8px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#94a3b8',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  className="hover:bg-white/[0.06] hover:text-white"
                >
                  <Sparkles size={14} style={{ color: '#60a5fa' }} />
                  <span>All Contexts Hub</span>
                </button>
              </div>
            </div>
        )}
      </div>

      {/* Quick Workplace Switcher Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '6px 14px',
          backgroundColor: '#060d22',
          borderBottom: '1px solid #142044',
          overflowX: 'auto',
          flexShrink: 0
        }}
        className="custom-scrollbar"
      >
        <button
          type="button"
          onClick={() => handleSwitchContext('personal')}
          style={{
            padding: '4px 9px',
            borderRadius: '7px',
            fontSize: '11px',
            fontWeight: 700,
            border: mode === 'personal' ? '1px solid #2563eb' : '1px solid #16244d',
            backgroundColor: mode === 'personal' ? '#1d4ed8' : '#0c1634',
            color: mode === 'personal' ? '#ffffff' : '#94a3b8',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.15s ease'
          }}
        >
          <User size={12} />
          <span>Personal</span>
        </button>
        {workspaces.map((ws) => {
          const isActive = mode === 'workspace' && activeWorkspace?.id === ws.id;
          const shortName = ws.name.length > 14 ? ws.name.substring(0, 12) + '...' : ws.name;
          return (
            <button
              key={ws.id}
              type="button"
              onClick={() => handleSwitchContext('workplace', ws)}
              style={{
                padding: '4px 9px',
                borderRadius: '7px',
                fontSize: '11px',
                fontWeight: 700,
                border: isActive ? '1px solid #2563eb' : '1px solid #16244d',
                backgroundColor: isActive ? '#1d4ed8' : '#0c1634',
                color: isActive ? '#ffffff' : '#94a3b8',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s ease'
              }}
              title={ws.name}
            >
              <Building2 size={12} />
              <span>{shortName}</span>
            </button>
          );
        })}
      </div>

      {/* ================= WORKSPACE MODE ================= */}
      {mode === 'workspace' ? (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Search bar inside tree */}
          <div style={{ padding: '12px 14px 6px 14px' }}>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#060d22',
                border: '1px solid #16244d',
                borderRadius: '10px',
                padding: '7px 10px',
                gap: '8px',
                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'
              }}
            >
              <Search
                size={14}
                style={{ color: '#64748b', flexShrink: 0 }}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search hierarchy & teams..."
                style={{
                  width: '100%',
                  backgroundColor: 'transparent',
                  fontSize: '12px',
                  color: '#ffffff',
                  border: 'none',
                  outline: 'none',
                  fontWeight: 400
                }}
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <X size={13} />
                </button>
              ) : (
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    color: '#64748b',
                    backgroundColor: '#0f1938',
                    border: '1px solid #1b2954',
                    borderRadius: '4px',
                    padding: '2px 5px',
                    flexShrink: 0,
                    userSelect: 'none'
                  }}
                >
                  ⌘K
                </span>
              )}
            </div>
          </div>

          {/* Tree View or Clean Onboarding */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-1">
            {workspaces.length === 0 ? (
              <div style={{ padding: '36px 14px', textAlign: 'center' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#0f1b3b', border: '1px solid #1c2e5e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', color: '#60a5fa' }}>
                  <Building2 size={20} />
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', marginBottom: '4px' }}>
                  No Workspaces Yet
                </div>
                <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                  Create an organization or join with code to view hierarchy & channels.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setCreateWsModalOpen(true)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#1d63ff',
                      color: '#ffffff',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    + Create a Workplace
                  </button>
                  <button
                    type="button"
                    onClick={() => setJoinGroupOpen(true)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#0c1532',
                      color: '#cbd5e1',
                      border: '1px solid #1a2954',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    # Join with Code
                  </button>
                </div>
              </div>
            ) : (
              <WorkspaceHierarchy filterSearch={search} />
            )}
          </div>

          {/* Workspace Action Buttons */}
          <div
            style={{
              padding: '10px 14px',
              borderTop: '1px solid #131f40',
              backgroundColor: '#070f26',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexShrink: 0
            }}
          >
            <button
              type="button"
              onClick={() => setCreateGroupOpen(true)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #132147 0%, #1a2d5e 100%)',
                color: '#ffffff',
                border: '1px solid #243b78',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
              }}
            >
              <Plus size={14} style={{ color: '#60a5fa' }} />
              <span>Create Group</span>
            </button>
            <button
              type="button"
              onClick={() => setJoinGroupOpen(true)}
              style={{
                width: '36px',
                height: '35px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '10px',
                backgroundColor: '#0c1532',
                color: '#94a3b8',
                border: '1px solid #1a2954',
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
              }}
              title="Join via Group Code"
            >
              <KeyRound size={15} />
            </button>
          </div>
        </div>
      ) : (
        /* ================= PERSONAL MODE ================= */
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Search Bar matching Workspace Mode capsule */}
          <div style={{ padding: '12px 14px 6px 14px' }}>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#060d22',
                border: '1px solid #16244d',
                borderRadius: '10px',
                padding: '7px 10px',
                gap: '8px',
                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'
              }}
            >
              <Search size={14} style={{ color: '#64748b', flexShrink: 0 }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search direct chats & groups..."
                style={{
                  width: '100%',
                  backgroundColor: 'transparent',
                  fontSize: '12px',
                  color: '#ffffff',
                  border: 'none',
                  outline: 'none'
                }}
                className="placeholder:text-slate-500"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <X size={13} />
                </button>
              ) : (
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    backgroundColor: '#0c1532',
                    color: '#64748b',
                    border: '1px solid #1a2850',
                    flexShrink: 0
                  }}
                >
                  ⌘K
                </span>
              )}
            </div>
          </div>

          {/* Contacts & Groups Scroll Area with generous 12px horizontal padding */}
          <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ padding: '6px 12px 12px 12px' }}>
            {(() => {
              const cleanSearch = search.trim().toLowerCase().replace(/^@/, '');
              const filteredContacts = storeContacts.filter((c) => {
                if (!cleanSearch) return true;
                const matchName = c.name?.toLowerCase().includes(cleanSearch);
                const matchUser = c.username?.replace(/^@/, '').toLowerCase().includes(cleanSearch);
                return matchName || matchUser;
              });

              const filteredGroups = storeGroups.filter((g) => {
                if (!cleanSearch) return true;
                return g.name?.toLowerCase().includes(cleanSearch);
              });

              const hasNoData = storeContacts.length === 0 && storeGroups.length === 0;

              if (hasNoData && !cleanSearch) {
                return (
                  <div style={{ padding: '36px 10px', textAlign: 'center' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        backgroundColor: '#0f1b3b',
                        border: '1px solid #1c2e5e',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px auto',
                        color: '#60a5fa'
                      }}
                    >
                      <Users size={22} />
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', marginBottom: '4px' }}>
                      No Contacts Yet
                    </div>
                    <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                      Search any registered friend by typing their <span style={{ color: '#60a5fa', fontFamily: 'monospace' }}>@username</span> in the search bar above or add them directly.
                    </p>
                    <button
                      type="button"
                      onClick={() => setAddContactOpen(true)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        backgroundColor: '#1d63ff',
                        color: '#ffffff',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(29, 99, 255, 0.25)'
                      }}
                    >
                      + Add First Contact
                    </button>
                  </div>
                );
              }

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Direct Messages Section */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 6px 4px 6px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                          Direct Messages
                        </span>
                        <span
                          style={{
                            fontSize: '10px',
                            fontFamily: 'monospace',
                            padding: '1px 6px',
                            borderRadius: '9999px',
                            backgroundColor: '#0c1636',
                            color: '#60a5fa',
                            border: '1px solid #192d63'
                          }}
                        >
                          {filteredContacts.length}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAddContactOpen(true)}
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '5px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid #16244d',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        className="hover:bg-white/10 hover:text-white"
                        title="Add New Contact"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                      {filteredContacts.map((contact) => {
                        const isActive = activeChat === contact.id;
                        return (
                          <button
                            key={contact.id}
                            type="button"
                            onClick={() => setActiveChat(contact.id)}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '8px 10px',
                              borderRadius: '11px',
                              border: isActive ? '1px solid rgba(147, 197, 253, 0.35)' : '1px solid transparent',
                              background: isActive
                                ? 'linear-gradient(90deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)'
                                : 'transparent',
                              boxShadow: isActive
                                ? '0 3px 10px rgba(37, 99, 235, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                                : 'none',
                              cursor: 'pointer',
                              textAlign: 'left',
                              transition: 'background 0.15s ease, border-color 0.15s ease',
                              marginBottom: '2px'
                            }}
                            className="group hover:bg-white/[0.06]"
                          >
                            <Avatar name={contact.name} src={contact.avatar} size="sm" status={contact.status} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '6px' }}>
                                <span
                                  style={{
                                    fontSize: '12.5px',
                                    fontWeight: isActive ? 700 : 600,
                                    color: isActive ? '#ffffff' : '#f1f5f9',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                >
                                  {contact.name}
                                </span>
                                <span
                                  style={{
                                    fontSize: '10px',
                                    fontFamily: 'monospace',
                                    color: isActive ? '#bfdbfe' : '#64748b',
                                    flexShrink: 0
                                  }}
                                >
                                  {formatTime(contact.lastMessageTime)}
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                                <p
                                  style={{
                                    fontSize: '11px',
                                    margin: '2px 0 0 0',
                                    color: isActive ? '#dbeafe' : '#94a3b8',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    flex: 1
                                  }}
                                >
                                  {contact.lastMessage || `@${contact.username || 'user'}`}
                                </p>
                                {contact.username && (
                                  <span style={{ fontSize: '9.5px', color: isActive ? '#bfdbfe' : '#475569', fontFamily: 'monospace' }}>
                                    @{contact.username}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                      {filteredContacts.length === 0 && cleanSearch && (
                        <div style={{ padding: '6px 8px', fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
                          No local contacts match "{search}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Groups Section */}
                  {filteredGroups.length > 0 && (
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '4px 6px 4px 6px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            Groups
                          </span>
                          <span
                            style={{
                              fontSize: '10px',
                              fontFamily: 'monospace',
                              padding: '1px 6px',
                              borderRadius: '9999px',
                              backgroundColor: '#0c1636',
                              color: '#60a5fa',
                              border: '1px solid #192d63'
                            }}
                          >
                            {filteredGroups.length}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCreateGroupOpen(true)}
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '5px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid #16244d',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          className="hover:bg-white/10 hover:text-white"
                          title="Create Personal Group"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                        {filteredGroups.map((group) => {
                          const isActive = activeChat === group.id;
                          return (
                            <button
                              key={group.id}
                              type="button"
                              onClick={() => setActiveChat(group.id)}
                              style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '8px 10px',
                                borderRadius: '11px',
                                border: isActive ? '1px solid rgba(147, 197, 253, 0.35)' : '1px solid transparent',
                                background: isActive
                                  ? 'linear-gradient(90deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)'
                                  : 'transparent',
                                boxShadow: isActive
                                  ? '0 3px 10px rgba(37, 99, 235, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                                  : 'none',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'background 0.15s ease, border-color 0.15s ease',
                                marginBottom: '2px'
                              }}
                              className="group hover:bg-white/[0.06]"
                            >
                              <div
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '9px',
                                  background: isActive ? 'rgba(255, 255, 255, 0.25)' : getGroupGradient(group.name),
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#ffffff',
                                  flexShrink: 0,
                                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.25)',
                                  border: '1px solid rgba(255, 255, 255, 0.15)'
                                }}
                              >
                                <Users size={15} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '6px' }}>
                                  <span
                                    style={{
                                      fontSize: '12.5px',
                                      fontWeight: isActive ? 700 : 600,
                                      color: isActive ? '#ffffff' : '#f1f5f9',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis'
                                    }}
                                  >
                                    {group.name}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: '10px',
                                      fontFamily: 'monospace',
                                      color: isActive ? '#bfdbfe' : '#64748b',
                                      flexShrink: 0
                                    }}
                                  >
                                    {formatTime(group.lastMessageTime)}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', marginTop: '2px' }}>
                                  <p
                                    style={{
                                      fontSize: '11px',
                                      margin: 0,
                                      color: isActive ? '#dbeafe' : '#94a3b8',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      flex: 1
                                    }}
                                  >
                                    {group.lastMessage || 'Group active'}
                                  </p>
                                  {group.membersCount && (
                                    <span
                                      style={{
                                        fontSize: '9.5px',
                                        fontFamily: 'monospace',
                                        padding: '1px 5px',
                                        borderRadius: '9999px',
                                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : '#0a1329',
                                        color: isActive ? '#ffffff' : '#64748b',
                                        border: isActive ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid #16244b',
                                        flexShrink: 0
                                      }}
                                    >
                                      {group.membersCount}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Live Zyntra Global Directory Search Results */}
                  {cleanSearch && (
                    <div style={{ marginTop: '6px', paddingTop: '10px', borderTop: '1px solid #152247' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '4px 6px',
                          marginBottom: '4px'
                        }}
                      >
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            color: '#38bdf8',
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <Sparkles size={11} /> Find on Zyntra
                        </span>
                        {isSearchingDir && (
                          <span style={{ fontSize: '10px', color: '#64748b', fontStyle: 'italic' }}>
                            Searching...
                          </span>
                        )}
                      </div>

                      {directoryResults.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {directoryResults.map((u) => (
                            <div
                              key={u.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '8px 10px',
                                borderRadius: '10px',
                                backgroundColor: '#09132e',
                                border: '1px solid #182a57',
                                gap: '8px'
                              }}
                            >
                              <Avatar name={u.name} src={u.avatar} size="sm" status={u.status} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {u.name}
                                </div>
                                <div style={{ fontSize: '11px', color: '#60a5fa', fontFamily: 'monospace' }}>
                                  @{u.username}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleStartChatWithUser(u)}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  backgroundColor: '#1d63ff',
                                  color: '#ffffff',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  border: 'none',
                                  cursor: 'pointer',
                                  flexShrink: 0,
                                  boxShadow: '0 2px 5px rgba(29, 99, 255, 0.3)'
                                }}
                              >
                                + Chat
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : !isSearchingDir && filteredContacts.length === 0 && (
                        <div style={{ padding: '8px 6px', fontSize: '11.5px', color: '#64748b', textAlign: 'center' }}>
                          No user found for "@{cleanSearch}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Bottom Quick Action Bar for Personal Space */}
          <div
            style={{
              padding: '10px 14px',
              borderTop: '1px solid #142044',
              backgroundColor: '#070f26',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexShrink: 0
            }}
          >
            <button
              type="button"
              onClick={() => setCreateGroupOpen(true)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '9px 12px',
                borderRadius: '10px',
                background: 'linear-gradient(180deg, #1d3368 0%, #15244d 100%)',
                color: '#e2e8f0',
                border: '1px solid #243b78',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
              }}
              className="hover:border-blue-500/50"
            >
              <Plus size={14} style={{ color: '#60a5fa' }} />
              <span>Create Group</span>
            </button>
            <button
              type="button"
              onClick={() => setAddContactOpen(true)}
              style={{
                width: '36px',
                height: '35px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '10px',
                backgroundColor: '#0c1532',
                color: '#94a3b8',
                border: '1px solid #1a2954',
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
              }}
              className="hover:border-blue-500/50 hover:text-white"
              title="Add New Contact"
            >
              <User size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateGroupModal
        isOpen={createGroupOpen}
        onClose={() => setCreateGroupOpen(false)}
        parentNodeName={mode === 'workspace' ? activeWorkspace?.name : 'Personal Space'}
        onSubmit={handleCreateGroupSubmit}
      />
      <JoinGroupModal
        isOpen={joinGroupOpen}
        onClose={() => setJoinGroupOpen(false)}
        onSubmit={handleJoinCodeSubmit}
      />
      <AddContactModal
        isOpen={addContactOpen}
        onClose={() => setAddContactOpen(false)}
      />
      {/* Create Workplace Modal */}
      <Modal
        isOpen={createWsModalOpen}
        onClose={() => setCreateWsModalOpen(false)}
        title="Create New Workplace"
        size="md"
      >
        <form onSubmit={handleCreateWorkspaceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
              value={newWsName}
              onChange={(e) => {
                const val = e.target.value;
                setNewWsName(val);
                const cleanSlug = val.toLowerCase().replace(/[^a-z0-9]/g, '');
                setNewWsHandle(cleanSlug ? `soumya.${cleanSlug}` : '');
              }}
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
                value={newWsHandle}
                onChange={(e) => setNewWsHandle(e.target.value)}
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
              onClick={() => setCreateWsModalOpen(false)}
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
              disabled={!newWsName.trim()}
              style={{
                padding: '9px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#1d63ff',
                color: '#ffffff',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: newWsName.trim() ? 'pointer' : 'not-allowed',
                opacity: newWsName.trim() ? 1 : 0.5,
                boxShadow: '0 2px 6px rgba(29, 99, 255, 0.25)'
              }}
            >
              Create & Launch
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Sidebar;
