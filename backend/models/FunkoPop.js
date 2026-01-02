// Modello FunkoPop
module.exports = function FunkoPop({ nome, numero, serie = null, condizione = null, immagine = null, note = null }) {
  return {
    nome,
    numero,
    serie,
    condizione,
    immagine,
    note
  };
};
