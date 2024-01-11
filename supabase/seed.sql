-- Define the list of first and last names
WITH names (first_name, last_name) AS (
    VALUES
        ('John', 'Doe'), -- patient
        ('Jane', 'Smith'), -- provider
        ('Alice', 'Johnson'), -- patient
        ('Bob', 'Brown'), -- provider
        ('Charlie', 'Davis'), -- patient
        ('Diana', 'Martinez') -- provider
),
name_idx AS (
    SELECT
        first_name,
        last_name,
        row_number() OVER () AS idx
    FROM
        names
)
INSERT INTO
    auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    )
SELECT
    '00000000-0000-0000-0000-000000000000',
    uuid_generate_v4 (),
    'authenticated',
    'authenticated',
    ni.first_name || '.' || ni.last_name || '@example.com',
    crypt('testing1234', gen_salt('bf')),
    current_timestamp,
    current_timestamp,
    current_timestamp,
    '{"provider":"email","providers":["email"]}',
    format('{"last_name":"%s","first_name":"%s","is_patient":%s}', ni.last_name, ni.first_name, CASE WHEN ni.idx % 2 = 1 THEN 'true' ELSE 'false' END)::jsonb,
    current_timestamp,
    current_timestamp,
    '',
    '',
    '',
    ''
FROM
    generate_series(1, (SELECT COUNT(*) FROM names)) gs
JOIN
    name_idx ni ON ni.idx = gs
;

-- test user email identities
INSERT INTO
    auth.identities (
        id,
        user_id,
        -- New column
        provider_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
    ) (
        select
            uuid_generate_v4 (),
            id,
            -- New column
            id,
            format('{"sub":"%s","email":"%s"}', id :: text, email) :: jsonb,
            'email',
            current_timestamp,
            current_timestamp,
            current_timestamp
        from
            auth.users
    );