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
const gameEngine = new SpaaaceGameEngine({ traceLevel: 0 });
const serverEngine = new SpaaaceServerEngine(io, gameEngine, {
    debug: {},
    updateRate: 6,
    // stepRate: 60,
    timeoutInterval: 0 // no timeout
});


server.get('/', function(req, res) { res.sendFile(INDEX); });
server.get('/api', function(req, res) {
    //ar InputData = { input: "up" };

    serverEngine.queueInputForPlayer(req.query, Number(req.query.id))
        //gameEngine.processInput(req.query, Number(req.query.id));

    let gameObjects = [];

    for (let element of Object.keys(gameEngine.world.objects)) {

        let type = "";

        let playerShip = gameEngine.world.objects[element];

        if (playerShip.playerId != req.query.id) {
            type = "Enemy";
        } else {
            type = "Me";
        }

        let gameObject = {
            position: playerShip.position,
            type: type,
            id: playerShip.id,
            angle: playerShip.angle,
            gameFieldWidth: gameEngine.worldSettings.width,
            gameFieldHeight: gameEngine.worldSettings.height,
            step: gameEngine.world.stepCount
        }

        gameObjects.push(gameObject);

    }

    res.send(gameObjects);
});
server.use('/', express.static(path.join(__dirname, '../dist/')));


// start the game
serverEngine.start();