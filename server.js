var url = require("url");
var path = require("path");
var fs = require("fs");
var port = process.argv[2] || 8080;

var httpHandler = function(request, response) {
  var uri = url.parse(request.url).pathname,
      filename = path.join(process.cwd(), 'server', uri);

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

var app = require("http").createServer(httpHandler);
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

app.listen(parseInt(port, 10));
console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
