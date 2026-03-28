// Feature: web-landing-dashboard
// AccountService property-based tests

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
  mockRange,
  mockOrder,
  mockOr,
  mockSupabaseClient,
} = vi.hoisted(() => {
  const mockSingle = vi.fn();
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();
  const mockFrom = vi.fn();
  const mockRange = vi.fn();
  const mockOrder = vi.fn();
  const mockOr = vi.fn();

  function makeQueryBuilder(): Record<string, unknown> {
    const builder: Record<string, unknown> = {};
    builder.then = (resolve: (v: unknown) => void, _reject?: unknown) =>
      resolve({ error: null, data: null, count: null });
    builder.select = (...args: unknown[]) => { mockSelect(...args); return builder; };
    builder.eq = (...args: unknown[]) => { mockEq(...args); return builder; };
    builder.update = (...args: unknown[]) => { mockUpdate(...args); return builder; };
    builder.delete = (...args: unknown[]) => { mockDelete(...args); return builder; };
    builder.single = (...args: unknown[]) => mockSingle(...args);
    builder.range = (...args: unknown[]) => mockRange(...args);
    builder.order = (...args: unknown[]) => {
      const override = mockOrder(...args);
      return override !== undefined ? override : builder;
    };
    builder.or = (...args: unknown[]) => { mockOr(...args); return builder; };
    builder.ilike = (..._args: unknown[]) => builder;
    builder.in = (..._args: unknown[]) => builder;
    builder.insert = (..._args: unknown[]) => builder;
    return builder;
  }

  const mockSupabaseClient = {
    from: (...args: unknown[]) => {
      mockFrom(...args);
      return makeQueryBuilder();
    },
  };

  return {
    mockSingle,
    mockSelect,
    mockEq,
    mockUpdate,
    mockDelete,
    mockFrom,
    mockRange,
    mockOrder,
    mockOr,
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
  createAdminClient: vi.fn().mockReturnValue(mockSupabaseClient),
  AdminSupabaseClient: vi.fn(),
}));

// Import the service AFTER mocks are registered
import { AccountService } from '@/services/account';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeProfile(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    username: 'testuser',
    avatar_url: null,
    role: 'user',
    faction_id: null,
    commuter_score: 0,
    commuters_helped: 0,
    current_streak: 0,
    longest_streak: 0,
    onboarding_completed: false,
    rank_tier: null,
    total_distance_km: 0,
    total_trips: 0,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Property 23: Role update is reflected in the profile
// Feature: web-landing-dashboard, Property 23: Role update is reflected in the profile
// Validates: Requirements 8.4
// ---------------------------------------------------------------------------
describe('AccountService.updateRole', () => {
  it('Property 23: role update is reflected in the returned profile', async () => {
    await fc.assert(
      fc.asyncProperty(
        // target user id — must differ from requester
        fc.string({ minLength: 1, maxLength: 36 }).filter((s) => s !== 'requester-id'),
        fc.constantFrom('admin' as const, 'moderator' as const, 'user' as const),
        async (targetUserId, role) => {
          mockSingle.mockResolvedValueOnce({
            data: makeProfile({ id: targetUserId, role }),
            error: null,
          });

          const result = await AccountService.updateRole(targetUserId, role, 'requester-id');

          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.role).toBe(role);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns error when target user tries to self-demote', async () => {
    const userId = 'same-user';
    const result = await AccountService.updateRole(userId, 'moderator', userId);
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('allows self-update when new role is admin', async () => {
    const userId = 'same-user';
    mockSingle.mockResolvedValueOnce({
      data: makeProfile({ id: userId, role: 'admin' }),
      error: null,
    });

    const result = await AccountService.updateRole(userId, 'admin', userId);
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Property 14 (accounts slice): Pagination invariants
// Feature: web-landing-dashboard, Property 14: Paginated service calls respect page size and page number (accounts)
// Validates: Requirements 8.1
// ---------------------------------------------------------------------------
describe('AccountService.list pagination', () => {
  it('Property 14: data.length ≤ pageSize, currentPage === page, pageCount === ceil(totalCount/pageSize)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 50 }),
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 0, max: 200 }),
        async (pageSize, page, totalCount) => {
          const offset = (page - 1) * pageSize;
          const sliceSize = Math.min(pageSize, Math.max(0, totalCount - offset));
          const fakeData = Array.from({ length: sliceSize }, (_, i) =>
            makeProfile({ id: `user-${i}` })
          );

          mockRange.mockResolvedValueOnce({
            data: fakeData,
            error: null,
            count: totalCount,
          });

          const result = await AccountService.list({ page, pageSize });

          expect(result.success).toBe(true);
          if (result.success) {
            const { data, totalCount: tc, pageCount, currentPage } = result.data;
            expect(data.length).toBeLessThanOrEqual(pageSize);
            expect(currentPage).toBe(page);
            expect(pageCount).toBe(Math.ceil(tc / pageSize));
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 16 (accounts slice): Name search returns only matching records
// Feature: web-landing-dashboard, Property 16: Name search returns only matching records (accounts)
// Validates: Requirements 8.2
// ---------------------------------------------------------------------------
describe('AccountService.list username search', () => {
  it('Property 16: every returned profile username contains the search query (case-insensitive)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
        async (q) => {
          const fakeData = [
            makeProfile({ id: 'user-1', username: `prefix_${q}_suffix` }),
            makeProfile({ id: 'user-2', username: q.toUpperCase() }),
          ];

          mockRange.mockResolvedValueOnce({
            data: fakeData,
            error: null,
            count: fakeData.length,
          });

          const result = await AccountService.list({
            page: 1,
            pageSize: 10,
            searchQuery: q,
            searchableFields: ['username'],
          });

          expect(result.success).toBe(true);
          if (result.success) {
            for (const record of result.data.data) {
              expect((record.username ?? '').toLowerCase()).toContain(q.toLowerCase());
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
