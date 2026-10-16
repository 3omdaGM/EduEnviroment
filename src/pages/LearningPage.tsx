import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router';
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronLeft, LockKeyhole, Maximize2 } from 'lucide-react';
import type { ContentBlock, Element, Lesson, Module } from '../../docs/contracts';
import { useTraining } from '../state/training-context';
import { elementAccess, elementComplete, lessonAccess, lessonComplete, lessonRoute, partAccess } from '../domain/training';
import LearningLayout from '../components/LearningLayout';
import FitPages from '../components/FitPages';
import { IntegrationDiagram } from '../components/illustrations';
import { Breadcrumbs, Button, ButtonLink, Card, Drawer, PageHeading, StatusBadge } from '../components/ui';
import { StorageProblem, TrainingGuard } from '../components/TrainingGuard';
import { NotFound } from './UtilityPages';

function Blocks({ blocks, after = [] }: { blocks: readonly ContentBlock[]; after?: readonly ReactNode[] }) {
  const [compact, setCompact] = useState(() => window.matchMedia('(max-width: 360px) and (max-height: 650px)').matches);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 360px) and (max-height: 650px)');
    const update = () => setCompact(query.matches);
    query.addEventListener('change', update); return () => query.removeEventListener('change', update);
  }, []);
  const items = blocks.flatMap(block => block.nodes.flatMap((node, i) => {
    const title = i === 0 && block.title ? <h3>{block.title}</h3> : null;
    if (node.kind === 'paragraph' && compact) {
      const chunks: string[] = []; let chunk = '';
      for (const word of node.text.match(/\S+\s*/g) ?? []) {
        if (chunk && chunk.length + word.length > 60) { chunks.push(chunk); chunk = ''; }
        chunk += word;
      }
      if (chunk) chunks.push(chunk);
      return chunks.map((text, j) => <div key={`${block.id}-${i}-${j}`}>{j === 0 && title}<p>{text}</p></div>);
    }
    if (node.kind === 'list') return node.items.map((text, j) => <div key={`${block.id}-${i}-${j}`}>{j === 0 && title}{node.ordered ? <ol start={j + 1}><li>{text}</li></ol> : <ul><li>{text}</li></ul>}</div>);
    return [<div key={`${block.id}-${i}`}>{title}{node.kind === 'paragraph' ? <p>{node.text}</p> : node.kind === 'image' ? <figure><img src={node.src} alt={node.alt} /><figcaption>{node.caption}</figcaption></figure> : <a href={node.url} target="_blank" rel="noreferrer">{node.label}</a>}</div>];
  }));
  return <FitPages key={blocks.map(b => b.id).join('-')} label="نص المحتوى" className="reading-text" items={[...items, ...after]} />;
}
function Objectives({ items }: { items: readonly string[] }) { return <FitPages label="الأهداف" className="objectives-list" items={items.map((text, i) => <div className="objective-item" key={text}><span>{i + 1}</span><p>{text}</p></div>)} />; }
function ModuleContent({ module, section }: { module: Module; section: string }) {
  const { catalog, snapshot } = useTraining(); const state = snapshot.data!;
  const lessons = catalog.lessons.filter(l => l.moduleId === module.id);
  return <Card className="reading-card"><div className="reading-header"><span className="icon-tile"><BookOpen size={22} aria-hidden="true" /></span><h2>{section === 'intro' ? 'مقدمة الموديول' : section === 'objectives' ? 'أهداف الموديول' : 'دروس الموديول'}</h2><StatusBadge tone="available">{lessons.length} دروس</StatusBadge></div>
    {section === 'intro' ? <><Blocks blocks={module.introduction} /><div className="reading-actions"><ButtonLink to={`/modules/${module.id}/objectives`}>تعرف إلى الأهداف <ArrowLeft size={17} aria-hidden="true" /></ButtonLink></div></>
      : section === 'objectives' ? <><Objectives items={module.objectives} /><div className="reading-actions"><ButtonLink to={`/modules/${module.id}/lessons`}>استعرض الدروس</ButtonLink></div></>
      : <FitPages label="دروس الموديول" className="lesson-list" items={lessons.map(lesson => { const access = lessonAccess(state, catalog, lesson.id), complete = lessonComplete(state, catalog, lesson.id); return <div key={lesson.id} className={`lesson-row ${access.allowed ? '' : 'is-locked'}`}><span className="row-number">{lesson.order}</span><div><h3>{lesson.title}</h3><p>{complete ? 'مكتمل؛ يمكنك العودة للمراجعة.' : access.allowed ? 'متاح للقراءة والممارسة.' : 'يتطلب استكمال خطوات التأهل.'}</p></div><ButtonLink to={`${lessonRoute(module.id, lesson.id)}/intro`} variant="secondary">{complete ? 'مراجعة الدرس' : access.allowed ? 'فتح الدرس' : 'فتح الدرس'}{!access.allowed && <LockKeyhole size={15} aria-hidden="true" />}</ButtonLink></div>; })} />}
  </Card>;
}
function LessonContent({ lesson, section }: { lesson: Lesson; section: string }) {
  const { catalog, snapshot } = useTraining(); const state = snapshot.data!;
  const base = lessonRoute(lesson.moduleId, lesson.id);
  return <Card className="reading-card"><div className="reading-header"><span className="icon-tile"><BookOpen size={22} aria-hidden="true" /></span><div><p className="eyebrow">الدرس {lesson.order}</p><h2>{section === 'intro' ? 'مقدمة الدرس' : section === 'objectives' ? 'أهداف الدرس' : 'عناصر الدرس'}</h2></div><StatusBadge tone={lessonComplete(state, catalog, lesson.id) ? 'complete' : 'available'}>{lessonComplete(state, catalog, lesson.id) ? 'مكتمل' : 'متاح'}</StatusBadge></div>
    {section === 'intro' ? <><Blocks blocks={lesson.introduction} after={[<div key="reflection" className="learning-callout"><p>تأمل موقفًا من ممارستك يمكن أن تستفيد فيه من هذه المهارة، ثم انتقل إلى الأهداف والعناصر.</p></div>]} /><div className="reading-actions"><ButtonLink to={`${base}/objectives`}>أهداف الدرس <ArrowLeft size={17} aria-hidden="true" /></ButtonLink></div></>
      : section === 'objectives' ? <><Objectives items={lesson.objectives} /><div className="reading-actions"><ButtonLink to={`${base}/elements`}>ابدأ بالعناصر</ButtonLink></div></>
      : <><p className="elements-hint">اقرأ بالترتيب،ويمكنك الرجوع.</p><FitPages label="عناصر الدرس" className="element-list" items={lesson.elementIds.map(id => { const element = catalog.elements.find(e => e.id === id)!, access = elementAccess(state, catalog, id), done = elementComplete(state, catalog, id); return <div key={id}><Link to={`${base}/elements/${id}`} className={`element-row ${access.allowed ? '' : 'is-locked'}`}><span className={`element-order ${done ? 'done' : ''}`}>{done ? <Check size={18} aria-hidden="true" /> : element.order}</span><div><h3>{element.title}</h3><p>{done ? 'تم الإقرار بالاطلاع' : access.allowed ? 'ابدأ القراءة' : access.reason}</p></div>{access.allowed ? <ChevronLeft size={18} aria-hidden="true" /> : <LockKeyhole size={17} aria-hidden="true" />}</Link></div>; })} /><div className="reading-actions"><ButtonLink to={`${base}/activity`}>النشاط <ArrowLeft size={17} aria-hidden="true" /></ButtonLink></div></>}
  </Card>;
}
function ElementContent({ element }: { element: Element }) {
  const { catalog, adapter, snapshot } = useTraining(), navigate = useNavigate();
  const [search, setSearch] = useSearchParams();
  const [zoom, setZoom] = useState(false), [support, setSupport] = useState(false), [error, setError] = useState('');
  const requested = search.get('part'), index = requested ? element.parts.findIndex(p => p.id === requested) : 0;
  if (index < 0 || !element.parts.length) return <NotFound />;
  const part = element.parts[index]!, state = snapshot.data!;
  const access = partAccess(state, catalog, element.id, part.id);
  const lesson = catalog.lessons.find(l => l.id === element.lessonId)!;
  const base = lessonRoute(element.moduleId, element.lessonId);
  const previous = lesson.elementIds[element.order - 2], next = lesson.elementIds[element.order];
  return <TrainingGuard access={access}><Card className="reading-card element-reading"><div className="reading-header"><div><p className="eyebrow element-context">العنصر {element.order} / {lesson.elementIds.length} · الجزء {index + 1} / {element.parts.length}</p><h2>{element.title}</h2></div><Button variant="ghost" onClick={() => setSupport(true)} aria-label="المراجع والرسم"><BookOpen size={18} aria-hidden="true" /></Button></div><Blocks blocks={[part]} />
    <p className="sr-only" id="read-ack-description">الإقرار بالاطلاع لا يثبت الفهم؛الحفظ محلي.</p>{error && <p role="alert">{error}</p>}
    <div className="element-navigation"><Link to={`${base}/elements`} className="button button--ghost return-elements" aria-label="الرجوع إلى عناصر الدرس"><BookOpen size={17} aria-hidden="true" /></Link><Button variant="secondary" aria-label="السابق" onClick={() => index > 0 ? setSearch({ part: element.parts[index - 1]!.id }) : navigate(previous ? `${base}/elements/${previous}` : `${base}/elements`)}><ArrowRight size={17} aria-hidden="true" /><span className="nav-label">السابق</span></Button><Button aria-describedby="read-ack-description" onClick={async () => { const r = await adapter.execute({ type: 'read-part', elementId: element.id, partId: part.id }); if (!r.ok) { setError(r.error); return; } if (index < element.parts.length - 1) setSearch({ part: element.parts[index + 1]!.id }); else navigate(next ? `${base}/elements/${next}` : `${base}/activity`); }}>{index === element.parts.length - 1 ? 'تم الاطلاع — التالي' : 'تم الاطلاع على الجزء — التالي'}<ArrowLeft size={17} aria-hidden="true" /></Button></div>
  </Card><Drawer open={support} onClose={() => setSupport(false)} title="الرسم التوضيحي ومراجع القراءة"><FitPages label="مراجع العنصر" items={[<p key="ack-note">الإقرار بالاطلاع يسجل المرور على المحتوى ولا يثبت الفهم. يُحفظ محليًا في هذا المتصفح.</p>,...(element.moduleId === 'mod-01' ? [<figure key="diagram" className="diagram-figure"><IntegrationDiagram /><div className="diagram-labels"><span>الهدف التعليمي</span><span>النشاط</span><span>الأداة الرقمية</span></div><figcaption>تتحدد قيمة الأداة بعلاقتها بالهدف والنشاط.</figcaption><Button variant="ghost" onClick={() => setZoom(true)} aria-haspopup="dialog"><Maximize2 size={16} aria-hidden="true" />تكبير الرسم</Button></figure>] : []),
    ...element.editorial.sources.map(source => <p key={source.id}><a href={source.url} target="_blank" rel="noreferrer"><bdi>{source.title}</bdi><span className="sr-only"> يفتح في نافذة جديدة</span></a></p>),]} /></Drawer><Drawer open={zoom} onClose={() => setZoom(false)} title="العلاقة بين الهدف والنشاط والأداة" className="image-dialog"><IntegrationDiagram /><div className="diagram-labels"><span>الهدف التعليمي</span><span>النشاط</span><span>الأداة الرقمية</span></div></Drawer></TrainingGuard>;
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
  const access = element ? elementAccess(snapshot.data, catalog, element.id) : lesson ? lessonAccess(snapshot.data, catalog, lesson.id) : { allowed: true, reason: '', nextRoute: '/content' };
  return <section className="learning-page"><div className="learning-context"><Breadcrumbs items={[{ label: 'المحتوى التعليمي', to: '/content' }, { label: `الموديول ${module.order}`, to: `/modules/${module.id}/intro` }, ...(lesson ? [{ label: `الدرس ${lesson.order}`, to: `${lessonRoute(module.id, lesson.id)}/intro` }] : []), { label: element?.title ?? (section === 'objectives' ? 'الأهداف' : section === 'elements' ? 'العناصر' : section === 'lessons' ? 'الدروس' : 'المقدمة') }]} /><PageHeading title={lesson ? `الدرس ${lesson.order}: ${lesson.title}` : `الموديول ${module.order}: ${module.title}`} /></div><TrainingGuard access={access}><LearningLayout kind={lesson ? 'lesson' : 'module'} section={element ? 'element' : section!} moduleId={module.id} {...(lesson ? { lessonId: lesson.id } : {})}>{element ? <ElementContent element={element} /> : lesson ? <LessonContent lesson={lesson} section={section!} /> : <ModuleContent module={module} section={section!} />}</LearningLayout></TrainingGuard><p className="quiet-note draft-note">المحتوى المعروض أولي وبانتظار مراجعة الباحث واعتماده.</p></section>;
}
