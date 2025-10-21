-- Safe procedure to rename weather_id -> id (Postgres)
-- 1) Create backup table (run first)
CREATE TABLE IF NOT EXISTS weather_data_backup AS TABLE weather_data;

-- 2) Add new column id (nullable for now)
ALTER TABLE weather_data ADD COLUMN IF NOT EXISTS id INTEGER;

-- 3) Copy values from weather_id into id for existing rows
UPDATE weather_data SET id = weather_id WHERE id IS NULL AND weather_id IS NOT NULL;

-- 4) If you want serial behaviour for future inserts, create sequence and set default
CREATE SEQUENCE IF NOT EXISTS weather_data_id_seq OWNED BY weather_data.id;
SELECT setval('weather_data_id_seq', COALESCE((SELECT MAX(id) FROM weather_data), 1));
ALTER TABLE weather_data ALTER COLUMN id SET DEFAULT nextval('weather_data_id_seq');

-- 5) Drop existing primary key constraint on weather_id and make id PK
-- First find constraint name (replace if known)
-- ALTER TABLE weather_data DROP CONSTRAINT IF EXISTS weather_data_pkey;
-- Then add primary key
ALTER TABLE weather_data ADD PRIMARY KEY (id);

-- Note: If weather_id is still needed you can DROP COLUMN weather_id after verification
-- ALTER TABLE weather_data DROP COLUMN weather_id;

-- End of script
