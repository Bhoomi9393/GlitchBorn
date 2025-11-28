
const buttons = document.querySelectorAll(".button button");

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    btn.classList.add("pulse");
    setTimeout(() => btn.classList.remove("pulse"), 500);
  });
});


tsParticles.load("particles-js", // Button click animation
const buttons = document.querySelectorAll(".button button");

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    btn.classList.add("pulse");
    setTimeout(() => btn.classList.remove("pulse"), 500);
  });
});

// Load star particles
tsParticles.load("particles-js", {
  background: { color: "transparent" },
  fpsLimit: 60,
  particles: {
    number: { value: 120, density: { enable: true, area: 900 } },
    color: { value: "#8466c8ff" },         // ⭐ BRIGHT visible stars
    shape: { type: "star" },
    opacity: { value: 1 },
    size: { value: 3.5, random: true },
    move: {
      enable: true,
      speed: 0.7,
      direction: "none",
      outModes: "out"
    }
  },
  detectRetina: true
});

// Login -> redirect to game
document.getElementById("start-b").addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();

  if (!username) {
    document.getElementById("msg").innerText = "Enter a username!";
    return;
  }

  const res = await fetch(`http://localhost:8080/game/join?playerId=${username}`, {
    method: "POST"
  });

  if (res.ok) {
    localStorage.setItem("playerId", username);
    window.location.href = "game.html";
  } else {
    document.getElementById("msg").innerText = "Error joining game!";
  }
});

  {
    background: 
    {
      color: {value: "transparent"}
    },
    fpsLimit: 60,
    particles: 
    {
      number: 
      {
        value: 77,
        density: 
        {
          enable: true,
          area: 800
        }
      },
      color: {value: "#7d7dfbff"},
      shape: {type: "star"},
      opacity: 
      {
        value: 0.8,
        random : true
      },
      size: 
      {
        value: 2,
        random: true
      },
      move: 
      {
        enable: true,
        speed: 0.6,
        direction: "none",
        outModes: "out"

      }
    },
    detectRetina: true
  }
)



