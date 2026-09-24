import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Paperclip, Smile, SendHorizontal, X, FileText,
  Image as ImageIcon, ShieldAlert, Loader2
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

const Composer = ({ onSend, policy = {}, disabled, replyingTo, onCancelReply }) => {
  const [text, setText] = useState('');
  const user = useAuthStore((s) => s.user);
  const [showEmojiPicker, setShowEmojiPicker] = useState(
    typeof window !== 'undefined' && window.location.search.includes('emoji=1')
  );
  const [attachment, setAttachment] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const hasContent = !!(text.trim() || attachment);
  const isRestrictedPolicy = policy.emoji === false && policy.reactions === false;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (hasContent && !disabled && !isUploading) {
      onSend(text.trim(), attachment);
      setText('');
      setAttachment(null);
      if (onCancelReply) onCancelReply();
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleInsertEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const handleProcessFile = async (file) => {
    if (!file || disabled) return;
    const isImage = file.type.startsWith('image/');
    const localBlobUrl = isImage ? URL.createObjectURL(file) : null;

    setAttachment({ type: isImage ? 'image' : 'file', name: file.name, size: formatFileSize(file.size), url: localBlobUrl || '', mimeType: file.type, isUploading: true });
    setIsUploading(true);

    try {
      const res = await api.upload.file(file);
      if (res.ok && res.data?.data?.url) {
        setAttachment({ type: res.data.data.type || (isImage ? 'image' : 'file'), name: res.data.data.name || file.name, size: res.data.data.size || formatFileSize(file.size), url: res.data.data.url, mimeType: res.data.data.mimeType || file.type, isUploading: false });
      } else {
        setAttachment((prev) => prev ? { ...prev, isUploading: false } : null);
      }
    } catch (err) {
      setAttachment((prev) => prev ? { ...prev, isUploading: false } : null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.[0]) handleProcessFile(e.dataTransfer.files[0]); }}
      style={{
        padding: '10px 20px 16px',
        borderTop: '1px solid var(--color-border-primary)',
        backgroundColor: 'var(--color-bg-primary)',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {/* Hidden inputs */}
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={(e) => { if (e.target.files?.[0]) handleProcessFile(e.target.files[0]); e.target.value = ''; }} />
      <input type="file" ref={imageInputRef} accept="image/*" style={{ display: 'none' }} onChange={(e) => { if (e.target.files?.[0]) handleProcessFile(e.target.files[0]); e.target.value = ''; }} />

      {/* Drag overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: '6px',
              backgroundColor: 'rgba(var(--color-accent-rgb), 0.06)',
              border: '2px dashed var(--color-accent)',
              borderRadius: '14px', zIndex: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              color: 'var(--color-accent)', fontSize: '13px', fontWeight: 600,
              pointerEvents: 'none',
            }}
          >
            <ImageIcon size={20} />
            <span>Drop to attach</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Policy banner */}
      <AnimatePresence>
        {isRestrictedPolicy && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginBottom: '8px', overflow: 'hidden',
              padding: '6px 12px', borderRadius: '8px',
              backgroundColor: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontSize: '11px', color: '#92400e',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              <ShieldAlert size={14} color="#d97706" />
              Enterprise Policy: Formal plain-text compliance enforced.
            </span>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Audit Active</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reply banner */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginBottom: '8px', overflow: 'hidden',
              padding: '8px 12px', borderRadius: '0 10px 10px 0',
              borderLeft: '3px solid var(--color-accent)',
              backgroundColor: 'rgba(var(--color-accent-rgb), 0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              <span style={{ fontWeight: 700, color: 'var(--color-accent)', flexShrink: 0 }}>↩ {replyingTo.senderName}</span>
              <span style={{ color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{replyingTo.content}</span>
            </div>
            <motion.button whileTap={{ scale: 0.85 }} onClick={onCancelReply} style={{ padding: '4px', background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', flexShrink: 0 }}>
              <X size={14} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attachment preview */}
      <AnimatePresence>
        {attachment && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginBottom: '8px', overflow: 'hidden',
              padding: '8px 12px', borderRadius: '12px',
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              {attachment.type === 'image' && attachment.url ? (
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--color-border-primary)' }}>
                  <img src={getFileUrl(attachment.url)} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : attachment.type === 'image' ? (
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(var(--color-accent-rgb), 0.1)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ImageIcon size={17} />
                </div>
              ) : (
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={17} />
                </div>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '260px' }}>{attachment.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{attachment.size}</span>
                  {attachment.isUploading && (
                    <span style={{ color: 'var(--color-accent)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <Loader2 size={10} className="animate-spin" /> Uploading...
                    </span>
                  )}
                </div>
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.85 }} onClick={() => setAttachment(null)} style={{ padding: '6px', borderRadius: '8px', background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', display: 'flex' }}>
              <X size={15} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main input row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ flexShrink: 0 }}>
          <Avatar name={user?.name || 'User'} src={user?.avatar} size="sm" status="online" />
        </div>

        {/* Input pill */}
        <motion.div
          animate={{
            boxShadow: isFocused
              ? `0 0 0 2px rgba(var(--color-accent-rgb), 0.2), var(--elevation-2)`
              : 'var(--elevation-1)',
            borderColor: isFocused ? 'var(--color-accent)' : 'var(--color-border-secondary)',
          }}
          transition={{ duration: 0.18 }}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: '6px',
            backgroundColor: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border-primary)',
            borderRadius: '20px', padding: '6px 8px 6px 12px',
            minWidth: 0,
          }}
        >
          {/* Left action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1px', flexShrink: 0 }}>
            <ComposerBtn onClick={() => fileInputRef.current?.click()} disabled={disabled || isUploading} title="Attach File">
              <Paperclip size={17} />
            </ComposerBtn>
            <ComposerBtn onClick={() => imageInputRef.current?.click()} disabled={disabled || isUploading} title="Upload Photo">
              <ImageIcon size={17} />
            </ComposerBtn>
            {policy.emoji !== false && (
              <div style={{ position: 'relative' }} ref={emojiPickerRef}>
                <ComposerBtn
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  active={showEmojiPicker}
                  title="Emoji"
                >
                  <Smile size={17} />
                </ComposerBtn>
                {showEmojiPicker && (
                  <ModernEmojiPicker onSelectEmoji={handleInsertEmoji} onClose={() => setShowEmojiPicker(false)} />
                )}
              </div>
            )}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onPaste={(e) => {
              const items = e.clipboardData?.items;
              if (items) {
                for (let i = 0; i < items.length; i++) {
                  if (items[i].kind === 'file' && items[i].type.startsWith('image/')) {
                    const file = items[i].getAsFile();
                    if (file) { handleProcessFile(file); e.preventDefault(); return; }
                  }
                }
              }
            }}
            disabled={disabled}
            placeholder="Message... (⏎ to send, ⇧⏎ for newline)"
            rows={1}
            style={{
              flex: 1, minHeight: '34px', maxHeight: '120px',
              backgroundColor: 'transparent', border: 'none', outline: 'none',
              resize: 'none', padding: '7px 4px',
              fontSize: '14px', color: 'var(--color-text-primary)',
              lineHeight: 1.5, fontFamily: 'inherit',
            }}
          />

          {/* Send button */}
          <motion.button
            onClick={handleSend}
            disabled={!hasContent || disabled || isUploading}
            animate={{
              backgroundColor: hasContent && !isUploading ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
              scale: hasContent ? 1 : 0.95,
            }}
            whileHover={hasContent ? { scale: 1.08 } : {}}
            whileTap={hasContent ? { scale: 0.88 } : {}}
            transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
            style={{
              width: '36px', height: '36px', borderRadius: '14px', border: 'none',
              color: hasContent && !isUploading ? '#ffffff' : 'var(--color-text-tertiary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: hasContent && !isUploading ? 'pointer' : 'not-allowed',
              flexShrink: 0,
              boxShadow: hasContent && !isUploading ? '0 4px 12px rgba(var(--color-accent-rgb), 0.35)' : 'none',
            }}
            title="Send"
          >
            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <SendHorizontal size={16} />}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

const ComposerBtn = ({ children, onClick, disabled, title, active }) => (
  <motion.button
    onClick={onClick}
    disabled={disabled}
    whileTap={{ scale: 0.85 }}
    title={title}
    style={{
      padding: '6px', borderRadius: '8px', border: 'none',
      backgroundColor: active ? 'rgba(var(--color-accent-rgb), 0.12)' : 'transparent',
      color: active ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: disabled ? 0.4 : 1,
      transition: 'background-color 120ms ease, color 120ms ease',
    }}
    className="hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-secondary)]"
  >
    {children}
  </motion.button>
);

export default Composer;
