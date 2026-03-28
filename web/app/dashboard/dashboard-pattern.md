# Admin Dashboard Architecture Pattern

This guide documents the comprehensive architecture pattern used for the Admin Dashboard. It covers data tables, entity management, client-side state, server actions, and route protection. Use this as a reference to replicate the pattern in other projects.

---

## 1. Directory Structure overview

The architecture separates concerns into distinct layers:

```
src/
├── app/(protected)/         # Protected Next.js App Router pages
│   └── [role]/              # Role-based dashboards (e.g., admin, head-writer)
│       └── [entity]/        # Entity management pages
├── components/
│   ├── admin/[entity]/      # Entity-specific UI (modals, column definitions)
│   ├── table/               # Reusable data table components
│   └── ui/                  # Generic UI components (shadcn/ui, modals)
├── hooks/                   # React Query and Table state hooks
├── actions/                 # Next.js Server Actions (CRUD operations)
├── lib/
│   ├── validations/         # Zod schemas for validation
│   ├── supabase/            # Supabase clients & middleware
│   └── routes.ts            # Centralized route & role definitions
└── services/                # Backend business logic and database access
```

---

## 2. Route Protection & Authorization

Route protection is handled gracefully through combination of centralized route definitions and Next.js middleware.

### Centralized Route Configuration ([lib/routes.ts](file:///home/nico/Code/cel-web/lib/routes.ts))
Define URLs utilizing regex patterns to support dynamic routes and establish role-based boundaries.

```typescript
// Define roles and boundaries cleanly
export const ROLE_DASHBOARDS = {
  admin: '/admin',
  league_operator: '/league-operator',
} as const;

export const ROLE_ROUTES = {
  admin: [/^\/admin/, /^\/preview/],
  league_operator: [/^\/league-operator/],
} as const;

export const ROUTE_PATTERNS = {
  public: [/^\/$/, /^\/login$/, /^\/api\/.*/],
  protected: [
    /^\/admin$/,
    /^\/admin\/users\/[^\/]+$/, // Regex handles dynamic segments easily
    /^\/league-operator$/
  ]
} as const;

// Helper functions for middleware consumption
export function isProtectedRoute(pathname: string) { /* ... */ }
export function hasAccessToRoute(pathname: string, userRole: string) { /* ... */ }
```

### Middleware ([middleware.ts](file:///home/nico/Code/cel-web/lib/supabase/middleware.ts))
Intercept requests, establish session securely, and validate role-based access before hitting application logic.

```typescript
import { createServerClient } from '@supabase/ssr';
import { isProtectedRoute, hasAccessToRoute, getRedirectUrl } from '@/lib/routes';

export const updateSession = async (request: NextRequest) => {
  // ... initialize Supabase client and retrieve user ...
  
  const url = request.nextUrl.pathname;
  const role = user?.app_metadata?.role;

  // 1. Protect routes requiring auth
  if (isProtectedRoute(url)) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url));
    
    // 2. Enforce Role-Based Access Control (RBAC)
    if (role && !hasAccessToRoute(url, role)) {
      return NextResponse.redirect(new URL('/no-access', request.url));
    }
  }

  // 3. Redirect authenticated users away from public auth pages
  if (user) {
    const redirectUrl = getRedirectUrl(url, role);
    if (redirectUrl !== url) return NextResponse.redirect(new URL(redirectUrl, request.url));
  }
}
```

---

## 3. Data Tables & Pagination

The application leverages a robust custom table implementation combining generic TypeScript definitions and configurable state using hooks.

### Reusable Data Table Components
Create generic UI components to render the table logic once: `DataTable`, `SortableHeader`, `TablePagination`, and `TableSearchFilters`. 

**Table Columns Definition Pattern**
Columns and row-actions are defined centrally per entity, separating UI logic from data representations.

```typescript
// src/components/admin/[entity]/[entity]-table-columns.tsx
import { TableColumn } from '@/lib/types/table';

export const getEntityTableColumns = (): TableColumn<EntityType>[] => [
  {
    key: 'name',
    header: 'Name',
    sortable: true,
    render: (entity) => <span className="font-medium">{entity.name}</span>
  },
  // ... More columns ...
];

export const getEntityTableActions = (onEdit, onDelete) => [
  { key: 'edit', label: 'Edit', icon: <Pencil />, onClick: onEdit },
  { key: 'delete', label: 'Delete', icon: <Trash2 />, onClick: onDelete }
];
```

### Table State Hook (`useTable`)
Extracted table state logic managing Pagination, Sorting, searching, and filtering values.

```typescript
export function useTable<T>({ initialPage = 1, initialPageSize = 10, initialSortBy }) {
  const [tableState, setTableState] = useState({
    page: initialPage,
    pageSize: initialPageSize,
    sortBy: initialSortBy,
    sortOrder: 'desc',
    search: '',
    filters: {}
  });

  // Calculate generic pagination options to supply to the server
  const paginationOptions = useMemo(() => ({
    page: tableState.page,
    limit: tableState.pageSize,
    sortBy: tableState.sortBy,
    sortOrder: tableState.sortOrder,
    search: tableState.search,
    filters: tableState.filters
  }), [tableState]);
  
  // Expose mutators ...
  return { tableState, setPage, setPageSize, setSortBy, setSearch, paginationOptions };
}
```

---

## 4. Entity Management Orchestration

Putting it all together involves an Entity Hook, a Modal, Server Actions, and the Page itself.

### A. The Consolidated Hook
Instead of scattering API calls locally, a single robust React Query Hook wraps our table data fetching and CRUD mutations.

```typescript
// src/hooks/use-entity.ts
export function useEntityTable() {
  const tableOps = useTable<Entity>({
    initialSortBy: 'created_at'
  });

  // 1. Fetch Paginated Data
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['entity', 'paginated', tableOps.paginationOptions],
    queryFn: () => getPaginatedEntities(tableOps.paginationOptions)
  });

  const queryClient = useQueryClient();

  // 2. Mutations (Create, Update, Delete)
  const createMutation = useMutation({
    mutationFn: createEntity,
    onSuccess: () => {
      toast.success('Created successfully');
      queryClient.invalidateQueries({ queryKey: ['entity'] });
    }
  });
  
  // Combine native table ops, payload data, and mutations into one interface
  return {
    ...tableOps,
    data: data?.data || [],
    totalCount: data?.totalCount || 0,
    loading: isLoading,
    createEntity: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
}
```

### B. The Add / Edit Modal Pattern
A reusable form modal utilizing generic `ModalLayout`, managing validation via Zod, and hooking into our consolidated hook's mutations.

```typescript
// src/components/admin/[entity]/[entity]-modal.tsx
export function EntityModal({ open, mode, entity, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // Reset form effectively on toggle
  useEffect(() => {
    if (open) setFormData(mode === 'edit' ? { ...entity } : {});
  }, [open, mode, entity]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const schema = mode === 'add' ? createSchema : updateSchema;
      const validated = schema.parse(formData);
      await onSubmit(validated);
    } catch (err) {
      if (err instanceof ZodError) { /* parse field errors */ }
    }
  };

  return (
    <ModalLayout open={open} title={mode === 'add' ? 'Add' : 'Edit'}>
      <form onSubmit={handleSubmit}>
         {/* Inputs... */}
      </form>
    </ModalLayout>
  );
}
```

### C. Server Actions
Data bridging is performed via Next.js Server Actions connecting to the database services and invalidating cache via `.revalidatePath()`.

```typescript
// src/actions/entity.ts
'use server';
import { revalidatePath } from 'next/cache';

export async function getPaginatedEntities(options: PaginationOptions) {
  return await EntityService.getPaginated(options);
}

export async function createEntity(data: EntityInsert) {
  const result = await EntityService.insert(data);
  if (result.success) revalidatePath('/admin/entity'); 
  return result;
}
```

### D. The Consolidated Page
The page integrates the table UI, the hooks for state and data, and the modals cleanly without business logic bloat.

```typescript
// src/app/(protected)/admin/entity/page.tsx
'use client';

export default function EntityPage() {
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState(null);

  const {
    data, totalCount, loading,
    createEntity, updateEntity, deleteEntity,
    currentPage, pageSize, onPageChange, /* ... etc */
  } = useEntityTable();

  return (
    <div className="space-y-6">
      <DataTable
        data={data}
        totalCount={totalCount}
        columns={getEntityTableColumns()}
        actions={getEntityTableActions(
          (entity) => { setEditingEntity(entity); setModalMode('edit'); setIsModalOpen(true); },
          (entity) => { /* handle delete confirmation modal open */ }
        )}
        addButton={{
          label: 'Add New',
          onClick: () => { setModalMode('add'); setEditingEntity(null); setIsModalOpen(true); }
        }}
        {/* ... pagination props connected to hook ... */}
      />

      <EntityModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        mode={modalMode}
        entity={editingEntity}
        onSubmit={(payload) => modalMode === 'add' ? createEntity(payload) : updateEntity(payload)}
      />
    </div>
  );
}
```

## 5. Key Principles Summary
1. **Separation of Concerns:** Component UI, Table UI, API State (React Query), and Server logic are fully decoupled. 
2. **Type Safety End-to-End:** Shared types bridge Zod validation, generic Table interfaces, and Service layers.
3. **Optimistic/Reactive Cache Strategy:** Use `revalidatePath` server-side and `useQueryClient().invalidateQueries()` client-side for highly responsive UI updates after mutations.
4. **Declarative Modals:** Create and Edit functionality share a single modal orchestrated by a `mode` boundary.
5. **Route Gatekeeping:** Apply protection and RBAC exclusively in middleware, preventing unauthorized layouts or page cascades from executing.
