/**
 * Route configuration for Komiota Web Application
 * Defines public and protected routes for middleware handling
 */

// Public routes that don't require authentication
export const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/no-access',
  '/favicon.ico',
  '/sitemap.xml',
  '/robots.txt',
] as const;

// Protected routes that require authentication (admin or moderator)
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/dashboard/bus-stops',
  '/dashboard/bus-stops/[id]',
  '/dashboard/routes',
  '/dashboard/routes/[id]',
  '/dashboard/accounts',
  '/dashboard/accounts/[id]',
  '/dashboard/factions',
  '/dashboard/badges',
] as const;

// Route patterns for dynamic matching
export const ROUTE_PATTERNS = {
  public: [
    /^\/$/,
    /^\/login$/,
    /^\/no-access$/,
    /^\/favicon\.ico$/,
    /^\/sitemap\.xml$/,
    /^\/robots\.txt$/,
  ],
  protected: [
    /^\/dashboard$/,
    /^\/dashboard\/bus-stops$/,
    /^\/dashboard\/bus-stops\/[^/]+$/, // /dashboard/bus-stops/[id]
    /^\/dashboard\/routes$/,
    /^\/dashboard\/routes\/[^/]+$/, // /dashboard/routes/[id]
    /^\/dashboard\/accounts$/,
    /^\/dashboard\/accounts\/[^/]+$/, // /dashboard/accounts/[id]
    /^\/dashboard\/factions$/,
    /^\/dashboard\/badges$/,
  ],
} as const;

// Role → default dashboard redirect
export const ROLE_DASHBOARDS = {
  admin: '/dashboard',
  moderator: '/dashboard',
} as const;

// Role-based route access patterns
export const ROLE_ROUTES = {
  // Admins can access all dashboard routes
  admin: [/^\/dashboard/],
  // Moderators can only access overview and bus stops
  moderator: [/^\/dashboard$/, /^\/dashboard\/bus-stops/],
} as const;

// Helper functions
export function isPublicRoute(pathname: string): boolean {
  return ROUTE_PATTERNS.public.some((pattern) => pattern.test(pathname));
}

export function isProtectedRoute(pathname: string): boolean {
  return ROUTE_PATTERNS.protected.some((pattern) => pattern.test(pathname));
}

export function isKnownRoute(pathname: string): boolean {
  return isPublicRoute(pathname) || isProtectedRoute(pathname);
}

export function hasAccessToRoute(pathname: string, userRole: string): boolean {
  const roleRoutes = ROLE_ROUTES[userRole as keyof typeof ROLE_ROUTES];
  if (!roleRoutes) return false;
  return roleRoutes.some((pattern) => pattern.test(pathname));
}

export function getRedirectUrl(pathname: string, userRole?: string): string {
  // Authenticated admin/moderator visiting login → send to dashboard
  if (pathname === '/login') {
    if (userRole && userRole in ROLE_DASHBOARDS) {
      return ROLE_DASHBOARDS[userRole as keyof typeof ROLE_DASHBOARDS];
    }
    return '/';
  }

  // Unknown routes → not-found
  if (!isKnownRoute(pathname)) {
    return '/not-found';
  }

  return pathname;
}
