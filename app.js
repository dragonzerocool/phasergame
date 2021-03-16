var config = {
    type: Phaser.AUTO,
    width: 750,
    height: 750,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
        extend: {
            player: null,
            healthpoints: null,
            reticle: null,
            moveKeys: null,
            playerBullets: null,
            enemyBullets: null,
            time: 0,
        }
    }
};

var game = new Phaser.Game(config);
var speed = .5;
var LaserYellow = new Phaser.Class({
    Extends: Phaser.GameObjects.Image,
    initialize: function Laser (scene) {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'laser-yellow');
        this.speed = -1 * speed;
        this.born = 0;
        this.ySpeed = 0;
        this.setSize(12, 12, true);
    },
    fire: function (shooter) {
        this.setPosition(shooter.x, shooter.y);
        
        this.ySpeed = this.speed;
        this.born = 0 ; // Time since new bullet spawned
    },
    // Updates the position of the bullet each cycle
    update: function (time, delta) {
        this.y += this.ySpeed * delta;
        this.born += delta;
        if (this.born > 1800) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
});

var LaserRed = new Phaser.Class({
    Extends: Phaser.GameObjects.Image,
    initialize: function LaserRed (scene) {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'laser-red');
        this.speed = 1 * speed;
        this.born = 0;
        this.ySpeed = 0;    
    },
    fire: function (shooter) {
        this.setPosition(shooter.x, shooter.y);
           
        this.ySpeed = this.speed;
        this.born = 0 ; // Time since new bullet spawned
    },
    // Updates the position of the bullet each cycle
    update: function (time, delta) {
        this.y += this.ySpeed * delta;
        this.born += delta;
        if (this.born > 1800) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
});

var player;
var enemy;
var moveKeys;
var playerLaser;

function preload () {
    this.load.image('BG', './assets/background-black.png');
    this.load.image('player', './assets/pixel_ship_yellow.png');
    this.load.image('red', './assets/pixel_ship_red_small.png');
    this.load.image('green', './assets/pixel_ship_green_small.png');
    this.load.image('blue', './assets/pixel_ship_blue_small.png');
    this.load.image('laser-yellow', './assets/pixel_laser_yellow.png');
    this.load.image('laser-red', './assets/pixel_laser_red.png');
    this.load.image('laser-green', './assets/pixel_laser_green.png');
    this.load.image('laser-blue', './assets/pixel_laser_blue.png');
}
let velocity = 200;

function create () {
    this.physics.world.setBounds(0, 0, 750, 750);

    playerLaser = this.physics.add.group({classType: LaserYellow, runChildUpdate: true})
    redLaser = this.physics.add.group({classType: LaserRed, runChildUpdate: true});
    console.log(redLaser.children);

    let bg = this.add.image(375, 375, 'BG');
    bg.scaleX = bg.scaleY = 1.875;

    player = this.physics.add.sprite(375, 700, 'player');
    player.setCollideWorldBounds(true);
    player.health = 10;
    player.lastFired = 0;

    enemy = this.physics.add.sprite(100, 0, 'red');
    enemy.lastFired = 0;
    enemy.health = 3;

    // Creates object for input with WASD kets
    moveKeys = this.input.keyboard.addKeys({
        'up': Phaser.Input.Keyboard.KeyCodes.W,
        'down': Phaser.Input.Keyboard.KeyCodes.S,
        'left': Phaser.Input.Keyboard.KeyCodes.A,
        'right': Phaser.Input.Keyboard.KeyCodes.D,
        'fire': Phaser.Input.Keyboard.KeyCodes.SPACE
    });
}

function enemyHitCallback(enemyHit, bulletHit) {
     // Reduce health of enemy
    if (bulletHit.active === true && enemyHit.active === true) {
        enemyHit.health = enemyHit.health - 1;
        console.log("Enemy hp: ", enemyHit.health);

        // Kill enemy if health <= 0
        if (enemyHit.health <= 0) {
            enemyHit.setActive(false).setVisible(false);
        }

        // Destroy bullet
        bulletHit.setActive(false).setVisible(false);
    }
}

function playerHitCallback(playerHit, bulletHit) {
     // Reduce health of player
     if (bulletHit.active === true && playerHit.active === true) {
         playerHit.health = playerHit.health - 1;
         console.log("Player hp: ", playerHit.health);
 
        //  // Kill hp sprites and kill player if health <= 0
        //  if (playerHit.health == 2)
        //  {
        //      hp3.destroy();
        //  }
        //  else if (playerHit.health == 1)
        //  {
        //      hp2.destroy();
        //  }
        //  else
        //  {
        //      hp1.destroy();
        //      // Game over state should execute here
        //  }
 
         // Destroy bullet
         bulletHit.setActive(false).setVisible(false);
         bulletHit.destroy();
     }
}

function enemyFire(enemy, player, time, gameObject) {
    if (enemy.active === false) {
        return;
    }

    if ((time - enemy.lastFired) > 1500) {
        enemy.lastFired = time;

        // Get bullet from bullets group
        let laser = redLaser.get().setActive(true).setVisible(true);

        if (laser)
        {
            laser.fire(enemy);
            // Add collider between bullet and player
            gameObject.physics.add.collider(player, laser, playerHitCallback);
        }
    }
}

function update (time) {
    if (moveKeys.left.isDown) {
        player.setVelocityX(velocity * -1);
    } else if (moveKeys.right.isDown) {
        player.setVelocityX(velocity);
    } else {
        player.setVelocityX(0);
    }

    if (moveKeys.up.isDown) {
        player.setVelocityY(velocity * -1);
    } else if (moveKeys.down.isDown) {
        player.setVelocityY(velocity);
    } else {
        player.setVelocityY(0);
    }

    // enemy.setVelocityY(velocity * .5);

    if (moveKeys.fire.isDown) {
        if (player.active === false) {
            return;
        }
        if ((time - enemy.lastFired) > 500) {
            enemy.lastFired = time;

            let laser = playerLaser.get().setActive(true).setVisible(true);
            if (laser) {
                laser.fire(player);
                this.physics.add.collider(enemy, laser, enemyHitCallback);
            }
        }
    }

    // Make enemy fire
    enemyFire(enemy, player, time, this);
}