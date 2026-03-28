import { z } from 'zod';

// ─── Geo Constants (Cebu City bounding box) ────────────────────
export const CEBU_BOUNDS = {
  lat: { min: 9.8, max: 10.6 },
  lng: { min: 123.6, max: 124.1 },
} as const;

const cebuLatitude = z.number().min(CEBU_BOUNDS.lat.min).max(CEBU_BOUNDS.lat.max);
const cebuLongitude = z.number().min(CEBU_BOUNDS.lng.min).max(CEBU_BOUNDS.lng.max);

// ─── Auth ──────────────────────────────────────────────────────
export const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// ─── Profile ───────────────────────────────────────────────────
export const profileUpdateSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  avatar_url: z.string().url('Invalid avatar URL').optional().nullable(),
  faction_id: z.string().uuid('Invalid faction ID').optional().nullable(),
  onboarding_completed: z.boolean().optional(),
});

// ─── Bus Stop Submission ───────────────────────────────────────
export const busStopSubmitSchema = z.object({
  name: z
    .string()
    .min(2, 'Stop name must be at least 2 characters')
    .max(100, 'Stop name must be at most 100 characters'),
  latitude: cebuLatitude,
  longitude: cebuLongitude,
  image_url: z.string().url('Invalid image URL').optional().nullable(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
});

// ─── Trip Start ────────────────────────────────────────────────
export const tripStartSchema = z.object({
  route_id: z.string().uuid('Invalid route ID'),
  origin_stop_id: z.string().uuid('Invalid origin stop ID'),
  destination_stop_id: z.string().uuid('Invalid destination stop ID'),
});

// ─── Trip Ping ─────────────────────────────────────────────────
export const tripPingSchema = z.object({
  latitude: cebuLatitude,
  longitude: cebuLongitude,
  speed: z.number().min(0).max(80, 'Speed exceeds maximum realistic bus speed (80 km/h)').optional().nullable(),
  heading: z.number().min(0).max(360).optional().nullable(),
});

// ─── Type Exports ──────────────────────────────────────────────
export type AuthInput = z.infer<typeof authSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type BusStopSubmitInput = z.infer<typeof busStopSubmitSchema>;
export type TripStartInput = z.infer<typeof tripStartSchema>;
export type TripPingInput = z.infer<typeof tripPingSchema>;
