import { Contact, PersonalGroup } from '../models/Contact.js';
import User from '../models/User.js';

// @desc    Get personal contacts and groups for current user
// @route   GET /api/contacts
// @access  Public / Private
export const getContactsAndGroups = async (req, res, next) => {
  try {
    let contactQuery = {};
    let groupQuery = {};

    if (req.user) {
      const isSoumya = req.user.primaryUsername === 'soumya' || req.user.email === 'soumya@zyntra.com';
      if (!isSoumya) {
        // Fresh user: only show contacts and groups they created/own
        contactQuery = { ownerId: req.user._id.toString() };
        groupQuery = { creatorId: req.user._id.toString() };
      } else {
        // Soumya: show contacts owned by Soumya OR demo contacts (ownerId: 'user-1')
        contactQuery = {
          $or: [
            { ownerId: req.user._id.toString() },
            { ownerId: 'user-1' },
          ],
        };
        groupQuery = {
          $or: [
            { creatorId: req.user._id.toString() },
            { creatorId: 'user-1' },
          ],
        };
      }
    }

    const contacts = await Contact.find(contactQuery).sort({ lastMessageTime: -1 }).lean();
    const groups = await PersonalGroup.find(groupQuery).sort({ lastMessageTime: -1 }).lean();

    // Dynamically populate live avatar and profile data from User collection
    const cleanUsernames = [
      ...new Set(
        contacts
          .map((c) => c.username?.trim().replace(/^@/, '').toLowerCase())
          .filter(Boolean)
      ),
    ];

    if (cleanUsernames.length > 0) {
      const matchedUsers = await User.find(
        { primaryUsername: { $in: cleanUsernames } },
        'primaryUsername name avatar bio status'
      ).lean();

      const userMap = new Map();
      matchedUsers.forEach((u) => {
        if (u.primaryUsername) {
          userMap.set(u.primaryUsername.toLowerCase(), u);
        }
      });

      contacts.forEach((c) => {
        const u = userMap.get(c.username?.trim().replace(/^@/, '').toLowerCase());
        if (u) {
          if (u.avatar) c.avatar = u.avatar;
          if (u.name) c.name = u.name;
          if (u.status) c.status = u.status;
          if (u.bio) c.bio = u.bio;
        }
      });
    }

    res.status(200).json({
      success: true,
      contacts,
      groups,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search registered users by username or name to add as contacts
// @route   GET /api/contacts/search
// @access  Public / Private
export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    const currentUserId = req.user?._id;

    const filter = {};
    if (q && q.trim()) {
      const clean = q.trim().replace(/^@/, '');
      filter.$or = [
        { primaryUsername: { $regex: clean, $options: 'i' } },
        { name: { $regex: clean, $options: 'i' } },
        { email: { $regex: clean, $options: 'i' } },
      ];
    }

    if (currentUserId) {
      filter._id = { $ne: currentUserId };
    }

    const users = await User.find(filter)
      .select('name primaryUsername email avatar avatarType bio status')
      .limit(30);

    res.status(200).json({
      success: true,
      users: users.map((u) => ({
        id: u._id,
        name: u.name,
        username: u.primaryUsername,
        email: u.email,
        avatar: u.avatar,
        avatarType: u.avatarType,
        bio: u.bio,
        status: u.status,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new personal contact
// @route   POST /api/contacts
// @access  Public / Private
export const createContact = async (req, res, next) => {
  try {
    const { name, username, bio, avatar } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required to add a contact',
      });
    }

    const cleanUsername = username.trim().replace(/^@/, '').toLowerCase();
    const currentUserId = req.user?._id?.toString() || 'user-1';
    const currentUserUsername = req.user?.primaryUsername?.toLowerCase() || 'user';
    const currentUserName = req.user?.name || currentUserUsername;
    const currentUserAvatar = req.user?.avatar || null;

    // Check if target user exists in database to fetch full profile info
    const matchedUser = await User.findOne({ primaryUsername: cleanUsername });

    const contactName = matchedUser?.name || name?.trim() || cleanUsername;
    const contactAvatar = matchedUser?.avatar || avatar || null;
    const contactBio = matchedUser?.bio || bio || '';

    // Canonical DM conversation ID based on sorted usernames
    const canonicalDmId = 'dm_' + [currentUserUsername, cleanUsername].sort().join('_');

    // 1. Find or create contact for the initiator (current user)
    let contact = await Contact.findOne({ ownerId: currentUserId, username: cleanUsername });
    if (contact) {
      contact.id = canonicalDmId;
      await contact.save();
    } else {
      contact = await Contact.create({
        id: canonicalDmId,
        ownerId: currentUserId,
        name: contactName,
        username: cleanUsername,
        bio: contactBio,
        avatar: contactAvatar,
        status: matchedUser?.status || 'online',
        lastMessage: 'Connected on Zyntra',
        lastMessageTime: new Date(),
      });
    }

    // 2. Automatically create reciprocal contact for target user (if registered)
    if (matchedUser) {
      const targetUserId = matchedUser._id.toString();
      let reverseContact = await Contact.findOne({ ownerId: targetUserId, username: currentUserUsername });
      if (reverseContact) {
        reverseContact.id = canonicalDmId;
        await reverseContact.save();
      } else {
        await Contact.create({
          id: canonicalDmId,
          ownerId: targetUserId,
          name: currentUserName,
          username: currentUserUsername,
          bio: req.user?.bio || '',
          avatar: currentUserAvatar,
          status: req.user?.status || 'online',
          lastMessage: 'Connected on Zyntra',
          lastMessageTime: new Date(),
        });
      }
    }

    res.status(201).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new personal group
// @route   POST /api/contacts/groups
// @access  Public / Private
export const createPersonalGroup = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Group name is required',
      });
    }

    const newId = `group-${Date.now()}`;
    const group = await PersonalGroup.create({
      id: newId,
      name: name.trim(),
      description: description?.trim() || '',
      membersCount: 1,
      lastMessage: '',
      lastMessageTime: new Date(),
      creatorId: req.user?._id?.toString() || 'user-1',
    });

    res.status(201).json({
      success: true,
      data: group,
    });
  } catch (error) {
    next(error);
  }
};
