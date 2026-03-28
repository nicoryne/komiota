export type UserRole = 'admin' | 'moderator' | 'user';

export type AuthCheckResult = {
  authenticated: boolean;
  authorized: boolean;
  error?: string;
  userRole?: UserRole;
  userRoles?: string[];
};

export type LoginResult = {
  success: boolean;
  error?: string;
  userRole?: UserRole;
};
