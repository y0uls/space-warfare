(() => {
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W=canvas.width,H=canvas.height;

const EXPLOSION_FRAME_DELAY = 4; // nombre de frames avant de passer à la suivante

const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const levelEl = document.getElementById('level');
const hsList = document.getElementById('highscores');

//options
const specialBonusLife = 11;
let MoveUpDown = false;
let difficulty = 'Normal';
const difficulties = ['Normal', 'Easy', 'Medium', 'Hard'];
const fireRates = { 'Normal': Infinity, 'Easy': 5, 'Medium': 3, 'Hard': 1,  };
let shotInterval = 1000 / fireRates[difficulty];

// Bouton difficulté (HTML)
const diffBtn = document.getElementById('difficulty-btn');
diffBtn.addEventListener('click', () => {
  if(showStartButton){ // seulement avant le démarrage
    const idx = difficulties.indexOf(difficulty);
    difficulty = difficulties[(idx + 1) % difficulties.length];
    shotInterval = 1000 / fireRates[difficulty];
    diffBtn.textContent = 'Difficulty: ' + difficulty;
  }
});

const scoreboardBtn = document.getElementById('scoreboard-btn');
const scoreboard = document.getElementById('highscores');

scoreboardBtn.addEventListener('click', () => {
  const isVisible = getComputedStyle(scoreboard).display !== 'none';
  scoreboard.style.display = isVisible ? 'none' : 'block';
});

// Dans le code qui démarre le jeu (click sur JOUER)
canvas.addEventListener('click', e => {
  if(showStartButton){
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const btnWidth = 140, btnHeight = 50;
    const btnX = W/2 - btnWidth/2, btnY = H/2 - btnHeight/2;
    if(x > btnX && x < btnX + btnWidth && y > btnY && y < btnY + btnHeight){
      paused = false;
      showStartButton = false;
      if(musicOn) playNextTrack();

      // **Griser le bouton difficulté**
      diffBtn.disabled = true;
      diffBtn.style.opacity = 0.5;
      diffBtn.style.cursor = 'not-allowed';
    }
  }
});


const input = { left: false, right: false, fire: false, up: false, down: false };
const keys={};
document.addEventListener('keydown', e => { 
  keys[e.code] = true; 
  if(e.code === 'Space'){ input.fire = true; e.preventDefault(); }
  if(MoveUpDown){
    if(e.code === 'ArrowUp' || e.code === 'KeyW') input.up = true;
    if(e.code === 'ArrowDown' || e.code === 'KeyS') input.down = true;
  }
    if(e.code === 'ArrowLeft' || e.code === 'KeyA') input.left = true;
  if(e.code === 'ArrowRight' || e.code === 'KeyD') input.right = true;
});

document.addEventListener('keyup', e => { 
  keys[e.code] = false; 
  if(e.code === 'Space') input.fire = false;
  if(MoveUpDown){
    if(e.code === 'ArrowUp' || e.code === 'KeyW') input.up = false;
    if(e.code === 'ArrowDown' || e.code === 'KeyS') input.down = false;
  }
  if(e.code === 'ArrowLeft' || e.code === 'KeyA') input.left = false;
  if(e.code === 'ArrowRight' || e.code === 'KeyD') input.right = false;
});

document.getElementById('restart').addEventListener('click',()=>resetSolo());
document.getElementById('toggle-sound').addEventListener('click',()=>{
  soundOn=!soundOn;
  document.getElementById('toggle-sound').textContent = soundOn?'Sound: ON':'Sound: OFF';
});

// --- Playlist musique multi-MP3 ---
let soundOn = true;
let musicOn = true;
let paused = true; // <-- jeu en pause au lancement
let showStartButton = true; // pour afficher le bouton JOUER
let startHover = false; // survol du bouton

const gameMusicFiles = [
  'sound/game1.mp3',
  'sound/game2.mp3',
  'sound/game3.mp3'
];
let currentTrack = 0;
const gameMusic = new Audio();
gameMusic.volume = 0.2;

function playNextTrack(){
  if(paused || !musicOn) return;
  gameMusic.src = gameMusicFiles[currentTrack];
  gameMusic.play().catch(()=>{});
  currentTrack++;
  if(currentTrack >= gameMusicFiles.length) currentTrack = 0; // boucle
}
gameMusic.addEventListener('ended', playNextTrack);

function tryStartMusic() {
  if(musicOn && !paused) playNextTrack();
  window.removeEventListener('click', tryStartMusic);
  window.removeEventListener('keydown', tryStartMusic);
}
window.addEventListener('click', tryStartMusic);
window.addEventListener('keydown', tryStartMusic);

document.getElementById('toggle-music').addEventListener('click',()=>{
  musicOn = !musicOn;
  if(musicOn && !paused) playNextTrack();
  else gameMusic.pause();
  document.getElementById('toggle-music').textContent = musicOn?'Music: ON':'Music: OFF';
});

// --- Pause globale avec Échap ---
document.addEventListener('keydown', e=>{
  if(e.code==='Escape' && !showStartButton){
    paused = !paused;
    if(paused) gameMusic.pause();
    else if(musicOn) gameMusic.play().catch(()=>{});
  }
});

document.addEventListener('keydown', e => {
  const key = e.key.toLowerCase();

  if(key === 'enter' && showStartButton){
    paused = false;
    showStartButton = false;
    if(musicOn) playNextTrack();

    // Griser le bouton difficulté
    diffBtn.disabled = true;
    diffBtn.style.opacity = 0.5;
    diffBtn.style.cursor = 'not-allowed';
  }

  // --- Cosmetics ---
  if(key === 'c'){
    if(cosmeticsModal.style.display === 'flex'){
      cosmeticsModal.style.display = 'none'; // fermer si déjà ouvert
    } else {
      cosmeticsModal.style.display = 'flex'; // ouvrir sinon
      loadCosmetics(); // charge la liste à jour
    }
  }

  // --- Changer la difficulté (seulement si pas en jeu ou en pause) ---
  if(key === 'd' && (showStartButton || paused)){
    const idx = difficulties.indexOf(difficulty);
    difficulty = difficulties[(idx + 1) % difficulties.length];
    shotInterval = 1000 / fireRates[difficulty];
    diffBtn.textContent = 'Difficulty: ' + difficulty;
    if (difficulty == 'Easy'){
      MoveUpDown = true;
    }
  }

  // --- Fullscreen ---
  if(key === 'f'){
    e.preventDefault(); // empêche le navigateur de bloquer le F11
    toggleFullscreen();
  }

  // --- Musique ---
  if(key === 'm'){
    musicOn = !musicOn;
    if(musicOn && !paused) playNextTrack();
    else gameMusic.pause();
    document.getElementById('toggle-music').textContent = musicOn ? 'Music: ON' : 'Music: OFF';
  }

  // --- Son ---
  if(key === 's'){
    soundOn = !soundOn;
    document.getElementById('toggle-sound').textContent = soundOn ? 'Sound: ON' : 'Sound: OFF';
  }
});


document.addEventListener('keydown', e => {
  if(e.code === 'KeyR' && !solo.running) {
    resetSolo();
  }
});

// --- Plein écran avec le bouton ou F11 ---
function toggleFullscreen() {
  const canvas = document.getElementById('game');

  if (!document.fullscreenElement) {
    if (canvas.requestFullscreen) canvas.requestFullscreen();
    else if (canvas.webkitRequestFullscreen) canvas.webkitRequestFullscreen();
    else if (canvas.msRequestFullscreen) canvas.msRequestFullscreen();
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
  }
}

document.addEventListener('keydown', (e) => {
  if (e.code === 'F11') {
    e.preventDefault();
    toggleFullscreen();
  }
});


// Active bouton "Fullscreen"
document.getElementById('fullscreen').addEventListener('click', toggleFullscreen);

document.getElementById('clear-scores').addEventListener('click',()=>{
  localStorage.removeItem('si_highscores'); renderHighscores();
});

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// --- sons ---
function playLaser(isEnemy=false){
  if(!soundOn) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type='square';
  osc.frequency.setValueAtTime(isEnemy?300:900, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(isEnemy?100:300, audioCtx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
  osc.connect(gain); gain.connect(audioCtx.destination);
  osc.start(); osc.stop(audioCtx.currentTime + 0.1);
}

function playExplosion() {
  if(!soundOn) return;
  const now = audioCtx.currentTime;

  // Oscillateur principal "piou"
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(250, now);
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);
  gain.gain.setValueAtTime(0.15, now); // volume réduit
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

  const delay = audioCtx.createDelay(0.2);
  delay.delayTime.setValueAtTime(0.05, now);
  const feedback = audioCtx.createGain();
  feedback.gain.setValueAtTime(0.2, now);
  delay.connect(feedback);
  feedback.connect(delay);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  gain.connect(delay);
  delay.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + 0.15);

  // Bruit "pouf"
  const bufferSize = audioCtx.sampleRate * 0.12;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for(let i=0;i<bufferSize;i++){
    data[i] = (Math.random()*2-1) * Math.exp(-i/bufferSize*6) * 0.15; // volume réduit
  }

  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(0.1, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
  noise.connect(noiseGain);
  noiseGain.connect(audioCtx.destination);

  noise.start(now);
  noise.stop(now + 0.12);
}

// --- Son quand le joueur prend un dégât ---
function playDamage(){
  if(!soundOn) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(400, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.15);

  gain.gain.setValueAtTime(0.25, audioCtx.currentTime); // un peu plus fort
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

  osc.connect(gain); 
  gain.connect(audioCtx.destination);
  osc.start(); 
  osc.stop(audioCtx.currentTime + 0.15);
}

// --- joueur et ennemis ---
const solo={
  player: { x: W/2-32, y:H-48, w:64, h:32, speed:4, lives:3, hitFrame: null, hitFrameCounter: 0, frame: 0 },
  bullets:[],
  enemyBullets:[],
  enemies:[],
  items:[],
  score:0,
  level:1,
  enemySpeed:0.4,
  enemyDir:1,
  running:true,
  frame:0,
  bossActive:false,
  playerShotFrame: 0,
  enemyShotFrame: 0 
};

const sprites={};
const loadSprite=(name,src)=>{ const img=new Image(); img.src=src; sprites[name]=img; }
loadSprite('alien0','sprites/alien0.png');
loadSprite('alien1','sprites/alien1.png');
for(let i=0;i<4;i++) loadSprite('explosion'+i,`sprites/explosion${i}.png`);
loadSprite('playerShot0','sprites/playerShot0.png');
loadSprite('playerShot1','sprites/playerShot1.png');
loadSprite('enemyShot0','sprites/enemyShot0.png');
loadSprite('enemyShot1','sprites/enemyShot1.png');

const availableShips = [
  { name:'White', frames:['cosmetics/whiteShip0.png','cosmetics/whiteShip1.png'] },
  { name:'Blue', frames:['cosmetics/blueShip0.png','cosmetics/blueShip1.png'] },
  { name:'Orange', frames:['cosmetics/orangeShip0.png','cosmetics/orangeShip1.png'] },
  { name:'Purple', frames:['cosmetics/purpleShip0.png','cosmetics/purpleShip1.png'] },
  { name:'Big Blue', frames:['cosmetics/bigblueShip0.png','cosmetics/bigblueShip1.png'] },
  { name:'Red', frames:['cosmetics/redShip0.png','cosmetics/redShip1.png'] },
  { name:'Dark', frames:['cosmetics/darkShip0.png','cosmetics/darkShip1.png'] },
];

const cosmeticUnlocks = [
  { name: 'White', score: 0 },
  { name: 'Blue', score: 3000 },
  { name: 'Orange', score: 5000 },
  { name: 'Purple', score: 8000 },
  { name: 'Big Blue', score: 10000 },
  { name: 'Red', score: 15000 },
  { name: 'Dark', score: 20000 }
];

function getBestScoreFromHighscores(){
  try {
    const hs = JSON.parse(localStorage.getItem('si_highscores') || '[]');
    if(!Array.isArray(hs) || hs.length === 0) return 0;
    return hs.reduce((max, s) => Math.max(max, (s && s.score) || 0), 0);
  } catch (e) {
    return 0;
  }
}

// Liste des cosmétiques débloqués
let unlockedCosmetics = JSON.parse(localStorage.getItem('unlockedCosmetics')||'[]');

if(!Array.isArray(unlockedCosmetics)) unlockedCosmetics = [];
if(unlockedCosmetics.length === 0){
  unlockedCosmetics.push(cosmeticUnlocks[0].name);
  localStorage.setItem('unlockedCosmetics', JSON.stringify(unlockedCosmetics));
}

// --- Notifications dans le canvas ---
let canvasNotifications = [];

function showUnlockNotificationInCanvas(shipName, score) {
  canvasNotifications.push({
    text: `🚀 ${shipName} unblocked (${score} pts)`,
    y: 30,
    alpha: 1,
    life: 300
  });
}

function updateUnlockedCosmetics(currentScore) {
  // Charger depuis localStorage
  let unlocked = JSON.parse(localStorage.getItem('unlockedCosmetics')) || [];
  let changed = false;

  cosmeticUnlocks.forEach(c => {
    if (currentScore >= c.score && !unlocked.includes(c.name)) {
      unlocked.push(c.name);
      changed = true;
      showUnlockNotificationInCanvas(c.name, c.score); // notification dans le canvas
    }
  });

  if (changed) {
    localStorage.setItem('unlockedCosmetics', JSON.stringify(unlocked));
    window.unlockedCosmetics = unlocked;
  }

  // Si menu visible, régénère-le
  const menu = document.getElementById('shipSelect');
  if(menu && menu.offsetParent !== null){
    showShipSelectionMenu();
  }
}

// --- Dans ta fonction draw(), avant le HUD ---
canvasNotifications.forEach((notif, i) => {
  ctx.save();
  ctx.globalAlpha = notif.alpha;
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(W/2 - 160, notif.y - 20, 320, 30);
  ctx.fillStyle = '#0f0';
  ctx.font = '16px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(notif.text, W/2, notif.y);
  ctx.restore();

  // animation disparition
  notif.life--;
  if(notif.life < 60) notif.alpha = notif.life / 60; // fondu sur les 60 dernières frames
  notif.y -= 0.2; // léger déplacement vers le haut

  if(notif.life <= 0) canvasNotifications.splice(i, 1);
});

function showShipSelectionMenu() {
  const container = document.getElementById('shipSelect');
  container.innerHTML = ''; // on nettoie d’abord

  // 🔄 Recharge la liste à jour depuis localStorage
  const unlocked = JSON.parse(localStorage.getItem('unlockedCosmetics')) || [];

  cosmeticUnlocks.forEach(c => {
    const div = document.createElement('div');
    div.className = 'shipCard';

    // Image du vaisseau
    const img = document.createElement('img');
    img.src = c.preview;
    img.alt = c.name;

    // Nom du vaisseau
    const label = document.createElement('div');
    label.textContent = c.name;

    div.appendChild(img);
    div.appendChild(label);

    if (unlocked.includes(c.name)) {
      // ✅ Débloqué
      div.classList.add('unlocked');
      div.addEventListener('click', () => selectShip(c));
    } else {
      // 🔒 Verrouillé
      div.classList.add('locked');
      const lock = document.createElement('div');
      lock.className = 'lockInfo';
      lock.innerHTML = `🔒 ${c.score} required points`;
      div.appendChild(lock);
    }

    container.appendChild(div);
  });
}

const bestScore = getBestScoreFromHighscores();
updateUnlockedCosmetics(bestScore);

let currentShip = localStorage.getItem('selectedShip');
if(!currentShip || !unlockedCosmetics.includes(currentShip)){
  currentShip = unlockedCosmetics[0] || cosmeticUnlocks[0].name;
  localStorage.setItem('selectedShip', currentShip);
}

function loadCurrentShip(){
  const shipObj = availableShips.find(s => s.name === currentShip);
  if(!shipObj) return;
  loadSprite('playerShip0', shipObj.frames[0]);
  loadSprite('playerShip1', shipObj.frames[1]);
}
loadCurrentShip();

function selectShip(shipName){
  if(!unlockedCosmetics.includes(shipName)) return; // uniquement si débloqué
  currentShip = shipName;
  localStorage.setItem('selectedShip', shipName);
  loadCurrentShip();

  document.querySelectorAll('.cosmetic-item').forEach(el=>el.classList.remove('selected'));
  const selected = Array.from(document.querySelectorAll('.cosmetic-item'))
    .find(el=>el.textContent===shipName);
  if(selected) selected.classList.add('selected');
}

const cosmeticsBtn = document.getElementById('cosmeticsBtn');
const cosmeticsModal = document.getElementById('cosmeticsModal');
const closeCosmetics = document.getElementById('closeCosmetics');
const cosmeticsList = document.getElementById('cosmeticsList');

cosmeticsBtn.addEventListener('click',()=>{
  cosmeticsModal.style.display='flex';
  loadCosmetics();
});
closeCosmetics.addEventListener('click',()=>cosmeticsModal.style.display='none');

function loadCosmetics(){
  cosmeticsList.innerHTML='';

  // 🔄 Recharge la liste à jour
  unlockedCosmetics = JSON.parse(localStorage.getItem('unlockedCosmetics')) || [];

  if(availableShips.length===0){
    cosmeticsList.innerHTML='<p>Aucun vaisseau trouvé 😢</p>';
    return;
  }

  availableShips.forEach(ship => {
    const item = document.createElement('div');
    item.className = 'cosmetic-item';

    // Vérifie si débloqué
    const unlock = cosmeticUnlocks.find(c => c.name === ship.name);
    const unlocked = unlockedCosmetics.includes(ship.name);

    if(!unlocked) item.classList.add('locked'); // griser si pas débloqué
    if(ship.name === currentShip) item.classList.add('selected');

    const img = document.createElement('img');
    img.src = ship.frames[0];
    img.alt = ship.name;

    const label = document.createElement('div');
    label.textContent = ship.name;

    item.appendChild(img);
    item.appendChild(label);

    // ✅ Si verrouillé, ajout du cadenas + score requis
    if(!unlocked){
      const lockOverlay = document.createElement('div');
      lockOverlay.className = 'lock-overlay';
      lockOverlay.innerHTML = `
        <div class="lock-content">
          🔒<br>
          ${unlock.score} pts
        </div>
      `;
      item.appendChild(lockOverlay);
    }

    item.addEventListener('click', () => {
      if(unlocked) selectShip(ship.name); // on peut cliquer uniquement si débloqué
      cosmeticsModal.style.display='none';
    });

    cosmeticsList.appendChild(item);
  });
};

const alienStyles = [
  ['sprites/alien0.png','sprites/alien1.png'],
  ['sprites/alien2.png','sprites/alien3.png'],
  ['sprites/alien4.png','sprites/alien5.png']
];

const alienSprites = {};
alienStyles.flat().forEach(path => {
  const img = new Image();
  img.src = path;
  alienSprites[path] = img;
});

function initSoloEnemies(){ 
  solo.enemies = [];
  solo.items = []; // réinitialiser les items

  // Item bonus vie
  if(solo.level % specialBonusLife === 0){
    solo.items.push({
      x: Math.random() * (W - 24),
      y: -20,
      w: 24,
      h: 12,
      type: 'life',
      speed: 2
    });
  }

  if(solo.level % 5 === 0){
    solo.bossActive = true;
    solo.enemies.push({
      x: W/2 - 50,
      y: 50,
      w: 100,
      h: 50,
      alive: true,
      hitsLeft: 20,
      hitFrame: null,
      frame: 0,
      isBoss: true,
      frames: [sprites['alien0'], sprites['alien1']], // garder toutes les images
      lastShot: 0,
      vx: 1.5, vy: 0.5
    });
  } else {
    // Vague normale
    solo.bossActive = false;
    const rows = 4, cols = 8, w = 36, h = 20;

    for(let r = 0; r < rows; r++){
      for(let c = 0; c < cols; c++){
        const styleSet = alienStyles[Math.floor(Math.random() * alienStyles.length)];
        solo.enemies.push({
          x: 60 + c * (w + 12),
          y: 60 + r * (h + 10),
          w, h,
          alive: true,
          hitFrame: null,
          frame: 0,
          frames: styleSet.map(p => alienSprites[p])
        });
      }
    }
  }
}
initSoloEnemies();

// --- Gestion Game Over + Highscores ---
function endSolo() {
  saveLocalHighscore(solo.score, solo.level);
  solo.running = false;
  paused = false;
  renderHighscores();
  gameMusic.pause();
}

function saveLocalHighscore(score, level) {
  const key = 'si_highscores';
  const hs = JSON.parse(localStorage.getItem(key) || '[]');
  hs.push({ score, level, difficulty, date: new Date().toISOString() });
  hs.sort((a, b) => b.score - a.score);
  localStorage.setItem(key, JSON.stringify(hs.slice(0, 3)));
  renderHighscores();
}

// --- update ---
function soloUpdate(dt){
  if(paused) return;

  const p = solo.player;

  // --- Déplacement joueur ---
  if(keys['ArrowLeft']||keys['KeyA']||input.left) p.x -= p.speed;
  if(keys['ArrowRight']||keys['KeyD']||input.right) p.x += p.speed;
  p.x = Math.max(0, Math.min(W - p.w, p.x));

  if(MoveUpDown){
    if(keys['ArrowUp'] || keys['KeyW'] || input.up) p.y -= p.speed;
    if(keys['ArrowDown'] || keys['KeyS'] || input.down) p.y += p.speed;
    p.y = Math.max(0, Math.min(H - p.h, p.y));
  }

  // --- Tir joueur ---
  if (input.fire) {
    const now = performance.now();
    const canShoot =
      (difficulty === 'Normal' && !p.lastShotTime) ||
      (difficulty !== 'Normal' && solo.bullets.length < 5 && (!p.lastShotTime || now - p.lastShotTime >= shotInterval));

    if (canShoot) {
      solo.bullets.push({ x: p.x + p.w/2, y: p.y - 6, r: 4, speed: 7, frame: solo.playerShotFrame });
      solo.playerShotFrame = 1 - solo.playerShotFrame;
      playLaser(false);
      p.lastShotTime = now;
    }
  } else if(difficulty === 'Normal') {
    p.lastShotTime = null; // Reset pour tir "Normal"
  }

  // --- Déplacement balles ---
  solo.bullets.forEach(b => b.y -= b.speed * dt);
  solo.bullets = solo.bullets.filter(b => b.y > -20);
  solo.enemyBullets.forEach(b => b.y += b.speed * dt);
  solo.enemyBullets = solo.enemyBullets.filter(b => b.y < H + 20);

  // --- Déplacement ennemis ---
  let left = Infinity, right = -Infinity;
  solo.enemies.forEach(e => { 
    if(e.alive){ 
      left = Math.min(left, e.x); 
      right = Math.max(right, e.x+e.w); 
      e.frame = (solo.frame % 30 < 15) ? 0 : 1; 
    }
  });

  if(right === -Infinity){ 
    // Vague suivante
    solo.level++; 
    solo.enemySpeed += 0.12; 
    initSoloEnemies();
    if(solo.level % specialBonusLife === 0 && !solo.extraLifeItem){
      solo.extraLifeItem = { x: Math.random()*(W-24), y:-20, w:24, h:12, speed:2 };
    }
  } else {
    if(right + solo.enemyDir * solo.enemySpeed * dt > 580 || left + solo.enemyDir * solo.enemySpeed * dt < 20){
      solo.enemies.forEach(e => e.y += 18); 
      solo.enemyDir *= -1;
    } else solo.enemies.forEach(e => e.x += solo.enemyDir * solo.enemySpeed * dt);
  }

  // --- Collision balles/ennemis ---
  for(let i=solo.bullets.length-1;i>=0;i--){
    const b = solo.bullets[i];
    for(let j=0;j<solo.enemies.length;j++){
      const e = solo.enemies[j]; if(!e.alive) continue;
      if(b.x>=e.x && b.x<=e.x+e.w && b.y>=e.y && b.y<=e.y+e.h){
        if(e.isBoss){ 
          e.hitsLeft--; 
          if(e.hitsLeft<=0){ 
            e.alive=false; e.hitFrame=0; solo.score+=100; playExplosion(); 
          } 
        } else { 
          e.alive=false; e.hitFrame=0; solo.score+=10; playExplosion(); 
        }
        solo.bullets.splice(i,1); break;
      }
    }
  }

  // --- Tir ennemis classiques ---
  if(Math.random()>0.995){ 
    const alive = solo.enemies.filter(e=>e.alive&&!e.isBoss); 
    if(alive.length){
      const e = alive[Math.floor(Math.random()*alive.length)];
      solo.enemyBullets.push({ x:e.x+e.w/2, y:e.y+e.h, r:4, speed:3, frame: solo.enemyShotFrame });
      solo.enemyShotFrame = 1 - solo.enemyShotFrame;
      playLaser(true);
    }
  }

  // --- Boss ---
  if(solo.bossActive){
    const now = performance.now();
    solo.enemies.forEach(e => {
      if(e.isBoss && e.alive){
        if(e.vx === undefined) e.vx = (Math.random()*2-1)*2;
        if(e.vy === undefined) e.vy = (Math.random()*2-1)*1;

        e.x += e.vx * dt;
        e.y += e.vy * dt;

        if(e.x < 0){ e.x = 0; e.vx *= -1; }
        if(e.x + e.w > W){ e.x = W - e.w; e.vx *= -1; }
        if(e.y < 20){ e.y = 20; e.vy *= -1; }
        if(e.y + e.h > H/2){ e.y = H/2 - e.h; e.vy *= -1; }

        if(Math.random() < 0.01){
          e.vx = (Math.random()*2-1)*2;
          e.vy = (Math.random()*2-1)*1;
        }

        if(e.lastShot === undefined) e.lastShot = 0;
        const bossFireInterval = Math.max(100, 500 - solo.level * 20);
        if(now - e.lastShot > bossFireInterval){
          solo.enemyBullets.push({
            x: e.x + e.w/2,
            y: e.y + e.h,
            r: 6,
            speed: 4,
            frame: solo.enemyShotFrame
          });
          e.lastShot = now;
          solo.enemyShotFrame = 1 - solo.enemyShotFrame;
          playLaser(true);
        }
      }
    });
  }

  // --- Collision joueur ---
  for(let i=solo.enemyBullets.length-1;i>=0;i--){
    const eb = solo.enemyBullets[i];
    if(eb.x>=p.x && eb.x<=p.x+p.w && eb.y>=p.y && eb.y<=p.y+p.h){
      solo.enemyBullets.splice(i,1); 
      p.lives--; 
      playDamage();
      p.hitFrame = 0;
      p.hitFrameCounter = 0;
      if(p.lives<=0) endSolo();
    }
  }

  // --- Collision ennemis / joueur ---
  for (let e of solo.enemies) {
    if (e.alive) {
      const collides = e.x < p.x + p.w &&
                       e.x + e.w > p.x &&
                       e.y < p.y + p.h &&
                       e.y + e.h > p.y;
      const passedBelow = e.y + e.h >= p.y;
      if(collides || passedBelow){
        p.lives = 0;
        playDamage();
        endSolo();
        break;
      }
    }
  }

  // --- Item vie bonus ---
  if(solo.extraLifeItem){
    const e = solo.extraLifeItem;
    e.y += e.speed*dt;
    if(e.x+e.w>p.x && e.x<p.x+p.w && e.y+e.h>p.y && e.y<p.y+p.h){
      p.lives++;
      setTimeout(()=>playLaser(false),10);
      solo.extraLifeItem=null;
    } else if(e.y>H) solo.extraLifeItem=null;
  }

  if(solo.bossActive && solo.enemies.filter(e=>e.isBoss&&e.alive).length===0) solo.bossActive=false;

  // --- HUD ---
  scoreEl.textContent='Score: '+solo.score;
  livesEl.textContent='Lives: '+p.lives;
  levelEl.textContent='Level: '+solo.level;

  updateUnlockedCosmetics(solo.score);

  solo.frame++;
  solo.player.frame = (solo.frame % 30 < 15) ? 0 : 1;
}

const stars = [];
for (let i = 0; i < 150; i++) {
  stars.push({
    x: Math.random() * W,
    y: Math.random() * H,
    size: Math.random() * 2,
    speed: 0.2 + Math.random() * 0.5
  });
}

function draw(){
  ctx.fillStyle = '#000011';
  ctx.fillRect(0, 0, W, H);
  stars.forEach(s => {
    ctx.fillStyle = 'white';
    ctx.fillRect(s.x, s.y, s.size, s.size);
    s.y += s.speed;
    if (s.y > H) s.y = 0;
  });

  // Ennemis
  solo.enemies.forEach(e => {
    if (e.alive) {
      if(e.frames && e.frames.length > 0){
        const img = e.frames[e.frame % e.frames.length];
        if(img && img.complete) ctx.drawImage(img, e.x, e.y, e.w, e.h);
      }

      // Boss : glow et barre de vie
      if (e.isBoss) {
        ctx.save();
        ctx.shadowColor = 'red';
        ctx.shadowBlur = 20;
        if(e.frames && e.frames.length > 0){
          const img = e.frames[e.frame % e.frames.length];
          if(img && img.complete) ctx.drawImage(img, e.x, e.y, e.w, e.h);
        }
        ctx.restore();

        ctx.fillStyle = 'red';
        const hpWidth = e.w * (e.hitsLeft / 20);
        ctx.fillRect(e.x, e.y - 6, hpWidth, 4);
      }
    } else if (e.hitFrame !== null) {
        if (e.hitFrameCounter === undefined) e.hitFrameCounter = 0;
        const expImg = sprites['explosion' + e.hitFrame];
        if (expImg && expImg.complete) ctx.drawImage(expImg, e.x, e.y, e.w, e.h);

        e.hitFrameCounter++;
        if (e.hitFrameCounter >= EXPLOSION_FRAME_DELAY) {
          e.hitFrame++;
          e.hitFrameCounter = 0;
          if (e.hitFrame >= 4) e.hitFrame = null; // fin de l’explosion
        }
      }
  });

  // Item vie bonus
  if (solo.extraLifeItem) {
    const e = solo.extraLifeItem;
    ctx.save();
    ctx.shadowColor = 'lime';
    ctx.shadowBlur = 12;
    ctx.drawImage(sprites.playerShip0, e.x, e.y, 36, 18);
    ctx.restore();
  }

  // Balles
  solo.bullets.forEach(b => {
    const img = sprites['playerShot' + b.frame];
    if(img && img.complete) ctx.drawImage(img, b.x-8, b.y, 16, 32);
  });
  solo.enemyBullets.forEach(b => {
    const img = sprites['enemyShot' + b.frame];
    if(img && img.complete) ctx.drawImage(img, b.x-8, b.y, 16, 32);
  });

  // Joueur
  const p = solo.player;
  if(p.hitFrame !== null){
    const expImg = sprites['explosion'+p.hitFrame];
    if(expImg && expImg.complete) ctx.drawImage(expImg, p.x, p.y, p.w, p.h);
    p.hitFrameCounter++;
    if(p.hitFrameCounter >= EXPLOSION_FRAME_DELAY){
      p.hitFrame++;
      p.hitFrameCounter = 0;
    }
    if(p.hitFrame > 3) p.hitFrame = null;
  } else if(p.lives > 0){
    const img = sprites['playerShip' + p.frame];
    if(img && img.complete) ctx.drawImage(img, p.x, p.y, p.w, p.h);
  }

  // HUD visuel
  if(solo.running){
    const lifeW=24, lifeH=12;
    for(let i=0;i<p.lives;i++){
      ctx.save();
      ctx.shadowColor='red';
      ctx.shadowBlur=8;
      ctx.drawImage(sprites.playerShip0,10+i*(lifeW+4),10,lifeW,lifeH);
      ctx.restore();
    }
    ctx.fillStyle='white';
    ctx.font='16px monospace';
    ctx.textAlign='center';
    ctx.fillText('Score: '+solo.score,W/2,20);
    ctx.textAlign='right';
    ctx.fillText('Level: '+solo.level,W-10,20);
  }

  // Notifications
  canvasNotifications.forEach((notif, i) => {
    ctx.save();
    ctx.globalAlpha = notif.alpha;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(W/2 - 160, notif.y - 20, 320, 30);
    ctx.fillStyle = '#0f0';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(notif.text, W/2, notif.y);
    ctx.restore();

    // Animation disparition
    notif.life--;
    if(notif.life < 120) notif.alpha = notif.life / 120; // fondu sur 2 sec (~120 frames)
    notif.y -= 0.2; // remonte légèrement

    if(notif.life <= 0) canvasNotifications.splice(i, 1);
  });

  // Game Over
  if(!solo.running){
    ctx.fillStyle='rgba(0,0,0,0.6)';
    ctx.fillRect(0,H/2-60,W,120);
    ctx.fillStyle='#fff';
    ctx.font='22px monospace';
    ctx.textAlign='center';
    ctx.fillText('Game Over', W/2,H/2-6);
    ctx.font='16px monospace';
    ctx.fillText('Score: '+solo.score+' — Level: '+solo.level,W/2,H/2+24);
  }

  // Pause visuel + bouton JOUER
  if(paused){
    ctx.fillStyle='rgba(0,0,0,0.5)';
    ctx.fillRect(0,0,W,H);

    if(showStartButton){
      const btnWidth = 140, btnHeight = 50;
      const btnX = W/2 - btnWidth/2;
      const btnY = H/2 - btnHeight/2;

      ctx.save();
      ctx.shadowColor = startHover ? '#0f0' : '#0f0'; // vert vif
      ctx.shadowBlur = 20;
      ctx.fillStyle = startHover ? 'rgba(253, 253, 253, 1)' : '#0f0';
      ctx.font='28px monospace';
      ctx.textAlign='center';
      ctx.textBaseline='middle';
      ctx.fillText('PLAY', W/2, H/2);
      ctx.restore();
    } else {
      ctx.save();
      ctx.shadowColor = startHover ? '#0f0' : '#0f0'; // vert vif
      ctx.shadowBlur = 20;
      ctx.fillStyle = startHover ? 'rgba(253, 253, 253, 1)' : '#0f0';
      ctx.font='28px monospace';
      ctx.textAlign='center';
      ctx.textBaseline='middle';
      ctx.fillText('PAUSE', W/2, H/2);
      ctx.restore();
    }
  }
}

// --- Interaction bouton sur canvas ---
canvas.addEventListener('click', e => {
  if(showStartButton){
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const btnWidth = 140, btnHeight = 50;
    const btnX = W/2 - btnWidth/2, btnY = H/2 - btnHeight/2;
    if(x > btnX && x < btnX + btnWidth && y > btnY && y < btnY + btnHeight){
      paused = false;
      showStartButton = false;
      if(musicOn) playNextTrack();
    }
  }
});

canvas.addEventListener('mousemove', e => {
  if(showStartButton){
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const btnWidth = 140, btnHeight = 50;
    const btnX = W/2 - btnWidth/2, btnY = H/2 - btnHeight/2;
    startHover = x > btnX && x < btnX + btnWidth && y > btnY && y < btnY + btnHeight;
  }
});

// --- Boucle principale ---
function loop(){ 
  if(solo.running) soloUpdate(1); 
  draw();
  requestAnimationFrame(loop);
}
loop();

function resetSolo(){ 
  solo.player.lives = 3;
  solo.score = 0;
  solo.level = 1;
  solo.enemySpeed = 0.4;
  solo.enemyDir = 1; 
  solo.bullets = [];
  solo.enemyBullets = [];
  solo.items = [];
  initSoloEnemies();
  solo.running = true;

  // Update HUD
  scoreEl.textContent = 'Score: ' + solo.score;
  livesEl.textContent = 'Lives: ' + solo.player.lives;
  levelEl.textContent = 'Level: ' + solo.level;

  // Reprendre musique si activée
  if(musicOn && !paused) playNextTrack();
}

// --- Highscores affichage ---
function renderHighscores(){
  const hs = JSON.parse(localStorage.getItem('si_highscores')||'[]');
  if(hs.length === 0){
    hsList.innerHTML = '<p>No highscores yet</p>';
    return;
  }
  let html = `<table>
    <tr><th>Score</th><th>Level</th><th>Difficulty</th></tr>
    ${hs.map(s=>`<tr><td>${s.score}</td><td>${s.level}</td><td>${s.difficulty}</td></tr>`).join('')}
  </table>`;
  hsList.innerHTML = html;
}
renderHighscores();

})();