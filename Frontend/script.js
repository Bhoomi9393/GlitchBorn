
const buttons = document.querySelectorAll(".button button");

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    btn.classList.add("pulse");
    setTimeout(() => btn.classList.remove("pulse"), 500);
  });
});


