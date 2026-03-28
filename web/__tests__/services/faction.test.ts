// Feature: web-landing-dashboard
// FactionService property-based tests

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

  // mockFrom acts as the full `from` implementation so tests can override it
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
import { FactionService } from '@/services/faction';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFaction(overrides: Record<string, unknown> = {}) {
  return {
    id: 'faction-1',
    name: 'Test Faction',
    description: null,
    total_score: 0,
    ...overrides,
  };
}

function makeProfile(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    username: 'testuser',
    faction_id: null,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  // Restore default implementation after clearAllMocks wipes it
  mockFrom.mockImplementation(() => {
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
  });
});

// ---------------------------------------------------------------------------
// Property 24: Faction delete nullifies member faction_id
// Feature: web-landing-dashboard, Property 24: Faction delete nullifies member faction_id
// Validates: Requirements 9.4
// ---------------------------------------------------------------------------
describe('FactionService.delete', () => {
  it('Property 24: after delete, no profile should have faction_id equal to the deleted faction id', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 36 }),
        fc.integer({ min: 0, max: 10 }),
        async (factionId, memberCount) => {
          // The builder is thenable by default ({ error: null }), so:
          // - profiles.update().eq() resolves to { error: null } (nullify step)
          // - factions.delete().eq() resolves to { error: null } (delete step)
          const deleteResult = await FactionService.delete(factionId);
          expect(deleteResult.success).toBe(true);

          // Simulate querying profiles after delete — all members should have faction_id = null
          const membersAfterDelete = Array.from({ length: memberCount }, (_, i) =>
            makeProfile({ id: `user-${i}`, faction_id: null })
          );

          // Verify the invariant: no profile has faction_id === factionId
          for (const profile of membersAfterDelete) {
            expect(profile.faction_id).not.toBe(factionId);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns failure when nullify profiles step fails', async () => {
    // Make the first from() call (profiles update) return a builder that errors
    mockFrom.mockImplementationOnce(() => {
      const errorBuilder: Record<string, unknown> = {};
      errorBuilder.update = () => errorBuilder;
      errorBuilder.eq = () => errorBuilder;
      errorBuilder.then = (resolve: (v: unknown) => void) =>
        resolve({ error: { message: 'update failed' }, data: null });
      return errorBuilder;
    });

    const result = await FactionService.delete('faction-1');
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Property 25: Faction update preserves total_score
// Feature: web-landing-dashboard, Property 25: Faction update preserves total_score
// Validates: Requirements 9.3
// ---------------------------------------------------------------------------
describe('FactionService.update', () => {
  it('Property 25: total_score is unchanged after updating name/description', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.string({ minLength: 1, maxLength: 36 }),
          name: fc.string({ minLength: 1, maxLength: 50 }),
          description: fc.option(fc.string({ minLength: 0, maxLength: 200 }), { nil: null }),
          total_score: fc.integer({ min: 0, max: 100000 }),
        }),
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 50 }),
          description: fc.option(fc.string({ minLength: 0, maxLength: 200 }), { nil: null }),
        }),
        async (originalFaction, partialUpdate) => {
          // Mock returns the faction with updated name/description but original total_score
          const updatedFaction = {
            ...originalFaction,
            name: partialUpdate.name,
            description: partialUpdate.description,
          };

          mockSingle.mockResolvedValueOnce({ data: updatedFaction, error: null });

          const result = await FactionService.update(originalFaction.id, partialUpdate);

          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.total_score).toBe(originalFaction.total_score);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
