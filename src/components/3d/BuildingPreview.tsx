import { GLView, type ExpoWebGLRenderingContext } from 'expo-gl';
import * as THREE from 'three';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/theme';

type SceneCleanup = () => void;

/** A deliberately small, real-time 3D building proof of concept. */
export function BuildingPreview() {
  const yaw = useRef(0.45);
  const zoom = useRef(7.5);
  const cleanup = useRef<SceneCleanup | null>(null);
  const [zoomLabel, setZoomLabel] = useState(7.5);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_event, gesture) => Math.abs(gesture.dx) > 3 || Math.abs(gesture.dy) > 8,
      onPanResponderMove: (_event, gesture) => {
        yaw.current = 0.45 + gesture.dx * 0.012;
      },
    }),
  ).current;

  const changeZoom = useCallback((delta: number) => {
    zoom.current = Math.max(4.8, Math.min(11, zoom.current + delta));
    setZoomLabel(zoom.current);
  }, []);

  const onContextCreate = useCallback((gl: ExpoWebGLRenderingContext) => {
    try {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#8fb5c8');
      scene.fog = new THREE.Fog('#8fb5c8', 13, 25);

      const camera = new THREE.PerspectiveCamera(35, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 60);
      camera.position.set(5.8, 4.8, zoom.current);
      camera.lookAt(0, 1.1, 0);

      // expo-three currently pulls an obsolete React Native peer dependency.
      // Supply the small canvas surface Three.js expects and use Expo's GL context directly.
      const canvas = {
        width: gl.drawingBufferWidth,
        height: gl.drawingBufferHeight,
        clientWidth: gl.drawingBufferWidth,
        clientHeight: gl.drawingBufferHeight,
        style: {} as CSSStyleDeclaration,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        getContext: () => gl,
      };
      const renderer = new THREE.WebGLRenderer({
        canvas: canvas as unknown as HTMLCanvasElement,
        context: gl as unknown as WebGLRenderingContext,
        antialias: true,
      });
      renderer.setPixelRatio(1);
      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
      renderer.setClearColor('#8fb5c8');
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      scene.add(new THREE.HemisphereLight('#f3f1df', '#586044', 2.0));
      const sun = new THREE.DirectionalLight('#fff1cf', 2.4);
      sun.position.set(-4, 8, 5);
      sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024);
      scene.add(sun);

      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(18, 18),
        new THREE.MeshStandardMaterial({ color: '#718b48', roughness: 1 }),
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.06;
      ground.receiveShadow = true;
      scene.add(ground);

      const building = new THREE.Group();
      scene.add(building);

      const stone = new THREE.MeshStandardMaterial({ color: '#c5b18e', roughness: 0.92 });
      const stoneDark = new THREE.MeshStandardMaterial({ color: '#8c795e', roughness: 1 });
      const roof = new THREE.MeshStandardMaterial({ color: '#8d4632', roughness: 0.86 });
      const wood = new THREE.MeshStandardMaterial({ color: '#493021', roughness: 0.9 });
      const shadow = new THREE.MeshStandardMaterial({ color: '#30251d', roughness: 1 });

      const foundation = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.28, 2.8), stoneDark);
      foundation.position.y = 0.08;
      foundation.castShadow = true;
      foundation.receiveShadow = true;
      building.add(foundation);

      const walls = new THREE.Mesh(new THREE.BoxGeometry(3, 1.9, 2.5), stone);
      walls.position.y = 1.15;
      walls.castShadow = true;
      walls.receiveShadow = true;
      building.add(walls);

      // A triangular-prism roof gives the building a readable, low-poly silhouette.
      const roofGeometry = new THREE.BufferGeometry();
      const roofVertices = new Float32Array([
        -1.72, 2.08, -1.42, 1.72, 2.08, -1.42, 0, 3.18, -1.42,
        -1.72, 2.08, 1.42, 0, 3.18, 1.42, 1.72, 2.08, 1.42,
        -1.72, 2.08, -1.42, 0, 3.18, -1.42, 0, 3.18, 1.42,
        -1.72, 2.08, -1.42, 0, 3.18, 1.42, -1.72, 2.08, 1.42,
        1.72, 2.08, -1.42, 1.72, 2.08, 1.42, 0, 3.18, 1.42,
        1.72, 2.08, -1.42, 0, 3.18, 1.42, 0, 3.18, -1.42,
      ]);
      roofGeometry.setAttribute('position', new THREE.BufferAttribute(roofVertices, 3));
      roofGeometry.computeVertexNormals();
      const roofMesh = new THREE.Mesh(roofGeometry, roof);
      roofMesh.castShadow = true;
      building.add(roofMesh);

      // Front door and paired dark windows.
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.48, 1.05, 0.08), wood);
      door.position.set(0, 0.68, 1.29);
      building.add(door);
      for (const x of [-0.92, 0.92]) {
        const windowMesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.48, 0.07), shadow);
        windowMesh.position.set(x, 1.35, 1.29);
        building.add(windowMesh);
      }

      // Corner stones and a small banner pole.
      for (const x of [-1.48, 1.48]) {
        for (const z of [-1.23, 1.23]) {
          const block = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.02, 0.18), stoneDark);
          block.position.set(x, 1.12, z);
          building.add(block);
        }
      }
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.05, 6), wood);
      pole.position.set(0.8, 3.65, -0.3);
      building.add(pole);
      const banner = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.3, 0.035), new THREE.MeshStandardMaterial({ color: '#9b2933', side: THREE.DoubleSide }));
      banner.position.set(1.02, 3.92, -0.3);
      building.add(banner);

      // A simple stylised tree makes the scene feel like a place, not a product render.
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.18, 0.8, 6), wood);
      trunk.position.set(-3.2, 0.35, -1.1);
      building.add(trunk);
      const crown = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.1, 7), new THREE.MeshStandardMaterial({ color: '#466b37', roughness: 1 }));
      crown.position.set(-3.2, 1.75, -1.1);
      crown.castShadow = true;
      building.add(crown);

      const path = new THREE.Mesh(
        new THREE.BoxGeometry(1.05, 0.035, 5.5),
        new THREE.MeshStandardMaterial({ color: '#c4a477', roughness: 1 }),
      );
      path.position.set(0, -0.025, 4.0);
      scene.add(path);

      let frame = 0;
      let disposed = false;
      const render = () => {
        if (disposed) return;
        frame = requestAnimationFrame(render);
        building.rotation.y = yaw.current;
        camera.position.set(Math.sin(yaw.current) * 5.8, 4.8, Math.cos(yaw.current) * zoom.current);
        camera.lookAt(0, 1.25, 0);
        renderer.render(scene, camera);
        gl.endFrameEXP();
      };
      render();
      setReady(true);
      setError(null);

      cleanup.current = () => {
        disposed = true;
        cancelAnimationFrame(frame);
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            const material = object.material;
            if (Array.isArray(material)) material.forEach((item) => item.dispose());
            else material.dispose();
          }
        });
        renderer.dispose();
      };
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The 3D renderer could not start.');
    }
  }, []);

  useEffect(() => () => cleanup.current?.(), []);

  return (
    <View style={styles.wrap}>
      <View style={styles.canvas} {...pan.panHandlers}>
        <GLView style={StyleSheet.absoluteFill} onContextCreate={onContextCreate} />
        {!ready && !error ? <View pointerEvents="none" style={styles.status}><Text style={styles.statusText}>Preparing 3D scene…</Text></View> : null}
        {error ? <View style={styles.status}><Text style={styles.errorTitle}>3D preview unavailable</Text><Text style={styles.statusText}>{error}</Text></View> : null}
      </View>
      <View style={styles.controls}>
        <Text style={styles.hint}>Drag to rotate</Text>
        <View style={styles.zoomControls}>
          <Pressable accessibilityRole="button" accessibilityLabel="Zoom out" onPress={() => changeZoom(0.8)} style={styles.zoomButton}><Text style={styles.zoomText}>−</Text></Pressable>
          <Text style={styles.zoomValue}>{zoomLabel.toFixed(1)}×</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Zoom in" onPress={() => changeZoom(-0.8)} style={styles.zoomButton}><Text style={styles.zoomText}>+</Text></Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: colors.gold, backgroundColor: '#8fb5c8' },
  canvas: { height: 370, overflow: 'hidden' },
  status: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: 'rgba(11,18,32,0.76)' },
  statusText: { color: colors.parchment, fontFamily: fonts.sans, fontSize: 13, textAlign: 'center' },
  errorTitle: { color: '#ffb2a8', fontFamily: fonts.serif, fontSize: 18, fontWeight: '800', marginBottom: 8 },
  controls: { minHeight: 54, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.charcoal },
  hint: { color: colors.parchmentDim, fontFamily: fonts.sans, fontSize: 12 },
  zoomControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  zoomButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.navyLight, borderWidth: 1, borderColor: colors.line },
  zoomText: { color: colors.goldBright, fontSize: 22, lineHeight: 26, fontWeight: '700' },
  zoomValue: { minWidth: 38, textAlign: 'center', color: colors.parchment, fontFamily: fonts.sans, fontSize: 12 },
});
