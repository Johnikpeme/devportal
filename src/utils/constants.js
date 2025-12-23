export const PROJECT_STATUS = {
  PRE_PRODUCTION: 'pre-production',
  PRODUCTION: 'production',
  IN_DEVELOPMENT: 'in-development',
  TESTING: 'testing',
  COMPLETED: 'completed',
  ON_HOLD: 'on-hold',
};

export const PROJECT_STATUS_LABELS = {
  [PROJECT_STATUS.PRE_PRODUCTION]: 'Pre-Production',
  [PROJECT_STATUS.PRODUCTION]: 'Production',
  [PROJECT_STATUS.IN_DEVELOPMENT]: 'In Development',
  [PROJECT_STATUS.TESTING]: 'Testing',
  [PROJECT_STATUS.COMPLETED]: 'Completed',
  [PROJECT_STATUS.ON_HOLD]: 'On Hold',
};

export const PROJECT_STATUS_COLORS = {
  [PROJECT_STATUS.PRE_PRODUCTION]: 'bg-yellow-100 text-yellow-700',
  [PROJECT_STATUS.PRODUCTION]: 'bg-blue-100 text-blue-700',
  [PROJECT_STATUS.IN_DEVELOPMENT]: 'bg-green-100 text-green-700',
  [PROJECT_STATUS.TESTING]: 'bg-purple-100 text-purple-700',
  [PROJECT_STATUS.COMPLETED]: 'bg-gray-100 text-gray-700',
  [PROJECT_STATUS.ON_HOLD]: 'bg-red-100 text-red-700',
};

export const BUG_PRIORITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

export const BUG_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in-progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  WONT_FIX: 'wont-fix',
};

export const USER_ROLES = {
  SUPERUSER: 'superuser',
  DEVELOPER: 'developer',
  QA: 'qa',
  DESIGNER: 'designer',
  VIEWER: 'viewer',
};

export const MILESTONE_STATUS = {
  COMPLETED: 'completed',
  IN_PROGRESS: 'in-progress',
  UPCOMING: 'upcoming',
  DELAYED: 'delayed',
};

export const PLATFORMS = ['PC', 'Console', 'Mobile', 'Web', 'VR'];

export const GENRES = [
  'Action',
  'Adventure',
  'RPG',
  'Strategy',
  'Simulation',
  'Sports',
  'Racing',
  'Puzzle',
  'Horror',
  'Platformer',
];