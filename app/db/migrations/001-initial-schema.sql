-- Up
CREATE TABLE chat_log (
    id          INTEGER     PRIMARY KEY,
	timestamp   INTEGER     NOT NULL,
	user        TEXT        COLLATE NOCASE,
	message     TEXT        COLLATE NOCASE
    );
    
CREATE TABLE tracks (
    id          INTEGER     PRIMARY KEY    ,
    title       TEXT        COLLATE NOCASE ,
    path        TEXT        UNIQUE NOT NULL,
    album       TEXT        COLLATE NOCASE
    );
                    
CREATE TABLE artist_tracks (
    id          INTEGER     PRIMARY KEY     ,
    track_id    INTEGER     NOT NULL        ,
    artist_id   INTEGER     NOT NULL        ,
    
    FOREIGN KEY (artist_id) REFERENCES artists(id),
    FOREIGN KEY (track_id) REFERENCES tracks(id)
    );

CREATE TABLE artists (
    id          INTEGER     PRIMARY KEY     ,
    name        TEXT        UNIQUE COLLATE NOCASE
    );

CREATE TABLE playlists (
    id          INTEGER     PRIMARY KEY     ,
    name        TEXT        UNIQUE COLLATE NOCASE
    );

CREATE TABLE playlist_tracks (
    id          INTEGER     PRIMARY KEY     ,
    playlist_id INTEGER     NOT NULL        ,
    track_id    INTEGER     NOT NULL        ,
    UNIQUE(playlist_id, track_id) ON CONFLICT REPLACE,
    
    FOREIGN KEY (playlist_id) REFERENCES playlists(id),
    FOREIGN KEY (track_id) REFERENCES tracks(id)
    );

CREATE TABLE track_votes (
    id          INTEGER     PRIMARY KEY     ,
    track_id    INTEGER     UNIQUE NOT NULL ,
    upvote      INTEGER                     ,
    downvote    INTEGER                     ,
    
    FOREIGN KEY (track_id) REFERENCES tracks(id)
    );

-- Down
DROP TABLE chat_log;
DROP TABLE tracks;
DROP TABLE artist_tracks;
DROP TABLE artists;
DROP TABLE playlists;
DROP TABLE playlist_tracks;
DROP TABLE track_votes;