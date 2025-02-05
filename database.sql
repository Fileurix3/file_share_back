CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY UNIQUE,
  name VARCHAR(30) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS recipes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY UNIQUE,
  creator_id uuid NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  steps TEXT[] NOT NULL,
  ingredients VARCHAR(100)[] NOT NULL,
  cook_time_seconds INTEGER NOT NULL,
  cook_time VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  difficulty VARCHAR(100) NOT NULL,
  image VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY(creator_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_recipes_cook_time_seconds ON recipes(cook_time_seconds);
CREATE INDEX idx_recipes_category ON recipes(category);
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX idx_recipes_ingredients ON recipes USING GIN (ingredients);