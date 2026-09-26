import { create } from 'zustand';
import { currentUser } from '../data/mockData';
import { ARTIFICIAL_AVATAR_PRESETS } from '../utils/artificialAvatars';
import { api } from '../services/api';
import { emitAvatarUpdate } from '../services/socket';

const getInitialUser = () => {
  // Allow URL parameter override for instant preview testing
  if (typeof window !== 'undefined' && window.location.search) {
    const params = new URLSearchParams(window.location.search);
    const avatarParam = params.get('ai_avatar');
    if (avatarParam) {
      const preset = ARTIFICIAL_AVATAR_PRESETS.find((p) => p.id === avatarParam) || ARTIFICIAL_AVATAR_PRESETS[0];
      return { ...currentUser, avatar: preset.url, avatarType: 'ai' };
    }
  }

  try {
    const saved = localStorage.getItem('zyntra-auth-user');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed;
    }
  } catch {}
  return currentUser;
};

const persistUser = (user) => {
  try {
    if (user) {
      localStorage.setItem('zyntra-auth-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('zyntra-auth-user');
    }
  } catch {}
};

const syncStoresForUser = async (user) => {
  try {
    const { default: useWorkspaceStore } = await import('./useWorkspaceStore');
    const { default: useChatStore } = await import('./useChatStore');
    useWorkspaceStore.getState().initForUser(user);
    useChatStore.getState().initForUser(user);
  } catch (e) {
    console.warn('[Zyntra Auth] syncStoresForUser error:', e);
  }
};

const useAuthStore = create((set, get) => ({
  user: getInitialUser(),
  isAuthenticated: Boolean(localStorage.getItem('zyntra_auth_token') || localStorage.getItem('zyntra-auth-user')),
  activeContext: getInitialUser()?.contexts?.[0] || currentUser.contexts[0],

  login: async (email, password) => {
    try {
      const res = await api.auth.login(email, password);
      if (res.ok && res.data?.user) {
        const backendUser = {
          ...res.data.user,
          contexts: res.data.user.contexts?.length ? res.data.user.contexts : [
            {
              id: 'ctx-personal',
              type: 'personal',
              name: 'Personal',
              username: `${res.data.user.primaryUsername || 'user'}.personal`,
            }
          ],
        };
        persistUser(backendUser);
        set({
          isAuthenticated: true,
          user: backendUser,
          activeContext: backendUser.contexts?.[0],
        });
        syncStoresForUser(backendUser);
        return { success: true, user: backendUser };
      } else if (!res.ok && !res.isOffline) {
        // Explicit backend rejection (e.g. 401 Invalid Credentials, 400 Bad Request)
        return {
          success: false,
          error: res.data?.message || res.data?.error || 'Invalid email or password',
        };
      }
    } catch (e) {
      console.warn('Backend login fallback active:', e);
    }

    // Offline / Mock mode fallback only when server is unreachable
    const user = {
      ...get().user,
      email: email || get().user?.email,
    };
    persistUser(user);
    set({
      isAuthenticated: true,
      user,
      activeContext: user.contexts?.[0] || currentUser.contexts[0],
    });
    syncStoresForUser(user);
    return { success: true, user };
  },

  checkAuth: async () => {
    const token = localStorage.getItem('zyntra_auth_token');
    if (!token) return;
    try {
      const res = await api.auth.getMe();
      if (res.ok && res.data?.user) {
        const backendUser = {
          ...res.data.user,
          contexts: res.data.user.contexts?.length ? res.data.user.contexts : [
            {
              id: 'ctx-personal',
              type: 'personal',
              name: 'Personal',
              username: `${res.data.user.primaryUsername || 'user'}.personal`,
            }
          ],
        };
        persistUser(backendUser);
        set({
          isAuthenticated: true,
          user: backendUser,
          activeContext: backendUser.contexts?.[0],
        });
        syncStoresForUser(backendUser);
      } else if (res.status === 401) {
        // Expired or invalid token
        get().logout();
      }
    } catch (e) {
      console.warn('[Zyntra Auth] checkAuth fallback:', e);
    }
  },

  logout: () => {
    api.auth.logout();
    try {
      localStorage.removeItem('zyntra-auth-user');
    } catch {}
    set({ isAuthenticated: false, activeContext: null, user: null });
    syncStoresForUser(null);
  },

  setActiveContext: (context) => {
    set({ activeContext: context });
  },

  updateAvatar: (avatar, avatarType = 'ai') => {
    try {
      api.auth?.updateProfile?.({ avatar, avatarType })?.catch?.(() => {});
    } catch {}
    set((state) => {
      const updated = {
        ...state.user,
        avatar,
        avatarType,
      };
      persistUser(updated);
      if (updated.primaryUsername) {
        emitAvatarUpdate(updated.primaryUsername, avatar);
      }
      return { user: updated };
    });
  },

  updateProfile: ({ name, bio }) => {
    try {
      api.auth?.updateProfile?.({ name, bio })?.catch?.(() => {});
    } catch {}
    set((state) => {
      const updated = {
        ...state.user,
        name: name !== undefined ? name : state.user?.name,
        bio: bio !== undefined ? bio : state.user?.bio,
      };
      persistUser(updated);
      return { user: updated };
    });
  },

  addContext: (context) => {
    try {
      api.auth?.addContext?.(context)?.catch?.(() => {});
    } catch {}
    set((state) => {
      const updated = {
        ...state.user,
        contexts: [...(state.user?.contexts || []).filter((c) => c.id !== context.id), context],
      };
      persistUser(updated);
      return { user: updated };
    });
  },

  register: async (userData) => {
    try {
      const res = await api.auth.register(userData);
      if (res.ok && res.data?.user) {
        const backendUser = {
          ...res.data.user,
          contexts: res.data.user.contexts?.length ? res.data.user.contexts : [
            {
              id: 'ctx-personal',
              type: 'personal',
              name: 'Personal',
              username: `${res.data.user.primaryUsername || 'user'}.personal`,
            }
          ],
        };
        persistUser(backendUser);
        set({
          isAuthenticated: true,
          user: backendUser,
          activeContext: backendUser.contexts?.[0],
        });
        syncStoresForUser(backendUser);
        return { success: true, user: backendUser };
      } else if (!res.ok && !res.isOffline) {
        // Explicit backend rejection (e.g. 400 Email exists, 400 Username taken)
        return {
          success: false,
          error: res.data?.message || res.data?.error || 'Registration failed',
        };
      }
    } catch (e) {
      console.warn('Backend register fallback active:', e);
    }

    // Offline / Mock mode fallback only when server is unreachable
    const cleanUsername = userData.primaryUsername?.replace(/^@/, '') || 'user';
    const updated = {
      id: `user-${Date.now()}`,
      name: userData.name || 'New User',
      email: userData.email || `${cleanUsername}@zyntra.com`,
      primaryUsername: cleanUsername,
      avatar: null,
      avatarType: 'ai',
      bio: 'Building contextual communication',
      contexts: [
        {
          id: 'ctx-personal',
          type: 'personal',
          name: 'Personal',
          username: `${cleanUsername}.personal`,
        }
      ],
    };
    persistUser(updated);
    set({
      isAuthenticated: true,
      user: updated,
      activeContext: updated.contexts[0],
    });
    syncStoresForUser(updated);
    return { success: true, user: updated };
  },
}));

export default useAuthStore;
