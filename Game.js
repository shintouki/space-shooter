
BasicGame.Game = function (game) {

    //  When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    this.game;      //  a reference to the currently running game (Phaser.Game)
    this.add;       //  used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
    this.camera;    //  a reference to the game camera (Phaser.Camera)
    this.cache;     //  the game cache (Phaser.Cache)
    this.input;     //  the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it. (Phaser.Input)
    this.load;      //  for preloading assets (Phaser.Loader)
    this.math;      //  lots of useful common math operations (Phaser.Math)
    this.sound;     //  the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
    this.stage;     //  the game stage (Phaser.Stage)
    this.time;      //  the clock (Phaser.Time)
    this.tweens;    //  the tween manager (Phaser.TweenManager)
    this.state;     //  the state manager (Phaser.StateManager)
    this.world;     //  the game world (Phaser.World)
    this.particles; //  the particle manager (Phaser.Particles)
    this.physics;   //  the physics manager (Phaser.Physics)
    this.rnd;       //  the repeatable random number generator (Phaser.RandomDataGenerator)

    //  You can use any of these from any function within this State.
    //  But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.

};

BasicGame.Game.prototype = {

    preload: function () {
        // Load background
        this.load.image('starfield', 'assets/starfield.png');

        // Load player weapons
        this.load.image('bullet', 'assets/bullet.png');
        this.load.image('laser', 'assets/laser.png');
        this.load.image('missile', 'assets/missile.png');
        this.load.image('missileMirror', 'assets/missile_mirror.png');
        this.load.image('fireball', 'assets/fireball.png');

        // Load enemy weapons
        this.load.image('enemyBullet', 'assets/enemy-bullet.png');
        
        // Load player ship
        this.load.image('player_ship', 'assets/player_ship.png', 32, 32);

        // Load enemy ship
        this.load.image('enemy_ship_1', 'assets/enemy_1.png', 32, 32);
        this.load.image('enemy_ship_2', 'assets/enemy_2.png', 32, 32);

        // Load power ups
        this.load.image('bulletPowerUp', 'assets/powerup.png');
        this.load.image('laserPowerUp', 'assets/laserPowerup.png');
        this.load.image('missilePowerUp', 'assets/missilePower.png');
        this.load.image('fireballPowerUp', 'assets/fireball_powerup.png');

        // Load explosions
        this.load.spritesheet('explosion1', 'assets/explosion.png', 32, 32);

    },

    create: function () {
        this.setupBackground();
        
        this.setupMissiles();
        this.setupFireballs();
        this.setupPlayerShip();
        this.setupEnemies();
        this.setupBullets();
        this.setupLasers();
        
        this.setupExplosions();
        this.setupLifeIcons();
        this.setupLaserPowerUps();
        this.setupMissilePowerUps();
        this.setupFireballPowerUps();
        this.setupRanks();
        this.setupText();

        this.cursors = this.input.keyboard.createCursorKeys();
    },

    checkCollisions: function () {
        // Player ships's weapon hits enemy
        this.physics.arcade.overlap(this.bulletPool, this.basicEnemyPool, this.enemyHitByBullet, null, this);
        this.physics.arcade.overlap(this.bulletPool, this.scaryEnemyPool, this.enemyHitByBullet, null, this);
        this.physics.arcade.overlap(this.laserPool, this.basicEnemyPool, this.enemyHitByLaser, null, this);
        this.physics.arcade.overlap(this.laserPool, this.scaryEnemyPool, this.enemyHitByLaser, null, this);
        this.physics.arcade.overlap(this.missilePool, this.basicEnemyPool, this.enemyHitByMissile, null, this);
        this.physics.arcade.overlap(this.missilePool, this.scaryEnemyPool, this.enemyHitByMissile, null, this);
        this.physics.arcade.overlap(this.missileMirrorPool, this.basicEnemyPool, this.enemyHitByMissile, null, this);
        this.physics.arcade.overlap(this.missileMirrorPool, this.scaryEnemyPool, this.enemyHitByMissile, null, this);
        this.physics.arcade.overlap(this.fireballPool, this.basicEnemyPool, this.enemyHitByFireball, null, this);
        this.physics.arcade.overlap(this.fireballPool, this.scaryEnemyPool, this.enemyHitByFireball, null, this);

        // Player ship hits enemy
        this.physics.arcade.overlap(this.player_ship, this.basicEnemyPool, this.playerHit, null, this);
        this.physics.arcade.overlap(this.player_ship, this.scaryEnemyPool, this.playerHit, null, this);

        // Enemy ship's weapon hits player
        this.physics.arcade.overlap(this.player_ship, this.enemyBulletPool, this.playerHit, null, this);

        // Pick up power up
        this.physics.arcade.overlap(this.player_ship, this.laserPowerUpPool, this.gainLaser, null, this);
        this.physics.arcade.overlap(this.player_ship, this.missilePowerUpPool, this.gainMissile, null, this);
        this.physics.arcade.overlap(this.player_ship, this.fireballPowerUpPool, this.gainFireball, null, this);
    },

    spawnEnemies: function () {
        if (this.nextEnemyAt < this.time.now && this.basicEnemyPool.countDead() > 0) {
            this.nextEnemyAt = this.time.now + this.enemyDelay;
            var basicEnemy = this.basicEnemyPool.getFirstExists(false);
            basicEnemy.reset(this.rnd.integerInRange(20, this.game.width - 20), 0, BasicGame.BASIC_ENEMY_HEALTH);
            basicEnemy.body.velocity.y = this.rnd.integerInRange(30, 60);
            basicEnemy.nextShotAt = 0;
        } 

        if (this.nextScaryEnemyAt < this.time.now && this.scaryEnemyPool.countDead() > 0) {
            this.nextScaryEnemyAt = this.time.now + this.nextScaryEnemyDelay;
            var scaryEnemy = this.scaryEnemyPool.getFirstExists(false);

            scaryEnemy.reset(this.rnd.integerInRange(20, this.game.width - 20), 0,
                BasicGame.SCARY_ENEMY_HEALTH
            );
            var target = this.rnd.integerInRange(20, this.game.width - 20);

            scaryEnemy.rotation = this.physics.arcade.moveToXY(scaryEnemy, target, this.game.height,
                this.rnd.integerInRange(BasicGame.SCARY_MIN_SPEED, BasicGame.SCARY_MAX_SPEED)
            ) - Math.PI / 2;
            
            scaryEnemy.nextShotAt = 0;    
        }
    },

    updateFireballPosition: function () {
        if (this.fireballOn) {
            this.fireball.reset(this.player_ship.x, this.player_ship.y - 50);
        }
        if (this.fireballOn && this.time.now > this.fireballExpire) {
            this.fireball.kill();
            fireballOn = false;
        }
    },

    processPlayerInput: function () {
        this.player_ship.body.velocity.x = 0;
        this.player_ship.body.velocity.y = 0;

        // Move player_ship to location of mouse pointer
        // Does not move if pointer is within 15 pixels of player_ship
        if (this.input.activePointer.isDown && this.physics.arcade.distanceToPointer(this.player_ship) > 15) {
            this.physics.arcade.moveToPointer(this.player_ship, this.player_ship.speed);
        }

        if (this.input.keyboard.isDown(Phaser.Keyboard.Z) || this.input.activePointer.isDown) {
            if (this.restartText && this.restartText.exists) {
                this.quitGame();
            } else {
                if (this.laserActivated) {
                    this.fireLaser();
                } else {
                    this.fireBullet();
                }
                if (this.missileActivated) {
                    this.fireMissile();
                }
                if (this.fireballActivated) {
                    this.fireFireball();
                }
            }
        }

        if (this.cursors.left.isDown) {
            this.player_ship.body.velocity.x = -this.player_ship.speed;
        } else if (this.cursors.right.isDown) {
            this.player_ship.body.velocity.x = this.player_ship.speed;
        }

        if (this.cursors.up.isDown) {
            this.player_ship.body.velocity.y = -this.player_ship.speed;
        } else if (this.cursors.down.isDown) {
            this.player_ship.body.velocity.y = this.player_ship.speed;
        }
    },

    processDelayedEffects: function () {
        // Remove instructions message
        if (this.instructions.exists && this.time.now > this.instructionsExpire) {
            this.instructions.destroy();
        }

        // Remove stage 1 message
        if (this.stage1.exists && this.time.now > this.stage1Expire) {
            this.stage1.destroy();
        }

        // Invulnerable time after getting hit
        if (this.invulUntil && this.invulUntil < this.time.now) {
            this.invulUntil = null;
        }

        if (this.showRestart && this.time.now > this.showRestart) {
            this.restartText = this.add.text(this.game.width / 2, this.game.height / 2 + 20,
                'Press Z or Click With Mouse to Restart Game',
                { font: '14px Orbitron', fill: 'white' }
            );
            this.restartText.anchor.setTo(0.5, 0.5);
            this.showRestart = false;
        }
    },

    update: function () {
        this.checkCollisions();
        this.spawnEnemies();
        this.enemyFire();
        this.updateFireballPosition();
        this.processPlayerInput();
        this.processDelayedEffects();
    },

    render: function () {
        // Debug mode to see hitboxes

        // this.game.debug.body(this.player_ship);
        
        // this.debugGroup(this.basicEnemyPool);
        // this.debugGroup(this.scaryEnemyPool);
        // this.debugGroup(this.bulletPool);
        // this.debugGroup(this.laserPool);
        // this.debugGroup(this.missilePool);
        // this.debugGroup(this.missileMirrorPool);
        // // this.debugGroup(this.fireballPool)
        // this.debugGroup(this.enemyBulletPool);
        // this.debugGroup(this.laserPowerUpPool);
        // this.debugGroup(this.missilePowerUpPool);
        // this.debugGroup(this.fireballPowerUpPool);
    },

    debugGroup: function (group) {
        group.forEachAlive(function (object) {
            this.game.debug.body(object);
        }, this);
    },

    setupBackground: function () {
        this.starfield = this.add.tileSprite(0, 0, this.game.width, this.game.height, 'starfield');
        this.starfield.autoScroll(0, 12);
    },

    setupPlayerShip: function() {
        this.player_ship = this.add.sprite(this.game.width / 2, this.game.height - 40, 'player_ship');
        this.player_ship.anchor.setTo(0.5, 0.5);
        this.physics.enable(this.player_ship, Phaser.Physics.ARCADE);
        this.player_ship.speed = 250;
        this.player_ship.body.collideWorldBounds = true;
        this.player_ship.body.setSize(10, 10, 0, -5);
        this.laserActivated = false;
        this.missileActivated = false;
        this.fireballActivated = false;
        this.fireballOn = false;
    },

    setupEnemies: function() {
        this.basicEnemyPool = this.add.group();
        this.basicEnemyPool.enableBody = true;
        this.basicEnemyPool.physicsBodyType = Phaser.Physics.ARCADE;
        this.basicEnemyPool.createMultiple(500, 'enemy_ship_1');
        this.basicEnemyPool.setAll('anchor.x', 0.5);
        this.basicEnemyPool.setAll('anchor.y', 0.5);
        this.basicEnemyPool.setAll('outOfBoundsKill', true);
        this.basicEnemyPool.setAll('checkWorldBounds', true);
        this.basicEnemyPool.setAll('reward', BasicGame.BASIC_ENEMY_REWARD, false, false, 0, true);
        this.basicEnemyPool.setAll('laserDropRate', BasicGame.BASIC_ENEMY_LASER_DROP_RATE, false, false, 0, true);
        this.basicEnemyPool.setAll('missileDropRate', BasicGame.BASIC_ENEMY_MISSILE_DROP_RATE, false, false, 0, true);
        this.basicEnemyPool.setAll('fireballDropRate', BasicGame.BASIC_ENEMY_FIREBALL_DROP_RATE, false, false, 0, true);


        this.nextEnemyAt = 0;
        this.enemyDelay = 1000;

        this.scaryEnemyPool = this.add.group();
        this.scaryEnemyPool.enableBody = true;
        this.scaryEnemyPool.physicsBodyType = Phaser.Physics.ARCADE;
        this.scaryEnemyPool.createMultiple(500, 'enemy_ship_2');
        this.scaryEnemyPool.setAll('anchor.x', 0.5);
        this.scaryEnemyPool.setAll('anchor.y', 0.5);
        this.scaryEnemyPool.setAll('outOfBoundsKill', true);
        this.scaryEnemyPool.setAll('checkWorldBounds', true);
        this.scaryEnemyPool.setAll('reward', BasicGame.SCARY_ENEMY_REWARD, false, false, 0, true);
        this.scaryEnemyPool.setAll('laserDropRate', BasicGame.SCARY_ENEMY_LASER_DROP_RATE, false, false, 0, true);
        this.scaryEnemyPool.setAll('missileDropRate', BasicGame.SCARY_ENEMY_MISSILE_DROP_RATE, false, false, 0, true);
        this.scaryEnemyPool.setAll('fireballDropRate', BasicGame.SCARY_ENEMY_FIREBALL_DROP_RATE, false, false, 0, true);
        
        this.nextScaryEnemyAt = this.time.now + Phaser.Timer.SECOND * 5;
        this.nextScaryEnemyDelay = BasicGame.SPAWN_SCARY_DELAY;
    },



    setupBullets: function() {
        this.enemyBulletPool = this.add.group();
        this.enemyBulletPool.enableBody = true;
        this.enemyBulletPool.physicsBodyType = Phaser.Physics.ARCADE;
        this.enemyBulletPool.createMultiple(800, 'enemyBullet');
        this.enemyBulletPool.setAll('anchor.x', 0.5);
        this.enemyBulletPool.setAll('anchor.y', 0.5);
        this.enemyBulletPool.setAll('outOfBoundsKill', true);
        this.enemyBulletPool.setAll('checkWorldBounds', true);
        this.enemyBulletPool.setAll('reward', 0, false, false, 0, true);

        this.bulletPool = this.add.group();
        this.bulletPool.enableBody = true;
        this.bulletPool.physicsBodyType = Phaser.Physics.ARCADE;
        this.bulletPool.createMultiple(100, 'bullet');
        this.bulletPool.setAll('anchor.x', 0.5);
        this.bulletPool.setAll('anchor.y', 0.5);
        this.bulletPool.setAll('outOfBoundsKill', true);
        this.bulletPool.setAll('checkWorldBounds', true);

        this.nextShotAt = 0;
        this.shotDelay = BasicGame.BULLET_DELAY;
    },

    setupLasers: function () {
        this.laserPool = this.add.group();
        this.laserPool.enableBody = true;
        this.laserPool.physicsBodyType = Phaser.Physics.ARCADE;
        this.laserPool.createMultiple(100, 'laser');
        this.laserPool.setAll('anchor.x', 0.5);
        this.laserPool.setAll('anchor.y', 0.5);
        this.laserPool.setAll('outOfBoundsKill', true);
        this.laserPool.setAll('checkWorldBounds', true);

        this.nextLaserShotAt = 0;
        this.LaserShotDelay = BasicGame.LASER_DELAY;
    },

    setupMissiles: function () {
        this.missilePool = this.add.group();
        this.missilePool.enableBody = true;
        this.missilePool.physicsBodyType = Phaser.Physics.ARCADE;
        this.missilePool.createMultiple(25, 'missile');
        this.missilePool.setAll('anchor.x', 0.5);
        this.missilePool.setAll('anchor.y', 0.5);
        this.missilePool.setAll('outOfBoundsKill', true);
        this.missilePool.setAll('checkWorldBounds', true);

        this.missileMirrorPool = this.add.group();
        this.missileMirrorPool.enableBody = true;
        this.missileMirrorPool.physicsBodyType = Phaser.Physics.ARCADE;
        this.missileMirrorPool.createMultiple(25, 'missileMirror');
        this.missileMirrorPool.setAll('anchor.x', 0.5);
        this.missileMirrorPool.setAll('anchor.y', 0.5);
        this.missileMirrorPool.setAll('outOfBoundsKill', true);
        this.missileMirrorPool.setAll('checkWorldBounds', true);

        this.nextMissileShotAt = 0;
        this.missileShotDelay = BasicGame.MISSILE_DELAY;
    },

    setupFireballs: function () {
        this.fireballPool = this.add.group();
        this.fireballPool.enableBody = true;
        this.fireballPool.physicsBodyType = Phaser.Physics.ARCADE;
        this.fireballPool.createMultiple(20, 'fireball');
        this.fireballPool.setAll('anchor.x', 0.5);
        this.fireballPool.setAll('anchor.y', 0.5);
        this.fireballPool.setAll('outOfBoundsKill', true);
        this.fireballPool.setAll('checkWorldBounds', true);

        this.nextFireballShotAt = 0;
        this.FireballShotDelay = BasicGame.FIREBALL_DELAY;
    },

    setupExplosions: function() {
        this.explosionPool = this.add.group();
        this.explosionPool.enableBody = true;
        this.explosionPool.physicsBodyType = Phaser.Physics.ARCADE;
        this.explosionPool.createMultiple(100, 'explosion1');
        this.explosionPool.setAll('anchor.x', 0.5);
        this.explosionPool.setAll('anchor.y', 0.5);
        this.explosionPool.forEach(function (explosion) {
            explosion.animations.add('boom');
        });
    },

    setupLifeIcons: function () {
        this.lives = this.add.group();
        var firstLifeIconX = this.game.width - 10 - (BasicGame.EXTRA_LIVES * 30);
        for (var i = 0; i < BasicGame.EXTRA_LIVES; i++) {
            var life = this.lives.create(firstLifeIconX + (30 * i), 30, 'player_ship');
            life.scale.setTo(0.5, 0.5);
            life.anchor.setTo(0.5, 0.5);
        }
    },

    setupLaserPowerUps: function () {
        this.laserPowerUpPool = this.add.group();
        this.laserPowerUpPool.enableBody = true;
        this.laserPowerUpPool.physicsBodyType = Phaser.Physics.ARCADE;
        this.laserPowerUpPool.createMultiple(5, 'laserPowerUp');
        this.laserPowerUpPool.setAll('anchor.x', 0.5);
        this.laserPowerUpPool.setAll('anchor.y', 0.5);
        this.laserPowerUpPool.setAll('outOfBoundsKill', true);
        this.laserPowerUpPool.setAll('checkWorldBounds', true);
        this.laserPowerUpPool.setAll('reward', BasicGame.POWER_UP_REWARD, false, false, 0, true);
    },

    setupMissilePowerUps: function () {
        this.missilePowerUpPool = this.add.group();
        this.missilePowerUpPool.enableBody = true;
        this.missilePowerUpPool.physicsBodyType = Phaser.Physics.ARCADE;
        this.missilePowerUpPool.createMultiple(5, 'missilePowerUp');
        this.missilePowerUpPool.setAll('anchor.x', 0.5);
        this.missilePowerUpPool.setAll('anchor.y', 0.5);
        this.missilePowerUpPool.setAll('outOfBoundsKill', true);
        this.missilePowerUpPool.setAll('checkWorldBounds', true);
        this.missilePowerUpPool.setAll('reward', BasicGame.POWER_UP_REWARD, false, false, 0, true);
    },

    setupFireballPowerUps: function () {
        this.fireballPowerUpPool = this.add.group();
        this.fireballPowerUpPool.enableBody = true;
        this.fireballPowerUpPool.physicsBodyType = Phaser.Physics.ARCADE;
        this.fireballPowerUpPool.createMultiple(5, 'fireballPowerUp');
        this.fireballPowerUpPool.setAll('anchor.x', 0.5);
        this.fireballPowerUpPool.setAll('anchor.y', 0.5);
        this.fireballPowerUpPool.setAll('outOfBoundsKill', true);
        this.fireballPowerUpPool.setAll('checkWorldBounds', true);
        this.fireballPowerUpPool.setAll('reward', BasicGame.POWER_UP_REWARD, false, false, 0, true);
    },

    setupRanks: function () {

    },

    setupText: function() {
        // How to play instructions at beginning
        this.instructions = this.add.text(this.game.width / 2, this.game.height - 100,
            'Use Arrow Keys or Mouse to Move\n Press Z or Click With Mouse to Fire',
            { font: '18px Orbitron', fill: 'white', align: 'center' }
        );
        this.instructions.anchor.setTo(0.5, 0.5);
        this.instructionsExpire = this.time.now + 10000;

        // Stage 1 text
        this.stage1 = this.add.text(this.game.width / 2, this.game.height / 2,
            'Stage Moni',
            { font: '40px Orbitron', fill: 'white', align: 'center' }
        );
        this.stage1.anchor.setTo(0.5, 0.5);
        this.stage1Expire = this.time.now + 5000;

        // Score counter
        this.score = 0;
        this.scoreText = this.add.text(this.game.width / 2, 25, ' ' + this.score,
            { font: '20px Orbitron', fill: 'white', align: 'center' }
        );
        this.scoreText.anchor.setTo(0.5, 0.5);
    },

    playerHit: function (player_ship, enemy_ship) {
        if (this.invulUntil && this.invulUntil > this.time.now) {
            return;
        }
        this.damageEnemy(enemy_ship, BasicGame.CRASH_DAMAGE);
        // this.explode(player_ship);
        // player_ship.kill();
        var life = this.lives.getFirstAlive();
        if (life !== null) {
            life.kill();
            this.laserActivated = false;
            this.missileActivated = false;
            this.fireballActivated = false;
            this.invulUntil = this.time.now + BasicGame.INVULNERABLE_TIME;
        } else {
            this.explode(player_ship);
            player_ship.kill();
            this.displayEnd(false);
        }
    },

    enemyHitByBullet: function (bullet, enemy_ship) {
        bullet.kill();
        this.damageEnemy(enemy_ship, BasicGame.BASIC_BULLET_DAMAGE);
    },

    enemyHitByLaser: function (laser, enemy_ship) {
        this.damageEnemy(enemy_ship, BasicGame.LASER_DAMAGE);
    },

    enemyHitByMissile: function (missile, enemy_ship) {
        missile.kill();
        this.damageEnemy(enemy_ship, BasicGame.MISSILE_DAMAGE);
    },

    enemyHitByFireball: function (fireball, enemy_ship) {
        // fireball.kill();
        this.damageEnemy(enemy_ship, BasicGame.FIREBALL_DAMAGE);
    },

    damageEnemy: function (enemy_ship, damage) {
        enemy_ship.damage(damage);
        if (!enemy_ship.alive) {
            this.explode(enemy_ship);
            this.spawnPowerUp(enemy_ship);
            this.addToScore(enemy_ship.reward);
        }
    },

    explode: function (sprite) {
        if (this.explosionPool.countDead() > 0) {
            var explosion = this.explosionPool.getFirstExists(false);
            explosion.reset(sprite.x, sprite.y);
            explosion.play('boom', 10, false, true);
            explosion.body.velocity.x = sprite.body.velocity.x;
            explosion.body.velocity.y = sprite.body.velocity.y;
        }
    },

    fireBullet: function () {
        if (!this.player_ship.alive || this.nextShotAt > this.time.now) {
            return;
        }

        this.nextShotAt = this.time.now + this.shotDelay;

        var bullet = this.bulletPool.getFirstExists(false);
        bullet.reset(this.player_ship.x, this.player_ship.y - 20);
        bullet.body.velocity.y = -500;
    },

    fireLaser: function () {
        if (!this.player_ship.alive || this.nextLaserShotAt > this.time.now) {
            return;
        }

        this.nextLaserShotAt = this.time.now + this.LaserShotDelay;

        var laser = this.laserPool.getFirstExists(false);
        laser.reset(this.player_ship.x, this.player_ship.y - 20);
        laser.body.velocity.y = -500;
    },

    fireMissile: function () {
        if (!this.player_ship.alive || this.nextMissileShotAt > this.time.now) {
            return;
        }

        this.nextMissileShotAt = this.time.now + this.missileShotDelay;

        var missileLeft = this.missilePool.getFirstExists(false);
        missileLeft.scale.set(0.75, 0.75);
        missileLeft.angle = -90;
        missileLeft.body.setSize(12, 40, 0,0);

        missileLeft.reset(this.player_ship.x + 15, this.player_ship.y - 10);
        missileLeft.body.velocity.y = -250;

        var missileRight = this.missileMirrorPool.getFirstExists(false);
        missileRight.scale.set(0.75, 0.75);
        missileRight.angle = -90;
        missileRight.body.setSize(12, 40, 0,0);

        missileRight.reset(this.player_ship.x - 15, this.player_ship.y - 10);
        missileRight.body.velocity.y = -250;
    },

    fireFireball: function () {
        if (!this.player_ship.alive || this.nextFireballShotAt > this.time.now) {
            return;
        }

        this.nextFireballShotAt = this.time.now + this.FireballShotDelay;
        this.fireballOn = true;

        this.fireball = this.fireballPool.getFirstExists(false);
        this.fireball.scale.set(2.25, 3);
        this.fireball.angle = 90;
        this.fireball.reset(this.player_ship.x, this.player_ship.y - 50);
        this.fireball.body.setSize(60, 50, -5, -20);

        this.fireballExpire = this.time.now + 1000;
        // this.game.time.events.add(1000, function() {
        //     this.fireball.kill();
        //     fireballOn = false;
        // }, this);
    },

    enemyFire: function () {
        this.basicEnemyPool.forEachAlive(function (enemy_ship) {
            if (this.time.now > enemy_ship.nextShotAt && this.enemyBulletPool.countDead() > 0) {
                var bullet = this.enemyBulletPool.getFirstExists(false);
                bullet.reset(enemy_ship.x, enemy_ship.y);
                this.physics.arcade.moveToXY(bullet, enemy_ship.x, this.game.height, BasicGame.ENEMY_BULLET_VELOCITY);
                enemy_ship.nextShotAt = this.time.now + BasicGame.BASIC_ENEMY_SHOT_DELAY;
            }
        }, this);

        this.scaryEnemyPool.forEachAlive(function (enemy_ship) {
            if (this.time.now > enemy_ship.nextShotAt && this.enemyBulletPool.countDead() > 0) {
                var bullet = this.enemyBulletPool.getFirstExists(false);
                bullet.reset(enemy_ship.x, enemy_ship.y);
                this.physics.arcade.moveToObject(bullet, this.player_ship, BasicGame.ENEMY_BULLET_VELOCITY);
                enemy_ship.nextShotAt = this.time.now + BasicGame.SCARY_ENEMY_SHOT_DELAY;
            }
        }, this);
    },

    addToScore: function (score) {
        this.score += score;
        this.scoreText.text = this.score;
        if (this.score >= 500000) {
            this.basicEnemyPool.destroy();
            this.scaryEnemyPool.destroy();
            this.enemyBulletPool.destroy();
            this.displayEnd(true);
        }
    },

    spawnPowerUp: function (enemy_ship) {
        if (this.missilePowerUpPool.countDead() === 0) {
            return;
        }

        // Laser power up
        if (this.rnd.frac() < enemy_ship.laserDropRate && this.laserPowerUpPool.countDead() > 0) {
            var laserPowerUp = this.laserPowerUpPool.getFirstExists(false);
            laserPowerUp.scale.set(0.75, 0.75);
            laserPowerUp.reset(enemy_ship.x, enemy_ship.y);
            laserPowerUp.body.velocity.y = 75;
        }

        // Missile power up
        if (this.rnd.frac() < enemy_ship.missileDropRate && this.missilePowerUpPool.countDead() > 0) {
            var missilePowerUp = this.missilePowerUpPool.getFirstExists(false);
            missilePowerUp.scale.set(0.75, 0.75);
            missilePowerUp.reset(enemy_ship.x, enemy_ship.y);
            missilePowerUp.body.velocity.y = 75;
        }

        // Fireball power up
        if (this.rnd.frac() < enemy_ship.fireballDropRate && this.fireballPowerUpPool.countDead() > 0) {
            var fireballPowerUp = this.fireballPowerUpPool.getFirstExists(false);
            fireballPowerUp.scale.set(0.75, 0.75);
            fireballPowerUp.reset(enemy_ship.x, enemy_ship.y);
            fireballPowerUp.body.velocity.y = 75;
        }
    },

    gainLaser: function (player_ship, laserPowerUp) {
        this.addToScore(laserPowerUp.reward);
        laserPowerUp.kill();
        if (!this.laserActivated) {
            this.laserActivated = true;
        }

        var laserMessage = "Laser";
        this.laserText = this.add.text(player_ship.x, player_ship.y + 25, laserMessage,
            { font: '10px Orbitron', fill: 'white' }
        );
        this.laserText.anchor.setTo(0.5, 0.5);

        // Wait 0.5s, then fade out in 1.5s
        this.game.time.events.add(500, function () {
            this.game.add.tween(this.laserText).to({ alpha: 0 }, 1500, Phaser.Easing.Linear.None, true);
        }, this);
    },

    gainMissile: function (player_ship, missilePowerUp) {
        this.addToScore(missilePowerUp.reward);
        missilePowerUp.kill();
        if (!this.missileActivated) {
            this.missileActivated = true;
        }

        var missileMessage = "Missile";
        this.missileText = this.add.text(player_ship.x, player_ship.y + 25, missileMessage,
            { font: '10px Orbitron', fill: 'white' }
        );
        this.missileText.anchor.setTo(0.5, 0.5);

        // Wait 0.5s, then fade out in 1.5s
        this.game.time.events.add(500, function () {
            this.game.add.tween(this.missileText).to({ alpha: 0 }, 1500, Phaser.Easing.Linear.None, true);
        }, this);
    },

    gainFireball: function (player_ship, fireballPowerUp) {
        this.addToScore(fireballPowerUp.reward);
        fireballPowerUp.kill();
        if (!this.fireballActivated) {
            this.fireballActivated = true;
        }

        var fireballMessage = "Fireball";
        this.fireballText = this.add.text(player_ship.x, player_ship.y + 25, fireballMessage,
            { font: '10px Orbitron', fill: 'white' }
        );
        this.fireballText.anchor.setTo(0.5, 0.5);

        // Wait 0.5s, then fade out in 1.5s
        this.game.time.events.add(500, function () {
            this.game.add.tween(this.fireballText).to({ alpha: 0 }, 1500, Phaser.Easing.Linear.None, true);
        }, this);
    },

    displayEnd: function (win) {
        if (this.endText && this.endText.exists) {
            return;
        }
        
        var endMessage = win ? 'You win!' : 'Game Over!';
        this.endText = this.add.text(this.game.width / 2, this.game.height / 2 - 60, endMessage,
            { font: '60px Orbitron', fill: 'white' }
        );
        this.endText.anchor.setTo(0.5, 0);

        this.showRestart = this.time.now + BasicGame.RESTART_MESSAGE_DELAY;
    },

    quitGame: function (pointer) {

        this.starfield.destroy();
        // this.player_ship.destroy();
        this.basicEnemyPool.destroy();
        this.bulletPool.destroy();
        this.laserPool.destroy();
        this.missilePool.destroy();
        this.fireballPool.destroy();
        this.explosionPool.destroy();
        this.laserPowerUpPool.destory();
        this.missilePowerUpPool.destroy();
        this.fireballPowerUpPool.destroy();
        this.instructions.destroy();
        this.scoreText.destroy();
        this.endText.destroy();
        this.restartText.destroy();

        this.state.start('Game');

    }

};
