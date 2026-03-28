# Dashboard Pattern Implementation

This document summarizes the implementation of the dashboard architecture pattern for the Komiota web application.

## What Was Implemented

### 1. Core Infrastructure

- **React Query Setup** (`@tanstack/react-query`)
  - `web/lib/query-client.ts` - Query client configuration
  - `web/components/providers/query-provider.tsx` - Provider wrapper
  - Integrated into `web/app/layout.tsx`

- **Table State Management**
  - `web/hooks/use-table.ts` - Generic table state hook with pagination, sorting, search, and filters

### 2. Entity-Specific Hooks

Following the pattern's consolidated hook approach:

- **`web/hooks/use-badges.ts`**
  - Fetches badge data with React Query
  - Provides `createBadge`, `updateBadge`, `deleteBadge` mutations
  - Automatic cache invalidation on mutations
  - Toast notifications for user feedback

- **`web/hooks/use-factions.ts`**
  - Fetches faction data with React Query
  - Provides `createFaction`, `updateFaction`, `deleteFaction` mutations
  - Automatic cache invalidation on mutations
  - Toast notifications for user feedback

### 3. UI Components

- **Column Definitions**
  - `web/components/dashboard/badges/badge-columns.tsx` - Badge table columns
  - `web/components/dashboard/factions/faction-columns.tsx` - Faction table columns

- **Modal Components**
  - `web/components/dashboard/badges/badge-modal.tsx` - Add/Edit badge modal with Zod validation
  - `web/components/dashboard/factions/faction-modal.tsx` - Add/Edit faction modal with Zod validation

- **Enhanced DataTable**
  - Updated `web/components/dashboard/data-table.tsx` to support:
    - Row actions (edit, delete, etc.)
    - Add button
    - Custom page change handlers
    - Flexible action rendering

- **Enhanced ConfirmDialog**
  - Updated `web/components/dashboard/confirm-dialog.tsx` to support:
    - Both trigger-based and controlled open modes
    - Async confirmation handlers

### 4. Refactored Pages

- **`web/app/dashboard/badges/page.tsx`**
  - Converted to client component
  - Uses `useBadges` hook for data and mutations
  - Modal-based add/edit workflow
  - Inline actions (edit, delete)
  - No more separate form pages needed

- **`web/app/dashboard/factions/page.tsx`**
  - Converted to client component
  - Uses `useFactions` hook for data and mutations
  - Modal-based add/edit workflow
  - Inline actions (edit, delete)
  - No more separate form pages needed

## Key Benefits

1. **Separation of Concerns**
   - Data fetching logic in hooks
   - UI rendering in components
   - Business logic in services
   - Server actions for mutations

2. **Type Safety**
   - End-to-end TypeScript types
   - Zod validation in modals
   - Generic table components

3. **Optimistic UI Updates**
   - React Query cache invalidation
   - Automatic refetching after mutations
   - Loading states for better UX

4. **Declarative Modals**
   - Single modal for add/edit
   - Mode-based rendering
   - Form state management

5. **Reusable Components**
   - Generic `useTable` hook
   - Flexible `DataTable` component
   - Consistent modal patterns

## Pattern Alignment

This implementation follows the dashboard-pattern.md principles:

✅ Centralized route configuration (already in place)
✅ Reusable data table components
✅ Table state hook (`useTable`)
✅ Consolidated entity hooks (React Query)
✅ Modal-based CRUD operations
✅ Server actions for data mutations
✅ Type safety end-to-end
✅ Optimistic cache strategy

## Next Steps

To apply this pattern to other entities (routes, bus-stops, accounts):

1. Create entity-specific hook in `web/hooks/use-{entity}.ts`
2. Create column definitions in `web/components/dashboard/{entity}/{entity}-columns.tsx`
3. Create modal component in `web/components/dashboard/{entity}/{entity}-modal.tsx`
4. Update page to use the hook and modal pattern
5. Remove old form pages if they exist

## Notes

- The toast utility (`web/lib/toast.ts`) is a placeholder. Consider integrating a proper toast library like `sonner` or `react-hot-toast` for production.
- Server actions already exist and work well with this pattern.
- Services layer remains unchanged and continues to handle database operations.
