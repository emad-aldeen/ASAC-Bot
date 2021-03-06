DROP TABLE IF EXISTS users,
tickets;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) UNIQUE,
  points INT DEFAULT 0,
  last int8 DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS tickets (
  id VARCHAR(255) UNIQUE,
  voice VARCHAR(255) UNIQUE DEFAULT NULL,
  name VARCHAR(255),
  creator VARCHAR(255),
  claimer VARCHAR(255) DEFAULT NULL,
  status VARCHAR(255) DEFAULT 'open',
  opened int8 NOT NULL, -- 8:01am
  claimed int8 NOT NULL, -- 8:05am
  closed int8 DEFAULT NULL -- 8:20am
);

-- avg 4min waiting
-- avg 15min on ticket