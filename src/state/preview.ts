import { createContext, useContext } from 'react';

export interface PreviewState {
  acknowledged: readonly string[];
  acknowledge: (id: string) => void;
  canRead: (id: string) => boolean;
}
export const PreviewContext = createContext<PreviewState | null>(null);
export function usePreview() {
  const state = useContext(PreviewContext);
  if (!state) throw new Error('Preview provider is missing');
  return state;
}
