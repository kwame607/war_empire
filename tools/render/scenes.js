import { THREE, M, box, cyl, banner, barrel, crate, rng } from './lib.js';

const std = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8, ...o });
const ctex = (w, h, draw, rep = [1, 1]) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.anisotropy = 8; return t; };
const shadow = (m) => { m.castShadow = m.receiveShadow = true; return m; };
const mesh = (g, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); return shadow(o); };

// ---------- textures ----------
function mapTexture() {
  return ctex(1024, 700, (x, W, H) => {
    const r = rng(77);
    x.fillStyle = '#d9c28f'; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 4000; i++) { x.fillStyle = `rgba(${90 + r() * 40},${60 + r() * 30},30,${r() * 0.06})`; x.fillRect(r() * W, r() * H, 3 + r() * 6, 3 + r() * 6); }
    x.fillStyle = '#c4aa72'; for (let k = 0; k < 7; k++) { x.beginPath(); let px = r() * W, py = r() * H; x.moveTo(px, py); for (let i = 0; i < 12; i++) { px += (r() - 0.5) * 220; py += (r() - 0.5) * 160; x.lineTo(Math.max(40, Math.min(W - 40, px)), Math.max(40, Math.min(H - 40, py))); } x.closePath(); x.fill(); }
    x.strokeStyle = 'rgba(70,45,20,0.55)'; x.lineWidth = 2; for (let i = 0; i < 20; i++) { x.beginPath(); x.moveTo(r() * W, r() * H); x.bezierCurveTo(r() * W, r() * H, r() * W, r() * H, r() * W, r() * H); x.stroke(); }
    x.strokeStyle = '#8f2b2b'; x.lineWidth = 5; x.setLineDash([14, 10]); x.beginPath(); x.moveTo(120, 560); x.bezierCurveTo(300, 360, 520, 520, 880, 200); x.stroke(); x.setLineDash([]);
    for (const [px, py] of [[200, 480], [420, 450], [650, 400], [860, 210]]) { x.fillStyle = '#8f2b2b'; x.beginPath(); x.arc(px, py, 11, 0, 7); x.fill(); x.fillStyle = '#fff3d0'; x.beginPath(); x.arc(px, py, 4, 0, 7); x.fill(); }
    x.strokeStyle = 'rgba(50,30,12,0.8)'; x.lineWidth = 10; x.strokeRect(6, 6, W - 12, H - 12); x.lineWidth = 2; x.strokeRect(22, 22, W - 44, H - 44);
  });
}
function rugTexture(a, b, c) {
  return ctex(512, 512, (x, W, H) => {
    x.fillStyle = a; x.fillRect(0, 0, W, H); x.fillStyle = b; x.fillRect(24, 24, W - 48, H - 48); x.fillStyle = a; x.fillRect(60, 60, W - 120, H - 120);
    x.fillStyle = c; for (let i = 0; i < 6; i++) { x.save(); x.translate(W / 2, H / 2); x.rotate((i * Math.PI) / 6); x.fillRect(-12, -150, 24, 300); x.restore(); }
    x.beginPath(); x.arc(W / 2, H / 2, 70, 0, 7); x.fillStyle = b; x.fill(); x.beginPath(); x.arc(W / 2, H / 2, 40, 0, 7); x.fillStyle = c; x.fill();
    for (let i = 0; i < 4000; i++) { x.fillStyle = `rgba(0,0,0,${Math.random() * 0.08})`; x.fillRect(Math.random() * W, Math.random() * H, 2, 2); }
  });
}
function canvasTexture() {
  return ctex(512, 512, (x, W, H) => {
    const r = rng(5); x.fillStyle = '#c9b48a'; x.fillRect(0, 0, W, H);
    for (let i = 0; i < W; i += 64) { x.fillStyle = 'rgba(0,0,0,0.07)'; x.fillRect(i, 0, 2, H); }
    for (let i = 0; i < 1500; i++) { x.fillStyle = `rgba(${r() < 0.5 ? '70,50,25' : '255,245,220'},${r() * 0.07})`; x.fillRect(r() * W, r() * H, 3 + r() * 14, 2 + r() * 8); }
  }, [3, 2]);
}
function floorTexture() {
  return ctex(512, 512, (x, W, H) => {
    const r = rng(9); x.fillStyle = '#6a5333'; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 9000; i++) { x.fillStyle = `rgba(${r() < 0.5 ? '30,20,10' : '150,120,70'},${r() * 0.1})`; x.fillRect(r() * W, r() * H, 3 + r() * 10, 2 + r() * 4); }
  }, [4, 3]);
}

// ---------- hidden items (each model is small, ~0.3–0.6 units) ----------
const gold = () => std(0xe0b84a, { metalness: 0.9, roughness: 0.25 });
const silver = () => std(0xcdd3da, { metalness: 0.9, roughness: 0.28 });
const iron = () => std(0x4d5258, { metalness: 0.8, roughness: 0.45 });
const leather = (c = 0x6b4426) => std(c, { roughness: 0.9 });
export const ITEMS = {
  ring: { name: 'Signet ring', make: () => { const g = new THREE.Group(); const t = mesh(new THREE.TorusGeometry(0.1, 0.028, 10, 24), gold()); t.rotation.x = Math.PI / 2.4; g.add(t); const s = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 14), std(0x2a6aa8, { metalness: 0.3, roughness: 0.2 }), 0, 0.1, 0.02); s.rotation.x = -0.4; g.add(s); return g; } },
  dagger: { name: 'Dagger', make: () => { const g = new THREE.Group(); g.add(mesh(new THREE.BoxGeometry(0.05, 0.02, 0.36), silver(), 0, 0, 0.2)); g.add(mesh(new THREE.ConeGeometry(0.025, 0.1, 4), silver(), 0, 0, 0.43).rotateX(Math.PI / 2)); g.add(mesh(new THREE.BoxGeometry(0.2, 0.035, 0.04), gold(), 0, 0, 0.0)); g.add(mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.16, 8), leather(0x2a1a10), 0, 0, -0.1).rotateX(Math.PI / 2)); g.add(mesh(new THREE.SphereGeometry(0.035, 8, 6), gold(), 0, 0, -0.19)); return g; } },
  compass: { name: 'Brass compass', make: () => { const g = new THREE.Group(); g.add(mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.06, 24), std(0xc08a3a, { metalness: 0.85, roughness: 0.3 }))); g.add(mesh(new THREE.CylinderGeometry(0.145, 0.145, 0.065, 24), std(0xefe6cf, { roughness: 0.4 }), 0, 0.005, 0)); const n = mesh(new THREE.ConeGeometry(0.03, 0.22, 4), std(0xb02a2a), 0, 0.045, 0.06); n.rotation.x = Math.PI / 2; g.add(n); g.add(mesh(new THREE.ConeGeometry(0.03, 0.2, 4), std(0x22262c), 0, 0.045, -0.06).rotateX(-Math.PI / 2)); g.add(mesh(new THREE.TorusGeometry(0.03, 0.012, 6, 12), gold(), 0, 0.03, -0.2).rotateX(Math.PI / 2)); return g; } },
  letter: { name: 'Sealed letter', make: () => { const g = new THREE.Group(); const p = mesh(new THREE.BoxGeometry(0.34, 0.015, 0.24), std(0xf1e6c8, { roughness: 0.95 })); g.add(p); g.add(mesh(new THREE.BoxGeometry(0.34, 0.012, 0.005), std(0xcdbf9c), 0, 0.01, 0)); const sl = mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 16), std(0xa81f25, { roughness: 0.4 }), 0, 0.016, 0); g.add(sl); g.rotation.y = 0.4; return g; } },
  goblet: { name: 'Golden goblet', make: () => { const g = new THREE.Group(); g.add(mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.03, 16), gold())); g.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.16, 8), gold(), 0, 0.1, 0)); g.add(mesh(new THREE.CylinderGeometry(0.11, 0.05, 0.2, 18), gold(), 0, 0.26, 0)); g.add(mesh(new THREE.SphereGeometry(0.03, 8, 6), std(0xb01f3a, { metalness: 0.2, roughness: 0.2 }), 0, 0.28, 0.1)); return g; } },
  key: { name: 'Iron key', make: () => { const g = new THREE.Group(); g.add(mesh(new THREE.TorusGeometry(0.06, 0.018, 8, 18), iron(), 0, 0.28, 0)); g.add(mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.34, 8), iron(), 0, 0.08, 0)); g.add(mesh(new THREE.BoxGeometry(0.07, 0.04, 0.02), iron(), 0.04, -0.06, 0)); g.add(mesh(new THREE.BoxGeometry(0.05, 0.03, 0.02), iron(), 0.035, -0.0, 0)); return g; } },
  purse: { name: 'Coin purse', make: () => { const g = new THREE.Group(); const b = mesh(new THREE.SphereGeometry(0.16, 14, 12), leather(0x7a4a28)); b.scale.set(1, 0.85, 1); g.add(b); g.add(mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.08, 12), leather(0x5a3a20), 0, 0.15, 0)); g.add(mesh(new THREE.TorusGeometry(0.075, 0.012, 6, 14), gold(), 0, 0.12, 0).rotateX(Math.PI / 2)); for (let i = 0; i < 3; i++) g.add(mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 12), gold(), 0.18 + i * 0.07, 0.01 + (i % 2) * 0.012, 0.05 - i * 0.04)); return g; } },
  quill: { name: 'Quill and inkwell', make: () => { const g = new THREE.Group(); g.add(mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.1, 14), std(0x20242a, { metalness: 0.6, roughness: 0.3 }), 0, 0.05, 0)); const f = mesh(new THREE.ConeGeometry(0.03, 0.42, 6), std(0xf2ecdc, { roughness: 0.9 }), 0.07, 0.3, 0); f.rotation.z = -0.5; g.add(f); return g; } },
  horn: { name: 'War horn', make: () => { const g = new THREE.Group(); const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.3, 0, 0), new THREE.Vector3(-0.1, -0.1, 0), new THREE.Vector3(0.12, -0.08, 0), new THREE.Vector3(0.3, 0.1, 0)]); const tube = mesh(new THREE.TubeGeometry(curve, 24, 0.045, 10, false), std(0xe4d6b0, { roughness: 0.55 })); g.add(tube); g.add(mesh(new THREE.TorusGeometry(0.05, 0.014, 6, 14), gold(), -0.3, 0, 0).rotateY(Math.PI / 2)); g.add(mesh(new THREE.TorusGeometry(0.06, 0.012, 6, 14), gold(), 0.0, -0.08, 0).rotateY(Math.PI / 2)); return g; } },
  medal: { name: 'Gold medal', make: () => { const g = new THREE.Group(); g.add(mesh(new THREE.BoxGeometry(0.06, 0.22, 0.01), std(0x9a1f2a), 0, 0.2, 0)); g.add(mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 24), gold()).rotateX(Math.PI / 2)); g.children[g.children.length - 1].position.set(0, 0, 0.01); g.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.025, 6), std(0xfff0b0, { metalness: 0.9, roughness: 0.2 })).rotateX(Math.PI / 2)); g.children[g.children.length - 1].position.set(0, 0, 0.015); return g; } },
};


ITEMS.spyglass = { name: 'Spyglass', make: () => { const g = new THREE.Group(); const m = std(0xc08a3a, { metalness: 0.85, roughness: 0.3 }); for (const [r, l, z] of [[0.05, 0.22, 0.0], [0.065, 0.2, 0.2], [0.08, 0.16, 0.38]]) { const c = mesh(new THREE.CylinderGeometry(r, r, l, 14), m, 0, 0, z); c.rotation.x = Math.PI / 2; g.add(c); } g.add(mesh(new THREE.TorusGeometry(0.08, 0.012, 6, 14), leather(0x3a2a1c), 0, 0, 0.46)); return g; } };
ITEMS.hourglass = { name: 'Hourglass', make: () => { const g = new THREE.Group(); const w = std(0x6b4426); g.add(mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 12), w, 0, 0, 0), mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 12), w, 0, 0.3, 0)); const glass = new THREE.MeshStandardMaterial({ color: 0xcfe8f0, transparent: true, opacity: 0.55, roughness: 0.1 }); g.add(mesh(new THREE.ConeGeometry(0.085, 0.14, 12), glass, 0, 0.07, 0).rotateX(Math.PI), mesh(new THREE.ConeGeometry(0.085, 0.14, 12), glass, 0, 0.23, 0)); g.add(mesh(new THREE.ConeGeometry(0.05, 0.08, 10), std(0xe3c47a), 0, 0.045, 0)); for (const a of [0, 2.1, 4.2]) g.add(mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.3, 5), w, Math.cos(a) * 0.09, 0.15, Math.sin(a) * 0.09)); return g; } };
ITEMS.seal = { name: 'Wax seal stamp', make: () => { const g = new THREE.Group(); g.add(mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 16), gold(), 0, 0, 0)); g.add(mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.2, 10), std(0x3a2414), 0, 0.12, 0)); g.add(mesh(new THREE.SphereGeometry(0.05, 10, 8), std(0x3a2414), 0, 0.24, 0)); g.add(mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.012, 16), std(0xa81f25, { roughness: 0.4 }), 0.2, -0.01, 0)); return g; } };

// ---------- the room ----------
/** The commander's tent. Returns the group and where each hidden item sits (world coordinates). */
export function tent() {
  const g = new THREE.Group(); const r = rng(42);
  const W = 15, D = 12, H = 6;
  // floor, rugs
  const floor = mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ map: floorTexture(), roughness: 1 }), 0, 0, 0); floor.rotation.x = -Math.PI / 2; g.add(floor);
  const rug = (w, d, x, z, a, b, c, ry = 0) => { const m = mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: rugTexture(a, b, c), roughness: 1 }), x, 0.012, z); m.rotation.x = -Math.PI / 2; m.rotation.z = ry; g.add(m); };
  rug(7, 5, 0, 0.4, '#7a1f28', '#c9a24a', '#1f3f7a'); rug(3, 2, -5, 3, '#1f3f5a', '#b8893a', '#a33'); rug(3.2, 2.2, 5.1, 2.2, '#3a5a2a', '#d4ac4f', '#7a1f28', 0.3);
  // canvas walls and ceiling
  const canvasMat = new THREE.MeshStandardMaterial({ map: canvasTexture(), roughness: 1, side: THREE.DoubleSide });
  const back = mesh(new THREE.PlaneGeometry(W, H), canvasMat, 0, H / 2, -D / 2); g.add(back);
  for (const s of [-1, 1]) { const w = mesh(new THREE.PlaneGeometry(D, H), canvasMat, s * W / 2, H / 2, 0); w.rotation.y = -s * Math.PI / 2; g.add(w); }
  const roof = mesh(new THREE.PlaneGeometry(W + 2, D + 2), canvasMat, 0, H + 0.6, 0); roof.rotation.x = Math.PI / 2; g.add(roof);
  for (const x of [-7.0, 7.0]) g.add(cyl(0.14, 0.14, H, M.woodDark(), x, 0, -D / 2 + 0.4, 8)); // posts
  const beam = box(W, 0.22, 0.22, M.woodDark(), 0, H - 0.3, -D / 2 + 0.4); g.add(beam);
  // back wall: big map, banners, shelves
  const wallMap = mesh(new THREE.PlaneGeometry(5.2, 3.6), new THREE.MeshStandardMaterial({ map: mapTexture(), roughness: 0.9 }), 0, 3.0, -D / 2 + 0.03); g.add(wallMap);
  g.add(box(5.5, 0.12, 0.1, M.woodDark(), 0, 4.88, -D / 2 + 0.08), box(5.5, 0.12, 0.1, M.woodDark(), 0, 1.1, -D / 2 + 0.08));
  const b1 = banner(0x24407a, 3.0, 1.0); b1.position.set(-6.0, 1.0, -D / 2 + 0.3); g.add(b1); const b2 = banner(0x8e2b2f, 3.0, 1.0); b2.position.set(5.0, 1.0, -D / 2 + 0.3); g.add(b2);
  const shelf = (x, y, w) => { g.add(box(w, 0.1, 0.55, M.wood([1, 1], 0x7a5232, false), x, y, -D / 2 + 0.4)); for (const sx of [-1, 1]) { const br = box(0.08, 0.35, 0.4, M.woodDark(), x + sx * (w / 2 - 0.12), y - 0.35, -D / 2 + 0.45); g.add(br); } };
  shelf(-5.3, 2.4, 2.6); shelf(-5.3, 3.6, 2.6); shelf(5.0, 2.4, 2.8); shelf(5.0, 3.6, 2.8);
  // books and scrolls on shelves
  const bookCols = [0x7a1f28, 0x1f3f7a, 0x3a5a2a, 0x8a6a2a, 0x4a2a5a, 0x2a2a2a];
  for (const [sx, sy, w] of [[-5.3, 2.45, 2.4], [-5.3, 3.65, 2.4], [5.0, 2.45, 2.6], [5.0, 3.65, 2.6]]) { let x = sx - w / 2 + 0.15; while (x < sx + w / 2 - 0.5) { const bw = 0.1 + r() * 0.1, bh = 0.35 + r() * 0.25; g.add(box(bw, bh, 0.32, std(bookCols[(r() * bookCols.length) | 0]), x, sy, -D / 2 + 0.4)); x += bw + 0.015; if (r() < 0.2) x += 0.25; } }
  for (let i = 0; i < 5; i++) { const sc = cyl(0.07, 0.07, 0.5, std(0xe6d5a8, { roughness: 0.95 }), 0, 0, 0, 10); sc.rotation.z = Math.PI / 2; sc.position.set(4.3 + i * 0.28, 3.72, -D / 2 + 0.4); g.add(sc); }
  // central table
  const T = new THREE.Group(); T.position.set(0, 0, -1.0);
  T.add(box(5.0, 0.16, 2.6, M.wood([2, 1], 0x6e4a2a, false), 0, 1.35, 0));
  for (const [x, z] of [[-2.2, -1.1], [2.2, -1.1], [-2.2, 1.1], [2.2, 1.1]]) T.add(box(0.2, 1.35, 0.2, M.woodDark(), x, 0, z));
  T.add(box(4.8, 0.02, 2.4, std(0x1f3a2a, { roughness: 1 }), 0, 1.51, 0)); // baize
  const tmap = mesh(new THREE.PlaneGeometry(3.6, 2.0), new THREE.MeshStandardMaterial({ map: mapTexture(), roughness: 0.9 }), 0, 1.535, 0); tmap.rotation.x = -Math.PI / 2; T.add(tmap);
  const tokCols = [0x2a4a9a, 0xa83030]; for (let i = 0; i < 12; i++) { const t = cyl(0.09, 0.09, 0.14 + (i % 3) * 0.05, std(tokCols[i % 2], { roughness: 0.5 }), -1.4 + r() * 2.8, 1.52, -0.7 + r() * 1.4, 12); T.add(t); }
  for (const x of [-2.0, 2.0]) { T.add(cyl(0.06, 0.06, 0.35, std(0xf3ead2, { roughness: 0.8 }), x, 1.52, -0.9, 10)); const fl = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffc060 })); fl.position.set(x, 1.93, -0.9); fl.scale.y = 1.5; T.add(fl); const pl = new THREE.PointLight(0xffa24a, 7, 14, 1.6); pl.position.set(x, 2.1, -0.9); T.add(pl); }
  for (let i = 0; i < 3; i++) { const sc = cyl(0.05, 0.05, 0.5, std(0xe6d5a8), 0, 0, 0, 8); sc.rotation.z = Math.PI / 2; sc.rotation.y = i * 0.3; sc.position.set(1.5, 1.56 + i * 0.1, 0.8 - i * 0.05); T.add(sc); }
  g.add(T);
  // stools around the table
  for (const [x, z] of [[-1.5, 1.2], [1.5, 1.3], [3.6, -1.0]]) { g.add(cyl(0.32, 0.32, 0.12, M.wood([1, 1], 0x8a6238), x, 0.72, z, 12)); for (const a of [0, 2.1, 4.2]) g.add(cyl(0.04, 0.04, 0.72, M.woodDark(), x + Math.cos(a) * 0.2, 0, z + Math.sin(a) * 0.2, 6)); }
  // left side: cot, chest, barrels, crates
  const cot = new THREE.Group(); cot.position.set(-5.6, 0, 0.6); cot.add(box(1.5, 0.12, 3.0, M.wood([1, 1], 0x6e4a2a, false), 0, 0.5, 0)); for (const [x, z] of [[-0.6, -1.3], [0.6, -1.3], [-0.6, 1.3], [0.6, 1.3]]) cot.add(box(0.1, 0.5, 0.1, M.woodDark(), x, 0, z)); cot.add(box(1.4, 0.2, 2.9, M.cloth(0x7a2a2a), 0, 0.62, 0)); cot.add(box(1.0, 0.22, 0.6, std(0xe8dcc0), 0, 0.82, -1.1)); cot.add(box(1.35, 0.14, 1.4, std(0x6a5a46, { roughness: 1 }), 0, 0.82, 0.5)); g.add(cot);
  const chest = new THREE.Group(); chest.position.set(-3.7, 0, 3.4); chest.add(box(1.5, 0.7, 0.9, M.wood([1, 1], 0x5a3a20, false), 0, 0, 0)); const lid = box(1.5, 0.12, 0.9, M.wood([1, 1], 0x5a3a20, false), 0, 0.7, 0); chest.add(lid); for (const x of [-0.5, 0.5]) chest.add(box(0.1, 0.84, 0.94, M.metal(), x, 0, 0)); g.add(chest);
  g.add(barrel(-6.6, 3.9, 1.1), barrel(-6.0, 4.5, 1.0), barrel(-6.9, 2.9, 0.9)); g.add(crate(-5.3, 4.3, 1.2, 0.2)); const c2 = crate(-5.3, 4.3, 0.9, 0.5); c2.position.y += 0.9; g.add(c2);
  // right side: desk, armor stand, weapon rack, shield rack
  const desk = new THREE.Group(); desk.position.set(5.3, 0, 1.4); desk.add(box(2.4, 0.12, 1.2, M.wood([1, 1], 0x7a5232, false), 0, 1.1, 0)); for (const [x, z] of [[-1.1, -0.5], [1.1, -0.5], [-1.1, 0.5], [1.1, 0.5]]) desk.add(box(0.12, 1.1, 0.12, M.woodDark(), x, 0, z)); desk.add(box(2.2, 0.5, 1.0, M.wood([1, 1], 0x5a3a20, false), 0, 0.5, 0)); g.add(desk);
  const globe = new THREE.Group(); globe.position.set(5.9, 1.22, 1.3); globe.add(mesh(new THREE.SphereGeometry(0.34, 20, 16), new THREE.MeshStandardMaterial({ map: mapTexture(), roughness: 0.6 }), 0, 0.5, 0)); globe.add(mesh(new THREE.TorusGeometry(0.38, 0.02, 6, 24), gold(), 0, 0.5, 0)); globe.add(cyl(0.2, 0.25, 0.1, M.woodDark(), 0, 0, 0, 12)); g.add(globe);
  for (let i = 0; i < 5; i++) g.add(box(0.5, 0.1 + (i % 2) * 0.03, 0.38, std(bookCols[i % 6]), 4.5, 1.22 + i * 0.12, 1.2));
  const arm = new THREE.Group(); arm.position.set(6.6, 0, -2.0); arm.add(cyl(0.05, 0.05, 2.2, M.woodDark(), 0, 0, 0, 6)); arm.add(box(0.9, 0.12, 0.12, M.woodDark(), 0, 1.6, 0)); arm.add(cyl(0.36, 0.3, 0.95, std(0x8a8f98, { metalness: 0.85, roughness: 0.35 }), 0, 0.85, 0, 12)); arm.add(mesh(new THREE.SphereGeometry(0.22, 14, 10), std(0x9aa0a8, { metalness: 0.85, roughness: 0.3 }), 0, 2.05, 0)); arm.add(cyl(0.2, 0.24, 0.5, M.woodDark(), 0, 0, 0, 8)); g.add(arm);
  const rack = new THREE.Group(); rack.position.set(2.6, 0, -D / 2 + 0.7); rack.add(box(2.2, 0.12, 0.3, M.woodDark(), 0, 0.5, 0), box(2.2, 0.12, 0.3, M.woodDark(), 0, 1.6, 0)); for (let i = 0; i < 6; i++) { const sp = cyl(0.03, 0.03, 3.2, M.woodDark(), -0.9 + i * 0.36, 0, 0, 6); sp.rotation.z = (i % 2 - 0.5) * 0.06; rack.add(sp); const t = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.28, 6), M.metal()); t.position.set(-0.9 + i * 0.36 + (i % 2 - 0.5) * 0.1, 3.35, 0); rack.add(shadow(t)); } g.add(rack);
  const srack = new THREE.Group(); srack.position.set(-2.8, 0, -D / 2 + 0.9); for (let i = 0; i < 3; i++) { const sh = mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.07, 22), new THREE.MeshStandardMaterial({ color: [0x24407a, 0x8e2b2f, 0xd4ac4f][i], roughness: 0.5, metalness: 0.25 })); sh.rotation.x = Math.PI / 2 - 0.15; sh.position.set(i * 0.7 - 0.7, 0.55, 0.05 * i); srack.add(sh); } g.add(srack);
  // floor clutter
  g.add(barrel(3.9, 4.6, 1.0), crate(4.6, 4.5, 0.9, 0.3), crate(2.4, 4.9, 0.8, -0.2));
  for (const [x, z, a] of [[-0.6, 3.3, 0.3], [0.9, 3.6, -0.5], [-2.5, 2.0, 0.8], [2.2, 2.4, 0.1]]) { const p = mesh(new THREE.PlaneGeometry(0.5, 0.36), std(0xefe2c0, { roughness: 1 }), x, 0.02, z); p.rotation.set(-Math.PI / 2, 0, a); g.add(p); }
  for (const [x, z] of [[1.4, 3.2], [1.7, 3.35]]) { g.add(mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.34, 10), leather(0x2a1a10), x, 0.17, z)); }
  const bucket = cyl(0.22, 0.17, 0.35, M.wood([1, 1], 0x7a5232), 3.0, 0, 3.2, 12); g.add(bucket);
  // hanging lanterns (warm light)
  for (const x of [-3.2, 3.2]) { const l = new THREE.Group(); l.position.set(x, 4.2, -0.5); l.add(cyl(0.01, 0.01, 1.5, M.woodDark(), 0, 0.2, 0, 4)); l.add(mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.4, 8), M.glow(0xffc267), 0, 0, 0)); const pl = new THREE.PointLight(0xffa860, 6, 15, 1.5); pl.position.y = -0.1; l.add(pl); g.add(l); }

  // ----- extra clutter: the more there is, the more there is to search -----
  const cl = (fn) => fn();
  // wall decor
  for (const [x, y, c] of [[-7.4, 3.2, 0x24407a], [7.4, 3.0, 0x8e2b2f]]) { const t = mesh(new THREE.PlaneGeometry(1.6, 2.4), M.cloth(c), x, y, -2.5); t.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2; g.add(t); }
  for (const [x, z, ry] of [[-7.45, -3.5, Math.PI / 2], [7.45, -4.0, -Math.PI / 2]]) for (let i = 0; i < 3; i++) { const sw = new THREE.Group(); sw.position.set(x, 3.0 - i * 0.0, z + i * 0.45); sw.rotation.y = ry; sw.rotation.z = 0.0; sw.add(box(0.07, 1.3, 0.02, std(0xb9c0c8, { metalness: 0.85, roughness: 0.3 }), 0, 0, 0)); sw.add(box(0.5, 0.06, 0.04, M.gold(), 0, 0, 0)); g.add(sw); }
  const shieldW = (x, y, z, ry, c1, c2) => { const sh = mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.08, 28), std(c1, { roughness: 0.5, metalness: 0.2 })); sh.rotation.set(Math.PI / 2, 0, 0); sh.position.set(x, y, z); const ring = mesh(new THREE.TorusGeometry(0.5, 0.04, 6, 28), M.gold()); ring.position.set(x, y, z + 0.05); g.add(sh, ring); const bs = mesh(new THREE.SphereGeometry(0.14, 12, 8), M.gold()); bs.position.set(x, y, z + 0.1); g.add(bs); };
  shieldW(-1.2, 1.6, -D / 2 + 0.08, 0, 0x24407a); shieldW(1.2, 5.3, -D / 2 + 0.1, 0, 0x8e2b2f);
  // table clutter
  const onT = (x, z, fn) => { const o = fn(); o.position.add(new THREE.Vector3(x, 1.52, z - 1.0)); g.add(o); };
  onT(-1.9, 0.5, () => { const gg = new THREE.Group(); gg.add(cyl(0.16, 0.12, 0.06, std(0xcfd3d8, { metalness: 0.8, roughness: 0.3 }), 0, 0, 0, 20)); gg.add(mesh(new THREE.SphereGeometry(0.1, 10, 8), std(0xc0392b, { roughness: 0.5 }), 0.04, 0.12, 0)); gg.add(mesh(new THREE.SphereGeometry(0.09, 10, 8), std(0x7aa83a, { roughness: 0.5 }), -0.06, 0.1, 0.03)); return gg; });
  onT(1.0, -0.6, () => { const gg = new THREE.Group(); gg.add(cyl(0.12, 0.14, 0.4, std(0x7a4a2a, { roughness: 0.6 }), 0, 0, 0, 14)); gg.add(cyl(0.05, 0.1, 0.12, std(0x7a4a2a, { roughness: 0.6 }), 0, 0.4, 0, 12)); return gg; });
  onT(2.1, -0.2, () => { const gg = new THREE.Group(); for (let i = 0; i < 3; i++) gg.add(cyl(0.07, 0.06, 0.12, silver(), i * 0.2, 0, i % 2 * 0.1, 10)); return gg; });
  onT(-0.4, 0.8, () => { const gg = new THREE.Group(); for (let i = 0; i < 4; i++) { const p = mesh(new THREE.PlaneGeometry(0.5, 0.36), std(0xf1e6c8, { roughness: 1 }), 0, 0.005 + i * 0.006, 0); p.rotation.set(-Math.PI / 2, 0, i * 0.4); gg.add(p); } return gg; });
  onT(1.6, 0.9, () => { const gg = new THREE.Group(); gg.add(cyl(0.25, 0.22, 0.06, std(0x9a6a3a, { roughness: 0.6 }), 0, 0, 0, 20)); for (let i = 0; i < 4; i++) gg.add(mesh(new THREE.SphereGeometry(0.07, 8, 6), std([0xc23b2a, 0xe0a020, 0x6aa23a, 0xd0c070][i]), Math.cos(i * 1.6) * 0.1, 0.07, Math.sin(i * 1.6) * 0.1)); return gg; });
  // floor/side clutter
  for (const [x, z, s] of [[-6.8, 1.6, 1], [-6.9, 0.4, 0.8]]) { const sk = mesh(new THREE.SphereGeometry(0.45 * s, 12, 10), std(0xcdb88a, { roughness: 1 }), x, 0.38 * s, z); sk.scale.set(1, 0.85, 0.8); g.add(sk); g.add(mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 8), std(0x3a2a1c), x, 0.8 * s, z).rotateX(0)); }
  for (let i = 0; i < 6; i++) g.add(box(0.7 - i * 0.05, 0.12, 0.5, std(bookCols[i % 6]), -2.0 + (i % 2) * 0.05, i * 0.12, 4.4)); // book stack
  for (const [x, z, k] of [[-4.2, 4.6, 0], [-1.8, 4.7, 1], [0.2, 5.0, 0], [5.9, 3.4, 1]]) { const rope = mesh(new THREE.TorusGeometry(0.24, 0.07, 8, 18), std(0xb59a68, { roughness: 1 }), x, 0.08, z); rope.rotation.x = Math.PI / 2; g.add(rope); if (k) g.add(mesh(new THREE.TorusGeometry(0.17, 0.07, 8, 18), std(0xb59a68, { roughness: 1 }), x, 0.2, z).rotateX(Math.PI / 2)); }
  g.add(barrel(-6.9, 5.2, 0.95), barrel(6.7, 4.6, 1.0), barrel(6.2, 5.3, 0.9)); g.add(crate(6.2, 3.3, 1.0, 0.4)); const c3 = crate(6.2, 3.3, 0.8, 0.1); c3.position.y += 0.8; g.add(c3);
  for (const [x, z] of [[-4.6, -4.6], [-3.9, -4.9], [3.6, -5.0]]) { const sack = mesh(new THREE.SphereGeometry(0.5, 12, 10), std(0xb59a68, { roughness: 1 }), x, 0.4, z); sack.scale.set(1, 1.1, 0.9); g.add(sack); g.add(mesh(new THREE.CylinderGeometry(0.1, 0.18, 0.2, 8), std(0x9a8050, { roughness: 1 }), x, 0.92, z)); }
  // saddle and a hanging cloak
  g.add(box(1.0, 0.5, 0.5, leather(0x6a4426), 4.0, 0.0, -4.6)); g.add(mesh(new THREE.SphereGeometry(0.28, 10, 8), leather(0x6a4426), 4.0, 0.62, -4.6));
  // armour pieces on shelves: helmets
  for (const x of [-6.0, -4.6, 4.4, 5.8]) g.add(mesh(new THREE.SphereGeometry(0.2, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), std(0xa9b0b8, { metalness: 0.85, roughness: 0.35 }), x, 3.68, -D / 2 + 0.4));
  // ----- hidden item placement -----
  const P = {}; const put = (id, x, y, z, ry = 0, s = 1) => { const it = ITEMS[id].make(); it.position.set(x, y, z); it.rotation.y = ry; it.scale.setScalar(s); g.add(it); P[id] = [x, y + 0.08, z]; };
  put('ring', 0.6, 1.545, 0.3, 0.5);        // on the table map
  put('dagger', -2.9, 1.52, -0.5, 1.2);     // table edge
  put('compass', -5.0, 2.5, -D / 2 + 0.5, 0.4); // left shelf
  put('letter', -1.2, 0.025, 3.9, 0.9);     // on the floor
  put('goblet', 5.4, 3.7, -D / 2 + 0.5);    // right upper shelf
  put('key', -6.1, 3.75, -D / 2 + 0.5, 0.3, 1.0); // left upper shelf
  put('purse', -3.0, 0.7, 3.1, 0.3);        // by the chest
  put('quill', 4.6, 1.22 + 0.62, 1.2);      // on the books
  put('horn', -5.0, 0.98, 1.5, 0.6);         // on the cot
  put('medal', 6.4, 1.5, -1.62, 0, 1.0);    // armour stand
  g.userData.hotspots = P;
  return g;
}

const placer = (g, P) => (id, x, y, z, ry = 0, sc = 1) => { const it = ITEMS[id].make(); it.position.set(x, y, z); it.rotation.y = ry; it.scale.setScalar(sc); g.add(it); P[id] = [x, y + 0.08, z]; };

/** An army camp at first light after a battle. */
export function camp() {
  const g = new THREE.Group(); const r = rng(11); const P = {}; const put = placer(g, P);
  const ground = mesh(new THREE.PlaneGeometry(60, 40), M.ground([12, 8]), 0, 0, -6); ground.rotation.x = -Math.PI / 2; g.add(ground);
  const dirt = mesh(new THREE.CircleGeometry(7, 32), M.dirt([3, 3]), 0, 0.01, 0); dirt.rotation.x = -Math.PI / 2; dirt.scale.set(1.5, 1, 1); g.add(dirt);
  // distant hills and trees
  for (const [x, z, s, c] of [[-16, -22, 9, 0x4d6a3a], [4, -26, 12, 0x5a7442], [18, -21, 8, 0x46603a], [-4, -24, 6, 0x6a8350]]) { const h = mesh(new THREE.SphereGeometry(s, 24, 14), std(c, { roughness: 1 }), x, -s * 0.55, z); h.scale.y = 0.6; g.add(h); }
  for (let i = 0; i < 22; i++) { const x = -22 + r() * 44, z = -14 - r() * 6; const t = new THREE.Group(); t.position.set(x, 0, z); t.add(cyl(0.2, 0.28, 1.6, M.woodDark(), 0, 0, 0, 6)); t.add(mesh(new THREE.ConeGeometry(1.3, 3.4, 8), std(0x2f5a34, { roughness: 1 }), 0, 3.0, 0)); g.add(t); }
  // tents
  const tentAt = (x, z, ry, c, s = 1) => { const t = new THREE.Group(); t.position.set(x, 0, z); t.rotation.y = ry; t.scale.setScalar(s); const roof = mesh(new THREE.CylinderGeometry(0, 2.2, 2.6, 4, 1), M.cloth(c), 0, 1.3, 0); roof.rotation.y = Math.PI / 4; t.add(roof); const door = mesh(new THREE.PlaneGeometry(0.9, 1.5), std(0x1b1410, { roughness: 1 }), 0, 0.75, 1.52); t.add(door); t.add(cyl(0.05, 0.05, 3.1, M.woodDark(), 0, 0, 0, 6)); g.add(t); };
  tentAt(-8.5, -7, 0.2, 0xb9a577, 1.5); tentAt(8.8, -8, -0.3, 0xb9a577, 1.6); tentAt(-1.5, -10.5, 0, 0xa83030, 1.9); tentAt(-12, -2, 0.7, 0xc9b88a, 1.2); tentAt(13, -1.5, -0.6, 0xc9b88a, 1.2);
  // campfire
  const fire = new THREE.Group(); fire.position.set(0.3, 0, -1.2); for (let i = 0; i < 6; i++) { const l = cyl(0.07, 0.07, 0.9, M.woodDark(), 0, 0.05, 0, 6); l.rotation.z = Math.PI / 2 - 0.5; l.rotation.y = i * 1.05; fire.add(l); } for (let i = 0; i < 8; i++) fire.add(mesh(new THREE.SphereGeometry(0.16, 8, 6), std(0x6a6a68, { roughness: 1 }), Math.cos(i * 0.78) * 0.7, 0.1, Math.sin(i * 0.78) * 0.7)); const fl = mesh(new THREE.ConeGeometry(0.3, 0.9, 8), new THREE.MeshBasicMaterial({ color: 0xffa030 }), 0, 0.6, 0); fire.add(fl); fire.add(mesh(new THREE.ConeGeometry(0.17, 0.6, 8), new THREE.MeshBasicMaterial({ color: 0xffe080 }), 0, 0.55, 0)); const pl = new THREE.PointLight(0xff9a40, 30, 18, 1.6); pl.position.y = 1.0; fire.add(pl); g.add(fire);
  // wagon
  const wagon = new THREE.Group(); wagon.position.set(-5.8, 0, 1.4); wagon.rotation.y = 0.5; wagon.add(box(3.2, 0.2, 1.6, M.wood([2, 1], 0x6e4a2a, false), 0, 0.8, 0)); for (const sx of [-1, 1]) wagon.add(box(3.2, 0.5, 0.1, M.wood([2, 1], 0x6e4a2a, false), 0, 1.0, sx * 0.75)); wagon.add(box(0.1, 0.5, 1.6, M.wood([1, 1], 0x6e4a2a, false), -1.55, 1.0, 0)); for (const [x, z] of [[-1.0, 0.9], [1.0, 0.9], [-1.0, -0.9], [1.0, -0.9]]) { const wh = mesh(new THREE.TorusGeometry(0.5, 0.07, 8, 20), M.woodDark(), x, 0.55, z); wagon.add(wh); wagon.add(mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.12, 8), M.woodDark(), x, 0.55, z).rotateX(Math.PI / 2)); } for (let i = 0; i < 3; i++) wagon.add(crate(-0.7 + i * 0.8, 0, 0.6, 0.2 * i).translateY(0.9)); const tilt = box(2.4, 1.0, 1.4, M.cloth(0xcfc3a0), 0.3, 1.0, 0); tilt.visible = false; wagon.add(tilt); g.add(wagon);
  // props scattered
  for (const [x, z, s] of [[5.2, 1.8, 1], [6.0, 2.4, 0.9], [-9.5, 3.8, 1]]) g.add(barrel(x, z, s)); g.add(crate(4.2, 3.2, 1.0, 0.4), crate(7.0, 0.6, 0.9, -0.3), crate(-3.4, 4.8, 0.9, 0.2));
  for (const [x, z] of [[-3.0, 2.0], [2.6, 3.0], [-6.8, 5.0], [8.5, 4.8], [-0.6, 5.6]]) { const sh = mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.07, 24), std([0x24407a, 0x8e2b2f][(x * 7 | 0) & 1], { roughness: 0.5, metalness: 0.2 }), x, 0.1, z); sh.rotation.set(-0.3 + r() * 0.2, r() * 3, 0.1); g.add(sh); }
  for (let i = 0; i < 9; i++) { const x = -9 + i * 2.4 + r(), z = 3.5 + r() * 2.5; const sp = cyl(0.03, 0.03, 3.0, M.woodDark(), x, 0, z, 6); sp.rotation.z = (r() - 0.5) * 0.5; sp.rotation.x = (r() - 0.5) * 0.4; g.add(sp); const tip = mesh(new THREE.ConeGeometry(0.06, 0.3, 6), M.metal(), x - Math.sin(sp.rotation.z) * 1.6, 3.0 * Math.cos(sp.rotation.z) + 0.1, z); tip.rotation.z = sp.rotation.z; g.add(tip); }
  for (const [x, z] of [[-4.4, -2.5], [4.4, -3.0], [2.0, 1.4]]) { const b = banner(x < 0 ? 0x24407a : 0x8e2b2f, 2.6, 0.9); b.position.set(x, 0, z); b.rotation.z = (x < 0 ? 1 : -1) * 0.25; g.add(b); }
  for (let i = 0; i < 30; i++) { const gr = mesh(new THREE.ConeGeometry(0.08, 0.5, 4), std(0x5f8240, { roughness: 1 }), -12 + r() * 24, 0.25, 0 + r() * 8); g.add(gr); }
  for (const [x, z, s] of [[-2.2, -3.2, 0.7], [3.4, -2.6, 0.9], [7.6, 3.6, 0.8]]) { const ro = mesh(new THREE.DodecahedronGeometry(s, 0), std(0x8a8a86, { roughness: 1 }), x, s * 0.5, z); g.add(ro); }
  for (const [x, z] of [[-1.2, 0.8], [1.9, 0.6], [-2.4, -0.6]]) { const lg = cyl(0.25, 0.25, 1.1, M.wood([1, 1], 0x6e4a2a), x, 0, z, 10); lg.rotation.z = Math.PI / 2; lg.position.y = 0.25; g.add(lg); }
  put('dagger', 2.2, 0.12, 4.6, 0.9, 1.2); put('horn', -3.4, 0.25, 3.3, 0.2, 1.3); put('medal', 0.5, 0.08, 3.4, 0.3, 1.3); put('key', -2.8, 0.2, 1.1, 0.4, 1.2); put('purse', 5.5, 0.2, 1.0, 0.3, 1.2);
  put('spyglass', -7.0, 1.0, -0.4, 1.2, 1.2); put('letter', 3.4, 0.03, 1.8, 0.3, 1.3); put('goblet', 5.0, 0.7, 2.0, 0.0, 1.2); put('ring', -1.0, 0.1, 4.8, 0.0, 1.3); put('hourglass', 6.4, 0.7, 2.9, 0.4, 1.1);
  g.userData.hotspots = P; return g;
}

/** A spymaster's stone study lit by a window and a fire. */
export function study() {
  const g = new THREE.Group(); const r = rng(23); const P = {}; const put = placer(g, P);
  const W = 15, D = 12, H = 6.5;
  const floor = mesh(new THREE.PlaneGeometry(W, D), M.stoneDark([4, 3]), 0, 0, 0); floor.rotation.x = -Math.PI / 2; g.add(floor);
  const wall = (w, h, x, y, z, ry) => { const m = mesh(new THREE.PlaneGeometry(w, h), M.stone([w / 3, h / 3]), x, y, z); m.rotation.y = ry; g.add(m); };
  wall(W, H, 0, H / 2, -D / 2, 0); wall(D, H, -W / 2, H / 2, 0, Math.PI / 2); wall(D, H, W / 2, H / 2, 0, -Math.PI / 2);
  const ceil = mesh(new THREE.PlaneGeometry(W, D), std(0x3a2a1c, { roughness: 1 }), 0, H, 0); ceil.rotation.x = Math.PI / 2; g.add(ceil);
  for (let i = -3; i <= 3; i++) g.add(box(0.3, 0.3, D, M.woodDark(), i * 2.2, H - 0.3, 0));
  // window with a light shaft (left wall)
  const win = mesh(new THREE.PlaneGeometry(2.2, 3.2), new THREE.MeshBasicMaterial({ color: 0xcfe0ff }), -W / 2 + 0.05, 3.4, -1.5); win.rotation.y = Math.PI / 2; g.add(win);
  g.add(box(0.2, 3.4, 0.2, M.woodDark(), -W / 2 + 0.1, 1.7, -2.6), box(0.2, 3.4, 0.2, M.woodDark(), -W / 2 + 0.1, 1.7, -0.4), box(0.2, 0.2, 2.4, M.woodDark(), -W / 2 + 0.1, 3.4, -1.5));
  const sun = new THREE.SpotLight(0xdfe8ff, 120, 30, 0.5, 0.6, 1); sun.position.set(-W / 2 + 0.5, 4.2, -1.5); sun.target.position.set(2.5, 0, 1); sun.castShadow = true; g.add(sun, sun.target);
  // bookshelves across the back wall
  const bookCols = [0x7a1f28, 0x1f3f7a, 0x3a5a2a, 0x8a6a2a, 0x4a2a5a, 0x2a2a2a, 0x6a4a2a];
  for (const sx of [-4.4, -0.2, 4.0]) { g.add(box(3.8, 4.6, 0.1, M.wood([2, 2], 0x3a2414, false), sx, 0, -D / 2 + 0.08)); for (const ex of [-1.9, 1.9]) g.add(box(0.12, 4.6, 0.7, M.wood([1, 2], 0x5a3a20, false), sx + ex, 0, -D / 2 + 0.4)); for (let row = 0; row < 4; row++) { let x = sx - 1.75; const y = 0.2 + row * 1.12; g.add(box(3.6, 0.07, 0.7, M.woodDark(), sx, y - 0.04, -D / 2 + 0.45)); while (x < sx + 1.6) { const bw = 0.12 + r() * 0.12, bh = 0.6 + r() * 0.4; g.add(box(bw, bh, 0.45, std(bookCols[(r() * bookCols.length) | 0]), x, y, -D / 2 + 0.5)); x += bw + 0.015; if (r() < 0.08) x += 0.4; } } }
  g.add(box(3.8, 0.2, 0.9, M.woodDark(), -4.4, 4.6, -D / 2 + 0.4), box(3.8, 0.2, 0.9, M.woodDark(), -0.2, 4.6, -D / 2 + 0.4), box(3.8, 0.2, 0.9, M.woodDark(), 4.0, 4.6, -D / 2 + 0.4));
  // fireplace (right wall)
  const fp = new THREE.Group(); fp.position.set(W / 2 - 0.5, 0, -1.0); fp.rotation.y = -Math.PI / 2; fp.add(box(3.4, 3.4, 1.0, M.stoneDark([2, 2]), 0, 0, 0)); fp.add(box(2.0, 1.8, 0.3, std(0x120c08), 0, 0.2, 0.55)); const fl = mesh(new THREE.ConeGeometry(0.5, 1.0, 8), new THREE.MeshBasicMaterial({ color: 0xff9a30 }), 0, 0.9, 0.55); fp.add(fl); fp.add(mesh(new THREE.ConeGeometry(0.28, 0.7, 8), new THREE.MeshBasicMaterial({ color: 0xffe080 }), 0, 0.8, 0.58)); const pl = new THREE.PointLight(0xff8a30, 22, 16, 1.6); pl.position.set(0, 1.2, 1.2); fp.add(pl); g.add(fp);
  // desk with lamp
  const desk = new THREE.Group(); desk.position.set(0.4, 0, 0.2); desk.add(box(4.2, 0.18, 1.9, M.wood([2, 1], 0x5a3a20, false), 0, 1.4, 0)); for (const [x, z] of [[-1.9, -0.8], [1.9, -0.8], [-1.9, 0.8], [1.9, 0.8]]) desk.add(box(0.22, 1.4, 0.22, M.woodDark(), x, 0, z)); desk.add(box(1.2, 1.2, 1.6, M.wood([1, 1], 0x4a2e18, false), -1.2, 0.1, 0)); desk.add(box(3.8, 0.02, 1.6, std(0x2a4a3a, { roughness: 1 }), 0, 1.585, 0)); g.add(desk);
  const dmap = mesh(new THREE.PlaneGeometry(1.8, 1.2), new THREE.MeshStandardMaterial({ map: mapTexture(), roughness: 0.9 }), 0.2, 1.605, 0.1); dmap.rotation.x = -Math.PI / 2; dmap.rotation.z = 0.2; g.add(dmap); dmap.position.add(desk.position);
  g.add(cyl(0.08, 0.1, 0.5, std(0xc08a3a, { metalness: 0.8, roughness: 0.4 }), 1.9, 1.6, -0.1, 10)); const lamp = mesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffd080 }), 1.9, 2.2, -0.1); g.add(lamp); const lp = new THREE.PointLight(0xffc070, 12, 12, 1.6); lp.position.set(1.9, 2.3, -0.1); g.add(lp);
  g.add(cyl(0.45, 0.4, 0.15, M.wood([1, 1], 0x7a5232), 0.5, 0.7, 1.9, 14)); g.add(cyl(0.06, 0.06, 0.7, M.woodDark(), 0.5, 0.0, 1.9, 8)); const chair = new THREE.Group(); chair.position.set(0.5, 0, 1.9); chair.add(box(0.9, 0.12, 0.9, M.wood([1, 1], 0x6e4a2a), 0, 0.8, 0), box(0.9, 1.0, 0.1, M.wood([1, 1], 0x6e4a2a), 0, 0.9, 0.42)); for (const [x, z] of [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]]) chair.add(box(0.08, 0.8, 0.08, M.woodDark(), x, 0, z)); g.add(chair);
  // rug, globe, chest, armour, ladder, candles, barrels
  const rg = mesh(new THREE.PlaneGeometry(6, 4), new THREE.MeshStandardMaterial({ map: rugTexture('#2a3f6a', '#c9a24a', '#8a2a2a'), roughness: 1 }), 0.4, 0.012, 1.0); rg.rotation.x = -Math.PI / 2; g.add(rg);
  const globe = new THREE.Group(); globe.position.set(-6.0, 0, 3.0); globe.add(cyl(0.4, 0.5, 0.2, M.woodDark(), 0, 0, 0, 12), cyl(0.06, 0.06, 1.1, M.woodDark(), 0, 0.2, 0, 8)); globe.add(mesh(new THREE.SphereGeometry(0.75, 24, 18), new THREE.MeshStandardMaterial({ map: mapTexture(), roughness: 0.6 }), 0, 1.5, 0)); globe.add(mesh(new THREE.TorusGeometry(0.85, 0.04, 6, 28), std(0xc08a3a, { metalness: 0.8, roughness: 0.4 }), 0, 1.5, 0)); g.add(globe);
  const chest = new THREE.Group(); chest.position.set(-5.4, 0, -3.5); chest.add(box(1.6, 0.8, 0.9, M.wood([1, 1], 0x4a2e18, false), 0, 0, 0)); chest.add(box(1.6, 0.14, 0.9, M.wood([1, 1], 0x4a2e18, false), 0, 0.8, 0)); chest.add(box(0.12, 0.98, 0.94, M.metal(), -0.5, 0, 0), box(0.12, 0.98, 0.94, M.metal(), 0.5, 0, 0)); g.add(chest);
  const arm = new THREE.Group(); arm.position.set(6.4, 0, 3.6); arm.rotation.y = -0.5; arm.add(cyl(0.38, 0.32, 1.0, std(0x8a8f98, { metalness: 0.85, roughness: 0.35 }), 0, 0.9, 0, 12), mesh(new THREE.SphereGeometry(0.24, 14, 10), std(0x9aa0a8, { metalness: 0.85, roughness: 0.3 }), 0, 2.2, 0), cyl(0.12, 0.2, 0.9, std(0x8a8f98, { metalness: 0.8, roughness: 0.4 }), -0.15, 0, 0, 8), cyl(0.12, 0.2, 0.9, std(0x8a8f98, { metalness: 0.8, roughness: 0.4 }), 0.15, 0, 0, 8)); g.add(arm);
  g.add(barrel(6.6, -4.6, 1.1), barrel(5.7, -5.0, 1.0), crate(-6.4, -5.0, 1.0, 0.2), crate(-6.4, -1.5, 0.8, 0.5));
  for (const x of [-2.8, 3.4]) { const c = new THREE.Group(); c.position.set(x, 0, -4.6); c.add(cyl(0.15, 0.2, 0.7, std(0xf0e6c8, { roughness: 0.8 }), 0, 0, 0, 10)); const f = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffc060 })); f.position.y = 0.82; f.scale.y = 1.5; c.add(f); g.add(c); }
  // chandelier
  const ch = new THREE.Group(); ch.position.set(0, 5.0, 0); ch.add(mesh(new THREE.TorusGeometry(0.9, 0.05, 6, 24), std(0x3a3a3a, { metalness: 0.7, roughness: 0.4 }), 0, 0, 0).rotateX(Math.PI / 2)); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ch.add(cyl(0.05, 0.05, 0.3, std(0xf0e6c8), Math.cos(a) * 0.9, 0.0, Math.sin(a) * 0.9, 8)); const f = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffc060 })); f.position.set(Math.cos(a) * 0.9, 0.4, Math.sin(a) * 0.9); ch.add(f); } ch.add(cyl(0.01, 0.01, 1.2, M.woodDark(), 0, 0.2, 0, 4)); const cl = new THREE.PointLight(0xffb060, 14, 18, 1.5); cl.position.y = -0.2; ch.add(cl); g.add(ch);
  // papers on the floor
  for (const [x, z, a] of [[-1.5, 3.8, 0.3], [2.5, 4.2, -0.4], [-3.2, 1.6, 0.9]]) { const p = mesh(new THREE.PlaneGeometry(0.5, 0.36), std(0xefe2c0, { roughness: 1 }), x, 0.02, z); p.rotation.set(-Math.PI / 2, 0, a); g.add(p); }
  const bst = (x, z) => { for (let i = 0; i < 5; i++) g.add(box(0.7 - i * 0.05, 0.13, 0.5, std(bookCols[i % 7]), x, i * 0.13, z)); }; bst(3.8, 3.4); bst(-2.4, 4.4);
  put('compass', 1.2, 1.6, -0.3, 0.5); put('letter', -1.0, 1.605, 0.8, 0.5); put('quill', 2.8, 1.6, 0.5); put('key', -5.2, 0.9, -3.5, 0.2); put('ring', 2.1, 1.6, 0.9, 0.5);
  put('hourglass', -4.0, 4.82, -D / 2 + 0.5, 0.0); put('seal', -0.6, 1.6, -0.4, 0.4); put('goblet', 4.4, 4.82, -D / 2 + 0.5, 0.0); put('spyglass', -6.3, 0.9, -1.5, 1.2); put('dagger', 0.0, 4.82, -D / 2 + 0.5, 0.3);
  g.userData.hotspots = P; return g;
}
