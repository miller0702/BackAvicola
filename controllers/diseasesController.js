const enfermedadesAvesCorral = [
  {
    nombre: "Gripe Aviar",
    sintomas: "fiebre, tos, dificultad para respirar",
    tratamiento: "Antivirales",
    prevencion: "vacunación, medidas de bioseguridad"
  },
  {
    nombre: "Newcastle",
    sintomas: "dificultad para respirar, diarrea, decaimiento",
    tratamiento: "Antibióticos",
    prevencion: "vacunación, control de vectores"
  },
  {
    nombre: "Coccidiosis",
    sintomas: "diarrea con sangre, pérdida de peso",
    tratamiento: "Anticoccidiales",
    prevencion: "manejo adecuado de excrementos, uso de anticoccidiales en piensos"
  },
  {
    nombre: "Bronquitis Infecciosa Aviar",
    sintomas: "tos, estornudos, secreción nasal",
    tratamiento: "Sintomático",
    prevencion: "vacunación, bioseguridad"
  },
  {
    nombre: "Marek",
    sintomas: "parálisis, pérdida de peso, tumores internos",
    tratamiento: "No hay cura, solo prevención",
    prevencion: "vacunación"
  },
  {
    nombre: "Coriza Infecciosa Aviar",
    sintomas: "escurrimiento nasal, ojos hinchados, tos",
    tratamiento: "Antibióticos",
    prevencion: "vacunación, bioseguridad"
  },
  {
    nombre: "Influenza aviar",
    sintomas: "fiebre, tos, dificultad para respirar, diarrea, decaimiento",
    tratamiento: "Antivirales",
    prevencion: "vacunación, medidas de bioseguridad"
  },
  {
    nombre: "Salmonelosis",
    sintomas: "diarrea, vómitos, fiebre, pérdida de peso",
    tratamiento: "Antibióticos",
    prevencion: "control de vectores, manipulación adecuada de alimentos"
  },
  {
    nombre: "Erisipela",
    sintomas: "enrojecimiento de la piel, inflamación, úlceras",
    tratamiento: "Antibióticos",
    prevencion: "vacunación, bioseguridad"
  },
  {
    nombre: "Histomoniasis",
    sintomas: "diarrea, pérdida de peso, debilidad",
    tratamiento: "Antibióticos",
    prevencion: "control de vectores, buena higiene"
  },
  {
    nombre: "Viruela aviar",
    sintomas: "lesiones cutáneas, hinchazón de las patas, anorexia",
    tratamiento: "No hay cura, solo tratamiento sintomático",
    prevencion: "vacunación"
  },
  {
    nombre: "Salmonelosis entérica",
    sintomas: "diarrea, vómitos, fiebre, pérdida de peso",
    tratamiento: "Antibióticos",
    prevencion: "control de vectores, manipulación adecuada de alimentos"
  },
  {
    nombre: "Pullorosis",
    sintomas: "diarrea, pérdida de peso, debilidad",
    tratamiento: "Antibióticos",
    prevencion: "vacunación, buena higiene"
  },
  {
    nombre: "E. coli",
    sintomas: "diarrea, vómitos, fiebre, pérdida de peso",
    tratamiento: "Antibióticos",
    prevencion: "control de vectores, manipulación adecuada de alimentos"
  }
];

module.exports = {

  async getAll(req, res) {
    res.json(enfermedadesAvesCorral);
  },
};
