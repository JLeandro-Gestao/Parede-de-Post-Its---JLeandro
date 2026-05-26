const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DB_FILE = path.join(__dirname, 'db.json');

function lerDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return { posts: [], leads: [] };
  }
}

function salvarDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Retorna todos os posts
app.get('/api/posts', (req, res) => {
  const db = lerDB();
  res.json({ posts: db.posts });
});

// Recebe uma nova resposta
app.post('/api/submit', (req, res) => {
  const { name, phone, answer } = req.body;
  if (!name || !phone || !answer) {
    return res.status(400).json({ erro: 'Campos obrigatórios faltando' });
  }
  const db = lerDB();
  const id = Date.now();
  db.posts.push({ id, text: answer });
  db.leads.push({ id, name, phone, answer, at: new Date().toISOString() });
  salvarDB(db);
  res.json({ ok: true, total: db.posts.length });
});

// Admin: retorna leads completos
app.get('/api/leads', (req, res) => {
  const db = lerDB();
  res.json({ leads: db.leads });
});

// Deletar um item pelo id
app.delete('/api/delete/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const db = lerDB();
  db.posts = db.posts.filter(p => p.id !== id);
  db.leads = db.leads.filter(l => l.id !== id);
  salvarDB(db);
  res.json({ ok: true });
});

// Limpar todos os dados
app.delete('/api/reset', (req, res) => {
  salvarDB({ posts: [], leads: [] });
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`JLeandro Parede rodando na porta ${PORT}`);
});
