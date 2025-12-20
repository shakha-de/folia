CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE,

    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),

    password_hash VARCHAR(255) NOT NULL,

    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,

    role VARCHAR(20) NOT NULL,
    reputation_score INTEGER NOT NULL DEFAULT 0,

    home_location_lat DOUBLE PRECISION,
    home_location_lng DOUBLE PRECISION,
    notification_radius_km INTEGER DEFAULT 1,

    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,

    display_name VARCHAR(255),
    bio VARCHAR(500),
    profile_image_url VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_users_uuid ON users (uuid);
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
