import { motion } from 'framer-motion';
import Avatar from '../ui/Avatar';

/**
 * ContactCard — premium conversation list item
 * Shows avatar, name, last message, time, and unread badge
 */
const ContactCard = ({ contact, isActive, onClick }) => {
  const unreadCount = contact.unreadCount || 0;
  const hasUnread = unreadCount > 0;

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      initial={false}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '9px 12px',
        borderRadius: '12px',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background-color 150ms ease',
        position: 'relative',
        backgroundColor: isActive
          ? 'rgba(var(--color-accent-rgb, 37, 99, 235), 0.14)'
          : 'transparent',
      }}
      className={!isActive ? 'hover:bg-white/[0.05]' : ''}
    >
      {/* Active left bar */}
      {isActive && (
        <motion.div
          layoutId="activeBar"
          style={{
            position: 'absolute',
            left: 0,
            top: '20%',
            bottom: '20%',
            width: '3px',
            borderRadius: '0 3px 3px 0',
            backgroundColor: 'var(--color-accent, #2563eb)',
          }}
        />
      )}

      {/* Avatar with status */}
      <div style={{ flexShrink: 0 }}>
        <Avatar
          name={contact.name}
          src={contact.avatar}
          size="sm"
          status={contact.status}
        />
      </div>

      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: hasUnread ? 700 : 600,
              color: isActive ? '#ffffff' : 'var(--sidebar-text, #e2e8f0)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              minWidth: 0,
            }}
          >
            {contact.name}
          </span>
          {contact.lastMessageTime && (
            <span
              style={{
                fontSize: '10px',
                color: hasUnread
                  ? 'var(--color-accent, #60a5fa)'
                  : 'var(--sidebar-text-secondary, #64748b)',
                flexShrink: 0,
                fontWeight: hasUnread ? 600 : 400,
              }}
            >
              {formatTime(contact.lastMessageTime)}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
          {contact.lastMessage ? (
            <p
              style={{
                fontSize: '12px',
                color: hasUnread
                  ? 'var(--sidebar-text, #e2e8f0)'
                  : 'var(--sidebar-text-secondary, #64748b)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                minWidth: 0,
                margin: 0,
                fontWeight: hasUnread ? 500 : 400,
              }}
            >
              {contact.lastMessage}
            </p>
          ) : (
            <p style={{ flex: 1, margin: 0 }} />
          )}

          {hasUnread && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
              style={{
                backgroundColor: 'var(--color-accent, #2563eb)',
                color: '#ffffff',
                fontSize: '10px',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '999px',
                flexShrink: 0,
                minWidth: '18px',
                textAlign: 'center',
                lineHeight: '16px',
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </div>
      </div>
    </motion.button>
  );
};

export default ContactCard;
