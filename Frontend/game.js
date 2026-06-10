
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const cursorModeToggle = document.getElementById("cursorModeToggle");
const pauseToggle = document.getElementById("pauseToggle");
const resetBtn = document.getElementById("btnReset");

let paused = false;
let cursorMode = false;
let gameOver = false;
let foodEaten = 0;

document.getElementById("playerName").innerText =
  localStorage.getItem("playerId") || "Player";


let MAP_SIZE = 2800;
const FOOD_COUNT = 150;
const BOT_COUNT = 6;

const MAP_GROWTH_RATE = 0.01;
let cameraZoom = 1;


let player = {
  x: MAP_SIZE / 2,
  y: MAP_SIZE / 2,
  size: 35,
  speed: 3,
  color: "#ff66ff",
  baseColor: "#ff66ff",
  shaking: false,
  rotation: 0
};

let mouse = { x: 0, y: 0 };


let colorPulseTimer = 0;
let slurpAnimations = [];


function spawnFood() {
  return {
    x: Math.random() * MAP_SIZE,
    y: Math.random() * MAP_SIZE,
    size: 8,
    color: "#cc00ff",
    rotation: Math.random() * Math.PI * 2
  };
}

let food = Array.from({ length: FOOD_COUNT }, spawnFood);


function spawnBot() {
  return {
    x: Math.random() * MAP_SIZE,
    y: Math.random() * MAP_SIZE,
    size: 20 + Math.random() * 25,
    speed: 2 + Math.random(),
    color: "#00ffaa",
    shaking: false,
    rotation: 0
  };
}

let bots = Array.from({ length: BOT_COUNT }, spawnBot);


document.addEventListener("mousemove", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

let keys = {};
document.addEventListener("keydown", e => (keys[e.key.toLowerCase()] = true));
document.addEventListener("keyup", e => (keys[e.key.toLowerCase()] = false));


function clampInsideWorld(e) {
  const r = e.size;
  e.x = Math.max(r, Math.min(MAP_SIZE - r, e.x));
  e.y = Math.max(r, Math.min(MAP_SIZE - r, e.y));
}


function getCursorWorldPos() {
  return {
    x: player.x + (mouse.x - canvas.width / 2) / cameraZoom,
    y: player.y + (mouse.y - canvas.height / 2) / cameraZoom
  };
}

function moveTowardCursor(entity) {
  let pos = getCursorWorldPos();
  let dx = pos.x - entity.x;
  let dy = pos.y - entity.y;
  let dist = Math.hypot(dx, dy);

  if (dist > 4) {
    entity.x += (dx / dist) * entity.speed;
    entity.y += (dy / dist) * entity.speed;
  }
}

function handlePlayerMovement() {
  if (cursorMode) {
    moveTowardCursor(player);
  } else {
    let sx = 0, sy = 0;

    if (keys["w"]) sy -= player.speed;
    if (keys["s"]) sy += player.speed;
    if (keys["a"]) sx -= player.speed;
    if (keys["d"]) sx += player.speed;

    // Reverse controls effect
    if (controlsReversed) {
      sx = -sx;
      sy = -sy;
    }

    player.x += sx;
    player.y += sy;
  }

  clampInsideWorld(player);
}
function moveBot(bot) {
  if (gameOver) return;

  let target = null;
  let minDist = Infinity;

  let dPlayer = Math.hypot(bot.x - player.x, bot.y - player.y);


  if (bot.size > player.size * 1.1) {
    target = player;
    minDist = dPlayer;
  }

  
  if (player.size > bot.size * 1.1 && dPlayer < 300) {
    let ang = Math.atan2(bot.y - player.y, bot.x - player.x);
    bot.x += Math.cos(ang) * bot.speed;
    bot.y += Math.sin(ang) * bot.speed;
    return clampInsideWorld(bot);
  }

  
  food.forEach(f => {
    let d = Math.hypot(bot.x - f.x, bot.y - f.y);
    if (d < minDist) {
      target = f;
      minDist = d;
    }
  });

  if (target) {
    let ang = Math.atan2(target.y - bot.y, target.x - bot.x);
    bot.x += Math.cos(ang) * bot.speed;
    bot.y += Math.sin(ang) * bot.speed;
  }

  clampInsideWorld(bot);
}


function checkEat(big, small) {
  return Math.hypot(big.x - small.x, big.y - small.y) <
         big.size - small.size / 2;
}

function vacuumPull(center, strength = 0.35, radius = 250) {
  food.forEach(f => {
    let dx = center.x - f.x;
    let dy = center.y - f.y;
    let d = Math.hypot(dx, dy);
    if (d < radius && d > 1) {
      f.x += (dx / d) * strength * 8 * (1 - d / radius);
      f.y += (dy / d) * strength * 8 * (1 - d / radius);
    }
  });
}

function applyColorPulse() {
  if (colorPulseTimer > 0) {
    let t = colorPulseTimer / 15;
    player.color = `rgb(255,${102 + (200 - 102) * (1 - t)},255)`;
    colorPulseTimer--;
    if (colorPulseTimer <= 0) player.color = player.baseColor;
  }
}

function addSlurpStretch(bot) {
  slurpAnimations.push({
    x: bot.x,
    y: bot.y,
    size: bot.size,
    color: bot.color,
    startX: bot.x,
    startY: bot.y,
    progress: 0
  });
}


function drawNonagon(x, y, size, color, shaking = false, rotation = 0) {
  ctx.save();
  ctx.translate(x, y);

  if (shaking) {
    ctx.rotate((Math.random() - 0.5) * 0.12);
  }

  ctx.rotate(rotation);

  ctx.beginPath();
  let step = (Math.PI * 2) / 9;

  for (let i = 0; i < 9; i++) {
    let px = Math.cos(i * step) * size;
    let py = Math.sin(i * step) * size;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  ctx.restore();
}


function renderSlurpAnimations() {
  for (let i = slurpAnimations.length - 1; i >= 0; i--) {
    let a = slurpAnimations[i];
    a.progress += 0.06;
    let t = a.progress;

    let ix = a.startX + (player.x - a.startX) * t;
    let iy = a.startY + (player.y - a.startY) * t;

    let angle = Math.atan2(player.y - iy, player.x - ix);

    ctx.save();
    ctx.translate(ix, iy);
    ctx.rotate(angle);

    ctx.scale(1 + t * 2, 1 - t * 0.7);

    drawNonagon(0, 0, a.size * (1 - t), a.color);
    ctx.restore();

    if (a.progress >= 1) slurpAnimations.splice(i, 1);
  }
}

let controlsReversed = false;
let cursorInverted = false;
let screenShake = 0;

const randomOf = arr => arr[Math.floor(Math.random() * arr.length)];

function effectTeleport() {
  let ang = Math.random() * Math.PI * 2;
  let dist = Math.random() * 400;
  player.x += Math.cos(ang) * dist;
  player.y += Math.sin(ang) * dist;
  clampInsideWorld(player);
}

function effectReverseControls() {
  controlsReversed = true;
  setTimeout(() => (controlsReversed = false), 10000);
}

function effectShake() {
  screenShake = 25;
}

function effectInvertCursor() {
  cursorInverted = true;
  setTimeout(() => (cursorInverted = false), 7000);
}

const effects = [
  effectTeleport,
  effectReverseControls,
  effectShake,
  effectInvertCursor
];

setInterval(() => {
  randomOf(effects)();
}, 30000);

function gameLoop() {
  if (paused || gameOver) return requestAnimationFrame(gameLoop);

  handlePlayerMovement();
  MAP_SIZE += player.size * MAP_GROWTH_RATE;

  
  player.rotation += 0.04; 
  bots.forEach(bot => bot.rotation += 0.03); 
  food.forEach(f => f.rotation += 0.01); 

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();

  
  if (screenShake > 0) {
    ctx.translate(
      (Math.random() - 0.5) * screenShake,
      (Math.random() - 0.5) * screenShake
    );
    screenShake *= 0.92;
  }

  
  let targetZoom = 1 / (1 + player.size / 250);
  targetZoom = Math.max(targetZoom, 0.22);
  cameraZoom += (targetZoom - cameraZoom) * 0.05;

  ctx.scale(cameraZoom, cameraZoom);

  ctx.translate(
    canvas.width / 2 / cameraZoom - player.x,
    canvas.height / 2 / cameraZoom - player.y
  );

  ctx.strokeStyle = "#b300ff";
  ctx.lineWidth = 10 / cameraZoom;
  ctx.strokeRect(0, 0, MAP_SIZE, MAP_SIZE);

  applyColorPulse();
  renderSlurpAnimations();


  food.forEach((f, i) => {
    drawNonagon(f.x, f.y, f.size, f.color, false, f.rotation);

    if (checkEat(player, f)) {
      player.size += f.size * 0.3;
      foodEaten++;
      document.getElementById("foodCount").innerText = foodEaten;
      food[i] = spawnFood();
      colorPulseTimer = Math.max(colorPulseTimer, 6);
    }
  });


  bots.forEach((b, i) => {
    moveBot(b);

    food.forEach((f, j) => {
      if (checkEat(b, f)) {
        b.size += f.size * 0.3;
        food[j] = spawnFood();
      }
    });

    if (b.size > player.size && checkEat(b, player)) {
      b.shaking = true;
      gameOver = true;

      setTimeout(() => {
        localStorage.setItem("foodEaten", foodEaten);
        window.location.href = "gameover.html";
      }, 1200);
    }

    if (player.size > b.size && checkEat(player, b)) {
      let snapshot = { x: b.x, y: b.y, size: b.size, color: b.color };

      colorPulseTimer = 15;
      vacuumPull(player, 0.45, 260);
      addSlurpStretch(snapshot);
      player.size += b.size * 0.4;

      player.shaking = true;
      setTimeout(() => (player.shaking = false), 200);

      bots[i] = spawnBot();
    }

    drawNonagon(b.x, b.y, b.size, b.color, b.shaking, b.rotation);
  });

  drawNonagon(player.x, player.y, player.size, player.color, player.shaking, player.rotation);

  ctx.restore();

  if (colorPulseTimer > 0) vacuumPull(player, 0.08, 160);

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);


cursorModeToggle.addEventListener("change", e => {
  cursorMode = e.target.checked;
});
pauseToggle.addEventListener("change", e => {
  paused = e.target.checked;
});
resetBtn.addEventListener("click", () => window.location.reload());


function showNotif(msg) {
  const n = document.getElementById("notif");
  n.innerText = msg;
  n.classList.remove("hidden");
  setTimeout(() => n.classList.add("hidden"), 1200);
}
