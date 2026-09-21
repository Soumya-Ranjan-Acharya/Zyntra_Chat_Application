// =======================================================
// ZYNTRA CHAT — COMPREHENSIVE MOCK DATA
// =======================================================

export const currentUser = {
  id: 'user-1',
  name: 'Soumya Mohanty',
  email: 'soumya@zyntra.com',
  primaryUsername: 'soumya',
  avatar: null,
  bio: 'Lead Engineer & Systems Architect · Building contextual communication',
  contexts: [
    { id: 'ctx-personal', type: 'personal', name: 'Personal', username: 'soumya.personal' },
    { id: 'ctx-giet', type: 'workplace', name: 'GIET University', username: 'soumya.giet' },
    { id: 'ctx-abc', type: 'workplace', name: 'ABC Technologies', username: 'soumya.backend' }
  ]
};

export const personalContacts = [
  {
    id: 'contact-1',
    name: 'Aarav Patel',
    username: 'aarav.p',
    avatar: null,
    status: 'online',
    lastMessage: 'See you tomorrow at 10 AM!',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    bio: 'Fullstack developer & coffee enthusiast'
  },
  {
    id: 'contact-2',
    name: 'Priya Sharma',
    username: 'priya_s',
    avatar: null,
    status: 'online',
    lastMessage: 'I reviewed the design specs. Looks brilliant!',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    bio: 'UI/UX Designer · Crafting delightful interactions'
  },
  {
    id: 'contact-3',
    name: 'Rahul Kumar',
    username: 'rahul.k',
    avatar: null,
    status: 'away',
    lastMessage: 'Got the latest build running smoothly.',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    bio: 'DevOps & Cloud Infrastructure'
  },
  {
    id: 'contact-4',
    name: 'Ananya Gupta',
    username: 'ananya.g',
    avatar: null,
    status: 'online',
    lastMessage: 'Happy birthday Soumya! Have a great day ahead! 🎂',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    bio: 'Product Manager · AI & Data Systems'
  },
  {
    id: 'contact-5',
    name: 'Vikram Singh',
    username: 'vikram.s',
    avatar: null,
    status: 'offline',
    lastMessage: 'Call me when you are free this evening.',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    bio: 'Security Researcher'
  }
];

export const personalGroups = [
  {
    id: 'group-1',
    name: 'Friends Circle',
    type: 'personal-group',
    membersCount: 5,
    lastMessage: 'Priya: Where are we meeting for dinner tonight?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    description: 'Weekend hangouts and casual banter'
  },
  {
    id: 'group-2',
    name: 'Family',
    type: 'personal-group',
    membersCount: 12,
    lastMessage: 'Mom: Dinner will be ready at 8 PM, do not be late!',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    description: 'Family updates and photos'
  },
  {
    id: 'group-3',
    name: 'College Alumni 2024',
    type: 'personal-group',
    membersCount: 28,
    lastMessage: 'Rahul: Anyone attending the tech symposium in Bangalore?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    description: 'Class of 2024 alumni network'
  },
  {
    id: 'group-4',
    name: 'Gaming Guild',
    type: 'personal-group',
    membersCount: 8,
    lastMessage: 'Vikram: GG WP everyone! Same time tomorrow?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    description: 'Valorant & CS2 competitive squad'
  }
];

export const workspaceNodes = {
  // ================= GIET UNIVERSITY HIERARCHY =================
  'ws-giet-root': {
    id: 'ws-giet-root',
    name: 'GIET University',
    parentId: null,
    children: ['giet-cse', 'giet-ece', 'giet-mech', 'giet-placement'],
    memberCount: 5200,
    hasConversation: true,
    joinCode: 'ZYN-GIET-0001',
    description: 'Official university communications & administrative announcements'
  },
  'giet-cse': {
    id: 'giet-cse',
    name: 'Computer Science & Eng',
    parentId: 'ws-giet-root',
    children: ['giet-cse-aiml', 'giet-cse-ds', 'giet-cse-cs'],
    memberCount: 1450,
    hasConversation: true,
    joinCode: 'ZYN-GIET-1000',
    description: 'Department of Computer Science & Engineering'
  },
  'giet-cse-aiml': {
    id: 'giet-cse-aiml',
    name: 'AI & Machine Learning',
    parentId: 'giet-cse',
    children: ['giet-cse-aiml-a', 'giet-cse-aiml-b', 'giet-cse-aiml-proj'],
    memberCount: 420,
    hasConversation: true,
    joinCode: 'ZYN-GIET-1100',
    description: 'AIML Specialization batch and research wing'
  },
  'giet-cse-aiml-a': {
    id: 'giet-cse-aiml-a',
    name: 'Section A (3rd Year)',
    parentId: 'giet-cse-aiml',
    children: [],
    memberCount: 65,
    hasConversation: true,
    joinCode: 'ZYN-GIET-1110',
    description: 'Batch 2023-2027 Section A class group'
  },
  'giet-cse-aiml-b': {
    id: 'giet-cse-aiml-b',
    name: 'Section B (3rd Year)',
    parentId: 'giet-cse-aiml',
    children: [],
    memberCount: 62,
    hasConversation: true,
    joinCode: 'ZYN-GIET-1120',
    description: 'Batch 2023-2027 Section B class group'
  },
  'giet-cse-aiml-proj': {
    id: 'giet-cse-aiml-proj',
    name: 'Capstone Projects',
    parentId: 'giet-cse-aiml',
    children: ['giet-proj-zyntra', 'giet-proj-ecomm'],
    memberCount: 128,
    hasConversation: true,
    joinCode: 'ZYN-GIET-1130',
    description: 'Project teams coordination and seminar reviews'
  },
  'giet-proj-zyntra': {
    id: 'giet-proj-zyntra',
    name: 'Zyntra Project Team',
    parentId: 'giet-cse-aiml-proj',
    children: ['giet-zyntra-frontend', 'giet-zyntra-backend'],
    memberCount: 12,
    hasConversation: true,
    joinCode: 'ZYN-GIET-1131',
    description: 'Next-generation contextual chat application project team'
  },
  'giet-zyntra-frontend': {
    id: 'giet-zyntra-frontend',
    name: 'Frontend Guild',
    parentId: 'giet-proj-zyntra',
    children: [],
    memberCount: 6,
    hasConversation: true,
    joinCode: 'ZYN-GIET-1132',
    description: 'React, Tailwind CSS & client state implementation'
  },
  'giet-zyntra-backend': {
    id: 'giet-zyntra-backend',
    name: 'Backend & Socket Core',
    parentId: 'giet-proj-zyntra',
    children: [],
    memberCount: 6,
    hasConversation: true,
    joinCode: 'ZYN-GIET-1133',
    description: 'Node.js, Express, MongoDB & Socket.io server layer'
  },
  'giet-proj-ecomm': {
    id: 'giet-proj-ecomm',
    name: 'AI E-Commerce Team',
    parentId: 'giet-cse-aiml-proj',
    children: [],
    memberCount: 10,
    hasConversation: true,
    joinCode: 'ZYN-GIET-1134',
    description: 'AI recommendation powered marketplace project'
  },
  'giet-cse-ds': {
    id: 'giet-cse-ds',
    name: 'Data Science Division',
    parentId: 'giet-cse',
    children: [],
    memberCount: 240,
    hasConversation: true,
    joinCode: 'ZYN-GIET-1200',
    description: 'Data Science specialization hub'
  },
  'giet-cse-cs': {
    id: 'giet-cse-cs',
    name: 'Cyber Security Wing',
    parentId: 'giet-cse',
    children: [],
    memberCount: 180,
    hasConversation: true,
    joinCode: 'ZYN-GIET-1300',
    description: 'Information security and ethical hacking team'
  },
  'giet-ece': {
    id: 'giet-ece',
    name: 'Electronics & Comm',
    parentId: 'ws-giet-root',
    children: [],
    memberCount: 880,
    hasConversation: true,
    joinCode: 'ZYN-GIET-2000',
    description: 'Department of Electronics & Communication'
  },
  'giet-mech': {
    id: 'giet-mech',
    name: 'Mechanical Eng',
    parentId: 'ws-giet-root',
    children: [],
    memberCount: 620,
    hasConversation: true,
    joinCode: 'ZYN-GIET-3000',
    description: 'Department of Mechanical Engineering'
  },
  'giet-placement': {
    id: 'giet-placement',
    name: 'Training & Placement Cell',
    parentId: 'ws-giet-root',
    children: [],
    memberCount: 2200,
    hasConversation: true,
    joinCode: 'ZYN-GIET-4000',
    description: 'Campus placement updates, interview drives and schedules'
  },

  // ================= ABC TECHNOLOGIES HIERARCHY =================
  'ws-abc-root': {
    id: 'ws-abc-root',
    name: 'ABC Technologies',
    parentId: null,
    children: ['abc-eng', 'abc-prod', 'abc-hr', 'abc-mkt'],
    memberCount: 1200,
    hasConversation: true,
    joinCode: 'ZYN-ABC-0001',
    description: 'ABC Technologies enterprise headquarters'
  },
  'abc-eng': {
    id: 'abc-eng',
    name: 'Engineering',
    parentId: 'ws-abc-root',
    children: ['abc-eng-backend', 'abc-eng-frontend', 'abc-eng-qa'],
    memberCount: 650,
    hasConversation: true,
    joinCode: 'ZYN-ABC-1000',
    description: 'Core software engineering department'
  },
  'abc-eng-backend': {
    id: 'abc-eng-backend',
    name: 'Backend Infrastructure',
    parentId: 'abc-eng',
    children: ['abc-backend-java', 'abc-backend-node'],
    memberCount: 280,
    hasConversation: true,
    joinCode: 'ZYN-ABC-1100',
    description: 'Distributed microservices and database engines'
  },
  'abc-backend-java': {
    id: 'abc-backend-java',
    name: 'Java Platform Team',
    parentId: 'abc-eng-backend',
    children: ['abc-java-spring'],
    memberCount: 140,
    hasConversation: true,
    joinCode: 'ZYN-ABC-1110',
    description: 'Enterprise Java systems & Kafka clusters'
  },
  'abc-java-spring': {
    id: 'abc-java-spring',
    name: 'Spring Boot Services',
    parentId: 'abc-backend-java',
    children: [],
    memberCount: 65,
    hasConversation: true,
    joinCode: 'ZYN-ABC-1111',
    description: 'Cloud native Spring Boot microservices'
  },
  'abc-backend-node': {
    id: 'abc-backend-node',
    name: 'Node.js & Realtime',
    parentId: 'abc-eng-backend',
    children: [],
    memberCount: 110,
    hasConversation: true,
    joinCode: 'ZYN-ABC-1120',
    description: 'WebSockets, GraphQL, and event-driven API gateways'
  },
  'abc-eng-frontend': {
    id: 'abc-eng-frontend',
    name: 'Frontend & Apps',
    parentId: 'abc-eng',
    children: ['abc-frontend-react', 'abc-frontend-ui'],
    memberCount: 220,
    hasConversation: true,
    joinCode: 'ZYN-ABC-1200',
    description: 'Web, mobile and client interface architecture'
  },
  'abc-frontend-react': {
    id: 'abc-frontend-react',
    name: 'React Web Core',
    parentId: 'abc-eng-frontend',
    children: [],
    memberCount: 130,
    hasConversation: true,
    joinCode: 'ZYN-ABC-1210',
    description: 'Design system and core enterprise web portals'
  },
  'abc-frontend-ui': {
    id: 'abc-frontend-ui',
    name: 'UI Components & Systems',
    parentId: 'abc-eng-frontend',
    children: [],
    memberCount: 75,
    hasConversation: true,
    joinCode: 'ZYN-ABC-1220',
    description: 'Design tokens, accessibility and micro-interactions'
  },
  'abc-eng-qa': {
    id: 'abc-eng-qa',
    name: 'Quality & Test Automation',
    parentId: 'abc-eng',
    children: [],
    memberCount: 95,
    hasConversation: true,
    joinCode: 'ZYN-ABC-1300',
    description: 'End-to-end test pipelines, Playwright & performance benchmarking'
  },
  'abc-prod': {
    id: 'abc-prod',
    name: 'Product & Design',
    parentId: 'ws-abc-root',
    children: [],
    memberCount: 110,
    hasConversation: true,
    joinCode: 'ZYN-ABC-2000',
    description: 'Roadmaps, specifications and product discovery'
  },
  'abc-hr': {
    id: 'abc-hr',
    name: 'Human Resources & People',
    parentId: 'ws-abc-root',
    children: [],
    memberCount: 45,
    hasConversation: true,
    joinCode: 'ZYN-ABC-3000',
    description: 'Employee wellness, benefits, hiring and policies'
  },
  'abc-mkt': {
    id: 'abc-mkt',
    name: 'Growth & Marketing',
    parentId: 'ws-abc-root',
    children: [],
    memberCount: 85,
    hasConversation: true,
    joinCode: 'ZYN-ABC-4000',
    description: 'Brand reach, content, customer acquisition and campaigns'
  }
};

export const workspaces = [
  {
    id: 'ws-giet',
    name: 'GIET University',
    rootNodeId: 'ws-giet-root',
    defaultNodeId: 'giet-zyntra-frontend',
    type: 'organization',
    memberCount: 5200,
    isOwner: true,
    role: 'owner',
    creatorName: 'Soumya Mohanty (You)',
    contextualUsername: 'soumya.giet',
    joinedAt: 'January 2024'
  },
  {
    id: 'ws-abc',
    name: 'ABC Technologies',
    rootNodeId: 'ws-abc-root',
    defaultNodeId: 'abc-frontend-react',
    type: 'organization',
    memberCount: 1200,
    isOwner: false,
    role: 'member',
    creatorName: 'Enterprise Admin',
    contextualUsername: 'soumya.backend',
    joinedAt: 'March 2024'
  }
];

export const workspacePolicies = {
  'ws-giet': {
    emoji: true,
    reactions: true,
    editMessage: true,
    deleteMessage: true,
    title: 'Collaborative Academic Policy'
  },
  'ws-abc': {
    emoji: false,
    reactions: false,
    editMessage: false,
    deleteMessage: false,
    title: 'Enterprise Compliance Policy (Restricted)'
  }
};

export const mockMessagesByChat = {
  // Contact 1
  'contact-1': [
    { id: 'msg-c1-1', senderId: 'contact-1', senderName: 'Aarav Patel', content: 'Hey Soumya! Are you free to review the architecture draft today?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), type: 'text' },
    { id: 'msg-c1-2', senderId: 'user-1', senderName: 'Soumya', content: 'Yes Aarav! Just finishing up the tree navigation component for Zyntra. Should take 15 mins.', timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(), type: 'text' },
    { id: 'msg-c1-3', senderId: 'contact-1', senderName: 'Aarav Patel', content: 'Perfect! See you tomorrow at 10 AM then. Have a great evening!', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), type: 'text' }
  ],

  // Contact 2
  'contact-2': [
    { id: 'msg-c2-1', senderId: 'contact-2', senderName: 'Priya Sharma', content: 'Hi Soumya, I just updated the Figma design for the Login brand panel and Settings layout.', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), type: 'text' },
    { id: 'msg-c2-2', senderId: 'user-1', senderName: 'Soumya', content: 'Looking at it right now. The dark navy gradient on the left panel with the identity card is super clean!', timestamp: new Date(Date.now() - 1000 * 60 * 80).toISOString(), type: 'text' },
    { id: 'msg-c2-3', senderId: 'contact-2', senderName: 'Priya Sharma', content: 'I reviewed the design specs. Looks brilliant! Excited to see it rendered live.', timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(), type: 'text' }
  ],

  // Contact 3
  'contact-3': [
    { id: 'msg-c3-1', senderId: 'contact-3', senderName: 'Rahul Kumar', content: 'Hey, did you push the latest Vite configuration changes?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), type: 'text' },
    { id: 'msg-c3-2', senderId: 'user-1', senderName: 'Soumya', content: 'Yes, Tailwind v4 is integrated and tree-shaking is working as expected.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), type: 'text' },
    { id: 'msg-c3-3', senderId: 'contact-3', senderName: 'Rahul Kumar', content: 'Got the latest build running smoothly.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), type: 'text' }
  ],

  // Contact 4
  'contact-4': [
    { id: 'msg-c4-1', senderId: 'contact-4', senderName: 'Ananya Gupta', content: 'Happy birthday Soumya! Have a great day ahead! 🎂', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), type: 'text' },
    { id: 'msg-c4-2', senderId: 'user-1', senderName: 'Soumya', content: 'Thank you so much Ananya! Really appreciate it 🙏', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(), type: 'text' }
  ],

  // Contact 5
  'contact-5': [
    { id: 'msg-c5-1', senderId: 'contact-5', senderName: 'Vikram Singh', content: 'Call me when you are free this evening.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), type: 'text' }
  ],

  // Group 1
  'group-1': [
    { id: 'msg-g1-1', senderId: 'contact-1', senderName: 'Aarav Patel', content: 'Hey team, weekend plans?', timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), type: 'text' },
    { id: 'msg-g1-2', senderId: 'user-1', senderName: 'Soumya', content: 'How about the new cafe in Indiranagar?', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), type: 'text' },
    { id: 'msg-g1-3', senderId: 'contact-2', senderName: 'Priya Sharma', content: 'Where are we meeting for dinner tonight? Count me in!', timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), type: 'text' }
  ],

  // Group 2
  'group-2': [
    { id: 'msg-g2-1', senderId: 'contact-4', senderName: 'Mom', content: 'Dinner will be ready at 8 PM, do not be late!', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), type: 'text' },
    { id: 'msg-g2-2', senderId: 'user-1', senderName: 'Soumya', content: 'On my way home now!', timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(), type: 'text' }
  ],

  // Group 3
  'group-3': [
    { id: 'msg-g3-1', senderId: 'contact-3', senderName: 'Rahul', content: 'Anyone attending the tech symposium in Bangalore?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), type: 'text' }
  ],

  // Group 4
  'group-4': [
    { id: 'msg-g4-1', senderId: 'contact-5', senderName: 'Vikram', content: 'GG WP everyone! Same time tomorrow?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(), type: 'text' }
  ],

  // GIET Frontend Guild
  'giet-zyntra-frontend': [
    { id: 'msg-gf-1', senderId: 'member-1', senderName: 'Prof. Anirudh Sen', content: 'Welcome everyone to the Zyntra Frontend Guild. Today we finalize the contextual chat UI components.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), type: 'text' },
    { id: 'msg-gf-2', senderId: 'member-2', senderName: 'Bhavna Roy', content: 'I verified the tree hierarchy component. Indentation and recursive child expansion works smoothly.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), type: 'text' },
    { id: 'msg-gf-3', senderId: 'user-1', senderName: 'Soumya', content: 'Awesome. I have updated all CSS design tokens and theme persistence in local storage so theme changes occur instantly.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), type: 'text' },
    { id: 'msg-gf-4', senderId: 'member-3', senderName: 'Chetan Das', content: 'Make sure the message composer respects the workspace policy toggles!', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), type: 'text' },
    { id: 'msg-gf-5', senderId: 'user-1', senderName: 'Soumya', content: 'Done! When policy restricts emoji or reactions, the composer automatically hides those controls and remains neat.', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), type: 'text' }
  ],

  // GIET Backend Guild
  'giet-zyntra-backend': [
    { id: 'msg-gb-1', senderId: 'member-4', senderName: 'Deepak Rao', content: 'Socket connection heartbeat interval is set to 25 seconds.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), type: 'text' },
    { id: 'msg-gb-2', senderId: 'user-1', senderName: 'Soumya', content: 'Perfect. The client listeners are hooked to the state store.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), type: 'text' }
  ],

  // GIET Root / Department
  'ws-giet-root': [
    { id: 'msg-gr-1', senderId: 'member-1', senderName: 'Dean of Academics', content: 'Notice: Mid-term evaluation schedules are published on the academic portal.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), type: 'text' },
    { id: 'msg-gr-2', senderId: 'member-2', senderName: 'Registrar Office', content: 'Please ensure all students have their verified Zyntra academic usernames active.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), type: 'text' }
  ],
  'giet-cse': [
    { id: 'msg-gc-1', senderId: 'member-1', senderName: 'HOD Computer Science', content: 'Welcome to the CSE Department official forum. Project teams please submit weekly progress.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 15).toISOString(), type: 'text' }
  ],
  'giet-cse-aiml': [
    { id: 'msg-ga-1', senderId: 'member-1', senderName: 'Faculty Advisor', content: 'Machine learning lab sessions will resume this Thursday.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(), type: 'text' }
  ],
  'giet-proj-zyntra': [
    { id: 'msg-pz-1', senderId: 'user-1', senderName: 'Soumya', content: 'Both Frontend and Backend teams please sync before 4 PM.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(), type: 'text' },
    { id: 'msg-pz-2', senderId: 'member-2', senderName: 'Bhavna Roy', content: 'Ready with the prototype showcase!', timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), type: 'text' }
  ],

  // ABC Technologies
  'abc-frontend-react': [
    { id: 'msg-ab-1', senderId: 'member-4', senderName: 'David Miller', content: 'PR #108 for the Design System Token update is awaiting review.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), type: 'text' },
    { id: 'msg-ab-2', senderId: 'user-1', senderName: 'Soumya', content: 'I reviewed the CSS variable contracts. Everything conforms to the design tokens.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(), type: 'text' },
    { id: 'msg-ab-3', senderId: 'member-5', senderName: 'Elena Rostova', content: 'Note: ABC enterprise policy enforces plain text without informal reactions in this channel.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(), type: 'text' }
  ],
  'abc-backend-node': [
    { id: 'msg-an-1', senderId: 'user-1', senderName: 'Soumya', content: 'GraphQL schemas for contextual users are deployed to staging.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(), type: 'text' }
  ],
  'ws-abc-root': [
    { id: 'msg-ar-1', senderId: 'member-4', senderName: 'HR Global', content: 'All hands company meeting scheduled for Friday 4 PM GMT.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), type: 'text' }
  ]
};

export const sampleMembers = [
  { id: 'member-1', name: 'Prof. Anirudh Sen', username: 'anirudh.sen', role: 'workspace-owner' },
  { id: 'member-2', name: 'Bhavna Roy', username: 'bhavna.r', role: 'workspace-admin' },
  { id: 'member-3', name: 'Chetan Das', username: 'chetan.d', role: 'group-admin' },
  { id: 'member-4', name: 'David Miller', username: 'david.m', role: 'moderator' },
  { id: 'member-5', name: 'Elena Rostova', username: 'elena.r', role: 'member' },
  { id: 'user-1', name: 'Soumya Mohanty', username: 'soumya', role: 'member' }
];
