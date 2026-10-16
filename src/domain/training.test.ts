import { describe, expect, it, vi } from 'vitest';
import { fullCatalog } from '../data/assessments';
import { createE2eFixture } from '../demo/e2e-fixture';
import { scenarioState } from '../demo/scenarios';
import { DemoAdapter } from '../services/demo-adapter';
import type { StoragePort } from '../services/demo-adapter';
import type { Command, TrainingCatalog } from './models';
import { assessmentAccess, elementAccess, freshState, isPreEligible, isSelfPassed, lessonAccess, lessonComplete, moduleAccess, moduleComplete, parseState, partAccess, reduceCommand } from './training';

const small = createE2eFixture(fullCatalog);
function runner(catalog: TrainingCatalog = small, initial = freshState(catalog)) {
  let state = initial, counter = 0;
  const execute = (command: Command) => { const r = reduceCommand(state, catalog, command, '2026-10-16T12:00:00Z', `test-${++counter}`); state = r.state; return r; };
  const take = (id: string, correct: number) => {
    const r = execute({ type: 'start-attempt', assessmentId: id }), attempt = state.attempts.find(a => a.id === r.attemptId)!;
    attempt.questionIds.forEach((qid, i) => { const q = catalog.questions.find(q => q.id === qid)!; execute({ type: 'answer', attemptId: attempt.id, questionId: qid, optionId: i < correct ? q.answerKey.correctOptionId : q.options.find(o => o.id !== q.answerKey.correctOptionId)!.id }); });
    execute({ type: 'submit', attemptId: attempt.id }); return attempt.id;
  };
  return { execute, take, get state() { return state; } };
}
function prepareFirstLesson(r: ReturnType<typeof runner>, catalog = small) {
  const lesson = catalog.lessons[0]!;
  for (const id of lesson.elementIds) for (const p of catalog.elements.find(e => e.id === id)!.parts) r.execute({ type: 'read-part', elementId: id, partId: p.id });
  return lesson;
}
function memory(raw: string | null = null) {
  const port: StoragePort & { raw: string | null; fail: boolean } = { raw, fail: false, read() { return this.raw; }, write(value) { if (this.fail) throw new DOMException('quota', 'QuotaExceededError'); this.raw = value; } };
  return port;
}

describe('exact score boundaries', () => {
  it.each([[0, true], [10, true], [11, false], [20, false]])('pre %i/20', (earned, expected) => expect(isPreEligible({ earned, possible: 20 })).toBe(expected));
  it.each([[0, false], [1, true], [2, true]])('self %i/2', (earned, expected) => expect(isSelfPassed({ earned, possible: 2 })).toBe(expected));
  it('does not round eligibility or passing thresholds', () => {
    expect(isPreEligible({ earned: 5000, possible: 10001 })).toBe(true);
    expect(isPreEligible({ earned: 5001, possible: 10001 })).toBe(false);
    expect(isSelfPassed({ earned: 5000, possible: 10001 })).toBe(false);
    expect(isSelfPassed({ earned: 5001, possible: 10001 })).toBe(true);
    expect(() => isPreEligible({ earned: 0, possible: 0 })).toThrow();
  });
});
describe('content contract and progression', () => {
  it('keeps real demo content at 20 pre and 20 post with 15 MCQ and 5 TF', () => {
    for (const id of ['pre', 'post']) {
      const d = fullCatalog.assessments.find(d => d.id === id)!;
      expect(d.questionIds).toHaveLength(20);
      expect(d.questionIds.map(id => fullCatalog.questions.find(q => q.id === id)!).filter(q => q.type === 'single-choice')).toHaveLength(15);
    }
    expect(fullCatalog.modules.map(m => m.lessonIds.length)).toEqual([3, 2, 2, 2]);
    for (const d of fullCatalog.assessments) { expect(d.minimumAnsweredQuestions).toBe(Math.min(5, d.questionIds.length)); expect(d.submitRequiresAllAnswers).toBe(d.questionIds.length <= 5); }
    expect(fullCatalog.questions.every(q => q.editorial.approval.status === 'draft' && q.answerKey.rationale && q.editorial.sources.length && q.options.some(o => o.id === q.answerKey.correctOptionId))).toBe(true);
    expect(new Set(fullCatalog.questions.map(q => q.id)).size).toBe(fullCatalog.questions.length);
    expect(fullCatalog.questions.filter(q => q.id.startsWith('pre-')).map(q => q.prompt)).not.toEqual(fullCatalog.questions.filter(q => q.id.startsWith('post-')).map(q => q.prompt));
  });
  it('requires login, submitted pre, previous lesson and previous module', () => {
    const r = runner();
    expect(moduleAccess(r.state, small, 'mod-01').allowed).toBe(false);
    r.execute({ type: 'login', name: 'عرض' });
    r.execute({ type: 'start-attempt', assessmentId: 'pre' });
    expect(moduleAccess(r.state, small, 'mod-01').allowed).toBe(false);
    r.take('pre', 1);
    expect(moduleAccess(r.state, small, 'mod-01').allowed).toBe(true);
    expect(moduleAccess(r.state, small, 'mod-02').allowed).toBe(false);
    const full = runner(fullCatalog, scenarioState(fullCatalog, 'eligible-50'));
    expect(lessonAccess(full.state, fullCatalog, 'les-01-02').allowed).toBe(false);
  });
  it('uses first submitted pre and never gives pre XP', () => {
    const r = runner(fullCatalog); r.execute({ type: 'login', name: 'عرض' });
    r.take('pre', 11); r.take('pre', 0);
    expect(moduleAccess(r.state, fullCatalog, 'mod-01').allowed).toBe(false);
    expect(r.state.attempts).toHaveLength(2); expect(r.state.rewards).toEqual([]);
    const yes = runner(fullCatalog); yes.execute({ type: 'login', name: 'عرض' }); yes.take('pre', 10); yes.take('pre', 20);
    expect(moduleAccess(yes.state, fullCatalog, 'mod-01').allowed).toBe(true);
  });
  it('prevents skipping elements and parts, including direct command calls', () => {
    const r = runner(fullCatalog, scenarioState(fullCatalog, 'eligible-50'));
    const e = fullCatalog.elements[0]!;
    expect(elementAccess(r.state, fullCatalog, fullCatalog.elements[1]!.id).allowed).toBe(false);
    expect(partAccess(r.state, fullCatalog, e.id, e.parts[1]!.id).allowed).toBe(false);
    expect(() => r.execute({ type: 'read-part', elementId: e.id, partId: e.parts[1]!.id })).toThrow();
    r.execute({ type: 'read-part', elementId: e.id, partId: e.parts[0]!.id });
    expect(elementAccess(r.state, fullCatalog, fullCatalog.elements[1]!.id).allowed).toBe(false);
    r.execute({ type: 'read-part', elementId: e.id, partId: e.parts[1]!.id });
    expect(elementAccess(r.state, fullCatalog, fullCatalog.elements[1]!.id).allowed).toBe(true);
  });
  it('requires activity submission but accepts 0%, and requires 50% in self', () => {
    const r = runner(small, scenarioState(small, 'eligible-50')), lesson = small.lessons[0]!;
    expect(assessmentAccess(r.state, small, lesson.activityAssessmentId).allowed).toBe(false);
    prepareFirstLesson(r);
    expect(assessmentAccess(r.state, small, lesson.selfAssessmentId).allowed).toBe(false);
    r.execute({ type: 'start-attempt', assessmentId: lesson.activityAssessmentId });
    expect(assessmentAccess(r.state, small, lesson.selfAssessmentId).allowed).toBe(false);
    r.take(lesson.activityAssessmentId, 0);
    expect(assessmentAccess(r.state, small, lesson.selfAssessmentId).allowed).toBe(true);
    r.take(lesson.selfAssessmentId, 0);
    expect(lessonComplete(r.state, small, lesson.id)).toBe(false);
    r.take(lesson.selfAssessmentId, 1);
    expect(lessonComplete(r.state, small, lesson.id)).toBe(true);
    expect(moduleAccess(r.state, small, 'mod-02').allowed).toBe(true);
  });
  it('keeps success and rewards through retries; repeated submit is idempotent', () => {
    const r = runner(small, scenarioState(small, 'eligible-50')), lesson = prepareFirstLesson(r);
    r.take(lesson.activityAssessmentId, 0); const passedId = r.take(lesson.selfAssessmentId, 1);
    const total = r.state.rewards.reduce((sum, r) => sum + r.points, 0);
    expect(total).toBe(80);
    const revision = r.state.revision;
    r.execute({ type: 'submit', attemptId: passedId });
    expect(r.state.revision).toBe(revision);
    r.take(lesson.selfAssessmentId, 0); r.take(lesson.selfAssessmentId, 2); r.take(lesson.activityAssessmentId, 2);
    expect(lessonComplete(r.state, small, lesson.id)).toBe(true);
    expect(r.state.rewards.reduce((sum, r) => sum + r.points, 0)).toBe(total);
    expect(() => r.execute({ type: 'answer', attemptId: passedId, questionId: 'x', optionId: 'x' })).toThrow(/لا يمكن تعديل/);
  });
  it('opens post after all modules, without an intermediate or certificate test', () => {
    const state = scenarioState(fullCatalog, 'completed');
    expect(fullCatalog.modules.every(m => moduleComplete(state, fullCatalog, m.id))).toBe(true);
    expect(assessmentAccess(state, fullCatalog, 'post').allowed).toBe(true);
    expect(state.rewards.reduce((n, r) => n + r.points, 0)).toBe(470);
    expect(state.rewards.filter(r => r.badgeId)).toHaveLength(4);
    expect(parseState(JSON.stringify(state), fullCatalog)).toEqual(state);
  });
});
describe('adapter, drafts and durable transaction limits', () => {
  it('restores draft answers and navigation and forbids incomplete submit', async () => {
    const port = memory(), a = new DemoAdapter(port, small);
    await a.execute({ type: 'login', name: 'تجربة' });
    const start = await a.execute({ type: 'start-attempt', assessmentId: 'pre' }); expect(start.ok).toBe(true);
    const id = a.getSnapshot().data!.attempts[0]!.id, q = small.questions.find(q => q.id === small.assessments[0]!.questionIds[0])!;
    await a.execute({ type: 'answer', attemptId: id, questionId: q.id, optionId: q.options[0]!.id });
    await a.execute({ type: 'position', attemptId: id, position: 1 });
    expect((await a.execute({ type: 'submit', attemptId: id })).ok).toBe(false);
    const b = new DemoAdapter(port, small), restored = b.getAttemptView(id)!;
    expect(restored.attempt.answers[q.id]).toBe(q.options[0]!.id); expect(restored.attempt.position).toBe(1);
    expect(JSON.stringify(restored.questions)).not.toMatch(/answerKey|rationale|correctOptionId/);
    expect(restored.feedback).toBeNull();
    await b.execute({ type: 'answer', attemptId: id, questionId: q.id, optionId: q.options[1]!.id });
    expect(b.getAttemptView(id)!.attempt.answers[q.id]).toBe(q.options[1]!.id);
  });
  it('retains corrupted/old state without silently resetting it', () => {
    for (const raw of ['bad-json', JSON.stringify({ ...freshState(small), schemaVersion: 99 }), JSON.stringify({ ...freshState(small), contentVersion: 'old' })]) {
      const port = memory(raw), adapter = new DemoAdapter(port, small);
      expect(adapter.getSnapshot().fault).toBe('corrupt'); expect(adapter.getSnapshot().data).toBeNull(); expect(port.raw).toBe(raw);
    }
  });
  it('does not advance on a failed write, and detects other-tab conflicts', async () => {
    const port = memory(), a = new DemoAdapter(port, small), b = new DemoAdapter(port, small);
    port.fail = true; expect((await a.execute({ type: 'login', name: 'تجربة' })).ok).toBe(false);
    expect(a.getSnapshot().data!.learner.active).toBe(false); expect(port.raw).toBeNull();
    port.fail = false; await a.execute({ type: 'login', name: 'تجربة' });
    expect((await b.execute({ type: 'login', name: 'آخر' })).ok).toBe(false);
    expect(b.getSnapshot().fault).toBe('conflict'); b.reload(); expect(b.getSnapshot().data!.learner.active).toBe(true);
  });
  it('restricts reset to tools; logout keeps data and stores no email/code/password', async () => {
    const port = memory(), a = new DemoAdapter(port, small);
    expect((await a.replaceFromTools(freshState(small))).ok).toBe(false);
    await a.execute({ type: 'login', name: 'اسم مستعار' }); await a.execute({ type: 'logout' });
    expect(port.raw).not.toMatch(/password|email|confirmation|DEMO/);
    const tools = new DemoAdapter(port, small, true);
    expect((await tools.replaceFromTools(scenarioState(small, 'eligible-50'))).ok).toBe(true);
  });
  it('delivers explanations only after activity/self submit and celebrates once', async () => {
    vi.useFakeTimers();
    try {
      const r = runner(small, scenarioState(small, 'eligible-50')), lesson = prepareFirstLesson(r);
      const port = memory(JSON.stringify(r.state)), a = new DemoAdapter(port, small);
      const started = await a.execute({ type: 'start-attempt', assessmentId: lesson.activityAssessmentId });
      const id = started.ok ? started.value.attemptId! : '';
      expect(a.getAttemptView(id)!.feedback).toBeNull();
      for (const q of a.getAttemptView(id)!.questions) await a.execute({ type: 'answer', attemptId: id, questionId: q.id, optionId: q.options[0]!.id });
      await a.execute({ type: 'submit', attemptId: id });
      expect(a.getAttemptView(id)!.feedback).toHaveLength(2); expect(a.getSnapshot().celebration).toContain('10');
      const raw = port.raw; await a.execute({ type: 'submit', attemptId: id }); expect(port.raw).toBe(raw);
      vi.runAllTimers(); expect(a.getSnapshot().celebration).toBeNull();
      expect(new DemoAdapter(port, small).getSnapshot().celebration).toBeUndefined();
      const pre = a.getSnapshot().data!.attempts.find(a => a.assessmentId === 'pre')!;
      expect(a.getAttemptView(pre.id)!.feedback).toBeNull();
    } finally { vi.useRealTimers(); }
  });
});

describe('partial submission with a minimum answered count', () => {
  it('rejects four answers, submits five of twenty, scores skipped questions as zero and restores durably', () => {
    const r = runner(fullCatalog); r.execute({ type: 'login', name: 'تجربة' });
    const id = r.execute({ type: 'start-attempt', assessmentId: 'pre' }).attemptId!;
    const ids = r.state.attempts[0]!.questionIds;
    for (const qid of ids.slice(0, 4)) { const q = fullCatalog.questions.find(q => q.id === qid)!; r.execute({ type: 'answer', attemptId: id, questionId: qid, optionId: q.answerKey.correctOptionId }); }
    expect(() => r.execute({ type: 'submit', attemptId: id })).toThrow('5');
    const q = fullCatalog.questions.find(q => q.id === ids[4])!;
    r.execute({ type: 'answer', attemptId: id, questionId: q.id, optionId: q.answerKey.correctOptionId });
    r.execute({ type: 'submit', attemptId: id });
    expect(r.state.attempts[0]!.score).toEqual({ earned: 5, possible: 20 });
    expect(Object.keys(r.state.attempts[0]!.answers)).toHaveLength(5);
    expect(parseState(JSON.stringify(r.state), fullCatalog)).toEqual(r.state);
    expect(r.state.rewards).toHaveLength(0);
    expect(() => r.execute({ type: 'answer', attemptId: id, questionId: ids[5]!, optionId: 'x' })).toThrow();
    const revision = r.state.revision; r.execute({ type: 'submit', attemptId: id }); expect(r.state.revision).toBe(revision);
  });
  it('requires both questions in a two-question assessment and preserves the old full-answer snapshot', () => {
    const state = scenarioState(fullCatalog, 'completed');
    expect(parseState(JSON.stringify(state), fullCatalog)).toEqual(state);
    const r = runner(fullCatalog, state), assessment = fullCatalog.lessons[0]!.selfAssessmentId;
    const id = r.execute({ type: 'start-attempt', assessmentId: assessment }).attemptId!;
    const a = r.state.attempts.find(a => a.id === id)!, q = fullCatalog.questions.find(q => q.id === a.questionIds[0])!;
    r.execute({ type: 'answer', attemptId: id, questionId: q.id, optionId: q.answerKey.correctOptionId });
    expect(() => r.execute({ type: 'submit', attemptId: id })).toThrow('2');
    const tampered = structuredClone(r.state); const attempt = tampered.attempts.find(a => a.id === id)!;
    attempt.status = 'submitted'; attempt.score = { earned: 1, possible: 2 }; attempt.submittedAt = '2026-10-16T00:00:00Z'; attempt.sequence = tampered.attempts.filter(a => a.status === 'submitted').length;
    expect(() => parseState(JSON.stringify(tampered), fullCatalog)).toThrow();
  });
  it('rejects invalid stored alternatives even when there are five answer keys', () => {
    const r = runner(fullCatalog); r.execute({ type: 'login', name: 'تجربة' });
    r.execute({ type: 'start-attempt', assessmentId: 'pre' });
    const raw = structuredClone(r.state), a = raw.attempts[0]!;
    for (const id of a.questionIds.slice(0, 5)) a.answers[id] = 'foreign-option';
    expect(() => parseState(JSON.stringify(raw), fullCatalog)).toThrow();
  });
});
