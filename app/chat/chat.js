const tmi = require("tmi.js");
const identity = require("./oauth.json");
const db = require("../db/db");

const client = new tmi.client({
    options: {
        debug: true
    },
    connection: {
        reconnect: true
    },
    identity,
    channels: ["firesetter"],
    // channels: ["alwaysbecrafting, firesetter"],
    // logger: {
    //     // unnecessary logger
    //     info:  log => console.log("info: " + log),
    //     warn:  log => console.log("warn: " + log),
    //     error: log => console.log("error: " + log),
    // }
});

client.on('message', (channel, user, message, self) => {
    if (message.charAt(0) !== "!") { db.logChat(user.username, message); }
    else {
        const parsedMessage = message.trim().split(/\s+/);
        switch (parsedMessage[0]) {
            case '!veto':
                console.log("Veto SUCCESS!!");
                

                break;
            case '!request':
                console.log("Request SUCCESS!!");
                break;
            default:
                break;
        }
    }
    // console.log(parsedMessage);
});

// Connect the client to the server..
client.connect();