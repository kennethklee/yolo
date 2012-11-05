(function() {
    var fixtureDef = new Box2D.Dynamics.b2FixtureDef();
    fixtureDef.density = 1.0;
    fixtureDef.friction = 0.5;
    fixtureDef.restitution = 0.3;
    var groundDef = new Box2D.Dynamics.b2BodyDef();
    groundDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
    var bodyDef = new Box2D.Dynamics.b2BodyDef();
    bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;

    var app = function() {
        var self = this;
        this.players = {};
        this.socket = io.connect();
        this.socket.on('chat', function(data) {
            if (data.status === 1) {
                self.connected = true;
                self.navigate('name');
            } else if (data.status === 2) {
                // TODO show popup
            } else {
                $('#chat').append($('<li>' + (data.name || 'Anonymous') + ': ' + data.message + '</li>'));
            }
        });
        this.socket.on('gameList', function(data) {
            self.games = data;
            self.navigate('listing');
        });
        this.socket.on('joinedGame', function(data) {
            console.log(data);
            if (data.playerName === $('#playerName').val()) {
                self.navigate('game');
            } else {
                $('#chat').append($('<li><i>' + data.playerName + ': ' + data.message + '</li>'));
            }            
        });
        this.socket.on('playerJoined', function(data) {
            if (data.playerName === $('#playerName').val()) {
                self.navigate('game');
            } else {
                $('#chat').append($('<li><i>' + data.playerName + ': ' + data.message + '</li>'));
            }

            // Create Player
            console.log('Creating player', self);
            bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
            fixtureDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;
            fixtureDef.shape.SetAsBox(0.3, 0.7);
            bodyDef.position.x = data.x;
            bodyDef.position.y = data.y;
            var player = self.world.CreateBody(bodyDef)
            player.SetFixedRotation(true);
            player.CreateFixture(fixtureDef);
            self.players[data.playerName] = player;
        });
        
        this.socket.on('gameState', function(data) {
            data.forEach(function(state) {
                self.players[state.playerName].SetTransform(new Box2D.Common.Math.b2Vec2(state.x, state.y));
                self.players[state.playerName].SetLinearVelocity(new Box2D.Common.Math.b2Vec2(state.vx, state.vy));
            });
        });
        
        this.navigate = function(newState, options) {
            $('#app').removeAttr('class');
            $('#app').addClass(newState);
            if (self[newState + 'Initialize']) {
                self[newState + 'Initialize'].apply(self, [options]);
            }
        };
        this.nameInitialize = function() {
            $('#playerName').focus();
            
        };
        this.listingInitialize = function() {
            $('#gameList').empty();
            self.games.forEach(function(gameName) {
                var li = $('<li>' + gameName + '</li>')
                var join = $('<button class="btn btn-small pull-right">Join</button>').click(function(event) {
                    console.log('Joining ' + this.gameName);
                    self.socket.emit('joinGame', this.gameName);
                });
                join[0].gameName = gameName;
                $('#gameList').append(li.append(join));  // TODO join game action
            });
            if (!self.games.length) {
                $('#gameList').append($('<li>No games found. Please create a game.</li>'));
            }
        };
        this.gameInitialize = function() {
            console.log('start game loop');
            if (self.interval) {
                clearInterval(self.interval);
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

            //setup debug draw
            var debugDraw = new Box2D.Dynamics.b2DebugDraw();
            debugDraw.SetSprite($('#layer')[0].getContext('2d'));
            debugDraw.SetDrawScale(30.0);
            debugDraw.SetFillAlpha(0.9);
            debugDraw.SetLineThickness(1.0);
            debugDraw.SetFlags(Box2D.Dynamics.b2DebugDraw.e_shapeBit | Box2D.Dynamics.b2DebugDraw.e_jointBit);
            world.SetDebugDraw(debugDraw);
            
            self.world = world;
            self.interval = setInterval(self.update, 1000/60);
        };
        this.update = function() {
            self.world.Step(1/60, 10, 10);
            self.world.DrawDebugData();
            self.world.ClearForces();
        }

        this.connected = false;
        this.navigate('connecting');
    };
    
    window.App = app;
})();


$(function() {
    window.app = new window.App();
    
    $('#setName').click(function(event) {
        window.app.socket.emit('setName', $('#playerName').val());
        window.app.socket.emit('listGames');
    });
    
    $('#createGame').click(function(event) {
        window.app.navigate('create');
        $('#gameName').focus();
    });
    $('#cancel').click(function(event) {
        window.app.navigate('listing');
    });

    $('#newGame').click(function(event) {
        console.log('Creating', $('#gameName').val());
        window.app.socket.emit('createGame', $('#gameName').val());
    });
    
});