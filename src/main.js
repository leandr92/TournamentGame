const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
import { Lib } from 'lance-gg';

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, '../dist/index.html');

// Game Server
import SpaaaceServerEngine from './server/SpaaaceServerEngine.js';
import SpaaaceGameEngine from './common/SpaaaceGameEngine.js';

// define routes and socket
const server = express();

let requestHandler = server.listen(PORT, () => console.log(`Listening on ${ PORT }`));
const io = socketIO(requestHandler);

// Game Instances
const gameEngine = new SpaaaceGameEngine({ traceLevel: Lib.Trace.TRACE_NONE });
const serverEngine = new SpaaaceServerEngine(io, gameEngine, {
    debug: {},
    updateRate: 6,
    timeoutInterval: 0 // no timeout
});


server.get('/', function(req, res) { res.sendFile(INDEX); });
server.get('/api', function(req, res) {
    //ar InputData = { input: "up" };
    gameEngine.processInput(req.query, Number(req.query.id));

    let gameObjects = [];

    for (let element of Object.keys(gameEngine.world.objects)) {

        let type = "";

        if (gameEngine.world.objects[element].playerId != req.query.id) {
            type = "Enemy";
        } else {
            type = "Me";
        }

        let gameObject = {
            position: gameEngine.world.objects[element].position,
            type: type,
            id: gameEngine.world.objects[element].id,
            angle: gameEngine.world.objects[element].angle,
            gameFieldWidth: gameEngine.worldSettings.width,
            gameFieldHeight: gameEngine.worldSettings.height
        }

        gameObjects.push(gameObject);

    }

    res.send(gameObjects);
});
server.use('/', express.static(path.join(__dirname, '../dist/')));


// start the game
serverEngine.start();