// =====================================
// BATTLE ROYALE - VERSION 0.1
// =====================================

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

const clock = new THREE.Clock();


// =====================================
// START GAME
// =====================================

document.getElementById("startButton").addEventListener("click", startGame);


function startGame() {

  document.getElementById("startScreen").style.display = "none";

  gameStarted = true;

  createGame();

  animate();
}


// =====================================
// CREATE GAME
// =====================================

function createGame() {

  scene = new THREE.Scene();

  scene.background = new THREE.Color(0x87ceeb);

  // CAMERA

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  camera.position.set(0, 2, 5);


  // RENDERER

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  document.body.appendChild(renderer.domElement);


  // LIGHT

  const sunlight = new THREE.DirectionalLight(
    0xffffff,
    2
  );

  sunlight.position.set(50, 100, 50);

  scene.add(sunlight);


  const ambient = new THREE.AmbientLight(
    0xffffff,
    0.5
  );

  scene.add(ambient);


  // GROUND

  const groundGeometry =
    new THREE.PlaneGeometry(300, 300);

  const groundMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x3c8f3c
    });

  const ground =
    new THREE.Mesh(
      groundGeometry,
      groundMaterial
    );

  ground.rotation.x = -Math.PI / 2;

  scene.add(ground);


  // PLAYER

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


  // BOTS

  createBots(8);


  // CONTROLS

  setupControls();


  // WINDOW RESIZE

  window.addEventListener(
    "resize",
    resize
  );
}


// =====================================
// CREATE BOTS
// =====================================

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

    bot.health = 100;

    bot.shootTimer =
      Math.random() * 3;

    scene.add(bot);

    bots.push(bot);
  }
}


// =====================================
// CONTROLS
// =====================================

function setupControls() {

  document.addEventListener(
    "keydown",
    function(event) {

      keys[event.key.toLowerCase()] = true;

      if (event.key === " ") {
        jump();
      }

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

      keys[event.key.toLowerCase()] =
        false;

    }
  );


  document.addEventListener(
    "mousemove",
    function(event) {

      if (!gameStarted) return;

      yaw -= event.movementX * 0.002;

      pitch -= event.movementY * 0.002;

      pitch = Math.max(
        -1.2,
        Math.min(1.2, pitch)
      );

    }
  );


  document.addEventListener(
    "click",
    function() {

      if (gameStarted) {

        shoot();

      }

    }
  );
}


// =====================================
// PLAYER MOVEMENT
// =====================================

function updatePlayer(delta) {

  const speed = 12;

  let direction =
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
      new THREE.Vector3(0, 1, 0),
      yaw
    );

    player.position.add(
      direction.multiplyScalar(
        speed * delta
      )
    );
  }


  // CAMERA

  camera.position.set(
    player.position.x,
    player.position.y + 1.5,
    player.position.z
  );

  camera.rotation.order = "YXZ";

  camera.rotation.y = yaw;

  camera.rotation.x = pitch;
}


// =====================================
// SHOOTING
// =====================================

function shoot() {

  if (ammo <= 0) {

    showMessage("RELOAD!");

    return;
  }

  ammo--;

  document.getElementById(
    "ammoCount"
  ).textContent = ammo;


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
    direction.multiplyScalar(60);

  bullet.life = 2;

  scene.add(bullet);

  bullets.push(bullet);
}


// =====================================
// UPDATE BULLETS
// =====================================

function updateBullets(delta) {

  for (
    let i = bullets.length - 1;
    i >= 0;
    i--
  ) {

    const bullet = bullets[i];

    bullet.position.add(
      bullet.velocity.clone()
        .multiplyScalar(delta)
    );

    bullet.life -= delta;


    // HIT BOTS

    for (
      let j = bots.length - 1;
      j >= 0;
      j--
    ) {

      const bot = bots[j];

      const distance =
        bullet.position.distanceTo(
          bot.position
        );

      if (distance < 1.2) {

        bot.health -= 50;

        scene.remove(bullet);

        bullets.splice(i, 1);

        if (bot.health <= 0) {

          scene.remove(bot);

          bots.splice(j, 1);

          document.getElementById(
            "bots"
          ).textContent = bots.length;

          showMessage("BOT ELIMINATED");

          checkWin();
        }

        break;
      }
    }


    if (bullet.life <= 0) {

      scene.remove(bullet);

      bullets.splice(i, 1);

    }
  }
}


// =====================================
// BOT AI
// =====================================

function updateBots(delta) {

  bots.forEach(function(bot) {

    const distance =
      bot.position.distanceTo(
        player.position
      );


    // CHASE PLAYER

    if (distance < 50) {

      const direction =
        new THREE.Vector3()
          .subVectors(
            player.position,
            bot.position
          )
          .normalize();

      bot.position.add(
        direction.multiplyScalar(
          2 * delta
        )
      );

    }


    // SHOOT PLAYER

    bot.shootTimer -= delta;

    if (
      distance < 25 &&
      bot.shootTimer <= 0
    ) {

      playerTakeDamage(5);

      bot.shootTimer = 1.5;

    }

  });
}


// =====================================
// PLAYER DAMAGE
// =====================================

function playerTakeDamage(amount) {

  health -= amount;

  health =
    Math.max(0, health);

  document.getElementById(
    "health"
  ).textContent = health;


  if (health <= 0) {

    gameOver();

  }
}


// =====================================
// RELOAD
// =====================================

function reload() {

  ammo = 30;

  document.getElementById(
    "ammoCount"
  ).textContent = ammo;

  showMessage("RELOADED");
}


// =====================================
// JUMP
// =====================================

function jump() {

  // Simple prototype jump effect

  player.position.y = 3;

  setTimeout(function() {

    player.position.y = 1;

  }, 300);
}


// =====================================
// SAFE ZONE
// =====================================

function updateZone(delta) {

  zoneRadius -= delta * 0.5;

  zoneRadius =
    Math.max(20, zoneRadius);

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


  if (distance > zoneRadius) {

    playerTakeDamage(
      5 * delta
    );

  }
}


// =====================================
// WIN
// =====================================

function checkWin() {

  if (bots.length === 0) {

    showMessage(
      "🏆 YOU WIN!"
    );

    gameStarted = false;

  }
}


// =====================================
// GAME OVER
// =====================================

function gameOver() {

  showMessage(
    "💀 YOU DIED"
  );

  gameStarted = false;
}


// =====================================
// MESSAGE
// =====================================

function showMessage(text) {

  const message =
    document.getElementById(
      "message"
    );

  message.textContent = text;

  setTimeout(function() {

    message.textContent = "";

  }, 1500);
}


// =====================================
// RESIZE
// =====================================

function resize() {

  camera.aspect =
    window.innerWidth /
    window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );
}


// =====================================
// GAME LOOP
// =====================================

function animate() {

  if (!gameStarted) {

    renderer.render(
      scene,
      camera
    );

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


  updatePlayer(delta);

  updateBullets(delta);

  updateBots(delta);

  updateZone(delta);


  renderer.render(
    scene,
    camera
  );
}