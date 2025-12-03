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
  localStorage.getItem("playerId") || "Player";const canvas = document.getElementById("gameCanvas");
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


let MAP_SIZE = 2800;
const FOOD_COUNT = 150;
const BOT_COUNT = 6;
const MAP_GROWTH_RATE = 0.01;
const BOT_GROWTH_FACTOR = 0.05;

let cameraZoom = 1;


let player = {
  x: MAP_SIZE / 2,
  y: MAP_SIZE / 2,
  size: 35,
  speed: 3,
  color: "#ff66ff",
  baseColor: "#ff66ff",
  shaking: false
};

let mouse = { x: 0, y: 0 };


let colorPulseTimer = 0; 
let slurpAnimations = []; 


function spawnFood() {
  return {
    x: Math.random() * MAP_SIZE,
    y: Math.random() * MAP_SIZE,
    size: 8,
    color: "#cc00ff"
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
    shaking: false
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
  if (e.x < r) e.x = r;
  if (e.y < r) e.y = r;
  if (e.x > MAP_SIZE - r) e.x = MAP_SIZE - r;
  if (e.y > MAP_SIZE - r) e.y = MAP_SIZE - r;
}


function moveTowardCursor(entity) {
  const worldMouseX = player.x + (mouse.x - canvas.width / 2) / cameraZoom;
  const worldMouseY = player.y + (mouse.y - canvas.height / 2) / cameraZoom;

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


function moveBot(bot) {
  if (gameOver) return;

  let target = null;
  let minDist = Infinity;

  const distToPlayer = Math.hypot(bot.x - player.x, bot.y - player.y);

  if (bot.size > player.size * 1.1) {
    target = player;
    minDist = distToPlayer;
  } else if (player.size > bot.size * 1.1 && distToPlayer < 300) {
    const angle = Math.atan2(bot.y - player.y, bot.x - player.x);
    bot.x += Math.cos(angle) * bot.speed;
    bot.y += Math.sin(angle) * bot.speed;
    return clampInsideWorld(bot);
  }

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


function checkEat(bigger, smaller) {
  const dx = bigger.x - smaller.x;
  const dy = bigger.y - smaller.y;
  const distance = Math.hypot(dx, dy);

  return distance < bigger.size - smaller.size / 2;
}


function vacuumPull(center, strength = 0.35, radius = 250) {
  // Pull food
  food.forEach(f => {
    const dx = center.x - f.x;
    const dy = center.y - f.y;
    const dist = Math.hypot(dx, dy);
    if (dist < radius && dist > 1) {
      
      const pull = strength * (1 - dist / radius);
      f.x += (dx / dist) * pull * 8;
      f.y += (dy / dist) * pull * 8;
    }
  });

  
  bots.forEach(b => {
    if (b === center) return;
    if (b.size >= (center.size || 1)) return; 
    const dx = center.x - b.x;
    const dy = center.y - b.y;
    const dist = Math.hypot(dx, dy);
    if (dist < radius && dist > 1) {
      const pull = strength * (1 - dist / radius);
      b.x += (dx / dist) * pull * 6;
      b.y += (dy / dist) * pull * 6;
    }
  });
}

function applyColorPulse() {
  if (colorPulseTimer > 0) {
  
    const t = colorPulseTimer / 
    
    const r = Math.round(255);
    const g = Math.round(102 + (200 - 102) * (1 - t));
    const b = Math.round(255);
    player.color = `rgb(${r},${g},${b})`;
    colorPulseTimer--;
    if (colorPulseTimer <= 0) player.color = player.baseColor;
  }
}

function addSlurpStretch(botClone) {
  
  slurpAnimations.push({
    x: botClone.x,
    y: botClone.y,
    size: botClone.size,
    color: botClone.color,
    startX: botClone.x,
    startY: botClone.y,
    progress: 0
  });
}

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

function renderSlurpAnimations() {
  
  for (let i = slurpAnimations.length - 1; i >= 0; i--) {
    const anim = slurpAnimations[i];
    anim.progress += 0.06; 
    
    const t = anim.progress;
    const ix = anim.startX + (player.x - anim.startX) * t;
    const iy = anim.startY + (player.y - anim.startY) * t;

    
    const angle = Math.atan2(player.y - iy, player.x - ix);

    ctx.save();
    ctx.translate(ix, iy);
    ctx.rotate(angle);

    
    const stretch = 1 + Math.min(1.8, t * 3); 
    const squash = 1 - Math.min(0.6, t * 0.9); 

    ctx.scale(stretch, squash);
    drawNonagon(0, 0, anim.size * (1 - t * 0.6), anim.color, false);
    ctx.restore();

  
    if (anim.progress >= 1) slurpAnimations.splice(i, 1);
  }
}


function gameLoop() {
  if (paused || gameOver) return requestAnimationFrame(gameLoop);

  handlePlayerMovement();

  MAP_SIZE += player.size * MAP_GROWTH_RATE;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  
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
    drawNonagon(f.x, f.y, f.size, f.color);

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

  
    if (!gameOver && b.size > player.size && checkEat(b, player)) {
      b.shaking = true;
      setTimeout(() => {
        localStorage.setItem("foodEaten", foodEaten);
        window.location.href = "gameover.html";
      }, 1200);

      gameOver = true;
      showNotif("You were eaten!");
    }

  
    if (player.size > b.size && checkEat(player, b)) {
    
      const botSnapshot = { x: b.x, y: b.y, size: b.size, color: b.color };

    
      colorPulseTimer = 15; 
      vacuumPull(player, 0.45, 260); 
      addSlurpStretch(botSnapshot); 

    
      player.size += b.size * 0.4;

      player.shaking = true;
      setTimeout(() => (player.shaking = false), 200);

      
      bots[i] = spawnBot();
    }

    drawNonagon(b.x, b.y, b.size, b.color, b.shaking);
  });


  drawNonagon(player.x, player.y, player.size, player.color, player.shaking);

  ctx.restore();

  
  if (colorPulseTimer > 0) {
    vacuumPull(player, 0.08, 160);
  }

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


let controlsReversed = false;
let cursorInverted = false;

let shakeMagnitude = 0;

const randomOf = arr => arr[Math.floor(Math.random() * arr.length)];

function effectTeleport() {
    const range = 400; // teleport radius
    let angle = Math.random() * Math.PI * 2;
    let dist = Math.random() * range;

    player.x += Math.cos(angle) * dist;
    player.y += Math.sin(angle) * dist;

  
    player.x = Math.max(0, Math.min(mapWidth, player.x));
    player.y = Math.max(0, Math.min(mapHeight, player.y));

    console.log("Effect: TELEPORT");
}

function effectReverseControls() {
    controlsReversed = true;

  
    setTimeout(() => controlsReversed = false, 10000);

    console.log("Effect: REVERSED CONTROLS");
}

function effectScreenShake() {
    shakeMagnitude = 25; 
    let fade = setInterval(() => {
        shakeMagnitude *= 0.9;
        if (shakeMagnitude < 0.5) {
            shakeMagnitude = 0;
            clearInterval(fade);
        }
    }, 50);

    console.log("Effect: SCREEN SHAKE");
}

function effectCursorInvert() {
    cursorInverted = true;

    
    setTimeout(() => cursorInverted = false, 7000);

    console.log("Effect: CURSOR INVERTED");
}


const effects = [
    effectTeleport,
    effectReverseControls,
    effectScreenShake,
    effectCursorInvert
];


setInterval(() => {
    let chosen = randomOf(effects);
    chosen();
}, 30000); 



let actualSpeedX = controlsReversed ? -speedX : speedX;
let actualSpeedY = controlsReversed ? -speedY : speedY;

player.x += actualSpeedX;
player.y += actualSpeedY;



let dx = mouseX - player.x;
let dy = mouseY - player.y;

if (cursorInverted) {
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

/
let MAP_SIZE = 2800;
const FOOD_COUNT = 150;
const BOT_COUNT = 6;

let cameraZoom = 1;


let player = {
  x: MAP_SIZE / 2,
  y: MAP_SIZE / 2,
  size: 35,
  speed: 3,
  color: "#ff66ff",
  baseColor: "#ff66ff",
  shaking: false
};

let mouse = { x: 0, y: 0 };


let colorPulseTimer = 0;
let slurpAnimations = [];

let controlsReversed = false;
let cursorInverted = false;
let shakeMagnitude = 0;

  
document.addEventListener("mousemove", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

let keys = {};
document.addEventListener("keydown", e => (keys[e.key.toLowerCase()] = true));
document.addEventListener("keyup", e => (keys[e.key.toLowerCase()] = false));


function clampInsideWorld(e) {
  const r = e.size;
  if (e.x < r) e.x = r;
  if (e.y < r) e.y = r;
  if (e.x > MAP_SIZE - r) e.x = MAP_SIZE - r;
  if (e.y > MAP_SIZE - r) e.y = MAP_SIZE - r;
}


function spawnFood() {
  return {
    x: Math.random() * MAP_SIZE,
    y: Math.random() * MAP_SIZE,
    size: 8,
    color: "#cc00ff"
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
    shaking: false
  };
}
let bots = Array.from({ length: BOT_COUNT }, spawnBot);


function moveTowardCursor(entity) {
  const worldMouseX = player.x + (mouse.x - canvas.width / 2) / cameraZoom;
  const worldMouseY = player.y + (mouse.y - canvas.height / 2) / cameraZoom;

  let dx = worldMouseX - entity.x;
  let dy = worldMouseY - entity.y;

  if (cursorInverted) {
    dx = -dx;
    dy = -dy;
  }

  const dist = Math.hypot(dx, dy);
  if (dist > 4) {
    entity.x += (dx / dist) * entity.speed;
    entity.y += (dy / dist) * entity.speed;
  }
}

function handlePlayerMovement() {
  let vx = 0, vy = 0;

  if (cursorMode) {
    moveTowardCursor(player);
  } else {
    if (keys["w"]) vy -= player.speed;
    if (keys["s"]) vy += player.speed;
    if (keys["a"]) vx -= player.speed;
    if (keys["d"]) vx += player.speed;

    if (controlsReversed) {
      vx = -vx;
      vy = -vy;
    }

    player.x += vx;
    player.y += vy;
  }

  clampInsideWorld(player);
}

function moveBot(bot) {
  if (gameOver) return;

  let target = null;
  let minDist = Infinity;

  const distToPlayer = Math.hypot(bot.x - player.x, bot.y - player.y);

  if (bot.size > player.size * 1.1) {
    target = player;
    minDist = distToPlayer;
  } 
  else if (player.size > bot.size * 1.1 && distToPlayer < 300) {
    const angle = Math.atan2(bot.y - player.y, bot.x - player.x);
    bot.x += Math.cos(angle) * bot.speed;
    bot.y += Math.sin(angle) * bot.speed;
    return clampInsideWorld(bot);
  }

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

function checkEat(bigger, smaller) {
  const dx = bigger.x - smaller.x;
  const dy = bigger.y - smaller.y;
  return Math.hypot(dx, dy) < bigger.size - smaller.size / 2;
}


function vacuumPull(center, strength = 0.35, radius = 250) {
  food.forEach(f => {
    const dx = center.x - f.x, dy = center.y - f.y;
    const dist = Math.hypot(dx, dy);
    if (dist < radius && dist > 1) {
      const pull = strength * (1 - dist / radius);
      f.x += (dx / dist) * pull * 8;
      f.y += (dy / dist) * pull * 8;
    }
  });

  bots.forEach(b => {
    if (b.size >= center.size) return;
    const dx = center.x - b.x, dy = center.y - b.y;
    const dist = Math.hypot(dx, dy);
    if (dist < radius && dist > 1) {
      const pull = strength * (1 - dist / radius);
      b.x += (dx / dist) * pull * 6;
      b.y += (dy / dist) * pull * 6;
    }
  });
}

function applyColorPulse() {
  if (colorPulseTimer > 0) {
    const t = colorPulseTimer / 15;
    const g = Math.round(102 + (200 - 102) * (1 - t));
    player.color = `rgb(255,${g},255)`;
    colorPulseTimer--;
    if (colorPulseTimer <= 0) player.color = player.baseColor;
  }
}

function addSlurpStretch(b) {
  slurpAnimations.push({
    x: b.x,
    y: b.y,
    size: b.size,
    color: b.color,
    startX: b.x,
    startY: b.y,
    progress: 0
  });
}

function drawNonagon(x, y, size, color, shaking=false) {
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

function renderSlurpAnimations() {
  for (let i = slurpAnimations.length - 1; i >= 0; i--) {
    const a = slurpAnimations[i];
    a.progress += 0.06;

    const t = a.progress;
    const ix = a.startX + (player.x - a.startX) * t;
    const iy = a.startY + (player.y - a.startY) * t;

    const angle = Math.atan2(player.y - iy, player.x - ix);

    ctx.save();
    ctx.translate(ix, iy);
    ctx.rotate(angle);

    const stretch = 1 + Math.min(1.8, t * 3);
    const squash = 1 - Math.min(0.6, t * 0.9);

    ctx.scale(stretch, squash);
    drawNonagon(0, 0, a.size * (1 - t * 0.6), a.color);
    ctx.restore();

    if (a.progress >= 1) slurpAnimations.splice(i, 1);
  }
}


function effectTeleport() {
  const range = 400;
  let a = Math.random() * Math.PI * 2;
  let d = Math.random() * range;

  player.x += Math.cos(a) * d;
  player.y += Math.sin(a) * d;

  clampInsideWorld(player);
}

function effectReverseControls() {
  controlsReversed = true;
  setTimeout(() => controlsReversed = false, 10000);
}

function effectScreenShake() {
  shakeMagnitude = 25;
  let fade = setInterval(() => {
    shakeMagnitude *= 0.9;
    if (shakeMagnitude < 0.5) {
      shakeMagnitude = 0;
      clearInterval(fade);
    }
  }, 50);
}

function effectCursorInvert() {
  cursorInverted = true;
  setTimeout(() => cursorInverted = false, 7000);
}

const effects = [
  effectTeleport,
  effectReverseControls,
  effectScreenShake,
  effectCursorInvert
];

setInterval(() => {
  randomOf(effects)();
}, 30000);

function randomOf(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function gameLoop() {
  if (paused || gameOver) return requestAnimationFrame(gameLoop);

  handlePlayerMovement();
  MAP_SIZE += player.size * 0.01;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  
  ctx.save();
  if (shakeMagnitude > 0) {
    ctx.translate(
      (Math.random() - 0.5) * shakeMagnitude,
      (Math.random() - 0.5) * shakeMagnitude
    );
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
    drawNonagon(f.x, f.y, f.size, f.color);

    if (checkEat(player, f)) {
      player.size += f.size * 0.3;
      food[i] = spawnFood();
      foodEaten++;
      document.getElementById("foodCount").innerText = foodEaten;
      colorPulseTimer = 6;
    }
  });

  
  bots.forEach((b, i) => {
    moveBot(b);

    
    food.forEach((f, j) => {
      if (checkEat(b, f)) {
        b.size += f.size * 1.5;
        food[j] = spawnFood();
      }
    });

    
    if (!gameOver && b.size > player.size && checkEat(b, player)) {
      gameOver = true;
      b.shaking = true;
      showNotif("You were eaten!");
      setTimeout(() => {
        localStorage.setItem("foodEaten", foodEaten);
        window.location.href = "gameover.html";
      }, 1200);
    }

    
    if (player.size > b.size && checkEat(player, b)) {
      colorPulseTimer = 15;
      vacuumPull(player, 0.45, 260);
      addSlurpStretch({ x: b.x, y: b.y, size: b.size, color: b.color });

      player.size += b.size * 0.4;

      player.shaking = true;
      setTimeout(() => player.shaking = false, 200);

      bots[i] = spawnBot();
    }

    drawNonagon(b.x, b.y, b.size, b.color, b.shaking);
  });

  drawNonagon(player.x, player.y, player.size, player.color, player.shaking);

  ctx.restore();

  if (colorPulseTimer > 0) {
    vacuumPull(player, 0.08, 160);
  }

  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
  
cursorModeToggle.addEventListener("change", e => cursorMode = e.target.checked);
pauseToggle.addEventListener("change", e => paused = e.target.checked);
resetBtn.addEventListener("click", () => window.location.reload());

function showNotif(msg) {
  const n = document.getElementById("notif");
  n.innerText = msg;
  n.classList.remove("hidden");
  setTimeout(() => n.classList.add("hidden"), 1200);
}

    dx = -dx;
    dy = -dy;
}



if (shakeMagnitude > 0) {
    let sx = (Math.random() - 0.5) * shakeMagnitude;
    let sy = (Math.random() - 0.5) * shakeMagnitude;
    ctx.translate(sx, sy);
}



let MAP_SIZE = 2800;
const FOOD_COUNT = 150;
const BOT_COUNT = 6;
const MAP_GROWTH_RATE = 0.01;
const BOT_GROWTH_FACTOR = 0.05;

let player = {
  x: MAP_SIZE / 2,
  y: MAP_SIZE / 2,
  size: 35,
  speed: 3,
  color: "#ff66ff",
  shaking: false
};

let mouse = { x: 0, y: 0 };


function spawnFood() {
  return {
    x: Math.random() * MAP_SIZE,
    y: Math.random() * MAP_SIZE,
    size: 8,
    color: "#cc00ff"
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
    shaking: false
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
  if (e.x < r) e.x = r;
  if (e.y < r) e.y = r;
  if (e.x > MAP_SIZE - r) e.x = MAP_SIZE - r;
  if (e.y > MAP_SIZE - r) e.y = MAP_SIZE - r;
}


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


function moveBot(bot) {
  if (gameOver) return;

  let target = null;
  let minDist = Infinity;

  const distToPlayer = Math.hypot(bot.x - player.x, bot.y - player.y);


  if (bot.size > player.size * 1.1) {
    target = player;
    minDist = distToPlayer;
  }

  else if (player.size > bot.size * 1.1 && distToPlayer < 300) {
    const angle = Math.atan2(bot.y - player.y, bot.x - player.x);
    bot.x += Math.cos(angle) * bot.speed;
    bot.y += Math.sin(angle) * bot.speed;
    return clampInsideWorld(bot);
  }

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


function checkEat(bigger, smaller) {
  const dx = bigger.x - smaller.x;
  const dy = bigger.y - smaller.y;
  const distance = Math.hypot(dx, dy);

  return distance < bigger.size - smaller.size / 2;
}


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


function gameLoop() {
  if (paused || gameOver) return requestAnimationFrame(gameLoop);

  handlePlayerMovement();

  
  MAP_SIZE += player.size * MAP_GROWTH_RATE;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  
  ctx.translate(canvas.width / 2 - player.x, canvas.height / 2 - player.y);

  
  ctx.strokeStyle = "#b300ff";
  ctx.lineWidth = 10;
  ctx.strokeRect(0, 0, MAP_SIZE, MAP_SIZE);


  food.forEach((f, i) => {
    drawNonagon(f.x, f.y, f.size, f.color);

    if (checkEat(player, f)) {
      player.size += f.size * 0.3;
      foodEaten++;
      document.getElementById("foodCount").innerText = foodEaten;
      food[i] = spawnFood();
    }
  });


  bots.forEach((b, i) => {
    moveBot(b);

  
    food.forEach((f, j) => {
      if (checkEat(b, f)) {
        b.size += f.size * BOT_GROWTH_FACTOR * 0.5;
        food[j] = spawnFood();
      }
    });

    
    if (!gameOver && b.size > player.size && checkEat(b, player)) {
      b.shaking = true;
      setTimeout(() => (b.shaking = false), 250);

      gameOver = true;
      showNotif("You were eaten!");
      setTimeout(() => (window.location.href = "gameover.html"), 1200);
    }

  
    if (player.size > b.size && checkEat(player, b)) {
      player.size += b.size * 0.4;

      player.shaking = true;
      setTimeout(() => (player.shaking = false), 200);

      bots[i] = spawnBot();
    }

    drawNonagon(b.x, b.y, b.size, b.color, b.shaking);
  });


  drawNonagon(player.x, player.y, player.size, player.color, player.shaking);

  ctx.restore();

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
