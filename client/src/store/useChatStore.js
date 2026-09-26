import { create } from 'zustand';
import { mockMessagesByChat, personalContacts, personalGroups } from '../data/mockData';
import { api } from '../services/api';
import useAuthStore from './useAuthStore';
import {
  joinChatRoom,
  leaveChatRoom,
  emitSocketMessage,
  emitReaction,
  getSocket,
} from '../services/socket';

// Initialize socket listeners once
let socketInitialized = false;
const initChatSocketListeners = (set, get) => {
  if (socketInitialized) return;
  const socket = getSocket();
  if (!socket) return;
  socketInitialized = true;

  socket.on('receive_message', (incomingMsg) => {
    if (!incomingMsg?.chatId) return;
    const chatId = incomingMsg.chatId;
    const currentList = get().messages[chatId] || [];

    // Avoid duplicate if already added optimistically or exists with same content
    if (
      currentList.some(
        (m) =>
          m.id === incomingMsg.id ||
          (m.senderId === incomingMsg.senderId &&
            m.content === incomingMsg.content &&
            Math.abs(new Date(m.timestamp) - new Date(incomingMsg.timestamp)) < 5000)
      )
    ) {
      return;
    }

    set((state) => {
      let updatedContacts = state.contacts.map((c) => {
        if (
          c.id === chatId ||
          (c.username &&
            incomingMsg.senderUsername &&
            c.username.replace(/^@/, '').toLowerCase() ===
              incomingMsg.senderUsername.replace(/^@/, '').toLowerCase())
        ) {
          return {
            ...c,
            id: chatId,
            avatar: incomingMsg.senderAvatar || c.avatar,
            lastMessage: incomingMsg.content,
            lastMessageTime: incomingMsg.timestamp || new Date().toISOString(),
          };
        }
        return c;
      });

      const hasContact = updatedContacts.some(
        (c) =>
          c.id === chatId ||
          (c.username &&
            incomingMsg.senderUsername &&
            c.username.replace(/^@/, '').toLowerCase() ===
              incomingMsg.senderUsername.replace(/^@/, '').toLowerCase())
      );

      if (!hasContact && incomingMsg.senderUsername) {
        const newContact = {
          id: chatId,
          name: incomingMsg.senderName || incomingMsg.senderUsername,
          username: incomingMsg.senderUsername,
          avatar: incomingMsg.senderAvatar || null,
          status: 'online',
          lastMessage: incomingMsg.content,
          lastMessageTime: incomingMsg.timestamp || new Date().toISOString(),
        };
        updatedContacts = [newContact, ...updatedContacts];
      }

      return {
        messages: {
          ...state.messages,
          [chatId]: [...(state.messages[chatId] || []), incomingMsg],
        },
        contacts: updatedContacts,
      };
    });
  });

  socket.on('update_reaction', (updatedMsg) => {
    if (!updatedMsg?.chatId) return;
    const chatId = updatedMsg.chatId;
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: (state.messages[chatId] || []).map((m) =>
          m.id === updatedMsg.id ? { ...m, reactions: updatedMsg.reactions } : m
        ),
      },
    }));
  });

  socket.on('user_typing', ({ userId, userName, isTyping }) => {
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [userId]: isTyping ? userName : null,
      },
    }));
  });

  socket.on('user_avatar_updated', ({ username, avatar }) => {
    if (!username) return;
    const cleanUser = username.replace(/^@/, '').toLowerCase();
    set((state) => {
      const updatedContacts = state.contacts.map((c) => {
        if (c.username?.replace(/^@/, '').toLowerCase() === cleanUser) {
          return { ...c, avatar };
        }
        return c;
      });

      const updatedMessages = { ...state.messages };
      for (const chatId in updatedMessages) {
        if (Array.isArray(updatedMessages[chatId])) {
          updatedMessages[chatId] = updatedMessages[chatId].map((m) => {
            if (m.senderUsername?.replace(/^@/, '').toLowerCase() === cleanUser) {
              return { ...m, senderAvatar: avatar };
            }
            return m;
          });
        }
      }

      return {
        contacts: updatedContacts,
        messages: updatedMessages,
      };
    });
  });
};

const getInitialUserState = () => {
  try {
    const saved = localStorage.getItem('zyntra-auth-user');
    if (saved) {
      const u = JSON.parse(saved);
      const isDemo = u.primaryUsername === 'soumya' || u.email === 'soumya@zyntra.com';
      if (isDemo) {
        return {
          contacts: [...personalContacts],
          groups: [...personalGroups],
          messages: { ...mockMessagesByChat },
        };
      }
    }
  } catch {}
  return {
    contacts: [],
    groups: [],
    messages: {},
  };
};

const initialChatData = getInitialUserState();

const useChatStore = create((set, get) => {
  // Ensure socket listeners are wired
  if (typeof window !== 'undefined') {
    setTimeout(() => initChatSocketListeners(set, get), 100);
  }

  return {
    activeChat: null,
    contacts: initialChatData.contacts,
    groups: initialChatData.groups,
    messages: initialChatData.messages,
    typingUsers: {},
    isLoadingContacts: false,

    initForUser: (user) => {
      if (!user) {
        set({
          activeChat: null,
          contacts: [],
          groups: [],
          messages: {},
        });
        return;
      }

      const isDemo = user.primaryUsername === 'soumya' || user.email === 'soumya@zyntra.com';
      if (isDemo) {
        set({
          contacts: [...personalContacts],
          groups: [...personalGroups],
          messages: { ...mockMessagesByChat },
          activeChat: personalContacts[0]?.id || null,
        });
        get().loadContactsAndGroups();
      } else {
        // Fresh state for newly registered accounts
        set({
          contacts: [],
          groups: [],
          messages: {},
          activeChat: null,
        });
        get().loadContactsAndGroups();
      }
    },

    loadContactsAndGroups: async () => {
      set({ isLoadingContacts: true });
      try {
        const res = await api.contacts.getAll();
        if (res.ok && res.data) {
          const fetchedContacts = res.data.contacts || [];
          const fetchedGroups = res.data.groups || [];

          fetchedContacts.forEach((c) => {
            if (c.id) joinChatRoom(c.id);
          });
          fetchedGroups.forEach((g) => {
            if (g.id) joinChatRoom(g.id);
          });

          const currentUser = useAuthStore.getState().user;
          const isDemo = currentUser?.primaryUsername === 'soumya' || currentUser?.email === 'soumya@zyntra.com';

          if (isDemo) {
            set((state) => {
              const contactsMap = new Map();
              state.contacts.forEach((c) => contactsMap.set(c.id, c));

              fetchedContacts.forEach((fc) => {
                const cleanFcUser = fc.username?.replace(/^@/, '').toLowerCase();
                let matchedKey = null;
                for (const [key, val] of contactsMap.entries()) {
                  if (val.username?.replace(/^@/, '').toLowerCase() === cleanFcUser) {
                    matchedKey = key;
                    break;
                  }
                }
                if (matchedKey) {
                  contactsMap.delete(matchedKey);
                }
                contactsMap.set(fc.id, fc);
              });

              return {
                contacts: Array.from(contactsMap.values()),
                groups: fetchedGroups.length > 0 ? fetchedGroups : state.groups,
                isLoadingContacts: false,
              };
            });
          } else {
            set({
              contacts: fetchedContacts,
              groups: fetchedGroups,
              isLoadingContacts: false,
            });
          }
        } else {
          set({ isLoadingContacts: false });
        }
      } catch (err) {
        console.warn('[useChatStore] loadContactsAndGroups error:', err);
        set({ isLoadingContacts: false });
      }
    },

    addContact: (contact) => {
      if (!contact) return;
      if (contact.id) {
        joinChatRoom(contact.id);
      }
      set((state) => {
        const cleanTarget = contact.username?.replace(/^@/, '').toLowerCase();
        const existingIndex = state.contacts.findIndex(
          (c) =>
            c.id === contact.id ||
            (cleanTarget && c.username?.replace(/^@/, '').toLowerCase() === cleanTarget)
        );

        if (existingIndex !== -1) {
          const updated = [...state.contacts];
          updated[existingIndex] = {
            ...updated[existingIndex],
            ...contact,
            id: contact.id || updated[existingIndex].id
          };
          return {
            contacts: updated,
            activeChat: contact.id || updated[existingIndex].id,
          };
        }
        return {
          contacts: [contact, ...state.contacts],
          activeChat: contact.id,
        };
      });
    },

    addGroup: (group) => {
      if (!group) return;
      set((state) => {
        const exists = state.groups.some((g) => g.id === group.id);
        if (exists) return { activeChat: group.id };
        return {
          groups: [group, ...state.groups],
          activeChat: group.id,
        };
      });
    },

    setActiveChat: (chatId) => {
      const prevChat = get().activeChat;
      if (prevChat && prevChat !== chatId) {
        leaveChatRoom(prevChat);
      }

      set({ activeChat: chatId });

      if (chatId) {
        joinChatRoom(chatId);

        // Fetch latest messages from MongoDB Atlas backend in background
        api.messages.getByChat(chatId).then((res) => {
          if (res.ok && Array.isArray(res.data?.data) && res.data.data.length > 0) {
            set((state) => {
              const existing = state.messages[chatId] || [];
              const merged = [...existing];
              res.data.data.forEach((backendMsg) => {
                const existingIdx = merged.findIndex(
                  (m) =>
                    m.id === backendMsg.id ||
                    (m.senderId === backendMsg.senderId &&
                      m.content === backendMsg.content &&
                      Math.abs(new Date(m.timestamp) - new Date(backendMsg.timestamp)) < 5000)
                );
                if (existingIdx !== -1) {
                  merged[existingIdx] = {
                    ...merged[existingIdx],
                    ...backendMsg,
                    senderAvatar: backendMsg.senderAvatar || merged[existingIdx].senderAvatar
                  };
                } else {
                  merged.push(backendMsg);
                }
              });
              merged.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
              return {
                messages: {
                  ...state.messages,
                  [chatId]: merged,
                },
              };
            });
          }
        }).catch(() => {});
      }
    },

    sendMessage: (chatId, content, attachment = null) => {
      if (!chatId || (!content?.trim() && !attachment)) return;

      const user = useAuthStore.getState().user;
      const senderId = user?.id || user?._id || 'user-1';
      const senderName = user?.name || 'You';
      const senderUsername = user?.primaryUsername || 'user';
      const senderAvatar = user?.avatar || null;
      const finalContent = content ? content.trim() : '';
      const previewText = finalContent || (attachment?.type === 'image' ? '📷 Photo' : `📎 ${attachment?.name || 'Attachment'}`);

      const newMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        chatId,
        senderId,
        senderName,
        senderUsername,
        senderAvatar,
        content: finalContent,
        timestamp: new Date().toISOString(),
        type: attachment?.type || 'text',
        attachment: attachment || null,
        reactions: [],
      };

      // 1. Optimistic UI update (instant feedback!)
      set((state) => {
        const updatedContacts = state.contacts.map((c) => {
          if (c.id === chatId) {
            return {
              ...c,
              lastMessage: previewText,
              lastMessageTime: newMessage.timestamp,
            };
          }
          return c;
        });

        return {
          messages: {
            ...state.messages,
            [chatId]: [...(state.messages[chatId] || []), newMessage],
          },
          contacts: updatedContacts,
        };
      });

      // 2. Realtime broadcast & persistence via Socket (or fallback to REST API if offline)
      const socket = getSocket();
      if (socket && socket.connected) {
        emitSocketMessage(newMessage);
      } else {
        api.messages.send(chatId, newMessage).catch((err) => {
          console.warn('[Zyntra Chat] Offline fallback persist error:', err);
        });
      }
    },

    deleteMessage: (chatId, messageId) => {
      set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: (state.messages[chatId] || []).filter((m) => m.id !== messageId),
        },
      }));

      api.messages.delete(messageId).catch(() => {});
    },

    editMessage: (chatId, messageId, newContent) => {
      set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: (state.messages[chatId] || []).map((m) =>
            m.id === messageId ? { ...m, content: newContent, isEdited: true } : m
          ),
        },
      }));

      api.messages.edit(messageId, newContent).catch(() => {});
    },

    addReaction: (chatId, messageId, emoji) => {
      const user = useAuthStore.getState().user;
      const uid = user?.id || user?._id || 'user-1';

      set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: (state.messages[chatId] || []).map((m) => {
            if (m.id !== messageId) return m;
            const reactions = m.reactions || [];
            const existing = reactions.find((r) => r.emoji === emoji);
            if (existing) {
              return {
                ...m,
                reactions: reactions.map((r) =>
                  r.emoji === emoji ? { ...r, count: r.count + 1 } : r
                ),
              };
            }
            return {
              ...m,
              reactions: [...reactions, { emoji, count: 1, userReacted: true }],
            };
          }),
        },
      }));

      emitReaction(messageId, emoji, uid, chatId);
      api.messages.addReaction(messageId, emoji, uid).catch(() => {});
    },
  };
});

export default useChatStore;

