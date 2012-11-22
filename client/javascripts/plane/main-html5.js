// Objects
(function() {
    window.Game = cc.Application.extend({
        config: {
            menuType: 'canvas',
            COCOS2D_DEBUG: 2, //0 to turn debug off, 1 for basic debug, and 2 for full debug
            showFPS: false,
            frameRate: 60,
            tag: 'layer',
        },
        ctor: function(scene) {
            this._super();
            this.startScene = scene;
            cc.COCOS2D_DEBUG = this.config.COCOS2D_DEBUG;
            cc.setup(this.config.tag);
            cc.AudioEngine.getInstance().init("mp3,ogg");
            cc.Loader.shareLoader().onloading = function () {
                cc.LoaderScene.shareLoaderScene().draw();
            };
            cc.Loader.shareLoader().onload = function () {
                cc.AppController.shareAppController().didFinishLaunchingWithOptions();
            };
            //cc.Loader.shareLoader().preload(g_resources);
        },
        applicationDidFinishLaunching: function() {
            var director = cc.Director.getInstance();
            director.runWithScene(new this.startScene());
            return true;
        }
    });
    
    
    window.PlayLayer = cc.Layer.extend({
        init: function() {
        }
    });
    
    window.PlayScene = cc.Scene.extend({
        onEnter:function () {
            this._super();
            var layer = new PlayLayer();
            layer.init();
            this.addChild(layer);
        }
    });
});
    
})();

$(function() {
    var myApp = new Game(PlayScene);
    
    
});