import { ServerEngine } from 'lance-gg';
const nameGenerator = require('./NameGenerator');
const NUM_BOTS = 3;

export default class SpaaaceServerEngine extends ServerEngine {

    constructor(io, gameEngine, inputOptions) {
        super(io, gameEngine, inputOptions);
        this.scoreData = {};
    }

    // when the game starts, create robot spaceships, and register
    // on missile-hit events
    start() {
        super.start();

        for (let x = 0; x < NUM_BOTS; x++) this.makeBot();

        this.gameEngine.on('missileHit', e => {

            // add kills
            if (this.scoreData[e.missile.ownerId]) this.scoreData[e.missile.ownerId].kills++;

            // remove score data for killed ship
            delete this.scoreData[e.ship.id];
            this.updateScore();

            console.log(`ship killed: ${e.ship.toString()}`);
            this.gameEngine.removeObjectFromWorld(e.ship.id);
            if (e.ship.isBot) {
                setTimeout(() => this.makeBot(), 5000);
            }
        });

    }

    // a player has connected
    onPlayerConnected(socket) {
        super.onPlayerConnected(socket);

        let makePlayerShip = () => {
            let ship = this.gameEngine.makeShip(socket.playerId);

            this.scoreData[ship.id] = {
                kills: 0,
                name: nameGenerator('general') + " (" + socket.playerId + ")"
            };
            this.updateScore();
        };

        // handle client restart requests
        socket.on('requestRestart', makePlayerShip);
        // socket.on('api_move', (data) => {
        //     this.makeInput(socket, data)
        // });
    }

    makeInput(socket, data) {

        this.gameEngine.processInput(data.InputData, data.playerId)

    }

    // a player has disconnected
    onPlayerDisconnected(socketId, playerId) {
        super.onPlayerDisconnected(socketId, playerId);


        // iterate through all objects, delete those that are associated with the player (ship and missiles)
        let playerObjects = this.gameEngine.world.queryObjects({ playerId: playerId });
        playerObjects.forEach(obj => {
            this.gameEngine.removeObjectFromWorld(obj.id);
            // remove score associated with this ship
            delete this.scoreData[obj.id];
        });

        this.updateScore();
    }

    // create a robot spaceship
    makeBot() {
        let bot = this.gameEngine.makeShip(0);
        bot.attachAI();

        this.scoreData[bot.id] = {
            kills: 0,
            name: nameGenerator('general') + 'Bot'
        };

        this.updateScore();
    }

    updateScore() {
        // delay so player socket can catch up
        setTimeout(() => {
            this.io.sockets.emit('scoreUpdate', this.scoreData);
        }, 1000);

    }
}