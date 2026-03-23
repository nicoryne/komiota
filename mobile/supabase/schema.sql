-- Enable PostGIS Extension First (Requires Superuser/Supabase Dashboard capability)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable uuid-ossp for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: routes
CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Table: bus_stops
CREATE TABLE IF NOT EXISTS bus_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    -- Store spatial data as Geography Point (Longitude, Latitude) with SRID 4326 (WGS 84)
    location GEOGRAPHY(Point, 4326) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending' or 'verified'
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Note: In PostGIS, longitude comes first in POINT(lon lat)
-- The Geography type handles spherical calculations (meters) instead of planar ones (degrees).

-- Create a spatial index for fast bounding box and nearest-neighbor queries
CREATE INDEX IF NOT EXISTS bus_stops_location_idx ON bus_stops USING GIST (location);


-- Function: Get Bus Stops in Bounding Box
-- Useful for MapTile rendering or fetching stops within the user's current view
CREATE OR REPLACE FUNCTION get_bus_stops_in_bbox(
    min_lon DOUBLE PRECISION,
    min_lat DOUBLE PRECISION,
    max_lon DOUBLE PRECISION,
    max_lat DOUBLE PRECISION
)
RETURNS SETOF bus_stops
LANGUAGE sql
STABLE
AS $$
    SELECT *
    FROM bus_stops
    WHERE location && ST_MakeEnvelope(min_lon, min_lat, max_lon, max_lat, 4326);
$$;

-- Note on WatermelonDB Sync:
-- A typical sync query would also need a `last_pulled_at` mechanism, which can be achieved
-- by returning rows where `updated_at > last_pulled_at`.
