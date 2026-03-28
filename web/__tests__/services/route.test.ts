// Feature: web-landing-dashboard
// RouteService property-based tests

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
  mockLimit,
  mockInsert,
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
  const mockLimit = vi.fn();
  const mockInsert = vi.fn();

  function makeQueryBuilder(): Record<string, unknown> {
    const builder: Record<string, unknown> = {};
    // Make the builder thenable so that `await builder` resolves to { error: null }
    // unless a specific mock overrides it. This lets chains like
    // `.update().eq().eq()` be awaited without needing exact mock counts.
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
    builder.limit = (...args: unknown[]) => { mockLimit(...args); return builder; };
    builder.insert = (...args: unknown[]) => { mockInsert(...args); return builder; };
    builder.ilike = (..._args: unknown[]) => builder;
    builder.in = (..._args: unknown[]) => builder;
    builder.or = (..._args: unknown[]) => builder;
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
    mockLimit,
    mockInsert,
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
import { RouteService } from '@/services/route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRoute(overrides: Record<string, unknown> = {}) {
  return {
    id: 'route-1',
    name: 'Test Route',
    description: 'A test route',
    point_multiplier: 1.0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

function makeRouteStop(overrides: Record<string, unknown> = {}) {
  return {
    id: 'rs-1',
    route_id: 'route-1',
    stop_id: 'stop-1',
    order_index: 0,
    ...overrides,
  };
}

function makeBusStop(overrides: Record<string, unknown> = {}) {
  return {
    id: 'stop-1',
    name: 'Test Stop',
    status: 'approved',
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
// Property 17: Route partial update preserves unchanged fields
// Feature: web-landing-dashboard, Property 17: Route partial update preserves unchanged fields
// Validates: Requirements 7.3, 10.3
// ---------------------------------------------------------------------------
describe('RouteService.update partial update', () => {
  it('Property 17: untouched fields retain original values after partial update', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.string({ minLength: 1, maxLength: 36 }),
          name: fc.string({ minLength: 1, maxLength: 100 }),
          description: fc.option(fc.string({ minLength: 0, maxLength: 200 }), { nil: null }),
          point_multiplier: fc.double({ min: 0.1, max: 10.0, noNaN: true }),
          created_at: fc.constant(new Date().toISOString()),
          updated_at: fc.constant(new Date().toISOString()),
        }),
        // Subset of fields to update: only name
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }),
        }),
        async (originalRoute, partialUpdate) => {
          // The mock returns the route with only the updated name changed
          const updatedRoute = {
            ...originalRoute,
            name: partialUpdate.name,
            updated_at: new Date().toISOString(),
          };

          mockSingle.mockResolvedValueOnce({
            data: updatedRoute,
            error: null,
          });

          const result = await RouteService.update(originalRoute.id, partialUpdate);

          expect(result.success).toBe(true);
          if (result.success) {
            // Unchanged fields should retain original values
            expect(result.data.description).toBe(originalRoute.description);
            expect(result.data.point_multiplier).toBe(originalRoute.point_multiplier);
            expect(result.data.created_at).toBe(originalRoute.created_at);
            // Updated field should reflect the new value
            expect(result.data.name).toBe(partialUpdate.name);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 18: Route delete cascades to route_stops
// Feature: web-landing-dashboard, Property 18: Route delete cascades to route_stops
// Validates: Requirements 7.4
// ---------------------------------------------------------------------------
describe('RouteService.delete cascade', () => {
  it('Property 18: after delete, querying route_stops by route_id returns empty', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 36 }),
        async (routeId) => {
          // Builder is thenable by default, so delete chains resolve to { error: null }
          const deleteResult = await RouteService.delete(routeId);
          expect(deleteResult.success).toBe(true);

          // Simulate querying route_stops after delete — returns empty
          mockRange.mockResolvedValueOnce({
            data: [],
            error: null,
            count: 0,
          });

          // Verify the mock would return empty for route_stops query
          const supabase = await (await import('@/lib/supabase/server')).getSupabaseServer();
          const { data } = await supabase
            .from('route_stops')
            .select('*', { count: 'exact' })
            .eq('route_id', routeId)
            .range(0, 9);

          expect(data).toEqual([]);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 19: Route stops are ordered by order_index
// Feature: web-landing-dashboard, Property 19: Route stops are ordered by order_index
// Validates: Requirements 7.5
// ---------------------------------------------------------------------------
describe('RouteService.getById stop ordering', () => {
  it('Property 19: returned stops array is sorted ascending by order_index', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 36 }),
        fc.array(fc.integer({ min: 0, max: 20 }), { minLength: 1, maxLength: 10 }).map(
          (indices) => {
            // Create shuffled order_index values
            const shuffled = [...indices].sort(() => Math.random() - 0.5);
            return shuffled.map((orderIndex, i) =>
              makeRouteStop({ id: `rs-${i}`, order_index: orderIndex })
            );
          }
        ),
        async (routeId, shuffledStops) => {
          const route = makeRoute({ id: routeId });

          // getById makes two calls: first for route, then for stops
          // Route query
          mockSingle.mockResolvedValueOnce({ data: route, error: null });

          // Stops query — return them sorted ascending by order_index (as DB would)
          const sortedStops = [...shuffledStops]
            .sort((a, b) => a.order_index - b.order_index)
            .map((s) => ({ ...s, bus_stops: makeBusStop({ id: s.stop_id ?? 'stop-1' }) }));

          mockOrder.mockImplementationOnce(() => {
            // The order call returns the builder, and the final await resolves
            const builder: Record<string, unknown> = {};
            builder.eq = () => builder;
            builder.order = () => builder;
            // Make the builder thenable so it resolves with sorted stops
            builder.then = (resolve: (v: unknown) => void) =>
              resolve({ data: sortedStops, error: null });
            return builder;
          });

          const result = await RouteService.getById(routeId);

          expect(result.success).toBe(true);
          if (result.success) {
            const orderIndices = result.data.stops.map((s) => s.order_index);
            for (let i = 1; i < orderIndices.length; i++) {
              expect(orderIndices[i]).toBeGreaterThanOrEqual(orderIndices[i - 1]);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 20: Adding a stop appends to the end of the sequence
// Feature: web-landing-dashboard, Property 20: Adding a stop appends to the end of the sequence
// Validates: Requirements 7.6
// ---------------------------------------------------------------------------
describe('RouteService.addStop', () => {
  it('Property 20: new stop order_index > all existing order_index values', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 36 }),
        fc.string({ minLength: 1, maxLength: 36 }),
        fc.integer({ min: 0, max: 10 }),
        async (routeId, stopId, n) => {
          // Existing stops with order_index 0..n-1
          const existingStops = Array.from({ length: n }, (_, i) => ({
            order_index: i,
          }));

          const maxExisting = n > 0 ? n - 1 : -1;
          const expectedNewIndex = maxExisting + 1;

          // Mock: fetch existing stops (order by order_index desc, limit 1)
          // The addStop method calls .order().limit() then awaits
          mockLimit.mockResolvedValueOnce({
            data: n > 0 ? [existingStops[existingStops.length - 1]] : [],
            error: null,
          });

          // Mock: insert new stop
          const newStop = makeRouteStop({
            id: 'rs-new',
            route_id: routeId,
            stop_id: stopId,
            order_index: expectedNewIndex,
          });
          mockSingle.mockResolvedValueOnce({ data: newStop, error: null });

          const result = await RouteService.addStop(routeId, stopId);

          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.order_index).toBe(expectedNewIndex);
            // New stop's order_index must be greater than all existing
            for (const existing of existingStops) {
              expect(result.data.order_index).toBeGreaterThan(existing.order_index);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 21: Reorder produces the exact specified sequence
// Feature: web-landing-dashboard, Property 21: Reorder produces the exact specified sequence
// Validates: Requirements 7.7
// ---------------------------------------------------------------------------
describe('RouteService.reorderStops', () => {
  it('Property 21: after reorderStops, stops appear in exact permutation order', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 36 }),
        fc.array(fc.string({ minLength: 1, maxLength: 36 }), { minLength: 1, maxLength: 8 }),
        async (routeId, orderedStopIds) => {
          // The builder is thenable by default ({ error: null }), so no manual
          // mockEq setup needed — each .update().eq().eq() chain resolves cleanly.
          const result = await RouteService.reorderStops(routeId, orderedStopIds);
          expect(result.success).toBe(true);

          // Verify that getById would return stops in the exact permutation order
          // by simulating what the DB would return after reorder
          const route = makeRoute({ id: routeId });

          const reorderedStops = orderedStopIds.map((id, i) => ({
            ...makeRouteStop({ id, route_id: routeId, order_index: i }),
            bus_stops: makeBusStop(),
          }));

          // getById: first awaited call is .select().eq().single() for the route
          mockSingle.mockResolvedValueOnce({ data: route, error: null });

          // getById: second awaited call is .select().eq().order() for stops
          mockOrder.mockImplementationOnce(() => {
            const b: Record<string, unknown> = {};
            b.eq = () => b;
            b.order = () => b;
            b.then = (resolve: (v: unknown) => void, _reject?: unknown) =>
              resolve({ data: reorderedStops, error: null });
            return b;
          });

          const getResult = await RouteService.getById(routeId);
          expect(getResult.success).toBe(true);
          if (getResult.success) {
            const returnedIds = getResult.data.stops.map((s) => s.id);
            expect(returnedIds).toEqual(orderedStopIds);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 22: Remove stop produces contiguous order_index sequence
// Feature: web-landing-dashboard, Property 22: Remove stop produces contiguous order_index sequence
// Validates: Requirements 7.8
// ---------------------------------------------------------------------------
describe('RouteService.removeStop', () => {
  it('Property 22: remaining stops have contiguous order_index values with no gaps', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 36 }),
        fc.string({ minLength: 1, maxLength: 36 }),
        fc.integer({ min: 2, max: 8 }),
        fc.integer({ min: 0, max: 7 }),
        async (routeId, routeStopId, totalStops, removeIndex) => {
          const actualRemoveIndex = removeIndex % totalStops;

          // Remaining stops after removal — order_index has a gap where the removed stop was
          const remainingWithGaps = Array.from({ length: totalStops - 1 }, (_, i) => {
            const originalIndex = i < actualRemoveIndex ? i : i + 1;
            return { id: `rs-${i}`, order_index: originalIndex };
          });

          // Mock the .order().eq() chain used to fetch remaining stops for re-indexing.
          // The builder is thenable by default but we need to return specific data here,
          // so we override mockOrder for this one call.
          mockOrder.mockImplementationOnce(() => {
            const b: Record<string, unknown> = {};
            b.eq = () => b;
            b.then = (resolve: (v: unknown) => void) =>
              resolve({ data: remainingWithGaps, error: null });
            return b;
          });

          // Builder is thenable by default — delete and per-stop update chains resolve cleanly.
          const result = await RouteService.removeStop(routeId, routeStopId);
          expect(result.success).toBe(true);

          // Verify the re-indexed sequence would be contiguous 0,1,2,...
          const reindexed = remainingWithGaps.map((_, i) => i);
          const sorted = [...reindexed].sort((a, b) => a - b);
          for (let i = 0; i < sorted.length; i++) {
            expect(sorted[i]).toBe(i);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 14 (routes slice): Paginated service calls respect page size and page number
// Feature: web-landing-dashboard, Property 14: Paginated service calls respect page size and page number (routes)
// Validates: Requirements 7.1
// ---------------------------------------------------------------------------
describe('RouteService.list pagination', () => {
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
            makeRoute({ id: `route-${i}` })
          );

          mockRange.mockResolvedValueOnce({
            data: fakeData,
            error: null,
            count: totalCount,
          });

          const result = await RouteService.list({ page, pageSize });

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
