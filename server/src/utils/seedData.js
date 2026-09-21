export const defaultUser = {
  name: 'Soumya Mohanty',
  email: 'soumya@zyntra.com',
  primaryUsername: 'soumya',
  password: 'password123',
  avatar: null,
  avatarType: 'ai',
  bio: 'Lead Engineer & Systems Architect · Building contextual communication',
  contexts: [
    { id: 'ctx-personal', type: 'personal', name: 'Personal', username: 'soumya.personal' },
    { id: 'ctx-giet', type: 'workplace', name: 'GIET University', username: 'soumya.giet' },
    { id: 'ctx-abc', type: 'workplace', name: 'ABC Technologies', username: 'soumya.backend' }
  ]
};

export const defaultContacts = [
  {
    id: 'contact-1',
    ownerId: 'user-1',
    name: 'Aarav Patel',
    username: 'aarav.p',
    avatar: null,
    status: 'online',
    lastMessage: 'See you tomorrow at 10 AM!',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 5),
    bio: 'Fullstack developer & coffee enthusiast'
  },
  {
    id: 'contact-2',
    ownerId: 'user-1',
    name: 'Priya Sharma',
    username: 'priya_s',
    avatar: null,
    status: 'online',
    lastMessage: 'I reviewed the design specs. Looks brilliant!',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 35),
    bio: 'UI/UX Designer · Crafting delightful interactions'
  },
  {
    id: 'contact-3',
    ownerId: 'user-1',
    name: 'Rahul Kumar',
    username: 'rahul.k',
    avatar: null,
    status: 'away',
    lastMessage: 'Got the latest build running smoothly.',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
    bio: 'DevOps & Cloud Infrastructure'
  },
  {
    id: 'contact-4',
    ownerId: 'user-1',
    name: 'Ananya Gupta',
    username: 'ananya.g',
    avatar: null,
    status: 'online',
    lastMessage: 'Happy birthday Soumya! Have a great day ahead! 🎂',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 18),
    bio: 'Product Manager · AI & Data Systems'
  },
  {
    id: 'contact-5',
    ownerId: 'user-1',
    name: 'Vikram Singh',
    username: 'vikram.s',
    avatar: null,
    status: 'offline',
    lastMessage: 'Call me when you are free this evening.',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 48),
    bio: 'Security Researcher'
  }
];

export const defaultPersonalGroups = [
  {
    id: 'group-1',
    name: 'Friends Circle',
    type: 'personal-group',
    membersCount: 5,
    lastMessage: 'Priya: Where are we meeting for dinner tonight?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 12),
    description: 'Weekend hangouts and casual banter'
  },
  {
    id: 'group-2',
    name: 'Family',
    type: 'personal-group',
    membersCount: 12,
    lastMessage: 'Mom: Dinner will be ready at 8 PM, do not be late!',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 45),
    description: 'Family updates and photos'
  },
  {
    id: 'group-3',
    name: 'College Alumni 2024',
    type: 'personal-group',
    membersCount: 28,
    lastMessage: 'Rahul: Anyone attending the tech symposium in Bangalore?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 4),
    description: 'Class of 2024 alumni network'
  },
  {
    id: 'group-4',
    name: 'Gaming Guild',
    type: 'personal-group',
    membersCount: 8,
    lastMessage: 'Vikram: GG WP everyone! Same time tomorrow?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 14),
    description: 'Valorant & CS2 competitive squad'
  }
];

export const defaultWorkspaces = [
  {
    id: 'ws-giet',
    name: 'GIET University',
    rootNodeId: 'ws-giet-root',
    defaultNodeId: 'giet-zyntra-frontend',
    type: 'organization',
    memberCount: 5200,
    creatorName: 'Soumya Mohanty (You)',
    contextualUsername: 'soumya.giet',
    joinedAt: 'January 2024',
    policy: {
      emoji: true,
      reactions: true,
      editMessage: true,
      deleteMessage: true,
      title: 'Collaborative Academic Policy'
    }
  },
  {
    id: 'ws-abc',
    name: 'ABC Technologies',
    rootNodeId: 'ws-abc-root',
    defaultNodeId: 'abc-frontend-react',
    type: 'organization',
    memberCount: 1200,
    creatorName: 'Enterprise Admin',
    contextualUsername: 'soumya.backend',
    joinedAt: 'March 2024',
    policy: {
      emoji: false,
      reactions: false,
      editMessage: false,
      deleteMessage: false,
      title: 'Enterprise Compliance Policy (Restricted)'
    }
  }
];

export const defaultWorkspaceNodes = [
  // GIET University
  {
    id: 'ws-giet-root',
    workspaceId: 'ws-giet',
    name: 'GIET University',
    parentId: null,
    children: ['giet-cse', 'giet-ece', 'giet-mech', 'giet-placement'],
    memberCount: 5200,
    hasConversation: true,
    joinCode: 'ZYN-GIET-0001',
    description: 'Official university communications & administrative announcements'
  },
  {
    id: 'giet-cse',
    workspaceId: 'ws-giet',
    name: 'Computer Science & Eng',
    parentId: 'ws-giet-root',
    children: ['giet-cse-aiml', 'giet-cse-ds', 'giet-cse-cs'],
    memberCount: 1450,
    hasConversation: true,
    joinCode: 'ZYN-GIET-1000',
    description: 'Department of Computer Science & Engineering'
  },
  {
    id: 'giet-cse-aiml',
    workspaceId: 'ws-giet',
    name: 'AI & Machine Learning',
    parentId: 'giet-cse',
    children: ['giet-cse-aiml-a', 'giet-cse-aiml-b', 'giet-cse-aiml-proj'],
    memberCount: 420,
    hasConversation: true,
    joinCode: 'ZYN-GIET-1100',
    description: 'AIML Specialization batch and research wing'
  },
  {
    id: 'giet-cse-aiml-a',
    workspaceId: 'ws-giet',
    name: 'Section A (3rd Year)',
    parentId: 'giet-cse-aiml',
    children: [],
    memberCount: 65,
    hasConversation: true,
    joinCode: 'ZYN-GIET-1110',
    description: 'Batch 2023-2027 Section A class group'
  },
  {
    id: 'giet-cse-aiml-b',
    workspaceId: 'ws-giet',
    name: 'Section B (3rd Year)',
    parentId: 'giet-cse-aiml',
    children: [],
    memberCount: 62,
    hasConversation: true,
    joinCode: 'ZYN-GIET-1120',
    description: 'Batch 2023-2027 Section B class group'
  },
  {
    id: 'giet-cse-aiml-proj',
    workspaceId: 'ws-giet',
    name: 'Capstone Projects',
    parentId: 'giet-cse-aiml',
    children: ['giet-proj-zyntra', 'giet-proj-ecomm'],
    memberCount: 128,
    hasConversation: true,
    joinCode: 'ZYN-GIET-1130',
    description: 'Project teams coordination and seminar reviews'
  },
  {
    id: 'giet-proj-zyntra',
    workspaceId: 'ws-giet',
    name: 'Zyntra Project Team',
    parentId: 'giet-cse-aiml-proj',
    children: ['giet-zyntra-frontend', 'giet-zyntra-backend'],
    memberCount: 12,
    hasConversation: true,
    joinCode: 'ZYN-GIET-1131',
    description: 'Next-generation contextual chat application project team'
  },
  {
    id: 'giet-zyntra-frontend',
    workspaceId: 'ws-giet',
    name: 'Frontend Guild',
    parentId: 'giet-proj-zyntra',
    children: [],
    memberCount: 6,
    hasConversation: true,
    joinCode: 'ZYN-GIET-1132',
    description: 'React, Tailwind CSS & client state implementation'
  },
  {
    id: 'giet-zyntra-backend',
    workspaceId: 'ws-giet',
    name: 'Backend & Socket Core',
    parentId: 'giet-proj-zyntra',
    children: [],
    memberCount: 6,
    hasConversation: true,
    joinCode: 'ZYN-GIET-1133',
    description: 'Node.js, Express, MongoDB & Socket.io server layer'
  },
  {
    id: 'giet-proj-ecomm',
    workspaceId: 'ws-giet',
    name: 'AI E-Commerce Team',
    parentId: 'giet-cse-aiml-proj',
    children: [],
    memberCount: 10,
    hasConversation: true,
    joinCode: 'ZYN-GIET-1134',
    description: 'AI recommendation powered marketplace project'
  },
  {
    id: 'giet-cse-ds',
    workspaceId: 'ws-giet',
    name: 'Data Science Division',
    parentId: 'giet-cse',
    children: [],
    memberCount: 240,
    hasConversation: true,
    joinCode: 'ZYN-GIET-1200',
    description: 'Data Science specialization hub'
  },
  {
    id: 'giet-cse-cs',
    workspaceId: 'ws-giet',
    name: 'Cyber Security Wing',
    parentId: 'giet-cse',
    children: [],
    memberCount: 180,
    hasConversation: true,
    joinCode: 'ZYN-GIET-1300',
    description: 'Information security and ethical hacking team'
  },
  {
    id: 'giet-ece',
    workspaceId: 'ws-giet',
    name: 'Electronics & Comm',
    parentId: 'ws-giet-root',
    children: [],
    memberCount: 880,
    hasConversation: true,
    joinCode: 'ZYN-GIET-2000',
    description: 'Department of Electronics & Communication'
  },
  {
    id: 'giet-mech',
    workspaceId: 'ws-giet',
    name: 'Mechanical Eng',
    parentId: 'ws-giet-root',
    children: [],
    memberCount: 620,
    hasConversation: true,
    joinCode: 'ZYN-GIET-3000',
    description: 'Department of Mechanical Engineering'
  },
  {
    id: 'giet-placement',
    workspaceId: 'ws-giet',
    name: 'Training & Placement Cell',
    parentId: 'ws-giet-root',
    children: [],
    memberCount: 2200,
    hasConversation: true,
    joinCode: 'ZYN-GIET-4000',
    description: 'Campus placement updates, interview drives and schedules'
  },

  // ABC Technologies
  {
    id: 'ws-abc-root',
    workspaceId: 'ws-abc',
    name: 'ABC Technologies',
    parentId: null,
    children: ['abc-eng', 'abc-prod', 'abc-hr', 'abc-mkt'],
    memberCount: 1200,
    hasConversation: true,
    joinCode: 'ZYN-ABC-0001',
    description: 'ABC Technologies enterprise headquarters'
  },
  {
    id: 'abc-eng',
    workspaceId: 'ws-abc',
    name: 'Engineering',
    parentId: 'ws-abc-root',
    children: ['abc-eng-backend', 'abc-eng-frontend', 'abc-eng-qa'],
    memberCount: 650,
    hasConversation: true,
    joinCode: 'ZYN-ABC-1000',
    description: 'Core software engineering department'
  },
  {
    id: 'abc-eng-backend',
    workspaceId: 'ws-abc',
    name: 'Backend Infrastructure',
    parentId: 'abc-eng',
    children: ['abc-backend-java', 'abc-backend-node'],
    memberCount: 280,
    hasConversation: true,
    joinCode: 'ZYN-ABC-1100',
    description: 'Distributed microservices and database engines'
  },
  {
    id: 'abc-backend-java',
    workspaceId: 'ws-abc',
    name: 'Java Platform Team',
    parentId: 'abc-eng-backend',
    children: ['abc-java-spring'],
    memberCount: 140,
    hasConversation: true,
    joinCode: 'ZYN-ABC-1110',
    description: 'Enterprise Java systems & Kafka clusters'
  },
  {
    id: 'abc-java-spring',
    workspaceId: 'ws-abc',
    name: 'Spring Boot Services',
    parentId: 'abc-backend-java',
    children: [],
    memberCount: 65,
    hasConversation: true,
    joinCode: 'ZYN-ABC-1111',
    description: 'Cloud native Spring Boot microservices'
  },
  {
    id: 'abc-backend-node',
    workspaceId: 'ws-abc',
    name: 'Node.js & Realtime',
    parentId: 'abc-eng-backend',
    children: [],
    memberCount: 110,
    hasConversation: true,
    joinCode: 'ZYN-ABC-1120',
    description: 'WebSockets, GraphQL, and event-driven API gateways'
  },
  {
    id: 'abc-eng-frontend',
    workspaceId: 'ws-abc',
    name: 'Frontend & Apps',
    parentId: 'abc-eng',
    children: ['abc-frontend-react', 'abc-frontend-ui'],
    memberCount: 220,
    hasConversation: true,
    joinCode: 'ZYN-ABC-1200',
    description: 'Web, mobile and client interface architecture'
  },
  {
    id: 'abc-frontend-react',
    workspaceId: 'ws-abc',
    name: 'React Web Core',
    parentId: 'abc-eng-frontend',
    children: [],
    memberCount: 130,
    hasConversation: true,
    joinCode: 'ZYN-ABC-1210',
    description: 'Design system and core enterprise web portals'
  },
  {
    id: 'abc-frontend-ui',
    workspaceId: 'ws-abc',
    name: 'UI Components & Systems',
    parentId: 'abc-eng-frontend',
    children: [],
    memberCount: 75,
    hasConversation: true,
    joinCode: 'ZYN-ABC-1220',
    description: 'Design tokens, accessibility and micro-interactions'
  },
  {
    id: 'abc-eng-qa',
    workspaceId: 'ws-abc',
    name: 'Quality & Test Automation',
    parentId: 'abc-eng',
    children: [],
    memberCount: 95,
    hasConversation: true,
    joinCode: 'ZYN-ABC-1300',
    description: 'End-to-end test pipelines, Playwright & performance benchmarking'
  },
  {
    id: 'abc-prod',
    workspaceId: 'ws-abc',
    name: 'Product & Design',
    parentId: 'ws-abc-root',
    children: [],
    memberCount: 110,
    hasConversation: true,
    joinCode: 'ZYN-ABC-2000',
    description: 'Roadmaps, specifications and product discovery'
  },
  {
    id: 'abc-hr',
    workspaceId: 'ws-abc',
    name: 'Human Resources & People',
    parentId: 'ws-abc-root',
    children: [],
    memberCount: 45,
    hasConversation: true,
    joinCode: 'ZYN-ABC-3000',
    description: 'Employee wellness, benefits, hiring and policies'
  },
  {
    id: 'abc-mkt',
    workspaceId: 'ws-abc',
    name: 'Growth & Marketing',
    parentId: 'ws-abc-root',
    children: [],
    memberCount: 85,
    hasConversation: true,
    joinCode: 'ZYN-ABC-4000',
    description: 'Brand reach, content, customer acquisition and campaigns'
  }
];

export const defaultMessages = [
  // Contact 1
  { id: 'msg-c1-1', chatId: 'contact-1', chatType: 'direct', senderId: 'contact-1', senderName: 'Aarav Patel', content: 'Hey Soumya! Are you free to review the architecture draft today?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  { id: 'msg-c1-2', chatId: 'contact-1', chatType: 'direct', senderId: 'user-1', senderName: 'Soumya', content: 'Yes Aarav! Just finishing up the tree navigation component for Zyntra. Should take 15 mins.', timestamp: new Date(Date.now() - 1000 * 60 * 50) },
  { id: 'msg-c1-3', chatId: 'contact-1', chatType: 'direct', senderId: 'contact-1', senderName: 'Aarav Patel', content: 'Perfect! See you tomorrow at 10 AM then. Have a great evening!', timestamp: new Date(Date.now() - 1000 * 60 * 5) },

  // Contact 2
  { id: 'msg-c2-1', chatId: 'contact-2', chatType: 'direct', senderId: 'contact-2', senderName: 'Priya Sharma', content: 'Hi Soumya, I just updated the Figma design for the Login brand panel and Settings layout.', timestamp: new Date(Date.now() - 1000 * 60 * 120) },
  { id: 'msg-c2-2', chatId: 'contact-2', chatType: 'direct', senderId: 'user-1', senderName: 'Soumya', content: 'Looking at it right now. The dark navy gradient on the left panel with the identity card is super clean!', timestamp: new Date(Date.now() - 1000 * 60 * 80) },
  { id: 'msg-c2-3', chatId: 'contact-2', chatType: 'direct', senderId: 'contact-2', senderName: 'Priya Sharma', content: 'I reviewed the design specs. Looks brilliant! Excited to see it rendered live.', timestamp: new Date(Date.now() - 1000 * 60 * 35) },

  // Contact 3
  { id: 'msg-c3-1', chatId: 'contact-3', chatType: 'direct', senderId: 'contact-3', senderName: 'Rahul Kumar', content: 'Hey, did you push the latest Vite configuration changes?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5) },
  { id: 'msg-c3-2', chatId: 'contact-3', chatType: 'direct', senderId: 'user-1', senderName: 'Soumya', content: 'Yes, Tailwind v4 is integrated and tree-shaking is working as expected.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3) },
  { id: 'msg-c3-3', chatId: 'contact-3', chatType: 'direct', senderId: 'contact-3', senderName: 'Rahul Kumar', content: 'Got the latest build running smoothly.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },

  // Group 1
  { id: 'msg-g1-1', chatId: 'group-1', chatType: 'personal-group', senderId: 'contact-1', senderName: 'Aarav Patel', content: 'Hey team, weekend plans?', timestamp: new Date(Date.now() - 1000 * 60 * 180) },
  { id: 'msg-g1-2', chatId: 'group-1', chatType: 'personal-group', senderId: 'user-1', senderName: 'Soumya', content: 'How about the new cafe in Indiranagar?', timestamp: new Date(Date.now() - 1000 * 60 * 120) },
  { id: 'msg-g1-3', chatId: 'group-1', chatType: 'personal-group', senderId: 'contact-2', senderName: 'Priya Sharma', content: 'Where are we meeting for dinner tonight? Count me in!', timestamp: new Date(Date.now() - 1000 * 60 * 12) },

  // GIET Frontend Guild
  { id: 'msg-gf-1', chatId: 'giet-zyntra-frontend', chatType: 'workspace-node', senderId: 'member-1', senderName: 'Prof. Anirudh Sen', content: 'Welcome everyone to the Zyntra Frontend Guild. Today we finalize the contextual chat UI components.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6) },
  { id: 'msg-gf-2', chatId: 'giet-zyntra-frontend', chatType: 'workspace-node', senderId: 'member-2', senderName: 'Bhavna Roy', content: 'I verified the tree hierarchy component. Indentation and recursive child expansion works smoothly.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4) },
  { id: 'msg-gf-3', chatId: 'giet-zyntra-frontend', chatType: 'workspace-node', senderId: 'user-1', senderName: 'Soumya', content: 'Awesome. I have updated all CSS design tokens and theme persistence in local storage so theme changes occur instantly.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  { id: 'msg-gf-4', chatId: 'giet-zyntra-frontend', chatType: 'workspace-node', senderId: 'member-3', senderName: 'Chetan Das', content: 'Make sure the message composer respects the workspace policy toggles!', timestamp: new Date(Date.now() - 1000 * 60 * 45) },
  { id: 'msg-gf-5', chatId: 'giet-zyntra-frontend', chatType: 'workspace-node', senderId: 'user-1', senderName: 'Soumya', content: 'Done! When policy restricts emoji or reactions, the composer automatically hides those controls and remains neat.', timestamp: new Date(Date.now() - 1000 * 60 * 10) },

  // GIET Backend Guild
  { id: 'msg-gb-1', chatId: 'giet-zyntra-backend', chatType: 'workspace-node', senderId: 'member-4', senderName: 'Deepak Rao', content: 'Socket connection heartbeat interval is set to 25 seconds.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8) },
  { id: 'msg-gb-2', chatId: 'giet-zyntra-backend', chatType: 'workspace-node', senderId: 'user-1', senderName: 'Soumya', content: 'Perfect. The client listeners are hooked to the state store.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3) }
];
