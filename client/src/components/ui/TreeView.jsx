import React from 'react';
import { ChevronRight, Users, Folder, FolderOpen, MessageSquare } from 'lucide-react';

const TreeNode = ({
  node,
  level = 0,
  expandedNodes = [],
  selectedNodeId,
  onToggle,
  onSelect,
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.includes(node.id);
  const isSelected = selectedNodeId === node.id;

  return (
    <div style={{ position: 'relative', fontSize: '12px', userSelect: 'none' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => {
            onSelect(node.id);
            if (hasChildren) {
              onToggle(node.id);
            }
          }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            paddingTop: '6px',
            paddingBottom: '6px',
            paddingRight: '10px',
            paddingLeft: `${10 + level * 14}px`,
            borderRadius: '9px',
            border: isSelected
              ? '1px solid rgba(147, 197, 253, 0.35)'
              : '1px solid transparent',
            background: isSelected
              ? 'linear-gradient(90deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)'
              : 'transparent',
            boxShadow: isSelected
              ? '0 2px 8px rgba(37, 99, 235, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              : 'none',
            color: isSelected
              ? '#ffffff'
              : hasChildren
              ? '#f1f5f9'
              : '#cbd5e1',
            fontWeight: isSelected || hasChildren ? 600 : 400,
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'background 0.15s ease, color 0.15s ease'
          }}
          className="group hover:bg-white/[0.06]"
        >
          {/* Column 1: Expand/Collapse Chevron (for folders) OR Empty spacer for leaf channels */}
          {hasChildren ? (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onToggle(node.id);
              }}
              style={{
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                marginRight: '4px',
                flexShrink: 0,
                cursor: 'pointer'
              }}
              className="hover:bg-white/10"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              <ChevronRight
                size={13}
                style={{
                  color: isSelected ? '#ffffff' : isExpanded ? '#93c5fd' : '#94a3b8',
                  transform: isExpanded ? 'rotate(90deg)' : 'none',
                  transition: 'transform 0.15s ease'
                }}
              />
            </span>
          ) : (
            /* Spacer matching 18px chevron + 4px margin so all icons align in the exact same column */
            <span style={{ width: '22px', flexShrink: 0 }} />
          )}

          {/* Column 2: Node Icon */}
          <span
            style={{
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '8px',
              flexShrink: 0
            }}
          >
            {hasChildren ? (
              isExpanded ? (
                <FolderOpen
                  size={15}
                  style={{
                    color: isSelected ? '#fed7aa' : '#fbbf24',
                    fill: isSelected ? 'rgba(254, 215, 170, 0.3)' : 'rgba(251, 191, 36, 0.25)'
                  }}
                />
              ) : (
                <Folder
                  size={15}
                  style={{
                    color: isSelected ? '#fed7aa' : '#f59e0b',
                    fill: isSelected ? 'rgba(254, 215, 170, 0.25)' : 'rgba(245, 158, 11, 0.2)'
                  }}
                />
              )
            ) : (
              <MessageSquare
                size={13.5}
                style={{
                  color: isSelected ? '#ffffff' : '#60a5fa',
                  fill: isSelected ? 'rgba(255, 255, 255, 0.22)' : 'rgba(96, 165, 250, 0.15)'
                }}
              />
            )}
          </span>

          {/* Column 3: Node Name */}
          <span
            style={{
              flex: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              letterSpacing: '-0.01em',
              fontSize: '12px'
            }}
            title={node.name}
          >
            {node.name}
          </span>

          {/* Column 4: Member Count Pill */}
          {node.memberCount != null && (
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'monospace',
                padding: '1px 6px',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                flexShrink: 0,
                marginLeft: '6px',
                backgroundColor: isSelected
                  ? 'rgba(255, 255, 255, 0.22)'
                  : '#0a1329',
                color: isSelected ? '#ffffff' : '#64748b',
                border: isSelected
                  ? '1px solid rgba(255, 255, 255, 0.25)'
                  : '1px solid #16244b'
              }}
            >
              <Users size={9} style={{ opacity: 0.7, flexShrink: 0 }} />
              <span>{node.memberCount}</span>
            </span>
          )}
        </button>
      </div>

      {/* Children Container with Vertical Guide Line */}
      {hasChildren && isExpanded && (
        <div style={{ position: 'relative', marginTop: '2px' }}>
          {/* Subtle vertical hierarchy line aligned with parent chevron */}
          <div
            style={{
              position: 'absolute',
              top: '2px',
              bottom: '4px',
              left: `${18 + level * 14}px`,
              width: '1px',
              backgroundColor: 'rgba(51, 65, 85, 0.6)'
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {node.children.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                level={level + 1}
                expandedNodes={expandedNodes}
                selectedNodeId={selectedNodeId}
                onToggle={onToggle}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const TreeView = ({
  nodes = [],
  expandedNodes = [],
  selectedNodeId,
  onToggle,
  onSelect,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '2px 4px' }}>
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          expandedNodes={expandedNodes}
          selectedNodeId={selectedNodeId}
          onToggle={onToggle}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

export default TreeView;
