// Modello Fumetto
module.exports = function Fumetto({ titolo, numero, autore = null, editore = null, anno = null, condizione = null, immagine = null, note = null }) {
  return {
    titolo,
    numero,
    autore,
    editore,
    anno,
    condizione,
    immagine,
    note
  };
};
