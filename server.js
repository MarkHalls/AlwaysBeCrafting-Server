//Possibly refactor to hapi.js later (so happy)
const express = require('express');
const db = require('./app/db/db');
const path = require('path');

const app = express();
//req = request, res = response
app.get('/', (req, res) => {
    console.log('loaded');
    res.sendFile(path.resolve(__dirname,'./assets/7th_Saga_Seven_Songs_for_Seventh_Saga_II_Water_OC_ReMix.mp3'));
    // db.getFirstTrack()
    // .then(track => res.json(track));
})

app.listen(3000, () => console.log('Listening on port 3000'))
