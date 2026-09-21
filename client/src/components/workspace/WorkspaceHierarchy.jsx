import React from 'react';
import { Layers } from 'lucide-react';
import TreeView from '../ui/TreeView';
import useWorkspaceStore from '../../store/useWorkspaceStore';

const WorkspaceHierarchy = ({ filterSearch = '' }) => {
  const { nodes, activeWorkspace, activeNodeId, expandedNodes, leftNodeIds = [], setActiveNode, toggleNode } =
    useWorkspaceStore();

  if (!activeWorkspace || !nodes) return null;

  // Build tree from the current workspace's root node
  const buildTree = (nodeId) => {
    if (leftNodeIds.includes(nodeId)) return null;

    const node = nodes[nodeId];
    if (!node) return null;

    const childObjects = (node.children || [])
      .map((childId) => buildTree(childId))
      .filter(Boolean);

    // If search term is active, filter nodes that match or have matching children
    if (filterSearch.trim()) {
      const q = filterSearch.toLowerCase();
      const matchesSelf = node.name.toLowerCase().includes(q);
      const matchingChildren = childObjects.filter(
        (child) => child.name.toLowerCase().includes(q) || (child.children && child.children.length > 0)
      );

      if (!matchesSelf && matchingChildren.length === 0) {
        return null;
      }

      return {
        ...node,
        children: matchingChildren,
      };
    }

    return {
      ...node,
      children: childObjects,
    };
  };

  const rootTree = buildTree(activeWorkspace.rootNodeId);
  if (!rootTree) {
    return (
      <div className="p-4 text-center text-xs text-slate-500">
        No groups match "{filterSearch}"
      </div>
    );
  }

  // Display top-level children of the root (or root itself)
  const displayNodes = rootTree.children && rootTree.children.length > 0
    ? rootTree.children
    : [rootTree];

  return (
    <div style={{ padding: '4px 0', userSelect: 'none' }}>
      <div
        style={{
          padding: '6px 10px 8px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <span
          style={{
            fontSize: '10.5px',
            fontWeight: 700,
            color: '#64748b',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Layers size={12} style={{ color: '#38bdf8' }} />
          Hierarchy & Channels
        </span>
        <span
          style={{
            fontSize: '9.5px',
            fontFamily: 'monospace',
            color: '#64748b',
            backgroundColor: '#0a1329',
            padding: '1px 6px',
            borderRadius: '4px',
            border: '1px solid #16244b'
          }}
        >
          {displayNodes.length} sections
        </span>
      </div>
      <TreeView
        nodes={displayNodes}
        expandedNodes={expandedNodes}
        selectedNodeId={activeNodeId}
        onToggle={toggleNode}
        onSelect={setActiveNode}
      />
    </div>
  );
};

export default WorkspaceHierarchy;
