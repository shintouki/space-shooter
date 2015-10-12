var BasicGame = {
    // Damage
    BASIC_BULLET_DAMAGE: 1,
    MISSILE_DAMAGE: 5,
    FIREBALL_DAMAGE: 5,
    CRASH_DAMAGE: 5,

    // Player weapon shot delay
    BULLET_DELAY: Phaser.Timer.SECOND * 0.2,
    MISSILE_DELAY: Phaser.Timer.SECOND * 1,
    FIREBALL_DELAY: Phaser.Timer.SECOND * 2,

    // Enemy shot delay
    BASIC_ENEMY_SHOT_DELAY: Phaser.Timer.SECOND * 4,
    SCARY_ENEMY_SHOT_DELAY: Phaser.Timer.SECOND * 2,

    // Enemy health
    BASIC_ENEMY_HEALTH: 3,
    SCARY_ENEMY_HEALTH: 5,

    ENEMY_BULLET_VELOCITY: 150,

    // Enemy spawn delay
    SPAWN_BASIC_DELAY: Phaser.Timer.SECOND,
    SPAWN_SCARY_DELAY: Phaser.Timer.SECOND * 4,

    // Speed
    PLAYER_SHIP_SPEED: 250,
    SCARY_MIN_SPEED: 25,
    SCARY_MAX_SPEED: 70,

    // Reward
    BASIC_ENEMY_REWARD: 1000,
    SCARY_ENEMY_REWARD: 3000,
    BOSS_REWARD: 50000,
    POWER_UP_REWARD: 1000,

    // Power up drop rate
    // BASIC_ENEMY_MISSILE_DROP_RATE: 0.1,
    // SCARY_ENEMY_MISSILE_DROP_RATE: 0.2,
    // BASIC_ENEMY_FIREBALL_DROP_RATE: 0.05,
    // SCARY_ENEMY_FIREBALL_DROP_RATE: 0.1,

    BASIC_ENEMY_MISSILE_DROP_RATE: 0.5,
    SCARY_ENEMY_MISSILE_DROP_RATE: 0.5,
    BASIC_ENEMY_FIREBALL_DROP_RATE: 0.5,
    SCARY_ENEMY_FIREBALL_DROP_RATE: 0.5,

    // Lives
    EXTRA_LIVES: 3,

    // Invulnerable time
    INVULNERABLE_TIME: Phaser.Timer.SECOND * 3,

    // Text timers
    RESTART_MESSAGE_DELAY: Phaser.Timer.SECOND * 2 
};

BasicGame.Boot = function (game) {

};

BasicGame.Boot.prototype = {

    init: function () {

        //  Unless you specifically know your game needs to support multi-touch I would recommend setting this to 1
        this.input.maxPointers = 1;

        //  Phaser will automatically pause if the browser tab the game is in loses focus. You can disable that here:
        this.stage.disableVisibilityChange = true;

        if (this.game.device.desktop)
        {
            //  If you have any desktop specific settings, they can go in here
            this.scale.pageAlignHorizontally = true;
        }
        else
        {
            //  Same goes for mobile settings.
            //  In this case we're saying "scale the game, no lower than 480x260 and no higher than 1024x768"
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.setMinMax(480, 260, 1024, 768);
            this.scale.forceLandscape = true;
            this.scale.pageAlignHorizontally = true;
        }

    },

    preload: function () {

        //  Here we load the assets required for our preloader (in this case a background and a loading bar)
        this.load.image('preloaderBackground', 'images/preloader_background.jpg');
        this.load.image('preloaderBar', 'images/preloadr_bar.png');

    },

    create: function () {

        //  By this point the preloader assets have loaded to the cache, we've set the game settings
        //  So now let's start the real preloader going
        this.state.start('Preloader');

    }

};
