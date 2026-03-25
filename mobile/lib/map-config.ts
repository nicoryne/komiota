/**
 * MapLibre style configuration for Komiota.
 * Uses OpenFreeMap vector tiles for crisp rendering at any zoom.
 */
export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';

/**
 * Default camera settings centered on Cebu City.
 */
export const CEBU_CENTER: [number, number] = [123.8854, 10.3157];
export const DEFAULT_ZOOM = 16;
export const DEFAULT_PITCH = 60;
export const DEFAULT_BEARING = 0;

/**
 * Geofencing & routing constants.
 */
export const GEOFENCE_RADIUS_METERS = 50;
export const WALKING_SPEED_KMH = 4.5;

/**
 * 3D Building layer style tokens.
 */
export const BUILDING_COLOR = 'rgba(180, 160, 220, 0.45)';
export const BUILDING_OUTLINE_COLOR = 'rgba(140, 120, 190, 0.25)';
