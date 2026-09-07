document.addEventListener("DOMContentLoaded", () => {

    const startButton = document.getElementById("startBtn");
    const menu = document.getElementById("menu");

    if (!startButton) {
        alert("START button not found. Check the ID in index.html.");
        return;
    }

    startButton.addEventListener("click", startGame);

    function startGame() {

        // Hide the menu
        if (menu) {
            menu.style.display = "none";
        }

        // Try fullscreen (safe if browser doesn't allow it)
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
        }

        // Create game
        createGame();
    }

    function createGame() {

        // Check that Three.js loaded
        if (typeof THREE === "undefined") {
            document.body.innerHTML = `
                <div style="
                    color:white;
                    background:#050914;
                    height:100vh;
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
                        <p>Check your internet connection and refresh the page.</p>
                    </div>
                </div>
            `;
            return;
        }

        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87ceeb);

        // Camera
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        camera.position.set(0, 5, 10);

        // Renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: true
        });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        document.body.appendChild(renderer.domElement);

        // Light
        const light = new THREE.HemisphereLight(
            0xffffff,
            0x444444,
            2
        );

        scene.add(light);

        // Ground
        const groundGeometry = new THREE.PlaneGeometry(200, 200);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x287a35
        });

        const ground = new THREE.Mesh(
            groundGeometry,
            groundMaterial
        );

        ground.rotation.x = -Math.PI / 2;
        scene.add(ground);

        // Player
        const playerGeometry = new THREE.BoxGeometry(1, 2, 1);

        const playerMaterial = new THREE.MeshStandardMaterial({
            color: 0x0066ff
        });

        const player = new THREE.Mesh(
            playerGeometry,
            playerMaterial
        );

        player.position.y = 1;
        scene.add(player);

        // Bots
        for (let i = 0; i < 8; i++) {

            const botGeometry = new THREE.BoxGeometry(1, 2, 1);

            const botMaterial = new THREE.MeshStandardMaterial({
                color: 0xff2222
            });

            const bot = new THREE.Mesh(
                botGeometry,
                botMaterial
            );

            bot.position.set(
                Math.random() * 60 - 30,
                1,
                Math.random() * 60 - 30
            );

            scene.add(bot);
        }

        // Camera follows player
        camera.lookAt(player.position);

        // Simple movement
        const keys = {};

        document.addEventListener("keydown", (event) => {
            keys[event.key.toLowerCase()] = true;
        });

        document.addEventListener("keyup", (event) => {
            keys[event.key.toLowerCase()] = false;
        });

        function updatePlayer() {

            const speed = 0.15;

            if (keys["w"]) player.position.z -= speed;
            if (keys["s"]) player.position.z += speed;
            if (keys["a"]) player.position.x -= speed;
            if (keys["d"]) player.position.x += speed;

            camera.position.x = player.position.x;
            camera.position.z = player.position.z + 10;

            camera.lookAt(player.position);
        }

        // Game loop
        function animate() {

            requestAnimationFrame(animate);

            updatePlayer();

            renderer.render(scene, camera);
        }

        animate();

        // Resize
        window.addEventListener("resize", () => {

            camera.aspect =
                window.innerWidth / window.innerHeight;

            camera.updateProjectionMatrix();

            renderer.setSize(
                window.innerWidth,
                window.innerHeight
            );
        });
    }
});
