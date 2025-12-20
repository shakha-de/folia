INSERT INTO users (
    uuid,
    username,
    email,
    password_hash,
    is_enabled,
    is_email_verified,
    role,
    reputation_score,
    created_at,
    updated_at,
    display_name,
    bio
) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'alice', 'alice@example.com', '$2a$10$devseedalice', true, true, 'CITIZEN', 10, now(), now(), 'Alice Arborist', 'Tree enthusiast and volunteer'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bob', 'bob@example.com', '$2a$10$devseedbob123', true, false, 'CITIZEN', 5, now(), now(), 'Bob Botanist', 'Studies urban ecology'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'carol', 'carol@example.com', '$2a$10$devseedcarol', true, true, 'MODERATOR', 25, now(), now(), 'Carol Canopy', 'Moderates community reports')
ON CONFLICT (uuid) DO NOTHING;
