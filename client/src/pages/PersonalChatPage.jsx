import React, { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import Sidebar from '../components/layout/Sidebar';
import ChatArea from '../components/chat/ChatArea';
import useChatStore from '../store/useChatStore';
import useAuthStore from '../store/useAuthStore';
import { UserPlus, Users, MessageSquarePlus, ShieldCheck, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import AddContactModal from '../components/contacts/AddContactModal';
import CreateGroupModal from '../components/workspace/CreateGroupModal';

const PersonalChatPage = () => {
  const { activeChat, setActiveChat, messages, sendMessage, contacts = [], groups = [], addGroup } = useChatStore();
  const user = useAuthStore((s) => s.user);
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);

  useEffect(() => {
    document.title = 'Zyntra — Personal Space';
    if (!activeChat && contacts.length > 0) {
      setActiveChat(contacts[0].id);
    }
  }, [activeChat, contacts, setActiveChat]);

  const personalPolicy = {
    emoji: true,
    reactions: true,
    editMessage: true,
    deleteMessage: true,
    title: 'Personal Direct Communication'
  };

  const getChatName = () => {
    if (!activeChat) return '';
    const contact = contacts.find((c) => c.id === activeChat);
    if (contact) return contact.name;
    const group = groups.find((g) => g.id === activeChat);
    return group?.name || 'Chat';
  };

  const getChatAvatar = () => {
    if (!activeChat) return null;
    const contact = contacts.find((c) => c.id === activeChat);
    if (contact) return contact.avatar || null;
    const group = groups.find((g) => g.id === activeChat);
    return group?.avatar || null;
  };

  const getChatStatus = () => {
    if (!activeChat) return null;
    const contact = contacts.find((c) => c.id === activeChat);
    return contact?.status || 'online';
  };

  const getMemberCount = () => {
    const group = groups.find((g) => g.id === activeChat);
    return group?.membersCount;
  };

  const hasConversations = contacts.length > 0 || groups.length > 0;

  return (
    <AppLayout sidebar={<Sidebar mode="personal" />}>
      {hasConversations && activeChat ? (
        <ChatArea
          chatId={activeChat}
          chatName={getChatName()}
          chatAvatar={getChatAvatar()}
          chatStatus={getChatStatus()}
          memberCount={getMemberCount()}
          policy={personalPolicy}
          messages={messages[activeChat] || []}
          currentUserId={user?.id || user?._id || 'user-1'}
          onSend={(text, attachment) => sendMessage(activeChat, text, attachment)}
        />
      ) : (
        /* Fresh User Onboarding Empty State */
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#f8fafc] text-center select-none h-full">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/20 flex items-center justify-center text-white mb-5">
            <MessageSquarePlus size={30} />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3 border border-blue-200/60">
            <Sparkles size={12} />
            Welcome to Personal Space
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-2 tracking-tight">
            Welcome, {user?.name || 'Friend'}!
          </h2>
          <p className="text-xs text-slate-500 max-w-md leading-relaxed mb-6">
            Your personal communication hub is ready. You haven't added any contacts or joined any groups yet. Search for registered friends by their <span className="font-mono font-semibold text-blue-600">@username</span> or add your first contact below.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAddContactOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-all cursor-pointer"
            >
              <UserPlus size={15} />
              + Add First Contact
            </button>
            <button
              type="button"
              onClick={() => setCreateGroupOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Users size={15} />
              + Create Group
            </button>
          </div>
          <div className="mt-8 inline-flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck size={14} className="text-emerald-500" />
            End-to-End Encrypted Private Messages
          </div>
        </div>
      )}

      {/* Embedded Modals */}
      <AddContactModal
        isOpen={addContactOpen}
        onClose={() => setAddContactOpen(false)}
      />
      <CreateGroupModal
        isOpen={createGroupOpen}
        onClose={() => setCreateGroupOpen(false)}
        parentNodeName="Personal Space"
        onSubmit={async (data) => {
          try {
            const res = await api.contacts.createGroup({
              name: data.name,
              description: data.description,
            });
            if (res?.ok && res?.data?.data) {
              addGroup(res.data.data);
              setCreateGroupOpen(false);
              return;
            }
          } catch (err) {
            console.warn('[PersonalChatPage] createGroup backend fallback:', err);
          }
          const newGrp = {
            id: `group-${Date.now()}`,
            name: data.name,
            description: data.description,
            membersCount: 1,
            lastMessage: 'Group created',
            lastMessageTime: new Date().toISOString()
          };
          addGroup(newGrp);
          setCreateGroupOpen(false);
        }}
      />
    </AppLayout>
  );
};

export default PersonalChatPage;

