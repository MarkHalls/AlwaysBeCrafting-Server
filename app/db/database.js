const fs = require('fs');
const nodedir = require('node-dir');
const musicmetadata = require('musicmetadata');
const sqlite = require('sqlite');

const logChat = async (obj) => {
		await sqlite.exec("BEGIN")
		.then( async () => {
			Promise.all(obj.data.map(async log => {
				await sqlite.run("INSERT INTO chat_log(timestamp, user, message) VALUES (?,?,?)", [log.timestamp, log.user, log.message]);
			}));
			await sqlite.exec("COMMIT");
});
};

const walkFiles = (dir) => new Promise((resolve, reject) => {
  nodedir.files(dir, (err, files) => {
    if (err) reject(err) ;
    else resolve(files);
  });
});

const addMP3s = async (musicDir) => {
	const [tracks, files] = await Promise.all([
		sqlite.all("SELECT * FROM tracks"), 
		walkFiles(musicDir)
	]);
	const trackPaths = tracks.map(track => track.path);
	const missing = files.filter(file => !trackPaths.includes(file));
	const createParsersFromFiles = files => files.map(file =>
		new Promise((resolve, reject) => {
			const stream = fs.createReadStream(file);
			musicmetadata(stream, (err, metadata) => {
				if (err){ reject(err) }
				else {
					metadata.path = file;
					resolve(metadata);
				}
				stream.close();
			});
		}).catch((err) => console.log(`File ${file} did not have metadata.`))
	);
	const missingMetadatas = (await Promise.all(createParsersFromFiles(missing))).filter(m => m);
	await sqlite.exec("BEGIN")
		.then( async () => {
			Promise.all(missingMetadatas.map(async meta => {
				await sqlite.run("INSERT INTO tracks(title, path, album) VALUES (?,?,?)", [meta.title, meta.path, meta.album]);
				const track_id = (await sqlite.get("SELECT id from tracks WHERE title = ?", [meta.title])).id;
				Promise.all(meta.artist.map(async artist => {
					await sqlite.run("INSERT OR IGNORE INTO artists(name) VALUES (?)", [artist]);
					const artist_id = (await sqlite.get("SELECT id FROM artists WHERE name = ?", [artist])).id;
					await sqlite.run("INSERT INTO artist_tracks(track_id, artist_id) VALUES (?,?)", [track_id, artist_id]);
				}));
			}));
 			await sqlite.exec("COMMIT");
		});
};

const getFirstTrack = () => sqlite.get("SELECT path FROM tracks LIMIT 1"); 

const getTracks = () => sqlite.all("SELECT * FROM tracks");

const getTrackById = (id) => sqlite.get("SELECT * FROM tracks WHERE id = ?", [id]);

const getRandomTrack = () => sqlite.get("SELECT * FROM tracks WHERE id IN (SELECT id FROM tracks ORDER BY RANDOM() LIMIT 1)");

const getAllPlaylists = () => sqlite.all("SELECT * FROM playlists");

const getPlaylist = (id) => sqlite.get("SELECT * FROM playlists WHERE id = ?", [id]);

const getTitlesByPlaylist = (playlist) => sqlite.all(`
		SELECT * FROM tracks 
		INNER JOIN playlist_tracks ON tracks.id=playlist_tracks.track_id 
		WHERE playlist_tracks.playlist_id = ?`, 
	[playlist]
);

const populateAllPlaylist = async () => {
	await sqlite.run("INSERT OR IGNORE INTO playlists(name) VALUEs (?)", ["earthbound"]);
	await sqlite.run(`INSERT OR IGNORE INTO playlist_tracks(playlist_id, track_id) SELECT "1",tracks.id FROM tracks`);
};


module.exports = {
	getTracks,
	getFirstTrack,
	getTrackById,
	getRandomTrack,
	getTitlesByPlaylist,
	getPlaylist,
	getAllPlaylists,
	logChat,
	addMP3s,
}



/*
	List<TrackMetadata> searchTracksByTitle(String request);
	void addRequest(String user, final TrackMetadata trackMetadata);
	TrackMetadata getFinalFromRequests();
	void addVeto(String user, final TrackMetadata trackMetadata);
	TrackMetadata getRandomTrack();
	TrackMetadata getNextRequested(long timestamp);
	*/
