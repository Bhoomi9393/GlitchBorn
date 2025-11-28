const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// UI elements
const cursorModeToggle = document.getElementById("cursorModeToggle");
const pauseToggle = document.getElementById("pauseToggle");
const resetBtn = document.getElementById("btnReset");

let paused = false;
let cursorMode = false;
let gameOver = false;
let foodEaten = 0;

document.getElementById("playerName").innerText =
  localStorage.getItem("playerId") || "Player";

/* -----------------------------------
   WORLD SETTINGS
--------------------------------------*/
let MAP_SIZE = 2800;
const FOOD_COUNT = 150;
const BOT_COUNT = 6;
const MAP_GROWTH_RATE = 0.01;
const BOT_GROWTH_FACTOR = 0.05;

/* -----------------------------------
   PLAYER
--------------------------------------*/
let player = {
  x: MAP_SIZE / 2,
  y: MAP_SIZE / 2,
  size: 35,
  speed: 3,
  color: "#ff66ff",
  shaking: false
};

let mouse = { x: 0, y: 0 };

/* -----------------------------------
   FOOD
--------------------------------------*/
function spawnFood() {
  return {
    x: Math.random() * MAP_SIZE,
    y: Math.random() * MAP_SIZE,
    size: 8,
    color: "#cc00ff"
  };
}

let food = Array.from({ length: FOOD_COUNT }, spawnFood);

/* -----------------------------------
   BOTS
--------------------------------------*/
function spawnBot() {
  return {
    x: Math.random() * MAP_SIZE,
    y: Math.random() * MAP_SIZE,
    size: 20 + Math.random() * 25,
    speed: 2 + Math.random(),
    color: "#00ffaa",
    shaking: false
  };
}

let bots = Array.from({ length: BOT_COUNT }, spawnBot);

/* -----------------------------------
   INPUT
--------------------------------------*/
document.addEventListener("mousemove", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

let keys = {};
document.addEventListener("keydown", e => (keys[e.key.toLowerCase()] = true));
document.addEventListener("keyup", e => (keys[e.key.toLowerCase()] = false));

/* -----------------------------------
   HARD MAP CLAMP
--------------------------------------*/
function clampInsideWorld(e) {
  const r = e.size;
  if (e.x < r) e.x = r;
  if (e.y < r) e.y = r;
  if (e.x > MAP_SIZE - r) e.x = MAP_SIZE - r;
  if (e.y > MAP_SIZE - r) e.y = MAP_SIZE - r;
}

/* -----------------------------------
   MOVEMENT
--------------------------------------*/
function moveTowardCursor(entity) {
  const worldMouseX = player.x + (mouse.x - canvas.width / 2);
  const worldMouseY = player.y + (mouse.y - canvas.height / 2);

  const dx = worldMouseX - entity.x;
  const dy = worldMouseY - entity.y;
  const dist = Math.hypot(dx, dy);

  if (dist > 4) {
    entity.x += (dx / dist) * entity.speed;
    entity.y += (dy / dist) * entity.speed;
  }
}

function handlePlayerMovement() {
  if (cursorMode) {
    moveTowardCursor(player);
  } else {
    if (keys["w"]) player.y -= player.speed;
    if (keys["s"]) player.y += player.speed;
    if (keys["a"]) player.x -= player.speed;
    if (keys["d"]) player.x += player.speed;
  }

  clampInsideWorld(player);
}

/* -----------------------------------
   BOT AI
--------------------------------------*/
function moveBot(bot) {
  if (gameOver) return;

  let target = null;
  let minDist = Infinity;

  const distToPlayer = Math.hypot(bot.x - player.x, bot.y - player.y);

  // Bot chases player if player smaller
  if (bot.size > player.size * 1.1) {
    target = player;
    minDist = distToPlayer;
  }
  // Bot flees if player is bigger
  else if (player.size > bot.size * 1.1 && distToPlayer < 300) {
    const angle = Math.atan2(bot.y - player.y, bot.x - player.x);
    bot.x += Math.cos(angle) * bot.speed;
    bot.y += Math.sin(angle) * bot.speed;
    return clampInsideWorld(bot);
  }

  // Food scanning
  food.forEach(f => {
    const d = Math.hypot(bot.x - f.x, bot.y - f.y);
    if (d < minDist) {
      target = f;
      minDist = d;
    }
  });

  if (target) {
    const angle = Math.atan2(target.y - bot.y, target.x - bot.x);
    bot.x += Math.cos(angle) * bot.speed;
    bot.y += Math.sin(angle) * bot.speed;
  }

  clampInsideWorld(bot);
}

/* -----------------------------------
   COLLISION
--------------------------------------*/
function checkEat(bigger, smaller) {
  const dx = bigger.x - smaller.x;
  const dy = bigger.y - smaller.y;
  const distance = Math.hypot(dx, dy);

  return distance < bigger.size - smaller.size / 2;
}

/* -----------------------------------
   NONAGON DRAW
--------------------------------------*/
function drawNonagon(x, y, size, color, shaking = false) {
  ctx.save();

  if (shaking) {
    ctx.translate(x, y);
    ctx.rotate((Math.random() - 0.5) * 0.12);
    x = 0;
    y = 0;
  }

  ctx.fillStyle = color;
  ctx.beginPath();

  const sides = 9;
  const step = (Math.PI * 2) / sides;

  for (let i = 0; i < sides; i++) {
    const px = x + Math.cos(i * step) * size;
    const py = y + Math.sin(i * step) * size;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }

  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/* -----------------------------------
   GAME LOOP
--------------------------------------*/
function gameLoop() {
  if (paused || gameOver) return requestAnimationFrame(gameLoop);

  handlePlayerMovement();

  // World expands
  MAP_SIZE += player.size * MAP_GROWTH_RATE;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  // Camera centered on player
  ctx.translate(canvas.width / 2 - player.x, canvas.height / 2 - player.y);

  // Draw map border
  ctx.strokeStyle = "#b300ff";
  ctx.lineWidth = 10;
  ctx.strokeRect(0, 0, MAP_SIZE, MAP_SIZE);

  /* FOOD */
  food.forEach((f, i) => {
    drawNonagon(f.x, f.y, f.size, f.color);

    if (checkEat(player, f)) {
      player.size += f.size * 0.3;
      foodEaten++;
      document.getElementById("foodCount").innerText = foodEaten;
      food[i] = spawnFood();
    }
  });

  /* BOTS */
  bots.forEach((b, i) => {
    moveBot(b);

    // Bot eats food
    food.forEach((f, j) => {
      if (checkEat(b, f)) {
        b.size += f.size * BOT_GROWTH_FACTOR * 0.5;
        food[j] = spawnFood();
      }
    });

    // Bot eats player
    if (!gameOver && b.size > player.size && checkEat(b, player)) {
      b.shaking = true;
      setTimeout(() => (b.shaking = false), 250);

      gameOver = true;
      showNotif("You were eaten!");
      setTimeout(() => (window.location.href = "gameover.html"), 1200);
    }

    // Player eats bot
    if (player.size > b.size && checkEat(player, b)) {
      player.size += b.size * 0.4;

      player.shaking = true;
      setTimeout(() => (player.shaking = false), 200);

      bots[i] = spawnBot();
    }

    drawNonagon(b.x, b.y, b.size, b.color, b.shaking);
  });

  /* PLAYER */
  drawNonagon(player.x, player.y, player.size, player.color, player.shaking);

  ctx.restore();

  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

/* -----------------------------------
   UI
--------------------------------------*/
cursorModeToggle.addEventListener("change", e => {
  cursorMode = e.target.checked;
});

pauseToggle.addEventListener("change", e => {
  paused = e.target.checked;
});

resetBtn.addEventListener("click", () => window.location.reload());

/* -----------------------------------
   NOTIFICATION
--------------------------------------*/
function showNotif(msg) {
  const n = document.getElementById("notif");
  n.innerText = msg;
  n.classList.remove("hidden");
  setTimeout(() => n.classList.add("hidden"), 1200);
}
