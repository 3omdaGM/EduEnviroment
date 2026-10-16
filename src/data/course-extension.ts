import type { EditorialMeta, SourceReference } from '../../docs/contracts';

const reference = (id: string, title: string, publisher: string, url: string): SourceReference => ({ id, title, publisher, url, accessedOn: '2026-10-16', verification: 'verified' });
export const sources = {
  theory: reference('unesco-ict-cft', 'ICT Competency Framework for Teachers v3', 'UNESCO', 'https://www.unesco.org/en/digital-competencies-skills/ict-cft'),
  forms: reference('google-forms-quiz', 'Create and grade quizzes', 'Google', 'https://support.google.com/docs/answer/7032287'),
  formsReview: reference('google-quiz-learning', 'Create a quiz with Google Forms', 'Google', 'https://support.google.com/a/users/answer/13344425?hl=en'),
  teams: reference('teams-files', 'Share files in Microsoft Teams', 'Microsoft', 'https://support.microsoft.com/en-us/teams/files/share-files-in-microsoft-teams'),
  teamsChat: reference('teams-meeting-chat', 'Chat in Microsoft Teams meetings', 'Microsoft', 'https://support.microsoft.com/en-us/teams/meetings/chat-in-microsoft-teams-meetings'),
  mendeley: reference('mendeley-add', 'Adding references — Reference Manager', 'Mendeley', 'https://static.mendeley.com/md-stitch/releases/live/02-adding-references.e005845c.html'),
  cite: reference('mendeley-cite', 'Mendeley Cite introduction', 'Mendeley', 'https://static.mendeley.com/md-stitch/releases/live/mendeley-cite-introduction.0d18bf79.html'),
};
export const metaFor = (...refs: SourceReference[]): EditorialMeta => ({ contentVersion: '0.3.0-draft', sources: refs, approval: { status: 'draft' } });
/** Counts and titles outside module 1 are temporary demonstration choices, not research approval. */
export const temporaryLessonCounts = { 'mod-01': 3, 'mod-02': 2, 'mod-03': 2, 'mod-04': 2 } as const;
export const outlines = [
  { id: 'les-01-02', moduleId: 'mod-01', title: 'بعض مهارات دمج التكنولوجيا في التعليم', source: sources.theory, items: [
    ['اختيار المورد', 'اربط المورد بحاجة تعليمية محددة، وراجع وضوحه وإمكان الوصول إليه قبل استخدامه.'],
    ['التفاعل والمشاركة', 'صمم مهمة يشارك فيها المتعلم ويشرح اختياره، مع فرصة مناسبة للتغذية الراجعة.'],
    ['مراجعة الممارسة', 'راجع الاستجابات لتحدد مواضع تحتاج دعمًا، وعدّل النشاط في ضوء ما تلاحظه.'],
  ] },
  { id: 'les-01-03', moduleId: 'mod-01', title: 'مهارات التصميم التعليمي كأحد مهارات دمج التكنولوجيا في التعليم', source: sources.theory, items: [
    ['تحديد الهدف', 'صف أداءً يمكن ملاحظته، مثل تفسير مفهوم أو تطبيق إجراء في موقف محدد.'],
    ['تصميم النشاط', 'اختر مهمة تخدم الهدف وتناسب المتعلمين؛ ثم حدد الأداة التي تدعم هذه المهمة.'],
    ['التقويم والتحسين', 'اجمع دليلًا مرتبطًا بالهدف، ثم استخدمه لمراجعة تصميم النشاط وتقديم دعم مناسب.'],
  ] },
  { id: 'les-02-01', moduleId: 'mod-02', title: 'بناء اختبار إلكتروني في Google Forms', source: sources.forms, items: [
    ['إعداد الاختبار', 'يمكن تحويل النموذج إلى اختبار، ثم إضافة أسئلة مناسبة للغرض التعليمي.'],
    ['مفتاح الإجابة', 'يتيح مفتاح الإجابة تحديد البديل الصحيح والنقاط للسؤال، وإضافة تغذية راجعة.'],
    ['مراجعة النموذج', 'راجع صياغة السؤال والبدائل ومفتاح الإجابة قبل مشاركة الاختبار.'],
  ] },
  { id: 'les-02-02', moduleId: 'mod-02', title: 'مراجعة الاستجابات والتغذية الراجعة', source: sources.formsReview, items: [
    ['قراءة الاستجابات', 'تساعد مراجعة الاستجابات حسب الفرد أو السؤال على تحديد مواضع الخطأ الشائعة.'],
    ['مراجعة التقدير', 'يمكن مراجعة درجات الإجابات وإضافة تغذية راجعة ثم حفظ التغييرات.'],
    ['إعلان النتائج', 'يمكن إعلان الدرجات بعد التسليم مباشرة أو تأجيلها للمراجعة، وفق إعدادات الاختبار.'],
  ] },
  { id: 'les-03-01', moduleId: 'mod-03', title: 'مشاركة الموارد وتنظيم التواصل في Teams', source: sources.teams, items: [
    ['اختيار مساحة المشاركة', 'يمكن مشاركة ملف أو رابطه داخل محادثة أو قناة مرتبطة بالعمل التعليمي.'],
    ['صلاحيات الملف', 'راجع الأشخاص المخولين بالوصول، وميز بين صلاحية العرض وصلاحية التعديل.'],
    ['رسالة واضحة', 'أرفق المورد برسالة توضح المطلوب من المشاركين والموعد المناسب للاستجابة.'],
  ] },
  { id: 'les-03-02', moduleId: 'mod-03', title: 'توظيف المحادثة في اجتماعات Teams', source: sources.teamsChat, items: [
    ['تبادل المعلومات', 'تتيح محادثة الاجتماع تبادل المعلومات والروابط أثناء الاجتماع دون مقاطعة المتحدث.'],
    ['مشاركة مورد', 'يمكن إرفاق مورد بالمحادثة لدعم المناقشة، مع مراعاة وصول المشاركين إليه.'],
    ['تنظيم الحوار', 'حدد سؤالًا للنقاش، واطلب استجابات مرتبطة به، ثم لخص أبرز الأفكار.'],
  ] },
  { id: 'les-04-01', moduleId: 'mod-04', title: 'إضافة المراجع إلى Mendeley Reference Manager', source: sources.mendeley, items: [
    ['إضافة مرجع', 'يمكن إضافة ملف PDF إلى مكتبة Mendeley Reference Manager بالسحب والإفلات.'],
    ['بيانات المرجع', 'راجع بيانات المرجع بعد إضافته، ولا تفترض أن البيانات المستخرجة خالية من الأخطاء.'],
    ['مكتبة قابلة للاستخدام', 'يساعد الاحتفاظ ببيانات مرجعية واضحة على اختيار المرجع المناسب عند الكتابة.'],
  ] },
  { id: 'les-04-02', moduleId: 'mod-04', title: 'الاستشهاد وإعداد قائمة المراجع باستخدام Mendeley Cite', source: sources.cite, items: [
    ['الاستشهاد داخل النص', 'تتيح إضافة Mendeley Cite إدراج مراجع من مكتبة Mendeley في مستند Word.'],
    ['نمط التوثيق', 'يمكن تغيير نمط الاستشهاد ليتوافق مع متطلبات الكتابة الأكاديمية.'],
    ['قائمة المراجع', 'يمكن توليد قائمة مراجع في المستند. راجع صحة البيانات والتنسيق قبل التسليم.'],
  ] },
] as const;
