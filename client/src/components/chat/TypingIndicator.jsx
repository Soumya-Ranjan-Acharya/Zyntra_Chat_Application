const TypingIndicator = ({ users = [] }) => {
  if (users.length === 0) return null;
  const text = users.length === 1 ? `${users[0]} is typing` : `${users.join(' and ')} are typing`;
  return (
    <div className="px-4 lg:px-6 py-1 text-xs text-[var(--color-text-tertiary)] flex items-center gap-2">
      <span>{text}</span>
      <span className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="w-1.5 h-1.5 bg-[var(--color-text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
        ))}
      </span>
    </div>
  );
};
export default TypingIndicator;
