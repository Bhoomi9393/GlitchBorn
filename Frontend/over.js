document.addEventListener("DOMContentLoaded", () => {
    // Get food eaten from localStorage
    const foodEaten = localStorage.getItem('foodEaten') || 0;
    const display = document.getElementById('foodCountDisplay');
    if(display) display.innerText = foodEaten;

    // Play Again button reloads the game
    const playBtn = document.getElementById('plyAgain');
    if(playBtn) {
        playBtn.addEventListener('click', () => {
            localStorage.removeItem('foodEaten'); // reset counter
            window.location.href = "index.html";
        });
    }
});
tsParticles.load("particles-js", {
  background: { color: "transparent" },
  fpsLimit: 60,
  particles: {
    number: { value: 120, density: { enable: true, area: 900 } },
    color: { value: "#8466c8ff" },         // ⭐ BRIGHT visible stars
    shape: { type: "polygon" },
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
