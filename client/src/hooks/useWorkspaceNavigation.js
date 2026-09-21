import { useMemo } from 'react';
import useWorkspaceStore from '../store/useWorkspaceStore';

/**
 * Hook to help navigate the workspace hierarchy.
 * Returns the current path, parent info, and child nodes.
 */
export default function useWorkspaceNavigation() {
  const activeNodeId = useWorkspaceStore((s) => s.activeNodeId);
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const getNodePath = useWorkspaceStore((s) => s.getNodePath);
  const getNodeChildren = useWorkspaceStore((s) => s.getNodeChildren);
  const setActiveNode = useWorkspaceStore((s) => s.setActiveNode);
  const toggleNode = useWorkspaceStore((s) => s.toggleNode);

  const path = useMemo(() => {
    if (!activeNodeId) return [];
    return getNodePath(activeNodeId);
  }, [activeNodeId, getNodePath]);

  const children = useMemo(() => {
    if (!activeNodeId) return [];
    return getNodeChildren(activeNodeId);
  }, [activeNodeId, getNodeChildren]);

  const breadcrumbItems = useMemo(() => {
    return path.map((node) => ({
      label: node.name,
      onClick: () => setActiveNode(node.id),
    }));
  }, [path, setActiveNode]);

  return {
    activeNodeId,
    activeWorkspace,
    path,
    children,
    breadcrumbItems,
    setActiveNode,
    toggleNode,
  };
}
