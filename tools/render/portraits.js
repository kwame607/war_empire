import { THREE, M, rng, stripeTexture } from './lib.js';

const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.75, ...o });
const sph = (r, m, sx = 1, sy = 1, sz = 1, x = 0, y = 0, z = 0) => { const s = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 20), m); s.scale.set(sx, sy, sz); s.position.set(x, y, z); s.castShadow = true; return s; };
const bx = (w, h, d, m, x = 0, y = 0, z = 0) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = true; return b; };
const cy = (rt, rb, h, m, x = 0, y = 0, z = 0, seg = 24) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m); c.position.set(x, y, z); c.castShadow = true; return c; };
const tor = (r, t, m, x = 0, y = 0, z = 0, rx = Math.PI / 2) => { const o = new THREE.Mesh(new THREE.TorusGeometry(r, t, 12, 36), m); o.position.set(x, y, z); o.rotation.x = rx; o.castShadow = true; return o; };

/** opts: skin, hair, hairStyle(none|short|long|braid|bun), beard(none|short|full|braids), gender, age(0-2), head(turban|wrap|circlet|nasal|crest|beret|laurel|cap|none), cloak, trim, collar(fur|none|ruff|gold), headColor, eye */
export function portrait(o) {
  const g = new THREE.Group(); const r = rng(o.seed || 3);
  const skin = mat(o.skin, { roughness: 0.55 });
  const hair = mat(o.hair ?? 0x1a1410, { roughness: 0.9 });
  const fem = o.gender === 'f'; const age = o.age ?? 1;
  // --- shoulders / body ---
  const robe = mat(o.cloak, { roughness: 0.85 }); const trim = mat(o.trim ?? 0xd4ac4f, { metalness: 0.6, roughness: 0.4 });
  const body = sph(1.0, robe, fem ? 1.25 : 1.5, 0.78, 0.8, 0, -0.35, 0); g.add(body);
  g.add(cy(0.34, 0.42, 0.55, skin, 0, 0.55, 0.0, 20));                    // neck
  const sq = bx(1.9, 0.18, 0.2, trim, 0, -0.05, 0.62); sq.rotation.x = -0.25; sq.rotation.z = 0; if (o.collar !== 'fur') g.add(sq);
  if (o.armor) { for (const s of [-1, 1]) g.add(sph(0.52, mat(0x8c9099, { metalness: 0.7, roughness: 0.35 }), 1, 0.8, 1, s * 1.25, 0.02, 0)); }
  if (o.sash) { const sa = bx(0.3, 1.6, 0.12, mat(o.sash), -0.3, -0.45, 0.72); sa.rotation.z = 0.55; g.add(sa); }
  if (o.collar === 'fur') { for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; g.add(sph(0.3, mat(0x6b5a48, { roughness: 1 }), 1, 0.8, 1, Math.cos(a) * 0.92, 0.18 + Math.sin(a * 2) * 0.03, Math.sin(a) * 0.6 + 0.08)); } }
  if (o.collar === 'ruff') g.add(tor(0.62, 0.17, mat(0xf2ead6, { roughness: 0.9 }), 0, 0.4, 0.05, Math.PI / 2 - 0.15));
  if (o.collar === 'gold') { g.add(tor(0.55, 0.06, M.gold(), 0, 0.3, 0.15, Math.PI / 2 - 0.35)); g.add(sph(0.11, mat(o.gem ?? 0x9c2f3b, { metalness: 0.3, roughness: 0.2 }), 1, 1, 1, 0, -0.08, 0.72)); }
  // --- head ---
  const head = new THREE.Group(); head.position.y = 1.35;
  head.add(sph(0.62, skin, 0.9, 1.08, 0.95, 0, 0, 0));                                   // cranium
  head.add(sph(0.5, skin, fem ? 0.82 : 0.95, 0.8, 0.9, 0, -0.38, 0.1));                    // jaw / chin
  for (const s of [-1, 1]) head.add(sph(0.12, skin, 0.5, 1, 0.7, s * 0.57, -0.05, 0));    // ears
  const eyeY = 0.05, eyeX = 0.22, eyeZ = 0.52;
  for (const s of [-1, 1]) {
    head.add(sph(0.095, mat(0xf4efe4, { roughness: 0.3 }), 1.15, 0.8, 0.8, s * eyeX, eyeY, eyeZ));
    head.add(sph(0.055, mat(o.eye ?? 0x3a2414, { roughness: 0.2 }), 1, 1, 0.6, s * eyeX, eyeY, eyeZ + 0.07));
    head.add(sph(0.026, mat(0x050505), 1, 1, 0.5, s * eyeX, eyeY, eyeZ + 0.105));
    const brow = bx(0.24, 0.045 + (o.age === 2 ? 0.015 : 0), 0.06, o.age === 2 ? mat(0xcfcfcf) : hair, s * eyeX, eyeY + 0.17 + (fem ? 0.02 : 0), eyeZ - 0.02); brow.rotation.z = s * -0.12 + (o.stern ? s * -0.12 : 0); head.add(brow);
    const lid = bx(0.2, 0.03, 0.05, skin, s * eyeX, eyeY + 0.07, eyeZ + 0.01); head.add(lid);
  }
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.34, 4), skin); nose.position.set(0, -0.1, 0.62); nose.rotation.x = -0.2; nose.scale.set(1, 1, 0.9); head.add(nose);
  head.add(sph(0.07, skin, 1.3, 0.8, 0.8, -0.07, -0.22, 0.62), sph(0.07, skin, 1.3, 0.8, 0.8, 0.07, -0.22, 0.62));
  head.add(bx(0.26, 0.035, 0.05, mat(fem ? 0xa8404a : 0x6b3a30), 0, -0.4, 0.58));    // mouth
  head.add(sph(0.1, mat(fem ? 0xb4505a : new THREE.Color(o.skin).multiplyScalar(0.7).getHex()), 1.6, 0.4, 0.5, 0, -0.45, 0.58));
  if (age >= 1) for (const s of [-1, 1]) head.add(bx(0.03, 0.18, 0.02, mat(0x000000, { transparent: true, opacity: 0.12 }), s * 0.2, -0.28, 0.62));
  if (age === 2) { for (const s of [-1, 1]) for (let k = 0; k < 3; k++) head.add(bx(0.2, 0.012, 0.02, mat(0x000000, { transparent: true, opacity: 0.15 }), s * 0.22, 0.26 + k * 0.05, 0.5)); }
  // hair
  const hs = o.hairStyle ?? 'short'; const hcol = hair;
  if (hs !== 'none' && !['helmet'].includes(o.headType)) {
    if (hs === 'short') head.add(sph(0.66, hcol, 0.94, 0.8, 0.98, 0, 0.18, -0.06));
    if (hs === 'long') { head.add(sph(0.66, hcol, 0.96, 0.85, 1.0, 0, 0.16, -0.08)); for (const s of [-1, 1]) head.add(bx(0.22, 1.05, 0.34, hcol, s * 0.6, -0.5, -0.1)); }
    if (hs === 'braid') { head.add(sph(0.66, hcol, 0.94, 0.8, 0.98, 0, 0.16, -0.06)); for (const s of [-1, 1]) for (let k = 0; k < 4; k++) head.add(sph(0.11, hcol, 0.9, 1.1, 0.9, s * 0.56, -0.25 - k * 0.2, 0.1)); }
    if (hs === 'bun') { head.add(sph(0.66, hcol, 0.94, 0.8, 0.98, 0, 0.16, -0.08)); head.add(sph(0.22, hcol, 1, 1, 1, 0, 0.62, -0.3)); }
  }
  if (o.beard && o.beard !== 'none') {
    const bm = o.age === 2 ? mat(0xd8d4cc, { roughness: 0.95 }) : hair;
    if (o.beard === 'short') head.add(sph(0.52, bm, 0.92, 0.55, 0.85, 0, -0.5, 0.12));
    if (o.beard === 'full') { head.add(sph(0.54, bm, 0.96, 0.72, 0.9, 0, -0.55, 0.1)); head.add(sph(0.3, bm, 1, 1.5, 0.8, 0, -0.95, 0.35)); }
    if (o.beard === 'braids') { head.add(sph(0.52, bm, 0.92, 0.6, 0.85, 0, -0.5, 0.12)); for (const x of [-0.12, 0.12]) { for (let k = 0; k < 5; k++) head.add(sph(0.075, bm, 1, 1.3, 1, x, -0.82 - k * 0.15, 0.4)); } head.add(sph(0.06, trim, 1, 1, 1, -0.12, -1.55, 0.4), sph(0.06, trim, 1, 1, 1, 0.12, -1.55, 0.4)); }
    head.add(sph(0.2, bm, 1.6, 0.35, 0.6, 0, -0.34, 0.58)); // moustache
  }
  // headgear
  const hc = mat(o.headColor ?? 0xf0ead8, { roughness: 0.9 });
  switch (o.headType) {
    case 'turban': { head.add(sph(0.68, hc, 0.98, 0.82, 1, 0, 0.22, -0.02)); for (let k = 0; k < 5; k++) { const t = tor(0.62 - k * 0.02, 0.13, hc, 0, 0.12 + k * 0.13, -0.02, Math.PI / 2 + 0.18 * (k % 2 ? 1 : -1)); head.add(t); } head.add(sph(0.18, mat(o.gem ?? 0x2f6a8a, { metalness: 0.4, roughness: 0.2 }), 1, 1, 0.5, 0, 0.35, 0.62)); head.add(tor(0.1, 0.03, trim, 0, 0.35, 0.64, 0)); break; }
    case 'wrap': { head.add(sph(0.7, hc, 1, 0.78, 1.02, 0, 0.26, -0.04)); for (let k = 0; k < 3; k++) head.add(tor(0.66, 0.1, hc, 0, 0.2 + k * 0.1, -0.02, Math.PI / 2 + (k - 1) * 0.28)); head.add(sph(0.2, hc, 1.4, 1, 1, 0.45, 0.62, 0.1), sph(0.16, hc, 1.2, 1, 1, 0.62, 0.55, 0.2)); head.add(tor(0.67, 0.035, trim, 0, 0.18, 0.03, Math.PI / 2 - 0.05)); break; }
    case 'cap': { head.add(sph(0.66, hc, 0.96, 0.7, 1, 0, 0.3, -0.02)); head.add(tor(0.62, 0.06, trim, 0, 0.18, -0.02, Math.PI / 2 - 0.1)); for (let k = 0; k < 6; k++) { const a = (k / 6) * 6.283; head.add(sph(0.05, trim, 1, 1, 1, Math.cos(a) * 0.55, 0.56, Math.sin(a) * 0.55)); } break; }
    case 'circlet': { head.add(tor(0.62, 0.05, M.gold(), 0, 0.4, 0, Math.PI / 2 - 0.12)); head.add(sph(0.1, mat(o.gem ?? 0x2f8a5a, { metalness: 0.3, roughness: 0.15 }), 1, 1.3, 0.6, 0, 0.5, 0.62)); for (const s of [-1, 1]) head.add(sph(0.05, M.gold(), 1, 1, 1, s * 0.3, 0.46, 0.58)); break; }
    case 'nasal': { head.add(sph(0.68, mat(0x8c9099, { metalness: 0.7, roughness: 0.35 }), 0.98, 0.9, 1, 0, 0.2, -0.02)); head.add(tor(0.66, 0.05, mat(0x6a6f77, { metalness: 0.7, roughness: 0.4 }), 0, 0.12, 0, Math.PI / 2 - 0.05)); head.add(bx(0.09, 0.5, 0.06, mat(0x8c9099, { metalness: 0.7, roughness: 0.35 }), 0, -0.02, 0.66)); head.add(bx(0.05, 0.4, 0.05, mat(0x8c9099, { metalness: 0.7 }), 0, 0.5, 0.6)); break; }
    case 'crest': { const st = mat(0xb08a3a, { metalness: 0.7, roughness: 0.35 }); head.add(sph(0.68, st, 0.98, 0.95, 1.02, 0, 0.18, -0.02)); head.add(tor(0.66, 0.05, st, 0, 0.1, 0, Math.PI / 2 - 0.05)); for (const s of [-1, 1]) head.add(bx(0.2, 0.55, 0.06, st, s * 0.58, -0.22, 0.2)); const cr = bx(0.14, 0.34, 1.2, mat(o.crest ?? 0xa33440), 0, 0.98, -0.02); cr.rotation.x = 0; head.add(cr); head.add(bx(0.09, 0.05, 0.2, st, 0, 0.8, 0.6)); break; }
    case 'beret': { head.add(cy(0.78, 0.7, 0.28, hc, 0.12, 0.62, -0.02, 28)); head.add(sph(0.7, hc, 1.1, 0.5, 1, 0.1, 0.52, -0.02)); const f = bx(0.04, 0.9, 0.12, mat(0xf5f0e6), 0.65, 0.95, -0.1); f.rotation.z = -0.9; head.add(f); head.add(sph(0.08, M.gold(), 1, 1, 1, 0.4, 0.62, 0.35)); break; }
    case 'laurel': { for (let k = 0; k < 18; k++) { const a = (k / 18) * Math.PI * 1.6 + Math.PI * 0.7; const l = sph(0.11, mat(0x5a8a3a), 1.5, 0.5, 0.8, Math.cos(a) * 0.65, 0.4 + Math.sin(k) * 0.02, Math.sin(a) * 0.65); l.rotation.y = -a; head.add(l); } head.add(tor(0.63, 0.03, mat(0x4a6a2a), 0, 0.38, 0, Math.PI / 2 - 0.12)); break; }
  }
  head.rotation.y = o.turn ?? 0.28; head.rotation.x = -0.04;
  g.add(head);
  return g;
}
