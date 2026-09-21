import React, { useState, useRef, useEffect } from 'react';
import {
  Paperclip,
  Smile,
  SendHorizontal,
  X,
  FileText,
  Image as ImageIcon,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import ModernEmojiPicker from './ModernEmojiPicker';
import Avatar from '../ui/Avatar';
import useAuthStore from '../../store/useAuthStore';
import { api, getFileUrl } from '../../services/api';

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const Composer = ({
  onSend,
  policy = {},
  disabled,
  replyingTo,
  onCancelReply
}) => {
  const [text, setText] = useState('');
  const user = useAuthStore((s) => s.user);
  const [showEmojiPicker, setShowEmojiPicker] = useState(
    typeof window !== 'undefined' && window.location.search.includes('emoji=1')
  );
  const [attachment, setAttachment] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140
      )}px`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if ((text.trim() || attachment) && !disabled && !isUploading) {
      onSend(text.trim(), attachment);
      setText('');
      setAttachment(null);
      if (onCancelReply) onCancelReply();
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleInsertEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleProcessFile = async (file) => {
    if (!file || disabled) return;

    const isImage = file.type.startsWith('image/');
    const localBlobUrl = isImage ? URL.createObjectURL(file) : null;

    setAttachment({
      type: isImage ? 'image' : 'file',
      name: file.name,
      size: formatFileSize(file.size),
      url: localBlobUrl || '',
      mimeType: file.type,
      isUploading: true
    });
    setIsUploading(true);

    try {
      const res = await api.upload.file(file);
      if (res.ok && res.data?.data?.url) {
        setAttachment({
          type: res.data.data.type || (isImage ? 'image' : 'file'),
          name: res.data.data.name || file.name,
          size: res.data.data.size || formatFileSize(file.size),
          url: res.data.data.url,
          mimeType: res.data.data.mimeType || file.type,
          isUploading: false
        });
      } else {
        setAttachment((prev) => (prev ? { ...prev, isUploading: false } : null));
      }
    } catch (err) {
      console.warn('[Zyntra Composer] File upload warning:', err);
      setAttachment((prev) => (prev ? { ...prev, isUploading: false } : null));
    } finally {
      setIsUploading(false);
    }
  };

  const isRestrictedPolicy = policy.emoji === false && policy.reactions === false;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]) {
          handleProcessFile(e.dataTransfer.files[0]);
        }
      }}
      style={{
        padding: '12px 24px 16px 24px',
        borderTop: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        position: 'relative',
        flexShrink: 0
      }}
    >
      {/* Drag & Drop Visual Indicator */}
      {isDragging && (
        <div
          style={{
            position: 'absolute',
            inset: '6px',
            backgroundColor: 'rgba(239, 246, 255, 0.95)',
            border: '2px dashed #3b82f6',
            borderRadius: '12px',
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: '#1d4ed8',
            fontSize: '13px',
            fontWeight: 600,
            pointerEvents: 'none'
          }}
        >
          <ImageIcon size={20} />
          <span>Drop image or file here to attach</span>
        </div>
      )}

      {/* Hidden native file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files?.[0]) handleProcessFile(e.target.files[0]);
          e.target.value = '';
        }}
      />
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files?.[0]) handleProcessFile(e.target.files[0]);
          e.target.value = '';
        }}
      />

      {/* Policy Disclaimer Banner if restricted */}
      {isRestrictedPolicy && (
        <div
          style={{
            marginBottom: '8px',
            padding: '6px 12px',
            borderRadius: '8px',
            backgroundColor: '#fffbeb',
            border: '1px solid #fef3c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: '#92400e'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            <ShieldAlert size={14} color="#d97706" />
            Enterprise Policy: Formal plain-text compliance enforced in this workspace.
          </span>
          <span
            style={{
              fontWeight: 700,
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#b45309'
            }}
          >
            Audit Active
          </span>
        </div>
      )}

      {/* Replying Banner */}
      {replyingTo && (
        <div
          style={{
            marginBottom: '8px',
            padding: '8px 12px',
            borderRadius: '10px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
            <span style={{ fontWeight: 700, color: '#1d63ff' }}>
              Replying to {replyingTo.senderName}:
            </span>
            <span style={{ color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {replyingTo.content}
            </span>
          </div>
          <button
            onClick={onCancelReply}
            style={{
              padding: '4px',
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer'
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Attachment Preview Banner */}
      {attachment && (
        <div
          style={{
            marginBottom: '8px',
            padding: '8px 12px',
            borderRadius: '12px',
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            {attachment.type === 'image' && attachment.url ? (
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  backgroundColor: '#e2e8f0',
                  border: '1px solid #cbd5e1'
                }}
              >
                <img
                  src={getFileUrl(attachment.url)}
                  alt="preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ) : attachment.type === 'image' ? (
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: '#eff6ff',
                  color: '#1d63ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <ImageIcon size={18} />
              </div>
            ) : (
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: '#f5f3ff',
                  color: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <FileText size={18} />
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  color: '#1e293b',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '280px'
                }}
              >
                {attachment.name}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{attachment.size}</span>
                {attachment.isUploading && (
                  <span style={{ color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                    <Loader2 size={11} className="animate-spin" /> Uploading...
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAttachment(null)}
            style={{
              padding: '6px',
              borderRadius: '8px',
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Remove attachment"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Input Box Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ flexShrink: 0 }}>
          <Avatar name={user?.name || 'User'} src={user?.avatar} size="sm" status="online" />
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '16px',
            padding: '6px 12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            transition: 'all 0.15s ease',
            minWidth: 0
          }}
        >
          {/* Left Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
            {/* Attach Document Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              style={{
                padding: '6px',
                borderRadius: '8px',
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: disabled || isUploading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Attach File or Document"
            >
              <Paperclip size={18} />
            </button>

            {/* Photo / Image Upload Button */}
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={disabled || isUploading}
              style={{
                padding: '6px',
                borderRadius: '8px',
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: disabled || isUploading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Upload Photo / Image"
            >
              <ImageIcon size={18} />
            </button>

            {/* Emoji Button (if permitted by policy) */}
            {policy.emoji !== false && (
              <div style={{ position: 'relative' }} ref={emojiPickerRef}>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  style={{
                    padding: '6px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: showEmojiPicker ? 'rgba(var(--color-accent-rgb, 29, 99, 255), 0.15)' : 'transparent',
                    color: showEmojiPicker ? 'var(--color-accent, #1d63ff)' : '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Insert Emoji"
                >
                  <Smile size={18} />
                </button>

                {/* Modern Emoji Picker Popup */}
                {showEmojiPicker && (
                  <ModernEmojiPicker
                    onSelectEmoji={handleInsertEmoji}
                    onClose={() => setShowEmojiPicker(false)}
                  />
                )}
              </div>
            )}
          </div>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onPaste={(e) => {
              const items = e.clipboardData?.items;
              if (items) {
                for (let i = 0; i < items.length; i++) {
                  if (items[i].kind === 'file' && items[i].type.startsWith('image/')) {
                    const file = items[i].getAsFile();
                    if (file) {
                      handleProcessFile(file);
                      e.preventDefault();
                      return;
                    }
                  }
                }
              }
            }}
            disabled={disabled}
            placeholder="Type a message or drop/paste files... (Press Enter to send)"
            rows={1}
            style={{
              flex: 1,
              minHeight: '36px',
              maxHeight: '120px',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              padding: '8px 4px',
              fontSize: '13.5px',
              color: '#0f172a',
              lineHeight: 1.5,
              fontFamily: 'inherit'
            }}
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={(!text.trim() && !attachment) || disabled || isUploading}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: (text.trim() || attachment) && !isUploading ? 'var(--color-accent, #1d63ff)' : '#e2e8f0',
              color: (text.trim() || attachment) && !isUploading ? '#ffffff' : '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: (text.trim() || attachment) && !isUploading ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
            title="Send message"
          >
            {isUploading ? (
              <Loader2 size={16} className="animate-spin text-blue-600" />
            ) : (
              <SendHorizontal size={17} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Composer;
