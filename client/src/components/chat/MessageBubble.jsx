import React, { useState } from 'react';
import { Reply, SmilePlus, Pencil, Trash2, Check, CheckCheck, FileText, Image as ImageIcon, Download } from 'lucide-react';
import Avatar from '../ui/Avatar';
import useChatStore from '../../store/useChatStore';
import useThemeStore from '../../store/useThemeStore';
import useAuthStore from '../../store/useAuthStore';
import { getFileUrl } from '../../services/api';
import ImageViewerModal from './ImageViewerModal';

const QUICK_REACTIONS = ['👍', '❤️', '🔥', '🎉', '🚀'];

const MessageBubble = ({
  message,
  isOwn,
  policy = {},
  chatId,
  onReply
}) => {
  const [hovered, setHovered] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  const { deleteMessage, editMessage, addReaction } = useChatStore();
  const sentBubbleColor = useThemeStore((s) => s.sentBubbleColor) || '#1d63ff';
  const sentBubbleTextColor = useThemeStore((s) => s.sentBubbleTextColor) || '#ffffff';
  const receivedBubbleColor = useThemeStore((s) => s.receivedBubbleColor) || '#f1f5f9';
  const receivedBubbleTextColor = useThemeStore((s) => s.receivedBubbleTextColor) || '#0f172a';

  const { id, senderName, content, timestamp, reactions = [], isEdited } = message;

  const time = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

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

  const user = useAuthStore((s) => s.user);
  const contacts = useChatStore((s) => s.contacts) || [];

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

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isOwn ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: '10px',
        width: '100%',
        position: 'relative'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setShowReactionPicker(false);
      }}
    >
      {/* Avatar for other participants */}
      {!isOwn && (
        <div style={{ flexShrink: 0, marginBottom: '2px' }}>
          <Avatar name={senderName} src={displayAvatar} size="sm" />
        </div>
      )}

      {/* Bubble + Floating Action Bar Container */}
      <div
        style={{
          maxWidth: '65%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isOwn ? 'flex-end' : 'flex-start',
          position: 'relative'
        }}
      >
        {/* Floating Action Menu (Hover) */}
        {hovered && !isEditing && (
          <div
            style={{
              position: 'absolute',
              top: '-34px',
              right: isOwn ? 0 : 'auto',
              left: isOwn ? 'auto' : 0,
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              borderRadius: '10px',
              padding: '3px 5px',
              zIndex: 20
            }}
          >
            {/* Quick Reaction Bar */}
            {policy.reactions !== false && (
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setShowReactionPicker(!showReactionPicker)}
                  style={{
                    padding: '4px',
                    borderRadius: '6px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b'
                  }}
                  title="Add reaction"
                >
                  <SmilePlus size={14} />
                </button>

                {showReactionPicker && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '100%',
                      marginBottom: '6px',
                      left: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                      borderRadius: '12px',
                      padding: '6px',
                      zIndex: 30
                    }}
                  >
                    {QUICK_REACTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleAddReaction(emoji)}
                        style={{
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: 'none',
                          background: 'none',
                          fontSize: '16px',
                          cursor: 'pointer',
                          borderRadius: '6px'
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reply */}
            <button
              type="button"
              onClick={() => onReply && onReply(message)}
              style={{
                padding: '4px',
                borderRadius: '6px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b'
              }}
              title="Reply"
            >
              <Reply size={14} />
            </button>

            {/* Edit (if own message and policy permits) */}
            {isOwn && policy.editMessage !== false && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                style={{
                  padding: '4px',
                  borderRadius: '6px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
                title="Edit message"
              >
                <Pencil size={14} />
              </button>
            )}

            {/* Delete (if own message and policy permits) */}
            {isOwn && policy.deleteMessage !== false && (
              <button
                type="button"
                onClick={() => deleteMessage(chatId, id)}
                style={{
                  padding: '4px',
                  borderRadius: '6px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#ef4444'
                }}
                title="Delete message"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}

        {/* Message Card Bubble */}
        <div
          style={{
            padding: '10px 16px',
            borderRadius: '16px',
            borderBottomRightRadius: isOwn ? '3px' : '16px',
            borderBottomLeftRadius: isOwn ? '16px' : '3px',
            backgroundColor: isOwn ? sentBubbleColor : receivedBubbleColor,
            color: isOwn ? sentBubbleTextColor : receivedBubbleTextColor,
            fontSize: '13.5px',
            lineHeight: 1.5,
            wordBreak: 'break-word',
            boxShadow: isOwn
              ? '0 2px 10px rgba(0, 0, 0, 0.16)'
              : '0 1px 3px rgba(0, 0, 0, 0.05)',
            border: isOwn ? 'none' : '1px solid rgba(0, 0, 0, 0.08)',
            maxWidth: '100%',
            boxSizing: 'border-box',
            transition: 'background-color 0.2s ease, color 0.2s ease'
          }}
        >
          {/* Sender label if not own in group chat */}
          {!isOwn && (
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#1d63ff',
                marginBottom: '3px',
                userSelect: 'none'
              }}
            >
              {senderName}
            </div>
          )}

          {/* Message Attachment Rendering */}
          {message.attachment && (
            <div style={{ marginBottom: content ? '8px' : '2px' }}>
              {message.attachment.type === 'image' || (message.attachment.mimeType && message.attachment.mimeType.startsWith('image/')) ? (
                <div>
                  <div
                    onClick={() => setIsImageViewerOpen(true)}
                    className="relative group overflow-hidden rounded-xl cursor-pointer border border-black/10 shadow-xs"
                    style={{
                      maxWidth: '340px',
                      maxHeight: '260px',
                      backgroundColor: 'rgba(0,0,0,0.05)'
                    }}
                  >
                    <img
                      src={getFileUrl(message.attachment.url)}
                      alt={message.attachment.name || 'Photo'}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                      style={{ maxHeight: '260px' }}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="bg-black/60 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1.5">
                        <ImageIcon size={13} />
                        <span>View</span>
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
                /* Document / File Card */
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    backgroundColor: isOwn ? 'rgba(255, 255, 255, 0.15)' : '#ffffff',
                    border: isOwn ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid #e2e8f0',
                    maxWidth: '320px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: isOwn ? 'rgba(255, 255, 255, 0.2)' : '#eff6ff',
                      color: isOwn ? '#ffffff' : '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <FileText size={18} />
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        color: isOwn ? '#ffffff' : '#0f172a'
                      }}
                      title={message.attachment.name}
                    >
                      {message.attachment.name}
                    </div>
                    {message.attachment.size && (
                      <div
                        style={{
                          fontSize: '10px',
                          color: isOwn ? 'rgba(255, 255, 255, 0.75)' : '#64748b'
                        }}
                      >
                        {message.attachment.size}
                      </div>
                    )}
                  </div>

                  <a
                    href={getFileUrl(message.attachment.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={message.attachment.name}
                    style={{
                      padding: '6px',
                      borderRadius: '8px',
                      backgroundColor: isOwn ? 'rgba(255, 255, 255, 0.2)' : '#f1f5f9',
                      color: isOwn ? '#ffffff' : '#334155',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      textDecoration: 'none',
                      transition: 'background-color 0.15s ease'
                    }}
                    title="Download / View file"
                  >
                    <Download size={15} />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Message Content or Inline Edit */}
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px 0' }}>
              <input
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  borderRadius: '6px',
                  fontSize: '13px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  outline: 'none'
                }}
                autoFocus
              />
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    backgroundColor: '#ffffff',
                    color: '#1d63ff',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            content ? <div style={{ whiteSpace: 'pre-wrap' }}>{content}</div> : null
          )}

          {/* Timestamp & Status Meta */}
          <div
            style={{
              fontSize: '10px',
              marginTop: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '4px',
              userSelect: 'none',
              color: isOwn
                ? (sentBubbleTextColor === '#ffffff' ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.6)')
                : (receivedBubbleTextColor === '#0f172a' ? '#94a3b8' : 'rgba(255,255,255,0.65)')
            }}
          >
            {isEdited && <span style={{ fontStyle: 'italic' }}>edited</span>}
            <span>{time}</span>
            {isOwn && (
              <CheckCheck
                size={13}
                style={{
                  color: sentBubbleTextColor === '#ffffff' ? '#bfdbfe' : 'currentColor',
                  display: 'inline'
                }}
              />
            )}
          </div>
        </div>

        {/* Rendered Reaction Badges */}
        {reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {reactions.map((r, i) => (
              <button
                key={i}
                onClick={() => handleAddReaction(r.emoji)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border shadow-xs transition-transform hover:scale-105 ${
                  r.userReacted
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <span>{r.emoji}</span>
                <span className="font-semibold text-[10px]">{r.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Avatar for current user */}
      {isOwn && (
        <div style={{ flexShrink: 0, marginBottom: '2px' }}>
          <Avatar name={user?.name || senderName} src={displayAvatar} size="sm" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
