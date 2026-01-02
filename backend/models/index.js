const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Inizializza Sequelize con SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../db.sqlite'),
  logging: false
});

// Modello Fumetto
const Fumetto = sequelize.define('Fumetto', {
  titolo: { type: DataTypes.STRING, allowNull: false },
  numero: { type: DataTypes.INTEGER, allowNull: false },
  autore: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  editore: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  anno: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
  condizione: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  immagine: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
  note: { type: DataTypes.TEXT, allowNull: true, defaultValue: null }
});

// Modello FunkoPop
const FunkoPop = sequelize.define('FunkoPop', {
  nome: { type: DataTypes.STRING, allowNull: false },
  numero: { type: DataTypes.INTEGER, allowNull: false },
  serie: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  condizione: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  immagine: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
  note: { type: DataTypes.TEXT, allowNull: true, defaultValue: null }
});

// Modello Figure
const Figure = sequelize.define('Figure', {
  nome: { type: DataTypes.STRING, allowNull: false },
  marca: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  altezza_cm: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
  condizione: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  immagine: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
  note: { type: DataTypes.TEXT, allowNull: true, defaultValue: null }
});

module.exports = { sequelize, Fumetto, FunkoPop, Figure };