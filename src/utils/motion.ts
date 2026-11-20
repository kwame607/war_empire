import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** True unless the person asked their phone to reduce motion. */
export function useMotion(): boolean {
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

let lastMount = 0;
let burst = 0;
/** Delay for the next entrance animation so cards mounted together cascade instead of popping at once. */
export function nextStagger(): number {
  const t = Date.now();
  burst = t - lastMount > 350 ? 0 : burst + 1;
  lastMount = t;
  return Math.min(burst, 8) * 45;
}
