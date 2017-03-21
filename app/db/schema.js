

const createTables = async ( connection ) => {
    await connection.run(`CREATE TABLE IF NOT EXISTS chat_log (
                        id          INTEGER     PRIMARY KEY,
	                    timestamp   INTEGER     NOT NULL,
	                    user        TEXT        COLLATE NOCASE,
	                    message     TEXT        COLLATE NOCASE)`);
    
    await connection.run(`CREATE TABLE IF NOT EXISTS tracks (
                    	id          INTEGER     PRIMARY KEY    ,
                    	title       TEXT        COLLATE NOCASE ,
                    	path        TEXT        UNIQUE NOT NULL,
                    	album       TEXT        COLLATE NOCASE)`);
                    
    await connection.run(`CREATE TABLE IF NOT EXISTS artist_tracks (
                        id          INTEGER     PRIMARY KEY     ,
                        track_id    INTEGER     NOT NULL        ,
                        artist_id   INTEGER     NOT NULL        ,
                        
                        FOREIGN KEY (artist_id) REFERENCES artists(id),
                        FOREIGN KEY (track_id) REFERENCES tracks(id))`);

    await connection.run( `CREATE TABLE IF NOT EXISTS artists (
                        id          INTEGER     PRIMARY KEY     ,
                        name        TEXT        UNIQUE COLLATE NOCASE)`);

    await connection.run(`CREATE TABLE IF NOT EXISTS playlists (
                        id          INTEGER     PRIMARY KEY     ,
                        name        TEXT        UNIQUE COLLATE NOCASE)`);

    await connection.run(`CREATE TABLE IF NOT EXISTS playlist_tracks (
                        id          INTEGER     PRIMARY KEY     ,
                        playlist_id INTEGER     NOT NULL        ,
                        track_id    INTEGER     NOT NULL        ,
                        UNIQUE(playlist_id, track_id) ON CONFLICT REPLACE,
                        
                        FOREIGN KEY (playlist_id) REFERENCES playlists(id),
                        FOREIGN KEY (track_id) REFERENCES tracks(id))`);

    await connection.run(`CREATE TABLE IF NOT EXISTS vetoes (
                        id          INTEGER     PRIMARY KEY     ,
                        timestamp   INTEGER     NOT NULL        ,
                        user        TEXT        COLLATE NOCASE  ,
                        track_id    INTEGER     NOT NULL        ,
                    
                        FOREIGN KEY (track_id) REFERENCES tracks(id))`);
                    
    await connection.run(`CREATE TABLE IF NOT EXISTS requests (
                        id          INTEGER     PRIMARY KEY     ,
                        timestamp   INTEGER     NOT NULL        ,
                        user        TEXT        COLLATE NOCASE  ,
                        track_id    INTEGER     NOT NULL        ,
                    
                        FOREIGN KEY (track_id) REFERENCES tracks(id))`);
};


module.exports = {
    createTables,
}