import { elements, learningObjectives, lessons, modules, people } from './catalog';
import { fullCatalog, questionAlignment } from './assessments';
import { contentVersion, sources, temporaryLessonCounts } from './course-extension';

/** Editorial inventory, not a learner route or researcher approval. */
export const contentManifest = {
  manifestVersion: 1,
  contentVersion,
  approval: { status: 'draft', researcherApproved: false },
  reviewedOn: '2026-10-16',
  authoring: 'صياغة تعليمية عربية وأمثلة مهنية أصلية لنسخة العرض، مع مراجعة الحقائق التقنية في المصادر الرسمية؛ ليست ترجمة أو اعتمادًا من الناشرين.',
  userAssets: { suppliedLogos: [], suppliedPortraits: [], suppliedContactDetails: [], suppliedApprovedQuestions: [], requestFile: { name: 'Pasted text.txt', bytes: 26681, stage: 4 } },
  pending: ['أسماء الباحث والدكاترة وأدوارهم ومناصبهم', 'الشعارات الرسمية وحقوق استخدامها', 'وسائل الاتصال المعتمدة', 'اعتماد النصوص والأهداف والأسئلة ومخطط توزيعها', 'اعتماد أعداد وعناوين دروس الموديولات2–4', 'السياسات البحثية للقبلي والبعدي والشهادة', 'اعتماد محفزات الألعاب وقيمها'],
  temporaryLessonCounts,
  sourceReferences: Object.values(sources),
  assets: [
    { id: 'cairo', path: 'public/fonts/Cairo-OFL.txt', kind: 'font-license', origin: '@fontsource/cairo', license: 'SIL OFL 1.1', officialLogo: false },
    { id: 'lucide', path: 'public/licenses/lucide-LICENSE.txt', kind: 'icon-license', origin: 'lucide-react', license: 'ISC؛ وأيقونات مشتقة من Feather تحت MIT كما في الترخيص', officialLogo: false },
    { id: 'favicon', path: 'public/favicon.svg', kind: 'original-vector', origin: 'رسم مجرد للمشروع', license: 'أصل مؤلف للمشروع، دون اقتباس شعار رسمي', officialLogo: false },
    { id: 'illustrations', path: 'src/components/illustrations.tsx', kind: 'original-vector', origin: 'رسوم تعليمية وزخرفية للمشروع؛ النص في HTML', license: 'أصل مؤلف للمشروع، دون صور خارجية', officialLogo: false },
  ],
  placeholders: people.map(person => ({ id: person.id, displayName: person.displayName, roleLabel: person.roleLabel, placeholder: person.placeholder })),
  modules: modules.map(module => ({ id: module.id, title: module.title, approval: module.editorial.approval, sourceIds: module.editorial.sources.map(s => s.id), introductionPartIds: module.introduction.map(p => p.id), objectives: module.objectives, lessonIds: module.lessonIds })),
  lessons: lessons.map(lesson => ({ id: lesson.id, moduleId: lesson.moduleId, title: lesson.title, approval: lesson.editorial.approval, sourceIds: lesson.editorial.sources.map(s => s.id), introductionPartIds: lesson.introduction.map(p => p.id), objectives: learningObjectives.filter(o => o.lessonId === lesson.id), elementIds: lesson.elementIds, activityAssessmentId: lesson.activityAssessmentId, selfAssessmentId: lesson.selfAssessmentId })),
  elements: elements.map(element => ({ id: element.id, lessonId: element.lessonId, title: element.title, approval: element.editorial.approval, sourceIds: element.editorial.sources.map(s => s.id), parts: element.parts.map(part => ({ id: part.id, title: part.title, approval: part.editorial.approval, sourceIds: part.editorial.sources.map(s => s.id) })) })),
  assessments: fullCatalog.assessments.map(d => ({ id: d.id, scope: d.scope, assessmentVersion: d.assessmentVersion, approval: d.editorial.approval, sourceIds: d.editorial.sources.map(s => s.id), questionIds: d.questionIds })),
  questions: fullCatalog.questions.map(q => ({ id: q.id, type: q.type, approval: q.editorial.approval, sourceIds: q.editorial.sources.map(s => s.id), ...questionAlignment[q.id] })),
};
