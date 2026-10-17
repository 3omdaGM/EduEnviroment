import type { AssessmentDefinition } from '../../docs/contracts';
import type { Access, Command, CommandOutput, DemoAttempt, DemoPolicy, DemoState, Score, ProgressCatalog, TrainingCatalog } from './models';
import { demoPolicy, stateSchema } from './models';
export class TrainingError extends Error {}

export const lessonRoute = (moduleId: string, lessonId: string) => `/modules/${moduleId}/lessons/${lessonId}`;
const allow: Access = { allowed: true, reason: '', nextRoute: '/content' };
const deny = (reason: string, nextRoute = '/content'): Access => ({ allowed: false, reason, nextRoute });
export function freshState(catalog: ProgressCatalog): DemoState {
  return { schemaVersion: 1, contentVersion: catalog.version, revision: 0, learner: { id: 'demo-learner', name: 'متدرب تجريبي', active: false }, readPartIds: [], attempts: [], rewards: [], announcedRewardIds: [] };
}
function validScore(score: Score) {
  if (!Number.isSafeInteger(score.earned) || !Number.isSafeInteger(score.possible) || score.possible <= 0 || score.earned < 0 || score.earned > score.possible) throw new TrainingError('الدرجة أو مجموع الأوزان غير صالح.');
}
export function isPreEligible(score: Score) { validScore(score); return 2 * score.earned <= score.possible; }
export function isSelfPassed(score: Score) { validScore(score); return 2 * score.earned >= score.possible; }
export function eligibility(state: DemoState, catalog: ProgressCatalog, policy: DemoPolicy = demoPolicy) {
  if (policy.eligibilityAttempt !== 'first-submitted-pre') throw new TrainingError('سياسة الأهلية غير مدعومة في العرض.');
  const preIds = catalog.assessments.filter(a => a.scope.kind === 'pre').map(a => a.id);
  const attempt = state.attempts.filter(a => a.status === 'submitted' && preIds.includes(a.assessmentId)).sort((a, b) => a.sequence! - b.sequence!)[0];
  return { status: !attempt ? 'not-assessed' as const : isPreEligible(attempt.score!) ? 'eligible' as const : 'ineligible' as const, attempt };
}
export function submittedFor(state: DemoState, assessmentId: string) { return state.attempts.filter(a => a.assessmentId === assessmentId && a.status === 'submitted'); }
export function lessonComplete(state: DemoState, catalog: ProgressCatalog, lessonId: string) {
  const lesson = catalog.lessons.find(l => l.id === lessonId);
  return !!lesson && submittedFor(state, lesson.selfAssessmentId).some(a => a.score && isSelfPassed(a.score));
}
export function moduleComplete(state: DemoState, catalog: ProgressCatalog, moduleId: string) {
  const module = catalog.modules.find(m => m.id === moduleId);
  return !!module?.lessonIds.length && module.lessonIds.every(id => lessonComplete(state, catalog, id));
}
export function elementComplete(state: DemoState, catalog: ProgressCatalog, elementId: string) {
  const element = catalog.elements.find(e => e.id === elementId);
  return !!element?.parts.length && element.parts.every(part => state.readPartIds.includes(part.id));
}
function trainingAccess(state: DemoState, catalog: ProgressCatalog): Access {
  if (!state.learner.active) return deny('ابدأ تجربة بحساب تجريبي أولًا.', '/login');
  const status = eligibility(state, catalog).status;
  if (status === 'not-assessed') return deny('المحتوى مقفل حتى تسليم التقويم القبلي.', '/assessment/pre/instructions');
  if (status === 'ineligible') return deny('وفقًا لشروط المشاركة المحددة لهذه الدراسة، لا يتاح لك المسار التدريبي', '/assessment/pre/instructions');
  return allow;
}
export function moduleAccess(state: DemoState, catalog: ProgressCatalog, moduleId: string): Access {
  const base = trainingAccess(state, catalog); if (!base.allowed) return base;
  const index = catalog.modules.findIndex(m => m.id === moduleId);
  if (index < 0) return deny('الموديول غير موجود.');
  return allow;
}
export function lessonAccess(state: DemoState, catalog: ProgressCatalog, lessonId: string): Access {
  const lesson = catalog.lessons.find(l => l.id === lessonId);
  return lesson ? moduleAccess(state, catalog, lesson.moduleId) : deny('الدرس غير موجود.');
}
export function elementAccess(state: DemoState, catalog: ProgressCatalog, elementId: string): Access {
  const element = catalog.elements.find(e => e.id === elementId);
  return element ? lessonAccess(state, catalog, element.lessonId) : deny('العنصر غير موجود.');
}
export function partAccess(state: DemoState, catalog: ProgressCatalog, elementId: string, partId: string): Access {
  const base = elementAccess(state, catalog, elementId); if (!base.allowed) return base;
  return catalog.elements.find(e => e.id === elementId)!.parts.some(p => p.id === partId) ? allow : deny('الجزء غير موجود.');
}
export function assessmentAccess(state: DemoState, catalog: ProgressCatalog, assessmentId: string): Access {
  const definition = catalog.assessments.find(a => a.id === assessmentId);
  if (!definition) return deny('التقويم غير موجود.');
  if (!state.learner.active) return deny('ابدأ تجربة بحساب تجريبي أولًا.', '/login');
  if (definition.scope.kind === 'pre') return allow;
  if (definition.scope.kind === 'post') return trainingAccess(state, catalog);
  return 'lessonId' in definition.scope ? lessonAccess(state, catalog, definition.scope.lessonId) : deny('الدرس غير موجود.');
}

export function submissionReadiness(attempt: Pick<DemoAttempt, 'questionIds' | 'answers'>, definition: Pick<AssessmentDefinition, 'minimumAnsweredQuestions'>) {
  const answered = attempt.questionIds.filter(id => attempt.answers[id] !== undefined).length;
  const minimum = definition.minimumAnsweredQuestions;
  return { answered, minimum, missing: attempt.questionIds.length - answered, canSubmit: answered >= minimum };
}
export function grade(catalog: TrainingCatalog, attempt: Pick<DemoAttempt, 'questionIds' | 'answers'>): Score {
  let earned = 0, possible = 0;
  if (!attempt.questionIds.length || new Set(attempt.questionIds).size !== attempt.questionIds.length) throw new TrainingError('قائمة الأسئلة غير صالحة.');
  for (const id of attempt.questionIds) {
    const q = catalog.questions.find(q => q.id === id);
    if (!q || !Number.isSafeInteger(q.weight) || q.weight <= 0) throw new TrainingError('سؤال أو وزن غير صالح.');
    const answer = attempt.answers[id];
    if (answer !== undefined && !q.options.some(o => o.id === answer)) throw new TrainingError('توجد إجابة لا تنتمي إلى بدائل السؤال.');
    possible += q.weight; if (answer === q.answerKey.correctOptionId) earned += q.weight;
  }
  const score = { earned, possible }; validScore(score); return score;
}
function reward(state: DemoState, catalog: TrainingCatalog, event: 'activity-completed' | 'lesson-completed' | 'module-completed', subjectId: string, points: number, now: string) {
  const id = `${catalog.version}:${event}:${subjectId}`;
  if (!state.rewards.some(r => r.id === id)) state.rewards.push({ id, event, subjectId, points, earnedAt: now, badgeId: event === 'module-completed' ? catalog.modules.find(m => m.id === subjectId)!.badgeId : null });
}
export function reduceCommand(state: DemoState, catalog: TrainingCatalog, command: Command, now: string, newId: string, policy: DemoPolicy = demoPolicy): CommandOutput {
  const next = structuredClone(state);
  if (command.type === 'login') { next.learner.name = command.name.trim().slice(0, 80) || 'متدرب تجريبي'; next.learner.active = true; }
  else if (command.type === 'logout') next.learner.active = false;
  else if (command.type === 'announce') next.announcedRewardIds = [...new Set([...next.announcedRewardIds, ...command.rewardIds.filter(id => next.rewards.some(r => r.id === id))])];
  else if (command.type === 'read-part') {
    const access = partAccess(state, catalog, command.elementId, command.partId); if (!access.allowed) throw new TrainingError(access.reason);
    if (next.readPartIds.includes(command.partId)) return { state };
    next.readPartIds.push(command.partId);
  } else if (command.type === 'start-attempt') {
    const access = assessmentAccess(state, catalog, command.assessmentId); if (!access.allowed) throw new TrainingError(access.reason);
    const draft = next.attempts.find(a => a.assessmentId === command.assessmentId && a.status === 'draft');
    if (draft) return { state, attemptId: draft.id };
    const d = catalog.assessments.find(a => a.id === command.assessmentId)!;
    if (!d.questionIds.length) throw new TrainingError('لا توجد أسئلة لهذا التقويم.');
    next.attempts.push({ id: newId, learnerId: 'demo-learner', assessmentId: d.id, assessmentVersion: d.assessmentVersion, contentVersion: catalog.version, questionIds: [...d.questionIds], answers: {}, position: 0, status: 'draft', score: null, createdAt: now, submittedAt: null, sequence: null });
    next.revision++; return { state: next, attemptId: newId };
  } else {
    const attempt = next.attempts.find(a => a.id === command.attemptId);
    if (!attempt || attempt.learnerId !== state.learner.id) throw new TrainingError('المحاولة غير موجودة أو لا تخص هذه التجربة.');
    if (!state.learner.active) throw new TrainingError('ابدأ تجربة بحساب تجريبي أولًا.');
    if (command.type === 'submit' && attempt.status === 'submitted') return { state, attemptId: attempt.id };
    if (attempt.status === 'submitted') throw new TrainingError('لا يمكن تعديل محاولة مسلّمة؛ ابدأ محاولة جديدة للإعادة.');
    const access = assessmentAccess(state, catalog, attempt.assessmentId); if (!access.allowed) throw new TrainingError(access.reason);
    if (command.type === 'answer') {
      const question = catalog.questions.find(q => q.id === command.questionId);
      if (!attempt.questionIds.includes(command.questionId) || !question?.options.some(o => o.id === command.optionId)) throw new TrainingError('الاختيار لا ينتمي إلى هذه المحاولة.');
      attempt.answers[command.questionId] = command.optionId;
    } else if (command.type === 'position') {
      if (!Number.isInteger(command.position) || command.position < 0 || command.position >= attempt.questionIds.length) throw new TrainingError('موضع السؤال غير صالح.');
      attempt.position = command.position;
    } else if (command.type === 'submit') {
      const readiness = submissionReadiness(attempt, catalog.assessments.find(d => d.id === attempt.assessmentId)!);
      if (!readiness.canSubmit) throw new TrainingError(`أجب عن ${readiness.minimum} أسئلة على الأقل قبل التسليم؛ أجبت عن ${readiness.answered}.`);
      attempt.score = grade(catalog, attempt); attempt.status = 'submitted'; attempt.submittedAt = now;
      attempt.sequence = state.attempts.filter(a => a.status === 'submitted').length + 1;
      const d = catalog.assessments.find(a => a.id === attempt.assessmentId)!;
      if (d.scope.kind === 'activity') reward(next, catalog, 'activity-completed', d.scope.lessonId, policy.points.activity, now);
      if (d.scope.kind === 'self' && isSelfPassed(attempt.score)) {
        reward(next, catalog, 'lesson-completed', d.scope.lessonId, policy.points.lesson, now);
        if (moduleComplete(next, catalog, d.scope.moduleId)) reward(next, catalog, 'module-completed', d.scope.moduleId, policy.points.module, now);
      }
    }
  }
  next.revision++; return { state: next };
}

/** Structural/data integrity checks, never an assertion of browser-storage security. */
export function parseState(raw: string, catalog: TrainingCatalog): DemoState {
  const state = stateSchema.parse(JSON.parse(raw));
  if (state.contentVersion !== catalog.version) throw new TrainingError('نسخة المحتوى المحفوظة مختلفة.');
  for (const list of [state.readPartIds, state.attempts.map(a => a.id), state.rewards.map(r => r.id), state.announcedRewardIds]) if (new Set(list).size !== list.length) throw new TrainingError('معرفات مكررة في الحالة.');
  const sequences = state.attempts.filter(a => a.status === 'submitted').map(a => a.sequence);
  if (sequences.some(s => s === null) || new Set(sequences).size !== sequences.length) throw new TrainingError('ترتيب التسليم غير صالح.');
  if ([...sequences].sort((a, b) => a! - b!).some((s, i) => s !== i + 1)) throw new TrainingError('تسلسل المحاولات المحفوظة غير متصل.');
  if (state.announcedRewardIds.some(id => !state.rewards.some(r => r.id === id))) throw new TrainingError('إشعار إنجاز غير موجود.');
  for (const attempt of state.attempts) {
    const d = catalog.assessments.find(d => d.id === attempt.assessmentId);
    if (!d || attempt.contentVersion !== catalog.version || attempt.assessmentVersion !== d.assessmentVersion || JSON.stringify(attempt.questionIds) !== JSON.stringify(d.questionIds) || attempt.position >= attempt.questionIds.length) throw new TrainingError('نسخة أو أسئلة المحاولة غير صالحة.');
    for (const [id, answer] of Object.entries(attempt.answers)) if (!attempt.questionIds.includes(id) || !catalog.questions.find(q => q.id === id)?.options.some(o => o.id === answer)) throw new TrainingError('إجابة غير صالحة.');
    if (attempt.status === 'submitted') {
      if (!submissionReadiness(attempt, d).canSubmit || !attempt.submittedAt || !attempt.score || JSON.stringify(grade(catalog, attempt)) !== JSON.stringify(attempt.score)) throw new TrainingError('نتيجة المحاولة غير صالحة.');
    } else if (attempt.score || attempt.submittedAt || attempt.sequence) throw new TrainingError('المسودة تحتوي نتيجة غير مسلّمة.');
  }
  for (const partId of state.readPartIds) {
    const e = catalog.elements.find(e => e.parts.some(p => p.id === partId));
    if (!e || !partAccess({ ...state, learner: { ...state.learner, active: true } }, catalog, e.id, partId).allowed) throw new TrainingError('تقدم أجزاء غير صالح.');
  }
  for (const r of state.rewards) {
    const qualifies = r.event === 'module-completed' ? moduleComplete(state, catalog, r.subjectId) : r.event === 'lesson-completed' ? lessonComplete(state, catalog, r.subjectId) : submittedFor(state, catalog.lessons.find(l => l.id === r.subjectId)?.activityAssessmentId ?? '').length > 0;
    const points = r.event === 'module-completed' ? demoPolicy.points.module : r.event === 'lesson-completed' ? demoPolicy.points.lesson : demoPolicy.points.activity;
    if (!qualifies || r.id !== `${catalog.version}:${r.event}:${r.subjectId}` || r.points !== points) throw new TrainingError('سجل إنجاز غير صالح.');
  }
  return state;
}
