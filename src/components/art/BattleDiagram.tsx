import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ShapeSvg } from '@/components/art/ShapeSvg';
import { GameButton } from '@/components/ui/GameButton';
import { DIAGRAM_H, DIAGRAM_W, type Diagram } from '@/data/diagramTypes';
import { colors, fonts } from '@/theme';
import { diagramShapes, visibleScenes } from '@/utils/diagramShapes';

const MOVE_MS = 1600;
const HOLD_MS = 1800;
const TICK_MS = 50;

/** An animated, step-through schematic of a battle with a caption for each step. */
export function BattleDiagram({ diagram, stage }: { diagram: Diagram; stage: number }) {
  const visible = visibleScenes(diagram, stage);
  const total = diagram.scenes.length;
  const [scene, setScene] = useState(0);
  const [from, setFrom] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [width, setWidth] = useState(300);

  const last = visible.length - 1;
  const cur = Math.max(0, Math.min(scene, last));
  const prev = Math.max(0, Math.min(from, last));

  useEffect(() => {
    if (!playing || visible.length < 2) return;
    const id = setInterval(() => {
      setElapsed((e) => {
        const next = e + TICK_MS;
        if (next >= MOVE_MS + HOLD_MS) {
          setFrom(cur);
          setScene(cur >= last ? 0 : cur + 1);
          return 0;
        }
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [playing, cur, last, visible.length]);

  const go = (i: number) => {
    const target = Math.max(0, Math.min(last, i));
    setFrom(target);
    setScene(target);
    setElapsed(MOVE_MS);
  };

  const t = Math.min(1, elapsed / MOVE_MS);
  const shapes = diagramShapes(diagram, prev, cur, prev === cur ? 1 : t);
  const caption = diagram.scenes[visible[cur]].caption;

  return (
    <View style={styles.wrap}>
      <View style={styles.frame} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        <ShapeSvg shapes={shapes} w={DIAGRAM_W} h={DIAGRAM_H} width={width} />
      </View>
      <View style={styles.legend}>
        <View style={[styles.dot, { backgroundColor: '#C9A24B' }]} />
        <Text style={styles.legendText}>{diagram.sideA}</Text>
        <View style={[styles.dot, { backgroundColor: '#A3384A' }]} />
        <Text style={styles.legendText}>{diagram.sideB}</Text>
      </View>
      <Text style={styles.step}>
        Step {cur + 1} of {visible.length}
        {visible.length < total ? ` (${total - visible.length} more at Understanding)` : ''}
      </Text>
      <Text style={styles.caption}>{caption}</Text>
      <View style={styles.controls}>
        <GameButton compact variant="secondary" label="Prev" onPress={() => go(cur - 1)} />
        <GameButton compact variant="secondary" label={playing ? 'Pause' : 'Play'} onPress={() => setPlaying((p) => !p)} />
        <GameButton compact variant="secondary" label="Next" onPress={() => go(cur + 1)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  frame: { borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: colors.line },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  dot: { width: 10, height: 10, borderRadius: 2 },
  legendText: { fontFamily: fonts.serif, fontSize: 13, color: colors.parchmentDim, marginRight: 10 },
  step: { fontFamily: fonts.serif, fontSize: 12, color: colors.bronze, letterSpacing: 1, textTransform: 'uppercase' },
  caption: { fontFamily: fonts.serif, fontSize: 15, lineHeight: 22, color: colors.parchment },
  controls: { flexDirection: 'row', gap: 8 },
});
