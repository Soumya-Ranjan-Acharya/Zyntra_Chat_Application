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
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#f8fafc] text-center select-none h-full">
        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-blue-600 mb-4">
          <MessageSquareDashed size={28} />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1.5">
          Select a conversation
        </h3>
        <p className="text-xs text-slate-500 max-w-sm leading-relaxed mb-6">
          Choose a team, direct message, or group from the sidebar to inspect messages and collaborate within your authorized workspace level.
        </p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs border border-slate-200">
          <Lock size={12} className="text-emerald-600" />
          End-to-End Encrypted Communications
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
