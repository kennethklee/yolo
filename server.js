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
    socket.emit('chat', {name: '<b>Server</b>', message: 'Connected!', status: 1});
    
    // Notify other users of the new user
    io.sockets.emit('chat', {name: '<b>Server</b>', message: 'New User!'});

    sockets[socket.id] = socket;
    socket.on('chat', function (data) {
        io.sockets.emit('chat', data);
    });

    socket.on('draw', function (data) {
        io.sockets.emit('draw', data);
        console.log('Broadcast DRAW to ' + Object.keys(sockets).length);
    });

});

io.sockets.on('disconnect', function (socket) {
    console.log('User Disconnected!');
    io.sockets.emit('chat', {name: '<b>Server</b>', message: 'User Disconnected!'});
    delete sockets[socket.id];
});


// Server version of world state
var Box2D = require('./box2d.js');
var world = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 10), true);    // Allow sleep

var fixtureDef = new Box2D.Dynamics.b2FixtureDef();
fixtureDef.density = 1.0;
fixtureDef.friction = 0.5;
fixtureDef.restitution = 0.3;

// Ground around
var bodyDef = new Box2D.Dynamics.b2BodyDef();
bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
bodyDef.position.x = 9;
bodyDef.position.y = 13;
fixtureDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
fixtureDef.shape.SetAsBox(20, 2);
bodyDef.position.Set(10, 400 / 30 + 1.8);
world.CreateBody(bodyDef).CreateFixture(fixtureDef);
bodyDef.position.Set(10, -1.8);
world.CreateBody(bodyDef).CreateFixture(fixtureDef);
fixtureDef.shape.SetAsBox(2, 14);
bodyDef.position.Set(-1.8, 13);
world.CreateBody(bodyDef).CreateFixture(fixtureDef);
bodyDef.position.Set(21.8, 13);
world.CreateBody(bodyDef).CreateFixture(fixtureDef);

function update(connections) {
    world.Step(
	1 / 60 //frame-rate
	, 10 //velocity iterations
	, 10 //position iterations
	);

	//io.sockets.emit('css', drawDOMObjects());
	world.ClearForces();
}


app.listen(parseInt(port, 10));
console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
