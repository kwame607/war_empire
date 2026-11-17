import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { GameButton } from '@/components/ui/GameButton';
import { PlainScreen } from '@/components/ui/PlainScreen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { SelectCard } from '@/components/ui/SelectCard';
import { TextField } from '@/components/ui/TextField';
import { BACKGROUNDS, DIFFICULTIES, getBackground, getDifficulty } from '@/data/backgrounds';
import { CIVILISATIONS, getCivilisation } from '@/data/civilisations';
import { getSettlement } from '@/data/world';
import { useGame } from '@/store/GameProvider';
import { colors, fonts, spacing } from '@/theme';

export default function CreateCharacterScreen() {
  const { startNewGame } = useGame();
  const [name, setName] = useState('');
  const [civId, setCivId] = useState(CIVILISATIONS[0].id);
  const [bgId, setBgId] = useState('ordinary');
  const [diffId, setDiffId] = useState('standard');

  const trimmed = name.trim();
  const nameOk = trimmed.length >= 2;
  const diff = getDifficulty(diffId);

  const begin = () => {
    startNewGame({ name: trimmed, civId, backgroundId: bgId, difficultyId: diffId });
    router.replace('/start');
  };

  return (
    <PlainScreen
      title="Your Beginning"
      subtitle="You start as an ordinary civilian. Everything else must be earned."
      footer={<GameButton label={nameOk ? 'Enter the world' : 'Enter a name first'} muted={!nameOk} onPress={() => nameOk && begin()} />}>
      <SectionHeader title="Name" />
      <TextField value={name} onChangeText={setName} placeholder="What are you called?" maxLength={24} autoCapitalize="words" autoCorrect={false} returnKeyType="done" />

      <SectionHeader title="Civilisation" />
      <Text style={styles.help}>Your people decide where you start, your traditions and your first advantage.</Text>
      <View style={styles.list}>
        {CIVILISATIONS.map((c) => {
          const selected = c.id === civId;
          return (
            <SelectCard key={c.id} selected={selected} onPress={() => setCivId(c.id)}>
              <Text style={styles.cardTitle}>{c.name}</Text>
              <Text style={styles.cardMeta}>Inspired by the {c.inspiredBy}</Text>
              <Text style={styles.cardBody}>{c.tagline}</Text>
              {selected ? (
                <View style={styles.expanded}>
                  <Text style={styles.cardBody}>{c.history}</Text>
                  <Text style={styles.cardMeta}>Starts in {getSettlement(c.startSettlementId).name}</Text>
                  <View style={styles.chips}>
                    {c.perks.map((p) => (
                      <Chip key={p} label={p} />
                    ))}
                  </View>
                </View>
              ) : null}
            </SelectCard>
          );
        })}
      </View>
      <Text style={styles.note}>
        These are fictional realms inspired by real history. More civilisations (including Aksum, Great Zimbabwe, Benin and Kanem-Bornu) will follow.
      </Text>

      <SectionHeader title="Background" />
      <Text style={styles.help}>Your family shapes your start, never your destiny. Any career stays open.</Text>
      <View style={styles.list}>
        {BACKGROUNDS.map((b) => (
          <SelectCard key={b.id} selected={b.id === bgId} onPress={() => setBgId(b.id)}>
            <Text style={styles.cardTitle}>{b.name}</Text>
            <Text style={styles.cardBody}>{b.summary}</Text>
          </SelectCard>
        ))}
      </View>

      <SectionHeader title="Difficulty" />
      <SegmentedControl options={DIFFICULTIES.map((d) => ({ value: d.id, label: d.name }))} value={diffId} onChange={setDiffId} />
      <Text style={styles.help}>{diff.summary}</Text>

      <Text style={styles.summary}>
        {trimmed || 'You'} · {getCivilisation(civId).name} · {getBackground(bgId).name} · {diff.name}
      </Text>
    </PlainScreen>
  );
}

const styles = StyleSheet.create({
  help: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, color: colors.parchmentDim, marginBottom: spacing.sm },
  list: { gap: spacing.sm },
  cardTitle: { fontFamily: fonts.serif, fontSize: 19, fontWeight: '800', color: colors.parchment },
  cardMeta: { fontFamily: fonts.sans, fontSize: 13, color: colors.goldBright },
  cardBody: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: colors.parchmentDim },
  expanded: { gap: spacing.sm, marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.line },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  note: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 18, color: colors.bronze, marginTop: spacing.sm },
  summary: { fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 15, color: colors.gold, textAlign: 'center', marginTop: spacing.lg },
});
