import { GameScreen } from '@/components/ui/GameScreen';
import { LockedNotice } from '@/components/ui/LockedNotice';

export default function MilitaryScreen() {
  return (
    <GameScreen title="Military" subtitle="Commanders, armies and campaigns">
      <LockedNotice
        title="Locked: no army yet"
        description="Every ruler starts as a civilian. Military institutions open up as you gain influence, long after the economy and knowledge systems."
        arrivesIn="a later milestone"
      />
    </GameScreen>
  );
}
