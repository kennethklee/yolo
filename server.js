var url = require("url");
var path = require("path");
var fs = require("fs");
var port = process.argv[2] || 8080;

var httpHandler = function(request, response) {
  var uri = url.parse(request.url).pathname,
      filename = path.join(process.cwd(), 'client', uri);

  path.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }

    if (fs.statSync(filename).isDirectory()) filename += '/index.html';

    fs.readFile(filename, "binary", function(err, file) {
      if(err) {
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }

      response.writeHead(200);
      response.write(file, "binary");
      response.end();
    });
  });
};

var app = require('http').createServer(httpHandler);
var io = require('socket.io').listen(app);
var sockets = {};

io.sockets.on('connection', function (socket) {
    console.log('User Connected! ' + socket.id);
    socket.emit('chat', {name: '<b>Server</b>', message: 'Connected!', status: 1});
    
    // Notify other users of the new user
    io.sockets.emit('chat', {name: '<b>Server</b>', message: 'New User Joined!'});

    sockets[socket.id] = socket;
    socket.on('disconnect', function () {
        console.log((socket.playerName || 'User') + ' Disconnected!');
        io.sockets.emit('chat', {name: '<b>Server</b>', message: (socket.playerName || 'User') + ' Disconnected!'});
        delete sockets[socket.id];
    });
    // Index
    socket.on('chat', function (data) {
        if (socket.playerName) {
            data.name = socket.playerName;
        }
        io.sockets.emit('chat', data);  // Broadcast
    });
    // Terrain
    socket.on('draw', function (data) {
        io.sockets.emit('draw', data);   // Broadcast
    });
    // Listing
    socket.on('setName', function (data) {
        console.log((socket.playerName || 'User') + ' = ' + data);
        socket.playerName = data;
    });
    socket.on('createGame', function (data) {
        if (games[data]) {
            socket.emit('chat', {name: '<i><b>Server</b></i>', message: '<i style="color:red">Game already exists!</i>', status: 2});
            return;
        }
        if (!socket.playerName) {
            socket.emit('chat', {name: '<i><b>Server</b></i>', message: '<i style="color:red">You need to set a name</i>', status: 2});
            return;
        }
        var world = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 10), true);    // Allow sleep
        
        // Ground around
        fixtureDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
        fixtureDef.shape.SetAsBox(20, 2);
        groundDef.position.Set(10, 400 / 30 + 1.8);
        world.CreateBody(groundDef).CreateFixture(fixtureDef);
        groundDef.position.Set(10, -1.8);
        world.CreateBody(groundDef).CreateFixture(fixtureDef);
        fixtureDef.shape.SetAsBox(2, 14);
        groundDef.position.Set(-1.8, 13);
        world.CreateBody(groundDef).CreateFixture(fixtureDef);
        groundDef.position.Set(21.8, 13);
        world.CreateBody(groundDef).CreateFixture(fixtureDef);
        
        games[data] = {
            name: data,
            world: world,
            players: {},
            emit: function(channel, message) {
                var game = this;
                Object.keys(game.players).forEach(function(playerName) {
                    game.players[playerName].socket.emit(channel, message);
                });
            }
        };
        createPlayer(data, socket);
        games[data].emit('joinedGame', {gameName: data, playerName: socket.playerName});
        
        console.log('Game Created: ' + socket.playerName + ' made a new game: ' + data);
    });
    
    socket.on('joinGame', function (data) {
        createPlayer(data.gameName, socket);
        console.log(data.gameName + ' <- ' + socket.playerName + ' (hello hello)');
        games[data.gameName].emit('joinedGame', {gameName: data.gameName, playerName: socket.playerName});
    });
    socket.on('leaveGame', function (data) {
        // TODO drop player
        games[data].emit('leftGame', {gameName: data, playerName: socket.playerName});
        dropPlayer(data, socket);
        console.log(data + ' -> ' + socket.playerName + ' (bye bye)');
    });
    socket.on('listGames', function (data) {
        socket.emit('gameList', Object.keys(games));
    });
});


// Server version of world state
var Box2D = require('./box2d.js');
var fixtureDef = new Box2D.Dynamics.b2FixtureDef();
fixtureDef.density = 1.0;
fixtureDef.friction = 0.5;
fixtureDef.restitution = 0.3;
var groundDef = new Box2D.Dynamics.b2BodyDef();
groundDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
var bodyDef = new Box2D.Dynamics.b2BodyDef();
bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;

var games = {};

function createPlayer(gameName, socket) {
    if (!games[gameName]) return;
    
    fixtureDef.shape.SetAsBox(0.3, 0.7);
    bodyDef.position.x = Math.random() * 10;
    bodyDef.position.y = Math.random() * 10;
    var player = games[gameName].world.CreateBody(bodyDef);
    player.SetFixedRotation(true);
    player.CreateFixture(fixtureDef);

    games[gameName].players[socket.playerName] = {
        socket: socket,
        body: player
    }
    
    games[gameName].emit('playerJoined' , {
        name: socket.playerName,
        timestamp: new Date().getTime(),
        x: bodyDef.position.x,
        y: bodyDef.position.y
    });
}
function dropPlayer(gameName, socket) {
    games[gameName].world.DestroyBody(games[gameName].players[socket.playerName].body);
    delete games[gameName].players[socket.playerName];
}
var invFrameRate = 1/60;
function update(connections) {
    Object.keys(games).forEach(function (gameName) {
        games[gameName].world.Step(invFrameRate, 10, 10);
        games[gameName].world.ClearForces();
    });
}
setInterval(update, 1000 / 60);
app.listen(parseInt(port, 10));
io.set('log level', 1);
//io.set('close timeout', 10);

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
