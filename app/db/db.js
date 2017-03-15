const fs = require('fs');
const nodedir = require('node-dir');
const musicmetadata = require('musicmetadata');
const connection = require('sqlite');
const schema = require('./schema');

const logChat = async (user, message) => {
	const currentTime = Math.floor(Date.now() / 1000);
	await connection.run("INSERT INTO chat_log(timestamp, user, message) VALUES (?,?,?)", [currentTime, user, message]);
};

const walkFiles = (dir) => new Promise((resolve, reject) => {
  nodedir.files(dir, (err, files) => {
    if (err) reject(err) ;
    else resolve(files);
  });
});

const addMP3s = async (musicDir) => {
	const [tracks, files] = await Promise.all([
		connection.all("SELECT * FROM tracks"), 
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
	await connection.exec("BEGIN")
		.then( async () => {
			Promise.all(missingMetadatas.map(async meta => {
				await connection.run("INSERT INTO tracks(title, path, album) VALUES (?,?,?)", [meta.title, meta.path, meta.album]);
				const track_id = (await connection.get("SELECT id from tracks WHERE title = ?", [meta.title])).id;
				Promise.all(meta.artist.map(async artist => {
					await connection.run("INSERT OR IGNORE INTO artists(name) VALUES (?)", [artist]);
					const artist_id = (await connection.get("SELECT id FROM artists WHERE name = ?", [artist])).id;
					await connection.run("INSERT INTO artist_tracks(track_id, artist_id) VALUES (?,?)", [track_id, artist_id]);
				}));
			}));
 			await connection.exec("COMMIT");
		});
};

const getFirstTrack = async () => (await connection.get("SELECT path from tracks WHERE id = 1")).path; 

module.exports = {
	logChat,
	getFirstTrack,
}

connection.open(`${__dirname}/sqlite.db`).then( async () => {
	await schema.createTables(connection);
	await addMP3s("/home/mh/Music");
});

/*
	List<TrackMetadata> searchTracksByTitle(String request);
	void addRequest(String user, final TrackMetadata trackMetadata);
	TrackMetadata getFinalFromRequests();
	void addVeto(String user, final TrackMetadata trackMetadata);
	TrackMetadata getRandomTrack();
	TrackMetadata getNextRequested(long timestamp);
	*/
