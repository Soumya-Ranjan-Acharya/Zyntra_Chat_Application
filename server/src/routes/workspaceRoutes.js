import express from 'express';
import {
  getWorkspaces,
  getAllNodes,
  getWorkspaceTree,
  createWorkspace,
  createGroup,
  addMembersToNode,
  joinGroupByCode,
  leaveParentGroup,
} from '../controllers/workspaceController.js';
import { optionalProtect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalProtect, getWorkspaces);
router.get('/nodes', optionalProtect, getAllNodes);
router.get('/:id/tree', optionalProtect, getWorkspaceTree);
router.post('/', optionalProtect, createWorkspace);
router.post('/:id/nodes', optionalProtect, createGroup);
router.post('/:id/nodes/:nodeId/members', optionalProtect, addMembersToNode);
router.post('/nodes/:nodeId/members', optionalProtect, addMembersToNode);
router.post('/join', optionalProtect, joinGroupByCode);
router.post('/leave-parent-group', optionalProtect, leaveParentGroup);

export default router;
