const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 80;

// --- Fichiers statiques ---
app.use(express.static(path.join(__dirname, 'public')));
app.use('/cosmetics', express.static(path.join(__dirname, 'public', 'cosmetics')));
app.use('/sprites', express.static(path.join(__dirname, 'public', 'sprites')));
app.use('/sound', express.static(path.join(__dirname, 'public', 'sound')));

// --- Page principale ---
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Lancement du serveur ---
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
