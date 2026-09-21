import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import { Search, X, Check, UserPlus, Users, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import useAuthStore from '../../store/useAuthStore';

// Fallback seed directory if offline
const SEED_DIRECTORY = [
  { id: 'usr-anita', name: 'Anita Das', username: 'anita', email: 'anita@zyntra.com', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
  { id: 'usr-soumya', name: 'Soumya', username: 'soumya', email: 'soumya@zyntra.com', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { id: 'usr-priya', name: 'Priya Sharma', username: 'priya', email: 'priya@zyntra.com', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
  { id: 'usr-rahul', name: 'Rahul Verma', username: 'rahul', email: 'rahul@zyntra.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { id: 'usr-aarav', name: 'Aarav Patel', username: 'aarav', email: 'aarav@zyntra.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { id: 'usr-sarah', name: 'Sarah Jenkins', username: 'sarah', email: 'sarah@zyntra.com', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80' },
  { id: 'usr-alex', name: 'Alex Chen', username: 'alex', email: 'alex@zyntra.com', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' },
];

const AddMembersModal = ({ isOpen, onClose, node, onAddMembers }) => {
  const { user: currentUser } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [directoryUsers, setDirectoryUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Existing member IDs and usernames for fast lookup
  const existingMemberMap = useMemo(() => {
    const map = new Set();
    if (node?.members && Array.isArray(node.members)) {
      node.members.forEach((m) => {
        if (m.id) map.add(String(m.id).toLowerCase());
        if (m.username) map.add(String(m.username).replace(/^@/, '').toLowerCase());
      });
    }
    // Also include current user as existing member
    if (currentUser?.id) map.add(String(currentUser.id).toLowerCase());
    if (currentUser?.primaryUsername) map.add(String(currentUser.primaryUsername).replace(/^@/, '').toLowerCase());
    return map;
  }, [node, currentUser]);

  // Load directory on open
  useEffect(() => {
    if (!isOpen) {
      setSelectedUsers([]);
      setSearchQuery('');
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const fetchUsers = async () => {
      try {
        const res = await api.contacts.search(searchQuery.trim());
        if (isMounted) {
          if (res.ok && Array.isArray(res.data?.users) && res.data.users.length > 0) {
            setDirectoryUsers(res.data.users);
          } else {
            // Fallback to seed directory filtered by current user
            const filteredSeed = SEED_DIRECTORY.filter(
              (u) =>
                u.username !== currentUser?.primaryUsername &&
                u.email !== currentUser?.email
            );
            setDirectoryUsers(filteredSeed);
          }
        }
      } catch (err) {
        if (isMounted) {
          const filteredSeed = SEED_DIRECTORY.filter(
            (u) =>
              u.username !== currentUser?.primaryUsername &&
              u.email !== currentUser?.email
          );
          setDirectoryUsers(filteredSeed);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchUsers, searchQuery ? 250 : 0);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, searchQuery, currentUser]);

  const toggleSelectUser = (user) => {
    const isAlreadyMember =
      existingMemberMap.has(String(user.id).toLowerCase()) ||
      existingMemberMap.has(String(user.username || '').replace(/^@/, '').toLowerCase());

    if (isAlreadyMember) return;

    setSelectedUsers((prev) => {
      const exists = prev.some(
        (u) =>
          u.id === user.id ||
          (u.username && user.username && u.username.toLowerCase() === user.username.toLowerCase())
      );
      if (exists) {
        return prev.filter(
          (u) =>
            u.id !== user.id &&
            u.username?.toLowerCase() !== user.username?.toLowerCase()
        );
      } else {
        return [...prev, user];
      }
    });
  };

  const removeSelectedUser = (userToRemove) => {
    setSelectedUsers((prev) =>
      prev.filter(
        (u) =>
          u.id !== userToRemove.id &&
          u.username?.toLowerCase() !== userToRemove.username?.toLowerCase()
      )
    );
  };

  const handleBatchAdd = async () => {
    if (selectedUsers.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (onAddMembers) {
        await onAddMembers(selectedUsers);
      }
      onClose();
    } catch (err) {
      console.error('Error adding members:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Members to #${node?.name || 'Group'}`}
      size="md"
    >
      <div className="flex flex-col gap-3.5 -mt-1">
        {/* Search input bar */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, @username, or email..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Selected Members Chips Tray (WhatsApp style) */}
        {selectedUsers.length > 0 && (
          <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] font-bold text-slate-600">
                Selected ({selectedUsers.length})
              </span>
              <button
                type="button"
                onClick={() => setSelectedUsers([])}
                className="text-[10px] font-semibold text-red-600 hover:text-red-700 cursor-pointer"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {selectedUsers.map((user) => (
                <div
                  key={user.id || user.username}
                  className="inline-flex items-center gap-1.5 bg-white border border-blue-200 text-blue-800 pl-1 pr-2 py-0.5 rounded-full text-xs shadow-xs group"
                >
                  <Avatar name={user.name} avatarUrl={user.avatar} size="xs" />
                  <span className="font-medium text-[11px] truncate max-w-[110px]">
                    {user.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSelectedUser(user)}
                    className="text-slate-400 hover:text-red-500 rounded-full p-0.5 transition-colors cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Directory List */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1.5">
            <span>Select People</span>
            {isLoading && <Loader2 size={13} className="animate-spin text-blue-500" />}
          </div>

          <div className="max-h-[280px] overflow-y-auto space-y-1 pr-1 divide-y divide-slate-100">
            {directoryUsers.length === 0 && !isLoading ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No users found matching &quot;{searchQuery}&quot;
              </div>
            ) : (
              directoryUsers.map((user) => {
                const isAlreadyMember =
                  existingMemberMap.has(String(user.id).toLowerCase()) ||
                  existingMemberMap.has(String(user.username || '').replace(/^@/, '').toLowerCase());

                const isSelected = selectedUsers.some(
                  (u) =>
                    u.id === user.id ||
                    (u.username && user.username && u.username.toLowerCase() === user.username.toLowerCase())
                );

                return (
                  <div
                    key={user.id || user.username}
                    onClick={() => toggleSelectUser(user)}
                    className={`flex items-center justify-between p-2.5 rounded-xl transition-all select-none ${
                      isAlreadyMember
                        ? 'opacity-60 bg-slate-50/50 cursor-not-allowed'
                        : isSelected
                        ? 'bg-blue-50/80 border border-blue-200 cursor-pointer shadow-xs'
                        : 'hover:bg-slate-50 cursor-pointer border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={user.name} avatarUrl={user.avatar} size="sm" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-slate-800 truncate">
                            {user.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono truncate">
                            @{user.username}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {user.email || user.bio || 'Member'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      {isAlreadyMember ? (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-md">
                          In group
                        </span>
                      ) : (
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-slate-300 hover:border-slate-400 bg-white'
                          }`}
                        >
                          {isSelected && <Check size={13} strokeWidth={3} />}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={selectedUsers.length === 0 || isSubmitting}
            onClick={handleBatchAdd}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer ${
              selectedUsers.length > 0 && !isSubmitting
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <UserPlus size={14} />
                <span>
                  {selectedUsers.length > 0
                    ? `Add ${selectedUsers.length} Member${selectedUsers.length > 1 ? 's' : ''}`
                    : 'Add Members'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddMembersModal;