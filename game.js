/* ============================================================
   KOLLINSKY BATTLE ROYALE
   STEP 1 — THIRD PERSON CHARACTER + CAMERA + WORLD
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    const startButton = document.getElementById("startBtn");
    const menu = document.getElementById("menu");

    let scene;
    let camera;
    let renderer;

    let player;
    let playerBody;
    let playerGun;

    let enemies = [];
    let bullets = [];

    let gameStarted = false;

    let health = 100;
    let ammo = 30;

    const keys = {};

    let cameraYaw = 0;
    let cameraPitch = 0.25;

    const clock = new THREE.Clock();

    /* ========================================================
       START GAME
    ======================================================== */

    if (startButton) {
        startButton.addEventListener("click", startGame);
    }

    function startGame() {

        if (gameStarted) return;

        gameStarted = true;

        if (menu) {
            menu.style.display = "none";
        }

        const hud = document.getElementById("gameHUD");

        if (hud) {
            hud.style.display = "block";
        }

        createGame();

    }


    /* ========================================================
       CREATE GAME
    ======================================================== */

    function createGame() {

        /* ----------------------------------------------------
           SCENE
        ---------------------------------------------------- */

        scene = new THREE.Scene();

        scene.background =
            new THREE.Color(0x83c9f4);

        scene.fog =
            new THREE.Fog(
                0x83c9f4,
                70,
                260
            );


        /* ----------------------------------------------------
           CAMERA
        ---------------------------------------------------- */

        camera =
            new THREE.PerspectiveCamera(
                65,
                window.innerWidth /
                window.innerHeight,
                0.1,
                1000
            );


        /* ----------------------------------------------------
           RENDERER
        ---------------------------------------------------- */

        renderer =
            new THREE.WebGLRenderer({
                antialias: true
            });

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio,
                2
            )
        );

        renderer.shadowMap.enabled = true;

        renderer.shadowMap.type =
            THREE.PCFSoftShadowMap;

        document.body.appendChild(
            renderer.domElement
        );


        /* ----------------------------------------------------
           LIGHTING
        ---------------------------------------------------- */

        const sun =
            new THREE.DirectionalLight(
                0xffffff,
                2.5
            );

        sun.position.set(
            80,
            120,
            60
        );

        sun.castShadow = true;

        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;

        sun.shadow.camera.left = -150;
        sun.shadow.camera.right = 150;
        sun.shadow.camera.top = 150;
        sun.shadow.camera.bottom = -150;

        scene.add(sun);


        const ambient =
            new THREE.HemisphereLight(
                0xbfe7ff,
                0x304020,
                1.5
            );

        scene.add(ambient);


        /* ----------------------------------------------------
           WORLD
        ---------------------------------------------------- */

        createTerrain();

        createMountains();

        createBuildings();

        createTrees();

        createRocks();


        /* ----------------------------------------------------
           PLAYER
        ---------------------------------------------------- */

        player =
            createCharacter(
                0x1565ff,
                true
            );

        player.position.set(
            0,
            0,
            10
        );

        scene.add(player);


        /* ----------------------------------------------------
           ENEMIES
        ---------------------------------------------------- */

        createEnemies();


        /* ----------------------------------------------------
           CAMERA
        ---------------------------------------------------- */

        updateCamera();


        /* ----------------------------------------------------
           CONTROLS
        ---------------------------------------------------- */

        setupControls();

        setupShooting();


        /* ----------------------------------------------------
           START LOOP
        ---------------------------------------------------- */

        animate();

    }


    /* ========================================================
       TERRAIN
       ======================================================== */

    function createTerrain() {

        const geometry =
            new THREE.PlaneGeometry(
                300,
                300,
                40,
                40
            );

        const material =
            new THREE.MeshStandardMaterial({
                color: 0x3c8c45,
                roughness: 1
            });

        const terrain =
            new THREE.Mesh(
                geometry,
                material
            );

        terrain.rotation.x =
            -Math.PI / 2;

        terrain.receiveShadow = true;

        scene.add(terrain);


        /* ----------------------------------------------------
           SMALL TERRAIN VARIATION
        ---------------------------------------------------- */

        const positions =
            geometry.attributes.position;

        for (
            let i = 0;
            i < positions.count;
            i++
        ) {

            const x =
                positions.getX(i);

            const z =
                positions.getY(i);

            const height =
                Math.sin(x * 0.035) *
                1.5 +
                Math.cos(z * 0.04) *
                1.2;

            positions.setZ(
                i,
                height
            );

        }

        geometry.computeVertexNormals();

    }


    /* ========================================================
       MOUNTAINS
       ======================================================== */

    function createMountains() {

        for (
            let i = 0;
            i < 16;
            i++
        ) {

            const mountain =
                new THREE.Mesh(
                    new THREE.ConeGeometry(
                        18 +
                        Math.random() * 20,
                        35 +
                        Math.random() * 35,
                        8
                    ),
                    new THREE.MeshStandardMaterial({
                        color: 0x405d43,
                        roughness: 1
                    })
                );

            const angle =
                (i / 16) *
                Math.PI *
                2;

            const distance = 115;

            mountain.position.set(
                Math.cos(angle) * distance,
                15,
                Math.sin(angle) * distance
            );

            mountain.castShadow = true;

            mountain.receiveShadow = true;

            scene.add(mountain);

        }

    }


    /* ========================================================
       BUILDINGS
       ======================================================== */

    function createBuildings() {

        const locations = [

            [-35, -30],
            [25, -40],
            [55, 5],
            [-50, 25],
            [35, 35],
            [-10, -55],
            [70, -25],
            [-75, -5]

        ];


        locations.forEach(
            ([x, z]) => {

                createBuilding(
                    x,
                    z
                );

            }
        );

    }


    function createBuilding(x, z) {

        const building =
            new THREE.Group();


        /* ----------------------------------------------------
           MAIN BUILDING
        ---------------------------------------------------- */

        const body =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    15,
                    8,
                    12
                ),
                new THREE.MeshStandardMaterial({
                    color:
                        0xc7c7c7,
                    roughness: 0.9
                })
            );

        body.position.y = 4;

        body.castShadow = true;

        body.receiveShadow = true;

        building.add(body);


        /* ----------------------------------------------------
           ROOF
        ---------------------------------------------------- */

        const roof =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    10,
                    5,
                    4
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x4d4d4d
                })
            );

        roof.rotation.y =
            Math.PI / 4;

        roof.position.y = 10;

        roof.scale.z = 0.75;

        roof.castShadow = true;

        building.add(roof);


        /* ----------------------------------------------------
           WINDOWS
        ---------------------------------------------------- */

        for (
            let side = -1;
            side <= 1;
            side += 2
        ) {

            for (
                let i = -1;
                i <= 1;
                i++
            ) {

                const windowMesh =
                    new THREE.Mesh(
                        new THREE.BoxGeometry(
                            2.2,
                            2,
                            0.2
                        ),
                        new THREE.MeshStandardMaterial({
                            color: 0x4da6d9,
                            metalness: 0.3,
                            roughness: 0.2
                        })
                    );

                windowMesh.position.set(
                    i * 4,
                    4.5,
                    side * 6.1
                );

                building.add(
                    windowMesh
                );

            }

        }


        /* ----------------------------------------------------
           DOOR
        ---------------------------------------------------- */

        const door =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    2.5,
                    4,
                    0.25
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x51351f
                })
            );

        door.position.set(
            0,
            2,
            6.15
        );

        building.add(door);


        building.position.set(
            x,
            0,
            z
        );

        building.rotation.y =
            Math.random() *
            Math.PI;

        scene.add(building);

    }


    /* ========================================================
       TREES
       ======================================================== */

    function createTrees() {

        for (
            let i = 0;
            i < 70;
            i++
        ) {

            const x =
                Math.random() *
                240 - 120;

            const z =
                Math.random() *
                240 - 120;


            /* Keep some space around player */

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


    function createTree(x, z) {

        const tree =
            new THREE.Group();


        /* ----------------------------------------------------
           TRUNK
        ---------------------------------------------------- */

        const trunk =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.6,
                    0.9,
                    6,
                    8
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x654321
                })
            );

        trunk.position.y = 3;

        trunk.castShadow = true;

        tree.add(trunk);


        /* ----------------------------------------------------
           LEAVES
        ---------------------------------------------------- */

        const leaves =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    3.5,
                    10,
                    8
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x176b2b,
                    roughness: 1
                })
            );

        leaves.position.y = 7;

        leaves.castShadow = true;

        tree.add(leaves);


        tree.position.set(
            x,
            0,
            z
        );

        scene.add(tree);

    }


    /* ========================================================
       ROCKS
       ======================================================== */

    function createRocks() {

        for (
            let i = 0;
            i < 45;
            i++
        ) {

            const rock =
                new THREE.Mesh(
                    new THREE.DodecahedronGeometry(
                        1 +
                        Math.random() * 2,
                        0
                    ),
                    new THREE.MeshStandardMaterial({
                        color: 0x666666,
                        roughness: 1
                    })
                );

            rock.position.set(
                Math.random() * 240 - 120,
                1,
                Math.random() * 240 - 120
            );

            rock.rotation.x =
                Math.random() * 3;

            rock.rotation.y =
                Math.random() * 3;

            rock.castShadow = true;

            rock.receiveShadow = true;

            scene.add(rock);

        }

    }


    /* ========================================================
       CHARACTER CREATOR
       ======================================================== */

    function createCharacter(
        color,
        isPlayer
    ) {

        const character =
            new THREE.Group();


        /* ----------------------------------------------------
           LEGS
        ---------------------------------------------------- */

        const legMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x20242a,
                roughness: 0.8
            });


        const leftLeg =
            new THREE.Mesh(
                new THREE.CapsuleGeometry(
                    0.28,
                    1.4,
                    4,
                    8
                ),
                legMaterial
            );

        leftLeg.position.set(
            -0.3,
            1.05,
            0
        );

        leftLeg.castShadow = true;

        character.add(leftLeg);


        const rightLeg =
            new THREE.Mesh(
                new THREE.CapsuleGeometry(
                    0.28,
                    1.4,
                    4,
                    8
                ),
                legMaterial
            );

        rightLeg.position.set(
            0.3,
            1.05,
            0
        );

        rightLeg.castShadow = true;

        character.add(rightLeg);


        /* ----------------------------------------------------
           TORSO
        ---------------------------------------------------- */

        const torso =
            new THREE.Mesh(
                new THREE.CapsuleGeometry(
                    0.65,
                    1.3,
                    6,
                    12
                ),
                new THREE.MeshStandardMaterial({
                    color: color,
                    roughness: 0.7
                })
            );

        torso.position.y = 2.55;

        torso.castShadow = true;

        character.add(torso);


        /* ----------------------------------------------------
           HEAD
        ---------------------------------------------------- */

        const head =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.52,
                    16,
                    16
                ),
                new THREE.MeshStandardMaterial({
                    color: 0xc88b68,
                    roughness: 0.8
                })
            );

        head.position.y = 4.05;

        head.castShadow = true;

        character.add(head);


        /* ----------------------------------------------------
           HAIR
        ---------------------------------------------------- */

        const hair =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.54,
                    16,
                    8,
                    0,
                    Math.PI * 2,
                    0,
                    Math.PI / 2
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x17120f
                })
            );

        hair.position.y = 4.15;

        hair.castShadow = true;

        character.add(hair);


        /* ----------------------------------------------------
           ARMS
        ---------------------------------------------------- */

        const armMaterial =
            new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.7
            });


        const leftArm =
            new THREE.Mesh(
                new THREE.CapsuleGeometry(
                    0.22,
                    1.2,
                    4,
                    8
                ),
                armMaterial
            );

        leftArm.position.set(
            -0.85,
            2.65,
            0
        );

        leftArm.rotation.z =
            -0.15;

        leftArm.castShadow = true;

        character.add(leftArm);


        const rightArm =
            new THREE.Mesh(
                new THREE.CapsuleGeometry(
                    0.22,
                    1.2,
                    4,
                    8
                ),
                armMaterial
            );

        rightArm.position.set(
            0.85,
            2.65,
            0
        );

        rightArm.rotation.z =
            0.15;

        rightArm.castShadow = true;

        character.add(rightArm);


        /* ----------------------------------------------------
           GUN
        ---------------------------------------------------- */

        const gun =
            new THREE.Group();


        const gunBody =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.25,
                    0.25,
                    1.8
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x161616,
                    metalness: 0.7,
                    roughness: 0.3
                })
            );

        gunBody.position.z =
            -0.8;

        gun.add(gunBody);


        const barrel =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.07,
                    0.07,
                    0.8,
                    8
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x080808,
                    metalness: 0.8
                })
            );

        barrel.rotation.x =
            Math.PI / 2;

        barrel.position.z =
            -1.8;

        gun.add(barrel);


        gun.position.set(
            0.55,
            2.65,
            -0.9
        );

        gun.rotation.x =
            -0.05;

        character.add(gun);


        character.userData.gun =
            gun;


        character.userData.isPlayer =
            isPlayer;


        return character;

    }


    /* ========================================================
       ENEMIES
       ======================================================== */

    function createEnemies() {

        for (
            let i = 0;
            i < 12;
            i++
        ) {

            const enemy =
                createCharacter(
                    0xb92828,
                    false
                );


            let x;
            let z;


            do {

                x =
                    Math.random() *
                    160 - 80;

                z =
                    Math.random() *
                    160 - 80;

            } while (
                Math.abs(x) < 25 &&
                Math.abs(z) < 25
            );


            enemy.position.set(
                x,
                0,
                z
            );


            enemy.userData.health =
                100;

            enemy.userData.speed =
                0.025 +
                Math.random() *
                0.02;


            scene.add(enemy);

            enemies.push(enemy);

        }

    }


    /* ========================================================
       KEYBOARD CONTROLS
       ======================================================== */

    function setupControls() {

        window.addEventListener(
            "keydown",
            event => {

                keys[
                    event.key.toLowerCase()
                ] = true;


                if (
                    event.key === " "
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


        /* ----------------------------------------------------
           MOUSE CAMERA
        ---------------------------------------------------- */

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


                cameraYaw -=
                    event.movementX *
                    0.0025;

                cameraPitch -=
                    event.movementY *
                    0.002;

                cameraPitch =
                    Math.max(
                        -0.3,
                        Math.min(
                            0.8,
                            cameraPitch
                        )
                    );

            }
        );

    }


    /* ========================================================
       MOVEMENT
       ======================================================== */

    function updatePlayer() {

        if (!player) return;


        const speed =
            keys["shift"]
                ? 0.22
                : 0.12;


        let forward = 0;
        let side = 0;


        if (keys["w"]) {
            forward += 1;
        }

        if (keys["s"]) {
            forward -= 1;
        }

        if (keys["a"]) {
            side -= 1;
        }

        if (keys["d"]) {
            side += 1;
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
                cameraYaw
            );


            direction.normalize();


            player.position.x +=
                direction.x *
                speed;

            player.position.z +=
                direction.z *
                speed;


            /* Face movement direction */

            const targetRotation =
                Math.atan2(
                    direction.x,
                    direction.z
                );


            player.rotation.y +=
                angleDifference(
                    player.rotation.y,
                    targetRotation
                ) *
                0.18;


            /* Simple running animation */

            const time =
                performance.now() *
                0.012;

            player.children[0]
                .rotation.x =
                Math.sin(time) *
                0.4;

            player.children[1]
                .rotation.x =
                -Math.sin(time) *
                0.4;

        }


        /* Keep player inside map */

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


    function angleDifference(
        current,
        target
    ) {

        let difference =
            target - current;

        while (
            difference > Math.PI
        ) {
            difference -=
                Math.PI * 2;
        }

        while (
            difference < -Math.PI
        ) {
            difference +=
                Math.PI * 2;
        }

        return difference;

    }


    /* ========================================================
       CAMERA
       ======================================================== */

    function updateCamera() {

        if (!player) return;


        const distance = 8;


        const horizontal =
            Math.cos(cameraPitch) *
            distance;


        const vertical =
            Math.sin(cameraPitch) *
            distance;


        const offset =
            new THREE.Vector3(
                Math.sin(cameraYaw) *
                horizontal,

                vertical + 3,

                Math.cos(cameraYaw) *
                horizontal
            );


        camera.position.copy(
            player.position
        );


        camera.position.add(
            offset
        );


        const target =
            player.position.clone();


        target.y += 2.3;


        camera.lookAt(target);

    }


    /* ========================================================
       SHOOTING
       ======================================================== */

    function setupShooting() {

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


        const fireButton =
            document.getElementById(
                "fireButton"
            );


        if (fireButton) {

            fireButton.addEventListener(
                "touchstart",
                event => {

                    event.preventDefault();

                    shoot();

                },
                {
                    passive: false
                }
            );

        }

    }


    function shoot() {

        if (!gameStarted) return;

        if (ammo <= 0) {

            reload();

            return;

        }


        ammo--;

        updateHUD();


        /* ----------------------------------------------------
           BULLET
        ---------------------------------------------------- */

        const bullet =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.08,
                    8,
                    8
                ),
                new THREE.MeshBasicMaterial({
                    color: 0xffff66
                })
            );


        const start =
            camera.position.clone();


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
            start
        );


        bullet.userData.velocity =
            direction.multiplyScalar(
                1.5
            );


        bullet.userData.life =
            100;


        scene.add(bullet);

        bullets.push(bullet);

    }


    /* ========================================================
       BULLETS
       ======================================================== */

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


            let hit = false;


            for (
                let j = enemies.length - 1;
                j >= 0;
                j--
            ) {

                const enemy =
                    enemies[j];


                const distance =
                    bullet.position.distanceTo(
                        enemy.position
                    );


                if (
                    distance < 1.5
                ) {

                    enemy.userData.health -=
                        35;

                    hit = true;


                    if (
                        enemy.userData.health <=
                        0
                    ) {

                        scene.remove(
                            enemy
                        );

                        enemies.splice(
                            j,
                            1
                        );

                    }

                    break;

                }

            }


            if (
                hit ||
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


    /* ========================================================
       ENEMY AI
       ======================================================== */

    function updateEnemies() {

        if (!player) return;


        enemies.forEach(
            enemy => {

                const distance =
                    enemy.position.distanceTo(
                        player.position
                    );


                /* Enemy moves toward player */

                if (
                    distance < 70
                ) {

                    const direction =
                        new THREE.Vector3()
                            .subVectors(
                                player.position,
                                enemy.position
                            );


                    direction.y = 0;

                    direction.normalize();


                    enemy.position.add(
                        direction.multiplyScalar(
                            enemy.userData.speed
                        )
                    );


                    enemy.rotation.y =
                        Math.atan2(
                            direction.x,
                            direction.z
                        );


                    /* Attack player */

                    if (
                        distance < 2.5
                    ) {

                        damagePlayer(
                            0.08
                        );

                    }

                }

            }
        );

    }


    /* ========================================================
       PLAYER DAMAGE
       ======================================================== */

    function damagePlayer(
        amount
    ) {

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

            gameOver();

        }

    }


    /* ========================================================
       JUMP
       ======================================================== */

    let verticalVelocity = 0;

    let grounded = true;


    function jump() {

        if (!grounded) return;


        grounded = false;

        verticalVelocity =
            0.28;

    }


    function updateJump() {

        if (!player) return;


        if (!grounded) {

            player.position.y +=
                verticalVelocity;

            verticalVelocity -=
                0.015;


            if (
                player.position.y <= 0
            ) {

                player.position.y = 0;

                verticalVelocity = 0;

                grounded = true;

            }

        }

    }


    /* ========================================================
       RELOAD
       ======================================================== */

    function reload() {

        ammo = 30;

        updateHUD();

    }


    /* ========================================================
       HUD
       ======================================================== */

    function updateHUD() {

        const ammoElement =
            document.getElementById(
                "ammo"
            );


        if (ammoElement) {

            ammoElement.textContent =
                ammo;

        }


        const healthFill =
            document.getElementById(
                "healthFill"
            );


        if (healthFill) {

            healthFill.style.width =
                health + "%";

        }


        const healthText =
            document.getElementById(
                "healthText"
            );


        if (healthText) {

            healthText.textContent =
                "HP " +
                Math.round(health) +
                " / 100";

        }

    }


    /* ========================================================
       GAME OVER
       ======================================================== */

    function gameOver() {

        gameStarted = false;


        const message =
            document.createElement(
                "div"
            );


        message.style.position =
            "fixed";

        message.style.inset = "0";

        message.style.display =
            "flex";

        message.style.flexDirection =
            "column";

        message.style.alignItems =
            "center";

        message.style.justifyContent =
            "center";

        message.style.background =
            "rgba(0,0,0,.8)";

        message.style.color =
            "white";

        message.style.zIndex =
            "30000";

        message.style.fontFamily =
            "Arial";


        message.innerHTML = `

            <h1 style="
                font-size:48px;
                margin-bottom:10px;
            ">
                YOU WERE ELIMINATED
            </h1>

            <p style="
                font-size:20px;
                opacity:.8;
            ">
                Better luck next time.
            </p>

            <button
                onclick="location.reload()"
                style="
                    margin-top:25px;
                    padding:15px 30px;
                    border-radius:10px;
                    border:none;
                    font-size:18px;
                    font-weight:bold;
                    cursor:pointer;
                "
            >
                PLAY AGAIN
            </button>

        `;


        document.body.appendChild(
            message
        );

    }


    /* ========================================================
       WIN
       ======================================================== */

    function checkWin() {

        if (
            enemies.length === 0 &&
            gameStarted
        ) {

            gameStarted = false;


            const message =
                document.createElement(
                    "div"
                );


            message.style.position =
                "fixed";

            message.style.inset = "0";

            message.style.display =
                "flex";

            message.style.flexDirection =
                "column";

            message.style.alignItems =
                "center";

            message.style.justifyContent =
                "center";

            message.style.background =
                "rgba(0,0,0,.75)";

            message.style.color =
                "white";

            message.style.zIndex =
                "30000";

            message.style.fontFamily =
                "Arial";


            message.innerHTML = `

                <h1 style="
                    font-size:60px;
                    margin:0;
                ">
                    VICTORY!
                </h1>

                <p style="
                    font-size:22px;
                ">
                    YOU ARE THE LAST PLAYER STANDING
                </p>

                <button
                    onclick="location.reload()"
                    style="
                        margin-top:25px;
                        padding:15px 30px;
                        border-radius:10px;
                        border:none;
                        font-size:18px;
                        font-weight:bold;
                        cursor:pointer;
                    "
                >
                    PLAY AGAIN
                </button>

            `;


            document.body.appendChild(
                message
            );

        }

    }


    /* ========================================================
       ANIMATION LOOP
       ======================================================== */

    function animate() {

        requestAnimationFrame(
            animate
        );


        if (!gameStarted) {

            renderer.render(
                scene,
                camera
            );

            return;

        }


        const delta =
            clock.getDelta();


        updatePlayer();

        updateJump();

        updateCamera();

        updateBullets();

        updateEnemies();

        checkWin();


        renderer.render(
            scene,
            camera
        );

    }


    /* ========================================================
       WINDOW RESIZE
       ======================================================== */

    window.addEventListener(
        "resize",
        () => {

            if (!camera || !renderer)
                return;


            camera.aspect =
                window.innerWidth /
                window.innerHeight;


            camera.updateProjectionMatrix();


            renderer.setSize(
                window.innerWidth,
                window.innerHeight
            );

        }
    );


});
