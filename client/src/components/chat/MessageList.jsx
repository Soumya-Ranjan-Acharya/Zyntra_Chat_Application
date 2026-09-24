import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import MessageBubble from './MessageBubble';
import useAuthStore from '../../store/useAuthStore';

/** Format a date into a readable separator label */
const formatDateLabel = (date) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
};

/** Check if two timestamps are within 3 minutes of each other */
const withinGroupWindow = (ts1, ts2) => {
  return Math.abs(new Date(ts1) - new Date(ts2)) < 3 * 60 * 1000;
};

/** Build enriched message list with grouping metadata */
const buildRenderList = (messages, isOwnFn) => {
  const items = [];
  let lastDate = null;
  let lastSenderId = null;
  let lastTs = null;

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const msgDate = new Date(msg.timestamp).toDateString();

    // Date separator
    if (msgDate !== lastDate) {
      items.push({ type: 'date', label: formatDateLabel(msg.timestamp), key: `date-${msgDate}` });
      lastDate = msgDate;
      lastSenderId = null;
      lastTs = null;
    }

    const isOwn = isOwnFn(msg);
    const senderId = msg.senderId || msg.senderUsername;
    const sameGroup =
      senderId === lastSenderId &&
      withinGroupWindow(msg.timestamp, lastTs);

    // Check if next message is in same group
    const next = messages[i + 1];
    const nextSenderId = next ? (next.senderId || next.senderUsername) : null;
    const isLastInGroup =
      nextSenderId !== senderId ||
      (next && !withinGroupWindow(msg.timestamp, next.timestamp));

    items.push({
      type: 'message',
      message: msg,
      isOwn,
      isFirstInGroup: !sameGroup,
      isLastInGroup,
      key: msg.id,
    });

    lastSenderId = senderId;
    lastTs = msg.timestamp;
  }

  return items;
};

const DateSeparator = ({ label }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      margin: '16px 0',
      userSelect: 'none',
    }}
  >
    <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border-primary)' }} />
    <span
      style={{
        padding: '3px 12px',
        fontSize: '11px',
        fontWeight: 600,
        color: 'var(--color-text-tertiary)',
        backgroundColor: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-primary)',
        borderRadius: '999px',
        whiteSpace: 'nowrap',
        letterSpacing: '0.02em',
      }}
    >
      {label}
    </span>
    <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border-primary)' }} />
  </motion.div>
);

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      textAlign: 'center',
    }}
  >
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        width: '56px',
        height: '56px',
        borderRadius: '18px',
        background: 'linear-gradient(135deg, rgba(var(--color-accent-rgb), 0.15), rgba(var(--color-accent-rgb), 0.05))',
        border: '1px solid rgba(var(--color-accent-rgb), 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '28px',
        marginBottom: '16px',
      }}
    >
      💬
    </motion.div>
    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 6px' }}>
      Start the conversation
    </h3>
    <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', maxWidth: '260px', lineHeight: 1.5, margin: 0 }}>
      Send the first message — everything starts with a hello.
    </p>
  </motion.div>
);

const MessageList = ({ messages = [], currentUserId, policy = {}, chatId, onReply }) => {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const user = useAuthStore((s) => s.user);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const isOwnFn = useCallback((message) => {
    return Boolean(
      (user && message.senderId && (message.senderId === user.id || message.senderId === user._id)) ||
      (user && message.senderUsername &&
        message.senderUsername.replace(/^@/, '').toLowerCase() === user.primaryUsername?.toLowerCase()) ||
      (currentUserId && message.senderId === currentUserId) ||
      ((user?.email === 'soumya@zyntra.com' || user?.primaryUsername === 'soumya') &&
        (message.senderId === 'user-1' || message.senderName === 'Soumya' || message.senderName === 'Soumya Mohanty')) ||
      (user?.name && message.senderName === user.name)
    );
  }, [user, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distanceFromBottom > 200);
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (messages.length === 0) {
    return <EmptyState />;
  }

  const renderList = buildRenderList(messages, isOwnFn);

  return (
    <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 24px 16px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          height: '100%',
        }}
        className="custom-scrollbar"
      >
        {renderList.map((item) => {
          if (item.type === 'date') {
            return <DateSeparator key={item.key} label={item.label} />;
          }
          return (
            <div
              key={item.key}
              style={{ marginBottom: item.isLastInGroup ? '10px' : '2px' }}
            >
              <MessageBubble
                message={item.message}
                isOwn={item.isOwn}
                policy={policy}
                chatId={chatId}
                onReply={onReply}
                isFirstInGroup={item.isFirstInGroup}
                isLastInGroup={item.isLastInGroup}
              />
            </div>
          );
        })}
        <div ref={bottomRef} style={{ height: '4px' }} />
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 8 }}
            transition={{ duration: 0.15 }}
            onClick={scrollToBottom}
            style={{
              position: 'absolute',
              bottom: '16px',
              right: '24px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-accent)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(var(--color-accent-rgb), 0.4)',
              zIndex: 10,
            }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronDown size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessageList;
