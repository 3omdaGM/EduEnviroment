import type { ContentBlock, EditorialMeta, Element, Lesson, Module, PersonCard } from '../../docs/contracts';
import { metaFor, outlines, sources } from './course-extension';

export const environmentName = 'بيئة تدريبية قائمة على محفزات الألعاب الرقمية لتنمية بعض مهارات دمج التكنولوجيا في التعليم لدى أعضاء الهيئة المعاونة بالكلية';
export const editorial: EditorialMeta = {
  contentVersion: '0.3.0-draft', approval: { status: 'draft' },
  sources: [{ id: 'unesco-ict-cft', title: 'UNESCO ICT Competency Framework for Teachers', publisher: 'UNESCO',
    url: 'https://www.unesco.org/en/digital-competencies-skills/ict-cft', productOrFramework: 'ICT-CFT v3',
    accessedOn: '2026-10-16', verification: 'verified' }],
};
const pendingEditorial: EditorialMeta = { ...editorial, sources: [] };
const block = (id: string, text: string, order = 1): ContentBlock => ({
  id, order, title: '', editorial, nodes: [{ kind: 'paragraph', text }],
});

export const people: readonly PersonCard[] = [
  { id: 'researcher', displayName: 'اسم الباحث', position: 'الدرجة العلمية — قيد التزويد', roleLabel: 'إعداد الباحث', placeholder: true },
  { id: 'academic-01', displayName: 'اسم الدكتور الأول', position: 'المنصب — قيد التزويد', roleLabel: 'الصفة — قيد الاعتماد', placeholder: true },
  { id: 'academic-02', displayName: 'اسم الدكتور الثاني', position: 'المنصب — قيد التزويد', roleLabel: 'الصفة — قيد الاعتماد', placeholder: true },
  { id: 'academic-03', displayName: 'اسم الدكتور الثالث', position: 'المنصب — قيد التزويد', roleLabel: 'الصفة — قيد الاعتماد', placeholder: true },
];

const baseModules: readonly Module[] = [
  { id: 'mod-01', order: 1, title: 'خلفية نظرية عن دمج التكنولوجيا في التعليم', editorial,
    introduction: [block('mod-01-intro', 'ابدأ بفهم العلاقة بين الأهداف التعليمية والتكنولوجيا، ثم تأمل كيف تختار الأداة المناسبة للموقف التعليمي.')],
    objectives: ['توضيح مفهوم دمج التكنولوجيا في التعليم.', 'تمييز الغرض التعليمي من استخدام الأداة الرقمية.', 'تحديد متطلبات توظيف التكنولوجيا في موقف تعليمي.'],
    lessonIds: ['les-01-01', 'les-01-02', 'les-01-03'], badgeId: 'badge-mod-01' },
  { id: 'mod-02', order: 2, title: 'مهارات التقويم الإلكتروني باستخدام برنامج Google Forms', editorial: pendingEditorial,
    introduction: [], objectives: ['استكشاف دور النماذج الإلكترونية في التقويم.'], lessonIds: [], badgeId: 'badge-mod-02' },
  { id: 'mod-03', order: 3, title: 'مهارات الاتصال الإلكتروني باستخدام منصة Teams', editorial: pendingEditorial,
    introduction: [], objectives: ['استكشاف الاتصال وتنظيم التفاعل في بيئة تعلم رقمية.'], lessonIds: [], badgeId: 'badge-mod-03' },
  { id: 'mod-04', order: 4, title: 'مهارات الثقافة الرقمية باستخدام برنامج Mendeley', editorial: pendingEditorial,
    introduction: [], objectives: ['استكشاف تنظيم المراجع وإدارتها في العمل الأكاديمي.'], lessonIds: [], badgeId: 'badge-mod-04' },
];
export const badgeNames: Record<string, string> = {
  'badge-mod-01': 'أساسيات الدمج', 'badge-mod-02': 'التقويم الرقمي',
  'badge-mod-03': 'التواصل التعليمي', 'badge-mod-04': 'البحث والمراجع الرقمية',
};
export const elementTitles = ['المفهوم', 'الأهمية', 'الأهداف', 'المتطلبات', 'المقومات'] as const;
const baseElements: readonly Element[] = elementTitles.map((title, index) => {
  const id = `el-01-01-0${index + 1}`;
  const text = [
    'دمج التكنولوجيا هو توظيف الأدوات والموارد الرقمية في موقف تعليمي يرتبط بهدف واضح، ويشارك فيه المتعلم بنشاط.',
    'تتيح الأدوات الرقمية تنويع الموارد والتفاعل والتغذية الراجعة، ويعتمد نفعها على ملاءمتها للمهمة واحتياجات المتعلمين.',
    'ابدأ بهدف تعلم قابل للملاحظة، ثم حدد النشاط والدليل الذي ستستند إليه لتقدير تحقق هذا الهدف.',
    'تأمل جاهزية الأجهزة والاتصال وإمكان الوصول، مع توفير دعم مناسب وخيار بديل عند تعذر استخدام الأداة.',
    'يسند الدمج تخطيط تعليمي واضح، وكفاءة مهنية مستمرة، ودعم مؤسسي، ومراجعة لما يحدث في الممارسة.',
  ][index]!;
  return { id, title, order: index + 1, moduleId: 'mod-01', lessonId: 'les-01-01', editorial,
    parts: [block(`${id}-part-01`, text), ...(index === 0 ? [block(`${id}-part-02`, 'مثال: يجيب المتعلم عن سؤال قصير، ثم يستخدم المعلم الاستجابات لمناقشة مواضع الالتباس؛ هنا تخدم الأداة قرارًا تعليميًا.', 2)] : [])] };
});
const baseLessons: readonly Lesson[] = [
  { id: 'les-01-01', moduleId: 'mod-01', order: 1, title: 'مقدمة عن دمج التكنولوجيا في التعليم', editorial,
    introduction: [block('les-01-01-intro', 'كيف يمكن أن تخدم التكنولوجيا تعلمًا مقصودًا؟ في هذا الدرس نتأمل مفهوم الدمج وأهميته وأهدافه ومتطلباته ومقوماته، من خلال أجزاء قصيرة ومثال تعليمي.')],
    objectives: ['أن توضح معنى دمج التكنولوجيا في التعليم.', 'أن تربط استخدام أداة رقمية بهدف تعليمي.', 'أن تتعرف إلى متطلبات الدمج ومقوماته.'],
    elementIds: baseElements.map(e => e.id), activityAssessmentId: 'activity-les-01-01', selfAssessmentId: 'self-les-01-01' },
  ...['بعض مهارات دمج التكنولوجيا في التعليم', 'مهارات التصميم التعليمي كأحد مهارات دمج التكنولوجيا في التعليم'].map((title, i): Lesson => ({
    id: `les-01-0${i + 2}`, moduleId: 'mod-01', order: i + 2, title, editorial, introduction: [], objectives: [], elementIds: [],
    activityAssessmentId: `activity-les-01-0${i + 2}`, selfAssessmentId: `self-les-01-0${i + 2}`,
  })),
];
export const lessonBase = '/modules/mod-01/lessons/les-01-01';
export const lessonSections = [
  { id: 'intro', label: 'مقدمة الدرس' }, { id: 'objectives', label: 'أهداف الدرس' },
  { id: 'elements', label: 'عناصر الدرس' }, { id: 'activity', label: 'النشاط' },
  { id: 'self-assessment', label: 'التقويم الذاتي' },
] as const;

export const guideSteps = [
  { title: 'التسجيل والدخول', text: 'استخدم تجربة بحساب تجريبي؛ لا تُنشأ حسابات حقيقية ولا نطلب كلمات مرور فعلية. الرمز المعلن للتجربة هو DEMO.' },
  { title: 'التقويم القبلي', text: 'أجب عن التقويم القبلي قبل بدء المسار. يمكنك المراجعة قبل التسليم، ولا يوجد وقت محدد.' },
  { title: 'أهلية المشاركة', text: 'وفق شروط الدراسة، تتيح نسبة 50% فأقل بدء المسار. إذا تجاوزت النسبة 50% فلا يتاح المسار التدريبي ضمن هذه الدراسة.' },
  { title: 'الموديولات', text: 'تنتقل بين أربع محطات بالترتيب: الخلفية النظرية، Google Forms، Teams، ثم Mendeley.' },
  { title: 'عناصر الدرس', text: 'اقرأ الأجزاء بالترتيب، ثم اختر «تم الاطلاع — التالي». يمكنك الرجوع إلى ما اطلعت عليه؛ الإقرار بالاطلاع لا يقيس الفهم.' },
  { title: 'النشاط', text: 'بعد إكمال العناصر يفتح النشاط. أجب عن كل أسئلته وسلمه؛ لا تشترط درجة معينة لفتح التقويم الذاتي.' },
  { title: 'التقويم الذاتي', text: 'تتيح نسبة 50% فأكثر إكمال الدرس والانتقال إلى التالي. عند نتيجة أقل يمكنك المراجعة والإعادة دون عقوبة.' },
  { title: 'التقويم البعدي', text: 'يفتح بعد إكمال جميع الدروس. سياسة اعتماد المحاولة للتحليل والشهادة لم تعتمد بعد، ولا تصدر هذه النسخة شهادة.' },
  { title: 'الاستكمال والخروج', text: 'تُحفظ الإجابات والتقدم محليًا في هذا المتصفح على الجهاز نفسه. الخروج لا يمحوها، لكن حذف بيانات المتصفح يفقدها؛ لا توجد مزامنة أو هوية حقيقية.' },
];

export const elements: readonly Element[] = [...baseElements, ...outlines.flatMap(outline => outline.items.map(([title, text], i): Element => {
  const id = `el-${outline.id.slice(4)}-0${i + 1}`;
  const meta = metaFor(outline.source);
  return { id, title, order: i + 1, moduleId: outline.moduleId, lessonId: outline.id, editorial: meta,
    parts: [{ id: `${id}-part-01`, title: '', order: 1, editorial: meta, nodes: [{ kind: 'paragraph', text }] }] };
}))];
export const lessons: readonly Lesson[] = [baseLessons[0]!, ...outlines.map((outline): Lesson => ({
  id: outline.id, title: outline.title, moduleId: outline.moduleId, order: Number(outline.id.slice(-2)), editorial: metaFor(outline.source),
  introduction: [{ ...block(`${outline.id}-intro`, `نتناول في هذا الدرس ${outline.title} من خلال قراءة قصيرة وتطبيق وتقويم ذاتي.`), editorial: metaFor(outline.source) }],
  objectives: outline.items.map(([title]) => `توظيف فهم ${title} في موقف تعليمي أو أكاديمي.`),
  elementIds: elements.filter(e => e.lessonId === outline.id).map(e => e.id),
  activityAssessmentId: `activity-${outline.id}`, selfAssessmentId: `self-${outline.id}`,
}))];
export const modules: readonly Module[] = baseModules.map((module, index) => {
  const refs = [sources.theory, sources.forms, sources.teams, sources.mendeley];
  const meta = metaFor(refs[index]!);
  return { ...module, editorial: meta, lessonIds: lessons.filter(l => l.moduleId === module.id).map(l => l.id),
    introduction: module.introduction.length ? module.introduction : [{ ...block(`${module.id}-intro`, `يركز هذا الموديول على ${module.title} في مواقف مهنية مختصرة قابلة للممارسة.`), editorial: meta }],
    objectives: index === 0 ? module.objectives : lessons.filter(l => l.moduleId === module.id).map(l => l.title),
  };
});
