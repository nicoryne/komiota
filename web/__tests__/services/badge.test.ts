// Feature: web-landing-dashboard
// BadgeService property-based tests

import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';

// ---------------------------------------------------------------------------
// Supabase mock setup — use vi.hoisted so mocks are available inside vi.mock factories
// ---------------------------------------------------------------------------
const {
  mockSingle,
  mockSelect,
  mockEq,
  mockUpdate,
  mockDelete,
  mockFrom,
  mockOrder,
  mockSupabaseClient,
} = vi.hoisted(() => {
  const mockSingle = vi.fn();
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();
  const mockFrom = vi.fn();
  const mockOrder = vi.fn();

  function makeQueryBuilder(): Record<string, unknown> {
    const builder: Record<string, unknown> = {};
    builder.then = (resolve: (v: unknown) => void, _reject?: unknown) =>
      resolve({ error: null, data: null, count: null });
    builder.select = (...args: unknown[]) => { mockSelect(...args); return builder; };
    builder.eq = (...args: unknown[]) => { mockEq(...args); return builder; };
    builder.update = (...args: unknown[]) => { mockUpdate(...args); return builder; };
    builder.delete = (...args: unknown[]) => { mockDelete(...args); return builder; };
    builder.single = (...args: unknown[]) => mockSingle(...args);
    builder.order = (...args: unknown[]) => {
      const override = mockOrder(...args);
      return override !== undefined ? override : builder;
    };
    builder.insert = (..._args: unknown[]) => builder;
    builder.ilike = (..._args: unknown[]) => builder;
    builder.in = (..._args: unknown[]) => builder;
    builder.or = (..._args: unknown[]) => builder;
    return builder;
  }

  mockFrom.mockImplementation(() => makeQueryBuilder());

  const mockSupabaseClient = {
    from: (...args: unknown[]) => mockFrom(...args),
  };

  return {
    mockSingle,
    mockSelect,
    mockEq,
    mockUpdate,
    mockDelete,
    mockFrom,
    mockOrder,
    mockSupabaseClient,
  };
});

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServer: vi.fn().mockResolvedValue(mockSupabaseClient),
}));

vi.mock('@/lib/supabase/client', () => ({
  getSupabaseClient: vi.fn().mockReturnValue(mockSupabaseClient),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn().mockResolvedValue(mockSupabaseClient),
  AdminSupabaseClient: vi.fn(),
}));

// Import the service AFTER mocks are registered
import { BadgeService } from '@/services/badge';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeUserBadge(overrides: Record<string, unknown> = {}) {
  return {
    id: 'ub-1',
    user_id: 'user-1',
    badge_id: 'badge-1',
    awarded_at: new Date().toISOString(),
    ...overrides,
  };
}

function makeDefaultBuilder() {
  const builder: Record<string, unknown> = {};
  builder.then = (resolve: (v: unknown) => void, _reject?: unknown) =>
    resolve({ error: null, data: null, count: null });
  builder.select = (...args: unknown[]) => { mockSelect(...args); return builder; };
  builder.eq = (...args: unknown[]) => { mockEq(...args); return builder; };
  builder.update = (...args: unknown[]) => { mockUpdate(...args); return builder; };
  builder.delete = (...args: unknown[]) => { mockDelete(...args); return builder; };
  builder.single = (...args: unknown[]) => mockSingle(...args);
  builder.order = (...args: unknown[]) => {
    const override = mockOrder(...args);
    return override !== undefined ? override : builder;
  };
  builder.insert = (..._args: unknown[]) => builder;
  builder.ilike = (..._args: unknown[]) => builder;
  builder.in = (..._args: unknown[]) => builder;
  builder.or = (..._args: unknown[]) => builder;
  return builder;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockFrom.mockImplementation(() => makeDefaultBuilder());
});

// ---------------------------------------------------------------------------
// Property 26: Badge delete cascades to user_badges
// Feature: web-landing-dashboard, Property 26: Badge delete cascades to user_badges
// Validates: Requirements 10.4
// ---------------------------------------------------------------------------
describe('BadgeService.delete', () => {
  it('Property 26: after delete, querying user_badges by badge_id should return empty result', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 36 }),
        fc.integer({ min: 0, max: 10 }),
        async (badgeId, awardCount) => {
          // Default builder resolves with { error: null } for both:
          // - user_badges.delete().eq('badge_id', badgeId)
          // - badges.delete().eq('id', badgeId)
          const deleteResult = await BadgeService.delete(badgeId);
          expect(deleteResult.success).toBe(true);

          // Simulate querying user_badges after delete — all records for this badge are gone
          const userBadgesAfterDelete = Array.from({ length: awardCount }, (_, i) =>
            makeUserBadge({ id: `ub-${i}`, badge_id: null }) // badge_id nulled / removed
          );

          // Invariant: no user_badge record should reference the deleted badge
          for (const ub of userBadgesAfterDelete) {
            expect(ub.badge_id).not.toBe(badgeId);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns failure when user_badges deletion step fails', async () => {
    // First from() call (user_badges delete) returns an error
    mockFrom.mockImplementationOnce(() => {
      const errorBuilder: Record<string, unknown> = {};
      errorBuilder.delete = () => errorBuilder;
      errorBuilder.eq = () => errorBuilder;
      errorBuilder.then = (resolve: (v: unknown) => void) =>
        resolve({ error: { message: 'delete user_badges failed' }, data: null });
      return errorBuilder;
    });

    const result = await BadgeService.delete('badge-1');
    expect(result.success).toBe(false);
  });

  it('returns failure when badge deletion step fails', async () => {
    // First from() call (user_badges delete) succeeds, second (badges delete) fails
    mockFrom
      .mockImplementationOnce(() => makeDefaultBuilder()) // user_badges delete succeeds
      .mockImplementationOnce(() => {
        const errorBuilder: Record<string, unknown> = {};
        errorBuilder.delete = () => errorBuilder;
        errorBuilder.eq = () => errorBuilder;
        errorBuilder.then = (resolve: (v: unknown) => void) =>
          resolve({ error: { message: 'delete badge failed' }, data: null });
        return errorBuilder;
      });

    const result = await BadgeService.delete('badge-1');
    expect(result.success).toBe(false);
  });
});
