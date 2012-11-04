(function() {
    var app = function() {
        var self = this;
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
        //playerJoined
        
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
                $('#gameList').append($('<li>' + gameName + '</li>'));  // TODO join game action
            });
            if (!self.games.length) {
                $('#gameList').append($('<li>No games found. Please create a game.</li>'));
            }
        };

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
    });
    $('#cancel').click(function(event) {
        window.app.navigate('listing');
    });

    $('#newGame').click(function(event) {
        console.log('Creating', $('#gameName').val());
        window.app.socket.emit('createGame', $('#gameName').val());
    });
    
});