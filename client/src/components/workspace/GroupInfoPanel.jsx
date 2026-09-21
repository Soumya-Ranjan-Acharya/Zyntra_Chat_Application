import React, { useState, useMemo } from 'react';
import { X, Lock, Copy, Check, Users, ShieldCheck, FolderTree, LogOut, AlertTriangle, ChevronRight, UserPlus } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { sampleMembers } from '../../data/mockData';
import useWorkspaceStore from '../../store/useWorkspaceStore';
import useAuthStore from '../../store/useAuthStore';
import AddMembersModal from './AddMembersModal';

const roleBadgeConfig = {
  'workspace-owner': { label: 'owner', bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  'workspace-admin': { label: 'admin', bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
  'group-admin': { label: 'admin', bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  owner: { label: 'owner', bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  admin: { label: 'admin', bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  moderator: { label: 'moderator', bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
  member: { label: 'member', bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' },
};

const GroupInfoPanel = ({ node, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);
  const [leaveModalType, setLeaveModalType] = useState(null); // 'subgroup' | 'parentGroup' | 'workspace' | null
  const [leaveSuccessMsg, setLeaveSuccessMsg] = useState(null);

  const { user: currentUser } = useAuthStore();

  const {
    nodes,
    activeWorkspace,
    setActiveNode,
    getNodePath,
    addMembersToNode,
    leaveSubgroup,
    leaveParentGroup,
    leaveWorkspace
  } = useWorkspaceStore();

  if (!node) return null;

  const path = getNodePath ? getNodePath(node.id) : [];

  const displayMembers = useMemo(() => {
    if (Array.isArray(node.members) && node.members.length > 0) {
      return node.members;
    }
    if (node.id && String(node.id).startsWith('giet-')) {
      return sampleMembers;
    }
    return [
      {
        id: activeWorkspace?.owner || currentUser?.id || 'creator',
        name: currentUser?.name || 'Group Creator',
        username: currentUser?.primaryUsername || 'creator',
        avatar: currentUser?.avatar || null,
        role: 'owner',
      }
    ];
  }, [node.members, node.id, activeWorkspace?.owner, currentUser]);

  const handleCopyCode = () => {
    if (node.joinCode) {
      navigator.clipboard.writeText(node.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const parentNode = node.parentId ? nodes[node.parentId] : null;
  const isWorkspaceRoot = node.id === activeWorkspace?.rootNodeId;
  const isTopLevelGroup = parentNode && parentNode.id === activeWorkspace?.rootNodeId;
  const isSubgroup = parentNode && !isTopLevelGroup && !isWorkspaceRoot;

  const childSubgroups = (node.children || [])
    .map((childId) => nodes[childId])
    .filter(Boolean);

  const handleConfirmLeaveSubgroup = () => {
    const res = leaveSubgroup(node.id);
    if (res.success) {
      setLeaveSuccessMsg(`Successfully left #${node.name}. Your parent group access is retained.`);
      setTimeout(() => {
        setLeaveSuccessMsg(null);
        setLeaveModalType(null);
        if (onClose) onClose();
      }, 1400);
    }
  };

  const handleConfirmLeaveParentGroup = () => {
    const targetGroupId = isSubgroup ? parentNode.id : node.id;
    const targetName = isSubgroup ? parentNode.name : node.name;
    const res = leaveParentGroup(targetGroupId);
    if (res.success) {
      setLeaveSuccessMsg(`Successfully left ${targetName} and its sub-groups.`);
      setTimeout(() => {
        setLeaveSuccessMsg(null);
        setLeaveModalType(null);
        if (onClose) onClose();
      }, 1400);
    }
  };

  const handleConfirmLeaveWorkspace = () => {
    const res = leaveWorkspace(activeWorkspace.id);
    if (res.success) {
      setLeaveSuccessMsg(`Successfully left ${activeWorkspace.name}.`);
      setTimeout(() => {
        setLeaveSuccessMsg(null);
        setLeaveModalType(null);
        if (onClose) onClose();
      }, 1200);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-slate-200/90 shadow-xl lg:shadow-none w-full select-none">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
        <span className="font-bold text-sm text-slate-900">
          {isSubgroup ? 'Sub-group Details' : 'Group Details'}
        </span>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          title="Close details"
        >
          <X size={16} />
        </button>
      </div>

      {/* Success Notification Alert */}
      {leaveSuccessMsg && (
        <div className="m-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check size={16} className="text-emerald-600 shrink-0" />
          <span>{leaveSuccessMsg}</span>
        </div>
      )}

      {/* Drawer Body */}
      <div
        className="flex-1 min-h-0 overflow-y-auto p-5 space-y-6 custom-scrollbar"
        style={{ flex: '1 1 0%', minHeight: 0, overflowY: 'auto' }}
      >
        {/* Main Group Header Card */}
        <div className="text-center pb-5 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Users size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            {node.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {node.description || 'Organizational communication channel'}
          </p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200/60">
            <ShieldCheck size={12} className="text-emerald-600" />
            End-to-End Encrypted
          </div>
        </div>

        {/* Hierarchy Context Breadcrumb */}
        {path && path.length > 1 ? (
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Location in Organization
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
              {path.map((crumb, idx) => {
                const isLast = idx === path.length - 1;
                return (
                  <React.Fragment key={crumb.id}>
                    {idx > 0 && <ChevronRight size={12} className="text-slate-400 shrink-0" />}
                    <span
                      style={{
                        padding: '2px 7px',
                        borderRadius: '6px',
                        backgroundColor: isLast ? '#eff6ff' : '#ffffff',
                        border: isLast ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                        color: isLast ? '#1d4ed8' : idx === 0 ? '#475569' : '#1e293b',
                        fontWeight: isLast ? 700 : 600,
                        fontSize: '11px',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                      }}
                    >
                      {crumb.name}
                    </span>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        ) : parentNode ? (
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Location in Organization
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-semibold text-[11px] shadow-2xs">
                {activeWorkspace?.name}
              </span>
              <ChevronRight size={12} className="text-slate-400 shrink-0" />
              <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[11px] shadow-2xs">
                {node.name}
              </span>
            </div>
          </div>
        ) : null}

        {/* Join Code Box */}
        {node.joinCode && (
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Channel Join Code
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <code className="flex-1 text-xs font-mono font-bold text-slate-800 tracking-wide">
                {node.joinCode}
              </code>
              <button
                onClick={handleCopyCode}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                title="Copy Code"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-emerald-600" />
                    <span className="text-emerald-600 text-[10px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span className="text-[10px]">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Subgroups Hierarchy Links (if any) */}
        {childSubgroups.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Subgroups & Channels ({childSubgroups.length})
              </span>
              <FolderTree size={12} className="text-slate-400" />
            </div>
            <div className="space-y-1">
              {childSubgroups.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setActiveNode(child.id)}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-left bg-slate-50/80 hover:bg-blue-50 border border-slate-200/70 hover:border-blue-200 transition-colors group cursor-pointer"
                >
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 truncate">
                    #{child.name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {child.memberCount} members
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Members List */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Active Members ({displayMembers.length})
            </span>
            <button
              type="button"
              onClick={() => setIsAddMembersOpen(true)}
              className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-2 py-0.5 rounded-lg transition-colors cursor-pointer border border-blue-200/60"
            >
              <UserPlus size={12} />
              <span>Add</span>
            </button>
          </div>
          <div className="space-y-1.5">
            {displayMembers.map((member) => {
              const roleInfo = roleBadgeConfig[member.role] || roleBadgeConfig.member;
              return (
                <div
                  key={member.id || member.username}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <Avatar name={member.name} avatarUrl={member.avatar} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-900 truncate">
                      {member.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      @{member.username ? String(member.username).replace(/^@/, '') : 'user'}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      backgroundColor: roleInfo.bg,
                      color: roleInfo.text,
                      border: `1px solid ${roleInfo.border}`,
                      flexShrink: 0,
                      textTransform: 'lowercase',
                      lineHeight: 1.4
                    }}
                  >
                    {roleInfo.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Inline Confirmation Card for Leaving */}
      {leaveModalType ? (
        <div className="p-4 border-t border-red-200 bg-red-50/80">
          <div className="flex items-center gap-2 text-red-800 font-bold text-xs mb-1">
            <AlertTriangle size={15} />
            {leaveModalType === 'subgroup' && `Leave #${node.name} only?`}
            {leaveModalType === 'parentGroup' && `Leave ${parentNode?.name || node.name}?`}
            {leaveModalType === 'workspace' && `Leave ${activeWorkspace.name}?`}
          </div>
          <p className="text-[11px] text-red-700/90 leading-relaxed mb-3">
            {leaveModalType === 'subgroup' && (
              <>
                You will leave <strong>{node.name}</strong> only. Your membership in{' '}
                <strong>{parentNode?.name}</strong> and the workspace will remain active.
              </>
            )}
            {leaveModalType === 'parentGroup' && (
              <>
                You will leave <strong>{parentNode?.name || node.name}</strong> and all nested sub-channels.
              </>
            )}
            {leaveModalType === 'workspace' && (
              <>
                You will leave the entire <strong>{activeWorkspace.name}</strong> organization.
              </>
            )}
          </p>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setLeaveModalType(null)}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (leaveModalType === 'subgroup') handleConfirmLeaveSubgroup();
                else if (leaveModalType === 'parentGroup') handleConfirmLeaveParentGroup();
                else if (leaveModalType === 'workspace') handleConfirmLeaveWorkspace();
              }}
              className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 cursor-pointer shadow-xs"
            >
              Confirm Leave
            </button>
          </div>
        </div>
      ) : (
        /* Membership Leaving Controls */
        <div style={{ flexShrink: 0, padding: '14px 18px 20px 18px', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
          {isSubgroup ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Option A: Leave Sub-group Only */}
              <button
                type="button"
                onClick={() => setLeaveModalType('subgroup')}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #fecaca',
                  backgroundColor: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#fef2f2';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <LogOut size={13} />
                  Leave {node.name} Only
                </span>
                <span style={{ fontSize: '10px', color: '#64748b', backgroundColor: '#f8fafc', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                  Sub-group only
                </span>
              </button>

              {/* Option B: Leave Parent Group */}
              {parentNode && (
                <button
                  type="button"
                  onClick={() => setLeaveModalType('parentGroup')}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LogOut size={13} />
                    Leave Parent ({parentNode.name})
                  </span>
                  <span style={{ fontSize: '10px', color: '#64748b', backgroundColor: '#f8fafc', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                    All sub-channels
                  </span>
                </button>
              )}
            </div>
          ) : isTopLevelGroup ? (
            /* Direct group under root */
            <button
              type="button"
              onClick={() => setLeaveModalType('parentGroup')}
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: '10px',
                border: '1px solid #fecaca',
                backgroundColor: '#ffffff',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 1px 2px rgba(220, 38, 38, 0.05)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#fef2f2';
                e.currentTarget.style.borderColor = '#f87171';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#fecaca';
              }}
            >
              <LogOut size={14} />
              <span>Leave Group ({node.name})</span>
            </button>
          ) : isWorkspaceRoot ? (
            /* Root node of workspace */
            activeWorkspace.isOwner ? (
              <div style={{ textAlign: 'center', padding: '4px 0', fontSize: '11px', color: '#94a3b8' }}>
                👑 You are the Owner of {activeWorkspace.name}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setLeaveModalType('workspace')}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: '1px solid #fecaca',
                  backgroundColor: '#ffffff',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#fef2f2';
                  e.currentTarget.style.borderColor = '#f87171';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = '#fecaca';
                }}
              >
                <LogOut size={14} />
                <span>Leave Workspace ({activeWorkspace.name})</span>
              </button>
            )
          ) : null}
        </div>
      )}

      {/* Add Members Modal (WhatsApp-style multi-select) */}
      {isAddMembersOpen && (
        <AddMembersModal
          isOpen={isAddMembersOpen}
          onClose={() => setIsAddMembersOpen(false)}
          node={{ ...node, members: displayMembers }}
          onAddMembers={async (selectedUsers) => {
            await addMembersToNode(node.id, selectedUsers);
          }}
        />
      )}
    </div>
  );
};

export default GroupInfoPanel;
