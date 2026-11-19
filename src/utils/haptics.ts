import * as Haptics from 'expo-haptics';

let enabled = true;

export function hapticsEnabled(): boolean {
  return enabled;
}

export function setHapticsEnabled(on: boolean): void {
  enabled = on;
  if (on) tap('success');
}

type Kind = 'light' | 'success' | 'warning' | 'heavy';

/** Fire-and-forget haptic. Never throws (devices without a motor, web preview). */
export function tap(kind: Kind): void {
  if (!enabled) return;
  try {
    if (kind === 'light') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    else if (kind === 'heavy') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    else void Haptics.notificationAsync(kind === 'success' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning);
  } catch {
    // ignore
  }
}
