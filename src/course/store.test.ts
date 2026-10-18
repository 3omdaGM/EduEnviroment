import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { courseCatalog, groups } from './catalog';
import { embeddedFigures } from './embedded-figures';
import { courseScenario } from './scenarios';
import { CourseStore, classifyStyle, courseAccess, courseEligibility, freshCourse, gradeDrawing, parseCourse, reduceCourse } from './store';
import type { CourseCommand, Point } from './store';
function runner(initial = freshCourse()) { let state = initial, n = initial.revision + 100, now = 100000; return { get state() { return state; }, setTime(value: number) { now = value; }, run(command: CourseCommand, active = true) { const r = reduceCourse(state, command, active, now, `test-${++n}`); state = r.state; return r.id; } }; }
function polygon(index: number, correct: boolean) { const points = correct ? embeddedFigures[index]!.ans : [{ x: 0, y: 0 }, { x: .02, y: .02 }]; return points.flatMap((p, i) => { const next = points[(i + 1) % points.length]!; return Array.from({ length: 5 }, (_, k) => ({ x: p.x + (next.x - p.x) * k / 5, y: p.y + (next.y - p.y) * k / 5 })); }); }
function eligible() { const r = runner(); const id = r.run({ type: 'start-exam', kind: 'pre' })!; r.run({ type: 'submit-exam', id }); return r.state; }
function completedStyle(score: number) { const r = runner(eligible()), id = r.run({ type: 'start-style' })!; for (let i = 0; i < 25; i++) { if (r.state.styleAttempts[0]!.paused) r.run({ type: 'resume-style', id }); r.run({ type: 'answer-style', id, path: polygon(i, i < 7 || i - 7 < score) }); r.run({ type: 'next-style', id }); } return r.state; }
const memory = (raw: string | null = null) => ({ raw, fail: false, read() { return this.raw; }, write(value: string) { if (this.fail) throw new Error('quota exceeded'); this.raw = value; } });
describe('reference content transfer', () => {
  it('preserves 7+3 lessons and both 160-question banks with original option counts', () => {
    expect(courseCatalog.modules.map(m => m.lessons.length)).toEqual([7, 3]);
    expect(courseCatalog.modules.map(m => m.order)).toEqual([3, 4]);
    for (const qs of Object.values(courseCatalog.exams)) { expect(qs).toHaveLength(160); for (const q of qs) { expect(q.options).toHaveLength(q.type === 'mcq' ? 4 : 2); expect(q.options[q.correct]).toBeDefined(); } }
    const original = courseCatalog.modules.map(module => Object.fromEntries(module.lessons.map((lesson) => { const { id, order, ...data } = lesson; expect(id).toBeTruthy(); return [order, data]; })));
    for (const [i, value] of original.entries()) { const raw = JSON.stringify(value).replaceAll('/course-reference/img/', 'img/'); const hash = createHash('sha256').update(raw).digest('hex'); expect(hash).toBe(['82d90baa510fa1687bcba48b6843f08efff1ea60b328185d71b1059b4d7ee937', '113d2c027e7329c70854ed73569c223114137cab6fecb85e921eb325c2d1f4a4'][i]); }
    for (const qs of Object.values(courseCatalog.exams)) {
      const source = qs.map(q => q.type === 'mcq' ? { type: q.type, text: q.prompt, options: q.options, correct: q.correct } : { type: q.type, text: q.prompt, correct: q.correct === 0 ? 'true' : 'false' });
      expect(createHash('sha256').update(JSON.stringify(source)).digest('hex')).toBe('8ab56f570201b88aebc1d63f52fd068ca77c7d84ebe3849c40707758181da03b');
    }
    expect(embeddedFigures).toHaveLength(25);
    expect(embeddedFigures.filter(q => q.sec === 1)).toHaveLength(7);
  });
});
describe('eligibility and durable assessments', () => {
  it.each([0, 80, 81, 160])('uses the exact first pre boundary at %i/160', score => {
    const r = runner(), id = r.run({ type: 'start-exam', kind: 'pre' })!;
    for (const q of courseCatalog.exams.pre.slice(0, score)) r.run({ type: 'answer-exam', id, questionId: q.id, option: q.correct });
    r.run({ type: 'submit-exam', id }); expect(r.state.attempts[0]!.score).toBe(score); expect(courseEligibility(r.state)).toBe(score <= 80 ? 'eligible' : 'ineligible');
    const retry = r.run({ type: 'start-exam', kind: 'pre' })!; r.run({ type: 'submit-exam', id: retry }); expect(courseEligibility(r.state)).toBe(score <= 80 ? 'eligible' : 'ineligible');
    expect(parseCourse(JSON.stringify(r.state))).toEqual(r.state);
  });
  it('accepts empty pre, requires five post answers manually, and grades blanks against the whole bank', () => {
    const r = runner(eligible()); const id = r.run({ type: 'start-exam', kind: 'post' })!;
    for (const q of courseCatalog.exams.post.slice(0, 4)) r.run({ type: 'answer-exam', id, questionId: q.id, option: q.correct });
    expect(() => r.run({ type: 'submit-exam', id })).toThrow('5');
    const q = courseCatalog.exams.post[4]!; r.run({ type: 'answer-exam', id, questionId: q.id, option: q.correct }); r.run({ type: 'submit-exam', id }); expect(r.state.attempts.at(-1)!.score).toBe(5);
    const revision = r.state.revision; r.run({ type: 'submit-exam', id }); expect(r.state.revision).toBe(revision);
    expect(() => r.run({ type: 'answer-exam', id, questionId: q.id, option: q.correct })).toThrow('مسلّمة');
    const tampered = structuredClone(r.state); tampered.attempts.at(-1)!.score = 160; expect(() => parseCourse(JSON.stringify(tampered))).toThrow();
  });
  it('keeps the 90 minute deadline and submits timed-out blanks without allowing late changes', () => {
    const r = runner(eligible()), id = r.run({ type: 'start-exam', kind: 'post' })!; const a = r.state.attempts.at(-1)!;
    expect(a.deadline - a.startedAt).toBe(90 * 60000); const restored = parseCourse(JSON.stringify(r.state)); expect(restored.attempts.at(-1)!.deadline).toBe(a.deadline);
    r.setTime(a.deadline + 1); expect(() => r.run({ type: 'position-exam', id, position: 1 })).toThrow('انتهى'); r.run({ type: 'submit-exam', id }); expect(r.state.attempts.at(-1)!.score).toBe(0); expect(parseCourse(JSON.stringify(r.state))).toEqual(r.state);
  });
});
describe('embedded figures, groups and support', () => {
  it.each([[0, null], [1, 'dependent'], [8, 'dependent'], [9, 'independent'], [17, 'independent'], [18, null]])('classifies %i exactly like the reference', (score, type) => expect(classifyStyle(Number(score))).toBe(type));
  it('preserves the reference bounding-box algorithm for all 25 drawings', () => {
    for (let i = 0; i < 25; i++) { expect(gradeDrawing(i, polygon(i, true)), String(i)).toBe(true); expect(gradeDrawing(i, polygon(i, false)), String(i)).toBe(false); }
    expect(gradeDrawing(0, [])).toBe(false); expect(() => gradeDrawing(0, [{ x: -1, y: 2 }] as Point[])).toThrow();
  });
  it.each(['g1', 'g2', 'g3', 'g4'] as const)('restores %s with the matching support mode and free access', group => {
    const s = courseScenario(group); expect(s.assignment!.group).toBe(group); expect(parseCourse(JSON.stringify(s))).toEqual(s); expect(courseAccess(s, true).allowed).toBe(true); expect(courseAccess(s, false).allowed).toBe(false);
    expect(groups[group].classification).toBe(classifyStyle(s.assignment!.score));
  });
  it.each([0, 18])('does not allocate the %i boundary outside the specified groups', score => { const s = completedStyle(score); expect(s.assignment).toBeNull(); expect(s.styleAttempts[0]!.score).toBe(score); expect(parseCourse(JSON.stringify(s))).toEqual(s); });
  it('excludes practice marks, preserves deadlines, and advances an expired section only after its time', () => {
    const r = runner(eligible()), id = r.run({ type: 'start-style' })!; const deadline = r.state.styleAttempts[0]!.deadline!;
    expect(() => r.run({ type: 'expire-style', id })).toThrow('لم ينته'); r.setTime(deadline + 1); r.run({ type: 'expire-style', id }); expect(r.state.styleAttempts[0]!.position).toBe(0); expect(r.state.styleAttempts[0]!.answers[0]).toBe(false); for (let i = 0; i < 7; i++) { r.run({ type: 'expire-style', id }); r.run({ type: 'next-style', id }); } expect(r.state.styleAttempts[0]!.position).toBe(7); expect(r.state.styleAttempts[0]!.paused).toBe(true);
    r.run({ type: 'resume-style', id }); expect(r.state.styleAttempts[0]!.deadline).toBe(deadline + 1 + 300000); expect(parseCourse(JSON.stringify(r.state))).toEqual(r.state);
  });
});
describe('local activity submissions and storage failures', () => {
  it('does not persist or announce success on a failed write, and detects tab conflicts', () => {
    const m = memory(), a = new CourseStore(m, () => 100, () => 'a'), b = new CourseStore(m, () => 100, () => 'b'); m.fail = true;
    expect(a.execute({ type: 'start-exam', kind: 'pre' }, true).ok).toBe(false); expect(a.getSnapshot().data!.attempts).toHaveLength(0); expect(m.raw).toBeNull();
    m.fail = false; expect(a.execute({ type: 'start-exam', kind: 'pre' }, true).ok).toBe(true); expect(b.execute({ type: 'start-exam', kind: 'pre' }, true).ok).toBe(false); b.reload(); expect(b.getSnapshot().data!.attempts).toHaveLength(1);
    expect(a.execute({ type: 'submit-exam', id: 'a' }, false).ok).toBe(false);
  });
  it('retains corrupt and incompatible raw data without silently resetting it', () => {
    for (const raw of ['bad-json', JSON.stringify({ ...freshCourse(), contentVersion: 'old' })]) { const m = memory(raw), a = new CourseStore(m); expect(a.getSnapshot().data).toBeNull(); expect(a.getSnapshot().error).toBeTruthy(); expect(m.raw).toBe(raw); }
  });
  it('keeps drafts and submission history separate and avoids duplicate identical submissions', () => {
    const r = runner(courseScenario('g3')), lessonId = courseCatalog.modules[0]!.lessons[0]!.id;
    expect(() => r.run({ type: 'submit-activity', lessonId })).toThrow('اكتب');
    r.run({ type: 'activity-draft', lessonId, text: '  إجابة تجريبية أولى  ' }); r.run({ type: 'submit-activity', lessonId }); expect(r.state.activitySubmissions[0]!.text).toBe('إجابة تجريبية أولى');
    r.run({ type: 'submit-activity', lessonId }); expect(r.state.activitySubmissions).toHaveLength(1);
    r.run({ type: 'activity-draft', lessonId, text: 'مسودة معدّلة' }); expect(r.state.activitySubmissions[0]!.text).toBe('إجابة تجريبية أولى'); r.run({ type: 'submit-activity', lessonId }); expect(r.state.activitySubmissions).toHaveLength(2);
    expect(parseCourse(JSON.stringify(r.state))).toEqual(r.state);
    const denied = runner(eligible()); expect(() => denied.run({ type: 'activity-draft', lessonId, text: 'x' })).toThrow('أسلوب');
  });
});
describe('reference manifest and restoration integrity', () => {
  it('rejects out-of-order or partially completed style results', () => {
    const s = courseScenario('g1'); s.styleAttempts[0]!.answers[1] = null; expect(() => parseCourse(JSON.stringify(s))).toThrow();
    const t = courseScenario('g2'); t.styleAttempts[0]!.position = 2; expect(() => parseCourse(JSON.stringify(t))).toThrow();
  });
});

it('matches the reference asset and content manifest without changing legacy data files', () => {
  const manifest = JSON.parse(readFileSync('docs/course-reference-manifest.json', 'utf8')) as { contentSha256: string; drawingsSha256: string; assets: { path: string; sha256: string }[] };
  const hash = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex');
  expect(hash('src/course/imported-content.json')).toBe(manifest.contentSha256); expect(hash('src/course/embedded-figures.ts')).toBe(manifest.drawingsSha256);
  expect(manifest.assets).toHaveLength(11); for (const asset of manifest.assets) expect(hash(asset.path)).toBe(asset.sha256);
});
