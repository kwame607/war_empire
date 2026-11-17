import { Redirect, useLocalSearchParams } from 'expo-router';

import { ReportView } from '@/components/military/ReportView';
import { GameScreen } from '@/components/ui/GameScreen';
import { useGame } from '@/store/GameProvider';

export default function ReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state } = useGame();
  if (!state) return <Redirect href="/" />;
  const report = state.reports.find((r) => r.id === id);
  if (!report) return <Redirect href="/military" />;
  return (
    <GameScreen title="Battle report" subtitle="After-action review" showBack>
      <ReportView report={report} />
    </GameScreen>
  );
}
