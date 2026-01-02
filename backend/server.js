const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Import modelli Sequelize
const { sequelize, Fumetto, FunkoPop, Figure } = require('./models');

// CRUD Fumetti
app.get('/api/fumetti', async (req, res) => {
  const fumetti = await Fumetto.findAll({ order: [['titolo', 'ASC'], ['numero', 'ASC']] });
  const grouped = fumetti.reduce((acc, f) => {
    acc[f.titolo] = acc[f.titolo] || [];
    acc[f.titolo].push(f);
    return acc;
  }, {});
  res.json(Object.values(grouped));
});
app.post('/api/fumetti', async (req, res) => {
  try {
    const nuovo = await Fumetto.create(req.body);
    res.status(201).json(nuovo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.put('/api/fumetti/:id', async (req, res) => {
  try {
    const fumetto = await Fumetto.findByPk(req.params.id);
    if (fumetto) {
      await fumetto.update(req.body);
      res.json(fumetto);
    } else {
      res.status(404).json({ error: 'Fumetto non trovato' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.delete('/api/fumetti/:id', async (req, res) => {
  try {
    const fumetto = await Fumetto.findByPk(req.params.id);
    if (fumetto) {
      await fumetto.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Fumetto non trovato' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// CRUD FunkoPop
app.get('/api/funkopop', async (req, res) => {
  const funkopop = await FunkoPop.findAll();
  res.json(funkopop);
});
app.post('/api/funkopop', async (req, res) => {
  try {
    const nuovo = await FunkoPop.create(req.body);
    res.status(201).json(nuovo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.delete('/api/funkopop/:id', async (req, res) => {
  try {
    const funko = await FunkoPop.findByPk(req.params.id);
    if (funko) {
      await funko.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'FunkoPop non trovato' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// CRUD Figure
app.get('/api/figure', async (req, res) => {
  const figure = await Figure.findAll();
  res.json(figure);
});
app.post('/api/figure', async (req, res) => {
  try {
    const nuovo = await Figure.create(req.body);
    res.status(201).json(nuovo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.put('/api/figure/:id', async (req, res) => {
  try {
    const fig = await Figure.findByPk(req.params.id);
    if (fig) {
      await fig.update(req.body);
      res.json(fig);
    } else {
      res.status(404).json({ error: 'Figura non trovata' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.delete('/api/figure/:id', async (req, res) => {
  try {
    const fig = await Figure.findByPk(req.params.id);
    if (fig) {
      await fig.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Figura non trovata' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Sincronizza i modelli e avvia il server
sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`Backend in ascolto su http://localhost:${port}`);
  });
});
