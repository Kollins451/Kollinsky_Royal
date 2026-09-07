/* =========================================================
   KOLLINSKY BATTLE ROYALE
   FINAL PROTOTYPE BUILD
   Chromebook + iPhone + Touch + Keyboard
   ========================================================= */

(() => {
"use strict";

/* =========================================================
   BASIC CHECK
   ========================================================= */

if (typeof THREE === "undefined") {
    document.body.innerHTML = `
        <div style="
            position:fixed;
            inset:0;
            background:#07111f;
            color:white;
            display:flex;
            align-items:center;
            justify-content:center;
            text-align:center;
            font-family:Arial;
            padding:30px;
        ">
            <div>
                <h1>Game Loading Error</h1>
                <p>Three.js could not load.</p>
                <p>Please refresh the page.</p>
            </div>
        </div>
    `;
    return;
}


/* =========================================================
   GAME VARIABLES
   ========================================================= */

let scene;
let camera;
let renderer;

let player;

let enemies = [];
let bullets = [];

let gameStarted = false;
let gameOverState = false;

let health = 100;
let ammo = 30;
let kills = 0;

let yaw = 0;
let pitch = 0.18;

let verticalVelocity = 0;
let grounded = true;

const keys = {};

const clock = new THREE.Clock();


/* =========================================================
   MOBILE JOYSTICK
   ========================================================= */

let joystickActive = false;
let joystickX = 0;
let joystickY = 0;


/* =========================================================
   FIND START BUTTON
   ========================================================= */

const startButton =
    document.getElementById("startBtn") ||
    document.getElementById("startGame") ||
    document.querySelector("button");


/* =========================================================
   START BUTTON
   ========================================================= */

if (startButton) {

    startButton.addEventListener("click", () => {
        startGame();
    });

} else {

    /* Create a fallback button */

    const fallback =
        document.createElement("button");

    fallback.textContent = "START GAME";

    fallback.style.position = "fixed";
    fallback.style.left = "50%";
    fallback.style.top = "50%";
    fallback.style.transform = "translate(-50%,-50%)";
    fallback.style.padding = "18px 40px";
    fallback.style.fontSize = "22px";
    fallback.style.fontWeight = "bold";
    fallback.style.zIndex = "99999";
    fallback.style.border = "none";
    fallback.style.borderRadius = "12px";

    document.body.appendChild(fallback);

    fallback.addEventListener(
        "click",
        startGame
    );
}


/* =========================================================
   START GAME
   ========================================================= */

function startGame() {

    if (gameStarted) return;

    gameStarted = true;

    health = 100;
    ammo = 30;
    kills = 0;

    const menu =
        document.getElementById("menu");

    if (menu) {
        menu.style.display = "none";
    }

    if (startButton) {
        startButton.style.display = "none";
    }

    createGame();

    setupMobileInterface();

    updateHUD();

    try {
        if (
            document.documentElement.requestFullscreen
        ) {
            document.documentElement
                .requestFullscreen()
                .catch(() => {});
        }
    } catch (e) {}

}


/* =========================================================
   CREATE GAME
   ========================================================= */

function createGame() {

    /* -------------------------------------------------------
       SCENE
       ------------------------------------------------------- */

    scene =
        new THREE.Scene();

    scene.background =
        new THREE.Color(0x78c8f5);

    scene.fog =
        new THREE.Fog(
            0x78c8f5,
            100,
            280
        );


    /* -------------------------------------------------------
       CAMERA
       ------------------------------------------------------- */

    camera =
        new THREE.PerspectiveCamera(
            65,
            window.innerWidth /
            window.innerHeight,
            0.1,
            1000
        );


    /* -------------------------------------------------------
       RENDERER
       ------------------------------------------------------- */

    renderer =
        new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance"
        });

    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio || 1,
            2
        )
    );

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.shadowMap.enabled = true;

    renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;

    renderer.outputColorSpace =
        THREE.SRGBColorSpace;

    renderer.toneMapping =
        THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure = 1.15;

    renderer.domElement.style.position =
        "fixed";

    renderer.domElement.style.left = "0";

    renderer.domElement.style.top = "0";

    renderer.domElement.style.width = "100%";

    renderer.domElement.style.height = "100%";

    renderer.domElement.style.zIndex = "1";

    renderer.domElement.style.touchAction =
        "none";

    document.body.appendChild(
        renderer.domElement
    );


    /* -------------------------------------------------------
       LIGHTS
       ------------------------------------------------------- */

    const hemisphere =
        new THREE.HemisphereLight(
            0xdff4ff,
            0x304020,
            2.2
        );

    scene.add(hemisphere);


    const sun =
        new THREE.DirectionalLight(
            0xffffff,
            3
        );

    sun.position.set(
        80,
        140,
        60
    );

    sun.castShadow = true;

    sun.shadow.mapSize.width = 2048;

    sun.shadow.mapSize.height = 2048;

    sun.shadow.camera.left = -160;

    sun.shadow.camera.right = 160;

    sun.shadow.camera.top = 160;

    sun.shadow.camera.bottom = -160;

    scene.add(sun);


    /* -------------------------------------------------------
       WORLD
       ------------------------------------------------------- */

    createGround();

    createWater();

    createMountains();

    createRoads();

    createBuildings();

    createTrees();

    createRocks();


    /* -------------------------------------------------------
       PLAYER
       ------------------------------------------------------- */

    player =
        createHuman(
            0x1769ff,
            true
        );

    player.position.set(
        0,
        0,
        12
    );

    scene.add(player);


    /* -------------------------------------------------------
       ENEMIES
       ------------------------------------------------------- */

    createEnemies();


    /* -------------------------------------------------------
       CONTROLS
       ------------------------------------------------------- */

    setupKeyboard();

    setupMouse();

    setupTouchCamera();

    setupFire();


    /* -------------------------------------------------------
       CAMERA
       ------------------------------------------------------- */

    updateCamera();


    /* -------------------------------------------------------
       RESIZE
       ------------------------------------------------------- */

    window.addEventListener(
        "resize",
        onResize
    );


    window.addEventListener(
        "orientationchange",
        () => {
            setTimeout(
                onResize,
                200
            );
        }
    );


    /* -------------------------------------------------------
       GAME LOOP
       ------------------------------------------------------- */

    animate();

}


/* =========================================================
   GROUND
   ========================================================= */

function createGround() {

    const geometry =
        new THREE.PlaneGeometry(
            300,
            300,
            50,
            50
        );


    const material =
        new THREE.MeshStandardMaterial({
            color: 0x348c3f,
            roughness: 1
        });


    const ground =
        new THREE.Mesh(
            geometry,
            material
        );


    ground.rotation.x =
        -Math.PI / 2;


    ground.receiveShadow = true;


    scene.add(ground);


    /* Add subtle terrain */

    const position =
        geometry.attributes.position;


    for (
        let i = 0;
        i < position.count;
        i++
    ) {

        const x =
            position.getX(i);

        const y =
            position.getY(i);


        const height =
            Math.sin(x * 0.04) * 1.2 +
            Math.cos(y * 0.035) * 1.1;


        position.setZ(
            i,
            height
        );

    }


    geometry.computeVertexNormals();

}


/* =========================================================
   WATER
   ========================================================= */

function createWater() {

    const water =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                100,
                100
            ),
            new THREE.MeshStandardMaterial({
                color: 0x268bd2,
                roughness: 0.25,
                metalness: 0.15
            })
        );


    water.rotation.x =
        -Math.PI / 2;


    water.position.set(
        -90,
        -0.2,
        -85
    );


    scene.add(water);

}


/* =========================================================
   MOUNTAINS
   ========================================================= */

function createMountains() {

    for (
        let i = 0;
        i < 20;
        i++
    ) {

        const mountain =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    15 +
                    Math.random() * 18,
                    30 +
                    Math.random() * 35,
                    8
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x3e6045,
                    roughness: 1
                })
            );


        const angle =
            (i / 20) *
            Math.PI *
            2;


        const distance = 125;


        mountain.position.set(
            Math.cos(angle) *
            distance,

            14,

            Math.sin(angle) *
            distance
        );


        mountain.castShadow = true;


        scene.add(mountain);

    }

}


/* =========================================================
   ROADS
   ========================================================= */

function createRoads() {

    const roadMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x34383b,
            roughness: 1
        });


    const road1 =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                300,
                10
            ),
            roadMaterial
        );


    road1.rotation.x =
        -Math.PI / 2;

    road1.position.y = 0.03;

    scene.add(road1);


    const road2 =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                10,
                300
            ),
            roadMaterial
        );


    road2.rotation.x =
        -Math.PI / 2;

    road2.position.y = 0.035;

    scene.add(road2);


    /* Road markings */

    const markingMaterial =
        new THREE.MeshBasicMaterial({
            color: 0xf5d547
        });


    for (
        let i = -140;
        i < 140;
        i += 14
    ) {

        const marking =
            new THREE.Mesh(
                new THREE.PlaneGeometry(
                    7,
                    0.35
                ),
                markingMaterial
            );


        marking.rotation.x =
            -Math.PI / 2;

        marking.position.set(
            i,
            0.06,
            0
        );


        scene.add(marking);

    }

}


/* =========================================================
   BUILDINGS
   ========================================================= */

function createBuildings() {

    const locations = [
        [-35,-35],
        [35,-35],
        [55,30],
        [-55,30],
        [30,65],
        [-35,65],
        [75,-70],
        [-75,-55]
    ];


    locations.forEach(
        ([x,z]) => {
            createBuilding(
                x,
                z
            );
        }
    );

}


function createBuilding(
    x,
    z
) {

    const group =
        new THREE.Group();


    /* Main structure */

    const body =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                15,
                9,
                13
            ),
            new THREE.MeshStandardMaterial({
                color: 0xbab7ad,
                roughness: 0.9
            })
        );


    body.position.y = 4.5;

    body.castShadow = true;

    body.receiveShadow = true;

    group.add(body);


    /* Roof */

    const roof =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                11,
                5,
                4
            ),
            new THREE.MeshStandardMaterial({
                color: 0x4a4a4a,
                roughness: 0.8
            })
        );


    roof.rotation.y =
        Math.PI / 4;

    roof.position.y = 11;

    roof.castShadow = true;

    group.add(roof);


    /* Windows */

    for (
        let i = -1;
        i <= 1;
        i++
    ) {

        const windowMesh =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    2.4,
                    2,
                    0.2
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x5eb5df,
                    metalness: 0.5,
                    roughness: 0.15
                })
            );


        windowMesh.position.set(
            i * 4,
            5,
            6.6
        );


        group.add(
            windowMesh
        );

    }


    /* Door */

    const door =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                2.5,
                4.5,
                0.3
            ),
            new THREE.MeshStandardMaterial({
                color: 0x56371f
            })
        );


    door.position.set(
        0,
        2.25,
        6.7
    );


    group.add(door);


    group.position.set(
        x,
        0,
        z
    );


    group.rotation.y =
        Math.random() *
        Math.PI;


    scene.add(group);

}


/* =========================================================
   TREES
   ========================================================= */

function createTrees() {

    for (
        let i = 0;
        i < 100;
        i++
    ) {

        const x =
            Math.random() *
            260 - 130;


        const z =
            Math.random() *
            260 - 130;


        if (
            Math.abs(x) < 15 &&
            Math.abs(z) < 15
        ) {
            continue;
        }


        createTree(
            x,
            z
        );

    }

}


function createTree(
    x,
    z
) {

    const group =
        new THREE.Group();


    const trunk =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.45,
                0.7,
                5,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: 0x68401f,
                roughness: 1
            })
        );


    trunk.position.y = 2.5;

    trunk.castShadow = true;

    group.add(trunk);


    const leaves =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                3.4,
                12,
                10
            ),
            new THREE.MeshStandardMaterial({
                color: 0x176b2a,
                roughness: 1
            })
        );


    leaves.position.y = 6.3;

    leaves.castShadow = true;

    group.add(leaves);


    group.position.set(
        x,
        0,
        z
    );


    scene.add(group);

}


/* =========================================================
   ROCKS
   ========================================================= */

function createRocks() {

    for (
        let i = 0;
        i < 50;
        i++
    ) {

        const rock =
            new THREE.Mesh(
                new THREE.DodecahedronGeometry(
                    1 +
                    Math.random() * 2
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x656565,
                    roughness: 1
                })
            );


        rock.position.set(
            Math.random() * 250 - 125,
            1,
            Math.random() * 250 - 125
        );


        rock.rotation.set(
            Math.random() * 3,
            Math.random() * 3,
            Math.random() * 3
        );


        rock.castShadow = true;


        scene.add(rock);

    }

}


/* =========================================================
   HUMAN CHARACTER
   ========================================================= */

function createHuman(
    color,
    isPlayer
) {

    const group =
        new THREE.Group();


    group.userData.isPlayer =
        isPlayer;


    /* -------------------------------------------------------
       LEGS
       ------------------------------------------------------- */

    const pants =
        new THREE.MeshStandardMaterial({
            color: 0x20242a,
            roughness: 0.8
        });


    const leftLeg =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.48,
                1.7,
                0.55
            ),
            pants
        );


    leftLeg.position.set(
        -0.3,
        0.85,
        0
    );


    leftLeg.castShadow = true;


    group.add(leftLeg);


    const rightLeg =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.48,
                1.7,
                0.55
            ),
            pants
        );


    rightLeg.position.set(
        0.3,
        0.85,
        0
    );


    rightLeg.castShadow = true;


    group.add(rightLeg);


    /* -------------------------------------------------------
       BODY
       ------------------------------------------------------- */

    const shirt =
        new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.75
        });


    const torso =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                1.25,
                1.7,
                0.75
            ),
            shirt
        );


    torso.position.y = 2.25;

    torso.castShadow = true;

    group.add(torso);


    /* -------------------------------------------------------
       NECK
       ------------------------------------------------------- */

    const neck =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.18,
                0.18,
                0.3,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: 0xc78969
            })
        );


    neck.position.y = 3.25;

    group.add(neck);


    /* -------------------------------------------------------
       HEAD
       ------------------------------------------------------- */

    const head =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.53,
                20,
                20
            ),
            new THREE.MeshStandardMaterial({
                color: 0xc78969,
                roughness: 0.8
            })
        );


    head.position.y = 3.85;

    head.castShadow = true;

    group.add(head);


    /* -------------------------------------------------------
       HAIR
       ------------------------------------------------------- */

    const hair =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.55,
                16,
                10,
                0,
                Math.PI * 2,
                0,
                Math.PI / 2
            ),
            new THREE.MeshStandardMaterial({
                color: 0x17120f
            })
        );


    hair.position.y = 4;

    group.add(hair);


    /* -------------------------------------------------------
       ARMS
       ------------------------------------------------------- */

    const armMaterial =
        new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.75
        });


    const leftArm =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.35,
                1.45,
                0.4
            ),
            armMaterial
        );


    leftArm.position.set(
        -0.85,
        2.35,
        0
    );


    leftArm.rotation.z =
        -0.15;


    leftArm.castShadow = true;


    group.add(leftArm);


    const rightArm =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.35,
                1.45,
                0.4
            ),
            armMaterial
        );


    rightArm.position.set(
        0.85,
        2.35,
        0
    );


    rightArm.rotation.z =
        0.15;


    rightArm.castShadow = true;


    group.add(rightArm);


    /* -------------------------------------------------------
       WEAPON
       ------------------------------------------------------- */

    const weapon =
        new THREE.Group();


    const gunBody =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.3,
                0.28,
                1.7
            ),
            new THREE.MeshStandardMaterial({
                color: 0x171717,
                metalness: 0.7,
                roughness: 0.25
            })
        );


    gunBody.position.z =
        -0.7;


    weapon.add(gunBody);


    const barrel =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.065,
                0.065,
                0.8,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: 0x090909,
                metalness: 0.8
            })
        );


    barrel.rotation.x =
        Math.PI / 2;


    barrel.position.z =
        -1.75;


    weapon.add(barrel);


    const stock =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.28,
                0.32,
                0.6
            ),
            new THREE.MeshStandardMaterial({
                color: 0x292929
            })
        );


    stock.position.z =
        0.45;


    weapon.add(stock);


    weapon.position.set(
        0.55,
        2.55,
        -0.7
    );


    weapon.rotation.x =
        -0.12;


    group.add(weapon);


    group.userData.weapon =
        weapon;


    return group;

}


/* =========================================================
   ENEMIES
   ========================================================= */

function createEnemies() {

    for (
        let i = 0;
        i < 15;
        i++
    ) {

        const enemy =
            createHuman(
                0xb52b32,
                false
            );


        let x;
        let z;


        do {

            x =
                Math.random() *
                170 - 85;

            z =
                Math.random() *
                170 - 85;

        } while (
            Math.abs(x) < 30 &&
            Math.abs(z) < 30
        );


        enemy.position.set(
            x,
            0,
            z
        );


        enemy.userData.health =
            100;


        enemy.userData.speed =
            0.018 +
            Math.random() *
            0.012;


        enemy.userData.lastAttack =
            0;


        scene.add(enemy);

        enemies.push(enemy);

    }

}


/* =========================================================
   KEYBOARD
   ========================================================= */

function setupKeyboard() {

    window.addEventListener(
        "keydown",
        event => {

            keys[
                event.key.toLowerCase()
            ] = true;


            if (
                event.code ===
                "Space"
            ) {

                jump();

            }


            if (
                event.key.toLowerCase()
                === "r"
            ) {

                reload();

            }

        }
    );


    window.addEventListener(
        "keyup",
        event => {

            keys[
                event.key.toLowerCase()
            ] = false;

        }
    );

}


/* =========================================================
   MOUSE
   ========================================================= */

function setupMouse() {

    renderer.domElement.addEventListener(
        "click",
        () => {

            if (
                renderer.domElement
                    .requestPointerLock
            ) {

                renderer.domElement
                    .requestPointerLock();

            }

        }
    );


    document.addEventListener(
        "mousemove",
        event => {

            if (
                document.pointerLockElement
                !== renderer.domElement
            ) {
                return;
            }


            yaw -=
                event.movementX *
                0.0025;


            pitch -=
                event.movementY *
                0.002;


            pitch =
                THREE.MathUtils.clamp(
                    pitch,
                    -0.2,
                    0.8
                );

        }
    );

}


/* =========================================================
   TOUCH CAMERA
   ========================================================= */

let touchStartX = 0;
let touchStartY = 0;

function setupTouchCamera() {

    renderer.domElement.addEventListener(
        "touchstart",
        event => {

            if (
                event.touches.length !== 1
            ) {
                return;
            }


            touchStartX =
                event.touches[0].clientX;

            touchStartY =
                event.touches[0].clientY;

        },
        {
            passive: true
        }
    );


    renderer.domElement.addEventListener(
        "touchmove",
        event => {

            if (
                event.touches.length !== 1
            ) {
                return;
            }


            const x =
                event.touches[0].clientX;

            const y =
                event.touches[0].clientY;


            const dx =
                x - touchStartX;

            const dy =
                y - touchStartY;


            /* Only use right side */

            if (
                touchStartX >
                window.innerWidth * 0.45
            ) {

                yaw -=
                    dx * 0.004;

                pitch -=
                    dy * 0.003;


                pitch =
                    THREE.MathUtils.clamp(
                        pitch,
                        -0.25,
                        0.75
                    );

            }


            touchStartX = x;

            touchStartY = y;

        },
        {
            passive: true
        }
    );

}


/* =========================================================
   FIRE
   ========================================================= */

function setupFire() {

    renderer.domElement.addEventListener(
        "mousedown",
        event => {

            if (
                event.button === 0
            ) {

                shoot();

            }

        }
    );

}


/* =========================================================
   SHOOT
   ========================================================= */

function shoot() {

    if (
        !gameStarted ||
        gameOverState
    ) {
        return;
    }


    if (
        ammo <= 0
    ) {

        reload();

        return;

    }


    ammo--;

    updateHUD();


    const bullet =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.09,
                8,
                8
            ),
            new THREE.MeshBasicMaterial({
                color: 0xffed55
            })
        );


    const direction =
        new THREE.Vector3(
            0,
            0,
            -1
        );


    direction.applyQuaternion(
        camera.quaternion
    );


    bullet.position.copy(
        camera.position
    );


    bullet.userData.velocity =
        direction.multiplyScalar(
            2
        );


    bullet.userData.life =
        90;


    scene.add(bullet);

    bullets.push(bullet);

}


/* =========================================================
   BULLETS
   ========================================================= */

function updateBullets() {

    for (
        let i = bullets.length - 1;
        i >= 0;
        i--
    ) {

        const bullet =
            bullets[i];


        bullet.position.add(
            bullet.userData.velocity
        );


        bullet.userData.life--;


        let destroyed =
            false;


        for (
            let j = enemies.length - 1;
            j >= 0;
            j--
        ) {

            const enemy =
                enemies[j];


            const distance =
                bullet.position.distanceTo(
                    enemy.position.clone()
                        .add(
                            new THREE.Vector3(
                                0,
                                2,
                                0
                            )
                        )
                );


            if (
                distance < 1.6
            ) {

                enemy.userData.health -=
                    40;


                destroyed = true;


                if (
                    enemy.userData.health <= 0
                ) {

                    scene.remove(
                        enemy
                    );


                    enemies.splice(
                        j,
                        1
                    );


                    kills++;

                    updateHUD();

                }


                break;

            }

        }


        if (
            destroyed ||
            bullet.userData.life <= 0
        ) {

            scene.remove(
                bullet
            );


            bullets.splice(
                i,
                1
            );

        }

    }

}


/* =========================================================
   PLAYER MOVEMENT
   ========================================================= */

function updatePlayer() {

    if (!player) return;


    let forward = 0;
    let side = 0;


    /* Keyboard */

    if (keys["w"]) forward += 1;
    if (keys["s"]) forward -= 1;
    if (keys["a"]) side -= 1;
    if (keys["d"]) side += 1;


    /* Mobile joystick */

    if (joystickActive) {

        side += joystickX;

        forward += -joystickY;

    }


    if (
        forward !== 0 ||
        side !== 0
    ) {

        const direction =
            new THREE.Vector3(
                side,
                0,
                -forward
            );


        direction.applyAxisAngle(
            new THREE.Vector3(
                0,
                1,
                0
            ),
            yaw
        );


        direction.normalize();


        const speed =
            keys["shift"]
                ? 0.22
                : 0.11;


        player.position.x +=
            direction.x *
            speed;


        player.position.z +=
            direction.z *
            speed;


        /* Face direction */

        const target =
            Math.atan2(
                direction.x,
                direction.z
            );


        player.rotation.y +=
            angleDifference(
                player.rotation.y,
                target
            ) * 0.18;


        /* Running animation */

        const t =
            performance.now() *
            0.012;


        player.children[0]
            .rotation.x =
            Math.sin(t) * 0.35;


        player.children[1]
            .rotation.x =
            -Math.sin(t) * 0.35;

    }


    /* Map boundaries */

    player.position.x =
        THREE.MathUtils.clamp(
            player.position.x,
            -135,
            135
        );


    player.position.z =
        THREE.MathUtils.clamp(
            player.position.z,
            -135,
            135
        );

}


/* =========================================================
   CAMERA
   ========================================================= */

function updateCamera() {

    if (!player) return;


    const distance = 8;


    const horizontal =
        Math.cos(pitch) *
        distance;


    const vertical =
        Math.sin(pitch) *
        distance;


    const cameraPosition =
        new THREE.Vector3();


    cameraPosition.x =
        player.position.x +
        Math.sin(yaw) *
        horizontal;


    cameraPosition.y =
        player.position.y +
        vertical +
        3;


    cameraPosition.z =
        player.position.z +
        Math.cos(yaw) *
        horizontal;


    camera.position.lerp(
        cameraPosition,
        0.18
    );


    const target =
        player.position.clone();


    target.y += 2.4;


    camera.lookAt(
        target
    );

}


/* =========================================================
   ANGLE DIFFERENCE
   ========================================================= */

function angleDifference(
    current,
    target
) {

    let diff =
        target - current;


    while (
        diff > Math.PI
    ) {

        diff -=
            Math.PI * 2;

    }


    while (
        diff < -Math.PI
    ) {

        diff +=
            Math.PI * 2;

    }


    return diff;

}


/* =========================================================
   JUMP
   ========================================================= */

function jump() {

    if (
        !grounded ||
        !gameStarted
    ) {
        return;
    }


    grounded = false;

    verticalVelocity =
        0.27;

}


function updateJump() {

    if (!player) return;


    if (!grounded) {

        player.position.y +=
            verticalVelocity;


        verticalVelocity -=
            0.014;


        if (
            player.position.y <= 0
        ) {

            player.position.y = 0;

            verticalVelocity = 0;

            grounded = true;

        }

    }

}


/* =========================================================
   ENEMY AI
   ========================================================= */

function updateEnemies() {

    if (!player) return;


    const now =
        performance.now();


    enemies.forEach(
        enemy => {

            const direction =
                new THREE.Vector3()
                    .subVectors(
                        player.position,
                        enemy.position
                    );


            direction.y = 0;


            const distance =
                direction.length();


            if (
                distance < 80
            ) {

                direction.normalize();


                /* Move toward player */

                if (
                    distance > 3
                ) {

                    enemy.position.add(
                        direction.multiplyScalar(
                            enemy.userData.speed
                        )
                    );

                }


                /* Look at player */

                enemy.rotation.y =
                    Math.atan2(
                        direction.x,
                        direction.z
                    );


                /* Attack */

                if (
                    distance < 15 &&
                    now -
                    enemy.userData.lastAttack
                    > 800
                ) {

                    enemy.userData.lastAttack =
                        now;


                    damagePlayer(
                        4
                    );

                }

            }

        }
    );

}


/* =========================================================
   PLAYER DAMAGE
   ========================================================= */

function damagePlayer(
    amount
) {

    if (
        gameOverState
    ) {
        return;
    }


    health -= amount;


    health =
        Math.max(
            0,
            health
        );


    updateHUD();


    if (
        health <= 0
    ) {

        endGame(
            false
        );

    }

}


/* =========================================================
   RELOAD
   ========================================================= */

function reload() {

    if (!gameStarted) return;


    ammo = 30;


    updateHUD();

}


/* =========================================================
   HUD
   ========================================================= */

function createHUD() {

    let hud =
        document.getElementById(
            "battleHUD"
        );


    if (hud) return;


    hud =
        document.createElement(
            "div"
        );


    hud.id =
        "battleHUD";


    hud.innerHTML = `

        <div id="hpBox">
            <div id="hpText">
                HP 100 / 100
            </div>

            <div id="hpBar">
                <div id="hpFill"></div>
            </div>
        </div>


        <div id="ammoBox">
            <span id="ammoNumber">
                30
            </span>
            <span>
                🔫
            </span>
        </div>


        <div id="killBox">
            KILLS:
            <span id="killNumber">
                0
            </span>
        </div>


        <div id="crosshair">
            +
        </div>

    `;


    document.body.appendChild(
        hud
    );


    const style =
        document.createElement(
            "style"
        );


    style.textContent = `

        #battleHUD {
            position:fixed;
            inset:0;
            pointer-events:none;
            z-index:10000;
            font-family:Arial,sans-serif;
            color:white;
        }

        #hpBox {
            position:absolute;
            top:18px;
            left:18px;
            width:210px;
        }

        #hpText {
            font-weight:bold;
            font-size:16px;
            margin-bottom:7px;
            text-shadow:0 2px 4px #000;
        }

        #hpBar {
            width:180px;
            height:10px;
            background:rgba(0,0,0,.5);
            border-radius:10px;
            overflow:hidden;
        }

        #hpFill {
            width:100%;
            height:100%;
            background:#48ff3b;
        }

        #ammoBox {
            position:absolute;
            right:24px;
            bottom:55px;
            font-size:28px;
            font-weight:bold;
            text-shadow:0 2px 4px #000;
        }

        #killBox {
            position:absolute;
            top:18px;
            right:20px;
            font-size:15px;
            font-weight:bold;
            text-shadow:0 2px 4px #000;
        }

        #crosshair {
            position:absolute;
            left:50%;
            top:50%;
            transform:translate(-50%,-50%);
            font-size:32px;
            font-weight:bold;
            text-shadow:0 2px 5px #000;
        }

    `;


    document.head.appendChild(
        style
    );

}


function updateHUD() {

    createHUD();


    const hpText =
        document.getElementById(
            "hpText"
        );


    const hpFill =
        document.getElementById(
            "hpFill"
        );


    const ammoNumber =
        document.getElementById(
            "ammoNumber"
        );


    const killNumber =
        document.getElementById(
            "killNumber"
        );


    if (hpText) {

        hpText.textContent =
            "HP " +
            Math.round(health) +
            " / 100";

    }


    if (hpFill) {

        hpFill.style.width =
            health + "%";

    }


    if (ammoNumber) {

        ammoNumber.textContent =
            ammo;

    }


    if (killNumber) {

        killNumber.textContent =
            kills;

    }

}


/* =========================================================
   MOBILE INTERFACE
   ========================================================= */

function setupMobileInterface() {

    if (
        document.getElementById(
            "mobileControls"
        )
    ) {
        return;
    }


    const controls =
        document.createElement(
            "div"
        );


    controls.id =
        "mobileControls";


    controls.innerHTML = `

        <div id="joystick">
            <div id="joystickKnob"></div>
        </div>


        <div id="mobileButtons">

            <button id="mobileFire">
                🔫
            </button>

            <button id="mobileJump">
                ⬆
            </button>

            <button id="mobileReload">
                ↻
            </button>

        </div>


        <div id="rotateMessage">

            <div>
                📱
            </div>

            <h2>
                ROTATE YOUR PHONE
            </h2>

            <p>
                Play in landscape mode
            </p>

        </div>

    `;


    document.body.appendChild(
        controls
    );


    const style =
        document.createElement(
            "style"
        );


    style.textContent = `

        #mobileControls {
            position:fixed;
            inset:0;
            z-index:15000;
            pointer-events:none;
            font-family:Arial,sans-serif;
        }

        #joystick {
            position:absolute;
            left:25px;
            bottom:35px;
            width:120px;
            height:120px;
            border-radius:50%;
            background:rgba(255,255,255,.16);
            border:2px solid rgba(255,255,255,.35);
            pointer-events:auto;
            touch-action:none;
        }

        #joystickKnob {
            position:absolute;
            left:50%;
            top:50%;
            width:55px;
            height:55px;
            transform:translate(-50%,-50%);
            border-radius:50%;
            background:rgba(255,255,255,.55);
        }

        #mobileButtons {
            position:absolute;
            right:22px;
            bottom:25px;
            display:flex;
            gap:12px;
            align-items:end;
        }

        #mobileButtons button {
            width:65px;
            height:65px;
            border-radius:50%;
            border:2px solid rgba(255,255,255,.55);
            background:rgba(20,20,20,.5);
            color:white;
            font-size:25px;
            pointer-events:auto;
            touch-action:none;
        }

        #mobileFire {
            width:85px !important;
            height:85px !important;
            font-size:32px !important;
        }

        #rotateMessage {
            display:none;
            position:absolute;
            inset:0;
            background:rgba(4,10,18,.96);
            color:white;
            align-items:center;
            justify-content:center;
            flex-direction:column;
            text-align:center;
            pointer-events:auto;
        }

        #rotateMessage div {
            font-size:55px;
        }

        #rotateMessage h2 {
            margin:10px 0;
        }

        #rotateMessage p {
            opacity:.7;
        }

        @media (min-width:800px) {
            #mobileControls {
                display:none;
            }
        }

        @media (orientation:portrait) and (max-width:799px) {
            #rotateMessage {
                display:flex;
            }
        }

    `;


    document.head.appendChild(
        style
    );


    setupJoystick();


    const fire =
        document.getElementById(
            "mobileFire"
        );


    const jumpButton =
        document.getElementById(
            "mobileJump"
        );


    const reloadButton =
        document.getElementById(
            "mobileReload"
        );


    fire.addEventListener(
        "touchstart",
        event => {

            event.preventDefault();

            shoot();

        },
        {
            passive:false
        }
    );


    jumpButton.addEventListener(
        "touchstart",
        event => {

            event.preventDefault();

            jump();

        },
        {
            passive:false
        }
    );


    reloadButton.addEventListener(
        "touchstart",
        event => {

            event.preventDefault();

            reload();

        },
        {
            passive:false
        }
    );

}


/* =========================================================
   JOYSTICK
   ========================================================= */

function setupJoystick() {

    const joystick =
        document.getElementById(
            "joystick"
        );


    const knob =
        document.getElementById(
            "joystickKnob"
        );


    if (
        !joystick ||
        !knob
    ) {
        return;
    }


    joystick.addEventListener(
        "touchstart",
        event => {

            event.preventDefault();

            joystickActive = true;

            updateJoystick(
                event.touches[0]
            );

        },
        {
            passive:false
        }
    );


    joystick.addEventListener(
        "touchmove",
        event => {

            event.preventDefault();

            updateJoystick(
                event.touches[0]
            );

        },
        {
            passive:false
        }
    );


    joystick.addEventListener(
        "touchend",
        event => {

            event.preventDefault();

            joystickActive = false;

            joystickX = 0;

            joystickY = 0;


            knob.style.left =
                "50%";

            knob.style.top =
                "50%";

        },
        {
            passive:false
        }
    );

}


function updateJoystick(
    touch
) {

    const joystick =
        document.getElementById(
            "joystick"
        );


    const knob =
        document.getElementById(
            "joystickKnob"
        );


    const rect =
        joystick.getBoundingClientRect();


    const centerX =
        rect.left +
        rect.width / 2;


    const centerY =
        rect.top +
        rect.height / 2;


    let dx =
        touch.clientX -
        centerX;


    let dy =
        touch.clientY -
        centerY;


    const max =
        38;


    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (
        distance > max
    ) {

        dx =
            dx / distance *
            max;

        dy =
            dy / distance *
            max;

    }


    joystickX =
        dx / max;


    joystickY =
        dy / max;


    knob.style.left =
        `calc(50% + ${dx}px)`;


    knob.style.top =
        `calc(50% + ${dy}px)`;

}


/* =========================================================
   WIN / LOSE
   ========================================================= */

function endGame(
    won
) {

    if (
        gameOverState
    ) {
        return;
    }


    gameOverState = true;

    gameStarted = false;


    const overlay =
        document.createElement(
            "div"
        );


    overlay.style.position =
        "fixed";

    overlay.style.inset =
        "0";

    overlay.style.zIndex =
        "50000";

    overlay.style.display =
        "flex";

    overlay.style.flexDirection =
        "column";

    overlay.style.alignItems =
        "center";

    overlay.style.justifyContent =
        "center";

    overlay.style.background =
        "rgba(0,0,0,.82)";

    overlay.style.color =
        "white";

    overlay.style.fontFamily =
        "Arial";

    overlay.style.textAlign =
        "center";


    overlay.innerHTML = `

        <div style="
            font-size:60px;
            font-weight:bold;
        ">
            ${won ? "VICTORY!" : "ELIMINATED"}
        </div>

        <div style="
            margin-top:15px;
            font-size:20px;
        ">
            Kills: ${kills}
        </div>

        <button
            onclick="location.reload()"
            style="
                margin-top:30px;
                padding:15px 35px;
                border:none;
                border-radius:10px;
                font-size:18px;
                font-weight:bold;
            "
        >
            PLAY AGAIN
        </button>

    `;


    document.body.appendChild(
        overlay
    );

}


/* =========================================================
   WIN CHECK
   ========================================================= */

function checkWin() {

    if (
        gameStarted &&
        enemies.length === 0
    ) {

        endGame(true);

    }

}


/* =========================================================
   RESIZE
   ========================================================= */

function onResize() {

    if (
        !camera ||
        !renderer
    ) {
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


/* =========================================================
   MAIN LOOP
   ========================================================= */

function animate() {

    requestAnimationFrame(
        animate
    );


    if (
        !renderer ||
        !scene ||
        !camera
    ) {
        return;
    }


    if (gameStarted) {

        updatePlayer();

        updateJump();

        updateCamera();

        updateBullets();

        updateEnemies();

        checkWin();

    }


    renderer.render(
        scene,
        camera
    );

}

})();
