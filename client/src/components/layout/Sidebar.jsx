import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Users,
  Plus,
  Building2,
  User,
  ChevronDown,
  KeyRound,
  X,
  Sparkles
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
import ContextDropdown from './ContextDropdown';
import ContactCard from '../contacts/ContactCard';

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex flex-col h-full select-none bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] border-r border-[var(--sidebar-border)] relative">
      {/* Top Context Switcher Header */}
      <div className="p-3 border-b border-[var(--sidebar-border)] bg-[var(--color-bg-primary)] relative z-50">
        <button
          type="button"
          onClick={() => setContextDropdownOpen(!contextDropdownOpen)}
          className="w-full flex items-center justify-between p-2 rounded-[var(--radius-md)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] cursor-pointer text-left shadow-sm transition-all duration-150 hover:border-[var(--color-accent)] focus-glow"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center text-white font-bold shrink-0 shadow-md">
              {mode === 'personal' ? <User size={16} /> : <Building2 size={16} />}
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-[var(--color-text-primary)] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                {mode === 'personal' ? 'Personal Space' : activeWorkspace?.name || 'Workspace'}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] shrink-0" />
                <span className="text-[11px] font-mono text-[var(--color-text-secondary)] whitespace-nowrap overflow-hidden text-ellipsis">
                  {mode === 'personal'
                    ? `@${user?.primaryUsername || 'user'}.personal`
                    : `@${activeWorkspace?.contextualUsername || `${user?.primaryUsername || 'user'}.${activeWorkspace?.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'ws'}`}`}
                </span>
              </div>
            </div>
          </div>

          <div className="w-6 h-6 rounded-md bg-[var(--color-bg-tertiary)] flex items-center justify-center text-[var(--color-text-secondary)] shrink-0 ml-1.5">
            <ChevronDown
              size={14}
              style={{
                transform: contextDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </div>
        </button>

        <ContextDropdown
          isOpen={contextDropdownOpen}
          setIsOpen={setContextDropdownOpen}
          dropdownRef={dropdownRef}
          mode={mode}
          user={user}
          activeWorkspace={activeWorkspace}
          createdWorkspaces={createdWorkspaces}
          joinedWorkspaces={joinedWorkspaces}
          handleSwitchContext={handleSwitchContext}
          navigate={navigate}
          setCreateWsModalOpen={setCreateWsModalOpen}
        />
      </div>

      {/* Quick Workplace Switcher Tabs */}
      <div className="flex items-center gap-1 px-3 py-1.5 bg-[var(--color-bg-secondary)] border-b border-[var(--sidebar-border)] overflow-x-auto shrink-0 custom-scrollbar">
        <button
          type="button"
          onClick={() => handleSwitchContext('personal')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap flex items-center gap-1 transition-all duration-150 ${mode === 'personal' ? 'bg-[var(--color-accent)] text-white border border-[var(--color-accent)]' : 'bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] border border-[var(--color-border-primary)] hover:bg-[var(--color-bg-hover)]'}`}
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
              title={ws.name}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap flex items-center gap-1 transition-all duration-150 ${isActive ? 'bg-[var(--color-accent)] text-white border border-[var(--color-accent)]' : 'bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] border border-[var(--color-border-primary)] hover:bg-[var(--color-bg-hover)]'}`}
            >
              <Building2 size={12} />
              <span>{shortName}</span>
            </button>
          );
        })}
      </div>

      {/* SEARCH BAR */}
      <div className="p-3 pb-1.5 bg-[var(--sidebar-bg)]">
        <div className="relative flex items-center bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg py-1.5 px-2.5 gap-2 backdrop-blur-[var(--glass-blur)] transition-all duration-200 focus-within:border-[var(--color-accent)] focus-within:ring-2 focus-within:ring-[rgba(var(--color-accent-rgb),0.2)]">
          <Search size={14} className="text-[var(--sidebar-text-secondary)] shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={mode === 'workspace' ? "Search hierarchy & teams..." : "Search direct chats & groups..."}
            className="w-full bg-transparent text-[12px] text-[var(--sidebar-text)] border-none outline-none placeholder:text-[var(--sidebar-text-secondary)]"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="bg-transparent border-none text-[var(--sidebar-text-secondary)] cursor-pointer p-0.5 flex items-center hover:text-[var(--sidebar-text)] transition-colors"
            >
              <X size={13} />
            </button>
          ) : (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[4px] bg-[var(--color-bg-tertiary)] text-[var(--sidebar-text-secondary)] border border-[var(--color-border-primary)] shrink-0 select-none">
              ⌘K
            </span>
          )}
        </div>
      </div>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-1.5">
        {mode === 'workspace' ? (
          workspaces.length === 0 ? (
            <div className="py-9 px-3 text-center">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] flex items-center justify-center mx-auto mb-3 text-[var(--color-accent)] shadow-sm">
                <Building2 size={20} />
              </div>
              <div className="text-[13px] font-bold text-[var(--color-text-primary)] mb-1">
                No Workspaces Yet
              </div>
              <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed mb-4">
                Create an organization or join with code to view hierarchy & channels.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setCreateWsModalOpen(true)}
                  className="w-full py-2 px-3 bg-[var(--color-accent)] text-white rounded-lg text-[12px] font-semibold border-none cursor-pointer shadow-md hover:bg-[var(--color-accent-hover)] transition-colors"
                >
                  + Create a Workplace
                </button>
                <button
                  type="button"
                  onClick={() => setJoinGroupOpen(true)}
                  className="w-full py-2 px-3 bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-border-primary)] rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-[var(--color-bg-hover)] transition-colors"
                >
                  # Join with Code
                </button>
              </div>
            </div>
          ) : (
            <WorkspaceHierarchy filterSearch={search} />
          )
        ) : (
          /* PERSONAL MODE LIST */
          (() => {
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
                <div className="py-9 px-2 text-center">
                  <div className="w-11 h-11 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] flex items-center justify-center mx-auto mb-3 text-[var(--color-accent)] shadow-sm">
                    <Users size={22} />
                  </div>
                  <div className="text-[13px] font-bold text-[var(--color-text-primary)] mb-1">
                    No Contacts Yet
                  </div>
                  <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed mb-4">
                    Search any registered friend by typing their <span className="text-[var(--color-accent)] font-mono">@username</span> in the search bar above or add them directly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setAddContactOpen(true)}
                    className="w-full py-2 px-3 bg-[var(--color-accent)] text-white rounded-lg text-[12px] font-semibold border-none cursor-pointer shadow-md hover:bg-[var(--color-accent-hover)] transition-colors"
                  >
                    + Add First Contact
                  </button>
                </div>
              );
            }

            return (
              <div className="flex flex-col gap-3.5 pb-2">
                {/* Direct Messages Section */}
                <div>
                  <div className="flex items-center justify-between py-1 px-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10.5px] font-extrabold text-[var(--sidebar-text-secondary)] tracking-widest uppercase">
                        Direct Messages
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-[var(--color-bg-tertiary)] text-[var(--color-accent)] border border-[var(--color-border-primary)]">
                        {filteredContacts.length}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAddContactOpen(true)}
                      className="w-5 h-5 rounded flex items-center justify-center bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--sidebar-text-secondary)] cursor-pointer hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text)] transition-colors"
                      title="Add New Contact"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="flex flex-col gap-0.5 mt-1"
                  >
                    {filteredContacts.map((contact) => (
                      <motion.div key={contact.id} variants={itemVariants}>
                        <ContactCard
                          contact={contact}
                          isActive={activeChat === contact.id}
                          onClick={() => setActiveChat(contact.id)}
                        />
                      </motion.div>
                    ))}
                    {filteredContacts.length === 0 && cleanSearch && (
                      <div className="px-2 py-1.5 text-[11px] text-[var(--sidebar-text-secondary)] italic">
                        No local contacts match "{search}"
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Groups Section */}
                {filteredGroups.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between py-1 px-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10.5px] font-extrabold text-[var(--sidebar-text-secondary)] tracking-widest uppercase">
                          Groups
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-[var(--color-bg-tertiary)] text-[var(--color-accent)] border border-[var(--color-border-primary)]">
                          {filteredGroups.length}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCreateGroupOpen(true)}
                        className="w-5 h-5 rounded flex items-center justify-center bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--sidebar-text-secondary)] cursor-pointer hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text)] transition-colors"
                        title="Create Personal Group"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      className="flex flex-col gap-0.5 mt-1"
                    >
                      {filteredGroups.map((group) => {
                        const isActive = activeChat === group.id;
                        return (
                          <motion.button
                            key={group.id}
                            variants={itemVariants}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => setActiveChat(group.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left transition-all duration-150 mb-0.5 ${isActive ? 'bg-[rgba(var(--color-accent-rgb),0.14)] border-[rgba(var(--color-accent-rgb),0.3)]' : 'bg-transparent border-transparent hover:bg-[var(--sidebar-hover)]'}`}
                          >
                            {/* Active left bar */}
                            {isActive && (
                              <motion.div
                                layoutId="activeGroupBar"
                                style={{
                                  position: 'absolute',
                                  left: 0,
                                  top: '20%',
                                  bottom: '20%',
                                  width: '3px',
                                  borderRadius: '0 3px 3px 0',
                                  backgroundColor: 'var(--color-accent)',
                                }}
                              />
                            )}
                            
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm border border-[rgba(255,255,255,0.15)]"
                              style={{ background: isActive ? 'var(--color-accent)' : getGroupGradient(group.name) }}
                            >
                              <Users size={15} />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                              <div className="flex items-center justify-between gap-1.5">
                                <span className={`text-[12.5px] truncate ${isActive ? 'font-bold text-[var(--color-text-primary)]' : 'font-semibold text-[var(--sidebar-text)]'}`}>
                                  {group.name}
                                </span>
                                <span className={`text-[10px] font-mono shrink-0 ${isActive ? 'text-[var(--color-accent)]' : 'text-[var(--sidebar-text-secondary)]'}`}>
                                  {formatTime(group.lastMessageTime)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-1 mt-0.5">
                                <p className={`text-[11px] m-0 truncate flex-1 ${isActive ? 'text-[var(--color-text-primary)]' : 'text-[var(--sidebar-text-secondary)]'}`}>
                                  {group.lastMessage || 'Group active'}
                                </p>
                                {group.membersCount && (
                                  <span className={`text-[9.5px] font-mono px-1.5 py-0.5 rounded-full border shrink-0 ${isActive ? 'bg-[var(--color-bg-secondary)] text-[var(--color-accent)] border-[var(--color-border-primary)]' : 'bg-[var(--color-bg-tertiary)] text-[var(--sidebar-text-secondary)] border-[var(--color-border-primary)]'}`}>
                                    {group.membersCount}
                                  </span>
                                )}
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  </div>
                )}

                {/* Live Zyntra Global Directory Search Results */}
                {cleanSearch && (
                  <div className="mt-1.5 pt-2.5 border-t border-[var(--sidebar-border)]">
                    <div className="flex items-center justify-between px-1.5 mb-1">
                      <span className="text-[10px] font-extrabold text-[var(--color-accent)] tracking-widest uppercase flex items-center gap-1.5">
                        <Sparkles size={11} /> Find on Zyntra
                      </span>
                      {isSearchingDir && (
                        <span className="text-[10px] text-[var(--sidebar-text-secondary)] italic">
                          Searching...
                        </span>
                      )}
                    </div>

                    {directoryResults.length > 0 ? (
                      <div className="flex flex-col gap-1 mt-1">
                        {directoryResults.map((u) => (
                          <div
                            key={u.id}
                            className="flex items-center justify-between p-2 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] gap-2 shadow-sm"
                          >
                            <Avatar name={u.name} src={u.avatar} size="sm" status={u.status} />
                            <div className="flex-1 min-w-0">
                              <div className="text-[12px] font-bold text-[var(--color-text-primary)] truncate">
                                {u.name}
                              </div>
                              <div className="text-[11px] text-[var(--color-accent)] font-mono truncate">
                                @{u.username}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleStartChatWithUser(u)}
                              className="px-2.5 py-1 rounded-md bg-[var(--color-accent)] text-white text-[11px] font-bold border-none cursor-pointer shrink-0 shadow-sm hover:bg-[var(--color-accent-hover)] transition-colors"
                            >
                              + Chat
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : !isSearchingDir && filteredContacts.length === 0 && (
                      <div className="py-2 px-1.5 text-[11.5px] text-[var(--sidebar-text-secondary)] text-center">
                        No user found for "@{cleanSearch}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()
        )}
      </div>

      {/* Bottom Quick Action Bar */}
      <div className="p-2.5 border-t border-[var(--sidebar-border)] bg-[var(--color-bg-primary)] flex items-center gap-2 shrink-0 relative z-10">
        <button
          type="button"
          onClick={() => setCreateGroupOpen(true)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-border-primary)] text-[12px] font-semibold cursor-pointer shadow-sm transition-colors hover:border-[var(--color-accent)] focus-glow"
        >
          <Plus size={14} className="text-[var(--color-accent)]" />
          <span>Create Group</span>
        </button>
        {mode === 'workspace' ? (
          <button
            type="button"
            onClick={() => setJoinGroupOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] border border-[var(--color-border-primary)] cursor-pointer shrink-0 shadow-sm transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-text-primary)]"
            title="Join via Group Code"
          >
            <KeyRound size={15} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setAddContactOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] border border-[var(--color-border-primary)] cursor-pointer shrink-0 shadow-sm transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-text-primary)]"
            title="Add New Contact"
          >
            <User size={15} />
          </button>
        )}
      </div>

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
        <form onSubmit={handleCreateWorkspaceSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[12px] font-bold text-[var(--color-text-primary)] mb-1.5">
              Workplace Name
            </label>
            <input
              placeholder="e.g. Acme Innovations or Stanford University"
              value={newWsName}
              onChange={(e) => {
                const val = e.target.value;
                setNewWsName(val);
                const cleanSlug = val.toLowerCase().replace(/[^a-z0-9]/g, '');
                setNewWsHandle(cleanSlug ? `${user?.primaryUsername || 'user'}.${cleanSlug}` : '');
              }}
              autoFocus
              className="w-full p-2.5 bg-[var(--color-bg-primary)] border-2 border-[var(--color-accent)] rounded-lg text-[13px] text-[var(--color-text-primary)] outline-none shadow-[var(--glow-accent-sm)] focus-glow"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[var(--color-text-primary)] mb-1.5">
              Contextual Username in this Organization
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-[var(--color-text-secondary)] text-[13px] font-semibold">
                @
              </span>
              <input
                placeholder={`${user?.primaryUsername || 'user'}.acme`}
                value={newWsHandle}
                onChange={(e) => setNewWsHandle(e.target.value)}
                className="w-full py-2.5 pr-3 pl-7 bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-lg text-[13px] text-[var(--color-text-primary)] font-mono outline-none focus-glow"
              />
            </div>
            <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">
              Members of this workplace will see this identity while your permanent account remains @{user?.primaryUsername || 'user'}.
            </p>
          </div>

          <div className="pt-4 border-t border-[var(--color-border-primary)] flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setCreateWsModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] text-[12.5px] font-semibold text-[var(--color-text-secondary)] cursor-pointer hover:bg-[var(--color-bg-hover)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newWsName.trim()}
              className={`px-4 py-2 rounded-lg border-none bg-[var(--color-accent)] text-white text-[12.5px] font-bold cursor-pointer shadow-md transition-all ${newWsName.trim() ? 'opacity-100 hover:bg-[var(--color-accent-hover)]' : 'opacity-50 cursor-not-allowed'}`}
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
