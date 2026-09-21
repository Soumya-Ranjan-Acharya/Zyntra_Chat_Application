import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Sidebar from '../components/layout/Sidebar';
import ChatArea from '../components/chat/ChatArea';
import TopBar from '../components/layout/TopBar';
import GroupInfoPanel from '../components/workspace/GroupInfoPanel';
import useWorkspaceStore from '../store/useWorkspaceStore';
import useChatStore from '../store/useChatStore';
import useAuthStore from '../store/useAuthStore';
import { workspaces as demoWorkspaces, workspacePolicies } from '../data/mockData';
import { Building2, Plus, KeyRound, Sparkles, Shield } from 'lucide-react';
import Modal from '../components/ui/Modal';
import JoinGroupModal from '../components/workspace/JoinGroupModal';

const WorkspacePage = () => {
  const { wsId } = useParams();
  const navigate = useNavigate();
  const {
    workspaces: storeWorkspaces,
    nodes,
    activeWorkspace,
    setActiveWorkspace,
    activeNodeId,
    setActiveNode,
    getNodePath,
    createWorkspace,
    joinGroupByCode
  } = useWorkspaceStore();

  const { messages, setActiveChat, sendMessage } = useChatStore();
  const { user, setActiveContext, addContext } = useAuthStore();
  const [showInfo, setShowInfo] = useState(false);
  const [createWsOpen, setCreateWsOpen] = useState(false);
  const [joinWsOpen, setJoinWsOpen] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsHandle, setNewWsHandle] = useState('');

  const isDemo = user?.primaryUsername === 'soumya' || user?.email === 'soumya@zyntra.com';
  const allWorkspaces = storeWorkspaces?.length > 0 ? storeWorkspaces : (isDemo ? demoWorkspaces : []);

  // Sync workspace from URL param
  useEffect(() => {
    if (wsId && allWorkspaces.length > 0) {
      const found = allWorkspaces.find((w) => w.id === wsId);
      if (found) {
        if (found.id !== activeWorkspace?.id) {
          setActiveWorkspace(found);
        }
        const wsCtx = user?.contexts?.find((c) => c.name === found.name) || {
          id: `ctx-${wsId}`,
          type: 'workplace',
          name: found.name || 'Workspace',
          username: found.contextualUsername || `${user?.primaryUsername || 'user'}.${found.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`
        };
        setActiveContext(wsCtx);
      }
    }
  }, [wsId, allWorkspaces, activeWorkspace?.id]);

  // Set document title & support ?info=1 and ?channel=xxx
  useEffect(() => {
    document.title = `Zyntra — ${activeWorkspace?.name || 'Workspaces'}`;
    const params = new URLSearchParams(window.location.search);
    if (params.get('info') === '1') {
      setShowInfo(true);
    }
    const channelParam = params.get('channel');
    if (channelParam && nodes[channelParam]) {
      setActiveNode(channelParam);
    }
  }, [activeWorkspace, nodes, setActiveNode]);

  // Whenever activeNodeId changes, sync with chat store
  useEffect(() => {
    if (activeNodeId) {
      setActiveChat(activeNodeId);
    }
  }, [activeNodeId, setActiveChat]);

  const handleCreateWsSubmit = (e) => {
    e.preventDefault();
    if (!newWsName.trim()) return;

    const newWs = createWorkspace({
      name: newWsName.trim(),
      contextualUsername: newWsHandle.trim()
    });

    if (newWs) {
      const wsCtx = {
        id: `ctx-${newWs.id}`,
        type: 'workplace',
        name: newWs.name,
        username: newWs.contextualUsername
      };
      addContext(wsCtx);
      setActiveContext(wsCtx);
      setNewWsName('');
      setNewWsHandle('');
      setCreateWsOpen(false);
      navigate(`/workspace/${newWs.id}`);
    }
  };

  const handleJoinWsSubmit = async (code) => {
    const res = await joinGroupByCode(code);
    if (res && res.success) {
      setJoinWsOpen(false);
      if (res.workspace?.id) {
        navigate(`/workspace/${res.workspace.id}`);
      }
    }
    return res;
  };

  const currentNode = activeNodeId ? nodes[activeNodeId] : null;
  const policy = activeWorkspace ? (workspacePolicies[activeWorkspace.id] || activeWorkspace.policy || {}) : {};
  const breadcrumbPath = activeNodeId ? getNodePath(activeNodeId) : [];

  return (
    <AppLayout sidebar={<Sidebar mode="workspace" />}>
      {allWorkspaces.length === 0 ? (
        /* Fresh User Onboarding Empty State for Workspaces */
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#f8fafc] text-center select-none h-full">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 flex items-center justify-center text-white mb-5">
            <Building2 size={30} />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3 border border-blue-200/60">
            <Sparkles size={12} />
            Contextual Workplaces
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-2 tracking-tight">
            Welcome to Zyntra Workspaces
          </h2>
          <p className="text-xs text-slate-500 max-w-md leading-relaxed mb-6">
            You haven't joined or created any organizations yet. Workspaces enable companies, universities, and teams to collaborate within structured channels while preserving strict privacy and policy controls.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCreateWsOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-all cursor-pointer"
            >
              <Plus size={15} />
              + Create Workplace
            </button>
            <button
              type="button"
              onClick={() => setJoinWsOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <KeyRound size={15} />
              # Join with Code
            </button>
          </div>
          <div className="mt-8 inline-flex items-center gap-2 text-[11px] text-slate-400">
            <Shield size={14} className="text-blue-500" />
            Independent Contextual Identities & Role Governance
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full w-full overflow-hidden">
          {/* Top Breadcrumb Navigation Bar */}
          <TopBar
            breadcrumbPath={breadcrumbPath}
            onNavigateBreadcrumb={(nodeId) => setActiveNode(nodeId)}
            title={currentNode?.name || activeWorkspace?.name}
          />

          {/* Workspace Body: Chat Area + Optional Slide-out Info Drawer */}
          <div className="flex flex-1 min-h-0 relative overflow-hidden">
            {/* Main Chat Canvas */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
              <ChatArea
                chatId={activeNodeId}
                chatName={currentNode?.name || 'Channel'}
                chatAvatar={currentNode?.avatar || null}
                memberCount={currentNode?.memberCount}
                policy={policy}
                messages={messages[activeNodeId] || []}
                currentUserId={user?.id || user?._id || 'user-1'}
                onSend={(text, attachment) => sendMessage(activeNodeId, text, attachment)}
                onInfoClick={() => setShowInfo(!showInfo)}
              />
            </div>

            {/* Group Details Drawer */}
            {showInfo && currentNode && (
              <div className="w-[390px] shrink-0 h-full z-20 transition-all duration-250 animate-in slide-in-from-right">
                <GroupInfoPanel
                  node={currentNode}
                  onClose={() => setShowInfo(false)}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals for Create & Join */}
      <JoinGroupModal
        isOpen={joinWsOpen}
        onClose={() => setJoinWsOpen(false)}
        onSubmit={handleJoinWsSubmit}
      />

      <Modal
        isOpen={createWsOpen}
        onClose={() => setCreateWsOpen(false)}
        title="Create New Workplace"
        size="md"
      >
        <form onSubmit={handleCreateWsSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Workplace Name
            </label>
            <input
              placeholder="e.g. Stanford University or Acme Tech"
              value={newWsName}
              onChange={(e) => {
                const val = e.target.value;
                setNewWsName(val);
                const slug = val.toLowerCase().replace(/[^a-z0-9]/g, '');
                setNewWsHandle(slug ? `${user?.primaryUsername || 'user'}.${slug}` : '');
              }}
              autoFocus
              className="w-full px-3 py-2.5 bg-white border border-blue-500 rounded-lg text-xs text-slate-900 outline-none shadow-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Contextual Username in this Organization
            </label>
            <div className="flex items-center bg-white border border-slate-300 rounded-lg px-3 py-2">
              <span className="text-xs text-slate-400 font-bold mr-1">@</span>
              <input
                placeholder={`${user?.primaryUsername || 'user'}.org`}
                value={newWsHandle}
                onChange={(e) => setNewWsHandle(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-xs font-mono text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Members of this workplace see this identity while your permanent account remains @{user?.primaryUsername || 'user'}.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateWsOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newWsName.trim()}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/25"
            >
              Create & Launch
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
};

export default WorkspacePage;

