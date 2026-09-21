import Avatar from '../ui/Avatar';

const ContactCard = ({ contact, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
      isActive ? 'bg-white/12 text-white' : 'text-white/70 hover:bg-white/5'
    }`}
  >
    <Avatar name={contact.name} size="sm" status={contact.status} />
    <div className="flex-1 min-w-0 text-left">
      <div className="text-sm font-medium truncate">{contact.name}</div>
      {contact.lastMessage && <p className="text-xs text-white/40 truncate mt-0.5">{contact.lastMessage}</p>}
    </div>
  </button>
);
export default ContactCard;
