// ============================================
// KOLLINSKY BATTLE ROYALE
// Complete game.js - Version 0.1
// ============================================

let scene;
let camera;
let renderer;

let player;
let bots = [];
let bullets = [];

let health = 100;
let ammo = 30;

let gameStarted = false;

let keys = {};

let yaw = 0;
let pitch = 0;

let zoneRadius = 100;

let playerVelocityY = 0;
let isGrounded = true;

const clock = new THREE.Clock();


// ============================================
// START BUTTON
// ============================================

const startButton =
  document.getElementById("startButton");

startButton.addEventListener("click", startGame);


async function startGame() {

  const loadingText =
    document.getElementById("loadingText");

  startButton.disabled = true;

  loadingText.textContent =
    "Starting game...";


  // Try fullscreen

  try {

    if (
      document.documentElement.requestFullscreen
    ) {

      await document.documentElement
        .requestFullscreen();

    }

  } catch (error) {

    console.log(
      "Fullscreen was not available."
    );

  }


  // Try landscape mode

  try {

    if (
      screen.orientation &&
      screen.orientation.lock
    ) {

      await screen.orientation.lock(
        "landscape"
      );

    }

  } catch (error) {

    console.log(
      "Landscape lock was not available."
    );

  }


  loadingText.textContent =
    "Loading map...";


  // Create the game

  createGame();


  // Hide start screen

  document.getElementById(
    "startScreen"
  ).style.display = "none";


  gameStarted = true;

  clock.start();

  animate();
}


// ============================================
// CREATE GAME
// ============================================

function createGame() {

  // ------------------------------------------
  // SCENE
  // ------------------------------------------

  scene = new THREE.Scene();

  scene.background =
    new THREE.Color(0x87ceeb);


  // ------------------------------------------
  // CAMERA
  // ------------------------------------------

  camera =
    new THREE.PerspectiveCamera(
      75,
      window.innerWidth /
        window.innerHeight,
      0.1,
      1000
    );


  camera.position.set(
    0,
    2.5,
    5
  );


  // ------------------------------------------
  // RENDERER
  // ------------------------------------------

  renderer =
    new THREE.WebGLRenderer({
      antialias: true
    });


  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio,
      2
    )
  );


  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );


  renderer.outputColorSpace =
    THREE.SRGBColorSpace;


  document.body.appendChild(
    renderer.domElement
  );


  // ------------------------------------------
  // LIGHTING
  // ------------------------------------------

  const sunlight =
    new THREE.DirectionalLight(
      0xffffff,
      2
    );

  sunlight.position.set(
    50,
    100,
    50
  );

  scene.add(sunlight);


  const ambient =
    new THREE.AmbientLight(
      0xffffff,
      0.5
    );

  scene.add(ambient);


  // ------------------------------------------
  // GROUND
  // ------------------------------------------

  const groundGeometry =
    new THREE.PlaneGeometry(
      300,
      300
    );


  const groundMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x3c8f3c
    });


  const ground =
    new THREE.Mesh(
      groundGeometry,
      groundMaterial
    );


  ground.rotation.x =
    -Math.PI / 2;


  ground.receiveShadow = true;


  scene.add(ground);


  // ------------------------------------------
  // SIMPLE MAP OBJECTS
  // ------------------------------------------

  createMapObjects();


  // ------------------------------------------
  // PLAYER
  // ------------------------------------------

  const playerGeometry =
    new THREE.BoxGeometry(
      1,
      2,
      1
    );


  const playerMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x0066ff
    });


  player =
    new THREE.Mesh(
      playerGeometry,
      playerMaterial
    );


  player.position.set(
    0,
    1,
    0
  );


  scene.add(player);


  // ------------------------------------------
  // CREATE BOTS
  // ------------------------------------------

  createBots(8);


  // ------------------------------------------
  // CONTROLS
  // ------------------------------------------

  setupControls();


  // ------------------------------------------
  // RESIZE
  // ------------------------------------------

  window.addEventListener(
    "resize",
    resize
  );
}


// ============================================
// MAP OBJECTS
// ============================================

function createMapObjects() {

  for (let i = 0; i < 25; i++) {

    const width =
      3 + Math.random() * 5;

    const height =
      2 + Math.random() * 5;

    const depth =
      3 + Math.random() * 5;


    const building =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          width,
          height,
          depth
        ),
        new THREE.MeshStandardMaterial({
          color:
            0x777777
        })
      );


    building.position.set(
      Math.random() * 160 - 80,
      height / 2,
      Math.random() * 160 - 80
    );


    scene.add(building);
  }


  // Trees

  for (let i = 0; i < 40; i++) {

    const trunk =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.25,
          0.35,
          2,
          8
        ),
        new THREE.MeshStandardMaterial({
          color: 0x6b3e26
        })
      );


    trunk.position.set(
      Math.random() * 180 - 90,
      1,
      Math.random() * 180 - 90
    );


    scene.add(trunk);


    const leaves =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          1.5,
          8,
          8
        ),
        new THREE.MeshStandardMaterial({
          color: 0x176b24
        })
      );


    leaves.position.set(
      trunk.position.x,
      2.7,
      trunk.position.z
    );


    scene.add(leaves);
  }
}


// ============================================
// CREATE BOTS
// ============================================

function createBots(number) {

  for (let i = 0; i < number; i++) {

    const geometry =
      new THREE.BoxGeometry(
        1,
        2,
        1
      );


    const material =
      new THREE.MeshStandardMaterial({
        color: 0xff3333
      });


    const bot =
      new THREE.Mesh(
        geometry,
        material
      );


    bot.position.set(
      Math.random() * 120 - 60,
      1,
      Math.random() * 120 - 60
    );


    // Don't spawn directly on player

    if (
      bot.position.distanceTo(
        player.position
      ) < 15
    ) {

      bot.position.x += 20;

    }


    bot.health = 100;

    bot.shootTimer =
      Math.random() * 3;


    bot.speed =
      1.5 + Math.random();


    scene.add(bot);

    bots.push(bot);
  }
}


// ============================================
// CONTROLS
// ============================================

function setupControls() {

  // Keyboard

  document.addEventListener(
    "keydown",
    function(event) {

      keys[
        event.key.toLowerCase()
      ] = true;


      // Jump

      if (
        event.key === " "
      ) {

        jump();

      }


      // Reload

      if (
        event.key.toLowerCase() === "r"
      ) {

        reload();

      }

    }
  );


  document.addEventListener(
    "keyup",
    function(event) {

      keys[
        event.key.toLowerCase()
      ] = false;

    }
  );


  // Mouse look

  document.addEventListener(
    "mousemove",
    function(event) {

      if (!gameStarted) {
        return;
      }


      yaw -=
        event.movementX * 0.002;


      pitch -=
        event.movementY * 0.002;


      pitch =
        Math.max(
          -1.2,
          Math.min(
            1.2,
            pitch
          )
        );

    }
  );


  // Shooting

  document.addEventListener(
    "mousedown",
    function() {

      if (gameStarted) {

        shoot();

      }

    }
  );


  // Pointer lock

  renderer.domElement.addEventListener(
    "click",
    function() {

      if (
        gameStarted &&
        document.pointerLockElement !==
          renderer.domElement
      ) {

        renderer.domElement.requestPointerLock();

      }

    }
  );
}


// ============================================
// PLAYER MOVEMENT
// ============================================

function updatePlayer(delta) {

  const speed = 12;


  const direction =
    new THREE.Vector3();


  if (keys["w"]) {

    direction.z -= 1;

  }


  if (keys["s"]) {

    direction.z += 1;

  }


  if (keys["a"]) {

    direction.x -= 1;

  }


  if (keys["d"]) {

    direction.x += 1;

  }


  if (direction.length() > 0) {

    direction.normalize();


    direction.applyAxisAngle(
      new THREE.Vector3(
        0,
        1,
        0
      ),
      yaw
    );


    player.position.add(
      direction.multiplyScalar(
        speed * delta
      )
    );

  }


  // ------------------------------------------
  // GRAVITY
  // ------------------------------------------

  playerVelocityY -=
    20 * delta;


  player.position.y +=
    playerVelocityY * delta;


  if (player.position.y <= 1) {

    player.position.y = 1;

    playerVelocityY = 0;

    isGrounded = true;

  }


  // ------------------------------------------
  // CAMERA
  // ------------------------------------------

  camera.position.set(
    player.position.x,
    player.position.y + 1.5,
    player.position.z
  );


  camera.rotation.order =
    "YXZ";


  camera.rotation.y =
    yaw;


  camera.rotation.x =
    pitch;


  // Keep player inside map

  player.position.x =
    Math.max(
      -145,
      Math.min(
        145,
        player.position.x
      )
    );


  player.position.z =
    Math.max(
      -145,
      Math.min(
        145,
        player.position.z
      )
    );
}


// ============================================
// JUMP
// ============================================

function jump() {

  if (!gameStarted) {
    return;
  }


  if (!isGrounded) {
    return;
  }


  playerVelocityY = 8;

  isGrounded = false;
}


// ============================================
// SHOOT
// ============================================

function shoot() {

  if (!gameStarted) {
    return;
  }


  if (ammo <= 0) {

    showMessage(
      "RELOAD!"
    );

    return;
  }


  ammo--;


  document.getElementById(
    "ammoCount"
  ).textContent = ammo;


  // Bullet

  const bulletGeometry =
    new THREE.SphereGeometry(
      0.08,
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


  const direction =
    new THREE.Vector3(
      0,
      0,
      -1
    );


  direction.applyQuaternion(
    camera.quaternion
  );


  bullet.velocity =
    direction.multiplyScalar(
      60
    );


  bullet.life = 2;


  scene.add(bullet);

  bullets.push(bullet);
}


// ============================================
// UPDATE BULLETS
// ============================================

function updateBullets(delta) {

  for (
    let i = bullets.length - 1;
    i >= 0;
    i--
  ) {

    const bullet =
      bullets[i];


    bullet.position.add(
      bullet.velocity
        .clone()
        .multiplyScalar(delta)
    );


    bullet.life -= delta;


    // ----------------------------------------
    // CHECK BOT HITS
    // ----------------------------------------

    let bulletHit =
      false;


    for (
      let j = bots.length - 1;
      j >= 0;
      j--
    ) {

      const bot =
        bots[j];


      const distance =
        bullet.position.distanceTo(
          bot.position
        );


      if (distance < 1.3) {

        bot.health -= 50;

        bulletHit = true;


        if (
          bot.health <= 0
        ) {

          scene.remove(bot);

          bots.splice(
            j,
            1
          );


          document.getElementById(
            "bots"
          ).textContent =
            bots.length;


          showMessage(
            "BOT ELIMINATED"
          );


          checkWin();

        }


        break;
      }
    }


    if (bulletHit) {

      scene.remove(bullet);

      bullets.splice(
        i,
        1
      );

      continue;
    }


    // Remove old bullets

    if (
      bullet.life <= 0
    ) {

      scene.remove(bullet);

      bullets.splice(
        i,
        1
      );

    }
  }
}


// ============================================
// BOT AI
// ============================================

function updateBots(delta) {

  bots.forEach(
    function(bot) {

      const distance =
        bot.position.distanceTo(
          player.position
        );


      // --------------------------------------
      // CHASE PLAYER
      // --------------------------------------

      if (distance < 60) {

        const direction =
          new THREE.Vector3()
            .subVectors(
              player.position,
              bot.position
            );


        direction.y = 0;

        direction.normalize();


        bot.position.add(
          direction.multiplyScalar(
            bot.speed * delta
          )
        );


        // Face player

        bot.lookAt(
          player.position.x,
          bot.position.y,
          player.position.z
        );

      }


      // --------------------------------------
      // BOT SHOOTING
      // --------------------------------------

      bot.shootTimer -= delta;


      if (
        distance < 30 &&
        bot.shootTimer <= 0
      ) {

        playerTakeDamage(
          5
        );


        bot.shootTimer =
          1.5 +
          Math.random();

      }

    }
  );
}


// ============================================
// PLAYER DAMAGE
// ============================================

function playerTakeDamage(
  amount
) {

  if (!gameStarted) {
    return;
  }


  health -= amount;


  health =
    Math.max(
      0,
      health
    );


  document.getElementById(
    "health"
  ).textContent =
    Math.round(health);


  if (health <= 0) {

    gameOver();

  }
}


// ============================================
// RELOAD
// ============================================

function reload() {

  if (!gameStarted) {
    return;
  }


  ammo = 30;


  document.getElementById(
    "ammoCount"
  ).textContent =
    ammo;


  showMessage(
    "RELOADED"
  );
}


// ============================================
// SAFE ZONE
// ============================================

function updateZone(delta) {

  if (!gameStarted) {
    return;
  }


  zoneRadius -=
    delta * 0.5;


  zoneRadius =
    Math.max(
      20,
      zoneRadius
    );


  document.getElementById(
    "zoneSize"
  ).textContent =
    Math.round(zoneRadius);


  const distance =
    Math.sqrt(
      player.position.x *
        player.position.x +

      player.position.z *
        player.position.z
    );


  // Outside safe zone

  if (
    distance > zoneRadius
  ) {

    playerTakeDamage(
      5 * delta
    );

  }
}


// ============================================
// CHECK WIN
// ============================================

function checkWin() {

  if (
    bots.length === 0
  ) {

    showMessage(
      "🏆 YOU WIN!"
    );


    gameStarted = false;

  }
}


// ============================================
// GAME OVER
// ============================================

function gameOver() {

  showMessage(
    "💀 YOU DIED"
  );


  gameStarted = false;


  setTimeout(
    function() {

      location.reload();

    },
    2500
  );
}


// ============================================
// MESSAGE
// ============================================

function showMessage(
  text
) {

  const message =
    document.getElementById(
      "message"
    );


  message.textContent =
    text;


  setTimeout(
    function() {

      if (
        message.textContent === text
      ) {

        message.textContent = "";

      }

    },
    1500
  );
}


// ============================================
// WINDOW RESIZE
// ============================================

function resize() {

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


// ============================================
// MAIN GAME LOOP
// ============================================

function animate() {

  if (!renderer) {
    return;
  }


  requestAnimationFrame(
    animate
  );


  const delta =
    Math.min(
      clock.getDelta(),
      0.05
    );


  if (gameStarted) {

    updatePlayer(delta);

    updateBullets(delta);

    updateBots(delta);

    updateZone(delta);

  }


  renderer.render(
    scene,
    camera
  );
}
