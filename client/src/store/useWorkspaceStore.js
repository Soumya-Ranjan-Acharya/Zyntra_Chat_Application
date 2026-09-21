import { create } from 'zustand';
import { workspaces, workspaceNodes } from '../data/mockData';
import { api } from '../services/api';

// Helper to get all ancestor IDs for auto-expanding the active node
const getAncestorIds = (nodes, nodeId) => {
  const ancestors = [];
  let current = nodes[nodeId];
  while (current && current.parentId) {
    ancestors.push(current.parentId);
    current = nodes[current.parentId];
  }
  return ancestors;
};

// Helper to get all descendant IDs recursively
const getAllDescendantIds = (nodes, parentId) => {
  const descendants = [];
  const queue = [...(nodes[parentId]?.children || [])];
  while (queue.length > 0) {
    const currentId = queue.shift();
    descendants.push(currentId);
    if (nodes[currentId]?.children?.length) {
      queue.push(...nodes[currentId].children);
    }
  }
  return descendants;
};

const getInitialWorkspaceState = () => {
  try {
    const saved = localStorage.getItem('zyntra-auth-user');
    if (saved) {
      const u = JSON.parse(saved);
      const isDemo = u.primaryUsername === 'soumya' || u.email === 'soumya@zyntra.com';
      if (isDemo) {
        return {
          workspaces: [...workspaces],
          nodes: { ...workspaceNodes },
          activeWorkspace: workspaces[0],
          activeNodeId: workspaces[0].defaultNodeId,
          expandedNodes: [
            'ws-giet-root',
            'giet-cse',
            'giet-cse-aiml',
            'giet-cse-aiml-proj',
            'giet-proj-zyntra'
          ]
        };
      }
    }
  } catch {}
  return {
    workspaces: [],
    nodes: {},
    activeWorkspace: null,
    activeNodeId: null,
    expandedNodes: []
  };
};

const initialWsData = getInitialWorkspaceState();

const useWorkspaceStore = create((set, get) => ({
  workspaces: initialWsData.workspaces,
  nodes: initialWsData.nodes,
  leftNodeIds: [], // array of node IDs the user has left
  activeWorkspace: initialWsData.activeWorkspace,
  activeNodeId: initialWsData.activeNodeId,
  expandedNodes: initialWsData.expandedNodes,
  isLoadingWorkspaces: false,

  initForUser: (user) => {
    if (!user) {
      set({
        workspaces: [],
        nodes: {},
        activeWorkspace: null,
        activeNodeId: null,
        expandedNodes: []
      });
      return;
    }

    const isDemo = user.primaryUsername === 'soumya' || user.email === 'soumya@zyntra.com';
    if (isDemo) {
      set({
        workspaces: [...workspaces],
        nodes: { ...workspaceNodes },
        activeWorkspace: workspaces[0],
        activeNodeId: workspaces[0].defaultNodeId,
        expandedNodes: [
          'ws-giet-root',
          'giet-cse',
          'giet-cse-aiml',
          'giet-cse-aiml-proj',
          'giet-proj-zyntra'
        ]
      });
    } else {
      // Clean slate for newly registered accounts
      set({
        workspaces: [],
        nodes: {},
        activeWorkspace: null,
        activeNodeId: null,
        expandedNodes: []
      });
      get().loadUserWorkspaces();
    }
  },

  loadUserWorkspaces: async () => {
    set({ isLoadingWorkspaces: true });
    try {
      const [wsRes, nodesRes] = await Promise.all([
        api.workspaces.getAll(),
        api.workspaces.getNodes()
      ]);

      const userWorkspaces = wsRes.ok && Array.isArray(wsRes.data?.data) ? wsRes.data.data : [];
      const userNodes = nodesRes.ok && nodesRes.data?.data ? nodesRes.data.data : {};

      const currentActive = get().activeWorkspace;
      let nextActive = null;
      let nextActiveNodeId = null;

      if (userWorkspaces.length > 0) {
        nextActive = userWorkspaces.find((w) => w.id === currentActive?.id) || userWorkspaces[0];
        nextActiveNodeId = nextActive.defaultNodeId || nextActive.rootNodeId;
      }

      set({
        workspaces: userWorkspaces,
        nodes: userNodes,
        activeWorkspace: nextActive,
        activeNodeId: nextActiveNodeId,
        isLoadingWorkspaces: false
      });
    } catch (err) {
      console.warn('[useWorkspaceStore] loadUserWorkspaces error:', err);
      set({ isLoadingWorkspaces: false });
    }
  },

  setActiveWorkspace: (ws) => {
    if (!ws) {
      set({ activeWorkspace: null, activeNodeId: null });
      return;
    }
    const nodes = get().nodes;
    const defaultNodeId = ws.defaultNodeId || ws.rootNodeId;
    const ancestors = getAncestorIds(nodes, defaultNodeId);
    set({
      activeWorkspace: ws,
      activeNodeId: defaultNodeId,
      expandedNodes: Array.from(new Set([...ancestors, ws.rootNodeId])),
    });
  },

  setActiveNode: (nodeId) => {
    const nodes = get().nodes;
    const ancestors = getAncestorIds(nodes, nodeId);
    set((state) => ({
      activeNodeId: nodeId,
      expandedNodes: Array.from(new Set([...state.expandedNodes, ...ancestors])),
    }));
  },

  toggleNode: (nodeId) => {
    set((state) => {
      const isExpanded = state.expandedNodes.includes(nodeId);
      const newExpanded = isExpanded
        ? state.expandedNodes.filter((id) => id !== nodeId)
        : [...state.expandedNodes, nodeId];
      return { expandedNodes: newExpanded };
    });
  },

  // Create New Workspace - No organization type required
  createWorkspace: ({ name, contextualUsername, description = '' }) => {
    if (!name?.trim()) return null;

    let currentUser = null;
    try {
      const saved = localStorage.getItem('zyntra-auth-user');
      if (saved) currentUser = JSON.parse(saved);
    } catch {}

    const trimmedName = name.trim();
    const wsId = `ws-${Date.now()}`;
    const rootNodeId = `root-${wsId}`;
    const defaultChannelId = `chan-general-${wsId}`;
    const shortCode = trimmedName.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X') || 'WS';
    const rootJoinCode = `ZYN-${shortCode}-0001`;
    const generalJoinCode = `ZYN-${shortCode}-${Math.floor(1000 + Math.random() * 9000)}`;

    const creatorMember = {
      id: currentUser?.id || currentUser?._id || 'user-1',
      name: currentUser?.name || 'Creator',
      username: currentUser?.primaryUsername || 'creator',
      avatar: currentUser?.avatar || null,
      role: 'owner',
      joinedAt: 'Just now'
    };

    const rootNode = {
      id: rootNodeId,
      name: trimmedName,
      parentId: null,
      children: [defaultChannelId],
      memberCount: 1,
      hasConversation: true,
      joinCode: rootJoinCode,
      description: description.trim() || `${trimmedName} headquarters & primary workspace`,
      members: [creatorMember]
    };

    const generalNode = {
      id: defaultChannelId,
      name: 'General',
      parentId: rootNodeId,
      children: [],
      memberCount: 1,
      hasConversation: true,
      joinCode: generalJoinCode,
      description: 'General workspace discussions',
      members: [creatorMember]
    };

    const newWs = {
      id: wsId,
      name: trimmedName,
      rootNodeId,
      defaultNodeId: defaultChannelId,
      type: 'organization',
      memberCount: 1,
      isOwner: true,
      role: 'owner',
      creatorName: currentUser?.name ? `${currentUser.name} (You)` : 'You',
      contextualUsername:
        contextualUsername?.trim() ||
        `${currentUser?.primaryUsername || 'user'}.${trimmedName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      joinedAt: 'Just now'
    };

    set((state) => ({
      workspaces: [...state.workspaces, newWs],
      nodes: {
        ...state.nodes,
        [rootNodeId]: rootNode,
        [defaultChannelId]: generalNode,
      },
      activeWorkspace: newWs,
      activeNodeId: defaultChannelId,
      expandedNodes: [rootNodeId]
    }));

    api.workspaces.create({
      name: trimmedName,
      contextualUsername: newWs.contextualUsername,
      description
    }).catch(() => {});

    return newWs;
  },

  // Create Sub-group under active node or parent
  createGroup: (parentNodeId, name, description = '', initialMembers = []) => {
    if (!name?.trim() || !parentNodeId) return;

    let currentUser = null;
    try {
      const saved = localStorage.getItem('zyntra-auth-user');
      if (saved) currentUser = JSON.parse(saved);
    } catch {}

    const creatorMember = {
      id: currentUser?.id || currentUser?._id || 'user-1',
      name: currentUser?.name || 'Creator',
      username: currentUser?.primaryUsername || 'creator',
      avatar: currentUser?.avatar || null,
      role: 'owner',
      joinedAt: 'Just now'
    };

    const membersList = [creatorMember];
    if (Array.isArray(initialMembers)) {
      initialMembers.forEach((m) => {
        const cleanUser = (m.username || '').replace(/^@/, '').toLowerCase();
        if (cleanUser && cleanUser !== creatorMember.username.toLowerCase()) {
          membersList.push({
            id: m.id || `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            name: m.name || cleanUser,
            username: cleanUser,
            avatar: m.avatar || null,
            role: m.role || 'member',
            joinedAt: 'Just now'
          });
        }
      });
    }

    const newId = `grp-${Date.now()}`;
    const cleanCode = `ZYN-${name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X')}-${Math.floor(1000 + Math.random() * 9000)}`;

    set((state) => {
      const parent = state.nodes[parentNodeId];
      if (!parent) return state;

      const newNode = {
        id: newId,
        name: name.trim(),
        parentId: parentNodeId,
        children: [],
        memberCount: membersList.length,
        hasConversation: true,
        joinCode: cleanCode,
        description: description.trim() || `Subgroup created under ${parent.name}`,
        members: membersList
      };

      const updatedParent = {
        ...parent,
        children: [...(parent.children || []), newId],
      };

      return {
        nodes: {
          ...state.nodes,
          [parentNodeId]: updatedParent,
          [newId]: newNode,
        },
        activeNodeId: newId,
        expandedNodes: Array.from(new Set([...state.expandedNodes, parentNodeId])),
      };
    });

    const activeWs = get().activeWorkspace;
    api.workspaces.createGroup(activeWs?.id || 'ws-giet', {
      parentNodeId,
      name: name.trim(),
      description,
      initialMembers: membersList.slice(1)
    }).catch(() => {});

    return newId;
  },

  // Add multiple members to group/node
  addMembersToNode: (nodeId, selectedMembers) => {
    if (!nodeId || !Array.isArray(selectedMembers) || selectedMembers.length === 0) return;

    let currentUser = null;
    try {
      const saved = localStorage.getItem('zyntra-auth-user');
      if (saved) currentUser = JSON.parse(saved);
    } catch {}

    set((state) => {
      const node = state.nodes[nodeId];
      if (!node) return state;

      const existingMembers = Array.isArray(node.members) && node.members.length > 0
        ? [...node.members]
        : [
            {
              id: state.activeWorkspace?.owner || currentUser?.id || 'creator',
              name: currentUser?.name || 'Creator',
              username: currentUser?.primaryUsername || 'creator',
              avatar: currentUser?.avatar || null,
              role: 'owner',
              joinedAt: 'Just now'
            }
          ];

      const added = [];
      selectedMembers.forEach((m) => {
        const cleanUser = (m.username || '').replace(/^@/, '').toLowerCase();
        const alreadyExists = existingMembers.some(
          (ex) =>
            ex.id === m.id ||
            ex.username?.replace(/^@/, '').toLowerCase() === cleanUser
        );
        if (!alreadyExists && cleanUser) {
          const newMem = {
            id: m.id || `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            name: m.name || cleanUser,
            username: cleanUser,
            avatar: m.avatar || null,
            role: m.role || 'member',
            joinedAt: 'Just now'
          };
          existingMembers.push(newMem);
          added.push(newMem);
        }
      });

      const updatedNode = {
        ...node,
        members: existingMembers,
        memberCount: existingMembers.length,
      };

      return {
        nodes: {
          ...state.nodes,
          [nodeId]: updatedNode,
        },
      };
    });

    const activeWs = get().activeWorkspace;
    api.workspaces.addMembers(activeWs?.id || 'ws-giet', nodeId, selectedMembers).catch(() => {});

    try {
      const addedNames = selectedMembers.map((m) => m.name || m.username).join(', ');
      const announcementText = `👋 ${currentUser?.name || 'Admin'} added ${addedNames} to the channel.`;
      import('./useChatStore.js').then(({ default: useChatStore }) => {
        useChatStore.getState().sendMessage(nodeId, announcementText);
      });
    } catch {}
  },

  // Leave Sub-group Only (leaves this specific leaf or subgroup while keeping parent membership intact)
  leaveSubgroup: (subgroupId) => {
    const { nodes, activeWorkspace, activeNodeId, leftNodeIds } = get();
    const target = nodes[subgroupId];
    if (!target) return { success: false, error: 'Subgroup not found' };

    const newLeftList = Array.from(new Set([...leftNodeIds, subgroupId]));
    
    // Determine replacement active node
    let nextActiveNodeId = activeNodeId;
    if (activeNodeId === subgroupId) {
      if (target.parentId && !newLeftList.includes(target.parentId)) {
        nextActiveNodeId = target.parentId;
      } else {
        nextActiveNodeId = activeWorkspace?.rootNodeId || null;
      }
    }

    set({
      leftNodeIds: newLeftList,
      activeNodeId: nextActiveNodeId
    });

    return {
      success: true,
      subgroupName: target.name,
      parentName: target.parentId ? nodes[target.parentId]?.name : null,
      nextActiveNodeId
    };
  },

  // Leave Entire Group (leaves parent group and all of its nested child subgroups)
  leaveParentGroup: (groupId) => {
    const { nodes, activeWorkspace, activeNodeId, leftNodeIds } = get();
    const target = nodes[groupId];
    if (!target) return { success: false, error: 'Group not found' };

    const descendants = getAllDescendantIds(nodes, groupId);
    const allToLeave = [groupId, ...descendants];
    const newLeftList = Array.from(new Set([...leftNodeIds, ...allToLeave]));

    // Determine replacement active node
    let nextActiveNodeId = activeNodeId;
    if (allToLeave.includes(activeNodeId)) {
      if (target.parentId && !newLeftList.includes(target.parentId)) {
        nextActiveNodeId = target.parentId;
      } else {
        nextActiveNodeId = activeWorkspace?.rootNodeId || null;
      }
    }

    set({
      leftNodeIds: newLeftList,
      activeNodeId: nextActiveNodeId
    });

    api.workspaces.leaveParentGroup(groupId).catch(() => {});

    return {
      success: true,
      groupName: target.name,
      leftCount: allToLeave.length,
      nextActiveNodeId
    };
  },

  // Leave Entire Workspace (only applicable if user is joined member, or warning if owner)
  leaveWorkspace: (workspaceId) => {
    const { workspaces, activeWorkspace } = get();
    const remaining = workspaces.filter((w) => w.id !== workspaceId);
    const nextWs = remaining.length > 0 ? remaining[0] : null;

    set({
      workspaces: remaining,
      activeWorkspace: nextWs,
      activeNodeId: nextWs ? (nextWs.defaultNodeId || nextWs.rootNodeId) : null
    });

    return { success: true, nextWorkspace: nextWs };
  },

  joinGroupByCode: async (code) => {
    const clean = code?.trim().toUpperCase();
    if (!clean) return { success: false, error: 'Please enter a join code' };

    try {
      const res = await api.workspaces.joinByCode(clean);
      if (res.ok && res.data?.data) {
        const payload = res.data.data;
        const node = payload.node || payload;
        const workspace = payload.workspace || null;

        const currentNodes = get().nodes;
        const mergedNodes = { ...currentNodes, [node.id]: node };

        const currentWsList = get().workspaces;
        let mergedWsList = currentWsList;
        if (workspace && !currentWsList.some((w) => w.id === workspace.id)) {
          mergedWsList = [...currentWsList, workspace];
        }

        set((state) => ({
          nodes: mergedNodes,
          workspaces: mergedWsList,
          activeWorkspace: workspace || state.activeWorkspace || mergedWsList[0] || null,
          leftNodeIds: state.leftNodeIds.filter((id) => id !== node.id),
          activeNodeId: node.id,
          expandedNodes: Array.from(new Set([...state.expandedNodes, ...getAncestorIds(mergedNodes, node.id)])),
        }));
        return { success: true, node, workspace };
      }
    } catch (e) {
      console.warn('Backend join fallback active:', e);
    }

    // Fallback to local memory lookup
    const nodes = get().nodes;
    const found = Object.values(nodes).find(
      (n) => n.joinCode?.toUpperCase() === clean
    );
    if (found) {
      set((state) => ({
        leftNodeIds: state.leftNodeIds.filter((id) => id !== found.id),
        activeNodeId: found.id,
        expandedNodes: Array.from(new Set([...state.expandedNodes, ...getAncestorIds(nodes, found.id)]))
      }));
      return { success: true, node: found };
    }
    return { success: false, error: 'Invalid join code. Please check and try again.' };
  },

  getNodePath: (nodeId) => {
    const nodes = get().nodes;
    if (!nodeId || !nodes[nodeId]) return [];
    const path = [];
    let current = nodes[nodeId];
    while (current) {
      path.unshift(current);
      current = current.parentId ? nodes[current.parentId] : null;
    }
    return path;
  },

  getNodeChildren: (nodeId) => {
    const { nodes, leftNodeIds } = get();
    if (!nodeId || !nodes[nodeId]) return [];
    return (nodes[nodeId].children || [])
      .map((childId) => nodes[childId])
      .filter((child) => Boolean(child) && !leftNodeIds.includes(child.id));
  },
}));

export default useWorkspaceStore;
