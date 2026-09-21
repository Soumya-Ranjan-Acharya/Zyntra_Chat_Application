import Workspace from '../models/Workspace.js';
import WorkspaceNode from '../models/WorkspaceNode.js';

// Helper to get all descendant node IDs recursively
const getAllDescendantIds = async (parentId) => {
  const descendants = [];
  const queue = [parentId];

  while (queue.length > 0) {
    const currId = queue.shift();
    const currNode = await WorkspaceNode.findOne({ id: currId });
    if (currNode && currNode.children?.length) {
      for (const childId of currNode.children) {
        descendants.push(childId);
        queue.push(childId);
      }
    }
  }

  return descendants;
};

// @desc    Get all workspaces
// @route   GET /api/workspaces
// @access  Public / Optional Auth
export const getWorkspaces = async (req, res, next) => {
  try {
    let query = {};
    if (req.user) {
      const isDemoOwner = req.user.primaryUsername === 'soumya' || req.user.email === 'soumya@zyntra.com';
      if (!isDemoOwner) {
        // Fresh user: only show workspaces they own or joined
        query = {
          $or: [
            { owner: req.user._id },
            { 'members.user': req.user._id },
          ],
        };
      }
    }
    const workspaces = await Workspace.find(query).sort({ createdAt: 1 });
    res.status(200).json({
      success: true,
      count: workspaces.length,
      data: workspaces,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all workspace nodes as a key-value dictionary (matching client store)
// @route   GET /api/workspaces/nodes
// @access  Public
export const getAllNodes = async (req, res, next) => {
  try {
    const nodes = await WorkspaceNode.find();
    // Transform to dictionary map { [nodeId]: node }
    const nodeMap = {};
    nodes.forEach((n) => {
      nodeMap[n.id] = {
        id: n.id,
        workspaceId: n.workspaceId,
        name: n.name,
        parentId: n.parentId,
        children: n.children,
        memberCount: n.memberCount,
        hasConversation: n.hasConversation,
        joinCode: n.joinCode,
        description: n.description,
        members: n.members || [],
      };
    });

    res.status(200).json({
      success: true,
      data: nodeMap,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tree nodes for specific workspace
// @route   GET /api/workspaces/:id/tree
// @access  Public
export const getWorkspaceTree = async (req, res, next) => {
  try {
    const { id } = req.params;
    const nodes = await WorkspaceNode.find({ workspaceId: id });
    const nodeMap = {};
    nodes.forEach((n) => {
      nodeMap[n.id] = {
        id: n.id,
        workspaceId: n.workspaceId,
        name: n.name,
        parentId: n.parentId,
        children: n.children,
        memberCount: n.memberCount,
        hasConversation: n.hasConversation,
        joinCode: n.joinCode,
        description: n.description,
        members: n.members || [],
      };
    });

    res.status(200).json({
      success: true,
      data: nodeMap,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new workspace
// @route   POST /api/workspaces
// @access  Private / Public
export const createWorkspace = async (req, res, next) => {
  try {
    const { name, contextualUsername, description } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Workspace name is required',
      });
    }

    const trimmedName = name.trim();
    const wsId = `ws-${Date.now()}`;
    const rootNodeId = `root-${wsId}`;
    const defaultChannelId = `chan-general-${wsId}`;
    const shortCode = trimmedName.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X') || 'WS';
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const rootJoinCode = `ZYN-${shortCode}-${randomSuffix}`;
    const generalJoinCode = `ZYN-${shortCode}-${randomSuffix + 1}`;

    const creatorMember = {
      id: req.user?._id?.toString() || 'user-1',
      name: req.user?.name || 'Creator',
      username: req.user?.primaryUsername || 'creator',
      avatar: req.user?.avatar || null,
      role: 'owner',
      joinedAt: new Date(),
    };

    // 1. Create Root Node
    const rootNode = await WorkspaceNode.create({
      id: rootNodeId,
      workspaceId: wsId,
      name: trimmedName,
      parentId: null,
      children: [defaultChannelId],
      memberCount: 1,
      hasConversation: true,
      joinCode: rootJoinCode,
      description: description?.trim() || `${trimmedName} headquarters & primary workspace`,
      createdBy: req.user?._id || null,
      members: [creatorMember],
    });

    // 2. Create General Channel Node
    const generalNode = await WorkspaceNode.create({
      id: defaultChannelId,
      workspaceId: wsId,
      name: 'General',
      parentId: rootNodeId,
      children: [],
      memberCount: 1,
      hasConversation: true,
      joinCode: generalJoinCode,
      description: 'General workspace discussions',
      createdBy: req.user?._id || null,
      members: [creatorMember],
    });

    // 3. Create Workspace
    const newWs = await Workspace.create({
      id: wsId,
      name: trimmedName,
      rootNodeId,
      defaultNodeId: defaultChannelId,
      type: 'organization',
      memberCount: 1,
      owner: req.user?._id || null,
      creatorName: req.user?.name ? `${req.user.name} (You)` : 'You',
      contextualUsername:
        contextualUsername?.trim() ||
        `${req.user?.primaryUsername || 'user'}.${trimmedName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      policy: {
        emoji: true,
        reactions: true,
        editMessage: true,
        deleteMessage: true,
        title: 'Standard Collaboration Policy',
      },
    });

    res.status(201).json({
      success: true,
      data: {
        workspace: newWs,
        rootNode,
        generalNode,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a sub-group / channel under parent node
// @route   POST /api/workspaces/:id/nodes
// @access  Public / Private
export const createGroup = async (req, res, next) => {
  try {
    const { id: workspaceId } = req.params;
    const { parentNodeId, name, description, initialMembers = [] } = req.body;

    if (!name?.trim() || !parentNodeId) {
      return res.status(400).json({
        success: false,
        message: 'Name and parentNodeId are required',
      });
    }

    const parent = await WorkspaceNode.findOne({ id: parentNodeId });
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent node not found',
      });
    }

    const newId = `grp-${Date.now()}`;
    const cleanPrefix = name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X') || 'GRP';
    const joinCode = `ZYN-${cleanPrefix}-${Math.floor(1000 + Math.random() * 9000)}`;

    const creatorMember = {
      id: req.user?._id?.toString() || 'user-1',
      name: req.user?.name || 'Creator',
      username: req.user?.primaryUsername || 'creator',
      avatar: req.user?.avatar || null,
      role: 'owner',
      joinedAt: new Date(),
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
            joinedAt: new Date(),
          });
        }
      });
    }

    const newNode = await WorkspaceNode.create({
      id: newId,
      workspaceId: workspaceId || parent.workspaceId,
      name: name.trim(),
      parentId: parentNodeId,
      children: [],
      memberCount: membersList.length,
      hasConversation: true,
      joinCode,
      description: description?.trim() || `Subgroup created under ${parent.name}`,
      createdBy: req.user?._id || null,
      members: membersList,
    });

    // Update parent's children array
    parent.children = [...(parent.children || []), newId];
    await parent.save();

    res.status(201).json({
      success: true,
      data: newNode,
      parent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add multiple members to a group/node
// @route   POST /api/workspaces/:id/nodes/:nodeId/members
// @access  Public / Private
export const addMembersToNode = async (req, res, next) => {
  try {
    const { nodeId } = req.params;
    const { members } = req.body;

    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Members array is required',
      });
    }

    const node = await WorkspaceNode.findOne({ id: nodeId });
    if (!node) {
      return res.status(404).json({
        success: false,
        message: 'Node not found',
      });
    }

    const currentMembers = node.members || [];
    const addedList = [];

    for (const m of members) {
      const cleanUser = (m.username || '').replace(/^@/, '').toLowerCase();
      const alreadyExists = currentMembers.some(
        (existing) =>
          existing.id === m.id ||
          existing.username?.replace(/^@/, '').toLowerCase() === cleanUser
      );
      if (!alreadyExists && cleanUser) {
        const newMember = {
          id: m.id || `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: m.name || cleanUser,
          username: cleanUser,
          avatar: m.avatar || null,
          role: m.role || 'member',
          joinedAt: new Date(),
        };
        currentMembers.push(newMember);
        addedList.push(newMember);
      }
    }

    node.members = currentMembers;
    node.memberCount = currentMembers.length;
    await node.save();

    res.status(200).json({
      success: true,
      data: {
        node,
        addedMembers: addedList,
        totalMembers: node.memberCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Join group or channel by joinCode
// @route   POST /api/workspaces/join
// @access  Public / Private
export const joinGroupByCode = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid join code',
      });
    }

    const clean = code.trim().toUpperCase();
    const node = await WorkspaceNode.findOne({ joinCode: clean });

    if (!node) {
      return res.status(404).json({
        success: false,
        message: 'Invalid join code. Please check and try again.',
      });
    }

    // Increment member count
    node.memberCount = (node.memberCount || 0) + 1;
    await node.save();

    let workspace = null;
    if (node.workspaceId) {
      workspace = await Workspace.findOne({ id: node.workspaceId });
      if (workspace && req.user) {
        const isMember = (workspace.members || []).some(
          (m) => m.user?.toString() === req.user._id?.toString()
        );
        if (!isMember) {
          workspace.members.push({
            user: req.user._id,
            role: 'member',
            contextualUsername: `${req.user.primaryUsername || 'user'}.${workspace.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
            joinedAt: new Date(),
          });
          workspace.memberCount = (workspace.memberCount || 0) + 1;
          await workspace.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        node,
        workspace,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Leave entire group and all descendants
// @route   POST /api/workspaces/leave-parent-group
// @access  Public / Private
export const leaveParentGroup = async (req, res, next) => {
  try {
    const { groupId } = req.body;

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: 'groupId is required',
      });
    }

    const target = await WorkspaceNode.findOne({ id: groupId });
    if (!target) {
      return res.status(404).json({
        success: false,
        message: 'Target group not found',
      });
    }

    const descendants = await getAllDescendantIds(groupId);
    const allLeftIds = [groupId, ...descendants];

    res.status(200).json({
      success: true,
      groupName: target.name,
      leftIds: allLeftIds,
      leftCount: allLeftIds.length,
      parentId: target.parentId,
    });
  } catch (error) {
    next(error);
  }
};
