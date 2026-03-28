// Feature: web-landing-dashboard
// BusStopService property-based tests

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
    builder.select = (...args: unknown[]) => { mockSelect(...args); return builder; };
    builder.eq = (...args: unknown[]) => { mockEq(...args); return builder; };
    builder.update = (...args: unknown[]) => { mockUpdate(...args); return builder; };
    builder.delete = (...args: unknown[]) => { mockDelete(...args); return builder; };
    builder.single = (...args: unknown[]) => mockSingle(...args);
    builder.range = (...args: unknown[]) => mockRange(...args);
    builder.order = (...args: unknown[]) => { mockOrder(...args); return builder; };
    builder.or = (...args: unknown[]) => { mockOr(...args); return builder; };
    builder.insert = (..._args: unknown[]) => builder;
    builder.ilike = (..._args: unknown[]) => builder;
    builder.in = (..._args: unknown[]) => builder;
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
  createAdminClient: vi.fn().mockResolvedValue(mockSupabaseClient),
  AdminSupabaseClient: vi.fn(),
}));

// Import the service AFTER mocks are registered
import { BusStopService } from '@/services/bus-stop';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeBusStop(overrides: Record<string, unknown> = {}) {
  return {
    id: 'stop-1',
    name: 'Test Stop',
    status: 'pending',
    location: null,
    image_url: null,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Property 8: Bus stop status update reflects the requested decision
// Feature: web-landing-dashboard, Property 8: Bus stop status update reflects the requested decision
// Validates: Requirements 6.5, 6.6
// ---------------------------------------------------------------------------
describe('BusStopService.updateStatus', () => {
  it('Property 8: status update reflects the requested decision', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.constantFrom('approved' as const, 'rejected' as const),
        async (id, status) => {
          mockSingle.mockResolvedValueOnce({
            data: makeBusStop({ id, status }),
            error: null,
          });

          const result = await BusStopService.updateStatus(id, status);

          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.status).toBe(status);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns failure when Supabase returns an error', async () => {
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'not found' },
    });

    const result = await BusStopService.updateStatus('missing-id', 'approved');
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Property 9: Bus stop delete removes the record
// Feature: web-landing-dashboard, Property 9: Bus stop delete removes the record
// Validates: Requirements 6.9
// ---------------------------------------------------------------------------
describe('BusStopService.delete', () => {
  it('Property 9: after delete, getById returns success: false', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }),
        async (id) => {
          // delete: the chain ends with .eq() which the service awaits directly
          mockEq.mockResolvedValueOnce({ error: null });

          // getById: record not found after delete
          mockSingle.mockResolvedValueOnce({
            data: null,
            error: { message: 'not found' },
          });

          const deleteResult = await BusStopService.delete(id);
          expect(deleteResult.success).toBe(true);

          const getResult = await BusStopService.getById(id);
          expect(getResult.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 14: Paginated service calls respect page size and page number
// Feature: web-landing-dashboard, Property 14: Paginated service calls respect page size and page number
// Validates: Requirements 6.1
// ---------------------------------------------------------------------------
describe('BusStopService.list pagination', () => {
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
            makeBusStop({ id: `stop-${i}` })
          );

          mockRange.mockResolvedValueOnce({
            data: fakeData,
            error: null,
            count: totalCount,
          });

          const result = await BusStopService.list({ page, pageSize });

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
// Property 15: Status filter returns only matching bus stops
// Feature: web-landing-dashboard, Property 15: Status filter returns only matching bus stops
// Validates: Requirements 6.2
// ---------------------------------------------------------------------------
describe('BusStopService.list status filter', () => {
  it('Property 15: every returned record has status === requested status', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('pending' as const, 'approved' as const, 'rejected' as const),
        async (status) => {
          const fakeData = Array.from({ length: 3 }, (_, i) =>
            makeBusStop({ id: `stop-${i}`, status })
          );

          mockRange.mockResolvedValueOnce({
            data: fakeData,
            error: null,
            count: fakeData.length,
          });

          const result = await BusStopService.list({
            page: 1,
            pageSize: 10,
            filters: { status },
          });

          expect(result.success).toBe(true);
          if (result.success) {
            for (const record of result.data.data) {
              expect(record.status).toBe(status);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 16: Name search returns only matching records
// Feature: web-landing-dashboard, Property 16: Name search returns only matching records
// Validates: Requirements 6.3
// ---------------------------------------------------------------------------
describe('BusStopService.list name search', () => {
  it('Property 16: every returned record name contains the search query (case-insensitive)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
        async (q) => {
          const fakeData = [
            makeBusStop({ id: 'stop-1', name: `prefix ${q} suffix` }),
            makeBusStop({ id: 'stop-2', name: q.toUpperCase() }),
          ];

          mockRange.mockResolvedValueOnce({
            data: fakeData,
            error: null,
            count: fakeData.length,
          });

          const result = await BusStopService.list({
            page: 1,
            pageSize: 10,
            searchQuery: q,
            searchableFields: ['name'],
          });

          expect(result.success).toBe(true);
          if (result.success) {
            for (const record of result.data.data) {
              expect(record.name.toLowerCase()).toContain(q.toLowerCase());
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
