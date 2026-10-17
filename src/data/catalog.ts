import type { ContentBlock, Element, Lesson, Module, PersonCard } from '../../docs/contracts';
import { contentVersion, metaFor, sources } from './course-extension';
import type { SourceKey } from './course-extension';
import { lessonContent, moduleContent } from './course-content';

export const environmentName = 'بيئة تدريبية قائمة على محفزات الألعاب الرقمية لتنمية بعض مهارات دمج التكنولوجيا في التعليم لدى أعضاء الهيئة المعاونة بالكلية';
/** Homepage introduction supplied verbatim by the user; independent of the existing environment name. */
export const homeIntroduction = {
  description: 'بيئة تعلم الجانب التطبيقي لرسالة دكتوراه الفلسفة في التربية النوعية تخصص تكنولوجيا التعليم بعنوان',
  thesisTitle: 'أثر التفاعل بين أنماط الدعم وأساليب التعلم في بيئة التعلم المدمج على تنمية مهارات إنتاج الدروس التفاعلية لدى طلاب كلية التربية النوعية',
};
/** General environment goals transcribed from the user's supplied reference image. */
export const environmentGoals = [
  'تنمية المعارف النظرية المرتبطة بمفهوم الدروس التفاعلية والتعرف على خصائصها ومميزاتها.',
  'تنمية المعارف والمهارات المرتبطة بمراحل التصميم التعليمي للدروس التفاعلية.',
  'تنمية المعارف والمهارات المرتبطة بإنتاج الدروس التفاعلية باستخدام برنامج CourseLab.',
  'تنمية المعارف والمهارات المرتبطة بنشر وتطبيق وتقويم الدروس التفاعلية.',
] as const;
export const editorial = metaFor(sources.theory);
const textBlock = (id: string, title: string, text: string, keys: readonly SourceKey[]): ContentBlock => ({
  id, title, order: 1, editorial: metaFor(...keys.map(k => sources[k])), nodes: [{ kind: 'paragraph', text }],
});
const lessonSources = (id: string) => [...new Set(lessonContent.find(l => l.id === id)!.elements.flatMap(e => e.sourceKeys))].map(key => sources[key]);
export const objectiveId = (lessonId: string, order: number) => `obj-${lessonId.slice(4)}-${order}`;
export const learningObjectives = lessonContent.flatMap(lesson => lesson.objectives.map((text, i) => ({ id: objectiveId(lesson.id, i + 1), lessonId: lesson.id, text })));

/** Names, ranks and affiliations supplied explicitly by the user; no inferred researcher rank. */
export const people: readonly PersonCard[] = [
  { id: 'researcher', displayName: 'سلوى نبوي غنيم', position: '', roleLabel: 'إعداد الباحثة', placeholder: false },
  { id: 'academic-01', displayName: 'أ.د / عبدالعزيز طلبة عبد الحميد', position: 'أستاذ تكنولوجيا التعليم\nكلية التربية - جامعة المنصورة', roleLabel: 'إشراف', placeholder: false },
  { id: 'academic-02', displayName: 'أ.د / صالح شاكر', position: 'أستاذ تكنولوجيا التعليم\nكلية التربية النوعية - جامعة المنصورة', roleLabel: 'إشراف', placeholder: false },
  { id: 'academic-03', displayName: 'أ.م.د / أمل السيد أحمد الطاهر', position: 'أستاذ تكنولوجيا التعليم المساعد\nكلية التربية النوعية - جامعة الزقازيق', roleLabel: 'إشراف', placeholder: false },
];

export const badgeNames: Record<string, string> = {
  'badge-mod-01': 'أساسيات الدمج', 'badge-mod-02': 'التقويم الرقمي',
  'badge-mod-03': 'التواصل التعليمي', 'badge-mod-04': 'البحث والمراجع الرقمية',
};
export const elementTitles = ['المفهوم', 'الأهمية', 'الأهداف', 'المتطلبات', 'المقومات'] as const;
export const lessonBase = '/modules/mod-01/lessons/les-01-01';
export const lessonSections = [
  { id: 'intro', label: 'مقدمة الدرس' }, { id: 'objectives', label: 'أهداف الدرس' },
  { id: 'elements', label: 'عناصر الدرس' }, { id: 'activity', label: 'النشاط' },
  { id: 'self-assessment', label: 'التقويم الذاتي' },
] as const;

export const guideSteps = [
  { title: 'التسجيل والدخول', text: 'استخدم تجربة بحساب تجريبي؛ لا تُنشأ حسابات حقيقية ولا نطلب كلمات مرور فعلية. الرمز المعلن للتجربة هو DEMO.' },
  { title: 'التقويم القبلي', text: 'يمكنك تسليم التقويم القبلي حتى دون إجابة أي سؤال، بعد تأكيد التسليم. تُحتسب الأسئلة المتروكة غير صحيحة؛ لا وقت محدد.' },
  { title: 'أهلية المشاركة', text: 'وفق شروط الدراسة، تتيح نسبة 50% فأقل بدء المسار. إذا تجاوزت النسبة 50% فلا يتاح المسار التدريبي ضمن هذه الدراسة.' },
  { title: 'الموديولات', text: 'بعد التأهل بالقبلي، اختر بحرية من الموديولات الأربعة: الخلفية النظرية، Google Forms، Teams، Mendeley. لا يلزم اجتياز موديول لفتح غيره.' },
  { title: 'عناصر الدرس', text: 'افتح الدروس والعناصر وأجزاء القراءة بالترتيب الذي يناسبك. اختر عنوان الجزء لقراءته و«تم الاطلاع» لتسجيله؛ الإقرار لا يقيس الفهم.' },
  { title: 'النشاط', text: 'النشاط متاح مباشرة بعد التأهل. أجب عن كل أسئلته وسلمه للحصول على تغذية راجعة؛ لا يقفل الدروس أو التقويم الذاتي.' },
  { title: 'التقويم الذاتي', text: 'نسبة 50% فأكثر تسجل إنجاز الدرس. يمكنك الإعادة دون عقوبة، وتبقى جميع الدروس والعناصر متاحة مهما كانت النتيجة.' },
  { title: 'التقويم البعدي', text: 'متاح بعد التأهل بالقبلي؛ يُنصح بأدائه بعد دراسة المحتوى. أجب عن 5 أسئلة على الأقل. لا تصدر هذه النسخة شهادة معتمدة.' },
  { title: 'الاستكمال والخروج', text: 'تُحفظ الإجابات والتقدم محليًا في هذا المتصفح على الجهاز نفسه. الخروج لا يمحوها، لكن حذف بيانات المتصفح يفقدها؛ لا توجد مزامنة أو هوية حقيقية.' },
];


export const elements: readonly Element[] = lessonContent.flatMap(lesson => lesson.elements.map((element, index) => {
  const id = `el-${lesson.id.slice(4)}-0${index + 1}`;
  return { id, title: element.title, order: index + 1, moduleId: lesson.moduleId, lessonId: lesson.id,
    editorial: metaFor(...element.sourceKeys.map(k => sources[k])),
    parts: element.readings.map((text, partIndex) => ({ ...textBlock(`${id}-part-0${partIndex + 1}`, partIndex === 0 ? 'الفكرة الأساسية' : 'موقف للتطبيق والمراجعة', text, element.sourceKeys), order: partIndex + 1 })),
  };
}));
export const lessons: readonly Lesson[] = lessonContent.map(lesson => ({
  id: lesson.id, title: lesson.title, moduleId: lesson.moduleId, order: Number(lesson.id.slice(-2)), editorial: metaFor(...lessonSources(lesson.id)),
  introduction: [textBlock(`${lesson.id}-intro`, '', lesson.introduction, [...new Set(lesson.elements.flatMap(e => e.sourceKeys))])],
  objectives: lesson.objectives, elementIds: elements.filter(e => e.lessonId === lesson.id).map(e => e.id),
  activityAssessmentId: `activity-${lesson.id}`, selfAssessmentId: `self-${lesson.id}`,
}));
const moduleTitles = ['خلفية نظرية عن دمج التكنولوجيا في التعليم', 'مهارات التقويم الإلكتروني باستخدام برنامج Google Forms', 'مهارات الاتصال الإلكتروني باستخدام منصة Teams', 'مهارات الثقافة الرقمية باستخدام برنامج Mendeley'];
export const modules: readonly Module[] = moduleContent.map((module, index) => {
  const keys = [...new Set(lessonContent.filter(l => l.moduleId === module.id).flatMap(l => l.elements.flatMap(e => e.sourceKeys)))];
  return { id: module.id, title: moduleTitles[index]!, order: index + 1, editorial: metaFor(...keys.map(k => sources[k])),
    introduction: [textBlock(`${module.id}-intro`, '', module.introduction, keys)], objectives: module.objectives,
    lessonIds: lessons.filter(l => l.moduleId === module.id).map(l => l.id), badgeId: `badge-${module.id}`,
  };
});
export { contentVersion };
