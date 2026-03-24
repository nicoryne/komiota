# Architecture Overview

This project follows a structured multi-layer architecture designed for scalability, maintainability, and clear separation of concerns within the Next.js ecosystem.

## 1. View Layer (`app/`)
**Responsibility:** Routing, Layouts, and Page-level Data Fetching.
- Handles the entry points of the application using the Next.js App Router.
- Uses **Server Components** by default to fetch initial data or manage SEO metadata.
- Orchestrates how the components are laid out on a page.

## 2. Component Layer (`components/`)
**Responsibility:** UI Presentation and Client-side Interactivity.
- Contains modular, reusable React components (e.g., `Button`, `Card`, `Profile`).
- Focuses on "how things look" and "how they feel" (UX).
- Handles local state and client-side events.

## 3. Hook Layer (`hooks/`)
**Responsibility:** "The Glue" — State Management and Data Interface.
- Bridges the UI (Components) and the logic (Actions).
- Wraps Server Actions (e.g., using data-fetching libraries like TanStack Query) to manage state.
- Provides built-in support for:
  - **Caching**: Avoids redundant data fetching.
  - **Status States**: Manages loading, error, and fetching states gracefully.
  - **Mutations**: Handles side effects and automatic UI refreshes via query invalidations.

## 4. Action Layer (`actions/`)
**Responsibility:** Entry Points for Mutations (Server Actions).
- Acts as the "Controller" between the UI (or Hooks) and the Services.
- Defined with `'use server'` to be called directly from Client Components.
- Handles **Form Validation**, authorization checks, **Revalidations** (`revalidatePath`), and error handling before passing work to the Service layer.

## 5. Service Layer (`services/`)
**Responsibility:** Core Business Logic and Complex Data Operations.
- Contains the "Heavy Lifting" of the application.
- Provides standardized database access, abstracting away complex queries and multi-step transactions.
- Handles external API integrations and data transformations.

## 6. Data Access & Persistence Layer (`lib/` & database folder)
**Responsibility:** Infrastructure, Types, and Database Interface.
- Contains shared types, utility functions, validation schemas, and database client initialization.
- Contains migrations, seed data, and schema definitions.
- Defines the raw structure of the data and provides the tools to interact with the database.

---

### Data Flow Example (Entity Update)
1. **View**: User visits a data management page.
2. **Component**: A data table component uses a custom hook to fetch records.
3. **Hook**: The hook calls a read action to retrieve paginated results.
4. **Action**: The action invokes the corresponding Service to fetch data.
5. **Service**: The Service executes the database query.
6. **Data**: Results are returned up the chain.
7. **Hook (Mutation)**: When updating a record, a mutation hook validates the input, calls the update action, and triggers a query invalidation to refresh the list automatically.
