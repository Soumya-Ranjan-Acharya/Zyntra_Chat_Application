import React from 'react';

/**
 * Skeleton — shimmer placeholder for loading states
 * Uses the .skeleton class from theme.css
 */
export const Skeleton = ({ className = '', style = {} }) => (
  <div className={`skeleton ${className}`} style={style} aria-hidden="true" />
);

export const ConversationSkeleton = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px' }}>
    <Skeleton style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0 }} />
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
        <Skeleton style={{ height: '12px', width: '40%', borderRadius: '6px' }} />
        <Skeleton style={{ height: '10px', width: '20%', borderRadius: '6px' }} />
      </div>
      <Skeleton style={{ height: '10px', width: '70%', borderRadius: '6px' }} />
    </div>
  </div>
);

export const MessageBubbleSkeleton = ({ isOwn = false }) => (
  <div style={{
    display: 'flex',
    flexDirection: isOwn ? 'row-reverse' : 'row',
    alignItems: 'flex-end',
    gap: '10px',
  }}>
    {!isOwn && <Skeleton style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0 }} />}
    <div style={{
      maxWidth: '55%',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      alignItems: isOwn ? 'flex-end' : 'flex-start',
    }}>
      <Skeleton style={{ height: '38px', width: `${isOwn ? 180 : 220}px`, borderRadius: '14px' }} />
      <Skeleton style={{ height: '8px', width: '60px', borderRadius: '4px' }} />
    </div>
  </div>
);

export const MessageListSkeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px 28px' }}>
    <MessageBubbleSkeleton isOwn={false} />
    <MessageBubbleSkeleton isOwn={true} />
    <MessageBubbleSkeleton isOwn={false} />
    <MessageBubbleSkeleton isOwn={true} />
    <MessageBubbleSkeleton isOwn={false} />
  </div>
);

export default Skeleton;
