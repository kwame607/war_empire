import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { GameButton } from '@/components/ui/GameButton';
import { GameScreen } from '@/components/ui/GameScreen';
import { Panel } from '@/components/ui/Panel';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { GOODS, haggle, marketEvent, marketQuotes, marketRefreshIn, type GoodId } from '@/game/market';
import { formatDuration } from '@/game/selectors';
import { useGame, useGameState } from '@/store/GameProvider';
import { tap } from '@/utils/haptics';
import { colors, fonts, spacing } from '@/theme';

const ICON: Record<GoodId, keyof typeof Ionicons.glyphMap> = { food: 'restaurant-outline', wood: 'git-branch-outline', stone: 'cube-outline' };
const TREND = { up: '▲ dear', down: '▼ cheap', steady: '● fair' } as const;
const TREND_COLOR = { up: '#E58A8A', down: '#7DBE7D', steady: colors.parchmentDim } as const;

export default function MarketScreen() {
  const state = useGameState();
  const { trade } = useGame();
  const [qty, setQty] = useState('10');
  const n = Number(qty);
  const quotes = marketQuotes(state);
  const h = Math.round(haggle(state) * 100);
  const event = marketEvent(state);

  const go = (good: GoodId, mode: 'buy' | 'sell') => {
    const r = trade(good, n, mode);
    if (!r.ok) Alert.alert('No deal', r.reason);
    else tap('success');
  };

  return (
    <GameScreen banner="economy" title="Marketplace" subtitle="Buy and sell by the day's prices" showBack>
      <Panel>
        <Text style={styles.body}>Traders cry their wares between the awnings. Prices shift each day with the seasons and the caravans. Buy when it is cheap, sell when it is dear. Merchants always pay less than they ask.</Text>
        <Text style={styles.meta}>New prices in {formatDuration(marketRefreshIn(state))} · Your haggling: {h}% off asking and {h}% better when selling (from administration).</Text>
      </Panel>

      {event ? (
        <Panel>
          <Text style={styles.title}>📜 {event.title}</Text>
          <Text style={styles.meta}>{event.text}</Text>
        </Panel>
      ) : null}

      <SectionHeader title="How much?" />
      <SegmentedControl options={[{ value: '10', label: '10' }, { value: '50', label: '50' }, { value: '100', label: '100' }, { value: '500', label: '500' }]} value={qty} onChange={setQty} />

      {quotes.map((q) => {
        const g = GOODS.find((x) => x.id === q.id)!;
        const have = Math.floor(state.resources[q.id]);
        return (
          <Panel key={q.id}>
            <View style={styles.row}>
              <Ionicons name={ICON[q.id]} size={26} color={colors.gold} />
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{g.name}</Text>
                <Text style={styles.meta}>{g.stall} · {g.blurb}</Text>
              </View>
              <Text style={[styles.trend, { color: TREND_COLOR[q.trend] }]}>{TREND[q.trend]}</Text>
            </View>
            <Text style={styles.meta}>You hold {have}. Asking {q.buy} gold each · Paying {q.sell} gold each.</Text>
            {q.note ? <Text style={styles.note}>{q.note}</Text> : null}
            <View style={styles.row}>
              <View style={{ flex: 1 }}><GameButton label={`Buy ${n} · ${Math.ceil(n * q.buy)}g`} onPress={() => go(q.id, 'buy')} muted={state.resources.gold < Math.ceil(n * q.buy)} /></View>
              <View style={{ flex: 1 }}><GameButton variant="secondary" label={`Sell ${n} · ${Math.floor(n * q.sell)}g`} onPress={() => go(q.id, 'sell')} muted={have < n} /></View>
            </View>
          </Panel>
        );
      })}
    </GameScreen>
  );
}

const styles = StyleSheet.create({
  body: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.parchment },
  meta: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.parchmentDim, marginTop: 4 },
  note: { fontFamily: fonts.serif, fontSize: 13, color: colors.goldBright, marginTop: 4 },
  title: { fontFamily: fonts.serif, fontSize: 16, color: colors.parchment },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  trend: { fontFamily: fonts.sans, fontSize: 12, fontWeight: '700' },
});
