//Possibly refactor to hapi.js later (so happy)
const express = require('express');
const db = require('./app/db/database');
const path = require('path');

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


server.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
server.use('/api', api);





server.listen(3000, () => console.log('Listening on port 3000'))