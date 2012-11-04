$(function() {
    var $bg = $('#bg'),
        $layer = $('#layer'),
        $ui = $('#ui'),
        bg = $bg[0],
        layer = $layer[0],
        ui = $ui[0],
        bgCtx = bg.getContext('2d'),
        layerCtx = layer.getContext('2d'),
        uiCtx = ui.getContext('2d'),
        connected = false;
    
    window.socket = io.connect();
    
    window.socket.on('draw', function(data) {
        var delta = Math.abs(new Date().getTime() - data.timestamp);
        if (delta > 500000) {   // 500ms difference
            console.log('ignored', delta, data);
            return;
        }
        console.log(data);
        
        if (data.fn == 'addBall') {
            balls[counter++] = data.ball;
            
            //addBall.apply(this, data.args);
        } else if (data.fn == 'addPoints') {
            data.points.forEach(function(point) {
                addPoint.apply(this, [point.x, point.y, point.isDragging]);
            });
        }
    });
    window.socket.on('chat', function(data) {
        $('#chat').append($('<li>' + (data.name || 'Anonymous') + ': ' + data.message + '</li>'));
        if (data.status === 1) {
            console.log('Connected!');
            connected = true;
        }
    });
    
    /*
    $('#send').keyup(function(event) {
        if (event.keyCode === 13 || event.keyCode === 10) {
            if ($('#name').val()) {
                window.socket.emit('chat', {name: $('#name').val(), message: $(this).val()});
            } else {
                window.socket.emit('chat', {message: $(this).val()});
            }
            $(this).val('');
        }
    });
    */
    
    var isPainting;
    $ui.mousedown(function(event) {
        if (!connected) {return;}
        if (event.button == 2) {
            addBall(event.pageX - this.offsetLeft, event.pageY - this.offsetTop);
        } else if (event.button == 1) {
            addBall(event.pageX - this.offsetLeft, event.pageY - this.offsetTop, 'bomb');
        } else {
            isPainting = true;
            //window.socket.emit('draw', {fn: 'addPoint', timestamp: new Date().getTime(), args: [event.pageX - this.offsetLeft, event.pageY - this.offsetTop]});
            recordPoint(event.pageX - this.offsetLeft, event.pageY - this.offsetTop);
            mockPoint(event.pageX - this.offsetLeft, event.pageY - this.offsetTop);
        }
        event.stopPropagation();
        return false;
    });
    $ui.mousemove(function(event) {
        if (!connected) {return;}
        if (isPainting) {
            //window.socket.emit('draw', {fn: 'addPoint', timestamp: new Date().getTime(), args: [event.pageX - this.offsetLeft, event.pageY - this.offsetTop, true]});
            recordPoint(event.pageX - this.offsetLeft, event.pageY - this.offsetTop, true);
            mockPoint(event.pageX - this.offsetLeft, event.pageY - this.offsetTop, true);
        }
        event.stopPropagation();
        return false;
    });
    $ui.on('contextmenu', function(event) {
        event.stopPropagation();
        return false;
    });
    $ui.click(function(event) {
        event.stopPropagation();
        return false;
    });
    $ui.mouseup(function(event) {
        sendPoints();
        isPainting = false;
    });
    $ui.mouseleave(function(event) {
        sendPoints();
        isPainting = false;
    });
    

    var points = [];
    function recordPoint(x, y, isDragging) {
        points.push({x:x, y: y, isDragging: isDragging});
    }
    
    function sendPoints() {
        if (points.length > 1) {
            ui.width = ui.width;  // Clear
            window.socket.emit('draw', {fn: 'addPoints', timestamp: new Date().getTime(), points: points});
            points = [];
        }
    }
    
    var lastPoint;
    function addPoint(x, y, isDragging) {
        if (!isDragging) {
            lastPoint = null;
        }
        
        bgCtx.strokeStyle = "green";
        bgCtx.lineJoin = "round";
        bgCtx.lineWidth = 20;
        
        bgCtx.beginPath();
        if (lastPoint) {
            bgCtx.moveTo(lastPoint.x, lastPoint.y);
        } else {
            bgCtx.moveTo(x, y);
        }
        bgCtx.lineTo(x, y);
        bgCtx.closePath();
        bgCtx.stroke();
        lastPoint = {x: x, y: y};
    }
    var mockLastPoint;
    function mockPoint(x, y, isDragging) {
        if (!isDragging) {
            lastPoint = null;
        }
        
        uiCtx.strokeStyle = "rgba(0,0,255,0.5)";
        uiCtx.lineJoin = "round";
        uiCtx.lineWidth = 5;
        
        uiCtx.beginPath();
        if (lastPoint) {
            uiCtx.moveTo(lastPoint.x, lastPoint.y);
        } else {
            uiCtx.moveTo(x, y);
        }
        uiCtx.lineTo(x, y);
        uiCtx.closePath();
        uiCtx.stroke();
        lastPoint = {x: x, y: y};
    }
    
    var counter = 0;
    var balls = {};
    function addBall(x, y, type) {
        var ball = {
            x: x,
            y: y,
            dx: Math.random() - 0.5,
            dy: 0,
            type: type,
        };
        window.socket.emit('draw', {fn: 'addBall', timestamp: new Date().getTime(), ball: ball});
        //balls[counter++] = ball;
    }
    
    function updateBalls() {
        Object.keys(balls).forEach(function (key) {
            var pixel = bgCtx.getImageData(balls[key].x, balls[key].y + 3.5, 3, 1).data;
            //console.log(pixel);
            if (pixel[3] === 0 && balls[key].dy >= 0) {
                balls[key].dy += 0.01;
                balls[key].dx *= 1;
                
                balls[key].x += balls[key].dx;
                balls[key].y += balls[key].dy;
                
                if (balls[key].x < 0 || balls[key].x > 300 || balls[key].y < 0 || balls[key].y > 300) {
                    delete balls[key];
                }
            } else if (balls[key].type === 'bomb') {
                var oldCompositeOperation = bgCtx.globalCompositeOperation;
                bgCtx.globalCompositeOperation = "destination-out";
                bgCtx.strokeStyle = "rgba(0,0,0,1)";
                bgCtx.lineJoin = "round";
                bgCtx.lineWidth = 30;
                
                bgCtx.beginPath();
                bgCtx.moveTo(balls[key].x + 0.001, balls[key].y);
                bgCtx.lineTo(balls[key].x, balls[key].y);
                bgCtx.closePath();
                bgCtx.stroke();
                bgCtx.globalCompositeOperation = oldCompositeOperation;
                delete balls[key];
            } else {
                //balls[key].dy *= -0.5;
                //balls[key].y += balls[key].dy;
                //balls[key].x += balls[key].dx;
            }
        });
    }
    
    function redrawBalls() {
        layer.width = layer.width;  // Clear
        
        Object.keys(balls).forEach(function (key) {
            layerCtx.strokeStyle = balls[key].type === 'bomb' ? "red" : "blue";
            layerCtx.lineJoin = "round";
            layerCtx.lineWidth = 10;
            
            layerCtx.beginPath();
            layerCtx.moveTo(balls[key].x + 0.001, balls[key].y);
            layerCtx.lineTo(balls[key].x, balls[key].y);
            layerCtx.closePath();
            layerCtx.stroke();
        });
    }
    
    function step() {
        updateBalls();
        redrawBalls();
    }
    setInterval(step, 1000 / 60);
    
});