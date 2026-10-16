import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { contentManifest } from './content-manifest';
import { fullCatalog, questionAlignment } from './assessments';
import { learningObjectives, lessons } from './catalog';
import { freshState, parseState } from '../domain/training';

describe('phase 4 editorial integrity', () => {
  it('keeps the researcher manifest reproducible and without inferred approval', () => {
    expect(JSON.parse(readFileSync('docs/content-manifest.json', 'utf8'))).toEqual(contentManifest);
    expect(contentManifest.approval.researcherApproved).toBe(false);
    for (const asset of contentManifest.assets) expect(asset.officialLogo).toBe(false);
    for (const person of contentManifest.placeholders) expect(person.placeholder).toBe(true);
    for (const asset of contentManifest.assets) expect(readFileSync(asset.path).length).toBeGreaterThan(0);
  });
  it('traces every question to existing lesson objectives, taught elements and cited sources', () => {
    const sourceIds = new Set(contentManifest.sourceReferences.map(s => s.id));
    for (const q of fullCatalog.questions) {
      const alignment = questionAlignment[q.id]!;
      expect(alignment.objectiveIds.length, q.id).toBeGreaterThan(0);
      expect(alignment.elementIds.length, q.id).toBeGreaterThan(0);
      const goals = alignment.objectiveIds.map(id => learningObjectives.find(o => o.id === id)!);
      expect(goals.every(Boolean), q.id).toBe(true);
      for (const id of alignment.elementIds) {
        const element = fullCatalog.elements.find(e => e.id === id)!;
        expect(element, q.id).toBeDefined();
        expect(goals.some(g => g.lessonId === element.lessonId), q.id).toBe(true);
        expect(q.answerKey.sourceIds.some(source => element.editorial.sources.some(s => s.id === source)), q.id).toBe(true);
      }
      expect(q.answerKey.sourceIds.every(id => sourceIds.has(id)), q.id).toBe(true);
      expect(q.options.filter(o => o.id === q.answerKey.correctOptionId), q.id).toHaveLength(1);
      expect(new Set(q.options.map(o => o.text.trim())).size, q.id).toBe(q.options.length);
      expect(q.options).toHaveLength(q.type === 'single-choice' ? 3 : 2);
      expect(q.editorial.approval.status).toBe('draft');
    }
  });
  it('covers both measurable objectives in each lesson activity and self assessment', () => {
    for (const lesson of lessons) for (const id of [lesson.activityAssessmentId, lesson.selfAssessmentId]) {
      const d = fullCatalog.assessments.find(d => d.id === id)!;
      const ids = d.questionIds.flatMap(q => questionAlignment[q]!.objectiveIds);
      expect(new Set(ids)).toEqual(new Set(learningObjectives.filter(o => o.lessonId === lesson.id).map(o => o.id)));
    }
    const measured = new Set(fullCatalog.assessments.filter(d => ['pre', 'post'].includes(d.scope.kind)).flatMap(d => d.questionIds.flatMap(q => questionAlignment[q]!.objectiveIds)));
    expect(measured).toEqual(new Set(learningObjectives.map(o => o.id)));
  });
  it('keeps ordered short reading parts and rejects old content without silently resetting it', () => {
    expect(fullCatalog.elements).toHaveLength(29);
    expect(fullCatalog.elements.flatMap(e => e.parts)).toHaveLength(58);
    for (const e of fullCatalog.elements) {
      expect(e.parts.map(p => p.order)).toEqual([1, 2]);
      expect(e.parts.every(p => p.nodes.some(n => n.kind === 'paragraph' && n.text.length > 100))).toBe(true);
    }
    const state = freshState(fullCatalog); state.contentVersion = '0.3.0-draft';
    const raw = JSON.stringify(state);
    expect(() => parseState(raw, fullCatalog)).toThrow();
    expect(JSON.parse(raw).contentVersion).toBe('0.3.0-draft');
  });
});
