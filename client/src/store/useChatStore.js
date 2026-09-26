import { create } from 'zustand';
import { mockMessagesByChat, personalContacts, personalGroups } from '../data/mockData';
import { api } from '../services/api';
import useAuthStore from './useAuthStore';
import { messageService } from '../services/messageService';
import { socketService } from '../services/socketService';
import { encryptionService } from '../services/encryptionService';

// Initialize socket listeners once
let socketInitialized = false;
const initChatSocketListeners = (set, get) => {
  if (socketInitialized) return;
  socketInitialized = true;

  // Ensure socket connection
  socketService.initSocket();

  // 1. Receive incoming encrypted message from peers
  socketService.onReceiveMessage(async (incomingMsg) => {
    if (!incomingMsg?.chatId) return;
    const chatId = incomingMsg.chatId;

    const currentUser = useAuthStore.getState().user;
    const participantInfo = {
      currentUsername: currentUser?.primaryUsername,
      currentUserId: currentUser?.id || currentUser?._id,
      peerUsername: incomingMsg.senderUsername,
    };

    // Decrypt incoming ciphertext message via MessageService
    const decryptedMsg = await messageService.decryptIncomingMessage(
      incomingMsg,
      participantInfo
    );

    const currentList = get().messages[chatId] || [];

    // Prevent duplicate messages and double writes (Rule 4)
    if (
      currentList.some(
        (m) =>
          m.id === decryptedMsg.id ||
          (decryptedMsg.clientTempId && m.clientTempId === decryptedMsg.clientTempId) ||
          (m.senderId === decryptedMsg.senderId &&
            m.content === decryptedMsg.content &&
            Math.abs(new Date(m.timestamp) - new Date(decryptedMsg.timestamp)) < 3000)
      )
    ) {
      return;
    }

    set((state) => {
      let updatedContacts = state.contacts.map((c) => {
        if (
          c.id === chatId ||
          (c.username &&
            decryptedMsg.senderUsername &&
            c.username.replace(/^@/, '').toLowerCase() ===
              decryptedMsg.senderUsername.replace(/^@/, '').toLowerCase())
        ) {
          return {
            ...c,
            id: chatId,
            avatar: decryptedMsg.senderAvatar || c.avatar,
            lastMessage: decryptedMsg.content || 'Photo',
            lastMessageTime: decryptedMsg.timestamp || new Date().toISOString(),
          };
        }
        return c;
      });

      const hasContact = updatedContacts.some(
        (c) =>
          c.id === chatId ||
          (c.username &&
            decryptedMsg.senderUsername &&
            c.username.replace(/^@/, '').toLowerCase() ===
              decryptedMsg.senderUsername.replace(/^@/, '').toLowerCase())
      );

      if (!hasContact && decryptedMsg.senderUsername) {
        const newContact = {
          id: chatId,
          name: decryptedMsg.senderName || decryptedMsg.senderUsername,
          username: decryptedMsg.senderUsername,
          avatar: decryptedMsg.senderAvatar || null,
          status: 'online',
          lastMessage: decryptedMsg.content || 'Photo',
          lastMessageTime: decryptedMsg.timestamp || new Date().toISOString(),
        };
        updatedContacts = [newContact, ...updatedContacts];
      }

      return {
        messages: {
          ...state.messages,
          [chatId]: [...(state.messages[chatId] || []), decryptedMsg],
        },
        contacts: updatedContacts,
      };
    });
  });

  // 2. Incoming message edit
  socketService.onMessageEdited(async (editedMsg) => {
    if (!editedMsg?.chatId) return;
    const chatId = editedMsg.chatId;

    const currentUser = useAuthStore.getState().user;
    const decrypted = await messageService.decryptIncomingMessage(editedMsg, {
      currentUsername: currentUser?.primaryUsername,
      currentUserId: currentUser?.id || currentUser?._id,
      peerUsername: editedMsg.senderUsername,
    });

    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: (state.messages[chatId] || []).map((m) =>
          m.id === decrypted.id ? { ...m, ...decrypted, isEdited: true } : m
        ),
      },
    }));
  });

  // 3. Incoming message deletion
  socketService.onMessageDeleted(({ messageId, chatId }) => {
    if (!chatId) return;
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: (state.messages[chatId] || []).filter((m) => m.id !== messageId),
      },
    }));
  });

  // 4. Reactions update
  socketService.onUpdateReaction((updatedMsg) => {
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

  // 5. Typing indicator
  socketService.onUserTyping(({ userId, userName, isTyping }) => {
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [userId]: isTyping ? userName : null,
      },
    }));
  });

  // 6. Avatar updates
  socketService.onAvatarUpdated(({ username, avatar }) => {
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
  // Wire socket listeners once client loads
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
      // Leave all old socket rooms on user switch (Rule 17)
      messageService.leaveAllRooms();

      if (!user) {
        set({
          activeChat: null,
          contacts: [],
          groups: [],
          messages: {},
        });
        return;
      }

      // Initialize crypto device identity keys for current user
      encryptionService.initialize(user).catch((e) => {
        console.warn('[E2EE] Init user keys warning:', e);
      });

      // Update socket auth token
      const token = localStorage.getItem('zyntra_auth_token');
      socketService.updateAuthToken(token);

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
        // Fresh state for registered accounts
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
            if (c.id) messageService.joinRoom(c.id);
          });
          fetchedGroups.forEach((g) => {
            if (g.id) messageService.joinRoom(g.id);
          });

          const currentUser = useAuthStore.getState().user;
          const isDemo =
            currentUser?.primaryUsername === 'soumya' || currentUser?.email === 'soumya@zyntra.com';

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
        messageService.joinRoom(contact.id);
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
            id: contact.id || updated[existingIndex].id,
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
      if (group.id) {
        messageService.joinRoom(group.id);
      }
      set((state) => {
        const exists = state.groups.some((g) => g.id === group.id);
        if (exists) return { activeChat: group.id };
        return {
          groups: [group, ...state.groups],
          activeChat: group.id,
        };
      });
    },

    // Set active chat: leaves old room, joins new room, fetches decrypted history
    setActiveChat: (chatId) => {
      const prevChat = get().activeChat;
      // Context switching must not leak old socket rooms (Rule 17)
      if (prevChat && prevChat !== chatId) {
        messageService.leaveRoom(prevChat);
      }

      set({ activeChat: chatId });

      if (chatId) {
        messageService.joinRoom(chatId);

        const currentUser = useAuthStore.getState().user;
        const contact = get().contacts.find((c) => c.id === chatId);
        const participantInfo = {
          currentUsername: currentUser?.primaryUsername,
          currentUserId: currentUser?.id || currentUser?._id,
          peerUsername: contact?.username,
        };

        // Fetch history via REST GET and decrypt locally (History flow)
        messageService
          .fetchHistory(chatId, participantInfo)
          .then((decryptedHistory) => {
            if (Array.isArray(decryptedHistory) && decryptedHistory.length > 0) {
              set((state) => {
                const existing = state.messages[chatId] || [];
                const merged = [...existing];

                decryptedHistory.forEach((backendMsg) => {
                  const existingIdx = merged.findIndex(
                    (m) =>
                      m.id === backendMsg.id ||
                      (backendMsg.clientTempId && m.clientTempId === backendMsg.clientTempId)
                  );
                  if (existingIdx !== -1) {
                    merged[existingIdx] = {
                      ...merged[existingIdx],
                      ...backendMsg,
                      status: 'sent',
                      isOptimistic: false,
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
          })
          .catch((err) => {
            console.warn('[useChatStore] History load warning:', err);
          });
      }
    },

    // Send Message: Optimistic UI + E2EE through MessageService + Server ACK (Rule 1 & 3 & 4)
    sendMessage: async (chatId, content, attachment = null) => {
      if (!chatId || (!content?.trim() && !attachment)) return;

      const user = useAuthStore.getState().user;
      const clientTempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const finalContent = content ? content.trim() : '';
      const previewText =
        finalContent || (attachment?.type === 'image' ? '📷 Photo' : `📎 ${attachment?.name || 'Attachment'}`);

      // Determine chat type and peer username for key derivation
      const isDirect = chatId.startsWith('dm_') || get().contacts.some((c) => c.id === chatId);
      const isGroup = chatId.startsWith('group-') || get().groups.some((g) => g.id === chatId);
      const chatType = isDirect ? 'direct' : isGroup ? 'personal-group' : 'workspace-node';

      let peerUsername = null;
      if (isDirect) {
        const contact = get().contacts.find((c) => c.id === chatId);
        peerUsername = contact?.username;
      }

      const participantInfo = {
        currentUsername: user?.primaryUsername,
        currentUserId: user?.id || user?._id,
        peerUsername,
      };

      // 1. Optimistic message placed in local chat store (instant feedback!) (Rule 3)
      const optimisticMessage = {
        id: clientTempId,
        clientTempId,
        chatId,
        senderId: user?.id || user?._id || 'user-1',
        senderName: user?.name || 'You',
        senderUsername: user?.primaryUsername || 'user',
        senderAvatar: user?.avatar || null,
        content: finalContent,
        timestamp: new Date().toISOString(),
        type: attachment?.type || 'text',
        attachment: attachment || null,
        reactions: [],
        status: 'sending',
        isOptimistic: true,
      };

      set((state) => {
        const updatedContacts = state.contacts.map((c) => {
          if (c.id === chatId) {
            return {
              ...c,
              lastMessage: previewText,
              lastMessageTime: optimisticMessage.timestamp,
            };
          }
          return c;
        });

        return {
          messages: {
            ...state.messages,
            [chatId]: [...(state.messages[chatId] || []), optimisticMessage],
          },
          contacts: updatedContacts,
        };
      });

      // 2. Delegate to MessageService: local encryption -> Socket.IO -> authenticate -> authorize -> persist -> ACK
      try {
        const result = await messageService.sendMessage({
          clientTempId,
          chatId,
          content: finalContent,
          attachment,
          chatType,
          participantInfo,
        });

        // 3. Server ACK received: reconcile optimistic message with server message ID
        if (result && result.message) {
          set((state) => {
            const list = state.messages[chatId] || [];
            const updated = list.map((m) =>
              m.clientTempId === clientTempId || m.id === clientTempId
                ? {
                    ...m,
                    id: result.message.id,
                    clientTempId: undefined,
                    status: 'sent',
                    isOptimistic: false,
                    timestamp: result.message.timestamp || m.timestamp,
                  }
                : m
            );

            return {
              messages: {
                ...state.messages,
                [chatId]: updated,
              },
            };
          });
        }
      } catch (err) {
        console.error('[useChatStore] Send message error:', err.message);
        // Mark optimistic message as failed
        set((state) => {
          const list = state.messages[chatId] || [];
          return {
            messages: {
              ...state.messages,
              [chatId]: list.map((m) =>
                m.clientTempId === clientTempId ? { ...m, status: 'failed' } : m
              ),
            },
          };
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

      messageService.deleteMessage(chatId, messageId).catch((err) => {
        console.warn('[useChatStore] Delete message error:', err);
      });
    },

    editMessage: async (chatId, messageId, newContent) => {
      const isDirect = chatId.startsWith('dm_') || get().contacts.some((c) => c.id === chatId);
      const isGroup = chatId.startsWith('group-') || get().groups.some((g) => g.id === chatId);
      const chatType = isDirect ? 'direct' : isGroup ? 'personal-group' : 'workspace-node';

      const user = useAuthStore.getState().user;
      const participantInfo = {
        currentUsername: user?.primaryUsername,
        currentUserId: user?.id || user?._id,
      };

      set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: (state.messages[chatId] || []).map((m) =>
            m.id === messageId ? { ...m, content: newContent, isEdited: true } : m
          ),
        },
      }));

      try {
        await messageService.editMessage(chatId, messageId, newContent, chatType, participantInfo);
      } catch (err) {
        console.warn('[useChatStore] Edit message error:', err);
      }
    },

    addReaction: (chatId, messageId, emoji) => {
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

      messageService.sendReaction(chatId, messageId, emoji);
    },
  };
});

export default useChatStore;
