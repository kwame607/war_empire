import { THREE, M, box, cyl, gableWalls, gableRoof, windowBox, door, banner, torch, barrel, crate, tree, person, soldier, smokeFx } from './lib.js';

function at(o, x, y, z, ry = 0) { o.position.set(x, y, z); o.rotation.y = ry; return o; }

export function cottage(opts = {}) {
  const g = new THREE.Group();
  const w = 5, d = 6.4, h = 2.5, rise = 2.1;
  g.add(box(w + 0.5, 0.45, d + 0.5, M.stone([3, 1]), 0, 0, 0));
  const walls = gableWalls(w, h, rise, d, M.plaster([1, 1])); walls.position.y = 0.45; g.add(walls);
  // half-timber frame on the +z gable and +x side
  const wd = M.woodDark();
  for (const x of [-w / 2, -w / 4, 0, w / 4, w / 2]) g.add(box(0.2, h, 0.16, wd, x, 0.45, d / 2 + 0.04));
  g.add(box(w, 0.22, 0.16, wd, 0, 0.45, d / 2 + 0.04)); g.add(box(w, 0.22, 0.16, wd, 0, 0.45 + h - 0.15, d / 2 + 0.04));
  g.add(box(0.16, 0.2, d, wd, w / 2 + 0.04, 0.45, 0)); g.add(box(0.16, 0.2, d, wd, w / 2 + 0.04, 0.45 + h - 0.15, 0));
  for (const z of [-d / 2, -d / 6, d / 6, d / 2]) g.add(box(0.16, h, 0.2, wd, w / 2 + 0.04, 0.45, z));
  const roof = gableRoof(w, rise, d, opts.thatch ? M.thatch([2, 2]) : M.tile([3, 3])); roof.position.y = 0.45 + h; g.add(roof);
  g.add(at(door(1.1, 1.9), -0.9, 0.55, d / 2 + 0.1));
  g.add(at(windowBox(0.9, 0.9), 1.4, 1.5, d / 2 + 0.12));
  g.add(at(windowBox(0.9, 0.9), w / 2 + 0.12, 1.5, -1.3, Math.PI / 2));
  g.add(at(windowBox(0.9, 0.9), w / 2 + 0.12, 1.5, 1.4, Math.PI / 2));
  g.add(box(2.0, 0.18, 0.9, M.stone([1, 1]), -0.9, 0.1, d / 2 + 0.6));
  const chim = box(0.8, 3.6, 0.8, M.stone([1, 3]), -w / 2 + 0.7, 0.45 + h, -1.2); g.add(chim); g.add(box(1.0, 0.14, 1.0, M.stoneDark([1, 1]), -w / 2 + 0.7, 0.45 + h + 3.6, -1.2));
  g.add(smokeFx(-w / 2 + 0.7, 0.45 + h + 3.9, -1.2));
  g.add(barrel(w / 2 + 0.9, d / 2 - 0.5, 0.9), crate(w / 2 + 0.9, d / 2 - 1.5, 0.8, 0.3));
  return g;
}

function slitWindow(x, y, z, ry) { const w = new THREE.Group(); w.add(box(0.5, 1.2, 0.18, M.stoneDark([1, 1]), 0, 0, 0)); w.add(box(0.22, 0.9, 0.22, M.glow(), 0, 0.15, 0.02)); return at(w, x, y, z, ry); }

export function barracks(opts = {}) {
  const g = new THREE.Group();
  const w = 6.4, d = 13;
  g.add(box(w + 0.7, 0.4, d + 0.7, M.stone([4, 1]), 0, 0, 0));
  // stone ground storey
  g.add(box(w, 2.4, d, M.stone([4, 1]), 0, 0.4, 0));
  // timber upper storey with gable
  const upper = gableWalls(w - 0.3, 1.7, 2.6, d - 0.3, M.plaster([1, 1], 0xd4c3a0)); upper.position.y = 2.8; g.add(upper);
  const wd = M.woodDark();
  for (const z of [-d / 2 + 0.2, -d / 3, -d / 6, 0, d / 6, d / 3, d / 2 - 0.2]) g.add(box(0.14, 1.7, 0.2, wd, w / 2 - 0.12, 2.8, z));
  g.add(box(0.2, 0.2, d, wd, w / 2 - 0.1, 2.8, 0)); g.add(box(0.2, 0.2, d, wd, w / 2 - 0.1, 4.35, 0));
  for (const x of [-w / 2 + 0.2, -w / 4, 0, w / 4, w / 2 - 0.2]) g.add(box(0.2, 1.7, 0.14, wd, x, 2.8, d / 2 - 0.14));
  g.add(box(w, 0.2, 0.2, wd, 0, 2.75, d / 2 - 0.1)); g.add(box(w, 0.2, 0.2, wd, 0, 4.4, d / 2 - 0.1));
  g.add(box(w + 0.3, 0.25, d + 0.3, M.stoneDark([4, 1]), 0, 2.72, 0));
  const roof = gableRoof(w - 0.3, 2.6, d - 0.3, M.slate([4, 4]), 0.7, 0.28); roof.position.y = 4.5; g.add(roof);
  // big double door on the +z end, with an arch surround
  g.add(at(door(2.2, 2.4), 0, 0.4, d / 2 + 0.12));
  g.add(box(3.0, 0.3, 0.4, M.stoneDark([1, 1]), 0, 2.85, d / 2 + 0.15));
  // slit windows down the +x wall
  for (const z of [-4.8, -2.4, 0, 2.4, 4.8]) g.add(slitWindow(w / 2 + 0.1, 1.6, z, Math.PI / 2));
  g.add(at(windowBox(0.9, 0.9), 1.6, 3.2, d / 2 - 0.08));
  g.add(at(windowBox(0.9, 0.9), -1.6, 3.2, d / 2 - 0.08));
  // corner watch tower
  const tx = w / 2 + 0.6, tz = -d / 2 + 0.2;
  g.add(box(3.0, 7.4, 3.0, M.stone([2, 3]), tx, 0, tz));
  g.add(box(3.5, 0.3, 3.5, M.stoneDark([1, 1]), tx, 7.4, tz));
  for (const [dx, dz] of [[-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5], [0, -1.6], [0, 1.6], [-1.6, 0], [1.6, 0]]) g.add(box(0.55, 0.6, 0.55, M.stone([1, 1]), tx + dx, 7.7, tz + dz));
  const pyr = new THREE.Mesh(new THREE.ConeGeometry(2.1, 2.6, 4), M.slate([2, 2])); pyr.position.set(tx, 9.4, tz); pyr.rotation.y = Math.PI / 4; pyr.castShadow = true; g.add(pyr);
  g.add(at(slitWindow(0, 4.6, 0, 0), tx - 0.4, 0, tz + 1.55)); g.add(at(slitWindow(0, 4.6, 0, Math.PI / 2), tx + 1.55, 0, tz + 0.4));
  g.add(at(banner(0x9c2f3b, 2.6), tx, 9.0, tz - 0.0));
  // banners at the door
  g.add(at(banner(0x9c2f3b, 2.4), -2.0, 0.4, d / 2 + 0.9)); g.add(at(banner(0xd4ac4f, 2.4), 2.0, 0.4, d / 2 + 0.9));
  g.add(torch(-1.6, 0.4, d / 2 + 0.5), torch(1.6, 0.4, d / 2 + 0.5));
  // parade ground: palisade, dummies, rack, soldiers
  const px = w / 2 + 4.8;
  for (let i = 0; i < 11; i++) { const post = cyl(0.14, 0.17, 2.2, M.wood([1, 1], 0x6b4a2a), px + 2.4, 0, -4 + i * 1.0, 7); g.add(post); const tip = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.5, 7), M.wood([1, 1], 0x6b4a2a)); tip.position.set(px + 2.4, 2.45, -4 + i * 1.0); tip.castShadow = true; g.add(tip); }
  g.add(box(0.14, 0.2, 10.4, M.woodDark(), px + 2.4, 1.2, 1.2));
  g.add(cyl(0.12, 0.12, 2.0, M.woodDark(), px - 0.6, 0, 1.2, 6), box(1.2, 0.14, 0.14, M.woodDark(), px - 0.6, 1.5, 1.2), cyl(0.28, 0.3, 0.9, M.thatch([1, 1]), px - 0.6, 0.55, 1.2, 8));
  g.add(cyl(0.12, 0.12, 2.0, M.woodDark(), px + 0.9, 0, 3.4, 6), box(1.2, 0.14, 0.14, M.woodDark(), px + 0.9, 1.5, 3.4), cyl(0.28, 0.3, 0.9, M.thatch([1, 1]), px + 0.9, 0.55, 3.4, 8));
  const rack = new THREE.Group(); rack.position.set(w / 2 + 1.2, 0, d / 2 - 1.2); rack.add(box(2.0, 0.12, 0.3, M.woodDark(), 0, 0.9, 0), box(0.12, 1.4, 0.3, M.woodDark(), -1.0, 0, 0), box(0.12, 1.4, 0.3, M.woodDark(), 1.0, 0, 0)); for (let i = 0; i < 4; i++) { rack.add(cyl(0.03, 0.03, 2.6, M.woodDark(), -0.7 + i * 0.45, 0, 0.1, 5)); const t = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.3, 6), M.metal()); t.position.set(-0.7 + i * 0.45, 2.75, 0.1); rack.add(t); } g.add(rack);
  const n = Math.min(opts.soldiers ?? 6, 8);
  for (let i = 0; i < n; i++) g.add(soldier(px - 1.4 + (i % 4) * 1.1, 4.8 + Math.floor(i / 4) * 1.2, -Math.PI / 2 + 0.2, i % 3 === 0 ? 0xd4ac4f : 0x9c2f3b));
  g.add(barrel(w / 2 + 0.9, -1.4, 0.9));
  return g;
}

export const BUILDINGS = { cottage, barracks, farmhouse: () => cottage({ thatch: true }) };

import { stripeTexture, pediment, column, archWindow, logPile, wheel, cart, haystack, fence, scarecrow, rng } from './lib.js';

export function farm() {
  const g = new THREE.Group();
  const fh = cottage({ thatch: true }); fh.scale.setScalar(0.85); fh.position.set(-1.5, 0, 2.5); fh.rotation.y = 0; g.add(fh);
  // barn
  const bw = 5.2, bd = 7;
  const barn = new THREE.Group(); barn.position.set(-7.2, 0, -2.4);
  barn.add(box(bw + 0.4, 0.4, bd + 0.4, M.stone([3, 1]), 0, 0, 0));
  const bwalls = gableWalls(bw, 3.0, 2.2, bd, M.wood([2, 2], 0x8a4a34, true)); bwalls.position.y = 0.4; barn.add(bwalls);
  const broof = gableRoof(bw, 2.2, bd, M.wood([3, 3], 0x4a3322, false), 0.6, 0.26); broof.position.y = 3.4; barn.add(broof);
  barn.add(box(2.6, 2.6, 0.2, M.wood([1, 1], 0x5e3d22), 0, 0.4, bd / 2 + 0.05));
  for (const s of [-1, 1]) { const d = box(0.1, 2.6, 0.24, M.woodDark(), s * 0.65, 0.4, bd / 2 + 0.1); barn.add(d); }
  const brace = box(3.0, 0.14, 0.24, M.woodDark(), 0, 1.5, bd / 2 + 0.12); brace.rotation.z = 0.7; barn.add(brace); const brace2 = brace.clone(); brace2.rotation.z = -0.7; barn.add(brace2);
  barn.add(at(windowBox(0.8, 0.8, false), 0, 4.3, bd / 2 + 0.15));
  g.add(barn);
  // wheat field
  const field = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), M.field()); field.rotation.x = -Math.PI / 2; field.position.set(6.6, 0.03, 3.4); field.receiveShadow = true; g.add(field);
  g.add(fence(2.0, -1.2, 11.2, -1.2), fence(11.2, -1.2, 11.2, 8.0), fence(2.0, 8.0, 11.2, 8.0));
  g.add(haystack(-3.5, -4.6, 1), haystack(-2.2, -5.4, 0.8), scarecrow(7, 3));
  g.add(barrel(-4.4, 3.3, 0.9), crate(-4.2, 4.3, 0.7, 0.2));
  g.add(person(3, 6.5, 0x7a3a2a, 0.5));
  return g;
}

export function timber() {
  const g = new THREE.Group();
  const cab = cottage({ thatch: true }); cab.scale.setScalar(0.62); cab.position.set(2.2, 0, 1.5); g.add(cab);
  for (const [x, z, s, k] of [[-6.4, -2.6, 1.4, 'pine'], [-4.8, 2.2, 1.2, 'pine'], [-8, 1.4, 1.5, 'pine'], [-2.4, -4.8, 1.3, 'oak'], [-6.2, -6.4, 1.5, 'pine'], [3.6, -5.8, 1.35, 'pine'], [7.4, -3.6, 1.2, 'pine'], [8.6, 2.4, 1.3, 'oak']]) g.add(tree(x, z, s, k, 3));
  g.add(logPile(-1.2, 3.4, 0.2, 10), logPile(5.8, 5.4, -0.4, 6));
  g.add(cyl(0.5, 0.55, 0.7, M.wood([1, 1], 0x8a6238), -2.8, 0, 0.2, 12));
  const axe = box(0.07, 0.8, 0.07, M.woodDark(), -2.8, 0.7, 0.2); axe.rotation.z = 0.5; g.add(axe); const blade = box(0.28, 0.22, 0.05, M.metal(), -2.5, 1.35, 0.2); g.add(blade);
  g.add(cart(2.0, 6.6, 0.3, 0x8a6238), barrel(-3.4, 4.8, 0.8));
  g.add(person(0.4, 5.0, 0x4a6a4a, 1));
  return g;
}

export function quarry() {
  const g = new THREE.Group(); const r = rng(31);
  // rock face: stacked irregular boulders
  const rocks = [[-5, -2, 3.2], [-2.6, -4, 3.8], [0.6, -4.8, 3.2], [3.6, -3, 2.8], [-6.6, 1, 2.4], [-3.4, -1, 2.6], [-0.6, -2, 2.2]];
  for (const [x, z, s] of rocks) { const m = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), M.rock([1, 1])); m.position.set(x, s * 0.55, z); m.scale.set(1.1, 0.8 + r() * 0.5, 1); m.rotation.set(r() * 3, r() * 3, r() * 3); m.castShadow = m.receiveShadow = true; g.add(m); }
  // cut terraces and blocks
  const blk = M.stone([1, 1]);
  for (const [x, z, ry] of [[3.0, 1.8, 0.2], [4.4, 1.4, 0.1], [3.6, 1.6, 0.15], [5.6, 3.2, 0.5]]) { const b = box(1.5, 0.8, 1.0, blk, x, 0, z); b.rotation.y = ry; g.add(b); }
  g.add(box(1.5, 0.8, 1.0, blk, 3.7, 0.8, 1.6));
  g.add(box(1.4, 0.7, 0.9, blk, 5.4, 0, 1.8));
  // wooden crane
  const cr = new THREE.Group(); cr.position.set(1.4, 0, 2.8);
  cr.add(cyl(0.12, 0.16, 5.0, M.woodDark(), 0, 0, 0, 7));
  const arm = box(3.8, 0.16, 0.16, M.woodDark(), 1.6, 4.7, 0); cr.add(arm);
  const stay = box(3.6, 0.1, 0.1, M.woodDark(), 1.2, 3.3, 0); stay.rotation.z = 0.78; stay.position.set(0.9, 3.5, 0); cr.add(stay);
  cr.add(cyl(0.02, 0.02, 2.2, M.woodDark(), 3.2, 2.5, 0, 4)); cr.add(box(0.8, 0.5, 0.8, blk, 3.2, 1.95, 0));
  g.add(cr);
  g.add(cart(-1.4, 4.4, 0.4, 0x8d8c88), cart(6.8, 0.2, -0.3, 0x8d8c88));
  const shed = new THREE.Group(); shed.position.set(-5.6, 0, 5.4); shed.add(box(2.6, 1.8, 2.2, M.wood([2, 1], 0x6e4a2a, false), 0, 0, 0)); const sr = gableRoof(2.6, 0.9, 2.2, M.wood([2, 2], 0x4a3322, false), 0.35, 0.16); sr.position.y = 1.8; shed.add(sr); g.add(shed);
  g.add(barrel(-3.4, 5.6, 0.8), person(1.8, 4.6, 0x6b5a3a, 2));
  return g;
}

export function workshop() {
  const g = new THREE.Group();
  const w = 6, d = 6.4, h = 2.8, rise = 2.2;
  g.add(box(w + 0.5, 0.4, d + 0.5, M.stone([3, 1]), 0, 0, 0));
  g.add(box(w, h, d, M.stone([3, 1]), 0, 0.4, 0));
  const up = gableWalls(w, 0.9, rise, d, M.plaster([1, 1], 0xc9b99a)); up.position.y = 0.4 + h; g.add(up);
  g.add(box(w + 0.3, 0.2, d + 0.3, M.stoneDark([3, 1]), 0, 0.4 + h - 0.1, 0));
  const roof = gableRoof(w, rise, d, M.tile([3, 3], 0x5c7a48), 0.6, 0.24); roof.position.y = 0.4 + h + 0.9; g.add(roof);
  // open forge bay on +z: dark opening with glowing forge
  g.add(box(3.2, 2.2, 0.3, M.flat(0x120d08), 0.9, 0.4, d / 2 + 0.02));
  g.add(box(1.2, 0.8, 0.9, M.stone([1, 1]), 1.0, 0.4, d / 2 - 0.5)); g.add(box(0.9, 0.35, 0.6, M.glow(0xff7a22), 1.0, 1.2, d / 2 - 0.5));
  const fl = new THREE.PointLight(0xff7a22, 2.4, 9, 2); fl.position.set(1.0, 1.6, d / 2 + 0.6); g.add(fl);
  g.add(box(0.9, 0.3, 0.45, M.metal(), -0.6, 0.9, d / 2 + 0.7), cyl(0.2, 0.3, 0.55, M.woodDark(), -0.6, 0.4, d / 2 + 0.7, 8));
  g.add(at(door(1.0, 1.8), -2.0, 0.4, d / 2 + 0.05));
  g.add(at(windowBox(0.8, 0.8), w / 2 + 0.1, 2.0, 0, Math.PI / 2));
  const ch = box(1.0, 5.4, 1.0, M.stone([1, 3]), -w / 2 + 0.8, 0.4, -1.6); g.add(ch); g.add(box(1.3, 0.2, 1.3, M.stoneDark([1, 1]), -w / 2 + 0.8, 5.8, -1.6)); g.add(smokeFx(-w / 2 + 0.8, 6.1, -1.6));
  g.add(barrel(w / 2 + 0.9, d / 2 - 0.4, 0.9), barrel(w / 2 + 1.7, d / 2 - 1.2, 0.8));
  const cp = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9, 0), M.flat(0x25211d)); cp.position.set(-w / 2 - 1.0, 0.5, d / 2 - 0.6); cp.scale.y = 0.6; g.add(cp);
  g.add(person(-1.5, d / 2 + 2.0, 0x3a4a6a, -0.4));
  return g;
}

function stall(x, z, c1, c2, ry = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry;
  for (const [px, pz, hh] of [[-1.3, -0.9, 2.6], [1.3, -0.9, 2.6], [-1.3, 0.9, 2.2], [1.3, 0.9, 2.2]]) g.add(cyl(0.07, 0.07, hh, M.woodDark(), px, 0, pz, 6));
  g.add(box(2.8, 0.8, 1.2, M.wood([1, 1], 0x7a5232, false), 0, 0, 0.1)); g.add(box(2.9, 0.08, 1.4, M.wood([1, 1], 0x9a7242, false), 0, 0.8, 0.1));
  const awn = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 2.5, 1, 1), M.stripe(c1, c2)); awn.rotation.x = -Math.PI / 2 + 0.22; awn.position.set(0, 2.5, 0); awn.castShadow = true; g.add(awn);
  const fr = box(3.3, 0.4, 0.06, M.stripe(c1, c2), 0, 2.15, 1.18); g.add(fr);
  const cols = [0xd9534f, 0xe8a33d, 0x7dbb5a, 0xd9534f, 0xe8a33d];
  for (let i = 0; i < 5; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 6), M.flat(cols[i])); s.position.set(-1.0 + i * 0.5, 1.0, 0.0 + (i % 2) * 0.3); s.castShadow = true; g.add(s); }
  g.add(box(0.5, 0.3, 0.4, M.wood([1, 1], 0x8a6238, false), 1.0, 0.88, 0.4));
  return g;
}
export function market() {
  const g = new THREE.Group();
  g.add(stall(-3.4, -1.8, 0xa33440, 0xede3cc, 0.1), stall(0.6, -2.4, 0x46689a, 0xede3cc, -0.05), stall(4.2, -1.6, 0x5c7a48, 0xede3cc, 0.12));
  // well
  const well = new THREE.Group(); well.position.set(-0.8, 0, 2.6); well.add(cyl(0.9, 1.0, 0.9, M.stone([2, 1]), 0, 0, 0, 14)); well.add(cyl(0.7, 0.7, 0.05, M.water(), 0, 0.85, 0, 14)); for (const s of [-1, 1]) well.add(cyl(0.07, 0.07, 2.2, M.woodDark(), s * 0.85, 0.8, 0, 6)); const wr = gableRoof(1.8, 0.7, 1.4, M.tile([1, 1]), 0.2, 0.1); wr.position.y = 3.0; well.add(wr); g.add(well);
  g.add(barrel(-5.4, 0.4, 1), barrel(-5.0, 1.4, 0.9), crate(5.8, 1.2, 1, 0.3), crate(6.2, 0.2, 0.8, 0.6), crate(5.7, 2.3, 0.7, 0.1));
  for (const [x, z, c, ry] of [[-2.4, 0.6, 0x2f6a4a, 0.5], [2.0, 0.2, 0x8a4a8a, 2], [3.4, 1.8, 0xb07a2a, 4], [1.0, 2.8, 0x4a6aa0, 1], [-3.8, 2.4, 0x9c2f3b, 3]]) g.add(person(x, z, c, ry));
  const cartx = cart(-6.2, 3.8, 0.9, 0xc9a24c); g.add(cartx);
  return g;
}

export function library() {
  const g = new THREE.Group();
  const w = 10, d = 8;
  g.add(box(w + 1.4, 0.5, d + 3.2, M.stone([4, 1]), 0, 0, 0.8));
  g.add(box(w + 0.8, 0.3, d + 2.6, M.stone([4, 1]), 0, 0.5, 0.8));
  const hall = box(w, 4.6, d, M.plaster([2, 1], 0xeee6d2), 0, 0.8, -0.4); g.add(hall);
  g.add(box(w + 0.3, 0.3, d + 0.3, M.stoneDark([4, 1]), 0, 5.4, -0.4));
  const roof = gableRoof(d, 2.0, w, M.tile([3, 3], 0xb8923a), 0.7, 0.24); roof.rotation.y = Math.PI / 2; roof.position.set(0, 5.7, -0.4); g.add(roof);
  // portico
  const pz = d / 2 + 1.2;
  for (const x of [-3.6, -1.8, 0, 1.8, 3.6]) { const c = column(x, pz, 4.2, 0.3); c.position.y = 0.8; g.add(c); }
  g.add(box(w - 1.2, 0.5, 2.6, M.stoneDark([4, 1]), 0, 5.0, d / 2 + 0.2 - 0.4));
  const ped = pediment(w - 1.0, 1.9, 2.4, M.plaster([1, 1], 0xeee6d2)); ped.position.set(0, 5.5, d / 2 + 0.2 - 0.4); g.add(ped);
  const gold = new THREE.Mesh(new THREE.CircleGeometry(0.5, 16), M.gold()); gold.position.set(0, 6.2, d / 2 + 0.9 + 0.1); g.add(gold);
  for (const s of [-1, 1]) g.add(at(archWindow(1.1, 2.6), s * 3.0, 1.9, d / 2 - 0.4 + 0.05));
  g.add(at(door(1.6, 2.6), 0, 0.8, d / 2 - 0.4 + 0.06));
  for (const z of [-2.4, 0.4, 3.0]) g.add(at(archWindow(1.0, 2.4), w / 2 + 0.05, 2.0, z - 0.4, Math.PI / 2));
  g.add(person(-2, d / 2 + 3.4, 0x3a4a6a, 0.3), person(2.4, d / 2 + 3.2, 0x8a3a3a, -0.4));
  return g;
}

export function academy() {
  const g = new THREE.Group();
  g.add(box(9, 0.5, 9, M.stone([4, 1]), 0, 0, 0));
  g.add(cyl(3.0, 3.2, 5.0, M.stone([5, 2]), 0, 0.5, 0, 24));
  g.add(cyl(3.3, 3.3, 0.35, M.stoneDark([5, 1]), 0, 5.4, 0, 24));
  const dome = new THREE.Mesh(new THREE.SphereGeometry(3.1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.copper()); dome.position.y = 5.7; dome.castShadow = true; g.add(dome);
  g.add(cyl(0.3, 0.4, 0.9, M.stoneL ? M.stone([1, 1]) : M.stone([1, 1]), 0, 8.7, 0, 10)); const lt = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.9, 8), M.gold()); lt.position.y = 9.9; g.add(lt);
  for (const a of [0.3, 1.2, 2.1, 3.0, 3.9, 4.8, 5.7]) { const w = at(archWindow(0.9, 2.4), Math.sin(a) * 3.16, 1.8, Math.cos(a) * 3.16, a); g.add(w); }
  g.add(at(door(1.5, 2.4), 0.0, 0.5, 3.2 + 0.2));
  for (const s of [-1, 1]) { const wing = box(2.6, 3.0, 3.6, M.plaster([1, 1], 0xdbcfb0), s * 4.4, 0.5, 0.6); g.add(wing); const wr = gableRoof(3.6, 1.2, 2.6, M.tile([2, 2], 0x46689a), 0.3, 0.16); wr.rotation.y = Math.PI / 2; wr.position.set(s * 4.4, 3.5, 0.6); g.add(wr); g.add(at(archWindow(0.7, 1.7), s * 4.4, 1.3, 2.45, 0)); }
  g.add(at(banner(0x46689a, 2.2), 2.4, 0.5, 4.2));
  g.add(person(-1.6, 5, 0x3a4a6a, 0.3), person(1.2, 5.6, 0x8a6a3a, 3));
  return g;
}

export function bureau() {
  const g = new THREE.Group();
  g.add(box(6, 0.5, 6, M.stone([3, 1]), 0, 0, 0));
  g.add(box(4.2, 6.0, 4.2, M.stone([3, 3]), 0, 0.5, 0));
  g.add(box(4.8, 0.3, 4.8, M.stoneDark([4, 1]), 0, 6.5, 0));
  const up = box(4.0, 2.8, 4.0, M.plaster([1, 1], 0xdbcfb0), 0, 6.8, 0); g.add(up);
  const wd = M.woodDark(); for (const [x, z] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) g.add(box(0.2, 2.8, 0.2, wd, x, 6.8, z)); for (const yy of [6.8, 9.4]) g.add(box(4.2, 0.2, 4.2, wd, 0, yy, 0));
  const pyr = new THREE.Mesh(new THREE.ConeGeometry(3.6, 3.6, 4), M.tile([2, 2], 0xa33440)); pyr.position.y = 11.5; pyr.rotation.y = Math.PI / 4; pyr.castShadow = true; g.add(pyr);
  g.add(at(door(1.3, 2.2), 0, 0.5, 2.15));
  g.add(at(windowBox(0.7, 1.1), -1.1, 3.6, 2.15), at(windowBox(0.7, 1.1), 1.1, 3.6, 2.15), at(windowBox(0.8, 1.2), 0, 7.4, 2.05), at(windowBox(0.8, 1.2), 2.05, 7.4, 0, Math.PI / 2), at(windowBox(0.7, 1.1), 2.15, 3.6, 0, Math.PI / 2));
  const sign = new THREE.Group(); sign.position.set(2.7, 3.4, 1.6); sign.add(box(0.07, 0.07, 1.3, wd, 0, 1.0, 0)); const scroll = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.9, 12), M.flat(0xede3cc)); scroll.rotation.x = Math.PI / 2; scroll.position.y = 0.6; sign.add(scroll); g.add(sign);
  g.add(at(banner(0xd4ac4f, 2.4), 0, 13.0, 0));
  g.add(person(-1.4, 3.8, 0x3a4a6a, 0.4));
  return g;
}

export function armoury() {
  const g = new THREE.Group();
  const w = 7, d = 6;
  g.add(box(w + 0.6, 0.4, d + 0.6, M.stoneDark([4, 1]), 0, 0, 0));
  g.add(box(w, 3.6, d, M.stone([3, 2]), 0, 0.4, 0));
  for (let i = 0; i < 6; i++) g.add(box(0.8, 0.8, 0.9, M.stoneDark([1, 1]), -w / 2 + 0.6 + i * 1.28, 4.0, d / 2 - 0.3), box(0.8, 0.8, 0.9, M.stoneDark([1, 1]), -w / 2 + 0.6 + i * 1.28, 4.0, -d / 2 + 0.3));
  g.add(box(w, 0.2, d, M.wood([2, 2], 0x4a3322, false), 0, 4.0, 0));
  g.add(at(door(1.8, 2.4), 0, 0.4, d / 2 + 0.06));
  for (const s of [-1, 1]) { const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.12, 20), M.stripe(s < 0 ? 0xa33440 : 0xd4ac4f, 0xede3cc)); sh.rotation.x = Math.PI / 2; sh.position.set(s * 2.4, 2.4, d / 2 + 0.12); sh.castShadow = true; g.add(sh); const bs = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 6), M.gold()); bs.position.set(s * 2.4, 2.4, d / 2 + 0.22); g.add(bs); }
  for (const z of [-1.6, 1.4]) g.add(at(windowBox(0.8, 0.9), w / 2 + 0.1, 2.2, z, Math.PI / 2));
  const rk = new THREE.Group(); rk.position.set(w / 2 + 1.6, 0, 1.2); rk.add(box(2.2, 0.1, 0.3, M.woodDark(), 0, 0.9, 0), box(0.12, 1.4, 0.3, M.woodDark(), -1.1, 0, 0), box(0.12, 1.4, 0.3, M.woodDark(), 1.1, 0, 0)); for (let i = 0; i < 5; i++) { rk.add(cyl(0.03, 0.03, 2.8, M.woodDark(), -0.9 + i * 0.45, 0, 0.1, 5)); const t = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.34, 6), M.metal()); t.position.set(-0.9 + i * 0.45, 2.95, 0.1); rk.add(t); } rk.rotation.y = Math.PI / 2; g.add(rk);
  g.add(at(banner(0xa33440, 2.4), -w / 2 - 0.4, 0, d / 2 - 0.4), torch(-1.8, 0.4, d / 2 + 0.5), torch(1.8, 0.4, d / 2 + 0.5));
  g.add(barrel(-w / 2 - 1.0, 1.2, 0.9), crate(-w / 2 - 1.0, -0.2, 0.8, 0.3), soldier(2.6, d / 2 + 2.4, 0.2));
  return g;
}

function hull(len, wid, hgt, mat) {
  const s = new THREE.Shape(); s.moveTo(-len / 2, hgt); s.quadraticCurveTo(-len / 2 + 0.6, 0.1, -len / 4, 0); s.lineTo(len / 4, 0); s.quadraticCurveTo(len / 2 - 0.4, 0.1, len / 2 + 1.1, hgt * 1.15); s.lineTo(-len / 2, hgt); 
  const g = new THREE.ExtrudeGeometry(s, { depth: wid, bevelEnabled: false, steps: 1 }); g.translate(0, 0, -wid / 2);
  const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); const k = 0.55 + 0.45 * (y / hgt); p.setZ(i, p.getZ(i) * Math.min(1, k)); }
  g.computeVertexNormals(); const m = new THREE.Mesh(g, mat); m.castShadow = m.receiveShadow = true; return m;
}
function hull2(len, wid, mat) {
  // side profile: raised stern, low waist, high curved bow
  const sh = new THREE.Shape();
  sh.moveTo(-len / 2, 2.5); sh.quadraticCurveTo(-len / 2 + 1.4, 1.2, 0, 1.15); sh.quadraticCurveTo(len / 2 - 1.5, 1.35, len / 2, 3.0);
  sh.lineTo(len / 2 - 0.35, 3.0); sh.quadraticCurveTo(len / 2 - 0.9, 0.5, len / 2 - 2.2, 0.05); sh.lineTo(-len / 2 + 2.0, 0.05); sh.quadraticCurveTo(-len / 2 + 0.2, 0.6, -len / 2, 2.5);
  const g = new THREE.ExtrudeGeometry(sh, { depth: wid, bevelEnabled: false, steps: 1 }); g.translate(0, 0, -wid / 2);
  const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i), x = p.getX(i); const k = 0.38 + 0.62 * Math.min(1, y / 1.5); const end = 1 - 0.55 * Math.pow(Math.abs(x) / (len / 2), 3); p.setZ(i, p.getZ(i) * Math.min(1, k) * end); }
  g.computeVertexNormals(); const m = new THREE.Mesh(g, mat); m.castShadow = m.receiveShadow = true; return m;
}
export function sailingShip(sails = true) {
  const g = new THREE.Group();
  const L = 9.6, W = 2.9;
  const dark = M.woodDark(); const plank = M.wood([5, 1], 0x6b4528, false);
  g.add(hull2(L, W, plank));
  // painted strakes and gunwale
  for (const s of [-1, 1]) {
    g.add(box(L - 2.4, 0.16, 0.06, M.flat(0xa33440), 0.1, 0.95, s * 1.28));
    g.add(box(L - 2.4, 0.07, 0.07, M.gold(), 0.1, 1.2, s * 1.36));
    g.add(box(L - 2.2, 0.12, 0.12, dark, 0.0, 1.62, s * 1.34));
  }
  // deck, aft castle and fore deck
  g.add(box(L - 3.0, 0.14, 2.3, M.wood([3, 1], 0xa07a48, false), -0.1, 1.45, 0));
  g.add(box(2.4, 0.95, 2.3, M.wood([1, 1], 0x5e3d22), -3.5, 1.5, 0));
  g.add(box(2.6, 0.12, 2.5, M.wood([1, 1], 0x9a7242, false), -3.5, 2.45, 0));
  for (const s of [-1, 1]) { g.add(box(2.5, 0.5, 0.07, dark, -3.5, 2.55, s * 1.2)); }
  g.add(box(0.08, 0.5, 2.4, dark, -4.75, 2.55, 0));
  g.add(box(1.8, 0.7, 2.0, M.wood([1, 1], 0x5e3d22), 3.0, 1.5, 0));
  // shields along the rails
  for (let i = 0; i < 9; i++) for (const s of [-1, 1]) {
    const sx = -1.8 + i * 0.62; const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 14), M.stripe([0xa33440, 0xd4ac4f, 0xede3cc][i % 3], 0x2a2018));
    shield.rotation.x = Math.PI / 2; shield.position.set(sx, 1.95 + (Math.abs(sx) > 2 ? 0.05 : 0), s * 1.42); shield.castShadow = true; g.add(shield);
  }
  // oars
  for (let i = 0; i < 7; i++) for (const s of [-1, 1]) {
    const ang = -s * 0.88; const x = -2.1 + i * 0.7;
    const oar = cyl(0.045, 0.045, 2.4, M.wood([1, 3], 0x9a7242), x, 0.93, s * 2.37, 6); oar.rotation.x = ang; g.add(oar);
    const blade = box(0.26, 0.7, 0.04, M.wood([1, 1], 0x9a7242, false), x, 0.3, s * 3.14); blade.rotation.x = ang; g.add(blade);
  }
  // carved prow, gilded beak, bronze ram, stern post
  const neck = cyl(0.17, 0.22, 1.9, M.gold(), 0, 0, 0, 8); neck.position.set(4.95, 3.35, 0); neck.rotation.z = -0.5; g.add(neck);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 10, 8), M.gold()); head.position.set(5.5, 4.35, 0); head.castShadow = true; g.add(head);
  const snout = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.7, 8), M.gold()); snout.position.set(5.95, 4.3, 0); snout.rotation.z = -Math.PI / 2; g.add(snout);
  const ram = new THREE.Mesh(new THREE.ConeGeometry(0.26, 1.2, 8), M.metal()); ram.position.set(4.35, 0.6, 0); ram.rotation.z = -Math.PI / 2; ram.castShadow = true; g.add(ram);
  const stern = cyl(0.13, 0.17, 1.8, M.gold(), 0, 0, 0, 8); stern.position.set(-4.95, 3.3, 0); stern.rotation.z = 0.35; g.add(stern);
  // masts, yards and bellied square sails
  const mast = (x, h) => { g.add(cyl(0.12, 0.17, h, dark, x, 1.5, 0, 8)); const y = cyl(0.07, 0.07, 4.4, dark, x, 1.5 + h * 0.78, 0, 6); y.rotation.x = Math.PI / 2; g.add(y); return y; };
  mast(0.7, 8.8); mast(-2.3, 6.4);
  const sail = (x, h, w, y0, c1, c2) => { const sl = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 10, 8), M.stripe(c1, c2)); sl.rotation.y = Math.PI / 2; sl.position.set(x + 0.15, y0 + h / 2, 0); const p = sl.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const u = p.getX(i) / (w / 2), v = p.getY(i) / (h / 2); p.setZ(i, 0.55 * (1 - u * u) * (1 - 0.3 * v * v)); } sl.geometry.computeVertexNormals(); sl.castShadow = true; sl.material = sl.material.clone(); sl.material.side = THREE.DoubleSide; return sl; };
  if (sails) { g.add(sail(0.7, 4.8, 4.2, 3.6, 0xa33440, 0xede3cc)); g.add(sail(-2.3, 3.4, 3.4, 3.2, 0xd4ac4f, 0xede3cc)); }
  // rigging
  const line = (x1, y1, x2, y2) => { const dx = x2 - x1, dy = y2 - y1; const l = cyl(0.025, 0.025, Math.hypot(dx, dy), dark, (x1 + x2) / 2, 0, 0, 4); l.position.y = (y1 + y2) / 2; l.rotation.z = -Math.atan2(dx, dy); return l; };
  g.add(line(0.7, 10.2, 4.6, 3.1), line(0.7, 10.2, -4.6, 2.9), line(-2.3, 7.8, 0.7, 9.8), line(-2.3, 7.8, -4.4, 2.6));
  g.add(at(banner(0xa33440, 1.5), 0.7, 10.2, 0), at(banner(0xd4ac4f, 1.1), -2.3, 7.8, 0));
  return g;
}
export function shipyard() {
  const g = new THREE.Group();
  g.add(box(13, 0.4, 9, M.wood([4, 2], 0x7a5a38, false), 0, 0.5, 0));
  for (const [x, z] of [[-6, -4], [6, -4], [-6, 4], [6, 4], [0, -4], [0, 4]]) g.add(cyl(0.22, 0.25, 2.4, M.woodDark(), x, -1.4, z, 8));
  const sh = new THREE.Group(); sh.position.set(-3.6, 0.9, -2.8); const ws = box(4.4, 2.6, 3.4, M.wood([2, 1], 0x6e4a2a, false), 0, 0, 0); sh.add(ws); const sr = gableRoof(4.4, 1.4, 3.4, M.tile([2, 2], 0x46689a), 0.4, 0.2); sr.position.y = 2.6; sh.add(sr); sh.add(at(door(1.2, 1.9), 0, 0, 1.75)); g.add(sh);
  // ship under construction on the slip
  const ship = sailingShip(false); ship.position.set(2.4, 1.0, 1.8); ship.scale.setScalar(0.82); g.add(ship);
  for (let i = 0; i < 6; i++) g.add(box(0.14, 2.2, 0.14, M.woodDark(), -0.8 + i * 1.2, 1.0, 3.3));
  g.add(box(7, 0.14, 0.14, M.woodDark(), 1.8, 3.2, 3.3));
  const crane = new THREE.Group(); crane.position.set(5.2, 0.9, -3.2); crane.add(cyl(0.16, 0.2, 6.2, M.woodDark(), 0, 0, 0, 8)); const arm = box(4.2, 0.18, 0.18, M.woodDark(), -1.8, 5.8, 0); crane.add(arm); const st = box(3.4, 0.1, 0.1, M.woodDark(), -0.9, 4.2, 0); st.rotation.z = -0.8; crane.add(st); crane.add(cyl(0.02, 0.02, 2.2, M.woodDark(), -3.6, 3.6, 0, 4)); crane.add(box(0.9, 0.6, 0.6, M.wood([1, 1], 0x8a6238, false), -3.6, 3.0, 0)); g.add(crane);
  g.add(barrel(4.4, 3.6, 0.8), barrel(5.2, 2.8, 0.7), crate(-5.0, 3.2, 0.9, 0.3), logPile(-5.2, 0.4, 0.4, 6));
  g.add(person(-1, 3.6, 0x6b5a3a, 1));
  return g;
}

export function keepHut() { const g = cottage({ thatch: true }); g.scale.setScalar(0.9); g.add(torch(3.4, 0, 3.6)); return g; }
export function keepHall() {
  const g = new THREE.Group();
  const w = 7.5, d = 11, h = 3.2, rise = 3;
  g.add(box(w + 0.6, 0.5, d + 0.6, M.stone([4, 1]), 0, 0, 0));
  g.add(box(w, 1.2, d, M.stone([4, 1]), 0, 0.5, 0));
  const walls = gableWalls(w, h - 1.2, rise, d, M.plaster([1, 1], 0xe0d3b0)); walls.position.y = 1.7; g.add(walls);
  const wd = M.woodDark(); for (const x of [-w / 2, -w / 4, 0, w / 4, w / 2]) g.add(box(0.22, h - 1.2, 0.16, wd, x, 1.7, d / 2 + 0.04));
  for (const z of [-d / 2, -d / 3, -d / 6, 0, d / 6, d / 3, d / 2]) g.add(box(0.16, h - 1.2, 0.22, wd, w / 2 + 0.04, 1.7, z));
  g.add(box(w, 0.22, 0.16, wd, 0, 1.7, d / 2 + 0.04), box(w, 0.22, 0.16, wd, 0, 1.7 + h - 1.35, d / 2 + 0.04), box(0.16, 0.22, d, wd, w / 2 + 0.04, 1.7, 0), box(0.16, 0.22, d, wd, w / 2 + 0.04, 1.7 + h - 1.35, 0));
  const roof = gableRoof(w, rise, d, M.tile([4, 4], 0xa33440), 0.7, 0.26); roof.position.y = 1.7 + h - 1.2; g.add(roof);
  g.add(at(door(1.6, 2.1), 0, 0.5, d / 2 + 0.1), at(windowBox(1.0, 1.1), -2.2, 2.2, d / 2 + 0.12), at(windowBox(1.0, 1.1), 2.2, 2.2, d / 2 + 0.12));
  for (const z of [-3.6, -1.2, 1.2, 3.6]) g.add(at(windowBox(0.9, 1.0), w / 2 + 0.1, 2.3, z, Math.PI / 2));
  const ch = box(1.0, 4.4, 1.0, M.stone([1, 3]), -w / 2 + 0.8, 1.7 + h - 1.2, -2.6); g.add(ch, smokeFx(-w / 2 + 0.8, 1.7 + h + 3.5, -2.6));
  g.add(at(banner(0xd4ac4f, 2.6), 3.2, 0.5, d / 2 + 1.0), torch(-1.8, 0.5, d / 2 + 0.6));
  g.add(person(-2.8, d / 2 + 2, 0x2f4a7a, 0.4), person(2.2, d / 2 + 2.4, 0x7a3a2a, -0.3));
  return g;
}
function roundTower(x, z, r, h, roofColor = 0x46689a) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  g.add(cyl(r, r * 1.08, h, M.stone([6, 3]), 0, 0, 0, 20)); g.add(cyl(r * 1.18, r * 1.18, 0.5, M.stoneDark([6, 1]), 0, h, 0, 20));
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; g.add(box(0.6, 0.7, 0.6, M.stone([1, 1]), Math.sin(a) * r * 1.1, h + 0.5, Math.cos(a) * r * 1.1)); }
  const roof = new THREE.Mesh(new THREE.ConeGeometry(r * 1.05, r * 1.8, 20), M.tile([4, 2], roofColor)); roof.position.y = h + 1.6; roof.castShadow = true; g.add(roof);
  g.add(at(slitWindow(0, h * 0.6, 0, 0), 0, 0, r + 0.02)); g.add(at(slitWindow(0, h * 0.6, 0, Math.PI / 2), r + 0.02, 0, 0));
  g.add(at(banner(0xa33440, 1.6), 0, h + 3.6, 0));
  return g;
}
export function keepCastle(big = false) {
  const g = new THREE.Group();
  const s = 14;
  g.add(box(s + 1, 0.5, s + 1, M.stone([6, 1]), 0, 0, 0));
  // curtain walls
  g.add(box(s, 4.0, 1.4, M.stone([5, 2]), 0, 0.5, s / 2), box(s, 4.0, 1.4, M.stone([5, 2]), 0, 0.5, -s / 2), box(1.4, 4.0, s, M.stone([5, 2]), s / 2, 0.5, 0), box(1.4, 4.0, s, M.stone([5, 2]), -s / 2, 0.5, 0));
  for (let i = 0; i < 9; i++) { const x = -s / 2 + 0.8 + i * 1.55; for (const z of [s / 2 + 0.5, -s / 2 - 0.5]) g.add(box(0.8, 0.8, 0.4, M.stoneDark([1, 1]), x, 4.5, z)); for (const xx of [s / 2 + 0.5, -s / 2 - 0.5]) g.add(box(0.4, 0.8, 0.8, M.stoneDark([1, 1]), xx, 4.5, x)); }
  // gatehouse on +z
  g.add(box(4.6, 5.6, 2.6, M.stone([3, 2]), 0, 0.5, s / 2 + 0.5)); g.add(box(5.0, 0.4, 3.0, M.stoneDark([3, 1]), 0, 6.1, s / 2 + 0.5));
  for (let i = 0; i < 5; i++) g.add(box(0.7, 0.8, 0.7, M.stone([1, 1]), -1.9 + i * 0.95, 6.5, s / 2 + 1.7));
  const gate = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.2, 0.3), M.wood([1, 1], 0x4a3322)); gate.position.set(0, 2.1, s / 2 + 1.85); g.add(gate);
  const arch = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.3, 16, 1, false, 0, Math.PI), M.wood([1, 1], 0x4a3322)); arch.rotation.x = Math.PI / 2; arch.rotation.z = Math.PI / 2; arch.position.set(0, 3.7, s / 2 + 1.85); g.add(arch);
  for (let i = -3; i <= 3; i += 2) g.add(box(0.1, 3.8, 0.34, M.metal(), i * 0.3, 0.5, s / 2 + 1.9));
  g.add(torch(-2.0, 0.5, s / 2 + 2.3), torch(2.0, 0.5, s / 2 + 2.3));
  // corner towers
  for (const [x, z] of [[-s / 2, -s / 2], [s / 2, -s / 2], [-s / 2, s / 2], [s / 2, s / 2]]) g.add(roundTower(x, z, 2.1, 7.2));
  // central keep
  const k = new THREE.Group(); k.add(box(6, 9, 6, M.stoneL ? M.stone([4, 4]) : M.stone([4, 4]), 0, 0.5, 0), box(6.6, 0.4, 6.6, M.stoneDark([4, 1]), 0, 9.5, 0));
  for (let i = 0; i < 6; i++) for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const px = dx ? dx * 3.1 : -2.5 + i * 1.0; const pz = dz ? dz * 3.1 : -2.5 + i * 1.0; k.add(box(dx ? 0.5 : 0.7, 0.8, dz ? 0.5 : 0.7, M.stone([1, 1]), px, 9.9, pz)); }
  k.add(at(archWindow(0.9, 2.2), -1.3, 3.0, 3.06), at(archWindow(0.9, 2.2), 1.3, 3.0, 3.06), at(archWindow(0.9, 2.2), -1.3, 6.4, 3.06), at(archWindow(0.9, 2.2), 1.3, 6.4, 3.06), at(archWindow(0.9, 2.2), 3.06, 3.0, 0, Math.PI / 2), at(archWindow(0.9, 2.2), 3.06, 6.4, 0, Math.PI / 2));
  k.add(at(banner(0xd4ac4f, 3.0), 0, 9.9, 0)); g.add(k);
  if (big) for (const x of [-s / 2 - 3.4, s / 2 + 3.4]) { g.add(box(5.6, 3.2, 1.2, M.stone([3, 1]), x, 0.5, s / 2 - 1)); }
  g.add(soldier(-1.6, s / 2 + 4.0, 0.1), soldier(1.6, s / 2 + 4.0, -0.1, 0xd4ac4f));
  return g;
}

BUILDINGS.farm = farm; BUILDINGS.timber = timber; BUILDINGS.quarry = quarry; BUILDINGS.workshop = workshop; BUILDINGS.market = market; BUILDINGS.library = library; BUILDINGS.academy = academy; BUILDINGS.bureau = bureau; BUILDINGS.armoury = armoury; BUILDINGS.shipyard = shipyard; BUILDINGS.ship = () => sailingShip(true); 

// ---------- terrain ----------
import { sandTexture } from './lib.js';
const R2 = Math.SQRT2;
export const toWorld = (sx, sd) => [(sx + sd) / R2, (sd - sx) / R2];
const SC = 1.2;
const sc2 = (a) => a.map(([x, y]) => [x * SC, y * SC]);
export const ISLAND = sc2([[-31, -2], [-30, -11], [-23, -19], [-10, -24], [6, -25], [20, -22], [29, -14], [31, -5], [30, 1], [26, 7], [21, 12], [14, 17], [6, 19], [-8, 19], [-20, 17], [-29, 11], [-31, 4]]);
export const ROADS = [
  [[0, -8], [0, -2], [-1, 4], [0, 10], [0, 18]],
  [[-1, 4], [-11, 3], [-17, 8], [-18, 13]],
  [[0, 2], [11, 1], [14, 4], [18, 8]],
  [[0, 10], [10, 11], [18, 10]],
  [[17, 9], [24, 7], [28, 6]],
  [[-11, 2], [-22, -2], [-26, 4]],
].map((l) => sc2(l));
function smoothPoly(pts, n = 4) { const out = []; const L = pts.length; for (let i = 0; i < L; i++) { const p0 = pts[(i - 1 + L) % L], p1 = pts[i], p2 = pts[(i + 1) % L], p3 = pts[(i + 2) % L]; for (let t = 0; t < n; t++) { const u = t / n; const f = (a, b, c, d) => 0.5 * ((2 * b) + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u); out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]); } } return out; }
export function terrain() {
  const g = new THREE.Group(); const r = rng(77);
  const poly = smoothPoly(ISLAND).map(([sx, sd]) => { const [x, z] = toWorld(sx, sd); return [x, z]; });
  const mk = (pts, depth, mats, bevel = 0.5) => { const s = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z))); const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel * 0.6, bevelSegments: 3, curveSegments: 1 }); geo.rotateX(-Math.PI / 2); geo.translate(0, -depth, 0);
    const p = geo.attributes.position, n = geo.attributes.normal, uv = geo.attributes.uv; for (let i = 0; i < p.count; i++) { if (Math.abs(n.getY(i)) > 0.6) uv.setXY(i, p.getX(i) / 9, p.getZ(i) / 9); else uv.setXY(i, (p.getX(i) + p.getZ(i)) / 7, p.getY(i) / 4); }
    const m = new THREE.Mesh(geo, mats); m.receiveShadow = true; m.castShadow = true; return m; };
  const cliffMat = M.rock([1, 1]); const top = M.ground([1, 1]);
  const land = mk(poly, 3.4, [top, cliffMat], 0.4); land.position.y = -0.24; g.add(land);
  // sand shore, a little lower and wider
  const sc = poly.map(([x, z]) => { const l = Math.hypot(x, z) || 1; return [x * 1.045, z * 1.05]; });
  // sea
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(220, 220), M.water()); sea.rotation.x = -Math.PI / 2; sea.position.y = -3.0; sea.receiveShadow = true; g.add(sea);
  // roads
  const roadMat = M.dirt([1, 1]).clone(); roadMat.side = THREE.DoubleSide; roadMat.polygonOffset = true; roadMat.polygonOffsetFactor = -2;
  for (const line of ROADS) {
    const pts = smoothPoly(line.concat([line[line.length - 1]]).slice(0, line.length), 1);
    const sm = []; for (let i = 0; i < line.length - 1; i++) for (let t = 0; t < 6; t++) { const u = t / 6; sm.push([line[i][0] + (line[i + 1][0] - line[i][0]) * u, line[i][1] + (line[i + 1][1] - line[i][1]) * u]); } sm.push(line[line.length - 1]);
    const left = [], right = []; for (let i = 0; i < sm.length; i++) { const a = sm[Math.max(0, i - 1)], b = sm[Math.min(sm.length - 1, i + 1)]; let dx = b[0] - a[0], dd = b[1] - a[1]; const l = Math.hypot(dx, dd) || 1; dx /= l; dd /= l; const w = 1.2 + 0.2 * Math.sin(i * 1.7); left.push([sm[i][0] - dd * w, sm[i][1] + dx * w]); right.push([sm[i][0] + dd * w, sm[i][1] - dx * w]); }
    const pos = [], uvs = [], idx = [];
    for (let i = 0; i < left.length; i++) { for (const q of [left[i], right[i]]) { const [x, z] = toWorld(q[0], q[1]); pos.push(x, 0, z); uvs.push(x / 5, z / 5); } }
    for (let i = 0; i < left.length - 1; i++) { const a0 = i * 2; idx.push(a0, a0 + 1, a0 + 2, a0 + 1, a0 + 3, a0 + 2); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); geo.setIndex(idx); geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, roadMat); m.position.y = 0.06; m.receiveShadow = true; g.add(m);
    for (const q of sm.filter((_, i) => i % 2 === 0)) { const [x, z] = toWorld(q[0], q[1]); const pb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.12 + ((x * 7 + z * 3) % 1 + 1) % 1 * 0.12, 0), M.flat(0x7a6a50)); pb.position.set(x + ((x * 13) % 1) * 1.8 - 0.9, 0.1, z + ((z * 11) % 1) * 1.8 - 0.9); g.add(pb); }
  }
  return g;
}
export function decor() {
  const g = new THREE.Group(); const r = rng(5);
  const spots = [[-29, -8, 1.4, 'pine'], [-27, -15, 1.5, 'pine'], [-18, -21, 1.3, 'pine'], [-6, -23, 1.4, 'pine'], [10, -23, 1.5, 'pine'], [24, -18, 1.3, 'oak'], [30, -10, 1.4, 'pine'], [-31, 1, 1.2, 'oak'], [-28, 12, 1.3, 'oak'], [-12, 17, 1.2, 'oak'], [4, 17, 1.1, 'oak'], [14, 15, 1.2, 'oak'], [-23, 16, 1.2, 'pine'], [-33, -4, 1.2, 'pine'], [-14, -18, 1.1, 'pine'], [12, -20, 1.2, 'pine']];
  for (const [sx0, sd0, s, k] of spots) { const [x, z] = toWorld(sx0 * SC, sd0 * SC); g.add(tree(x, z, s, k, 9)); }
  for (let i = 0; i < 26; i++) { const a = r() * 6.28, rr = 0.5 + r() * 0.45; const sx = Math.cos(a) * 34 * rr, sd = Math.sin(a) * 24 * rr - 2; const [x, z] = toWorld(sx, sd); const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4 + r() * 0.3, 0), new THREE.MeshStandardMaterial({ color: r() < 0.5 ? 0x4c7a3c : 0x587f48, roughness: 1, flatShading: true })); b.position.set(x, 0.3, z); b.scale.y = 0.7; b.castShadow = true; g.add(b); }
  return g;
}
BUILDINGS.terrain = () => { const g = new THREE.Group(); g.add(terrain(), decor()); return g; };

const scaled = (f, k) => () => { const g = f(); g.scale.setScalar(k); return g; };
BUILDINGS.keep0 = keepHut; BUILDINGS.keep1 = scaled(keepHall, 0.9); BUILDINGS.keep2 = scaled(() => keepCastle(false), 0.78); BUILDINGS.keep3 = scaled(() => keepCastle(true), 0.82);

// ---------- battlefield ----------
import { infantry, rider, FWD as FWD2 } from './soldiers.js';
const SIDE = { p: { cloak: 0x24407a }, e: { cloak: 0x8e2b2f } };
const FWD = FWD2;
const mat = (c, extra = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, ...extra });
export function regiment(kind, side) {
  const g = new THREE.Group(); const r = rng(kind.length * 31 + (side === 'p' ? 1 : 7));
  const cfg = { spearmen: [5, 2, 1.2, 1.9], archers: [5, 2, 1.25, 2.0], heavy: [4, 2, 1.4, 1.9], cavalry: [2, 2, 2.3, 3.2] }[kind];
  const [cols, rows, dx, dd] = cfg;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const sx = (i - (cols - 1) / 2) * dx + (r() - 0.5) * 0.18; const sd = (j - (rows - 1) / 2) * dd + (r() - 0.5) * 0.18;
    const f = kind === 'cavalry' ? rider(side, 101 + i * 7 + j * 13) : infantry(kind, side, 11 + i * 5 + j * 17 + kind.length);
    const [x, z] = toWorld(sx, sd); f.position.set(x, 0, z); g.add(f);
  }
  // a standard bearer at the rear centre of infantry blocks
  if (kind !== 'archers') { const [bx, bz] = toWorld(0, (side === 'p' ? 1 : -1) * (rows / 2 * dd + 0.8)); const b = banner(SIDE[side].cloak, 2.2, 0.8); b.position.set(bx, 0, bz); b.rotation.y = FWD[side] + Math.PI / 2; g.add(b); }
  g.scale.setScalar(1.5);
  return g;
}
for (const k of ['spearmen', 'archers', 'cavalry', 'heavy']) for (const s of ['p', 'e']) BUILDINGS[`u_${k}_${s}`] = () => regiment(k, s);
BUILDINGS.palisade = () => { const g = new THREE.Group(); for (let i = 0; i < 9; i++) { const [x, z] = toWorld(-5.2 + i * 1.3, 0); for (const sgn of [0]) { const p = cyl(0.13, 0.15, 1.5, M.wood([1, 1], 0x6b4a2a), x, 0, z, 7); g.add(p); const t = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.55, 7), M.wood([1, 1], 0x6b4a2a)); t.position.set(x, 1.75, z); t.castShadow = true; g.add(t); } } const [a, b] = toWorld(0, 0.4); const [c, d] = toWorld(0, -0.4); return g; };

function scatter(g, n, seed, fn, area = [18, 20]) { const r = rng(seed); for (let i = 0; i < n; i++) { const sx = (r() - 0.5) * 2 * area[0], sd = (r() - 0.5) * 2 * area[1]; const o = fn(r, sx, sd); if (!o) continue; const [x, z] = toWorld(sx, sd); o.position.x += x; o.position.z += z; g.add(o); } }
function groundPlane(material) { const m = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), material); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; return m; }
function mound(r, sx, sd, big = 1, mt = M.ground([1, 1])) { const m = new THREE.Mesh(new THREE.SphereGeometry(5 * big, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), mt); m.scale.set(1.2, 0.5 + r() * 0.25, 1); m.castShadow = m.receiveShadow = true; return m; }
function rockO(r, s = 1) { const m = new THREE.Mesh(new THREE.DodecahedronGeometry((0.5 + r() * 0.8) * s, 0), M.rock([1, 1])); m.position.y = 0.3; m.scale.y = 0.7; m.rotation.set(r() * 3, r() * 3, r() * 3); m.castShadow = true; return m; }
function bush(r, c = 0x4c7a3c) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5 + r() * 0.4, 1), new THREE.MeshStandardMaterial({ color: c, roughness: 1, flatShading: true })); m.position.y = 0.35; m.scale.y = 0.75; m.castShadow = true; return m; }
function palm(r) { const g = new THREE.Group(); const t = cyl(0.14, 0.22, 3.4, M.wood([1, 1], 0x7a5a38), 0, 0, 0, 6); t.rotation.z = (r() - 0.5) * 0.25; g.add(t); for (let i = 0; i < 7; i++) { const l = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 2.0), mat(0x4a7a3a, { side: THREE.DoubleSide })); l.position.set(Math.cos(i) * 0.9, 3.4, Math.sin(i) * 0.9); l.rotation.set(-1.0, -i, 0); l.castShadow = true; g.add(l); } return g; }
function cactus() { const g = new THREE.Group(); const m = mat(0x4c7a4a); g.add(cyl(0.22, 0.25, 1.8, m, 0, 0, 0, 8)); g.add(cyl(0.14, 0.14, 0.8, m, 0.4, 0.7, 0, 6)); return g; }
function duneO(r) { const m = new THREE.Mesh(new THREE.SphereGeometry(4.5, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), M.sand()); m.scale.set(1.2 + r() * 0.6, 0.2 + r() * 0.12, 1.0); m.rotation.y = r() * 3; m.castShadow = m.receiveShadow = true; return m; }

export function field(kind) {
  const g = new THREE.Group();
  if (kind === 'desert') {
    g.add(groundPlane(M.sand()));
    scatter(g, 7, 11, (r, sx, sd) => (Math.abs(sx) < 11 && Math.abs(sd) < 10 ? null : duneO(r)), [21, 22]);
    scatter(g, 14, 12, (r) => rockO(r), [20, 22]); scatter(g, 10, 14, () => cactus(), [20, 20]); scatter(g, 5, 15, (r) => { const d = new THREE.Group(); d.add(cyl(0.12, 0.2, 2.6, M.wood([1, 1], 0x6a5236), 0, 0, 0, 6)); const b = cyl(0.07, 0.1, 1.2, M.wood([1, 1], 0x6a5236), 0.5, 1.5, 0, 5); b.rotation.z = -0.9; d.add(b); return d; }, [20, 20]);
  } else if (kind === 'forest') {
    g.add(groundPlane(M.ground([1, 1])));
    scatter(g, 60, 21, (r, sx, sd) => (Math.abs(sx) < 11 && Math.abs(sd) < 15 ? null : tree(0, 0, 1.1 + r() * 0.5, r() < 0.7 ? 'pine' : 'oak', 3 + (r() * 9 | 0))), [21, 22]);
    scatter(g, 30, 22, (r, sx, sd) => (Math.abs(sx) < 9 && Math.abs(sd) < 12 ? null : bush(r)), [20, 21]);
    scatter(g, 8, 23, (r) => { const l = cyl(0.3, 0.3, 3, M.wood([1, 2], 0x6e4a2a), 0, 0.3, 0, 8); l.rotation.set(Math.PI / 2, 0, r() * 3); return l; }, [14, 16]);
  } else if (kind === 'hills') {
    g.add(groundPlane(M.ground([1, 1])));
    scatter(g, 14, 31, (r, sx, sd) => ((Math.abs(sx) < 12 && sd > -12) ? null : mound(r, sx, sd, 0.45 + r() * 0.4)), [21, 21]);
    scatter(g, 16, 32, (r) => rockO(r, 1.2), [20, 21]); scatter(g, 14, 33, (r, sx, sd) => (Math.abs(sd) < 8 ? null : tree(0, 0, 1 + r() * 0.4, 'pine', 4)), [21, 21]);
  } else if (kind === 'river') {
    g.add(groundPlane(M.ground([1, 1])));
    const [cx, cz] = toWorld(0, -7);
    const bank = new THREE.Mesh(new THREE.PlaneGeometry(60, 9), M.sand()); bank.rotation.x = -Math.PI / 2; bank.rotation.z = Math.PI / 4; bank.position.set(cx, 0.03, cz); bank.receiveShadow = true; g.add(bank);
    const wat = new THREE.Mesh(new THREE.PlaneGeometry(60, 6), M.water()); wat.rotation.x = -Math.PI / 2; wat.rotation.z = Math.PI / 4; wat.position.set(cx, 0.06, cz); wat.receiveShadow = true; g.add(wat);
    { const [bx, bz] = toWorld(0, -7); const deck = box(3.4, 0.3, 11, M.wood([1, 3], 0x8a6238, true), 0, 0.25, 0); deck.position.x = bx; deck.position.z = bz; deck.rotation.y = Math.PI / 4; g.add(deck); for (const sgn of [-1, 1]) { const [rx, rz] = toWorld(sgn * 1.65, -7); const rail = box(0.12, 0.5, 11, M.woodDark(), rx, 0.55, rz); rail.rotation.y = Math.PI / 4; g.add(rail); for (const dd of [-4.5, -1.5, 1.5, 4.5]) { const [px, pz] = toWorld(sgn * 1.65, -7 + dd); g.add(cyl(0.1, 0.1, 1.0, M.woodDark(), px, 0.3, pz, 6)); } } }
    scatter(g, 22, 41, (r, sx, sd) => ((sd > -13 && sd < 0) || Math.abs(sx) < 8 ? null : tree(0, 0, 1 + r() * 0.5, 'oak', 6)), [21, 22]); scatter(g, 20, 42, (r) => bush(r), [20, 21]);
  } else { // plain
    g.add(groundPlane(M.ground([1, 1])));
    for (const [sx, sd] of [[-16, -12], [15, -16], [-17, 14]]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(9, 6), M.field()); const [x, z] = toWorld(sx, sd); f.rotation.x = -Math.PI / 2; f.rotation.z = Math.PI / 4; f.position.set(x, 0.03, z); f.receiveShadow = true; g.add(f); }
    scatter(g, 16, 51, (r, sx, sd) => (Math.abs(sx) < 13 && Math.abs(sd) < 16 ? null : tree(0, 0, 1.1 + r() * 0.4, 'oak', 7)), [21, 22]); scatter(g, 24, 52, (r) => bush(r, 0x6b8a4a), [20, 21]);
    const hs = haystack(0, 0, 1); const [hx, hz] = toWorld(-12, -14); hs.position.set(hx, 0, hz); g.add(hs); const fh = cottage({ thatch: true }); fh.scale.setScalar(0.7); const [fx, fz] = toWorld(17, -17); fh.position.set(fx, 0, fz); g.add(fh);
  }
  return g;
}
for (const k of ['plain', 'forest', 'hills', 'river', 'desert']) BUILDINGS[`field_${k}`] = () => field(k);
