# Komiota Security Architecture

## 1. The Three-Layer Validation Strategy
Our application relies heavily on crowdsourced data for transit mapping and live tracking. Because we cannot trust client-side data, we implement a strict "Three-Layer Security Strategy" to validate all data as it moves from the user's device to our database.

### Layer 1: Frontend UX (Client-Side)
We use **React Hook Form** combined with **Zod** to provide immediate, user-friendly validation feedback within the mobile app and web dashboard. 

### Layer 2: API & Edge (Server-Side)
Client-side validation is primarily for UX and cannot replace secure backend validation. Malicious actors could bypass the mobile application entirely and send raw JSON formats directly to our endpoints.

To prevent this, all Supabase Edge Functions and Next.js Server Actions **re-parse and validate** incoming payloads using the exact same shared Zod schemas from our monorepo before any business logic is executed. Any payload that fails to parse is immediately rejected.

### Layer 3: Database Integrity (Postgres)
The final and most robust layer of validation happens at the database level. Before any data is written to disk, PostgreSQL guarantees structural and geographical integrity:
* **CHECK Constraints:** We enforce strict bounds (e.g., ensuring latitudes and longitudes strictly fall within the Cebu City bounding box or realistic routing paths).
* **ENUMs and Types:** We utilize rigid PostgreSQL ENUMs and specific column types to prevent malformed text or bad states from entering the database.

## 2. Authentication and Role-Based Access Control (RBAC)

Komiota employs a strict 3-tier role system: `user`, `moderator`, and `admin`.

**Golden Rule:** User roles MUST reside in the `public.profiles` table under an `app_role` ENUM column. They must **NEVER** be stored in Supabase's `auth.user_metadata`. Data in `user_metadata` can be easily modified or spoofed by bad actors via client-side JWT manipulation.

To securely enforce these roles across the platform, we utilize a custom PostgreSQL function: `auth.has_role(required_role app_role)`. This function is integrated directly into our Row Level Security (RLS) policies, ensuring that mutations (inserts, updates, deletes) are locked down and verified securely on the database before execution.

## 3. Anti-Cheat & Gamification Security

Komiota incentivizes community participation using a gamified point system, commuter scores, and dynamic leaderboards.

**Golden Rule: The client never calculates points.**

The mobile app's only responsibility regarding gamification is to update a trip's status to `completed`. It cannot arbitrarily award points or increment counters. 

All point calculations, streak updates, badge unlock logic, and distance tallies are handled securely and atomically via **PostgreSQL Triggers** on the backend. This guarantees that malicious clients cannot artificially inflate their commuter scores or game the leaderboard.

## 4. Live Tracking Data Heuristics (trip_pings)

Crowdsourcing live bus locations introduces the risk of inaccurate or deliberately falsified data (e.g., a user pretending to be on a bus while riding a motorcycle or a private car).

To sanitize `trip_pings` before broadcasting ETAs to the network, we implement strict heuristic filtering:
* **Speed Heuristics:** The system discards location pings that exceed realistic bus speeds or demonstrate rapid, erratic acceleration inconsistent with heavy transit vehicles.
* **Route Matching:** Pings are validated against the known geographical path of the declared route. If a user deviates significantly from the designated CBRT corridor, their live tracking broadcast is silently dropped.

## 5. Local Data Security (WatermelonDB & Auth)

We divide our mobile app's data into sensitive session data and non-sensitive caching data:
* **Session Tokens:** Sensitive authentication tokens are handled securely by Supabase Auth's native integrations, utilizing the device's secure storage mechanisms (e.g., iOS Keychain, Android EncryptedSharedPreferences).
* **Local Database:** The local WatermelonDB SQLite database is utilized exclusively as an offline-first cache for public transit data (bus routes, stop coordinates, timetables). Because this data is inherently public, the SQLite database does not require heavy performance-degrading encryption, allowing the app to remain exceptionally fast, responsive, and offline-capable.
