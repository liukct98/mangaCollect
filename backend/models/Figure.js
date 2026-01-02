// Modello Figure
module.exports = function Figure({ nome, marca = null, altezza_cm = null, condizione = null, immagine = null, note = null }) {
  return {
    nome,
    marca,
    altezza_cm,
    condizione,
    immagine,
    note
  };
};
