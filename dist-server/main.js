"use strict";

var _lanceGg = require("lance-gg");

var _SpaaaceServerEngine = _interopRequireDefault(require("./server/SpaaaceServerEngine.js"));

var _SpaaaceGameEngine = _interopRequireDefault(require("./common/SpaaaceGameEngine.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var express = require('express');

var socketIO = require('socket.io');

var path = require('path');

var PORT = process.env.PORT || 3000;
var INDEX = path.join(__dirname, '../dist/index.html'); // Game Server

// define routes and socket
var server = express();
var requestHandler = server.listen(PORT, function () {
  return console.log("Listening on ".concat(PORT));
});
var io = socketIO(requestHandler); // Game Instances

var gameEngine = new _SpaaaceGameEngine["default"]({
  traceLevel: _lanceGg.Lib.Trace.TRACE_NONE
});
var serverEngine = new _SpaaaceServerEngine["default"](io, gameEngine, {
  debug: {},
  updateRate: 6,
  timeoutInterval: 0 // no timeout

});
server.get('/', function (req, res) {
  res.sendFile(INDEX);
});
server.get('/api', function (req, res) {
  //ar InputData = { input: "up" };
  gameEngine.processInput(req.query, Number(req.query.id));
  var gameObjects = [];

  for (var _i = 0, _Object$keys = Object.keys(gameEngine.world.objects); _i < _Object$keys.length; _i++) {
    var element = _Object$keys[_i];
    var type = "";

    if (gameEngine.world.objects[element].playerId != req.query.id) {
      type = "Enemy";
    } else {
      type = "Me";
    }

    var gameObject = {
      postiton: gameEngine.world.objects[element].position,
      type: type,
      id: gameEngine.world.objects[element].id,
      angle: gameEngine.world.objects[element].angle,
      gameFieldWidth: gameEngine.worldSettings.width,
      gameFieldHeight: gameEngine.worldSettings.height
    };
    gameObjects.push(gameObject);
  }

  res.send(gameObjects);
});
server.use('/', express["static"](path.join(__dirname, '../dist/'))); // start the game

serverEngine.start();
//# sourceMappingURL=main.js.map