import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import useAuthStore from '../../store/useAuthStore';

const MessageList = ({
  messages = [],
  currentUserId,
  policy = {},
  chatId,
  onReply
}) => {
  const bottomRef = useRef(null);
  const user = useAuthStore((s) => s.user);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
          💬
        </div>
        <h3 className="text-sm font-semibold text-slate-800 mb-1">
          No messages in this channel yet
        </h3>
        <p className="text-xs text-slate-400 max-w-xs">
          Send the first message to initiate the discussion within this authorized level.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 28px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
      }}
      className="custom-scrollbar"
    >
      {/* Date Divider */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '12px 0 20px 0',
          userSelect: 'none'
        }}
      >
        <div style={{ height: '1px', backgroundColor: '#e2e8f0', flex: 1, maxWidth: '100px' }} />
        <span
          style={{
            padding: '0 12px',
            fontSize: '10px',
            fontWeight: 700,
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          Today
        </span>
        <div style={{ height: '1px', backgroundColor: '#e2e8f0', flex: 1, maxWidth: '100px' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
        {messages.map((message) => {
          const isOwn = Boolean(
            (user && message.senderId && (message.senderId === user.id || message.senderId === user._id)) ||
            (user && message.senderUsername && message.senderUsername.replace(/^@/, '').toLowerCase() === user.primaryUsername?.toLowerCase()) ||
            (currentUserId && message.senderId === currentUserId) ||
            ((user?.email === 'soumya@zyntra.com' || user?.primaryUsername === 'soumya') &&
              (message.senderId === 'user-1' || message.senderName === 'Soumya' || message.senderName === 'Soumya Mohanty')) ||
            (user?.name && message.senderName === user.name)
          );

          return (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={isOwn}
              policy={policy}
              chatId={chatId}
              onReply={onReply}
            />
          );
        })}
      </div>
      <div ref={bottomRef} style={{ height: '8px' }} />
    </div>
  );
};

export default MessageList;
