import imported from './imported-content.json' with { type: 'json' };
import authored from './authored-content.json' with { type: 'json' };
export interface CourseVideo { title: string; videoSrc: string; videoType: string; stage?: number; }
export interface CourseImage { src: string; alt: string; caption?: string; stage?: number; }
export interface CourseStage { title: string; body: string; badge?: string; video?: CourseVideo | null; }
export interface CourseSection { content?: string; desc?: string; note: string; support: string[]; videoSrc: string; videoType: string; videos?: CourseVideo[]; images?: CourseImage[]; stages?: CourseStage[]; }
export interface CourseLesson { id: string; order: number; title: string; referenceIds?: string[]; sections: { objectives: CourseSection; content: CourseSection; activity: CourseSection }; }
export interface CourseModule { id: string; origin?: 'reference' | 'authored'; referenceOrder?: number; order: number; title: string; lessons: CourseLesson[]; }
export interface CourseQuestion { id: string; type: string; prompt: string; options: string[]; correct: number; }
export const courseCatalog: { version: string; sources: typeof imported.sources; modules: CourseModule[]; exams: Record<'pre' | 'post', CourseQuestion[]> } = { ...imported, modules: [...imported.modules.map((module, index) => ({ ...module, order: index + 1, referenceOrder: module.order, origin: 'reference' as const })), ...authored.modules.map(module => ({ ...module, origin: 'authored' as const }))] };
export const courseRevision = authored.revision;
export const authoredReferences = authored.references;
export const courseLesson = (id: string) => courseCatalog.modules.flatMap(m => m.lessons).find(l => l.id === id);
export const courseModuleFor = (lessonId: string) => courseCatalog.modules.find(m => m.lessons.some(l => l.id === lessonId));
export const courseRoute = (moduleId: string, lessonId?: string, section = 'content') => lessonId ? `/course/modules/${moduleId}/lessons/${lessonId}/${section}` : `/course/modules/${moduleId}`;
export const groups = {
  g1: { label: 'المجموعة الأولى', classification: 'dependent', styleLabel: 'معتمد على المجال', support: 'fixed', supportLabel: 'الدعم الثابت' },
  g2: { label: 'المجموعة الثانية', classification: 'independent', styleLabel: 'مستقل عن المجال', support: 'fixed', supportLabel: 'الدعم الثابت' },
  g3: { label: 'المجموعة الثالثة', classification: 'dependent', styleLabel: 'معتمد على المجال', support: 'flex', supportLabel: 'الدعم المرن' },
  g4: { label: 'المجموعة الرابعة', classification: 'independent', styleLabel: 'مستقل عن المجال', support: 'flex', supportLabel: 'الدعم المرن' },
} as const;

export const courseGuideSteps = [
  { title: 'التسجيل والدخول', text: 'ابدأ بحساب تجريبي واسم مستعار باستخدام الرمز DEMO. لا حسابات بحث حقيقية أو كلمات مرور فعلية في هذه النسخة.' },
  { title: 'التقويم القبلي', text: '160 سؤالًا من المرجع خلال 90 دقيقة. يمكن التسليم دون إجابات؛ المتروك يُحتسب غير صحيح بعد تأكيد التسليم.' },
  { title: 'أهلية المشاركة', text: 'أول قبلي مُسلّم بدرجة 50% فأقل يتيح المسار؛ الإعادات لا تغير أهلية أول محاولة.' },
  { title: 'اختبار أسلوب التعلم', text: '25 شكلًا: 7 للتدريب في دقيقتين، ثم 9 في خمس دقائق و9 في خمس دقائق. ارسم الشكل البسيط داخل المعقد وأكد الإجابة.' },
  { title: 'المجموعة ونمط الدعم', text: 'وفق المرجع: 1–8 معتمد على المجال و9–17 مستقل. يتوزع كل تصنيف بين الدعم الثابت والمرن محليًا على الجهاز. الصفر يحتاج إعادة، و18 يحتاج مراجعة المشرف.' },
  { title: 'الموديولات والدروس', text: 'أربعة موديولات: الإنتاج (7 دروس)، والنشر والتقويم (3)، والتصميم التعليمي (3)، والجودة والإتاحة (3). اضغط اسم الدرس في القائمة ثم الأهداف أو المحتوى أو النشاط؛ اختر الدروس بحرية بعد تحديد مجموعتك.' },
  { title: 'المحتوى والوسائط', text: 'اختر عنوان المرحلة من القائمة لعرض النص والفيديو أو الصورة المرتبطين بها. الدعم الثابت ظاهر، والدعم المرن يفتح بزر عرض الدعم؛ يمكن إيقاف تبديل الإرشادات.' },
  { title: 'الأنشطة والتقويم البعدي', text: 'اكتب إجابة النشاط ثم سلّمها محليًا؛ يمكنك تنزيل آخر إجابة مسلّمة. البعدي 160 سؤالًا خلال 90 دقيقة؛ يلزم 5 إجابات للتسليم اليدوي، وانتهاء الوقت يسلّم الموجود.' },
  { title: 'الاستكمال والحفظ', text: 'الحفظ محلي في المتصفح والجهاز نفسيهما. إعادة التحميل لا توقف وقت الاختبارات. بيانات النسخة السابقة محفوظة منفصلة، ولا مزامنة أو إرسال تلقائي للإجابات إلى جهات خارجية.' },
];
