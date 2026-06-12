# GlitchBorn 

A browser-based multiplayer game inspired by [agar.io](https://agar.io) — eat smaller cells to grow, avoid bigger ones to survive. Built with a vanilla HTML/CSS/JS frontend and a Java Spring Boot backend.

 Work in progress — core mechanics are implemented.

---

## Gameplay

- Move your cell around the map using your mouse
- **Eat** cells smaller than you to grow
- **Avoid** cells larger than you — they'll absorb you
- Last one standing (or biggest on the board) wins

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Java, Spring Boot |
| Communication | REST API |
| Rendering | HTML Canvas API |

---

## Getting Started

### Prerequisites
- Java 17+
- Maven

### Run the backend

```bash
cd backend
mvn spring-boot:run
```

### Run the frontend

Open `frontend/index.html` in your browser, or serve it with any static file server:

```bash
npx serve frontend
```

---

## Current Status

| Feature | Status |
|---|---|
| Player movement |  Done |
| Cell rendering on canvas |  Done |
| Eat/grow mechanic | 🔄 In progress |
| Collision detection | 🔄 In progress |
| Backend game state | 🔄 In progress |
| Multiplayer sync | ⏳ Planned |

---

## Roadmap

- [ ] Real-time multiplayer via WebSockets
- [ ] Leaderboard
- [ ] Player authentication
- [ ] Mobile support

---

## Author

**Bhoomika Chaudhary**
[LinkedIn](https://www.linkedin.com/in/bhoomika-chaudhary-04308934b) • [GitHub](https://github.com/Bhoomi9393) • [Mail](bhoomi.init@gmail.com)
