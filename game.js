
/* =========================================
   KOLLINSKY BATTLE ROYALE
   3D GAME JAVASCRIPT
========================================= */

"use strict";


// =========================================
// GAME VARIABLES
// =========================================

let scene;
let camera;
let renderer;

let player;
let playerGroup;

let enemies = [];

let bullets = [];

let gameStarted = false;
let gameOver = false;

let health = 100;
let ammo = 30;
let reserveAmmo = 120;

let kills = 0;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

let running = false;

let shooting = false;
let aiming = false;

let playerSpeed = 0.12;

let cameraDistance = 6;

let clock;

const keys = {};

const worldSize = 180;


// =========================================
// HTML ELEMENTS
// =========================================

const startScreen = document.getElementById("startScreen");

const startButton = document.getElementById("startButton");

const gameContainer = document.getElementById("gameContainer");

const gameCanvas = document.getElementById("game");

const mobileControls = document.getElementById("mobileControls");

const healthText = document.getElementById("health");

const killsText = document.getElementById("kills");

const aliveText = document.getElementById("alive");

const ammoText = document.getElementById("ammoCount");

const messageText = document.getElementById("message");

const zoneText = document.getElementById("zone");


// =========================================
// INITIALIZE GAME
// =========================================

function initGame() {

    if (typeof THREE === "undefined") {

        alert("Three.js could not load.");

        return;

    }


    // SCENE

    scene = new THREE.Scene();

    scene.background = new THREE.Color(0x87ceeb);

    scene.fog = new THREE.Fog(
        0x87ceeb,
        100,
        220
    );


    // CAMERA

    camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.1,
        500
    );


    // RENDERER

    renderer = new THREE.WebGLRenderer({

        canvas: gameCanvas,

        antialias: true

    });

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );


    // LIGHTING

    const ambientLight = new THREE.HemisphereLight(
        0xffffff,
        0x405040,
        2
    );

    scene.add(ambientLight);


    const sun = new THREE.DirectionalLight(
        0xffffff,
        2
    );

    sun.position.set(
        50,
        100,
        30
    );

    scene.add(sun);


    // WORLD

    createWorld();


    // PLAYER

    createPlayer();


    // ENEMIES

    createEnemies();


    // CLOCK

    clock = new THREE.Clock();


    // CAMERA

    updateCamera();


    // EVENTS

    setupControls();


    // RESIZE

    window.addEventListener(
        "resize",
        resizeGame
    );


    // GAME LOOP

    animate();

}


// =========================================
// CREATE WORLD
// =========================================

function createWorld() {

    // GROUND

    const groundGeometry = new THREE.PlaneGeometry(
        worldSize,
        worldSize
    );

    const groundMaterial = new THREE.MeshStandardMaterial({

        color: 0x477b38,

        roughness: 1

    });

    const ground = new THREE.Mesh(
        groundGeometry,
        groundMaterial
    );

    ground.rotation.x = -Math.PI / 2;

    ground.position.y = 0;

    scene.add(ground);


    // GRID

    const grid = new THREE.GridHelper(
        worldSize,
        45,
        0x355c2c,
        0x355c2c
    );

    grid.position.y = 0.02;

    scene.add(grid);


    // BUILDINGS

    for (let i = 0; i < 25; i++) {

        const width = randomBetween(5, 12);

        const height = randomBetween(4, 15);

        const depth = randomBetween(5, 12);


        const geometry = new THREE.BoxGeometry(
            width,
            height,
            depth
        );


        const material = new THREE.MeshStandardMaterial({

            color: randomBuildingColor(),

            roughness: 0.9

        });


        const building = new THREE.Mesh(
            geometry,
            material
        );


        building.position.set(

            randomBetween(-75, 75),

            height / 2,

            randomBetween(-75, 75)

        );


        scene.add(building);

    }


    // TREES

    for (let i = 0; i < 45; i++) {

        createTree(

            randomBetween(-85, 85),

            randomBetween(-85, 85)

        );

    }


    // SKY DECORATION

    const sunGeometry = new THREE.SphereGeometry(
        8,
        16,
        16
    );

    const sunMaterial = new THREE.MeshBasicMaterial({

        color: 0xfff3a0

    });

    const skySun = new THREE.Mesh(
        sunGeometry,
        sunMaterial
    );

    skySun.position.set(
        80,
        70,
        -100
    );

    scene.add(skySun);

}


// =========================================
// CREATE TREE
// =========================================

function createTree(x, z) {

    const trunkGeometry = new THREE.CylinderGeometry(
        0.4,
        0.6,
        3,
        8
    );

    const trunkMaterial = new THREE.MeshStandardMaterial({

        color: 0x654321

    });


    const trunk = new THREE.Mesh(
        trunkGeometry,
        trunkMaterial
    );

    trunk.position.set(
        x,
        1.5,
        z
    );

    scene.add(trunk);


    const leavesGeometry = new THREE.SphereGeometry(
        2.5,
        8,
        8
    );

    const leavesMaterial = new THREE.MeshStandardMaterial({

        color: 0x1d6b2a

    });


    const leaves = new THREE.Mesh(
        leavesGeometry,
        leavesMaterial
    );

    leaves.position.set(
        x,
        4,
        z
    );

    scene.add(leaves);

}


// =========================================
// CREATE PLAYER
// =========================================

function createPlayer() {

    playerGroup = new THREE.Group();


    // BODY

    const bodyGeometry = new THREE.BoxGeometry(
        1,
        1.5,
        0.6
    );

    const bodyMaterial = new THREE.MeshStandardMaterial({

        color: 0x2455a4

    });


    const body = new THREE.Mesh(
        bodyGeometry,
        bodyMaterial
    );

    body.position.y = 1.5;

    playerGroup.add(body);


    // HEAD

    const headGeometry = new THREE.SphereGeometry(
        0.35,
        12,
        12
    );

    const headMaterial = new THREE.MeshStandardMaterial({

        color: 0xe0b18a

    });


    const head = new THREE.Mesh(
        headGeometry,
        headMaterial
    );

    head.position.y = 2.5;

    playerGroup.add(head);


    // LEGS

    const legGeometry = new THREE.BoxGeometry(
        0.3,
        1,
        0.35
    );

    const legMaterial = new THREE.MeshStandardMaterial({

        color: 0x202020

    });


    const leftLeg = new THREE.Mesh(
        legGeometry,
        legMaterial
    );

    leftLeg.position.set(
        -0.25,
        0.5,
        0
    );

    playerGroup.add(leftLeg);


    const rightLeg = new THREE.Mesh(
        legGeometry,
        legMaterial
    );

    rightLeg.position.set(
        0.25,
        0.5,
        0
    );

    playerGroup.add(rightLeg);


    // PLAYER POSITION

    playerGroup.position.set(
        0,
        0,
        0
    );


    scene.add(playerGroup);


    player = playerGroup;

}


// =========================================
// CREATE ENEMIES
// =========================================

function createEnemies() {

    const enemyCount = 12;


    for (let i = 0; i < enemyCount; i++) {

        const enemy = new THREE.Group();


        // BODY

        const bodyGeometry = new THREE.BoxGeometry(
            1,
            1.5,
            0.6
        );

        const bodyMaterial = new THREE.MeshStandardMaterial({

            color: 0x9c2929

        });


        const body = new THREE.Mesh(
            bodyGeometry,
            bodyMaterial
        );

        body.position.y = 1.5;

        enemy.add(body);


        // HEAD

        const headGeometry = new THREE.SphereGeometry(
            0.35,
            12,
            12
        );

        const headMaterial = new THREE.MeshStandardMaterial({

            color: 0xd2a27e

        });


        const head = new THREE.Mesh(
            headGeometry,
            headMaterial
        );

        head.position.y = 2.5;

        enemy.add(head);


        // POSITION

        enemy.position.set(

            randomBetween(-60, 60),

            0,

            randomBetween(-60, 60)

        );


        // ENEMY DATA

        enemy.userData.health = 100;

        enemy.userData.alive = true;

        enemy.userData.shootCooldown = 0;

        enemy.userData.speed = randomBetween(
            0.025,
            0.045
        );


        scene.add(enemy);

        enemies.push(enemy);

    }


    updateAliveCount();

}


// =========================================
// GAME CONTROLS
// =========================================

function setupControls() {


    // KEYBOARD

    window.addEventListener(
        "keydown",
        function(event) {

            keys[event.code] = true;


            if (event.code === "KeyW") {
                moveForward = true;
            }

            if (event.code === "KeyS") {
                moveBackward = true;
            }

            if (event.code === "KeyA") {
                moveLeft = true;
            }

            if (event.code === "KeyD") {
                moveRight = true;
            }

            if (event.code === "ShiftLeft") {
                running = true;
            }

            if (event.code === "Space") {
                jumpPlayer();
            }

            if (event.code === "KeyR") {
                reloadWeapon();
            }

            if (event.code === "KeyF") {
                shootWeapon();
            }

        }
    );


    window.addEventListener(
        "keyup",
        function(event) {

            keys[event.code] = false;


            if (event.code === "KeyW") {
                moveForward = false;
            }

            if (event.code === "KeyS") {
                moveBackward = false;
            }

            if (event.code === "KeyA") {
                moveLeft = false;
            }

            if (event.code === "KeyD") {
                moveRight = false;
            }

            if (event.code === "ShiftLeft") {
                running = false;
            }

        }
    );


    // SHOOT BUTTON

    const shootButton = document.getElementById(
        "shootButton"
    );

    if (shootButton) {

        shootButton.addEventListener(
            "pointerdown",
            function(event) {

                event.preventDefault();

                shootWeapon();

            }
        );

    }


    // JUMP BUTTON

    const jumpButton = document.getElementById(
        "jumpButton"
    );

    if (jumpButton) {

        jumpButton.addEventListener(
            "pointerdown",
            function(event) {

                event.preventDefault();

                jumpPlayer();

            }
        );

    }


    // RELOAD BUTTON

    const reloadButton = document.getElementById(
        "reloadButton"
    );

    if (reloadButton) {

        reloadButton.addEventListener(
            "pointerdown",
            function(event) {

                event.preventDefault();

                reloadWeapon();

            }
        );

    }


    // RUN BUTTON

    const runButton = document.getElementById(
        "runButton"
    );

    if (runButton) {

        runButton.addEventListener(
            "pointerdown",
            function(event) {

                running = true;

            }
        );

        runButton.addEventListener(
            "pointerup",
            function() {

                running = false;

            }
        );

        runButton.addEventListener(
            "pointercancel",
            function() {

                running = false;

            }
        );

    }


    // JOYSTICK

    setupJoystick();


    // AIM

    const aimButton = document.getElementById(
        "aimButton"
    );

    if (aimButton) {

        aimButton.addEventListener(
            "pointerdown",
            function() {

                aiming = true;

            }
        );

        aimButton.addEventListener(
            "pointerup",
            function() {

                aiming = false;

            }
        );

    }


    // START GAME

    if (startButton) {

        startButton.addEventListener(
            "click",
            startGame
        );

    }

}


// =========================================
// MOBILE JOYSTICK
// =========================================

function setupJoystick() {

    const joystick = document.getElementById(
        "joystick"
    );

    const knob = document.getElementById(
        "joystickKnob"
    );


    if (!joystick || !knob) {
        return;
    }


    let joystickActive = false;


    joystick.addEventListener(
        "pointerdown",
        function(event) {

            joystickActive = true;

            joystick.setPointerCapture(
                event.pointerId
            );

            updateJoystick(event);

        }
    );


    joystick.addEventListener(
        "pointermove",
        function(event) {

            if (!joystickActive) {
                return;
            }

            updateJoystick(event);

        }
    );


    joystick.addEventListener(
        "pointerup",
        resetJoystick
    );


    joystick.addEventListener(
        "pointercancel",
        resetJoystick
    );


    function updateJoystick(event) {

        const rect = joystick.getBoundingClientRect();


        const centerX = rect.width / 2;

        const centerY = rect.height / 2;


        let x = event.clientX - rect.left - centerX;

        let y = event.clientY - rect.top - centerY;


        const maxDistance = 35;


        const distance = Math.sqrt(
            x * x + y * y
        );


        if (distance > maxDistance) {

            x = x / distance * maxDistance;

            y = y / distance * maxDistance;

        }


        knob.style.left =
            `calc(50% + ${x}px)`;

        knob.style.top =
            `calc(50% + ${y}px)`;


        moveForward = y < -10;

        moveBackward = y > 10;

        moveLeft = x < -10;

        moveRight = x > 10;

    }


    function resetJoystick() {

        joystickActive = false;


        knob.style.left = "50%";

        knob.style.top = "50%";


        moveForward = false;

        moveBackward = false;

        moveLeft = false;

        moveRight = false;

    }

}


// =========================================
// START GAME
// =========================================

function startGame() {

    if (gameStarted) {
        return;
    }


    gameStarted = true;

    gameOver = false;


    startScreen.style.display = "none";


    if (messageText) {

        messageText.textContent = "BATTLE START";

    }


    setTimeout(
        function() {

            if (messageText) {

                messageText.textContent = "";

            }

        },
        2000
    );


    updateCamera();

}


// =========================================
// PLAYER MOVEMENT
// =========================================

function updatePlayer(delta) {

    if (!player || !gameStarted || gameOver) {
        return;
    }


    let speed = running ? 12 : 7;


    if (aiming) {

        speed *= 0.65;

    }


    const movement = speed * delta;


    const direction = new THREE.Vector3();


    if (moveForward) {
        direction.z -= 1;
    }

    if (moveBackward) {
        direction.z += 1;
    }

    if (moveLeft) {
        direction.x -= 1;
    }

    if (moveRight) {
        direction.x += 1;
    }


    if (direction.length() > 0) {

        direction.normalize();


        player.position.x +=
            direction.x * movement;

        player.position.z +=
            direction.z * movement;


        player.rotation.y = Math.atan2(
            direction.x,
            direction.z
        );

    }


    // WORLD BOUNDARIES

    player.position.x = THREE.MathUtils.clamp(
        player.position.x,
        -worldSize / 2,
        worldSize / 2
    );


    player.position.z = THREE.MathUtils.clamp(
        player.position.z,
        -worldSize / 2,
        worldSize / 2
    );


    updateCamera();

}


// =========================================
// CAMERA
// =========================================

function updateCamera() {

    if (!player || !camera) {
        return;
    }


    const distance = aiming ? 3.5 : cameraDistance;


    const cameraOffset = new THREE.Vector3(

        0,

        aiming ? 2.2 : 3.5,

        distance

    );


    cameraOffset.applyAxisAngle(

        new THREE.Vector3(0, 1, 0),

        player.rotation.y

    );


    camera.position.copy(

        player.position.clone().add(cameraOffset)

    );


    camera.lookAt(

        player.position.x,

        player.position.y + 1.5,

        player.position.z

    );

}


// =========================================
// SHOOTING
// =========================================

function shootWeapon() {

    if (!gameStarted || gameOver) {
        return;
    }


    if (ammo <= 0) {

        showMessage("RELOAD");

        return;

    }


    ammo--;


    updateAmmo();


    // BULLET

    const bulletGeometry = new THREE.SphereGeometry(
        0.12,
        8,
        8
    );


    const bulletMaterial = new THREE.MeshBasicMaterial({

        color: 0xffcc00

    });


    const bullet = new THREE.Mesh(

        bulletGeometry,

        bulletMaterial

    );


    bullet.position.copy(

        player.position

    );


    bullet.position.y += 1.5;


    const direction = new THREE.Vector3();


    camera.getWorldDirection(direction);


    bullet.userData.direction = direction.clone();


    bullet.userData.speed = 45;


    bullet.userData.life = 2;


    scene.add(bullet);


    bullets.push(bullet);

}


// =========================================
// UPDATE BULLETS
// =========================================

function updateBullets(delta) {

    for (let i = bullets.length - 1; i >= 0; i--) {

        const bullet = bullets[i];


        bullet.position.add(

            bullet.userData.direction.clone().multiplyScalar(

                bullet.userData.speed * delta

            )

        );


        bullet.userData.life -= delta;


        // HIT ENEMIES

        for (let j = enemies.length - 1; j >= 0; j--) {

            const enemy = enemies[j];


            if (!enemy.userData.alive) {
                continue;
            }


            const distance = bullet.position.distanceTo(

                enemy.position.clone().add(

                    new THREE.Vector3(0, 1.5, 0)

                )

            );


            if (distance < 1.5) {

                enemy.userData.health -= 35;


                scene.remove(bullet);

                bullets.splice(i, 1);


                if (enemy.userData.health <= 0) {

                    enemy.userData.alive = false;


                    scene.remove(enemy);


                    kills++;


                    updateKills();

                    updateAliveCount();

                }


                break;

            }

        }


        if (bullet.userData.life <= 0) {

            scene.remove(bullet);


            const index = bullets.indexOf(bullet);


            if (index !== -1) {

                bullets.splice(index, 1);

            }

        }

    }

}


// =========================================
// ENEMY AI
// =========================================

function updateEnemies(delta) {

    if (!gameStarted || gameOver) {
        return;
    }


    for (let i = 0; i < enemies.length; i++) {

        const enemy = enemies[i];


        if (!enemy.userData.alive) {
            continue;
        }


        const distance = enemy.position.distanceTo(

            player.position

        );


        // MOVE TOWARD PLAYER

        if (distance > 8 && distance < 55) {

            const direction = new THREE.Vector3();


            direction.subVectors(

                player.position,

                enemy.position

            );


            direction.y = 0;


            direction.normalize();


            enemy.position.add(

                direction.multiplyScalar(

                    enemy.userData.speed * 60 * delta

                )

            );


            enemy.rotation.y = Math.atan2(

                player.position.x - enemy.position.x,

            player.position.z - enemy.position.z

            );

        }


        // ENEMY SHOOTING

        if (distance < 35) {

            enemy.userData.shootCooldown -= delta;


            if (enemy.userData.shootCooldown <= 0) {

                enemyShoot(enemy);


                enemy.userData.shootCooldown = 2.5;

            }

        }

    }

}


// =========================================
// ENEMY SHOOT
// =========================================

function enemyShoot(enemy) {

    if (!player || gameOver) {
        return;
    }


    const distance = enemy.position.distanceTo(

        player.position

    );


    if (distance < 30) {

        health -= 5;


        updateHealth();


        if (health <= 0) {

            health = 0;

            gameOver = true;


            showMessage("YOU DIED");


        }

    }

}


// =========================================
// RELOAD
// =========================================

function reloadWeapon() {

    if (!gameStarted || gameOver) {
        return;
    }


    if (ammo >= 30 || reserveAmmo <= 0) {
        return;
    }


    const needed = 30 - ammo;


    const available = Math.min(

        needed,

        reserveAmmo

    );


    ammo += available;


    reserveAmmo -= available;


    updateAmmo();


    showMessage("RELOADED");


}


// =========================================
// JUMP
// =========================================

function jumpPlayer() {

    if (!gameStarted || gameOver) {
        return;
    }


    player.position.y = 0.5;


    setTimeout(

        function() {

            if (player) {

                player.position.y = 0;

            }

        },

        400

    );

}


// =========================================
// UPDATE HUD
// =========================================

function updateHealth() {

    if (healthText) {

        healthText.textContent =

            "HP: " + Math.max(0, health);

    }

}


function updateKills() {

    if (killsText) {

        killsText.textContent =

            "KILLS: " + kills;

    }

}


function updateAliveCount() {

    if (aliveText) {

        const alive = enemies.filter(

            enemy => enemy.userData.alive

        ).length;


        aliveText.textContent =

            "ALIVE: " + (alive + 1);

    }

}


function updateAmmo() {

    if (ammoText) {

        ammoText.textContent =

            ammo + " / " + reserveAmmo;

    }

}


// =========================================
// MESSAGE
// =========================================

function showMessage(message) {

    if (!messageText) {
        return;
    }


    messageText.textContent = message;


    setTimeout(

        function() {

            if (messageText.textContent === message) {

                messageText.textContent = "";

            }

        },

        1500

    );

}


// =========================================
// RESIZE
// =========================================

function resizeGame() {

    if (!camera || !renderer) {
        return;
    }


    camera.aspect =

        window.innerWidth /

        window.innerHeight;


    camera.updateProjectionMatrix();


    renderer.setSize(

        window.innerWidth,

        window.innerHeight

    );

}


// =========================================
// GAME LOOP
// =========================================

function animate() {

    requestAnimationFrame(animate);


    if (!renderer || !scene || !camera) {
        return;
    }


    const delta = Math.min(

        clock.getDelta(),

        0.05

    );


    if (gameStarted && !gameOver) {

        updatePlayer(delta);


        updateBullets(delta);


        updateEnemies(delta);

    }


    renderer.render(

        scene,

        camera

    );

}


// =========================================
// RANDOM HELPERS
// =========================================

function randomBetween(min, max) {

    return Math.random() * (max - min) + min;

}


function randomBuildingColor() {

    const colors = [

        0x777777,

        0x888888,

        0x666b72,

        0x827b70,

        0x59616b

    ];


    return colors[

        Math.floor(

            Math.random() * colors.length

        )

    ];

}


// =========================================
// START
// =========================================

initGame();
