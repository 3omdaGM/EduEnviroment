import { log } from 'node:console';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const data = JSON.parse(readFileSync('src/course/imported-content.json', 'utf8'));
const authored = JSON.parse(readFileSync('src/course/authored-content.json', 'utf8'));
const overviews = JSON.parse(readFileSync('src/course/module-overviews.json', 'utf8'));
const modules = [...data.modules.map((m, index) => ({ ...m, order: index + 1, referenceOrder: m.order, origin: 'reference' })), ...authored.modules.map(m => ({ ...m, origin: 'authored' }))];
const hash = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const images = [...new Set(data.modules.flatMap(m => m.lessons.flatMap(l => Object.values(l.sections).flatMap(s => (s.images ?? []).map(i => i.src)))))];
const files = [...images.map(src => `public${src}`), 'public/course-reference/files/w1.docx'];
const manifest = {
  manifestVersion: 2, contentVersion: data.version, catalogRevision: authored.revision, authoredContentSha256: hash('src/course/authored-content.json'), authoring: authored.authoring, additionalReferences: authored.references, approval: 'draft — reference content and authored additions pending researcher review', reviewedOn: '2026-10-19',
  moduleOverviews: { revision: overviews.revision, approval: overviews.approval, authoring: overviews.authoring, sha256: hash('src/course/module-overviews.json'), modules: overviews.modules },
  sources: data.sources, contentSha256: hash('src/course/imported-content.json'), drawingsSha256: hash('src/course/embedded-figures.ts'),
  activeRoutes: ['/content', '/course/modules/:moduleId', '/course/modules/:moduleId/lessons/:lessonId/:section', '/learning-style', '/assessment/:kind/instructions'],
  modules: modules.map(m => ({ id: m.id, displayNumber: m.order, originalNumber: m.referenceOrder ?? null, origin: m.origin, title: m.title, lessons: m.lessons.map(l => ({ id: l.id, originalNumber: l.order, title: l.title, referenceIds: l.referenceIds ?? [], sections: Object.keys(l.sections), textActivities: 1 })) })),
  exams: Object.fromEntries(Object.entries(data.exams).map(([kind, qs]) => [kind, { total: qs.length, multipleChoice: qs.filter(q => q.type === 'mcq').length, trueFalse: qs.filter(q => q.type === 'tf').length, durationMinutes: 90, minimumManualAnswers: kind === 'pre' ? 0 : 5, unansweredScore: 0, questions: qs.map(q => ({ id: q.id, type: q.type, options: q.options.length, correctIndex: q.correct })) }])),
  learningStyle: { figures: 25, sections: [{ count: 7, seconds: 120, scored: false }, { count: 9, seconds: 300, scored: true }, { count: 9, seconds: 300, scored: true }], classification: { dependent: [1,8], independent: [9,17], retry: 0, supervisorReview: 18 }, grading: 'reference bounding-box approximation, not a newly validated instrument' },
  groups: { g1: ['dependent','fixed'], g2: ['independent','fixed'], g3: ['dependent','flex'], g4: ['independent','flex'] },
  persistence: { activeKey: 'edu-courselab-reference:v1', legacyKeyUntouched: 'edu-training-demo:v1', legacyContentVersion: '0.4.1-draft', migration: 'none; new content starts separately', allocation: 'per-device local counters only, not synchronized or globally balanced', activitySubmission: 'local storage plus user-triggered text download; no external recipient' },
  access: 'Demo session, first submitted pre <=50%, then learning-style assignment; all lessons/sections freely selectable. Module metadata public. No per-module passwords.',
  notImported: ['reference participant accounts or passwords', 'Firebase configuration and shared database', 'WhatsApp destination', 'module access passwords'],
  assets: files.map(path => ({ path, sha256: hash(path), source: path.endsWith('.docx') ? 'g1/files/w1.docx' : `g1/img/${path.split('/').at(-1)}` })),
};
writeFileSync('docs/course-reference-manifest.json', JSON.stringify(manifest, null, 2) + '\n');
log(`Course reference manifest: ${manifest.modules.length} modules, ${manifest.modules.reduce((n,m) => n+m.lessons.length,0)} lessons, ${files.length} local assets.`);
