import React, { useState } from 'react';
import { MessageSquareDashed } from 'lucide-react';
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
  onBackClick,
}) => {
  const [replyingTo, setReplyingTo] = useState(null);

  const wallpaper        = useThemeStore((s) => s.wallpaper);
  const wallpaperCustomUrl = useThemeStore((s) => s.wallpaperCustomUrl);
  const wallpaperOpacity = useThemeStore((s) => s.wallpaperOpacity);
  const wallpaperBlur    = useThemeStore((s) => s.wallpaperBlur);

  if (!chatId) {
    return (
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          textAlign: 'center',
          backgroundColor: 'var(--color-bg-primary)',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, rgba(var(--color-accent-rgb), 0.12), rgba(var(--color-accent-rgb), 0.04))',
            border: '1px solid rgba(var(--color-accent-rgb), 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-accent)',
            marginBottom: '16px',
          }}
        >
          <MessageSquareDashed size={26} />
        </div>
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginBottom: '6px',
            letterSpacing: '-0.02em',
          }}
        >
          No conversation selected
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', maxWidth: '280px', lineHeight: 1.6, margin: 0 }}>
          Pick a contact or channel from the sidebar to start messaging.
        </p>
      </div>
    );
  }

  const handleSendWrapper = (content, attachment) => {
    onSend(content, attachment);
    setReplyingTo(null);
  };

  return (
    /*
     * ChatArea root:
     *   - Takes all remaining height from parent (flex: 1)
     *   - min-height: 0 is CRITICAL to prevent flex from expanding infinitely
     *   - flex-direction: column → header | messages | composer stacked
     *   - overflow: hidden so inner scroll containers work correctly
     */
    <div
      style={{
        flex: 1,
        minHeight: 0,       // CRITICAL
        minWidth: 0,        // CRITICAL
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--color-bg-primary)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Header — fixed height, never shrinks ─────────────── */}
      <ChatHeader
        name={chatName}
        avatar={chatAvatar}
        status={chatStatus}
        memberCount={memberCount}
        policy={policy}
        onInfoClick={onInfoClick}
        onBackClick={onBackClick}
      />

      {/* ── Wallpaper background layer ─────────────────────────── */}
      {wallpaper !== 'plain' && (
        <div
          style={{
            position: 'absolute',
            top: '56px',
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            zIndex: 0,
            ...getChatWallpaperStyle(wallpaper, wallpaperCustomUrl, wallpaperOpacity, wallpaperBlur),
          }}
        />
      )}

      {/*
       * ── Message List — grows to fill all remaining space ──────
       * flex: 1 + min-height: 0 means it takes leftover height after
       * header and composer, but does NOT overflow the container.
       * overflow-y: auto here makes it the scroll owner.
       */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
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

      {/* ── Composer — never shrinks, sits at the bottom ────────── */}
      <div style={{ flexShrink: 0, position: 'relative', zIndex: 2 }}>
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
