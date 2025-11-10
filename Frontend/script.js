
const buttons = document.querySelectorAll(".button button");

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    btn.classList.add("pulse");
    setTimeout(() => btn.classList.remove("pulse"), 500);
  });
});


tsParticles.load("particles-js", 
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



