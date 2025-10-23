import { MobileTaskBoard } from './tasks/MobileTaskBoard';

interface MobileTaskManagerProps {
  villas: any[];
  onNavigate?: (view: string) => void;
}

export function MobileTaskManager({ villas, onNavigate }: MobileTaskManagerProps) {
  return <MobileTaskBoard villas={villas} onNavigate={onNavigate} />;
}
