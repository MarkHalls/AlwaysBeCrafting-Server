//Possibly refactor to hapi.js later (so happy)
const express = require('express');
const sqlite = require('sqlite');
const db = require('./app/db/database');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');
const appPaths = require('./app-paths');

const server = express();
const api = express();
const assets = express();

api.get('/', (req, res) => {
    console.log('loaded');
    db.getFirstTrack().then(track => res.sendFile(path.resolve(__dirname, track.path)));
});

api.get('/playlists', (req, res) => {
    db.getAllPlaylists().then(playlists => res.json(playlists));
});

api.get('/playlists/:id', (req, res) => {
    db.getPlaylist(req.params.id).then(playlists => res.json(playlists));
});

api.get('/playlists/:id/songs', (req, res) => {
    db.getTitlesByPlaylist(req.params.id).then(list => res.json(list));
});

api.get('/songs', (req, res) => {
    db.getTracks().then(tracks => res.json(tracks));
});

api.get('/songs/random', (req, res) => {
        db.getRandomTrack().then(track => res.json(track));
});

api.get('/songs/:id', (req, res) => {
    db.getTrackById(req.params.id).then(track => res.sendFile(path.resolve(__dirname, track.path)));
});

api.get('/xkcd-proxy/:args', (req, res) => {
    axios.request({url: `https://www.google.com/search?q=-site:forums.xkcd.com%20site:xkcd.com%20${req.params.args}&btnI`,
        method: "get",
        maxRedirects: 0,
        validateStatus: (status) => status < 400})
    .then(response => {
        console.log(response.headers.location);
        const xkcd = {site: `https://xkcd.com/${response.headers.location.match(/^\D+(\d+)/i)[1]}`};
        axios.get(`${xkcd.site}/info.0.json`)
        .then(xkcd_res => {
            xkcd.safe_title = xkcd_res.data.safe_title;
            res.json(xkcd);
            console.log(xkcd_res.data);
        })
        .catch(err => console.log(err));
    })
    .catch(console.error);
});


api.post('/chat', (req, res) => {
    console.log(req.body);
    db.logChat(req.body);
    res.json({"data": "chatlog received"});
});

api.post('/vote', (req, res) => {
    console.log(req.body);
    db.voteLog(req.body);
    res.json({"data": "votes recieved"})
})

server.use(bodyParser.json());

server.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
server.use('/api', api);
// server.use('/api/xkcd-proxy', proxy(`http://www.google.com/search?q=xkcd%20standards&btnI`));

Promise.resolve()
    .then(() => sqlite.open(`${__dirname}/app/db/sqlite.db`))
    .then(() => sqlite.migrate({force: 'last', migrationsPath: `${__dirname}/app/db/migrations`}))
    .then(() => db.addMP3s(appPaths.musicDir))
    .catch(console.error)
    .then(() => server.listen(3000, () => console.log('Listening on port 3000')));