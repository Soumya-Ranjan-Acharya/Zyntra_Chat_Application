import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Sidebar from '../components/layout/Sidebar';
import ChatArea from '../components/chat/ChatArea';
import useChatStore from '../store/useChatStore';
import useAuthStore from '../store/useAuthStore';
import { UserPlus, Users, MessageSquarePlus, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import AddContactModal from '../components/contacts/AddContactModal';
import CreateGroupModal from '../components/workspace/CreateGroupModal';

const PersonalChatPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { activeChat, setActiveChat, messages, sendMessage, contacts = [], groups = [], addGroup, isLoadingContacts } = useChatStore();
  const user = useAuthStore((s) => s.user);
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);

  // Sync activeChat with URL param, or fallback to first contact on desktop
  useEffect(() => {
    document.title = 'Zyntra — Personal Space';
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;

    if (chatId) {
      if (chatId !== activeChat) {
        setActiveChat(chatId);
      }
    } else {
      // On mobile at /personal, show the chat list
      if (!isDesktop) {
        if (activeChat) setActiveChat(null);
      } else if (contacts.length > 0 || groups.length > 0) {
        // On desktop, auto-select activeChat or first contact for dual-pane view
        const target = (activeChat && (contacts.some((c) => c.id === activeChat) || groups.some((g) => g.id === activeChat)))
          ? activeChat
          : (contacts[0]?.id || groups[0]?.id);
        
        if (target) {
          setActiveChat(target);
          navigate(`/personal/${target}`, { replace: true });
        }
      }
    }
  }, [chatId, activeChat, contacts, groups, setActiveChat, navigate]);

  const personalPolicy = {
    emoji: true,
    reactions: true,
    editMessage: true,
    deleteMessage: true,
    title: 'Direct Messages'
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

  const hasConversations = isLoadingContacts || contacts.length > 0 || groups.length > 0;
  const isChatSelected = Boolean(chatId && activeChat);

  return (
    <AppLayout
      sidebar={<Sidebar mode="personal" />}
      isMobileChatOpen={isChatSelected}
    >
      {hasConversations ? (
        <ChatArea
          chatId={activeChat}
          chatName={getChatName()}
          chatAvatar={getChatAvatar()}
          chatStatus={getChatStatus()}
          memberCount={getMemberCount()}
          policy={personalPolicy}
          messages={activeChat ? (messages[activeChat] || []) : []}
          currentUserId={user?.id || user?._id || 'user-1'}
          onSend={(text, attachment) => activeChat && sendMessage(activeChat, text, attachment)}
          onBackClick={() => {
            setActiveChat(null);
            navigate('/personal');
          }}
        />
      ) : (
        /* Fresh User Onboarding Empty State */
        <div 
          className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none h-full"
          style={{ backgroundColor: 'var(--color-bg-primary)' }}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/20 flex items-center justify-center text-white mb-5">
            <MessageSquarePlus size={30} />
          </div>
          <div 
            style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3"
          >
            <Sparkles size={12} />
            Welcome to Personal Space
          </div>
          <h2 
            style={{ color: 'var(--color-text-primary)' }}
            className="text-xl font-extrabold mb-2 tracking-tight"
          >
            Welcome, {user?.name || 'Friend'}!
          </h2>
          <p 
            style={{ color: 'var(--color-text-secondary)' }}
            className="text-xs max-w-md leading-relaxed mb-6"
          >
            Your personal communication hub is ready. You haven't added any contacts or joined any groups yet. Search for registered friends by their <span className="font-mono font-semibold" style={{ color: 'var(--color-accent)' }}>@username</span> or add your first contact below.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAddContactOpen(true)}
              style={{ backgroundColor: 'var(--color-accent)', color: '#fff', boxShadow: '0 4px 14px rgba(var(--color-accent-rgb), 0.3)' }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl hover:opacity-90 text-xs font-bold transition-all cursor-pointer"
            >
              <UserPlus size={15} />
              + Add First Contact
            </button>
            <button
              type="button"
              onClick={() => setCreateGroupOpen(true)}
              style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-primary)' }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl hover:opacity-80 text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Users size={15} />
              + Create Group
            </button>
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
