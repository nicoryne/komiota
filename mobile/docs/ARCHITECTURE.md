# 5-Layer Mobile Architecture Overview (Local-First)

This mobile app follows a structured 5-layer architecture adapted from the Next.js web application, specifically designed for a local-first, offline-capable React Native application using Expo Router, WatermelonDB, and Supabase.

## 1. View Layer (`app/`)
**Responsibility:** Navigation, Layouts, and Screen-level Data Binding.
- Uses **Expo Router** for file-based routing and deep linking.
- Handles the entry points for different screens (Stacks, Tabs, Modals).
- Screens observe reactive data from WatermelonDB through Higher-Order Components (`withObservables`) or custom reactive hooks.

## 2. Component Layer (`components/`)
**Responsibility:** UI Presentation and Client-side Interactivity.
- Contains modular, reusable React Native components (e.g., `Button`, `MatchCard`, `PlayerProfile`).
- Focuses strictly on "how things look" and "how they feel" (UX).
- Styled using **NativeWind** (Tailwind CSS for React Native).
- Handles local view state, gesture handlers, and micro-animations (e.g., Reanimated).

## 3. Hook Layer (`hooks/`)
**Responsibility:** "The Glue" — Reactive State and Logic Interface.
- Bridges the UI components with the persistent data layer and device APIs.
- Wraps local queries to make them easily consumable in functional components.
- Manages hardware/device states (e.g., `useLocation` for Maps, `useNetworkStatus`, `useTheme`).
- For non-persistent remote data (if any), uses **TanStack Query** tailored for React Native.

## 4. Local Data & Sync Layer (`db/` or `database/`)
**Responsibility:** Local-first Persistence, Mutations, and Synchronization.
- Replaces traditional web Server Actions.
- **WatermelonDB**: Defines the local SQLite schema and active record Models.
- Houses the local CRUD operation functions. Writes are performed here and instantly reflected in the UI due to WatermelonDB's reactive nature.
- **Sync Manager**: Orchestrates the synchronization engine—pulling remote changes from Supabase and pushing local queue modifications back to the server when online.

## 5. Service & Infrastructure Layer (`services/`, `lib/`, `supabase/`)
**Responsibility:** Remote Business Logic, Types, and External Interfaces.
- **`services/`**: Handles complex interactions requiring server validation, third-party APIs, or Supabase Edge Functions/RPCs (e.g., Authentication flow, heavy PostGIS bounding box calculations that the server must process).
- **`lib/`**: Contains shared types, pure utility functions, Zod validation schemas, and the Supabase client initialization.
- **`supabase/`**: Contains the remote PostgreSQL migrations, RLS policies, and PostGIS schema definitions.

---

### Data Flow Example (Player Update - Offline First)
1. **View**: User toggles a status on the `/players/[id]` screen.
2. **Component**: `PlayerStatusToggle` fires an `onUpdate` event.
3. **Hook**: `useUpdatePlayer` wrapper is called.
4. **Local Data Layer**: A transaction is executed on WatermelonDB to update the local `player` record. The record is flagged as `updated` internally.
5. **UI Re-render**: Because the component observes this record, the UI updates **instantly**. No loading spinners are required.
6. **Sync Layer**: In the background, the Sync Manager detects the network connection and the pending change. It constructs a push payload and sends it to Supabase.
7. **Infrastructure Layer**: Supabase validates and applies the change. On the next sync cycle, data consistency is guaranteed.
