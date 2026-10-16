import { createContext, useContext } from 'react';
import type { LearnerCatalog, StoreSnapshot, TrainingPort } from '../domain/models';

export const TrainingContext = createContext<{ adapter: TrainingPort; catalog: LearnerCatalog; snapshot: StoreSnapshot } | null>(null);
export function useTraining() { const value = useContext(TrainingContext); if (!value) throw new Error('Training provider is missing'); return value; }
