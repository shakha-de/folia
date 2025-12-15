CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS trees (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL UNIQUE,
    species TEXT NOT NULL,
    common_name TEXT,
    location geometry(Point, 4326),
    soil_moisture_level TEXT NOT NULL,
    health_status TEXT NOT NULL,
    last_watered_at TIMESTAMP,
    next_watering_due TIMESTAMP,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_trees_location_gist ON trees USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_trees_public_id ON trees (public_id);
CREATE INDEX IF NOT EXISTS idx_trees_health_status ON trees (health_status);
