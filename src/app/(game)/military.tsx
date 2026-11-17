import { StyleSheet, Text } from 'react-native';

import { GameScreen } from '@/components/ui/GameScreen';
import { LockedNotice } from '@/components/ui/LockedNotice';
import { Panel } from '@/components/ui/Panel';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { MILITARY_UNLOCK_STAGE, PROGRESSION_STAGES } from '@/data/progression';
import { getStageIndex } from '@/game/selectors';
import { useGameState } from '@/store/GameProvider';
import { colors, fonts } from '@/theme';

export default function MilitaryScreen() {
  const state = useGameState();
  const idx = getStageIndex(state);
  const need = PROGRESSION_STAGES[MILITARY_UNLOCK_STAGE];
  const unlocked = idx >= MILITARY_UNLOCK_STAGE;

  return (
    <GameScreen title="Military" subtitle="Commanders, armies and campaigns">
      {unlocked ? (
        <LockedNotice
          title="Open to you, but empty"
          description="You have enough standing to raise a force. Barracks, commanders and battles arrive in the next milestone."
          arrivesIn="the military milestone"
        />
      ) : (
        <>
          <LockedNotice
            title="Locked: no army yet"
            description={`Every ruler starts as a civilian. Military institutions open when you reach "${need.name}".`}
            arrivesIn={`reputation ${need.reputation}`}
          />
          <Panel>
            <Text style={styles.text}>
              Reputation {Math.floor(state.reputation)} / {need.reputation}
            </Text>
            <ProgressBar progress={state.reputation / need.reputation} />
          </Panel>
        </>
      )}
    </GameScreen>
  );
}

const styles = StyleSheet.create({
  text: { fontFamily: fonts.sans, fontSize: 15, color: colors.parchment, marginBottom: 8 },
});
