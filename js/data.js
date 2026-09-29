// Catalogue des véhicules et des films teintés.
// Les dimensions (en mètres) pilotent le modèle 3D généré : longueur, largeur, hauteur.

export const BODY_TYPES = {
  citadine: { label: 'Citadine / compacte', doors: 5 },
  berline: { label: 'Berline', doors: 4 },
  break: { label: 'Break', doors: 5 },
  suv: { label: 'SUV', doors: 5 },
  coupe: { label: 'Coupé', doors: 2 },
};

export const CATALOG = [
  {
    brand: 'Peugeot',
    models: [
      { name: '208', body: 'citadine', L: 4.06, W: 1.75, H: 1.43 },
      { name: '308', body: 'citadine', L: 4.37, W: 1.85, H: 1.44 },
      { name: '308 SW', body: 'break', L: 4.64, W: 1.85, H: 1.44 },
      { name: '3008', body: 'suv', L: 4.54, W: 1.84, H: 1.64 },
      { name: '508', body: 'berline', L: 4.75, W: 1.86, H: 1.40 },
    ],
  },
  {
    brand: 'Renault',
    models: [
      { name: 'Clio', body: 'citadine', L: 4.05, W: 1.80, H: 1.44 },
      { name: 'Mégane', body: 'citadine', L: 4.36, W: 1.81, H: 1.45 },
      { name: 'Captur', body: 'suv', L: 4.23, W: 1.80, H: 1.58 },
      { name: 'Austral', body: 'suv', L: 4.51, W: 1.83, H: 1.64 },
    ],
  },
  {
    brand: 'Citroën',
    models: [
      { name: 'C3', body: 'citadine', L: 4.01, W: 1.75, H: 1.57 },
      { name: 'C4', body: 'citadine', L: 4.36, W: 1.80, H: 1.52 },
      { name: 'C5 Aircross', body: 'suv', L: 4.50, W: 1.86, H: 1.69 },
    ],
  },
  {
    brand: 'Volkswagen',
    models: [
      { name: 'Polo', body: 'citadine', L: 4.07, W: 1.75, H: 1.45 },
      { name: 'Golf', body: 'citadine', L: 4.28, W: 1.79, H: 1.46 },
      { name: 'Passat', body: 'break', L: 4.92, W: 1.85, H: 1.50 },
      { name: 'Tiguan', body: 'suv', L: 4.54, W: 1.84, H: 1.66 },
    ],
  },
  {
    brand: 'BMW',
    models: [
      { name: 'Série 1', body: 'citadine', L: 4.36, W: 1.80, H: 1.46 },
      { name: 'Série 3', body: 'berline', L: 4.71, W: 1.83, H: 1.44 },
      { name: 'Série 4 Coupé', body: 'coupe', L: 4.77, W: 1.85, H: 1.38 },
      { name: 'X5', body: 'suv', L: 4.94, W: 2.00, H: 1.76 },
    ],
  },
  {
    brand: 'Mercedes-Benz',
    models: [
      { name: 'Classe A', body: 'citadine', L: 4.42, W: 1.80, H: 1.44 },
      { name: 'Classe C', body: 'berline', L: 4.75, W: 1.82, H: 1.44 },
      { name: 'Classe E Break', body: 'break', L: 4.95, W: 1.88, H: 1.47 },
      { name: 'GLC', body: 'suv', L: 4.72, W: 1.89, H: 1.64 },
    ],
  },
  {
    brand: 'Audi',
    models: [
      { name: 'A3 Sportback', body: 'citadine', L: 4.34, W: 1.82, H: 1.43 },
      { name: 'A4', body: 'berline', L: 4.76, W: 1.85, H: 1.43 },
      { name: 'A5 Coupé', body: 'coupe', L: 4.70, W: 1.85, H: 1.37 },
      { name: 'Q5', body: 'suv', L: 4.68, W: 1.89, H: 1.66 },
    ],
  },
  {
    brand: 'Tesla',
    models: [
      { name: 'Model 3', body: 'berline', L: 4.72, W: 1.85, H: 1.44 },
      { name: 'Model Y', body: 'suv', L: 4.75, W: 1.92, H: 1.62 },
    ],
  },
  {
    brand: 'Toyota',
    models: [
      { name: 'Yaris', body: 'citadine', L: 3.94, W: 1.75, H: 1.50 },
      { name: 'Corolla', body: 'berline', L: 4.63, W: 1.78, H: 1.44 },
      { name: 'C-HR', body: 'suv', L: 4.36, W: 1.83, H: 1.56 },
      { name: 'RAV4', body: 'suv', L: 4.60, W: 1.86, H: 1.69 },
    ],
  },
];

// TLV = taux de transmission lumineuse : plus le pourcentage est bas, plus la vitre est foncée.
// `opacity` est l'opacité appliquée au verre dans la vue 3D.
export const TINTS = [
  { id: 'none', label: 'Origine', vlt: null, opacity: 0.08, name: 'Verre d’origine' },
  { id: '50', label: '50 %', vlt: 50, opacity: 0.46, name: 'Film clair' },
  { id: '35', label: '35 %', vlt: 35, opacity: 0.6, name: 'Film léger' },
  { id: '25', label: '25 %', vlt: 25, opacity: 0.72, name: 'Film moyen' },
  { id: '15', label: '15 %', vlt: 15, opacity: 0.84, name: 'Film foncé' },
  { id: '5', label: '5 %', vlt: 5, opacity: 0.95, name: 'Film limousine' },
];

export const PAINTS = [
  { id: 'blanc', name: 'Blanc nacré', hex: '#e9ecee' },
  { id: 'gris', name: 'Gris platine', hex: '#8a9197' },
  { id: 'noir', name: 'Noir perla', hex: '#15171a' },
  { id: 'bleu', name: 'Bleu abysse', hex: '#1f3a5f' },
  { id: 'rouge', name: 'Rouge rubis', hex: '#8e1b22' },
  { id: 'vert', name: 'Vert forêt', hex: '#2f4a3a' },
];
