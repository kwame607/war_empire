import { THREE, M, rng } from './lib.js';

// ---------- materials ----------
const cache = {};
const std = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8, ...o });
const steel = () => cache.steel ?? (cache.steel = std(0xb9c0c8, { metalness: 0.85, roughness: 0.32 }));
const bronze = () => cache.bronze ?? (cache.bronze = std(0xc08a3a, { metalness: 0.8, roughness: 0.35 }));
const darkSteel = () => cache.dsteel ?? (cache.dsteel = std(0x6c737c, { metalness: 0.8, roughness: 0.4 }));
const leather = (c = 0x5b3a22) => std(c, { roughness: 0.9 });
const skinTone = [0xd9b48a, 0xc79a6e, 0x8a5a3c, 0x6b4128, 0xe2c29c];

function clothMat(color, seed = 1) {
  const key = 'cl' + color; if (cache[key]) return cache[key];
  const W = 128, c = document.createElement('canvas'); c.width = W; c.height = W; const x = c.getContext('2d'); const r = rng(seed);
  const col = new THREE.Color(color); x.fillStyle = '#' + col.getHexString(); x.fillRect(0, 0, W, W);
  for (let i = 0; i < W; i += 3) { x.fillStyle = `rgba(0,0,0,${0.05 + r() * 0.06})`; x.fillRect(i, 0, 1, W); }
  for (let i = 0; i < W; i += 4) { x.fillStyle = `rgba(255,255,255,${0.03 + r() * 0.04})`; x.fillRect(0, i, W, 1); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return (cache[key] = new THREE.MeshStandardMaterial({ map: t, roughness: 0.95 }));
}

/** Painted shield face: rim, field colour, boss, and a simple device. */
function shieldTexture(field, device, rim, round = true, seed = 2) {
  const key = `sh${field}${device}${rim}${round}`; if (cache[key]) return cache[key];
  const W = 256, H = round ? 256 : 384, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); const r = rng(seed);
  const hex = (n) => '#' + new THREE.Color(n).getHexString();
  x.fillStyle = hex(rim); x.fillRect(0, 0, W, H);
  x.fillStyle = hex(field);
  if (round) { x.beginPath(); x.arc(W / 2, H / 2, W / 2 - 14, 0, 7); x.fill(); } else { x.fillRect(14, 14, W - 28, H - 28); }
  x.fillStyle = hex(device);
  if (round) { for (let i = 0; i < 8; i++) { x.save(); x.translate(W / 2, H / 2); x.rotate((i * Math.PI) / 4); x.fillRect(-6, 26, 12, 80); x.restore(); } x.beginPath(); x.arc(W / 2, H / 2, 34, 0, 7); x.fill(); }
  else { x.fillRect(W / 2 - 14, 30, 28, H - 60); x.fillRect(40, H / 2 - 14, W - 80, 28); x.beginPath(); x.arc(W / 2, H / 2, 40, 0, 7); x.fillStyle = hex(rim); x.fill(); x.beginPath(); x.arc(W / 2, H / 2, 20, 0, 7); x.fillStyle = hex(device); x.fill(); }
  for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(0,0,0,${r() * 0.1})`; x.fillRect(r() * W, r() * H, 2, 2); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return (cache[key] = new THREE.MeshStandardMaterial({ map: t, roughness: 0.55, metalness: 0.15 }));
}

const mesh = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m; };
const limb = (r0, r1, len, mat) => { const g = new THREE.Group(); const m = mesh(new THREE.CylinderGeometry(r1, r0, len, 8), mat, 0, -len / 2, 0); g.add(m); return g; };

/** A human figure ~1.85 tall, facing +z, with pivoting arms and legs. Returns the group and its joints. */
function human(o) {
  const { cloth, trim, skin, stride = 0, armor = 'none', seed = 1, tall = 1 } = o;
  const g = new THREE.Group(); const r = rng(seed);
  const skinM = std(skin, { roughness: 0.75 }); const clothM = clothMat(cloth, seed); const trimM = std(trim, { roughness: 0.6, metalness: 0.2 });
  const pants = std(o.pants ?? 0x4a3a2c, { roughness: 0.95 });
  const J = {};
  // legs
  for (const s of [-1, 1]) {
    const hip = new THREE.Group(); hip.position.set(s * 0.12, 0.92, 0); hip.rotation.x = s * stride;
    hip.add(mesh(new THREE.CylinderGeometry(0.1, 0.075, 0.46, 8), pants, 0, -0.23, 0));
    const knee = new THREE.Group(); knee.position.y = -0.46; knee.rotation.x = s === 1 ? Math.max(0, stride) * 0.6 : Math.max(0, -stride) * 0.6;
    knee.add(mesh(new THREE.CylinderGeometry(0.075, 0.06, 0.44, 8), armor === 'plate' ? darkSteel() : pants, 0, -0.22, 0));
    knee.add(mesh(new THREE.BoxGeometry(0.13, 0.09, 0.26), leather(0x3a2a1c), 0, -0.46, 0.05));
    hip.add(knee); g.add(hip);
  }
  // torso
  const chestMat = armor === 'plate' ? steel() : armor === 'mail' ? darkSteel() : armor === 'leather' ? leather(0x6b4a2e) : clothM;
  g.add(mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.62, 10), chestMat, 0, 1.22, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.21, 0.23, 0.22, 10), clothM, 0, 0.86, 0)); // tunic skirt
  const skirt = mesh(new THREE.CylinderGeometry(0.23, 0.31, 0.34, 12, 1, true), clothM, 0, 0.74, 0); skirt.material = skirt.material.clone(); skirt.material.side = THREE.DoubleSide; g.add(skirt);
  g.add(mesh(new THREE.CylinderGeometry(0.215, 0.215, 0.06, 10), leather(0x3a2a1c), 0, 0.98, 0)); // belt
  g.add(mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.12, 8), skinM, 0, 1.58, 0)); // neck
  // shoulders / arms
  const arms = {};
  for (const s of [-1, 1]) {
    const sh = new THREE.Group(); sh.position.set(s * 0.3, 1.45, 0);
    sh.add(mesh(new THREE.SphereGeometry(armor === 'plate' ? 0.125 : 0.095, 10, 8), armor === 'plate' ? steel() : armor === 'mail' ? darkSteel() : clothM));
    sh.add(mesh(new THREE.CylinderGeometry(0.075, 0.06, 0.34, 8), armor === 'none' ? clothM : armor === 'plate' ? steel() : darkSteel(), 0, -0.17, 0));
    const el = new THREE.Group(); el.position.y = -0.34; el.add(mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.3, 8), skinM, 0, -0.15, 0)); el.add(mesh(new THREE.SphereGeometry(0.055, 8, 6), skinM, 0, -0.31, 0));
    sh.add(el); g.add(sh); arms[s] = { sh, el };
  }
  J.armL = arms[-1]; J.armR = arms[1];
  // head
  const head = new THREE.Group(); head.position.y = 1.78;
  const hm = mesh(new THREE.SphereGeometry(0.15, 14, 12), skinM); hm.scale.set(0.92, 1.08, 1); head.add(hm);
  for (const s of [-1, 1]) head.add(mesh(new THREE.SphereGeometry(0.018, 6, 4), std(0x201813), s * 0.055, 0.02, 0.135)); // eyes
  head.add(mesh(new THREE.BoxGeometry(0.03, 0.04, 0.03), skinM, 0, -0.01, 0.15)); // nose
  if (o.beard) head.add(mesh(new THREE.SphereGeometry(0.1, 8, 6), std(o.beard, { roughness: 1 }), 0, -0.08, 0.075));
  g.add(head); J.head = head;
  g.scale.setScalar(tall);
  g.userData.J = J; g.userData.mats = { clothM, trimM, skinM };
  return g;
}

function helmet(kind, side, c) {
  const g = new THREE.Group();
  if (kind === 'spearmen') { // bronze corinthian-ish helm with brow, cheek guards, crest
    g.add(mesh(new THREE.SphereGeometry(0.175, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.62), bronze(), 0, 0.03, -0.005));
    for (const s of [-1, 1]) g.add(mesh(new THREE.BoxGeometry(0.03, 0.15, 0.13), bronze(), s * 0.145, -0.05, 0.03));
    g.add(mesh(new THREE.BoxGeometry(0.03, 0.12, 0.02), bronze(), 0, -0.02, 0.16)); // nasal
    const crest = mesh(new THREE.BoxGeometry(0.05, 0.14, 0.32), std(c.plume, { roughness: 1 }), 0, 0.21, -0.02); g.add(crest);
  } else if (kind === 'heavy') { // closed great helm with visor slit and tall crest
    g.add(mesh(new THREE.CylinderGeometry(0.17, 0.175, 0.3, 12), steel(), 0, -0.02, 0));
    g.add(mesh(new THREE.SphereGeometry(0.17, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), steel(), 0, 0.13, 0));
    g.add(mesh(new THREE.BoxGeometry(0.22, 0.03, 0.02), std(0x0e0b09), 0, 0.03, 0.168));
    g.add(mesh(new THREE.BoxGeometry(0.03, 0.2, 0.02), std(0x0e0b09), 0, -0.08, 0.17));
    g.add(mesh(new THREE.BoxGeometry(0.07, 0.26, 0.2), std(c.plume, { roughness: 1 }), 0, 0.3, -0.03));
  } else if (kind === 'archers') { // soft hood/cap with a feather
    g.add(mesh(new THREE.SphereGeometry(0.168, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), std(c.cloak, { roughness: 1 }), 0, 0.035, -0.01));
    const f = mesh(new THREE.ConeGeometry(0.02, 0.26, 5), std(0xefe6cf), 0.1, 0.2, -0.05); f.rotation.z = -0.5; g.add(f);
  } else { // cavalry: conical helm with mail aventail
    g.add(mesh(new THREE.ConeGeometry(0.16, 0.26, 12), steel(), 0, 0.17, 0));
    g.add(mesh(new THREE.SphereGeometry(0.168, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), steel(), 0, 0.03, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.16, 12, 1, true), darkSteel(), 0, -0.1, -0.03));
  }
  return g;
}

const COL = {
  p: { cloak: 0x25427f, trim: 0xe0b552, field: 0x25427f, device: 0xe0b552, rim: 0xb98e2e, plume: 0xe0b552, horse: 0x74502f, cloth: 0x2d4d94 },
  e: { cloak: 0x8f2b30, trim: 0x2a2020, field: 0x8f2b30, device: 0x1f1a18, rim: 0x3a2e28, plume: 0x1b1717, horse: 0x54423a, cloth: 0xa23338 },
};

export const FWD = { p: -3 * Math.PI / 4, e: Math.PI / 4 };

export function infantry(kind, side, seed) {
  const r = rng(seed); const c = COL[side];
  const armor = kind === 'heavy' ? 'plate' : kind === 'spearmen' ? 'mail' : 'leather';
  const stride = (r() - 0.5) * 0.28;
  const h = human({ cloth: c.cloth, trim: c.trim, skin: skinTone[(r() * skinTone.length) | 0], stride, armor, seed, tall: kind === 'heavy' ? 1.08 : 0.98 + r() * 0.06, beard: r() < 0.35 ? 0x3a2a1c : null, pants: kind === 'archers' ? 0x5a4a34 : 0x4a3a2c });
  const J = h.userData.J;
  const head = J.head; const hel = helmet(kind, side, c); head.add(hel);
  // cloak over the back
  const cape = mesh(new THREE.BoxGeometry(0.46, 0.78, 0.05), clothMat(c.cloak, seed + 3), 0, 1.1, -0.22); cape.rotation.x = 0.1; h.add(cape);

  if (kind === 'spearmen' || kind === 'heavy') {
    const round = kind === 'spearmen';
    const sh = mesh(round ? new THREE.CylinderGeometry(0.4, 0.4, 0.07, 28) : new THREE.BoxGeometry(0.5, 0.95, 0.06), shieldTexture(c.field, c.device, c.rim, round, seed), 0, 0, 0);
    if (round) { sh.rotation.x = Math.PI / 2; }
    // texture is on the cap/face; make boss
    const arm = J.armL; arm.sh.rotation.set(-0.35, 0, 0.15); arm.el.rotation.x = -1.2;
    const holder = new THREE.Group(); holder.position.set(-0.05, -0.34, 0.2); holder.add(sh); if (round) { sh.position.set(0, 0, 0.08); const boss = mesh(new THREE.SphereGeometry(0.07, 10, 8), bronze(), 0, 0, 0.13); boss.scale.z = 0.6; holder.add(boss); } else { holder.rotation.y = 0.2; }
    arm.el.add(holder); holder.rotation.x = round ? 0 : 0;
    // shield faces forward (+z): rotate cylinder cap to +z done via rotation.x
    const spL = kind === 'heavy' ? 2.25 : 2.8; const spear = new THREE.Group();
    spear.add(mesh(new THREE.CylinderGeometry(0.022, 0.026, spL, 6), M.woodDark(), 0, spL / 2 - 0.5, 0));
    spear.add(mesh(new THREE.ConeGeometry(0.05, 0.3, 6), steel(), 0, spL - 0.35, 0));
    const pen = mesh(new THREE.PlaneGeometry(0.22, 0.14), new THREE.MeshStandardMaterial({ color: c.cloak, side: THREE.DoubleSide, roughness: 1 }), 0.12, spL - 0.6, 0); spear.add(pen);
    const aR = J.armR; aR.sh.rotation.set(-1.0, 0, -0.15); aR.el.rotation.x = -0.6;
    spear.position.set(0, -0.4, 0.05); spear.rotation.x = 1.45 + 0.06 * (r() - 0.5); aR.el.add(spear);
    // spear is carried upright-ish: rotate so it stands up
    spear.rotation.set(0.0 + (r() - 0.5) * 0.08, 0, -0.04); spear.position.set(0.0, -0.32, 0.02); aR.sh.rotation.set(-0.5, 0, -0.1); aR.el.rotation.x = -0.9;
  }
  if (kind === 'archers') {
    const aL = J.armL; aL.sh.rotation.set(-1.5, 0, 0.1); aL.el.rotation.x = 0.0;
    const bowG = new THREE.Group(); bowG.position.set(0, -0.36, 0.05); bowG.rotation.y = -Math.PI / 2;
    const bow = mesh(new THREE.TorusGeometry(0.52, 0.028, 6, 20, Math.PI), M.woodDark(), 0, 0, 0); bow.rotation.z = -Math.PI / 2; bowG.add(bow);
    bowG.add(mesh(new THREE.CylinderGeometry(0.006, 0.006, 1.04, 4), std(0xe8dcc0), 0, 0, 0));
    aL.el.add(bowG);
    const aR = J.armR; aR.sh.rotation.set(-0.9, 0, -0.35); aR.el.rotation.x = -1.9;
    const q = mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.55, 8), leather(0x5a3a20), 0.1, 1.3, -0.27); q.rotation.z = 0.25; h.add(q);
    for (let i = 0; i < 4; i++) h.add(mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.2, 4), std(0xefe4c8), 0.16 + i * 0.015, 1.62, -0.27));
  }
  h.rotation.y = FWD[side] + (r() - 0.5) * 0.18;
  return h;
}

export function rider(side, seed) {
  const r = rng(seed); const c = COL[side];
  const g = new THREE.Group();
  const hm = std(c.horse, { roughness: 0.7 }); const hm2 = std(new THREE.Color(c.horse).multiplyScalar(0.7).getHex(), { roughness: 0.8 });
  // horse body: capsule barrel + hindquarters
  const body = mesh(new THREE.CapsuleGeometry(0.34, 0.9, 6, 12), hm, 0, 1.0, 0); body.rotation.x = Math.PI / 2; g.add(body);
  const rump = mesh(new THREE.SphereGeometry(0.38, 12, 10), hm, 0, 1.05, -0.52); g.add(rump);
  const chest = mesh(new THREE.SphereGeometry(0.36, 12, 10), hm, 0, 1.05, 0.5); g.add(chest);
  // legs (two segments)
  for (const [x, z, front] of [[-0.2, -0.55, 0], [0.2, -0.55, 0], [-0.2, 0.5, 1], [0.2, 0.5, 1]]) {
    const up = new THREE.Group(); up.position.set(x, 0.85, z); up.rotation.x = (r() - 0.5) * 0.5;
    up.add(mesh(new THREE.CylinderGeometry(0.09, 0.06, 0.45, 8), hm, 0, -0.22, 0));
    const lo = new THREE.Group(); lo.position.y = -0.45; lo.rotation.x = (r() - 0.3) * 0.5; lo.add(mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.42, 8), hm2, 0, -0.21, 0)); lo.add(mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.07, 8), std(0x1b1512), 0, -0.44, 0.0)); up.add(lo); g.add(up);
  }
  // neck, head
  const neck = mesh(new THREE.CapsuleGeometry(0.16, 0.5, 4, 8), hm, 0, 1.45, 0.82); neck.rotation.x = 0.6; g.add(neck);
  const hd = mesh(new THREE.BoxGeometry(0.2, 0.28, 0.5), hm, 0, 1.78, 1.12); hd.rotation.x = 0.55; g.add(hd);
  g.add(mesh(new THREE.BoxGeometry(0.18, 0.2, 0.18), hm2, 0, 1.64, 1.38).rotateX?.(0.55) ?? new THREE.Group());
  for (const s of [-1, 1]) { const ear = mesh(new THREE.ConeGeometry(0.04, 0.12, 5), hm, s * 0.07, 2.0, 0.98); g.add(ear); }
  const mane = mesh(new THREE.BoxGeometry(0.06, 0.55, 0.14), std(0x1f1812, { roughness: 1 }), 0, 1.6, 0.66); mane.rotation.x = 0.6; g.add(mane);
  const tail = mesh(new THREE.ConeGeometry(0.1, 0.8, 7), std(0x1f1812, { roughness: 1 }), 0, 0.85, -0.98); tail.rotation.x = -2.5; g.add(tail);
  // tack
  const blanket = mesh(new THREE.BoxGeometry(0.78, 0.06, 0.8), clothMat(c.cloak, seed + 5), 0, 1.34, -0.05); g.add(blanket);
  const trimStrip = mesh(new THREE.BoxGeometry(0.8, 0.065, 0.08), std(c.trim, { metalness: 0.3, roughness: 0.5 }), 0, 1.34, 0.3); g.add(trimStrip);
  // rider
  const h = human({ cloth: c.cloth, trim: c.trim, skin: skinTone[(r() * skinTone.length) | 0], armor: 'mail', seed, tall: 0.98, beard: r() < 0.4 ? 0x3a2a1c : null });
  h.position.set(0, 0.62, -0.05);
  const J = h.userData.J;
  // legs astride: rotate hips outward
  h.children.forEach((ch) => { if (ch.isGroup && Math.abs(ch.position.x) === 0.12 && ch.position.y === 0.92) { ch.rotation.z = Math.sign(ch.position.x) * -0.5; ch.rotation.x = -0.3; } });
  J.head.add(helmet('cavalry', side, c));
  const shield = mesh(new THREE.BoxGeometry(0.46, 0.64, 0.05), shieldTexture(c.field, c.device, c.rim, false, seed), 0, 0, 0); shield.rotation.y = 0.3;
  const aL = J.armL; aL.sh.rotation.set(-0.5, 0, 0.1); aL.el.rotation.x = -1.2; const hol = new THREE.Group(); hol.position.set(-0.05, -0.3, 0.14); hol.add(shield); aL.el.add(hol);
  const aR = J.armR; aR.sh.rotation.set(-1.3, 0, -0.3); aR.el.rotation.x = -0.4;
  const lance = new THREE.Group(); lance.add(mesh(new THREE.CylinderGeometry(0.022, 0.028, 3.3, 6), M.woodDark(), 0, 0, 0)); lance.add(mesh(new THREE.ConeGeometry(0.05, 0.32, 6), steel(), 0, 1.75, 0));
  const pen = mesh(new THREE.PlaneGeometry(0.4, 0.2), new THREE.MeshStandardMaterial({ color: c.trim, side: THREE.DoubleSide, roughness: 1 }), 0.22, 1.35, 0); lance.add(pen);
  lance.position.set(0, -0.3, 0.1); lance.rotation.x = Math.PI / 2 - 0.28; lance.position.z = 0.9; lance.position.y = 0.3; aR.el.add(lance);
  lance.position.set(0, -0.2, 0.0); lance.rotation.set(1.15, 0, 0); 
  g.add(h);
  g.rotation.y = FWD[side] + (r() - 0.5) * 0.1;
  return g;
}
