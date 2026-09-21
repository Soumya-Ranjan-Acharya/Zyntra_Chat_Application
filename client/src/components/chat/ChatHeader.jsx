import React from 'react';
import { Lock, Search, Info, ArrowLeft, Phone, Video, ShieldCheck } from 'lucide-react';
import Avatar from '../ui/Avatar';

const ChatHeader = ({
  name = 'Chat',
  avatar = null,
  status = null,
  memberCount,
  isEncrypted = true,
  onInfoClick,
  onBackClick,
  policy = {}
}) => {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        flexShrink: 0,
        userSelect: 'none',
        zIndex: 10
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        {onBackClick && (
          <button
            onClick={onBackClick}
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
            title="Back"
          >
            <ArrowLeft size={18} />
          </button>
        )}

        <Avatar
          name={name}
          src={avatar}
          size="md"
          status={status !== null ? status : (memberCount != null ? null : 'online')}
        />

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 truncate tracking-tight">
              {name}
            </h2>
            {isEncrypted && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200/60 shrink-0">
                <ShieldCheck size={11} className="text-emerald-600" />
                E2EE
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 truncate mt-0.5">
            {memberCount != null ? (
              <span>{memberCount.toLocaleString()} members</span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active now
              </span>
            )}
            {policy?.title && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-[11px] text-slate-400 truncate">{policy.title}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => alert('Search in conversation active')}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          title="Search in conversation"
        >
          <Search size={17} />
        </button>
        <button
          onClick={() => alert('Voice call started (Demo mode)')}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer hidden sm:block"
          title="Voice Call"
        >
          <Phone size={17} />
        </button>
        <button
          onClick={() => alert('Video meeting room launched (Demo mode)')}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer hidden sm:block"
          title="Video Call"
        >
          <Video size={17} />
        </button>
        {onInfoClick && (
          <button
            onClick={onInfoClick}
            className="p-2 rounded-lg hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer ml-1"
            title="Conversation Details & Group Info"
          >
            <Info size={18} />
          </button>
        )}
      </div>
    </header>
  );
};

export default ChatHeader;
