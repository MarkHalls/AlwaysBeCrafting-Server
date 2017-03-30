-- Up
CREATE TABLE error (
    id          INTEGER     PRIMARY KEY,
    timestamp   INTEGER     NOT NULL, 
    name        TEXT        NOT NULL COLLATE NOCASE,
    error       TEXT        NOT NULL COLLATE NOCASE
);

-- Down
DROP TABLE error;