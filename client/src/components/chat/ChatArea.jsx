import React, { useState } from 'react';
import { MessageSquareDashed, Lock } from 'lucide-react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import Composer from './Composer';
import useThemeStore from '../../store/useThemeStore';
import { getChatWallpaperStyle } from '../../utils/themeWallpapers';

const ChatArea = ({
  chatId,
  chatName,
  chatAvatar = null,
  chatStatus = null,
  memberCount,
  policy = {},
  messages = [],
  currentUserId = 'user-1',
  onSend,
  onInfoClick,
  onBackClick
}) => {
  const [replyingTo, setReplyingTo] = useState(null);

  const wallpaper = useThemeStore((s) => s.wallpaper);
  const wallpaperCustomUrl = useThemeStore((s) => s.wallpaperCustomUrl);
  const wallpaperOpacity = useThemeStore((s) => s.wallpaperOpacity);
  const wallpaperBlur = useThemeStore((s) => s.wallpaperBlur);

  if (!chatId) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none h-full"
        style={{ backgroundColor: 'var(--color-bg-primary)' }}
      >
        <div
          style={{
            width: '64px', height: '64px', borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(var(--color-accent-rgb), 0.12), rgba(var(--color-accent-rgb), 0.04))',
            border: '1px solid rgba(var(--color-accent-rgb), 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-accent)', marginBottom: '16px',
          }}
        >
          <MessageSquareDashed size={28} />
        </div>
        <h3
          style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '6px', letterSpacing: '-0.02em' }}
        >
          No conversation selected
        </h3>
        <p
          style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', maxWidth: '300px', lineHeight: 1.6, marginBottom: '20px' }}
        >
          Pick a contact or channel from the sidebar to start messaging.
        </p>
        <div
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', borderRadius: '999px',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            fontSize: '12px', fontWeight: 500, color: '#10b981',
          }}
        >
          <Lock size={12} />
          End-to-End Encrypted
        </div>
      </div>
    );
  }

  const handleSendWrapper = (content, attachment) => {
    onSend(content, attachment);
    setReplyingTo(null);
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        backgroundColor: 'var(--color-bg-primary, #ffffff)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <ChatHeader
        name={chatName}
        avatar={chatAvatar}
        status={chatStatus}
        memberCount={memberCount}
        policy={policy}
        onInfoClick={onInfoClick}
        onBackClick={onBackClick}
      />

      {/* Wallpaper Background Layer */}
      {wallpaper !== 'plain' && (
        <div
          style={{
            position: 'absolute',
            top: '56px',
            left: 0,
            right: 0,
            bottom: '72px',
            pointerEvents: 'none',
            zIndex: 0,
            transition: 'all 0.3s ease',
            ...getChatWallpaperStyle(wallpaper, wallpaperCustomUrl, wallpaperOpacity, wallpaperBlur)
          }}
        />
      )}

      {/* Message List Container (Transparent surface to reveal wallpaper) */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,
          backgroundColor: 'transparent'
        }}
      >
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          policy={policy}
          chatId={chatId}
          onReply={(msg) => setReplyingTo(msg)}
        />
      </div>

      {/* Composer */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Composer
          onSend={handleSendWrapper}
          policy={policy}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
        />
      </div>
    </div>
  );
};

export default ChatArea;
