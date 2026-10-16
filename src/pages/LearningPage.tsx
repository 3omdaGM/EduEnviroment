import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router';
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronLeft, LockKeyhole, Maximize2 } from 'lucide-react';
import type { ContentBlock, Element, Lesson, Module } from '../../docs/contracts';
import { useTraining } from '../state/training-context';
import { elementAccess, elementComplete, lessonAccess, lessonComplete, lessonRoute, moduleAccess, partAccess } from '../domain/training';
import LearningLayout from '../components/LearningLayout';
import { IntegrationDiagram } from '../components/illustrations';
import { Breadcrumbs, Button, ButtonLink, Card, Drawer, PageHeading, StatusBadge } from '../components/ui';
import { StorageProblem, TrainingGuard } from '../components/TrainingGuard';
import { NotFound } from './UtilityPages';

function Blocks({ blocks }: { blocks: readonly ContentBlock[] }) {
  return <div className="reading-text">{blocks.map(block => <div key={block.id}>{block.title && <h3>{block.title}</h3>}{block.nodes.map((node, i) => node.kind === 'paragraph' ? <p key={i}>{node.text}</p> : node.kind === 'list' ? <ul key={i}>{node.items.map(text => <li key={text}>{text}</li>)}</ul> : node.kind === 'image' ? <figure key={i}><img src={node.src} alt={node.alt} /><figcaption>{node.caption}</figcaption></figure> : <a key={i} href={node.url} target="_blank" rel="noreferrer">{node.label}</a>)}</div>)}</div>;
}
function Objectives({ items }: { items: readonly string[] }) { return <ol className="objectives-list">{items.map((text, i) => <li key={text}><span>{i + 1}</span><p>{text}</p></li>)}</ol>; }
function ModuleContent({ module, section }: { module: Module; section: string }) {
  const { catalog, snapshot } = useTraining(); const state = snapshot.data!;
  const lessons = catalog.lessons.filter(l => l.moduleId === module.id);
  return <Card className="reading-card"><div className="reading-header"><span className="icon-tile"><BookOpen size={22} aria-hidden="true" /></span><h2>{section === 'intro' ? 'مقدمة الموديول' : section === 'objectives' ? 'أهداف الموديول' : 'دروس الموديول'}</h2><StatusBadge tone="available">متاح</StatusBadge></div>
    {section === 'intro' ? <><Blocks blocks={module.introduction} /><div className="module-overview"><span><b>{lessons.length}</b> دروس مترابطة</span><span>قراءة، نشاط، ثم تقويم ذاتي</span></div><div className="reading-actions"><ButtonLink to={`/modules/${module.id}/objectives`}>تعرف إلى الأهداف <ArrowLeft size={17} aria-hidden="true" /></ButtonLink></div></>
      : section === 'objectives' ? <><p>بنهاية الموديول يُتوقع أن تكون قادرًا على:</p><Objectives items={module.objectives} /><div className="reading-actions"><ButtonLink to={`/modules/${module.id}/lessons`}>استعرض الدروس</ButtonLink></div></>
      : <div className="lesson-list">{lessons.map(lesson => { const access = lessonAccess(state, catalog, lesson.id), complete = lessonComplete(state, catalog, lesson.id); return <div key={lesson.id} className={`lesson-row ${access.allowed ? '' : 'is-locked'}`}><span className="row-number">{lesson.order}</span><div><h3>{lesson.title}</h3><p>{complete ? 'مكتمل؛ يمكنك العودة للمراجعة.' : access.allowed ? 'متاح للقراءة والممارسة.' : access.reason}</p></div><ButtonLink to={`${lessonRoute(module.id, lesson.id)}/intro`} variant="secondary">{complete ? 'مراجعة الدرس' : access.allowed ? 'فتح الدرس' : 'سبب القفل'}{!access.allowed && <LockKeyhole size={15} aria-hidden="true" />}</ButtonLink></div>; })}</div>}
  </Card>;
}
function LessonContent({ lesson, section }: { lesson: Lesson; section: string }) {
  const { catalog, snapshot } = useTraining(); const state = snapshot.data!;
  const base = lessonRoute(lesson.moduleId, lesson.id);
  return <Card className="reading-card"><div className="reading-header"><span className="icon-tile"><BookOpen size={22} aria-hidden="true" /></span><div><p className="eyebrow">الدرس {lesson.order}</p><h2>{section === 'intro' ? 'مقدمة الدرس' : section === 'objectives' ? 'أهداف الدرس' : 'عناصر الدرس'}</h2></div><StatusBadge tone={lessonComplete(state, catalog, lesson.id) ? 'complete' : 'available'}>{lessonComplete(state, catalog, lesson.id) ? 'مكتمل' : 'متاح'}</StatusBadge></div>
    {section === 'intro' ? <><Blocks blocks={lesson.introduction} /><div className="learning-callout"><p>تأمل موقفًا من ممارستك يمكن أن تستفيد فيه من هذه المهارة، ثم انتقل إلى الأهداف والعناصر.</p></div><div className="reading-actions"><ButtonLink to={`${base}/objectives`}>أهداف الدرس <ArrowLeft size={17} aria-hidden="true" /></ButtonLink></div></>
      : section === 'objectives' ? <><Objectives items={lesson.objectives} /><div className="reading-actions"><ButtonLink to={`${base}/elements`}>ابدأ بالعناصر</ButtonLink></div></>
      : <><p>اقرأ الأجزاء بالترتيب، ويمكنك الرجوع لما اطلعت عليه.</p><ol className="element-list">{lesson.elementIds.map(id => { const element = catalog.elements.find(e => e.id === id)!, access = elementAccess(state, catalog, id), done = elementComplete(state, catalog, id); return <li key={id}><Link to={`${base}/elements/${id}`} className={`element-row ${access.allowed ? '' : 'is-locked'}`}><span className={`element-order ${done ? 'done' : ''}`}>{done ? <Check size={18} aria-hidden="true" /> : element.order}</span><div><h3>{element.title}</h3><p>{done ? 'تم الإقرار بالاطلاع' : access.allowed ? 'ابدأ القراءة' : access.reason}</p></div>{access.allowed ? <ChevronLeft size={18} aria-hidden="true" /> : <LockKeyhole size={17} aria-hidden="true" />}</Link></li>; })}</ol><div className="reading-actions"><ButtonLink to={`${base}/activity`}>النشاط <ArrowLeft size={17} aria-hidden="true" /></ButtonLink></div></>}
  </Card>;
}
function ElementContent({ element }: { element: Element }) {
  const { catalog, adapter, snapshot } = useTraining(), navigate = useNavigate();
  const [search, setSearch] = useSearchParams();
  const [zoom, setZoom] = useState(false), [error, setError] = useState('');
  const requested = search.get('part'), index = requested ? element.parts.findIndex(p => p.id === requested) : 0;
  if (index < 0 || !element.parts.length) return <NotFound />;
  const part = element.parts[index]!, state = snapshot.data!;
  const access = partAccess(state, catalog, element.id, part.id);
  const lesson = catalog.lessons.find(l => l.id === element.lessonId)!;
  const base = lessonRoute(element.moduleId, element.lessonId);
  const previous = lesson.elementIds[element.order - 2], next = lesson.elementIds[element.order];
  return <TrainingGuard access={access}><Card className="reading-card element-reading"><div className="reading-header"><div><p className="eyebrow">العنصر {element.order} من {lesson.elementIds.length}</p><h2>{element.title}</h2></div><span className="part-indicator">الجزء {index + 1} من {element.parts.length}</span></div><Blocks blocks={[part]} />
    {element.moduleId === 'mod-01' && <figure className="diagram-figure"><IntegrationDiagram /><div className="diagram-labels"><span>الهدف التعليمي</span><span>النشاط</span><span>الأداة الرقمية</span></div><figcaption>تتحدد قيمة الأداة بعلاقتها بالهدف والنشاط.</figcaption><Button variant="ghost" onClick={() => setZoom(true)} aria-haspopup="dialog"><Maximize2 size={16} aria-hidden="true" />تكبير الرسم</Button></figure>}
    <div className="content-source">مراجع القراءة: {element.editorial.sources.map(source => <a key={source.id} href={source.url} target="_blank" rel="noreferrer"><bdi>{source.title}</bdi> <span className="sr-only">يفتح في نافذة جديدة</span></a>)}</div><p className="quiet-note">الإقرار بالاطلاع يسجل المرور على المحتوى ولا يثبت الفهم. يُحفظ محليًا في هذا المتصفح.</p>{error && <p role="alert">{error}</p>}
    <div className="element-navigation"><Button variant="secondary" onClick={() => index > 0 ? setSearch({ part: element.parts[index - 1]!.id }) : navigate(previous ? `${base}/elements/${previous}` : `${base}/elements`)}><ArrowRight size={17} aria-hidden="true" />السابق</Button><Button onClick={async () => { const r = await adapter.execute({ type: 'read-part', elementId: element.id, partId: part.id }); if (!r.ok) { setError(r.error); return; } if (index < element.parts.length - 1) setSearch({ part: element.parts[index + 1]!.id }); else navigate(next ? `${base}/elements/${next}` : `${base}/activity`); }}>{index === element.parts.length - 1 ? 'تم الاطلاع — التالي' : 'تم الاطلاع على الجزء — التالي'}<ArrowLeft size={17} aria-hidden="true" /></Button></div><Link to={`${base}/elements`} className="text-link return-elements">الرجوع إلى عناصر الدرس</Link>
  </Card><Drawer open={zoom} onClose={() => setZoom(false)} title="العلاقة بين الهدف والنشاط والأداة" className="image-dialog"><IntegrationDiagram /><div className="diagram-labels"><span>الهدف التعليمي</span><span>النشاط</span><span>الأداة الرقمية</span></div></Drawer></TrainingGuard>;
}
export default function LearningPage() {
  const { moduleId, lessonId, section, elementId } = useParams();
  const { catalog, snapshot } = useTraining();
  if (!snapshot.data) return <StorageProblem />;
  const module = catalog.modules.find(m => m.id === moduleId), lesson = catalog.lessons.find(l => l.id === lessonId && l.moduleId === moduleId);
  const element = catalog.elements.find(e => e.id === elementId && e.lessonId === lessonId && e.moduleId === moduleId);
  if (!module || (lessonId && !lesson) || (elementId && !element)) return <NotFound />;
  if (!section && !elementId) return <Navigate replace to={lesson ? `${lessonRoute(module.id, lesson.id)}/intro` : `/modules/${module.id}/intro`} />;
  if (!element && !['intro', 'objectives', lesson ? 'elements' : 'lessons'].includes(section ?? '')) return <NotFound />;
  const access = element ? elementAccess(snapshot.data, catalog, element.id) : lesson ? lessonAccess(snapshot.data, catalog, lesson.id) : moduleAccess(snapshot.data, catalog, module.id);
  return <><Breadcrumbs items={[{ label: 'المحتوى التعليمي', to: '/content' }, { label: `الموديول ${module.order}`, to: `/modules/${module.id}/intro` }, ...(lesson ? [{ label: `الدرس ${lesson.order}`, to: `${lessonRoute(module.id, lesson.id)}/intro` }] : []), { label: element?.title ?? (section === 'objectives' ? 'الأهداف' : section === 'elements' ? 'العناصر' : section === 'lessons' ? 'الدروس' : 'المقدمة') }]} /><PageHeading eyebrow={lesson ? `الموديول ${module.order}: ${module.title}` : 'المسار التدريبي'} title={lesson ? `الدرس ${lesson.order}: ${lesson.title}` : `الموديول ${module.order}: ${module.title}`} /><TrainingGuard access={access}><LearningLayout kind={lesson ? 'lesson' : 'module'} section={element ? 'element' : section!} moduleId={module.id} {...(lesson ? { lessonId: lesson.id } : {})}>{element ? <ElementContent element={element} /> : lesson ? <LessonContent lesson={lesson} section={section!} /> : <ModuleContent module={module} section={section!} />}</LearningLayout></TrainingGuard><p className="quiet-note draft-note">المحتوى المعروض أولي وبانتظار مراجعة الباحث واعتماده.</p></>;
}
