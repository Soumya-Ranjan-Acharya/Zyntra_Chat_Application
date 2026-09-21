import Avatar from '../ui/Avatar';

const ContactList = ({ contacts = [], activeContactId, onSelectContact }) => (
  <div className="space-y-0.5">
    {contacts.map((c) => (
      <button
        key={c.id}
        onClick={() => onSelectContact(c.id)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
          activeContactId === c.id ? 'bg-white/12 text-white' : 'text-white/70 hover:bg-white/5'
        }`}
      >
        <Avatar name={c.name} size="sm" status={c.status} />
        <div className="flex-1 min-w-0 text-left">
          <div className="text-sm font-medium truncate">{c.name}</div>
          {c.lastMessage && <p className="text-xs text-white/40 truncate mt-0.5">{c.lastMessage}</p>}
        </div>
      </button>
    ))}
  </div>
);
export default ContactList;
