import type { TrainingCatalog } from '../domain/models';

/** Compiled only into mode=e2e, never changes the real demonstration content. */
export function createE2eFixture(full: TrainingCatalog): TrainingCatalog {
  const lessons = full.modules.map(m => full.lessons.find(l => l.id === m.lessonIds[0])!).map(l => ({ ...l, elementIds: [l.elementIds[0]!] }));
  const elements = lessons.map(l => full.elements.find(e => e.id === l.elementIds[0])!).map(e => ({ ...e, parts: [e.parts[0]!] }));
  const ids = ['pre', 'post', ...lessons.flatMap(l => [l.activityAssessmentId, l.selfAssessmentId])];
  const assessments = full.assessments.filter(d => ids.includes(d.id)).map(d => ({ ...d, questionIds: d.questionIds.slice(0, 2), minimumAnsweredQuestions: d.scope.kind === 'pre' ? 0 : 2, submitRequiresAllAnswers: d.scope.kind !== 'pre' }));
  const qids = assessments.flatMap(d => d.questionIds);
  return { version: full.version, modules: full.modules.map(m => ({ ...m, lessonIds: [m.lessonIds[0]!] })), lessons, elements, assessments, questions: full.questions.filter(q => qids.includes(q.id)) };
}
