



CREATE TABLE "users" (
  "user_id" serial PRIMARY KEY,
  "name" varchar(100),
  "email" varchar(100),
  "password" text,
  "role" varchar(20),
  "created_at" timestamp,
  "last_login" timestamp
);

CREATE TABLE "market_prices" (
  "price_id" serial PRIMARY KEY,
  "user_id" int,
  "updated_by" int,
  "commodity_name" varchar(100),
  "unit" varchar(20),
  "price" float,
  "market_location" varchar(100),
  "date" date,
  "created_at" timestamp
);

CREATE TABLE "weather_data" (
  "weather_id" serial PRIMARY KEY,
  "layer_id" int,
  "location_name" varchar(100),
  "date" date,
  "temperature" float,
  "humidity" float,
  "rainfall" float,
  "wind_speed" float,
  "recommendation" text,
  "created_at" timestamp
);

CREATE TABLE "gis_layers" (
  "layer_id" serial PRIMARY KEY,
  "user_id" int,
  "layer_name" varchar(100),
  "description" text,
  "geom" geometry,
  "source" varchar(100),
  "uploaded_at" timestamp
);

CREATE TABLE "logs_activity" (
  "log_id" serial PRIMARY KEY,
  "user_id" int,
  "action" varchar(100),
  "description" text,
  "created_at" timestamp
);

CREATE TABLE "notifications" (
  "notif_id" serial PRIMARY KEY,
  "title" varchar(100),
  "message" text,
  "type" varchar(30),
  "created_at" timestamp,
  "is_read" boolean,
  "user_id" int
);

COMMENT ON COLUMN "market_prices"."user_id" IS 'Penginput data harga (bisa admin)';

COMMENT ON COLUMN "market_prices"."updated_by" IS 'Admin yang terakhir mengedit data';

COMMENT ON COLUMN "weather_data"."layer_id" IS 'Wilayah spasial terkait';

COMMENT ON COLUMN "gis_layers"."user_id" IS 'Admin pengunggah layer';

COMMENT ON COLUMN "notifications"."user_id" IS 'nullable for broadcast';

ALTER TABLE "market_prices" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id");

ALTER TABLE "market_prices" ADD FOREIGN KEY ("updated_by") REFERENCES "users" ("user_id");

ALTER TABLE "weather_data" ADD FOREIGN KEY ("layer_id") REFERENCES "gis_layers" ("layer_id");

ALTER TABLE "gis_layers" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id");

ALTER TABLE "logs_activity" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id");

ALTER TABLE "notifications" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id");