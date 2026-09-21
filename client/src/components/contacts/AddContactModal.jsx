import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { UserPlus, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import useChatStore from '../../store/useChatStore';
import useAuthStore from '../../store/useAuthStore';

const AddContactModal = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanUsername = username.trim().replace(/^@/, '');
    if (!cleanUsername) return;

    let contactObj = null;
    try {
      const res = await api.contacts.create({
        name: cleanUsername,
        username: cleanUsername,
      });
      if (res?.ok && res?.data?.data) {
        contactObj = res.data.data;
      }
    } catch (err) {
      console.warn('[AddContactModal] backend contact persist fallback:', err);
    }

    if (!contactObj) {
      const currentUser = useAuthStore.getState().user;
      const cleanSelf = (currentUser?.primaryUsername || '').replace(/^@/, '').toLowerCase();
      const cleanTarget = cleanUsername.toLowerCase();
      const fallbackId = cleanSelf && cleanTarget
        ? `dm_${[cleanSelf, cleanTarget].sort().join('_')}`
        : `contact-${Date.now()}`;

      contactObj = {
        id: fallbackId,
        name: cleanUsername,
        username: cleanUsername,
        bio: '',
        avatar: null,
        status: 'online',
        lastMessage: 'Connected on Zyntra',
        lastMessageTime: new Date().toISOString(),
      };
    }

    useChatStore.getState().addContact(contactObj);
    useChatStore.getState().setActiveChat(contactObj.id);

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setUsername('');
      onClose();
    }, 900);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Contact" size="sm">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
          Enter a user's verified primary username to add them to your Direct Messages.
        </p>

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
            Zyntra Primary Username
          </label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              overflow: 'hidden',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.15)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span
              style={{
                paddingLeft: '14px',
                paddingRight: '4px',
                fontSize: '14px',
                color: '#94a3b8',
                fontFamily: 'monospace',
                fontWeight: 700,
                userSelect: 'none'
              }}
            >
              @
            </span>
            <input
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/@/g, ''))}
              style={{
                flex: 1,
                padding: '11px 14px 11px 0',
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '13.5px',
                color: '#0f172a'
              }}
              autoFocus
            />
          </div>
        </div>

        {success && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#065f46'
            }}
          >
            Contact request sent to @{username}!
          </div>
        )}

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
            disabled={!username.trim()}
            style={{
              padding: '9px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: username.trim() ? '#1d63ff' : '#94a3b8',
              color: '#ffffff',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: username.trim() ? 'pointer' : 'not-allowed',
              boxShadow: username.trim() ? '0 2px 6px rgba(29, 99, 255, 0.25)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Add Contact
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddContactModal;
