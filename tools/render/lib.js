import * as THREE from './node_modules/three/build/three.module.js';
export { THREE };

// ---------- deterministic random ----------
export function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ---------- procedural textures ----------
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function noise(ctx, w, h, amt, r) {
  const d = ctx.getImageData(0, 0, w, h); const a = d.data;
  for (let i = 0; i < a.length; i += 4) { const n = (r() - 0.5) * amt; a[i] += n; a[i + 1] += n; a[i + 2] += n; }
  ctx.putImageData(d, 0, 0);
}
function tex(c, rx = 1, ry = 1, srgb = true) {
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 4;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t;
}
const hex = (h, k = 1) => { const r = (h >> 16) & 255, g = (h >> 8) & 255, b = h & 255; return `rgb(${Math.max(0, Math.min(255, r * k)) | 0},${Math.max(0, Math.min(255, g * k)) | 0},${Math.max(0, Math.min(255, b * k)) | 0})`; };

export function stoneTexture(base = 0x8d8c88, seed = 1, rows = 8) {
  const W = 512, H = 512, c = canvas(W, H), x = c.getContext('2d'), r = rng(seed);
  x.fillStyle = '#5a5852'; x.fillRect(0, 0, W, H);
  const rh = H / rows;
  for (let j = 0; j < rows; j++) {
    let px = -r() * 40;
    while (px < W) {
      const bw = 44 + r() * 56; const k = 0.78 + r() * 0.4;
      const tint = r() < 0.2 ? 0x8a7f70 : base;
      x.fillStyle = hex(tint, k); x.fillRect(px + 2, j * rh + 2, bw - 3, rh - 3);
      const g = x.createLinearGradient(0, j * rh, 0, (j + 1) * rh); g.addColorStop(0, 'rgba(255,255,255,0.18)'); g.addColorStop(1, 'rgba(0,0,0,0.22)');
      x.fillStyle = g; x.fillRect(px + 2, j * rh + 2, bw - 3, rh - 3);
      px += bw;
    }
  }
  noise(x, W, H, 38, r); return c;
}
export function plasterTexture(base = 0xe6d9ba, seed = 2) {
  const W = 256, H = 256, c = canvas(W, H), x = c.getContext('2d'), r = rng(seed);
  x.fillStyle = hex(base); x.fillRect(0, 0, W, H);
  for (let i = 0; i < 60; i++) { x.fillStyle = `rgba(${r() < 0.5 ? '120,100,70' : '255,250,235'},${0.04 + r() * 0.06})`; x.beginPath(); x.ellipse(r() * W, r() * H, 10 + r() * 40, 8 + r() * 30, r() * 3, 0, 7); x.fill(); }
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(60,45,25,0.22)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  noise(x, W, H, 22, r); return c;
}
export function woodTexture(base = 0x7a5232, seed = 3, vertical = true) {
  const W = 256, H = 256, c = canvas(W, H), x = c.getContext('2d'), r = rng(seed);
  const n = 8; const pw = W / n;
  for (let i = 0; i < n; i++) {
    x.fillStyle = hex(base, 0.78 + r() * 0.4); x.fillRect(i * pw, 0, pw, H);
    for (let k = 0; k < 14; k++) { x.strokeStyle = `rgba(30,18,8,${0.08 + r() * 0.14})`; x.lineWidth = 0.6 + r(); x.beginPath(); const gx = i * pw + r() * pw; x.moveTo(gx, 0); x.bezierCurveTo(gx + (r() - 0.5) * 6, H * 0.3, gx + (r() - 0.5) * 6, H * 0.7, gx + (r() - 0.5) * 4, H); x.stroke(); }
    x.fillStyle = 'rgba(0,0,0,0.5)'; x.fillRect(i * pw, 0, 1.5, H);
  }
  noise(x, W, H, 24, r);
  if (!vertical) { const c2 = canvas(W, H), x2 = c2.getContext('2d'); x2.translate(W / 2, H / 2); x2.rotate(Math.PI / 2); x2.drawImage(c, -W / 2, -H / 2); return c2; }
  return c;
}
export function tileTexture(base = 0xa8482e, seed = 4) {
  const W = 256, H = 256, c = canvas(W, H), x = c.getContext('2d'), r = rng(seed);
  x.fillStyle = '#2a1a14'; x.fillRect(0, 0, W, H);
  const rows = 8, cols = 8, th = H / rows, tw = W / cols;
  for (let j = 0; j < rows; j++) for (let i = 0; i <= cols; i++) {
    const ox = (j % 2) * tw / 2; const k = 0.78 + r() * 0.42;
    const px = i * tw - ox, py = j * th;
    x.fillStyle = hex(base, k); x.beginPath(); x.moveTo(px, py); x.lineTo(px + tw - 1, py); x.lineTo(px + tw - 1, py + th * 0.7); x.quadraticCurveTo(px + tw / 2, py + th * 1.25, px, py + th * 0.7); x.closePath(); x.fill();
    const g = x.createLinearGradient(0, py, 0, py + th); g.addColorStop(0, 'rgba(0,0,0,0.35)'); g.addColorStop(0.5, 'rgba(255,255,255,0.06)'); g.addColorStop(1, 'rgba(0,0,0,0.25)'); x.fillStyle = g; x.fill();
  }
  noise(x, W, H, 26, r); return c;
}
export function thatchTexture(seed = 5) {
  const W = 256, H = 256, c = canvas(W, H), x = c.getContext('2d'), r = rng(seed);
  x.fillStyle = '#8a6a30'; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 1400; i++) { const k = 0.7 + r() * 0.7; x.strokeStyle = hex(0xc9a24c, k); x.lineWidth = 0.7 + r() * 0.8; const sx = r() * W, sy = r() * H; x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx + (r() - 0.5) * 5, sy + 14 + r() * 22); x.stroke(); }
  for (let j = 1; j < 6; j++) { x.fillStyle = 'rgba(40,28,10,0.35)'; x.fillRect(0, j * 44 + r() * 6, W, 3); }
  noise(x, W, H, 24, r); return c;
}
export function groundTexture(seed = 6) {
  const W = 512, H = 512, c = canvas(W, H), x = c.getContext('2d'), r = rng(seed);
  x.fillStyle = '#4b6a3a'; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 900; i++) { x.fillStyle = r() < 0.5 ? `rgba(110,140,70,${0.1 + r() * 0.2})` : `rgba(30,55,25,${0.1 + r() * 0.2})`; x.beginPath(); x.ellipse(r() * W, r() * H, 4 + r() * 12, 3 + r() * 8, r() * 3, 0, 7); x.fill(); }
  noise(x, W, H, 24, r); return c;
}
export function dirtTexture(seed = 7) {
  const W = 256, H = 256, c = canvas(W, H), x = c.getContext('2d'), r = rng(seed);
  x.fillStyle = '#9b8359'; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 400; i++) { x.fillStyle = `rgba(${r() < 0.5 ? '70,55,35' : '200,180,140'},${0.08 + r() * 0.15})`; x.beginPath(); x.ellipse(r() * W, r() * H, 2 + r() * 8, 2 + r() * 6, r() * 3, 0, 7); x.fill(); }
  noise(x, W, H, 30, r); return c;
}
export function clothTexture(color, seed = 8) {
  const W = 128, H = 128, c = canvas(W, H), x = c.getContext('2d'), r = rng(seed);
  x.fillStyle = hex(color); x.fillRect(0, 0, W, H);
  for (let i = 0; i < W; i += 3) { x.fillStyle = `rgba(0,0,0,${0.05 + r() * 0.05})`; x.fillRect(i, 0, 1, H); }
  noise(x, W, H, 16, r); return c;
}

// ---------- materials ----------
const cache = {};
function mat(key, make) { return cache[key] ?? (cache[key] = make()); }
export const M = {
  stone: (rep = [2, 1]) => mat('stone' + rep, () => new THREE.MeshStandardMaterial({ map: tex(stoneTexture(), ...rep), roughness: 0.95, bumpMap: tex(stoneTexture(0x888888, 1), ...rep, false), bumpScale: 1.4 })),
  stoneDark: (rep = [2, 1]) => mat('stoneD' + rep, () => new THREE.MeshStandardMaterial({ map: tex(stoneTexture(0x6a6a68, 9, 6), ...rep), roughness: 0.95 })),
  plaster: (rep = [2, 1], base = 0xe6d9ba) => mat('plaster' + rep + base, () => new THREE.MeshStandardMaterial({ map: tex(plasterTexture(base), ...rep), roughness: 0.95 })),
  wood: (rep = [1, 1], base = 0x7a5232, vertical = true) => mat('wood' + rep + base + vertical, () => new THREE.MeshStandardMaterial({ map: tex(woodTexture(base, 3, vertical), ...rep), roughness: 0.85 })),
  woodDark: () => mat('woodD', () => new THREE.MeshStandardMaterial({ color: 0x3c2614, roughness: 0.9 })),
  tile: (rep = [3, 2], base = 0xa8482e) => mat('tile' + rep + base, () => new THREE.MeshStandardMaterial({ map: tex(tileTexture(base), ...rep), roughness: 0.8 })),
  slate: (rep = [3, 2]) => mat('slate' + rep, () => new THREE.MeshStandardMaterial({ map: tex(tileTexture(0x4a5666, 11), ...rep), roughness: 0.7 })),
  thatch: (rep = [2, 1.5]) => mat('thatch' + rep, () => new THREE.MeshStandardMaterial({ map: tex(thatchTexture(), ...rep), roughness: 1 })),
  glow: (c = 0xffc267) => new THREE.MeshStandardMaterial({ color: 0x2a1c0c, emissive: c, emissiveIntensity: 1.6, roughness: 0.4 }),
  cloth: (color) => mat('cloth' + color, () => new THREE.MeshStandardMaterial({ map: tex(clothTexture(color), 1, 1), roughness: 0.9, side: THREE.DoubleSide })),
  metal: () => mat('metal', () => new THREE.MeshStandardMaterial({ color: 0x8c9099, metalness: 0.7, roughness: 0.4 })),
  gold: () => mat('gold', () => new THREE.MeshStandardMaterial({ color: 0xd4ac4f, metalness: 0.8, roughness: 0.35 })),
  ground: (rep = [3, 3]) => mat('ground' + rep, () => new THREE.MeshStandardMaterial({ map: tex(groundTexture(), ...rep), roughness: 1 })),
  dirt: (rep = [2, 2]) => mat('dirt' + rep, () => new THREE.MeshStandardMaterial({ map: tex(dirtTexture(), ...rep), roughness: 1 })),
};

// ---------- geometry helpers ----------
export function box(w, h, d, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material); m.position.set(x, y + h / 2, z); m.castShadow = m.receiveShadow = true; return m;
}
export function cyl(rt, rb, h, material, x = 0, y = 0, z = 0, seg = 12) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), material); m.position.set(x, y + h / 2, z); m.castShadow = m.receiveShadow = true; return m;
}
/** Walls with gable ends: a rectangle plus a triangle, extruded along z. Width w (x), wall height h, roof rise r, depth d (z). */
export function gableWalls(w, h, r, d, material) {
  const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h); s.lineTo(0, h + r); s.lineTo(-w / 2, h); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2);
  // world-scale UVs so textures don't stretch
  const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) { const nx = Math.abs(n.getX(i)), nz = Math.abs(n.getZ(i)); if (nz > 0.5) uv.setXY(i, p.getX(i) / 6, p.getY(i) / 6); else uv.setXY(i, p.getZ(i) / 6, p.getY(i) / 6); }
  const m = new THREE.Mesh(g, material); m.castShadow = m.receiveShadow = true; return m;
}
/** A gable roof: two slabs with overhang. Ridge runs along z. */
export function gableRoof(w, rise, d, material, over = 0.5, thick = 0.22) {
  const g = new THREE.Group();
  const half = w / 2 + over; const slope = Math.hypot(half, rise); const ang = Math.atan2(rise, half);
  for (const sgn of [-1, 1]) {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(slope, thick, d + over * 2), material);
    slab.castShadow = slab.receiveShadow = true;
    slab.position.set(sgn * (half / 2), rise / 2 + thick * 0.6, 0); slab.rotation.z = -sgn * ang;
    g.add(slab);
  }
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, d + over * 2 + 0.1), M.woodDark()); ridge.position.set(0, rise + thick * 0.6 + 0.04, 0); ridge.castShadow = true; g.add(ridge);
  return g;
}
export function windowBox(w, h, lit = true) {
  const g = new THREE.Group();
  g.add(box(w + 0.3, h + 0.3, 0.16, M.woodDark(), 0, 0, 0));
  g.add(box(w, h, 0.2, lit ? M.glow() : new THREE.MeshStandardMaterial({ color: 0x1d2a3d, roughness: 0.3 }), 0, 0, 0.02));
  g.add(box(0.08, h, 0.24, M.woodDark(), 0, 0, 0.04)); g.add(box(w, 0.08, 0.24, M.woodDark(), 0, h / 2 - 0.04, 0.04));
  g.add(box(w * 0.42, h + 0.1, 0.12, M.wood([1, 1], 0x5a3a20), -w * 0.78, -0.04, 0.0)); g.add(box(w * 0.42, h + 0.1, 0.12, M.wood([1, 1], 0x5a3a20), w * 0.78, -0.04, 0.0));
  if (lit) { const l = new THREE.PointLight(0xffb85a, 0.5, 4, 2); l.position.set(0, h / 2, 0.8); g.add(l); }
  return g;
}
export function door(w, h) {
  const g = new THREE.Group();
  g.add(box(w + 0.4, h + 0.3, 0.18, M.stone([1, 1]), 0, 0, 0));
  g.add(box(w, h, 0.24, M.wood([1, 1], 0x5e3d22), 0, 0, 0.03));
  for (const yy of [0.25, 0.7]) g.add(box(w, 0.1, 0.28, M.metal(), 0, h * yy, 0.04));
  const k = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), M.gold()); k.position.set(w * 0.3, h * 0.5, 0.2); g.add(k);
  return g;
}
export function banner(color, h = 2.4, w = 0.9) {
  const g = new THREE.Group();
  g.add(cyl(0.05, 0.06, h + 0.6, M.woodDark(), 0, 0, 0, 6));
  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(w, h * 0.7, 6, 6), M.cloth(color)); cloth.position.set(w / 2 + 0.05, h * 0.8, 0); cloth.castShadow = true;
  const p = cloth.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 5 + p.getY(i) * 2) * 0.07); cloth.geometry.computeVertexNormals();
  g.add(cloth);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.3, 6), M.gold()); tip.position.y = h + 0.75; g.add(tip);
  return g;
}
export function torch(x, y, z) {
  const g = new THREE.Group(); g.position.set(x, y, z);
  g.add(cyl(0.05, 0.05, 1.0, M.woodDark(), 0, 0, 0, 6));
  const f = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffb040 })); f.position.y = 1.15; f.scale.y = 1.5; g.add(f);
  const l = new THREE.PointLight(0xff9a3a, 1.6, 7, 2); l.position.y = 1.2; g.add(l); return g;
}
export function barrel(x, z, s = 1) { const g = new THREE.Group(); g.position.set(x, 0, z); g.add(cyl(0.38 * s, 0.34 * s, 0.8 * s, M.wood([1, 1], 0x6e4a2a), 0, 0, 0, 12)); for (const yy of [0.15, 0.55]) g.add(cyl(0.4 * s, 0.4 * s, 0.05, M.metal(), 0, yy * s, 0, 12)); return g; }
export function crate(x, z, s = 1, ry = 0) { const c = box(0.8 * s, 0.7 * s, 0.8 * s, M.wood([1, 1], 0x8a6238, false), x, 0, z); c.rotation.y = ry; return c; }
export function tree(x, z, s = 1, kind = 'pine', seed = 1) {
  const r = rng(seed * 97 + (x * 13 | 0)); const g = new THREE.Group(); g.position.set(x, 0, z);
  g.add(cyl(0.18 * s, 0.26 * s, 1.6 * s, M.wood([1, 1], 0x4e341f), 0, 0, 0, 7));
  const leaf = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 1, flatShading: true });
  if (kind === 'pine') { for (let i = 0; i < 4; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry((1.5 - i * 0.28) * s, 1.5 * s, 9), leaf([0x2c4a28, 0x34562d, 0x3d6334, 0x4a7040][i])); c.position.y = (1.3 + i * 0.95) * s; c.castShadow = true; c.rotation.y = r() * 3; g.add(c); } }
  else { for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry((0.9 + r() * 0.5) * s, 1), leaf([0x3d6334, 0x4a7040, 0x587f48][i % 3])); c.position.set((r() - 0.5) * 1.4 * s, (2 + r() * 1.3) * s, (r() - 0.5) * 1.4 * s); c.castShadow = true; g.add(c); } }
  return g;
}
export function person(x, z, coat = 0x6b3e2e, ry = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry;
  g.add(cyl(0.16, 0.2, 0.9, new THREE.MeshStandardMaterial({ color: coat, roughness: 0.9 }), 0, 0.35, 0, 8));
  const h = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), new THREE.MeshStandardMaterial({ color: 0xd9b48a, roughness: 0.8 })); h.position.y = 1.4; g.add(h);
  g.add(cyl(0.07, 0.07, 0.4, M.woodDark(), -0.08, 0, 0, 6), cyl(0.07, 0.07, 0.4, M.woodDark(), 0.08, 0, 0, 6));
  g.children.forEach((c) => (c.castShadow = true)); return g;
}
export function soldier(x, z, ry = 0, cloak = 0x9c2f3b) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry;
  g.add(cyl(0.2, 0.22, 1.0, new THREE.MeshStandardMaterial({ color: cloak, roughness: 0.9 }), 0, 0.3, 0, 8));
  g.add(cyl(0.18, 0.18, 0.5, M.metal(), 0, 0.85, 0, 8));
  const h = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), M.metal()); h.position.y = 1.55; g.add(h);
  const sp = cyl(0.025, 0.025, 2.2, M.woodDark(), 0.3, 0, 0, 5); g.add(sp);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.25, 6), M.metal()); tip.position.set(0.3, 2.3, 0); g.add(tip);
  const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.06, 14), M.cloth(cloak)); sh.rotation.z = Math.PI / 2; sh.position.set(-0.3, 1.0, 0.05); g.add(sh);
  g.children.forEach((c) => (c.castShadow = true)); return g;
}
export function smokeFx(x, y, z) { const g = new THREE.Group(); const r = rng(3); for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.28 + i * 0.12, 8, 6), new THREE.MeshBasicMaterial({ color: 0xcfc8bc, transparent: true, opacity: 0.55 - i * 0.07 })); s.position.set(x + i * 0.18 + (r() - 0.5) * 0.2, y + i * 0.55, z + (r() - 0.5) * 0.2); g.add(s); } return g; }

// ---------- more textures / helpers ----------
export function stripeTexture(c1, c2, seed = 21) {
  const W = 256, H = 128, c = canvas(W, H), x = c.getContext('2d'), r = rng(seed);
  const n = 8; for (let i = 0; i < n; i++) { x.fillStyle = hex(i % 2 ? c2 : c1, 0.92 + r() * 0.1); x.fillRect((i * W) / n, 0, W / n, H); }
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.25)'); x.fillStyle = g; x.fillRect(0, 0, W, H); noise(x, W, H, 14, r); return c;
}
export function fieldTexture(seed = 22) {
  const W = 512, H = 512, c = canvas(W, H), x = c.getContext('2d'), r = rng(seed);
  x.fillStyle = '#7d6a3c'; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 24; i++) {
    const px = (i * W) / 24; x.fillStyle = i % 2 ? '#6b5a30' : '#8c773f'; x.fillRect(px, 0, W / 24, H);
    for (let j = 0; j < 90; j++) { const yy = r() * H; x.strokeStyle = `rgba(${200 + r() * 40 | 0},${160 + r() * 40 | 0},50,0.9)`; x.lineWidth = 1.4; x.beginPath(); x.moveTo(px + W / 48 + (r() - 0.5) * 5, yy); x.lineTo(px + W / 48 + (r() - 0.5) * 8, yy - 10 - r() * 8); x.stroke(); }
  }
  noise(x, W, H, 22, r); return c;
}
export function waterTexture(seed = 23) {
  const W = 512, H = 512, c = canvas(W, H), x = c.getContext('2d'), r = rng(seed);
  x.fillStyle = '#1f5b8c'; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 160; i++) { x.strokeStyle = `rgba(190,225,250,${0.05 + r() * 0.16})`; x.lineWidth = 1 + r() * 1.5; const px = r() * W, py = r() * H, l = 14 + r() * 40; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + l / 2, py - 4, px + l, py); x.stroke(); }
  noise(x, W, H, 10, r); return c;
}
export function rockTexture(seed = 24) {
  const W = 256, H = 256, c = canvas(W, H), x = c.getContext('2d'), r = rng(seed);
  x.fillStyle = '#76736c'; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 140; i++) { x.fillStyle = `rgba(${r() < 0.5 ? '40,38,34' : '190,185,170'},${0.06 + r() * 0.14})`; x.beginPath(); x.moveTo(r() * W, r() * H); for (let k = 0; k < 4; k++) x.lineTo(r() * W, r() * H); x.fill(); }
  noise(x, W, H, 30, r); return c;
}
export function sandTexture(seed = 25) { const W = 256, H = 256, c = canvas(W, H), x = c.getContext('2d'), r = rng(seed); x.fillStyle = '#c9b383'; x.fillRect(0, 0, W, H); noise(x, W, H, 34, r); return c; }
M.stripe = (a, b) => cache['stripe' + a + b] ?? (cache['stripe' + a + b] = new THREE.MeshStandardMaterial({ map: tex(stripeTexture(a, b), 1, 1), roughness: 0.9, side: THREE.DoubleSide }));
M.field = () => cache.field ?? (cache.field = new THREE.MeshStandardMaterial({ map: tex(fieldTexture(), 1, 1), roughness: 1 }));
M.water = () => cache.water ?? (cache.water = new THREE.MeshStandardMaterial({ map: tex(waterTexture(), 10, 10), roughness: 0.25, metalness: 0.1 }));
M.rock = (rep = [1, 1]) => cache['rock' + rep] ?? (cache['rock' + rep] = new THREE.MeshStandardMaterial({ map: tex(rockTexture(), ...rep), roughness: 1, flatShading: true }));
M.sand = () => cache.sand ?? (cache.sand = new THREE.MeshStandardMaterial({ map: tex(sandTexture(), 4, 4), roughness: 1 }));
M.copper = () => cache.copper ?? (cache.copper = new THREE.MeshStandardMaterial({ color: 0x4f9a8a, metalness: 0.4, roughness: 0.5 }));
M.flat = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.9 });
export function pediment(w, h, d, material) {
  const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2);
  const m = new THREE.Mesh(g, material); m.castShadow = m.receiveShadow = true; return m;
}
export function column(x, z, h, r = 0.28, mat = M.plaster([1, 1], 0xeee6d2)) { const g = new THREE.Group(); g.position.set(x, 0, z); g.add(cyl(r, r * 1.08, h, mat, 0, 0, 0, 14), cyl(r * 1.5, r * 1.5, 0.18, mat, 0, 0, 0, 14), cyl(r * 1.5, r * 1.5, 0.18, mat, 0, h - 0.18, 0, 14)); return g; }
export function archWindow(w, h, lit = true) {
  const g = new THREE.Group(); const fm = M.stoneDark([1, 1]);
  g.add(box(w + 0.35, h, 0.16, fm, 0, 0, 0));
  const r = w / 2; const body = box(w, h - r, 0.2, lit ? M.glow() : M.flat(0x1d2a3d), 0, 0, 0.03); g.add(body);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.2, 16, 1, false, 0, Math.PI), lit ? M.glow() : M.flat(0x1d2a3d)); top.rotation.x = Math.PI / 2; top.rotation.z = Math.PI / 2; top.rotation.y = 0; top.position.set(0, h - r, 0.03); g.add(top);
  g.add(box(0.07, h, 0.24, M.woodDark(), 0, 0, 0.05));
  if (lit) { const l = new THREE.PointLight(0xffb85a, 0.5, 4, 2); l.position.set(0, h / 2, 0.8); g.add(l); }
  return g;
}
export function logPile(x, z, ry = 0, n = 10) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; let k = 0; for (let row = 0; row < 4 && k < n; row++) for (let i = 0; i < 4 - row && k < n; i++, k++) { const l = cyl(0.26, 0.26, 2.2, M.wood([1, 2], 0x7a5232), -0.5 * (3 - row) + i * 0.56 + 0.2, 0.26 + row * 0.46, 0, 10); l.rotation.x = Math.PI / 2; l.position.y = 0.26 + row * 0.46; l.position.x = -0.8 + i * 0.56 + row * 0.28; g.add(l); const e = new THREE.Mesh(new THREE.CircleGeometry(0.24, 10), M.flat(0xc8a46a)); e.position.set(l.position.x, l.position.y, 1.11); g.add(e); } return g; }
export function wheel(r = 0.5) { const g = new THREE.Group(); const rim = new THREE.Mesh(new THREE.TorusGeometry(r, 0.06, 6, 16), M.woodDark()); g.add(rim); for (let i = 0; i < 4; i++) { const s = box(r * 2, 0.07, 0.07, M.woodDark(), 0, -0.035, 0); s.rotation.z = (i * Math.PI) / 4; g.add(s); } return g; }
export function cart(x, z, ry = 0, load = 0x8d8c88) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; g.add(box(1.6, 0.14, 1.0, M.wood([1, 1], 0x6e4a2a, false), 0, 0.5, 0)); for (const sz of [-0.5, 0.5]) { g.add(box(1.6, 0.35, 0.08, M.wood([1, 1], 0x6e4a2a, false), 0, 0.64, sz)); const w = wheel(0.42); w.position.set(0.1, 0.42, sz * 1.15); g.add(w); } g.add(box(1.4, 0.4, 0.8, M.flat(load), 0, 0.64, 0)); g.add(box(1.4, 0.06, 0.06, M.woodDark(), 1.4, 0.55, 0)); return g; }
export function haystack(x, z, s = 1) { const g = new THREE.Group(); g.position.set(x, 0, z); const b = cyl(0.9 * s, 1.0 * s, 0.9 * s, M.thatch([1, 1]), 0, 0, 0, 12); const c = new THREE.Mesh(new THREE.ConeGeometry(1.0 * s, 1.1 * s, 12), M.thatch([1, 1])); c.position.y = 1.45 * s; c.castShadow = true; g.add(b, c); return g; }
export function fence(x1, z1, x2, z2, h = 0.9) { const g = new THREE.Group(); const n = Math.max(2, Math.round(Math.hypot(x2 - x1, z2 - z1) / 1.1)); for (let i = 0; i <= n; i++) g.add(cyl(0.07, 0.07, h, M.woodDark(), x1 + ((x2 - x1) * i) / n, 0, z1 + ((z2 - z1) * i) / n, 6)); const len = Math.hypot(x2 - x1, z2 - z1); for (const yy of [0.35, 0.7]) { const r = box(len, 0.07, 0.07, M.woodDark(), (x1 + x2) / 2, yy, (z1 + z2) / 2); r.rotation.y = -Math.atan2(z2 - z1, x2 - x1); g.add(r); } return g; }
export function scarecrow(x, z) { const g = new THREE.Group(); g.position.set(x, 0, z); g.add(cyl(0.05, 0.05, 1.8, M.woodDark(), 0, 0, 0, 6), box(1.2, 0.07, 0.07, M.woodDark(), 0, 1.35, 0)); const b = cyl(0.2, 0.26, 0.7, M.flat(0x7a3a2a), 0, 0.7, 0, 8); g.add(b); const h = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 6), M.thatch([1, 1])); h.position.y = 1.65; g.add(h); const hat = cyl(0.3, 0.3, 0.05, M.woodDark(), 0, 1.78, 0, 10); g.add(hat, cyl(0.14, 0.14, 0.2, M.woodDark(), 0, 1.8, 0, 8)); return g; }
