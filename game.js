/* =========================================================
   KOLLINSKY ROYAL
   Stable Three.js Game Engine
   Desktop + Mobile Friendly Base
   ========================================================= */

(() => {
  "use strict";

  // ---------------------------------------------------------
  // BASIC CHECK
  // ---------------------------------------------------------

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
          <p>Three.js could not be loaded.</p>
          <p>Please make sure <b>three.js</b> is above <b>game.js</b> in index.html.</p>
        </div>
      </div>
    `;
    return;
  }

  // ---------------------------------------------------------
  // VARIABLES
  // ---------------------------------------------------------

  let scene;
  let camera;
  let renderer;

  let player;
  let gun;

  const enemies = [];
  const bullets = [];
  const trees = [];
  const buildings = [];

  let gameStarted = false;
  let gameOver = false;

  let health = 100;
  let ammo = 30;

  let yaw = 0;
  let pitch = 0;

  const keys = {};

  const clock = new THREE.Clock();

  // ---------------------------------------------------------
  // DOM
  // ---------------------------------------------------------

  const startScreen = document.getElementById("startScreen");
  const startButton =
    document.getElementById("startButton") ||
    document.getElementById("startGame") ||
    document.querySelector("button");

  // HUD
  let hud = document.getElementById("hud");

  if (!hud) {
    hud = document.createElement("div");
    hud.id = "hud";

    hud.style.position = "fixed";
    hud.style.left = "20px";
    hud.style.top = "20px";
    hud.style.zIndex = "1000";
    hud.style.color = "white";
    hud.style.fontFamily = "Arial";
    hud.style.fontWeight = "bold";
    hud.style.fontSize = "16px";
    hud.style.pointerEvents = "none";

    document.body.appendChild(hud);
  }

  // ---------------------------------------------------------
  // START BUTTON
  // ---------------------------------------------------------

  if (startButton) {
    startButton.addEventListener("click", startGame);
  } else {
    console.warn("Start button not found.");
  }

  // ---------------------------------------------------------
  // START GAME
  // ---------------------------------------------------------

  function startGame() {

    if (gameStarted) return;

    gameStarted = true;

    if (startScreen) {
      startScreen.style.display = "none";
    }

    createGame();

    // Fullscreen where supported
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {}

    // Landscape where supported
    try {
      if (
        screen.orientation &&
        screen.orientation.lock
      ) {
        screen.orientation.lock("landscape").catch(() => {});
      }
    } catch (e) {}

    updateHUD();

    clock.start();
  }

  // ---------------------------------------------------------
  // CREATE GAME
  // ---------------------------------------------------------

  function createGame() {

    // Scene
    scene = new THREE.Scene();

    scene.background = new THREE.Color(0x79bff2);

    // Camera
    camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    camera.position.set(0, 2.2, 6);

    // Renderer
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance"
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 2)
    );

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    renderer.shadowMap.enabled = true;

    renderer.shadowMap.type =
      THREE.PCFSoftShadowMap;

    renderer.domElement.style.position = "fixed";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.zIndex = "1";

    document.body.appendChild(renderer.domElement);

    // -------------------------------------------------------
    // LIGHTING
    // -------------------------------------------------------

    const ambient = new THREE.HemisphereLight(
      0xffffff,
      0x52634a,
      1.8
    );

    scene.add(ambient);

    const sun = new THREE.DirectionalLight(
      0xffffff,
      2.2
    );

    sun.position.set(
      80,
      100,
      40
    );

    sun.castShadow = true;

    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;

    sun.shadow.camera.left = -100;
    sun.shadow.camera.right = 100;
    sun.shadow.camera.top = 100;
    sun.shadow.camera.bottom = -100;

    scene.add(sun);

    // -------------------------------------------------------
    // SKY
    // -------------------------------------------------------

    createSky();

    // -------------------------------------------------------
    // MAP
    // -------------------------------------------------------

    createGround();
    createRoads();
    createBuildings();
    createTrees();

    // -------------------------------------------------------
    // PLAYER
    // -------------------------------------------------------

    createPlayer();

    // -------------------------------------------------------
    // ENEMIES
    // -------------------------------------------------------

    createEnemies();

    // -------------------------------------------------------
    // EVENTS
    // -------------------------------------------------------

    setupKeyboard();
    setupMouse();

    window.addEventListener(
      "resize",
      resizeGame
    );

    // -------------------------------------------------------
    // START LOOP
    // -------------------------------------------------------

    animate();
  }

  // ---------------------------------------------------------
  // SKY
  // ---------------------------------------------------------

  function createSky() {

    const skyGeometry =
      new THREE.SphereGeometry(
        500,
        32,
        32
      );

    const skyMaterial =
      new THREE.MeshBasicMaterial({
        color: 0x78bdf0,
        side: THREE.BackSide
      });

    const sky =
      new THREE.Mesh(
        skyGeometry,
        skyMaterial
      );

    scene.add(sky);
  }

  // ---------------------------------------------------------
  // GROUND
  // ---------------------------------------------------------

  function createGround() {

    const geometry =
      new THREE.PlaneGeometry(
        500,
        500
      );

    const material =
      new THREE.MeshStandardMaterial({
        color: 0x3e8d45,
        roughness: 1
      });

    const ground =
      new THREE.Mesh(
        geometry,
        material
      );

    ground.rotation.x = -Math.PI / 2;

    ground.receiveShadow = true;

    scene.add(ground);
  }

  // ---------------------------------------------------------
  // ROADS
  // ---------------------------------------------------------

  function createRoads() {

    createRoad(
      0,
      0,
      500,
      18,
      0
    );

    createRoad(
      0,
      0,
      18,
      500,
      0
    );

    createRoad(
      -90,
      0,
      260,
      12,
      0
    );

    createRoad(
      90,
      0,
      260,
      12,
      0
    );

    createRoad(
      0,
      -90,
      12,
      260,
      0
    );

    createRoad(
      0,
      90,
      12,
      260,
      0
    );
  }

  function createRoad(
    x,
    z,
    width,
    depth
  ) {

    const geometry =
      new THREE.BoxGeometry(
        width,
        0.04,
        depth
      );

    const material =
      new THREE.MeshStandardMaterial({
        color: 0x33383c,
        roughness: 0.9
      });

    const road =
      new THREE.Mesh(
        geometry,
        material
      );

    road.position.set(
      x,
      0.025,
      z
    );

    road.receiveShadow = true;

    scene.add(road);
  }

  // ---------------------------------------------------------
  // BUILDINGS
  // ---------------------------------------------------------

  function createBuildings() {

    const positions = [
      [-45, -45],
      [45, -45],
      [-45, 45],
      [45, 45],

      [-80, -20],
      [80, -20],
      [-80, 20],
      [80, 20],

      [-20, -80],
      [20, -80],
      [-20, 80],
      [20, 80],

      [-120, -100],
      [120, -100],
      [-120, 100],
      [120, 100],

      [-145, 0],
      [145, 0]
    ];

    positions.forEach((pos, index) => {

      const width =
        12 + Math.random() * 8;

      const depth =
        12 + Math.random() * 8;

      const height =
        6 + Math.random() * 10;

      const geometry =
        new THREE.BoxGeometry(
          width,
          height,
          depth
        );

      const colors = [
        0xb7b0a5,
        0x9d9d9d,
        0xc4a77d,
        0x8d9a9f,
        0xa78f7a
      ];

      const material =
        new THREE.MeshStandardMaterial({
          color:
            colors[index % colors.length],
          roughness: 0.8
        });

      const building =
        new THREE.Mesh(
          geometry,
          material
        );

      building.position.set(
        pos[0],
        height / 2,
        pos[1]
      );

      building.castShadow = true;
      building.receiveShadow = true;

      scene.add(building);

      buildings.push(building);

      // Roof
      const roofGeometry =
        new THREE.BoxGeometry(
          width + 0.5,
          0.6,
          depth + 0.5
        );

      const roofMaterial =
        new THREE.MeshStandardMaterial({
          color: 0x3e4447
        });

      const roof =
        new THREE.Mesh(
          roofGeometry,
          roofMaterial
        );

      roof.position.set(
        pos[0],
        height + 0.3,
        pos[1]
      );

      roof.castShadow = true;

      scene.add(roof);
    });
  }

  // ---------------------------------------------------------
  // TREES
  // ---------------------------------------------------------

  function createTrees() {

    for (let i = 0; i < 90; i++) {

      const x =
        (Math.random() - 0.5) * 420;

      const z =
        (Math.random() - 0.5) * 420;

      if (
        Math.abs(x) < 20 &&
        Math.abs(z) < 20
      ) {
        continue;
      }

      createTree(x, z);
    }
  }

  function createTree(x, z) {

    const trunkGeometry =
      new THREE.CylinderGeometry(
        0.35,
        0.5,
        3,
        8
      );

    const trunkMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x68462c
      });

    const trunk =
      new THREE.Mesh(
        trunkGeometry,
        trunkMaterial
      );

    trunk.position.set(
      x,
      1.5,
      z
    );

    trunk.castShadow = true;

    scene.add(trunk);

    const leavesGeometry =
      new THREE.SphereGeometry(
        2.4,
        12,
        12
      );

    const leavesMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x23752c
      });

    const leaves =
      new THREE.Mesh(
        leavesGeometry,
        leavesMaterial
      );

    leaves.position.set(
      x,
      4.1,
      z
    );

    leaves.castShadow = true;

    scene.add(leaves);

    trees.push({
      trunk,
      leaves
    });
  }

  // ---------------------------------------------------------
  // PLAYER
  // ---------------------------------------------------------

  function createPlayer() {

    player = new THREE.Group();

    // Body
    const bodyGeometry =
      new THREE.CapsuleGeometry(
        0.45,
        1.1,
        6,
        12
      );

    const bodyMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x1769ff,
        roughness: 0.6
      });

    const body =
      new THREE.Mesh(
        bodyGeometry,
        bodyMaterial
      );

    body.position.y = 1.15;

    body.castShadow = true;

    player.add(body);

    // Head
    const headGeometry =
      new THREE.SphereGeometry(
        0.4,
        16,
        16
      );

    const headMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xd49a72
      });

    const head =
      new THREE.Mesh(
        headGeometry,
        headMaterial
      );

    head.position.y = 2.05;

    head.castShadow = true;

    player.add(head);

    // Gun
    createGun();

    player.position.set(
      0,
      0,
      20
    );

    scene.add(player);
  }

  // ---------------------------------------------------------
  // GUN
  // ---------------------------------------------------------

  function createGun() {

    gun = new THREE.Group();

    const bodyGeometry =
      new THREE.BoxGeometry(
        0.18,
        0.18,
        1.2
      );

    const gunMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x222222,
        metalness: 0.7,
        roughness: 0.3
      });

    const gunBody =
      new THREE.Mesh(
        bodyGeometry,
        gunMaterial
      );

    gunBody.position.z = -0.55;

    gun.add(gunBody);

    const barrelGeometry =
      new THREE.CylinderGeometry(
        0.045,
        0.045,
        0.7,
        8
      );

    const barrel =
      new THREE.Mesh(
        barrelGeometry,
        gunMaterial
      );

    barrel.rotation.x =
      Math.PI / 2;

    barrel.position.z = -1.25;

    gun.add(barrel);

    gun.position.set(
      0.55,
      1.4,
      -0.25
    );

    player.add(gun);
  }

  // ---------------------------------------------------------
  // ENEMIES
  // ---------------------------------------------------------

  function createEnemies() {

    const positions = [
      [-30, -30],
      [30, -30],
      [-30, 30],
      [30, 30],
      [-60, 0],
      [60, 0],
      [0, -60],
      [0, 60],
      [-100, 50],
      [100, -50],
      [-120, -80],
      [120, 80]
    ];

    positions.forEach(
      (position, index) => {

        createEnemy(
          position[0],
          position[1],
          index
        );
      }
    );
  }

  function createEnemy(
    x,
    z,
    index
  ) {

    const enemy =
      new THREE.Group();

    // Body
    const bodyGeometry =
      new THREE.CapsuleGeometry(
        0.45,
        1.1,
        6,
        12
      );

    const bodyMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xc62828,
        roughness: 0.7
      });

    const body =
      new THREE.Mesh(
        bodyGeometry,
        bodyMaterial
      );

    body.position.y = 1.15;

    body.castShadow = true;

    enemy.add(body);

    // Head
    const headGeometry =
      new THREE.SphereGeometry(
        0.4,
        16,
        16
      );

    const headMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xd49a72
      });

    const head =
      new THREE.Mesh(
        headGeometry,
        headMaterial
      );

    head.position.y = 2.05;

    head.castShadow = true;

    enemy.add(head);

    enemy.position.set(
      x,
      0,
      z
    );

    scene.add(enemy);

    enemies.push({
      mesh: enemy,
      health: 100,
      alive: true,
      speed: 1.2 + Math.random() * 0.6,
      shootTimer: Math.random() * 3,
      index
    });
  }

  // ---------------------------------------------------------
  // KEYBOARD
  // ---------------------------------------------------------

  function setupKeyboard() {

    window.addEventListener(
      "keydown",
      (event) => {

        keys[event.code] = true;

        if (
          event.code === "Space"
        ) {
          event.preventDefault();
        }

        if (
          event.code === "KeyR"
        ) {
          reload();
        }
      }
    );

    window.addEventListener(
      "keyup",
      (event) => {
        keys[event.code] = false;
      }
    );
  }

  // ---------------------------------------------------------
  // MOUSE
  // ---------------------------------------------------------

  function setupMouse() {

    renderer.domElement.addEventListener(
      "click",
      () => {

        if (
          document.pointerLockElement !==
          renderer.domElement
        ) {

          renderer.domElement
            .requestPointerLock()
            .catch(() => {});
        }
      }
    );

    document.addEventListener(
      "mousemove",
      (event) => {

        if (
          document.pointerLockElement !==
          renderer.domElement
        ) {
          return;
        }

        yaw -= event.movementX * 0.0025;

        pitch -= event.movementY * 0.0025;

        pitch = Math.max(
          -1.2,
          Math.min(1.2, pitch)
        );
      }
    );

    window.addEventListener(
      "mousedown",
      (event) => {

        if (
          event.button === 0 &&
          gameStarted &&
          !gameOver
        ) {
          shoot();
        }
      }
    );
  }

  // ---------------------------------------------------------
  // PLAYER MOVEMENT
  // ---------------------------------------------------------

  function updatePlayer(delta) {

    if (!player) return;

    const speed =
      keys["ShiftLeft"] ||
      keys["ShiftRight"]
        ? 10
        : 5;

    let forward = 0;
    let right = 0;

    if (
      keys["KeyW"] ||
      keys["ArrowUp"]
    ) {
      forward += 1;
    }

    if (
      keys["KeyS"] ||
      keys["ArrowDown"]
    ) {
      forward -= 1;
    }

    if (
      keys["KeyA"] ||
      keys["ArrowLeft"]
    ) {
      right -= 1;
    }

    if (
      keys["KeyD"] ||
      keys["ArrowRight"]
    ) {
      right += 1;
    }

    const direction =
      new THREE.Vector3(
        right,
        0,
        -forward
      );

    if (direction.length() > 0) {

      direction.normalize();

      direction.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        yaw
      );

      player.position.add(
        direction.multiplyScalar(
          speed * delta
        )
      );
    }

    // Keep player inside map
    player.position.x =
      THREE.MathUtils.clamp(
        player.position.x,
        -230,
        230
      );

    player.position.z =
      THREE.MathUtils.clamp(
        player.position.z,
        -230,
        230
      );

    player.rotation.y = yaw;

    updateCamera();
  }

  // ---------------------------------------------------------
  // CAMERA
  // ---------------------------------------------------------

  function updateCamera() {

    if (!player || !camera) return;

    const cameraOffset =
      new THREE.Vector3(
        0,
        3.2,
        7
      );

    cameraOffset.applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      yaw
    );

    camera.position.copy(
      player.position
    );

    camera.position.add(
      cameraOffset
    );

    camera.position.y +=
      pitch * 2;

    camera.lookAt(
      player.position.x,
      player.position.y + 1.5,
      player.position.z
    );
  }

  // ---------------------------------------------------------
  // SHOOT
  // ---------------------------------------------------------

  function shoot() {

    if (ammo <= 0) {
      reload();
      return;
    }

    ammo--;

    updateHUD();

    const direction =
      new THREE.Vector3();

    camera.getWorldDirection(
      direction
    );

    const bulletGeometry =
      new THREE.SphereGeometry(
        0.07,
        8,
        8
      );

    const bulletMaterial =
      new THREE.MeshBasicMaterial({
        color: 0xffff00
      });

    const bullet =
      new THREE.Mesh(
        bulletGeometry,
        bulletMaterial
      );

    bullet.position.copy(
      camera.position
    );

    scene.add(bullet);

    bullets.push({
      mesh: bullet,
      direction:
        direction.normalize(),
      speed: 70,
      life: 2
    });
  }

  // ---------------------------------------------------------
  // BULLETS
  // ---------------------------------------------------------

  function updateBullets(delta) {

    for (
      let i = bullets.length - 1;
      i >= 0;
      i--
    ) {

      const bullet =
        bullets[i];

      bullet.mesh.position.add(
        bullet.direction.clone()
          .multiplyScalar(
            bullet.speed * delta
          )
      );

      bullet.life -= delta;

      let remove = false;

      for (
        let j = 0;
        j < enemies.length;
        j++
      ) {

        const enemy =
          enemies[j];

        if (!enemy.alive) continue;

        const distance =
          bullet.mesh.position.distanceTo(
            enemy.mesh.position
          );

        if (distance < 2.2) {

          enemy.health -= 40;

          if (enemy.health <= 0) {

            enemy.alive = false;

            scene.remove(
              enemy.mesh
            );
          }

          remove = true;

          break;
        }
      }

      if (
        bullet.life <= 0 ||
        remove
      ) {

        scene.remove(
          bullet.mesh
        );

        bullets.splice(
          i,
          1
        );
      }
    }
  }

  // ---------------------------------------------------------
  // ENEMY AI
  // ---------------------------------------------------------

  function updateEnemies(delta) {

    if (!player) return;

    enemies.forEach(
      (enemy) => {

        if (!enemy.alive) return;

        const distance =
          enemy.mesh.position.distanceTo(
            player.position
          );

        if (distance < 70) {

          const direction =
            new THREE.Vector3()
              .subVectors(
                player.position,
                enemy.mesh.position
              );

          direction.y = 0;

          if (direction.length() > 8) {

            direction.normalize();

            enemy.mesh.position.add(
              direction.multiplyScalar(
                enemy.speed * delta
              )
            );

            enemy.mesh.lookAt(
              player.position.x,
              enemy.mesh.position.y,
              player.position.z
            );
          }

          enemy.shootTimer -= delta;

          if (
            enemy.shootTimer <= 0 &&
            distance < 45
          ) {

            enemy.shootTimer =
              1.2 + Math.random() * 2;

            takeDamage(
              5 + Math.random() * 5
            );
          }
        }
      }
    );
  }

  // ---------------------------------------------------------
  // DAMAGE
  // ---------------------------------------------------------

  function takeDamage(amount) {

    if (gameOver) return;

    health -= amount;

    health =
      Math.max(
        0,
        health
      );

    updateHUD();

    if (health <= 0) {
      endGame(false);
    }
  }

  // ---------------------------------------------------------
  // RELOAD
  // ---------------------------------------------------------

  function reload() {

    ammo = 30;

    updateHUD();
  }

  // ---------------------------------------------------------
  // HUD
  // ---------------------------------------------------------

  function updateHUD() {

    if (!hud) return;

    const alive =
      enemies.filter(
        enemy => enemy.alive
      ).length;

    hud.innerHTML = `
      <div style="
        font-size:18px;
        margin-bottom:7px;
        text-shadow:0 2px 5px black;
      ">
        HP ${Math.round(health)} / 100
      </div>

      <div style="
        width:180px;
        height:12px;
        background:rgba(0,0,0,.5);
        border-radius:10px;
        overflow:hidden;
        margin-bottom:12px;
      ">
        <div style="
          width:${health}%;
          height:100%;
          background:#35e83f;
        "></div>
      </div>

      <div style="
        font-size:18px;
        text-shadow:0 2px 5px black;
      ">
        AMMO ${ammo} / 30
      </div>

      <div style="
        font-size:16px;
        margin-top:8px;
        text-shadow:0 2px 5px black;
      ">
        ENEMIES ${alive}
      </div>
    `;
  }

  // ---------------------------------------------------------
  // END GAME
  // ---------------------------------------------------------

  function endGame(won) {

    gameOver = true;

    const message =
      document.createElement("div");

    message.style.position = "fixed";
    message.style.inset = "0";
    message.style.zIndex = "5000";
    message.style.background =
      "rgba(0,0,0,.75)";
    message.style.display = "flex";
    message.style.flexDirection = "column";
    message.style.alignItems = "center";
    message.style.justifyContent = "center";
    message.style.color = "white";
    message.style.fontFamily = "Arial";
    message.style.textAlign = "center";

    message.innerHTML = `
      <h1 style="
        font-size:48px;
        margin:0 0 15px;
      ">
        ${won ? "VICTORY!" : "ELIMINATED"}
      </h1>

      <p style="
        font-size:20px;
      ">
        ${won
          ? "You are the last player standing."
          : "Better luck next time."
        }
      </p>

      <button id="restartGame" style="
        margin-top:20px;
        padding:15px 35px;
        border:0;
        border-radius:8px;
        font-size:18px;
        cursor:pointer;
      ">
        PLAY AGAIN
      </button>
    `;

    document.body.appendChild(
      message
    );

    document
      .getElementById("restartGame")
      .addEventListener(
        "click",
        () => {
          location.reload();
        }
      );
  }

  // ---------------------------------------------------------
  // CHECK VICTORY
  // ---------------------------------------------------------

  function checkVictory() {

    const alive =
      enemies.filter(
        enemy => enemy.alive
      ).length;

    if (
      alive === 0 &&
      !gameOver
    ) {
      endGame(true);
    }
  }

  // ---------------------------------------------------------
  // RESIZE
  // ---------------------------------------------------------

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

  // ---------------------------------------------------------
  // ANIMATION
  // ---------------------------------------------------------

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

    const delta =
      Math.min(
        clock.getDelta(),
        0.05
      );

    if (
      gameStarted &&
      !gameOver
    ) {

      updatePlayer(delta);

      updateBullets(delta);

      updateEnemies(delta);

      checkVictory();

      updateHUD();
    }

    renderer.render(
      scene,
      camera
    );
  }

})();
