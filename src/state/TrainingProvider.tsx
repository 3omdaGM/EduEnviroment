import { useEffect, useState, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { fullCatalog } from '../data/assessments';
import { createE2eFixture } from '../demo/e2e-fixture';
import { demoToolsEnabled } from '../demo/flags';
import { DemoAdapter, STORAGE_KEY } from '../services/demo-adapter';
import { TrainingContext } from './training-context';

export default function TrainingProvider({ children }: { children: ReactNode }) {
  const [adapter] = useState(() => new DemoAdapter({ read: () => localStorage.getItem(STORAGE_KEY), write: raw => localStorage.setItem(STORAGE_KEY, raw) }, import.meta.env.MODE === 'e2e' ? createE2eFixture(fullCatalog) : fullCatalog, demoToolsEnabled));
  const snapshot = useSyncExternalStore(adapter.subscribe, adapter.getSnapshot);
  useEffect(() => { const changed = (event: StorageEvent) => { if (event.key === STORAGE_KEY) adapter.reload(); }; window.addEventListener('storage', changed); return () => window.removeEventListener('storage', changed); }, [adapter]);
  return <TrainingContext.Provider value={{ adapter, catalog: adapter.catalog, snapshot }}>{children}</TrainingContext.Provider>;
}
