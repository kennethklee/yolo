(function() {
    var game = function(bg, ui, layer) {
        var $layer = $('#layer'),
            layer = $layer[0],
            layerCtx = layer.getContext('2d'),
            result = {
                plane: new this.Paper(50, 50),
                enemies: [],
                bullets: [],
                update: function() {
                    result.enemies.forEach(function(enemy) {
                        enemy.update();
                    });
                    result.bullets.forEach(function(bullet) {
                        bullet.update();
                    });
                    result.plane.update();
                },
                draw: function() {
                    //bg.width = bg.width;  // Clear
                    layer.width = layer.width;  // Clear
                    //ui.width = ui.width;  // Clear
                    result.enemies.forEach(function(enemy) {
                        enemy.draw(layerCtx);
                    });
                    result.bullets.forEach(function(bullet) {
                        bullet.draw(layerCtx);
                    });
                    result.plane.draw(layerCtx);
                },
                step: function() {
                    result.update();
                    result.draw();
                },
                start: function() {
                    result.interval = setInterval(result.step, 1000 / 60);
                }
            };
        return result;
    };
    var app = game.prototype;
    app.Paper = function(x, y) {
        var self = {
                x: x,
                y: y,
                update: function() {
                    // TODO move towards mouse
                    // TODO fire at some rate
                },
                draw: function(context) {
                    context.strokeStyle = "blue";
                    context.lineJoin = "round";
                    context.lineWidth = 10;
                    
                    context.beginPath();
                    context.moveTo(self.x + 0.001, self.y);
                    context.lineTo(self.x, self.y);
                    context.closePath();
                    context.stroke();
                }
            };
        return self;
    };
    
    window.Game = game;
    $(function() {
        window.game = new Game('#bg', '#ui', '#layer');
        window.game.start();
    });
})();