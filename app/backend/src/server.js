require('dotenv').config();
const express = require('express');
const path = require('path');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.get('/api/images', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, filename, description FROM images');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/images/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT filename, mime_type, data FROM images WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).send('Image not found');
    }
    const img = rows[0];
    res.setHeader('Content-Type', img.mime_type);
    res.send(img.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.use(express.static(path.join(__dirname, '..', 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
