![Game Preview](public/pictures/designer.png)

A **Space Invaders**-style game developed with HTML5/JavaScript and Node.js/Express.  
Face waves of enemies, unlock cosmetic ships, and beat your own high scores!

---

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#steps)
- [License](#license)

---

## Overview
This project is a **modern Space Invaders**, playable directly in the browser.  
It uses:
- **Node.js + Express** to serve static files.
- **HTML5 Canvas** for graphics rendering.
- **AudioContext** for sound effects and dynamic music.
- **LocalStorage** to save high scores and unlocked cosmetics.

The game features multiple difficulty levels and a boss system.

---

## Features

- 🎮 Full Gameplay:
  - Move left/right (and up/down on some difficulties)
  - Automatic or manual shooting
  - Life and collision management
- 🛸 Cosmetics:
  - Alternate ships unlocked based on score
  - Ship selection interface
- 🔊 Sound & Music:
  - Shooting, explosion, and damage sounds
  - Multi-track music playlist
- 🏆 Highscores:
  - Save the top 3 scores per player
  - View scores in the interface
- 🖥️ Options:
  - Pause with Escape
  - Fullscreen (F11 or button)
  - Change difficulty before starting
- 🎯 Bosses & Items:
  - Boss every 5 levels
  - Extra life every 11 levels

---

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- NPM or Yarn

### Steps
1. Clone the repository:
```bash
git clone https://github.com/y0uls/space-warfare.git
cd space-warfare

```

2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
node server.js
```

4. Open the game in your browser:

```bash
http://localhost:80
```

## License

This project is licensed under the **MIT License**.  

You are free to:

- Use the project for personal.
- Modify the source code to suit your needs.
- Distribute the project or your modified versions.

**Conditions** :

- You must include the copyright notice and license in all copies or substantial portions of the project.
- The project is provided "as is", without any warranty, express or implied.

For more details, see the [LICENSE](LICENSE) file.
