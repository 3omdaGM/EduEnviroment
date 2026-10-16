import type { AssessmentDefinition, Question, SourceReference } from '../../docs/contracts';
import type { TrainingCatalog } from '../domain/models';
import { elements, lessons, modules } from './catalog';
import { metaFor, sources } from './course-extension';

// All items are draft. Parallel wording is illustrative, not psychometric equivalence.
type Fact = { pre: string; post: string; answer: string; wrong: string; reason: string; source: SourceReference };
const fact = (pre: string, post: string, answer: string, wrong: string, reason: string, source: SourceReference): Fact => ({ pre, post, answer, wrong, reason, source });
export const facts: readonly Fact[] = [
  fact('ما نقطة البداية المناسبة لاختيار أداة تعليمية؟', 'قبل اختيار تطبيق لنشاط، ما الذي تحدده أولًا؟', 'هدف التعلم', 'شهرة التطبيق وحدها', 'يسترشد اختيار الأداة بهدف التعلم واحتياجات الموقف.', sources.theory),
  fact('ما الدليل المناسب على أداء المتعلم؟', 'كيف تراجع تحقق هدف يطلب تفسير مفهوم؟', 'مهمة يفسر فيها المفهوم', 'مجرد فتح الصفحة', 'ينبغي أن يرتبط دليل الأداء بالهدف المقصود.', sources.theory),
  fact('كيف تختار موردًا رقميًا؟', 'أي معيار يساند انتقاء مورد للتعلم؟', 'ملاءمته للهدف وإمكان الوصول إليه', 'كثرة زخارفه فقط', 'المورد ينبغي أن يناسب الهدف والمتعلمين.', sources.theory),
  fact('ماذا تفعل بعد ملاحظة صعوبة في نشاط؟', 'عندما تكشف الاستجابات التباسًا، ما الإجراء المناسب؟', 'مراجعة النشاط وتقديم دعم', 'تجاهل الاستجابات', 'تفيد مراجعة الممارسة في توجيه الدعم والتحسين.', sources.theory),
  fact('ماذا يعني هدف قابل للملاحظة؟', 'أي صياغة تساعد على جمع دليل للأداء؟', 'أن يطبق المتعلم إجراءً محددًا', 'أن يتعلم كل شيء دون تحديد', 'يسهل وصف أداء محدد ملاحظة ما ينجزه المتعلم.', sources.theory),
  fact('ما وظيفة مفتاح الإجابة في Google Forms؟', 'لربط السؤال بإجابته ودرجته، ما الذي تُعدّه؟', 'الإجابة الصحيحة والنقاط', 'لون خلفية النموذج فقط', 'يربط مفتاح الإجابة البديل الصحيح بنقاط السؤال.', sources.forms),
  fact('ما دور التغذية الراجعة في اختبار Forms؟', 'ماذا تضيف لتوضيح سبب الإجابة للمتعلم؟', 'تفسير مرتبط بالإجابة', 'ملف غير متعلق بالسؤال', 'يمكن إضافة تفسير يساعد على مراجعة الإجابة.', sources.forms),
  fact('ما طريقة مناسبة لمراجعة التقدير في Forms؟', 'كيف تراجع إجابات أفراد أو أسئلة بعينها؟', 'فحص الاستجابات والدرجات', 'الاعتماد على اسم النموذج', 'يمكن مراجعة الاستجابات وإضافة تغذية راجعة وحفظ التقدير.', sources.formsReview),
  fact('كيف تتعامل مع إعلان نتائج Forms؟', 'إذا احتاج التقدير مراجعة، فما الخيار المناسب؟', 'تأجيل إعلان الدرجات للمراجعة', 'افتراض أن الإعلان الفوري إلزامي', 'تتيح الإعدادات إعلان الدرجات فورًا أو بعد المراجعة.', sources.formsReview),
  fact('أين يمكن مشاركة مورد في Teams؟', 'كيف تتيح ملفًا للمشاركين في سياق مناسب؟', 'في محادثة أو قناة مناسبة', 'في رسالة بلا مستلمين', 'يمكن إرسال الملف أو رابطه في محادثة أو قناة.', sources.teams),
  fact('ماذا تراجع قبل مشاركة ملف في Teams؟', 'ما الذي يحدد إمكان عرض ملف أو تعديله؟', 'صلاحيات الوصول للمشاركين', 'لون أيقونة الملف', 'ينبغي مراجعة الأشخاص المخولين ونوع صلاحيتهم.', sources.teams),
  fact('ما استخدام محادثة اجتماع Teams؟', 'كيف تتبادل رابطًا أثناء الاجتماع دون مقاطعة المتحدث؟', 'المشاركة في محادثة الاجتماع', 'مقاطعة المتحدث لقراءة الرابط', 'تدعم المحادثة تبادل المعلومات والروابط أثناء الاجتماع.', sources.teamsChat),
  fact('كيف تضيف PDF إلى Reference Manager؟', 'أي إجراء يتيح إدخال ملف مرجعي إلى المكتبة؟', 'سحب الملف وإفلاته في Reference Manager', 'تغيير عنوان مستند Word فقط', 'يمكن إضافة ملفات PDF بالسحب والإفلات في Reference Manager.', sources.mendeley),
  fact('ماذا تفعل بعد إضافة مرجع؟', 'قبل استخدام بيانات مرجع مستورد، ما الخطوة المناسبة؟', 'مراجعة صحة بياناته', 'افتراض صحة كل حقل دائمًا', 'تبقى مراجعة البيانات المرجعية مهمة قبل استخدامها في الكتابة.', sources.mendeley),
  fact('ما وظيفة Mendeley Cite؟', 'كيف توظف مكتبة Mendeley داخل Word؟', 'إدراج استشهادات وقائمة مراجع', 'إدارة اجتماع فيديو', 'يتيح Cite إدراج الاستشهادات وتغيير نمطها وتوليد قائمة المراجع في Word.', sources.cite),
];
function mcq(id: string, f: Fact, prompt: string, order: number): Question {
  // Alternate placement by stable order; no render-time randomness.
  const options = [{ id: `${id}-yes`, text: f.answer }, { id: `${id}-no`, text: f.wrong }];
  return { id, prompt, order, weight: 1, type: 'single-choice', options: order % 2 ? options : [...options].reverse(), assessmentVersion: '0.3.0-draft', editorial: metaFor(f.source), answerKey: { correctOptionId: `${id}-yes`, rationale: f.reason, sourceIds: [f.source.id] } };
}
function tf(id: string, prompt: string, correct: boolean, source: SourceReference, order: number): Question {
  return { id, prompt, order, weight: 1, type: 'true-false', options: [{ id: 'true', text: 'صح' }, { id: 'false', text: 'خطأ' }], assessmentVersion: '0.3.0-draft', editorial: metaFor(source), answerKey: { correctOptionId: correct ? 'true' : 'false', rationale: correct ? 'العبارة تتفق مع الاستخدام التعليمي الموضح في المرجع.' : 'العبارة لا تتفق مع الاستخدام الموضح؛ يلزم الانتباه للهدف والمراجعة والإعدادات الفعلية.', sourceIds: [source.id] } };
}
const statements: readonly [string, string, boolean, SourceReference][] = [
  ['زيارة الصفحة وحدها تثبت فهم المتعلم.', 'مجرد فتح مورد رقمي يكفي للحكم على فهمه.', false, sources.theory],
  ['يمكن تأجيل إعلان درجات Forms للمراجعة.', 'الإعلان الفوري ليس الخيار الوحيد لدرجات Forms.', true, sources.formsReview],
  ['صلاحيات مشاركة الملف تحدد من يستطيع تعديله.', 'قد يختلف السماح بعرض الملف عن السماح بتعديله.', true, sources.teams],
  ['Mendeley Cite مخصص لإجراء اجتماعات الفيديو.', 'إجراء مكالمات الفيديو هو الوظيفة الأساسية لـCite.', false, sources.cite],
  ['يمكن إدراج استشهادات من المكتبة داخل Word باستخدام Cite.', 'توليد قائمة مراجع من استخدامات Mendeley Cite في Word.', true, sources.cite],
];
const questions: Question[] = [];
const assessments: AssessmentDefinition[] = [];
function addDefinition(id: string, title: string, scope: AssessmentDefinition['scope'], items: Question[]) {
  questions.push(...items);
  assessments.push({ id, title, purpose: scope.kind === 'pre' ? 'تحديد أهلية المشاركة وفق شروط الدراسة' : scope.kind === 'post' ? 'تقدير الأداء بعد إكمال المسار' : scope.kind === 'activity' ? 'ممارسة المهارة والحصول على تغذية راجعة' : 'مراجعة تعلم الدرس وتحديد الانتقال إلى التالي', scope, contentVersion: '0.3.0-draft', assessmentVersion: '0.3.0-draft', editorial: { ...metaFor(...Object.values(sources)), assessmentVersion: '0.3.0-draft' }, questionIds: items.map(q => q.id), expectedTypes: [...new Set(items.map(q => q.type))], timeLimitSeconds: null, attemptLimit: null, submitRequiresAllAnswers: true, feedback: ['pre', 'post'].includes(scope.kind) ? 'score-only' : 'after-submit-educational' });
}
for (const kind of ['pre', 'post'] as const) {
  const items = facts.map((f, i) => mcq(`${kind}-q-${i + 1}`, f, kind === 'pre' ? f.pre : f.post, i + 1));
  items.push(...statements.map(([pre, post, correct, source], i) => tf(`${kind}-q-${16 + i}`, kind === 'pre' ? pre : post, correct, source, 16 + i)));
  addDefinition(kind, kind === 'pre' ? 'التقويم القبلي' : 'التقويم البعدي', { kind }, items);
}
const factPairs = [[0, 1], [2, 3], [4, 0], [5, 6], [7, 8], [9, 10], [11, 9], [12, 13], [14, 13]];
lessons.forEach((lesson, index) => {
  for (const kind of ['activity', 'self'] as const) {
    const id = kind === 'activity' ? lesson.activityAssessmentId : lesson.selfAssessmentId;
    const items = factPairs[index]!.map((factIndex, i) => { const f = facts[factIndex]!; return mcq(`${id}-q-${i + 1}`, f, kind === 'activity' ? `في تطبيقك للدرس: ${f.pre}` : f.post, i + 1); });
    addDefinition(id, kind === 'activity' ? 'نشاط الدرس' : 'التقويم الذاتي', { kind, moduleId: lesson.moduleId, lessonId: lesson.id }, items);
  }
});
export const fullCatalog: TrainingCatalog = { version: '0.3.0-draft', modules, lessons, elements, assessments, questions };
