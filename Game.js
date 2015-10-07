
BasicGame.Game = function (game) {

    //  When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    // this.game;      //  a reference to the currently running game (Phaser.Game)
    // this.add;       //  used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
    // this.camera;    //  a reference to the game camera (Phaser.Camera)
    // this.cache;     //  the game cache (Phaser.Cache)
    // this.input;     //  the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it. (Phaser.Input)
    // this.load;      //  for preloading assets (Phaser.Loader)
    // this.math;      //  lots of useful common math operations (Phaser.Math)
    // this.sound;     //  the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
    // this.stage;     //  the game stage (Phaser.Stage)
    // this.time;      //  the clock (Phaser.Time)
    // this.tweens;    //  the tween manager (Phaser.TweenManager)
    // this.state;     //  the state manager (Phaser.StateManager)
    // this.world;     //  the game world (Phaser.World)
    // this.particles; //  the particle manager (Phaser.Particles)
    // this.physics;   //  the physics manager (Phaser.Physics)
    // this.rnd;       //  the repeatable random number generator (Phaser.RandomDataGenerator)

    //  You can use any of these from any function within this State.
    //  But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.

};

BasicGame.Game.prototype = {

    preload: function () {
        this.load.image('starfield', 'assets/starfield.png');
        this.load.image('bullet', 'assets/bullet.png');
        this.load.image('player_ship', 'assets/player_ship.png', 32, 32);
        this.load.image('enemy_ship1', 'assets/enemy_1.png', 32, 32);
        this.load.spritesheet('explosion1', 'assets/explosion.png', 32, 32);
    },

    create: function () {
        this.setupBackground();
        this.player_ship = this.add.sprite(400, 500, 'player_ship');
        this.player_ship.anchor.setTo(0.5, 0.5);
        this.physics.enable(this.player_ship, Phaser.Physics.ARCADE);

        this.enemy_ship1 = this.add.sprite(400, 200, 'enemy_ship1');
        this.enemy_ship1.anchor.setTo(0.5, 0.5);
        this.physics.enable(this.enemy_ship1, Phaser.Physics.ARCADE);

        this.bullet = this.add.sprite(400, 300, 'bullet');
        this.bullet.anchor.setTo(0.5, 0.5);
        this.physics.enable(this.bullet, Phaser.Physics.ARCADE);
        this.bullet.body.velocity.y = -500;

        this.cursors = this.input.keyboard.createCursorKeys();
    },

    update: function () {
        this.physics.arcade.overlap(this.bullet, this.enemy_ship1, this.enemyHit, null, this);
    },

    render: function () {
        // this.game.debug.body(this.player_ship);
        // this.game.debug.body(this.enemy_ship1);
        // this.game.debug.body(this.bullet);
    },

    setupBackground: function () {
        this.starfield = this.add.tileSprite(0, 0, 800, 600, 'starfield');
        this.starfield.autoScroll(0, 12);
    },

    enemyHit: function (bullet, enemy_ship) {
        bullet.kill();
        enemy_ship.kill();
        var explosion1 = this.add.sprite(enemy_ship.x, enemy_ship.y, 'explosion1');
        explosion1.anchor.setTo(0.5, 0.5);
        explosion1.animations.add('explode');
        explosion1.play('explode', 10, false, true);
    },

    quitGame: function (pointer) {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        this.state.start('MainMenu');

    }

};
