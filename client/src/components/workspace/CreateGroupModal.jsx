import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { Folder, Building2, MessageSquare } from 'lucide-react';
import useWorkspaceStore from '../../store/useWorkspaceStore';

const CreateGroupModal = ({ isOpen, onClose, parentNodeName, onSubmit }) => {
  const { activeWorkspace, activeNodeId, nodes } = useWorkspaceStore();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  // Check if activeNodeId represents a valid nested group (not root)
  const isNestedAvailable = Boolean(
    activeNodeId &&
    activeWorkspace &&
    activeNodeId !== activeWorkspace.rootNodeId &&
    nodes[activeNodeId]
  );

  const [targetType, setTargetType] = useState('root');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDesc('');
      setTargetType(isNestedAvailable ? 'subgroup' : 'root');
    }
  }, [isOpen, isNestedAvailable]);

  const isSubgroup = targetType === 'subgroup' && isNestedAvailable;
  const activeNode = isNestedAvailable ? nodes[activeNodeId] : null;

  const modalTitle = isSubgroup ? 'Create New Sub-group' : 'Create New Group';
  const nameLabel = isSubgroup ? 'Sub-group Name' : 'Group Name';
  const placeholderText = isSubgroup
    ? 'e.g. Frontend Core, Cloud Infrastructure, or AI Squad'
    : 'e.g. Engineering, Product Design, or Marketing';
  const buttonText = isSubgroup ? 'Create Sub-group' : 'Create Group';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const chosenParentId = isSubgroup
      ? activeNodeId
      : (activeWorkspace?.rootNodeId || activeNodeId);

    onSubmit({
      name: name.trim(),
      description: desc.trim(),
      parentId: chosenParentId,
    });

    setName('');
    setDesc('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="md">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Destination / Hierarchy Selector if inside a workspace */}
        {activeWorkspace && isNestedAvailable && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>
              Hierarchy Destination
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setTargetType('root')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: targetType === 'root' ? '1.5px solid #3b82f6' : '1px solid #e2e8f0',
                  backgroundColor: targetType === 'root' ? '#eff6ff' : '#f8fafc',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: targetType === 'root' ? '#3b82f6' : '#e2e8f0',
                    color: targetType === 'root' ? '#ffffff' : '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Building2 size={16} />
                </div>
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Top-Level Group
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {activeWorkspace.name}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('subgroup')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: targetType === 'subgroup' ? '1.5px solid #3b82f6' : '1px solid #e2e8f0',
                  backgroundColor: targetType === 'subgroup' ? '#eff6ff' : '#f8fafc',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: targetType === 'subgroup' ? '#3b82f6' : '#e2e8f0',
                    color: targetType === 'subgroup' ? '#ffffff' : '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Folder size={16} />
                </div>
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Nested Sub-group
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {activeNode?.name || 'Current Group'}
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Clean Context Card if Root Only or Personal */}
        {(!activeWorkspace || !isNestedAvailable) && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#dbeafe',
                color: '#1d4ed8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {activeWorkspace ? <Building2 size={16} /> : <MessageSquare size={16} />}
            </div>
            <div style={{ fontSize: '12px' }}>
              <div style={{ color: '#64748b', fontSize: '11px', fontWeight: 500 }}>
                {activeWorkspace ? 'Creating inside Organization' : 'Personal Space'}
              </div>
              <strong style={{ color: '#0f172a', fontWeight: 700 }}>
                {activeWorkspace?.name || parentNodeName || 'Personal Groups'}
              </strong>
            </div>
          </div>
        )}

        {/* Name Field */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 700,
              color: '#1e293b',
              marginBottom: '6px'
            }}
          >
            {nameLabel}
          </label>
          <input
            placeholder={placeholderText}
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '11px 14px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#0f172a',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.15)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#cbd5e1';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Purpose / Description Field */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 700,
              color: '#1e293b',
              marginBottom: '6px'
            }}
          >
            Purpose / Description (Optional)
          </label>
          <textarea
            placeholder={`What will this ${isSubgroup ? 'sub-group' : 'group'} collaborate on?`}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={2}
            style={{
              width: '100%',
              padding: '10px 14px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#0f172a',
              boxSizing: 'border-box',
              outline: 'none',
              resize: 'none',
              fontFamily: 'inherit',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.15)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#cbd5e1';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Action Buttons */}
        <div
          style={{
            paddingTop: '16px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#475569',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            style={{
              padding: '9px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: name.trim() ? '#3b82f6' : '#94a3b8',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#ffffff',
              cursor: name.trim() ? 'pointer' : 'not-allowed',
              boxShadow: name.trim() ? '0 2px 4px rgba(59, 130, 246, 0.3)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            {buttonText}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateGroupModal;
