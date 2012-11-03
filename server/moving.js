$(function() {
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

    //setup debug draw
    var debugDraw = new Box2D.Dynamics.b2DebugDraw();
    debugDraw.SetSprite($('#layer')[0].getContext('2d'));
    debugDraw.SetDrawScale(30.0);
    debugDraw.SetFillAlpha(0.9);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(Box2D.Dynamics.b2DebugDraw.e_shapeBit | Box2D.Dynamics.b2DebugDraw.e_jointBit);
    world.SetDebugDraw(debugDraw);

    window.setInterval(update, 1000 / 60);
    
    function update() {
        world.Step(
            1 / 60,   //frame-rate
            10,       //velocity iterations
            10        //position iterations
        );
        world.DrawDebugData();
        world.ClearForces();
    };
    
    // Create yourself
    bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
    fixtureDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;
    fixtureDef.shape.SetAsBox(0.3, 0.7);
    bodyDef.position.x = Math.random() * 10;
    bodyDef.position.y = Math.random() * 10;
    window.player = world.CreateBody(bodyDef)
    window.player.SetFixedRotation(true);
    window.player.CreateFixture(fixtureDef);

    $(document).keyup(function(event) {
        switch(event.keyCode) {
            case 38: // Up
                //player.ApplyForce(new Box2D.Common.Math.b2Vec2(0, -200), player.GetWorldCenter())
                break;
            case 37: // Left
                //player.ApplyForce(new Box2D.Common.Math.b2Vec2(-150, 0), player.GetWorldCenter())
                player.ApplyForce(new Box2D.Common.Math.b2Vec2(-150, -200), player.GetWorldCenter())
                break;
            case 39: // Right
                //player.ApplyForce(new Box2D.Common.Math.b2Vec2(150, 0), player.GetWorldCenter())
                player.ApplyForce(new Box2D.Common.Math.b2Vec2(150, -200), player.GetWorldCenter())
                break;
        }
    });
});