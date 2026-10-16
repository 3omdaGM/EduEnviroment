import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router';
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronLeft, Circle, Flag, LockKeyhole, Maximize2, Target } from 'lucide-react';
import type { ContentBlock } from '../../docs/contracts';
import { elements, lessonBase, lessons, lessonSections, modules } from '../data/catalog';
import { usePreview } from '../state/preview';
import LearningLayout from '../components/LearningLayout';
import { IntegrationDiagram } from '../components/illustrations';
import { Breadcrumbs, Button, ButtonLink, Card, Drawer, PageHeading, Preparation, StatusBadge } from '../components/ui';
import { NotFound } from './UtilityPages';

function Blocks({ blocks }: { blocks: readonly ContentBlock[] }) {
  return <div className="reading-text">{blocks.map(block => <div key={block.id}>{block.title && <h3>{block.title}</h3>}{block.nodes.map((node, index) => {
    if (node.kind === 'paragraph') return <p key={index}>{node.text}</p>;
    if (node.kind === 'list') return node.ordered ? <ol key={index}>{node.items.map(item => <li key={item}>{item}</li>)}</ol> : <ul key={index}>{node.items.map(item => <li key={item}>{item}</li>)}</ul>;
    if (node.kind === 'image') return <figure key={index}><img src={node.src} alt={node.alt} /><figcaption>{node.caption}</figcaption></figure>;
    return <a key={index} href={node.url} target="_blank" rel="noreferrer">{node.label}</a>;
  })}</div>)}</div>;
}

function Objectives({ items }: { items: readonly string[] }) {
  return <ol className="objectives-list">{items.map((text, index) => <li key={text}><span>{index + 1}</span><p>{text}</p></li>)}</ol>;
}

function ModuleContent({ section }: { section: string }) {
  const module = modules[0]!;
  return <Card className="reading-card"><div className="reading-header"><span className="icon-tile"><BookOpen size={22} aria-hidden="true" /></span><div><p className="eyebrow">نبني الأساس أولًا</p><h2>{section === 'intro' ? 'مقدمة الموديول' : section === 'objectives' ? 'أهداف الموديول' : 'دروس الموديول'}</h2></div><StatusBadge tone="available">متاح للمعاينة</StatusBadge></div>
    {section === 'intro' ? <><Blocks blocks={module.introduction} /><div className="learning-callout"><Target size={23} aria-hidden="true" /><div><h3>الهدف قبل الأداة</h3><p>انطلق من سؤال واضح: ما الذي تريد من المتعلم أن يعرفه أو يمارسه؟</p></div></div><div className="module-overview"><span><b>٣</b> دروس مترابطة</span><span><b>٥</b> عناصر في الدرس الأول</span><span><b>١</b> شارة عند الإكمال</span></div><div className="reading-actions"><ButtonLink to="/modules/mod-01/objectives">تعرف إلى الأهداف <ArrowLeft size={17} aria-hidden="true" /></ButtonLink></div></>
      : section === 'objectives' ? <><p>بنهاية الموديول، يُتوقع أن تكون قادرًا على:</p><Objectives items={module.objectives} /><div className="reading-actions"><ButtonLink to="/modules/mod-01/lessons">استعرض الدروس <ArrowLeft size={17} aria-hidden="true" /></ButtonLink></div></>
      : <div className="lesson-list">{lessons.map((lesson, index) => <div key={lesson.id} className={`lesson-row ${index > 0 ? 'is-locked' : ''}`}><span className="row-number">{index + 1}</span><div><h3>{lesson.title}</h3><p>{index === 0 ? 'متاح لاستكشاف قالب الدرس وعناصره.' : 'يفتح بعد اجتياز التقويم الذاتي للدرس السابق. المحتوى قيد التجهيز.'}</p></div>{index === 0 ? <ButtonLink to={`${lessonBase}/intro`} variant="secondary">فتح الدرس <ArrowLeft size={16} aria-hidden="true" /></ButtonLink> : <StatusBadge tone="locked">مقفل</StatusBadge>}</div>)}</div>}
  </Card>;
}

function LessonContent({ section }: { section: string }) {
  const lesson = lessons[0]!;
  const { canRead, acknowledged } = usePreview();
  if (section === 'activity' || section === 'self-assessment') return <Preparation title={section === 'activity' ? 'النشاط قيد التجهيز' : 'التقويم الذاتي قيد التجهيز'} action={section === 'activity' ? 'بدء النشاط' : 'بدء التقويم الذاتي'}>{section === 'activity' ? 'يفتح النشاط بعد الاطلاع على جميع عناصر الدرس. لا توجد أسئلة أو درجات في هذه المعاينة.' : 'يفتح التقويم الذاتي بعد إجابة أسئلة النشاط وتسليمه. لم يُفعّل محرك التقويم في هذه النسخة.'}</Preparation>;
  return <Card className="reading-card"><div className="reading-header"><span className="icon-tile"><BookOpen size={22} aria-hidden="true" /></span><div><p className="eyebrow">الدرس الأول</p><h2>{lessonSections.find(item => item.id === section)?.label}</h2></div><span className="reading-label">قراءة وممارسة</span></div>
    {section === 'intro' ? <><Blocks blocks={lesson.introduction} /><div className="learning-callout"><Target size={23} aria-hidden="true" /><div><h3>تأمل قبل أن تبدأ</h3><p>فكر في موقف تعليمي استخدمت فيه أداة رقمية. ما الهدف الذي ساعدتك على تحقيقه؟</p></div></div><div className="lesson-preview-tags">{elements.map(element => <span key={element.id}>{element.title}</span>)}</div><div className="reading-actions"><ButtonLink to={`${lessonBase}/objectives`}>أهداف الدرس <ArrowLeft size={17} aria-hidden="true" /></ButtonLink></div></>
      : section === 'objectives' ? <><p>بعد الاطلاع على عناصر الدرس، يُتوقع أن تكون قادرًا على:</p><Objectives items={lesson.objectives} /><div className="reading-actions"><ButtonLink to={`${lessonBase}/elements`}>ابدأ بالعناصر <ArrowLeft size={17} aria-hidden="true" /></ButtonLink></div></>
      : <><p>خمسة عناصر قصيرة؛ يمكنك الرجوع إلى كل عنصر اطلعت عليه.</p><ol className="element-list">{elements.map(element => {
        const done = acknowledged.includes(element.id), available = canRead(element.id);
        const body = <><span className={`element-order ${done ? 'done' : ''}`}>{done ? <Check size={18} aria-hidden="true" /> : element.order}</span><div><h3>{element.title}</h3><p>{done ? 'تم الإقرار بالاطلاع' : available ? 'ابدأ القراءة من هنا' : 'أكمل العنصر السابق لفتحه'}</p></div>{available ? <ChevronLeft size={18} aria-hidden="true" /> : <LockKeyhole size={17} aria-hidden="true" />}</>;
        return <li key={element.id}>{available ? <Link to={`${lessonBase}/elements/${element.id}`} className="element-row">{body}</Link> : <div className="element-row is-locked">{body}</div>}</li>;
      })}</ol></>}
  </Card>;
}

function ElementContent({ id }: { id: string }) {
  const element = elements.find(item => item.id === id)!;
  const { canRead, acknowledge } = usePreview();
  const [search, setSearch] = useSearchParams();
  const [zoom, setZoom] = useState(false);
  const navigate = useNavigate();
  const requestedPart = search.get('part');
  const partIndex = requestedPart ? element.parts.findIndex(part => part.id === requestedPart) : 0;
  const part = element.parts[Math.max(0, partIndex)]!;
  if (!canRead(id)) return <Preparation title="العنصر مقفل" action="فتح العنصر">أكمل الاطلاع على العنصر السابق أولًا من قائمة عناصر الدرس. لا يؤدي فتح الرابط مباشرة إلى تجاوز الترتيب.</Preparation>;
  if (partIndex < 0) return <Navigate replace to={`${lessonBase}/elements/${id}`} />;
  const finalPart = partIndex === element.parts.length - 1;
  const previous = elements[element.order - 2];
  const next = elements[element.order];
  function goNext() {
    if (!finalPart) { setSearch({ part: element.parts[partIndex + 1]!.id }); return; }
    acknowledge(id);
    navigate(next ? `${lessonBase}/elements/${next.id}` : `${lessonBase}/elements`);
  }
  return <><Card className="reading-card element-reading"><div className="reading-header"><div><p className="eyebrow">العنصر {element.order} من {elements.length}</p><h2>{element.title === 'المفهوم' ? 'مفهوم دمج التكنولوجيا في التعليم' : element.title}</h2></div><span className="part-indicator">الجزء {partIndex + 1} من {element.parts.length}</span></div>
    <Blocks blocks={[part]} />
    <figure className="diagram-figure"><IntegrationDiagram /><div className="diagram-labels"><span>الهدف التعليمي</span><span>النشاط</span><span>الأداة الرقمية</span></div><figcaption>تتحدد قيمة الأداة بعلاقتها بالهدف والنشاط.</figcaption><Button variant="ghost" onClick={() => setZoom(true)} aria-haspopup="dialog"><Maximize2 size={16} aria-hidden="true" />تكبير الرسم</Button></figure>
    <div className="learning-callout small-callout"><Flag size={19} aria-hidden="true" /><p>اختر هدفًا واضحًا، ثم صمم نشاطًا مناسبًا، وبعدها حدد الأداة التي تخدمه.</p></div>
    <p className="content-source">مرجع القراءة: <a href="https://www.unesco.org/en/digital-competencies-skills/ict-cft" target="_blank" rel="noreferrer"><bdi>UNESCO ICT-CFT</bdi> <span className="sr-only">يفتح في نافذة جديدة</span></a></p>
    <p className="quiet-note">«تم الاطلاع» إقرار بالمرور على المحتوى، ولا يثبت الفهم أو يضيف نقاطًا.</p>
    <div className="element-navigation"><Button variant="secondary" onClick={() => {
      if (partIndex > 0) setSearch({ part: element.parts[partIndex - 1]!.id });
      else navigate(previous ? `${lessonBase}/elements/${previous.id}` : `${lessonBase}/elements`);
    }}><ArrowRight size={17} aria-hidden="true" />السابق</Button><Button onClick={goNext}>{finalPart ? 'تم الاطلاع — التالي' : 'الجزء التالي'}<ArrowLeft size={17} aria-hidden="true" /></Button></div>
    <Link to={`${lessonBase}/elements`} className="text-link return-elements">الرجوع إلى عناصر الدرس</Link>
  </Card><Drawer open={zoom} onClose={() => setZoom(false)} title="العلاقة بين الهدف والنشاط والأداة" className="image-dialog"><IntegrationDiagram /><div className="diagram-labels"><span>الهدف التعليمي</span><span>النشاط</span><span>الأداة الرقمية</span></div><p>الأداة تخدم النشاط لتحقيق الهدف التعليمي.</p></Drawer></>;
}

export default function LearningPage() {
  const { moduleId, lessonId, section, elementId } = useParams();
  const module = modules.find(item => item.id === moduleId);
  const lesson = lessons.find(item => item.id === lessonId && item.moduleId === moduleId);
  const currentSection = elementId ? 'element' : section ?? 'intro';
  if (!module || (lessonId && !lesson) || (elementId && !elements.some(item => item.id === elementId && item.lessonId === lessonId))) return <NotFound />;
  if (!section && !elementId) return <Navigate replace to={lessonId ? `/modules/${moduleId}/lessons/${lessonId}/intro` : `/modules/${moduleId}/intro`} />;
  const validSections: readonly string[] = lessonId ? lessonSections.map(item => item.id) : ['intro', 'objectives', 'lessons'];
  if (!elementId && !validSections.includes(currentSection)) return <NotFound />;
  if (module.id !== 'mod-01' || (lesson && lesson.id !== 'les-01-01')) return <><PageHeading eyebrow="المسار التدريبي" title={lesson?.title ?? module.title} /><Preparation title="المحتوى مقفل" action="فتح المحتوى">يُفتح بعد إكمال المحتوى السابق. المتاح في هذه النسخة هو الموديول الأول والدرس الأول للمعاينة فقط.</Preparation></>;
  return <><Breadcrumbs items={[{ label: 'الرئيسية', to: '/' }, { label: 'المحتوى التعليمي', to: '/content' }, ...(lesson ? [{ label: 'الموديول الأول', to: '/modules/mod-01/lessons' }] : []), ...(elementId ? [{ label: 'الدرس الأول', to: `${lessonBase}/elements` }, { label: elements.find(item => item.id === elementId)!.title }] : [{ label: lesson ? 'الدرس الأول' : 'الموديول الأول' }])]} />
    <PageHeading eyebrow={lesson ? 'الموديول ١ — خلفية نظرية عن دمج التكنولوجيا في التعليم' : 'المحطة الأولى في رحلتك'} title={lesson ? `الدرس ١: ${lesson.title}` : `الموديول ١: ${module.title}`} />
    <LearningLayout kind={lesson ? 'lesson' : 'module'} section={currentSection}>{elementId ? <ElementContent id={elementId} /> : lesson ? <LessonContent section={currentSection} /> : <ModuleContent section={currentSection} />}</LearningLayout>
    <p className="quiet-note draft-note"><Circle size={9} aria-hidden="true" />المحتوى المعروض أولي وبانتظار مراجعة الباحث واعتماده.</p>
  </>;
}
