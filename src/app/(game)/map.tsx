import { GameScreen } from '@/components/ui/GameScreen';
import { LockedNotice } from '@/components/ui/LockedNotice';

export default function MapScreen() {
  return (
    <GameScreen title="World Map" subtitle="Nordheim · Valoria · Azrakar · Eshara · Myrath">
      <LockedNotice
        title="The known world"
        description="An illustrated map of five continents with your starting location and fog over unexplored lands."
        arrivesIn="Phase 4"
      />
    </GameScreen>
  );
}
