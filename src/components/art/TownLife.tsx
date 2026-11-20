import { useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';

/** True unless the person asked their phone to reduce motion. */
function useMotion(): boolean {
  const [on, setOn] = useState(true);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((r) => alive && setOn(!r))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return on;
}

/** Starts a looping 0→1 animation after an optional delay; stops on unmount. */
function useLoop(duration: number, delay = 0, enabled = true, easing = Easing.linear): Animated.Value {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!enabled) return;
    const loop = Animated.loop(Animated.timing(v, { toValue: 1, duration, easing, useNativeDriver: true }));
    const t = setTimeout(() => loop.start(), delay);
    return () => {
      clearTimeout(t);
      loop.stop();
    };
  }, [v, duration, delay, enabled, easing]);
  return v;
}

function Cloud({ sceneW, y, size, duration, delay, enabled }: { sceneW: number; y: number; size: number; duration: number; delay: number; enabled: boolean }) {
  const v = useLoop(duration, delay, enabled);
  const x = v.interpolate({ inputRange: [0, 1], outputRange: [-size * 2, sceneW + size] });
  return (
    <Animated.View pointerEvents="none" style={[styles.cloud, { top: y, width: size * 2, height: size * 0.55, borderRadius: size, transform: [{ translateX: x }] }]}>
      <View style={[styles.puff, { width: size, height: size * 0.7, left: size * 0.25, top: -size * 0.3, borderRadius: size }]} />
    </Animated.View>
  );
}

/** Drifting clouds across the whole scene. */
export function Clouds({ sceneW, sceneH }: { sceneW: number; sceneH: number }) {
  const motion = useMotion();
  return (
    <>
      <Cloud sceneW={sceneW} y={sceneH * 0.12} size={46} duration={52000} delay={0} enabled={motion} />
      <Cloud sceneW={sceneW} y={sceneH * 0.32} size={34} duration={70000} delay={9000} enabled={motion} />
      <Cloud sceneW={sceneW} y={sceneH * 0.6} size={54} duration={90000} delay={21000} enabled={motion} />
    </>
  );
}

/** A little column of smoke rising from a chimney at (x, y). */
export function Smoke({ x, y, scale }: { x: number; y: number; scale: number }) {
  const motion = useMotion();
  return (
    <>
      {[0, 1, 2].map((i) => (
        <Puff key={i} x={x} y={y} scale={scale} delay={i * 900} enabled={motion} />
      ))}
    </>
  );
}

function Puff({ x, y, scale, delay, enabled }: { x: number; y: number; scale: number; delay: number; enabled: boolean }) {
  const v = useLoop(2700, delay, enabled);
  const rise = v.interpolate({ inputRange: [0, 1], outputRange: [0, -26 * scale] });
  const drift = v.interpolate({ inputRange: [0, 1], outputRange: [0, 8 * scale] });
  const opacity = v.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.5, 0] });
  const grow = v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.5] });
  return (
    <Animated.View pointerEvents="none" style={[styles.smoke, { left: x - 4 * scale, top: y, width: 8 * scale, height: 8 * scale, borderRadius: 8 * scale, opacity, transform: [{ translateY: rise }, { translateX: drift }, { scale: grow }] }]} />
  );
}

/** Makes children bob gently on the water. */
export function Bob({ children, phase = 0 }: { children: ReactNode; phase?: number }) {
  const motion = useMotion();
  const v = useLoop(2600, phase, motion, Easing.inOut(Easing.sin));
  const y = v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 2.5, 0] });
  return <Animated.View style={{ transform: [{ translateY: y }] }}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  cloud: { position: 'absolute', left: 0, backgroundColor: 'rgba(255,255,255,0.28)' },
  puff: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.28)' },
  smoke: { position: 'absolute', backgroundColor: 'rgba(235,232,225,0.9)' },
});
