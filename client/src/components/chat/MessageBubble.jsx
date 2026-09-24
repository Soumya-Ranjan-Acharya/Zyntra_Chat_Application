import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reply, SmilePlus, Pencil, Trash2, CheckCheck, FileText, Image as ImageIcon, Download } from 'lucide-react';
import Avatar from '../ui/Avatar';
import useChatStore from '../../store/useChatStore';
import useThemeStore from '../../store/useThemeStore';
import useAuthStore from '../../store/useAuthStore';
import { getFileUrl } from '../../services/api';
import ImageViewerModal from './ImageViewerModal';

const QUICK_REACTIONS = ['👍', '❤️', '🔥', '🎉', '🚀', '😂'];

const MessageBubble = ({
  message,
  isOwn,
  policy = {},
  chatId,
  onReply,
  isFirstInGroup = true,
  isLastInGroup = true,
}) => {
  const [hovered, setHovered] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  const { deleteMessage, editMessage, addReaction } = useChatStore();
  const sentBubbleColor = useThemeStore((s) => s.sentBubbleColor) || 'var(--color-accent)';
  const sentBubbleTextColor = useThemeStore((s) => s.sentBubbleTextColor) || '#ffffff';
  const receivedBubbleColor = useThemeStore((s) => s.receivedBubbleColor) || 'var(--color-bg-tertiary)';
  const receivedBubbleTextColor = useThemeStore((s) => s.receivedBubbleTextColor) || 'var(--color-text-primary)';

  const { id, senderName, content, timestamp, reactions = [], isEdited } = message;
  const user = useAuthStore((s) => s.user);
  const contacts = useChatStore((s) => s.contacts) || [];

  const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const senderContact = contacts.find(
    (c) =>
      (message.senderUsername &&
        c.username?.replace(/^@/, '').toLowerCase() ===
          message.senderUsername.replace(/^@/, '').toLowerCase()) ||
      c.id === message.senderId
  );

  const displayAvatar = isOwn
    ? (user?.avatar || message.senderAvatar || null)
    : (message.senderAvatar || senderContact?.avatar || null);

  const handleSaveEdit = () => {
    if (editContent.trim()) {
      editMessage(chatId, id, editContent.trim());
      setIsEditing(false);
    }
  };

  const handleAddReaction = (emoji) => {
    addReaction(chatId, id, emoji);
    setShowReactionPicker(false);
  };

  // Bubble radius with tail morphology (iMessage-style)
  const R = 16; // base radius
  const tailR = 4; // tail corner
  const borderRadius = isOwn
    ? `${R}px ${isFirstInGroup ? R : 4}px ${isLastInGroup ? tailR : R}px ${R}px`
    : `${isFirstInGroup ? R : 4}px ${R}px ${R}px ${isLastInGroup ? tailR : R}px`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
      style={{
        display: 'flex',
        flexDirection: isOwn ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: '8px',
        width: '100%',
        position: 'relative',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowReactionPicker(false); }}
    >
      {/* Avatar — only for first in group */}
      {!isOwn && (
        <div style={{ flexShrink: 0, width: '32px', marginBottom: '2px', visibility: isLastInGroup ? 'visible' : 'hidden' }}>
          <Avatar name={senderName} src={displayAvatar} size="sm" />
        </div>
      )}

      {/* Bubble + Actions */}
      <div
        style={{
          maxWidth: '62%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isOwn ? 'flex-end' : 'flex-start',
          position: 'relative',
          gap: '3px',
        }}
      >
        {/* Sender label (first in group, not own) */}
        <AnimatePresence>
          {!isOwn && isFirstInGroup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-accent)',
                paddingLeft: '4px',
                marginBottom: '1px',
                userSelect: 'none',
              }}
            >
              {senderName}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Action Menu */}
        <AnimatePresence>
          {hovered && !isEditing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 4 }}
              transition={{ duration: 0.12, ease: [0.23, 1, 0.32, 1] }}
              style={{
                position: 'absolute',
                top: '-40px',
                right: isOwn ? 0 : 'auto',
                left: isOwn ? 'auto' : 0,
                display: 'flex',
                alignItems: 'center',
                gap: '1px',
                backgroundColor: 'var(--color-bg-primary)',
                border: '1px solid var(--color-border-primary)',
                boxShadow: 'var(--elevation-3)',
                borderRadius: '12px',
                padding: '4px 6px',
                zIndex: 20,
                whiteSpace: 'nowrap',
              }}
            >
              {policy.reactions !== false && (
                <div style={{ position: 'relative' }}>
                  <ActionBtn onClick={() => setShowReactionPicker(!showReactionPicker)} title="React">
                    <SmilePlus size={14} />
                  </ActionBtn>
                  <AnimatePresence>
                    {showReactionPicker && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 4 }}
                        transition={{ duration: 0.12 }}
                        style={{
                          position: 'absolute',
                          bottom: 'calc(100% + 6px)',
                          left: 0,
                          display: 'flex',
                          gap: '3px',
                          backgroundColor: 'var(--color-bg-primary)',
                          border: '1px solid var(--color-border-primary)',
                          boxShadow: 'var(--elevation-3)',
                          borderRadius: '14px',
                          padding: '6px 8px',
                          zIndex: 30,
                        }}
                      >
                        {QUICK_REACTIONS.map((emoji) => (
                          <motion.button
                            key={emoji}
                            whileHover={{ scale: 1.3 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleAddReaction(emoji)}
                            style={{
                              width: '30px', height: '30px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: 'none', background: 'none',
                              fontSize: '17px', cursor: 'pointer',
                              borderRadius: '8px',
                            }}
                          >
                            {emoji}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              <ActionBtn onClick={() => onReply && onReply(message)} title="Reply">
                <Reply size={14} />
              </ActionBtn>
              {isOwn && policy.editMessage !== false && (
                <ActionBtn onClick={() => setIsEditing(true)} title="Edit">
                  <Pencil size={14} />
                </ActionBtn>
              )}
              {isOwn && policy.deleteMessage !== false && (
                <ActionBtn
                  onClick={() => deleteMessage(chatId, id)}
                  title="Delete"
                  danger
                >
                  <Trash2 size={14} />
                </ActionBtn>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Bubble */}
        <div
          style={{
            padding: '9px 14px',
            borderRadius,
            backgroundColor: isOwn ? sentBubbleColor : receivedBubbleColor,
            color: isOwn ? sentBubbleTextColor : receivedBubbleTextColor,
            fontSize: '14px',
            lineHeight: 1.5,
            wordBreak: 'break-word',
            boxShadow: isOwn
              ? '0 2px 12px rgba(0, 0, 0, 0.18)'
              : '0 1px 4px rgba(0, 0, 0, 0.06)',
            border: isOwn ? 'none' : '1px solid var(--color-border-primary)',
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Attachment */}
          {message.attachment && (
            <div style={{ marginBottom: content ? '8px' : '2px' }}>
              {(message.attachment.type === 'image' || message.attachment.mimeType?.startsWith('image/')) ? (
                <div>
                  <div
                    onClick={() => setIsImageViewerOpen(true)}
                    className="relative group overflow-hidden cursor-pointer"
                    style={{
                      maxWidth: '320px',
                      maxHeight: '240px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(0,0,0,0.05)',
                      border: '1px solid rgba(0,0,0,0.08)',
                    }}
                  >
                    <img
                      src={getFileUrl(message.attachment.url)}
                      alt={message.attachment.name || 'Photo'}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                      style={{ maxHeight: '240px', display: 'block' }}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="bg-black/60 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg backdrop-blur-sm flex items-center gap-1.5">
                        <ImageIcon size={12} /> View
                      </span>
                    </div>
                  </div>
                  <ImageViewerModal
                    isOpen={isImageViewerOpen}
                    onClose={() => setIsImageViewerOpen(false)}
                    src={message.attachment.url}
                    alt={message.attachment.name}
                    filename={message.attachment.name}
                  />
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 12px', borderRadius: '10px',
                    backgroundColor: isOwn ? 'rgba(255,255,255,0.15)' : 'var(--color-bg-primary)',
                    border: isOwn ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--color-border-primary)',
                    maxWidth: '280px',
                  }}
                >
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '8px',
                    backgroundColor: isOwn ? 'rgba(255,255,255,0.2)' : 'rgba(var(--color-accent-rgb), 0.1)',
                    color: isOwn ? '#ffffff' : 'var(--color-accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <FileText size={17} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: isOwn ? '#ffffff' : 'var(--color-text-primary)' }}>
                      {message.attachment.name}
                    </div>
                    {message.attachment.size && (
                      <div style={{ fontSize: '10px', color: isOwn ? 'rgba(255,255,255,0.7)' : 'var(--color-text-tertiary)' }}>
                        {message.attachment.size}
                      </div>
                    )}
                  </div>
                  <a
                    href={getFileUrl(message.attachment.url)}
                    target="_blank" rel="noopener noreferrer"
                    download={message.attachment.name}
                    style={{
                      padding: '6px', borderRadius: '7px', flexShrink: 0, textDecoration: 'none',
                      backgroundColor: isOwn ? 'rgba(255,255,255,0.2)' : 'var(--color-bg-secondary)',
                      color: isOwn ? '#ffffff' : 'var(--color-text-secondary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Download size={14} />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Message Text or Edit Mode */}
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                style={{
                  width: '100%', padding: '6px 10px',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  color: '#ffffff', borderRadius: '8px',
                  fontSize: '13px', border: '1px solid rgba(255,255,255,0.3)', outline: 'none',
                }}
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') setIsEditing(false); }}
              />
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                <button onClick={() => setIsEditing(false)} style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff', border: 'none', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSaveEdit} style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '11px', backgroundColor: '#ffffff', color: 'var(--color-accent)', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Save</button>
              </div>
            </div>
          ) : (
            content ? <div style={{ whiteSpace: 'pre-wrap' }}>{content}</div> : null
          )}

          {/* Meta: time + read receipt */}
          <div
            style={{
              fontSize: '10px', marginTop: '4px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'flex-end', gap: '4px',
              userSelect: 'none',
              color: isOwn
                ? (sentBubbleTextColor === '#ffffff' ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.45)')
                : 'var(--color-text-tertiary)',
            }}
          >
            {isEdited && <span style={{ fontStyle: 'italic' }}>edited</span>}
            <span>{time}</span>
            {isOwn && (
              <CheckCheck size={12} style={{ color: sentBubbleTextColor === '#ffffff' ? 'rgba(255,255,255,0.75)' : 'currentColor' }} />
            )}
          </div>
        </div>

        {/* Reaction Badges */}
        {reactions.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
            {reactions.map((r, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleAddReaction(r.emoji)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '2px 8px', borderRadius: '999px', fontSize: '12px',
                  border: `1px solid ${r.userReacted ? 'rgba(var(--color-accent-rgb), 0.4)' : 'var(--color-border-primary)'}`,
                  backgroundColor: r.userReacted ? 'rgba(var(--color-accent-rgb), 0.1)' : 'var(--color-bg-secondary)',
                  color: r.userReacted ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                }}
              >
                <span>{r.emoji}</span>
                <span style={{ fontSize: '10px', fontWeight: 700 }}>{r.count}</span>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Own user avatar */}
      {isOwn && (
        <div style={{ flexShrink: 0, width: '32px', marginBottom: '2px', visibility: isLastInGroup ? 'visible' : 'hidden' }}>
          <Avatar name={user?.name || senderName} src={displayAvatar} size="sm" />
        </div>
      )}
    </motion.div>
  );
};

const ActionBtn = ({ children, onClick, title, danger }) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: 0.85 }}
    title={title}
    style={{
      padding: '5px',
      borderRadius: '7px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: danger ? '#ef4444' : 'var(--color-text-secondary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 120ms ease, color 120ms ease',
    }}
    className={danger ? 'hover:bg-red-50' : 'hover:bg-[var(--color-bg-hover)]'}
  >
    {children}
  </motion.button>
);

export default MessageBubble;
