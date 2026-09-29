// Génère un modèle 3D stylisé à partir du type de carrosserie et des dimensions du véhicule.
// Axe X : avant du véhicule vers +X. Axe Y : hauteur. Axe Z : largeur (côté conducteur en -Z).
import * as THREE from 'three';

// Profils latéraux par type de carrosserie.
// x* : fractions de la longueur (0 = centre, +0.5 = pare-chocs avant).
// y* : fractions de la hauteur totale.
const PROFILES = {
  citadine: { belt: 0.64, nose: 0.5, xFront: 0.19, xRoofFront: 0.03, xRoofRear: -0.37, xRear: -0.47, xB: -0.07, xC: null, wb: 0.62, wheelR: 0.31, gc: 0.14, cPillar: 0.16 },
  berline: { belt: 0.64, nose: 0.49, xFront: 0.21, xRoofFront: 0.06, xRoofRear: -0.19, xRear: -0.33, xB: -0.05, xC: null, wb: 0.6, wheelR: 0.32, gc: 0.14, cPillar: 0.1 },
  break: { belt: 0.63, nose: 0.49, xFront: 0.21, xRoofFront: 0.06, xRoofRear: -0.43, xRear: -0.48, xB: -0.05, xC: -0.27, wb: 0.59, wheelR: 0.32, gc: 0.14, cPillar: 0.1 },
  suv: { belt: 0.63, nose: 0.54, xFront: 0.21, xRoofFront: 0.07, xRoofRear: -0.41, xRear: -0.47, xB: -0.06, xC: -0.29, wb: 0.6, wheelR: 0.37, gc: 0.19, cPillar: 0.12 },
  coupe: { belt: 0.64, nose: 0.49, xFront: 0.19, xRoofFront: 0.01, xRoofRear: -0.2, xRear: -0.35, xB: -0.12, xC: null, wb: 0.61, wheelR: 0.33, gc: 0.13, cPillar: 0.1 },
};

// Découpe un polygone convexe par la droite verticale x = c (Sutherland–Hodgman).
function clipX(poly, c, keepGreater) {
  const inside = (p) => (keepGreater ? p.x >= c : p.x <= c);
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const ina = inside(a);
    const inb = inside(b);
    if (ina) out.push(a);
    if (ina !== inb) {
      const t = (c - a.x) / (b.x - a.x);
      out.push(new THREE.Vector2(c, a.y + t * (b.y - a.y)));
    }
  }
  return out;
}

function beam(p1, p2, z, thickness, depth, material) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy);
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(len + thickness * 0.5, thickness, depth), material);
  mesh.position.set((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, z);
  mesh.rotation.z = Math.atan2(dy, dx);
  mesh.castShadow = true;
  return mesh;
}

// Vitre inclinée (pare-brise ou lunette) entre deux points du profil, sur toute la largeur `w`.
function slopedGlass(pBottom, pTop, w, material) {
  const len = pBottom.distanceTo(pTop);
  const geo = new THREE.PlaneGeometry(len, w);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set((pBottom.x + pTop.x) / 2, (pBottom.y + pTop.y) / 2, 0);
  const angle = Math.atan2(pTop.y - pBottom.y, pTop.x - pBottom.x);
  // Le plan est d'abord couché dans XZ, puis incliné selon la pente.
  mesh.rotation.set(-Math.PI / 2, 0, 0);
  mesh.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), angle);
  return mesh;
}

export function createGlassMaterial(opacity) {
  return new THREE.MeshPhysicalMaterial({
    color: 0x0a0e12,
    metalness: 0.1,
    roughness: 0.04,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    depthWrite: false,
    envMapIntensity: 0.5,
  });
}

export function buildCar(model, paintHex, frontOpacity, rearOpacity) {
  const p = PROFILES[model.body];
  const { L, W, H } = model;
  const group = new THREE.Group();

  const X = (f) => f * L;
  const Y = (f) => f * H;
  const belt = Y(p.belt);
  const roofTop = H;
  const roofBottom = H - 0.06;
  const gc = p.gc;
  const wheelR = p.wheelR;
  const cw = W * 0.86; // largeur de l'habitacle au niveau des vitres

  const mats = {
    paint: new THREE.MeshPhysicalMaterial({ color: paintHex, metalness: 0.55, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.08 }),
    trim: new THREE.MeshStandardMaterial({ color: 0x111316, metalness: 0.2, roughness: 0.55 }),
    chrome: new THREE.MeshStandardMaterial({ color: 0xcfd4d8, metalness: 1, roughness: 0.18 }),
    tire: new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.9 }),
    rim: new THREE.MeshStandardMaterial({ color: 0xb8bec4, metalness: 0.95, roughness: 0.25 }),
    seat: new THREE.MeshStandardMaterial({ color: 0xc9bca4, roughness: 0.8 }),
    dash: new THREE.MeshStandardMaterial({ color: 0x2a2d31, roughness: 0.7 }),
    headlight: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xeaf4ff, emissiveIntensity: 1.2 }),
    taillight: new THREE.MeshStandardMaterial({ color: 0x8a0d0d, emissive: 0xff1a1a, emissiveIntensity: 0.9 }),
    plate: new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.5 }),
    windshield: createGlassMaterial(0.12),
    front: createGlassMaterial(frontOpacity),
    rear: createGlassMaterial(rearOpacity),
  };

  // --- Caisse inférieure (profil extrudé avec passages de roues) ---
  const bevel = 0.05;
  const rear = -L / 2 + bevel;
  const front = L / 2 - bevel;
  const shift = L * 0.015; // porte-à-faux avant légèrement plus long
  const wheelXs = [X(p.wb / 2) + shift, X(-p.wb / 2) + shift];
  const beltIn = belt - bevel;
  const nose = Y(p.nose) - bevel;
  const bottom = gc + bevel;

  const shape = new THREE.Shape();
  shape.moveTo(rear, bottom + 0.12);
  shape.lineTo(rear, beltIn - 0.12);
  shape.quadraticCurveTo(rear, beltIn, rear + 0.1, beltIn);
  shape.lineTo(X(p.xFront), beltIn);
  shape.quadraticCurveTo(front - 0.35, nose + 0.1, front - 0.12, nose);
  shape.quadraticCurveTo(front, nose - 0.02, front, nose - 0.14);
  shape.lineTo(front, bottom + 0.18);
  shape.quadraticCurveTo(front, bottom, front - 0.15, bottom);
  const ra = wheelR + 0.1;
  for (const wx of wheelXs) {
    const t0 = Math.asin(Math.max(-1, Math.min(1, (bottom - wheelR) / ra)));
    shape.lineTo(wx + ra * Math.cos(t0), bottom);
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const t = t0 + (Math.PI - 2 * t0) * (i / steps);
      shape.lineTo(wx + ra * Math.cos(t), wheelR + ra * Math.sin(t));
    }
  }
  shape.lineTo(rear + 0.12, bottom);
  shape.quadraticCurveTo(rear, bottom, rear, bottom + 0.12);

  const depth = W - 2 * bevel;
  const bodyGeo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 5,
    curveSegments: 16,
  });
  bodyGeo.translate(0, 0, -depth / 2);
  const body = new THREE.Mesh(bodyGeo, mats.paint);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // --- Habitacle : points du vitrage latéral ---
  const P1 = new THREE.Vector2(X(p.xRear), belt); // base montant arrière
  const P2 = new THREE.Vector2(X(p.xRoofRear), roofBottom);
  const P3 = new THREE.Vector2(X(p.xRoofFront), roofBottom);
  const P4 = new THREE.Vector2(X(p.xFront), belt); // base montant A
  const greenhouse = [P1, P2, P3, P4];
  const xB = X(p.xB);
  const xC = p.xC !== null ? X(p.xC) : null;

  const glass = { front: [], rear: [] };
  const addSideGlass = (poly, material, bucket) => {
    if (poly.length < 3) return;
    const geo = new THREE.ShapeGeometry(new THREE.Shape(poly));
    for (const side of [1, -1]) {
      const mesh = new THREE.Mesh(geo, material);
      mesh.position.z = side * (cw / 2);
      mesh.renderOrder = 2;
      group.add(mesh);
      bucket.push(mesh);
    }
  };

  addSideGlass(clipX(greenhouse, xB, true), mats.front, glass.front);
  const rearPart = clipX(greenhouse, xB, false);
  if (xC !== null) {
    addSideGlass(clipX(rearPart, xC, true), mats.rear, glass.rear);
    addSideGlass(clipX(rearPart, xC, false), mats.rear, glass.rear);
  } else {
    addSideGlass(rearPart, mats.rear, glass.rear);
  }

  const windshield = slopedGlass(P4, P3, cw, mats.windshield);
  windshield.renderOrder = 2;
  group.add(windshield);
  const rearScreen = slopedGlass(P1, P2, cw, mats.rear);
  rearScreen.renderOrder = 2;
  group.add(rearScreen);
  glass.rear.push(rearScreen);

  // --- Montants, toit et joints ---
  const roofAt = (x) => {
    // hauteur du bord supérieur de la vitre à l'abscisse x
    if (x >= P3.x) return belt + ((P4.x - x) / (P4.x - P3.x)) * (roofBottom - belt);
    if (x <= P2.x) return belt + ((x - P1.x) / (P2.x - P1.x)) * (roofBottom - belt);
    return roofBottom;
  };
  for (const side of [1, -1]) {
    const z = side * (cw / 2 - 0.005);
    group.add(beam(P4, P3, z, 0.08, 0.08, mats.paint)); // montant A
    group.add(beam(P1, P2, z, p.cPillar, 0.08, mats.paint)); // montant C / D
    group.add(beam(new THREE.Vector2(xB, belt), new THREE.Vector2(xB, roofAt(xB)), z, 0.09, 0.07, mats.trim)); // montant B
    if (xC !== null) group.add(beam(new THREE.Vector2(xC, belt), new THREE.Vector2(xC, roofAt(xC)), z, 0.1, 0.08, mats.paint));
    group.add(beam(new THREE.Vector2(P1.x, belt + 0.01), new THREE.Vector2(P4.x, belt + 0.01), side * (cw / 2 + 0.01), 0.03, 0.03, mats.chrome)); // jonc de ceinture
    group.add(beam(P2, P3, z, 0.06, 0.08, mats.paint)); // rail de toit
  }
  // Pavillon légèrement bombé
  const roofShape = new THREE.Shape();
  roofShape.moveTo(P2.x - 0.02, roofBottom);
  roofShape.quadraticCurveTo((P2.x + P3.x) / 2, roofTop + 0.03, P3.x + 0.03, roofBottom);
  roofShape.lineTo(P2.x - 0.02, roofBottom);
  const roofGeo = new THREE.ExtrudeGeometry(roofShape, { depth: cw, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.015, bevelSegments: 3, curveSegments: 20 });
  roofGeo.translate(0, 0, -cw / 2);
  const roof = new THREE.Mesh(roofGeo, mats.paint);
  roof.castShadow = true;
  group.add(roof);
  // Bas de pare-brise et de lunette
  group.add(beam(new THREE.Vector2(P4.x - 0.02, belt), new THREE.Vector2(P4.x + 0.02, belt), 0, 0.05, cw, mats.trim));

  // --- Rétroviseurs ---
  for (const side of [1, -1]) {
    const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.2), mats.paint);
    mirror.position.set(P4.x - 0.12, belt + 0.08, side * (cw / 2 + 0.14));
    mirror.castShadow = true;
    group.add(mirror);
  }

  // --- Intérieur (visible à travers les vitres claires) ---
  const seatBack = (x, z, width) => {
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.62, width), mats.seat);
    back.position.set(x, belt - 0.05, z);
    back.rotation.z = 0.2;
    group.add(back);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, Math.min(width * 0.55, 0.28)), mats.seat);
    head.position.set(x - 0.08, Math.min(belt + 0.38, roofBottom - 0.16), z);
    head.rotation.z = 0.2;
    group.add(head);
  };
  const frontSeatX = xB + 0.08;
  seatBack(frontSeatX, -cw * 0.24, 0.48);
  seatBack(frontSeatX, cw * 0.24, 0.48);
  const rearSeatX = Math.max(P2.x + 0.3, xB - 0.85);
  for (const z of [-cw * 0.28, 0, cw * 0.28]) seatBack(rearSeatX, z, cw * 0.28);
  const dash = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.16, cw - 0.06), mats.dash);
  dash.position.set(P4.x - 0.2, belt - 0.02, 0);
  group.add(dash);
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.025, 10, 28), mats.dash);
  wheel.position.set(P4.x - 0.5, belt + 0.06, -cw * 0.24);
  wheel.rotation.y = Math.PI / 2;
  wheel.rotation.x = 0;
  wheel.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), 0.45);
  group.add(wheel);

  // --- Roues ---
  const tw = 0.24;
  for (const wx of wheelXs) {
    for (const side of [1, -1]) {
      const w = new THREE.Group();
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(wheelR, wheelR, tw, 40), mats.tire);
      tire.rotation.x = Math.PI / 2;
      tire.castShadow = true;
      w.add(tire);
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(wheelR * 0.66, wheelR * 0.66, tw + 0.01, 32), mats.rim);
      rim.rotation.x = Math.PI / 2;
      w.add(rim);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(wheelR * 0.5, wheelR * 0.5, tw + 0.015, 32), mats.trim);
      hub.rotation.x = Math.PI / 2;
      w.add(hub);
      for (let i = 0; i < 5; i++) {
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(wheelR * 1.25, 0.05, tw + 0.02), mats.rim);
        spoke.rotation.z = (i / 5) * Math.PI;
        w.add(spoke);
      }
      w.position.set(wx, wheelR, side * (W / 2 - tw / 2 - 0.03));
      group.add(w);
    }
  }

  // --- Optiques, calandre, plaques ---
  for (const side of [1, -1]) {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.07, 0.36), mats.headlight);
    hl.position.set(L / 2 - 0.1, Y(p.nose) - 0.1, side * (W / 2 - 0.3));
    group.add(hl);
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.34), mats.taillight);
    tl.position.set(-L / 2 + 0.01, belt - 0.14, side * (W / 2 - 0.26));
    group.add(tl);
  }
  const grille = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, W * 0.42), mats.trim);
  grille.position.set(L / 2 + 0.005, Y(p.nose) - 0.26, 0);
  group.add(grille);
  const plateF = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.11, 0.52), mats.plate);
  plateF.position.set(L / 2 + 0.01, gc + 0.22, 0);
  group.add(plateF);
  const plateR = plateF.clone();
  plateR.position.set(-L / 2 - 0.01, belt - 0.32, 0);
  group.add(plateR);

  return {
    group,
    glass,
    materials: mats,
    dims: { L, W, H },
    dispose() {
      group.traverse((o) => o.geometry && o.geometry.dispose());
      Object.values(mats).forEach((m) => m.dispose());
    },
  };
}
