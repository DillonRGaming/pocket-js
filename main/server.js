const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.static(path.join(__dirname)));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, mode: 'static-only' });
});

const server = app.listen(PORT, () => {
  console.log(`Pocket.js server running on http://localhost:${PORT}`);
});

module.exports = { app, server };
