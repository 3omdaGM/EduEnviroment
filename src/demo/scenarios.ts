import type { DemoState, TrainingCatalog } from '../domain/models';
import { freshState, reduceCommand } from '../domain/training';

export type Scenario = 'before-pre' | 'eligible-50' | 'ineligible-55' | 'self-failed' | 'completed';
export const scenarioLabels: Record<Scenario, string> = { 'before-pre': 'قبل القبلي', 'eligible-50': 'مؤهل عند 50%', 'ineligible-55': 'غير مؤهل فوق 50%', 'self-failed': 'درس غير مجتاز', completed: 'إكمال البيئة' };
export function scenarioState(catalog: TrainingCatalog, scenario: Scenario): DemoState {
  let state = freshState(catalog), sequence = 0;
  const act = (command: Parameters<typeof reduceCommand>[2]) => { state = reduceCommand(state, catalog, command, '2026-10-16T00:00:00.000Z', `scenario-${++sequence}`).state; };
  act({ type: 'login', name: 'متدرب العرض' });
  function assessment(id: string, correctCount: number) {
    act({ type: 'start-attempt', assessmentId: id });
    const attempt = state.attempts.find(a => a.assessmentId === id && a.status === 'draft')!;
    attempt.questionIds.forEach((qid, i) => {
      const q = catalog.questions.find(q => q.id === qid)!;
      act({ type: 'answer', attemptId: attempt.id, questionId: qid, optionId: i < correctCount ? q.answerKey.correctOptionId : q.options.find(o => o.id !== q.answerKey.correctOptionId)!.id });
    });
    act({ type: 'submit', attemptId: attempt.id });
  }
  if (scenario === 'before-pre') return state;
  const pre = catalog.assessments.find(d => d.scope.kind === 'pre')!;
  assessment(pre.id, scenario === 'ineligible-55' ? Math.floor(pre.questionIds.length / 2) + 1 : Math.floor(pre.questionIds.length / 2));
  if (['eligible-50', 'ineligible-55'].includes(scenario)) return state;
  for (const lesson of catalog.lessons) {
    for (const id of lesson.elementIds) for (const part of catalog.elements.find(e => e.id === id)!.parts) act({ type: 'read-part', elementId: id, partId: part.id });
    assessment(lesson.activityAssessmentId, 0);
    assessment(lesson.selfAssessmentId, scenario === 'self-failed' ? 0 : catalog.assessments.find(d => d.id === lesson.selfAssessmentId)!.questionIds.length);
    if (scenario === 'self-failed') break;
  }
  state.announcedRewardIds = state.rewards.map(r => r.id);
  return state;
}
