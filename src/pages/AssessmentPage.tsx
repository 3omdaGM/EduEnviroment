import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router';
import { ArrowLeft, ArrowRight, Check, Clock3 } from 'lucide-react';
import type { AssessmentDefinition } from '../../docs/contracts';
import { useTraining } from '../state/training-context';
import { assessmentAccess, eligibility, isSelfPassed, lessonComplete, lessonRoute } from '../domain/training';
import { Breadcrumbs, Button, ButtonLink, Card, PageHeading, ProgressIndicator, StatusBadge } from '../components/ui';
import { StorageProblem, TrainingGuard } from '../components/TrainingGuard';
import LearningLayout from '../components/LearningLayout';
import { NotFound } from './UtilityPages';

function Engine({ definition: d, base, instructions }: { definition: AssessmentDefinition; base: string; instructions: string }) {
  const { adapter, catalog, snapshot } = useTraining();
  const state = snapshot.data!;
  const { attemptId, stage } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(''), [submitting, setSubmitting] = useState(false);
  const access = assessmentAccess(state, catalog, d.id);
  const attempts = state.attempts.filter(a => a.assessmentId === d.id);
  async function start() { const r = await adapter.execute({ type: 'start-attempt', assessmentId: d.id }); if (r.ok && r.value.attemptId) navigate(`${base}/attempt/${r.value.attemptId}`); else if (!r.ok) setError(r.error); }
  if (!attemptId) {
    const counts = d.questionIds.reduce((out, id) => { const type = catalog.questions.find(q => q.id === id)!.type; out[type] = (out[type] ?? 0) + 1; return out; }, {} as Record<string, number>);
    return <><Card className="assessment-instructions"><div className="reading-header"><span className="icon-tile"><Clock3 size={25} aria-hidden="true" /></span><h2>تعليمات {d.title}</h2><StatusBadge tone={access.allowed ? 'available' : 'locked'}>{access.allowed ? 'متاح' : 'مقفل'}</StatusBadge></div><p>{d.purpose}.</p><ul><li>{d.questionIds.length} مفردة: {counts['single-choice'] ?? 0} اختيار من متعدد، و{counts['true-false'] ?? 0} صح/خطأ؛ أوزان متساوية في نموذج العرض.</li><li>سؤال واحد واختيار بديل واحد في كل شاشة. يمكنك الرجوع وتعديل الإجابات قبل التسليم.</li><li>لا وقت محدد، والمحاولات متعددة دون حد مخطط.</li><li>أجب عن الجميع، ثم راجع وأكد التسليم. لا تعديل لمحاولة مسلّمة؛ الإعادة محاولة مستقلة.</li><li>تُحفظ المسودة بعد الاختيار والتنقل في المتصفح نفسه على الجهاز نفسه. حذف بيانات المتصفح يفقدها؛ لا توجد مزامنة أو حماية إنتاجية.</li><li>{d.feedback === 'score-only' ? 'لا تُعرض الإجابات الصحيحة أو التصحيح التفصيلي في هذا التقويم.' : 'تظهر الإجابات والتفسيرات بعد التسليم فقط.'}</li>{d.scope.kind === 'pre' && <li>في هذا العرض، أول قبلي مُسلّم وحده يحدد الأهلية: نسبة 50% فأقل تتيح المسار. لا تغيرها الإعادات ولا تمنح نقاطًا.</li>}{d.scope.kind === 'self' && <li>50% فأكثر اجتياز؛ يمكنك الإعادة والمراجعة دون إلغاء نجاح سابق.</li>}{d.scope.kind === 'activity' && <li>يُفتح الذاتي بعد تسليم إجابات النشاط كاملة مهما كانت درجته.</li>}{d.scope.kind === 'post' && <li>تعرض نسبة كل محاولة دون حد نجاح أو شهادة أو اختيار محاولة للتحليل.</li>}</ul><p className="quiet-note">المحتوى والأسئلة أولية بانتظار اعتماد الباحث؛ القبلي والبعدي مختلفان في الصياغة، دون ادعاء تكافؤ بحثي.</p></Card>
      <TrainingGuard access={access}><Card className="assessment-start"><Button onClick={start}>{attempts.some(a => a.status === 'draft') ? 'استكمال المحاولة' : `بدء ${d.title}`}</Button>{error && <p role="alert">{error}</p>}</Card></TrainingGuard>
      {state.learner.active && !!attempts.length && <Card className="attempt-history"><h2>سجل المحاولات</h2><ol>{attempts.map((a, i) => <li key={a.id}><span>المحاولة {i + 1} — {a.status === 'draft' ? 'مسودة' : `${a.score!.earned} / ${a.score!.possible} (${(a.score!.earned / a.score!.possible * 100).toFixed(2)}%)`}</span><ButtonLink variant="ghost" to={`${base}/attempt/${a.id}${a.status === 'submitted' ? '/result' : ''}`}>{a.status === 'draft' ? 'استكمال' : 'عرض النتيجة'}</ButtonLink></li>)}</ol></Card>}
    </>;
  }
  if (!state.learner.active) return <TrainingGuard access={access}><span /></TrainingGuard>;
  const view = adapter.getAttemptView(attemptId);
  if (!view || view.definition.id !== d.id || (stage && !['review', 'confirm', 'result'].includes(stage))) return <NotFound />;
  const a = view.attempt;
  if (!access.allowed && a.status === 'draft') return <TrainingGuard access={access}><span /></TrainingGuard>;
  const url = `${base}/attempt/${a.id}`;
  if (a.status === 'submitted' && stage !== 'result') return <Navigate replace to={`${url}/result`} />;
  if (a.status === 'draft' && stage === 'result') return <Navigate replace to={url} />;
  if (stage === 'result' && a.score) {
    const pre = eligibility(state, catalog);
    const scope = d.scope;
    const lesson = 'lessonId' in scope ? catalog.lessons.find(l => l.id === scope.lessonId) : undefined;
    const nextLesson = lesson ? catalog.lessons[catalog.lessons.findIndex(l => l.id === lesson.id) + 1] : undefined;
    const nextRoute = d.scope.kind === 'activity' && lesson ? `${lessonRoute(lesson.moduleId, lesson.id)}/self-assessment` : nextLesson ? (nextLesson.moduleId === lesson?.moduleId ? `${lessonRoute(nextLesson.moduleId, nextLesson.id)}/intro` : `/modules/${nextLesson.moduleId}/intro`) : '/assessment/post/instructions';
    return <Card className="assessment-result"><StatusBadge tone="complete">محاولة مسلّمة — نتيجة تجريبية</StatusBadge><h2>نتيجة {d.title}</h2><div className="score-display"><strong dir="ltr">{(a.score.earned / a.score.possible * 100).toFixed(2)}%</strong><span dir="ltr">{a.score.earned} / {a.score.possible}</span></div><p>النسبة للعرض؛ شروط الفتح تُحسب بالدرجة الدقيقة قبل التقريب. نقاط الإنجاز منفصلة عنها.</p>
      {d.scope.kind === 'pre' && <div className="notice"><p>{pre.status === 'eligible' ? 'عزيزي المتدرب، لم تتجاوز نسبتك 50%، لذا يمكنك البدء بدراسة المحتوى التدريبي' : 'وفقًا لشروط المشاركة المحددة لهذه الدراسة، لا يتاح لك المسار التدريبي'}<br />درجة أول قبلي مُسلّم المحددة للأهلية: <bdi>{pre.attempt!.score!.earned} / {pre.attempt!.score!.possible}</bdi> ({(pre.attempt!.score!.earned / pre.attempt!.score!.possible * 100).toFixed(2)}%). الإعادات لا تغير الأهلية في العرض.</p></div>}
      {d.scope.kind === 'self' && <p role="status">{isSelfPassed(a.score) ? 'اجتزت التقويم الذاتي وأكملت الدرس.' : lesson && lessonComplete(state, catalog, lesson.id) ? 'هذه المحاولة أقل من 50%، ويبقى اجتيازك السابق وإنجازك محفوظين.' : 'لم تجتز هذه المحاولة؛ راجع عناصر الدرس وأعد المحاولة.'}</p>}
      {d.scope.kind === 'activity' && <p>اكتمل تسليم النشاط وأصبح التقويم الذاتي متاحًا، دون اشتراط درجة نجاح.</p>}
      {d.scope.kind === 'post' && <p>حُفظت هذه المحاولة مستقلة. لا حد نجاح أو شهادة معتمدة، ولم تُختر محاولة للتحليل البحثي.</p>}
      <div className="button-row">{d.scope.kind === 'pre' && pre.status === 'eligible' ? <ButtonLink to="/content">ابدأ المسار</ButtonLink> : (d.scope.kind === 'activity' || (d.scope.kind === 'self' && lesson && lessonComplete(state, catalog, lesson.id))) ? <ButtonLink to={nextRoute}>الانتقال إلى الخطوة التالية <ArrowLeft size={17} aria-hidden="true" /></ButtonLink> : <ButtonLink to="/content" variant="secondary">المسار التدريبي</ButtonLink>}<Button variant="secondary" onClick={start}>محاولة جديدة</Button><ButtonLink variant="ghost" to={instructions}>سجل المحاولات والتعليمات</ButtonLink>{lesson && <ButtonLink variant="ghost" to={`${lessonRoute(lesson.moduleId, lesson.id)}/elements`}>مراجعة العناصر</ButtonLink>}</div>
      {view.feedback && <section className="feedback-list" aria-label="التغذية الراجعة التعليمية"><h2>مراجعة إجاباتك</h2>{view.feedback.map(f => { const q = view.questions.find(q => q.id === f.questionId)!; return <div className="feedback-card" key={f.questionId}><h3>{q.prompt}</h3><p>إجابتك: {q.options.find(o => o.id === f.selected)!.text}</p><p><Check size={15} aria-hidden="true" />الإجابة الصحيحة: {q.options.find(o => o.id === f.correct)!.text}</p><p>{f.explanation}</p>{f.sources.map(source => <a href={source.url} key={source.id} target="_blank" rel="noreferrer">{source.title} <span className="sr-only">يفتح في نافذة جديدة</span></a>)}</div>; })}</section>}
      {error && <p role="alert">{error}</p>}
    </Card>;
  }
  const missing = a.questionIds.filter(id => !a.answers[id]);
  async function goQuestion(index: number) { const r = await adapter.execute({ type: 'position', attemptId: a.id, position: index }); if (r.ok) navigate(`${url}?question=${a.questionIds[index]}`); else setError(r.error); }
  if (stage === 'review') return <Card className="reading-card"><h2>مراجعة الإجابات قبل التسليم</h2><p>{a.questionIds.length - missing.length} من {a.questionIds.length} مجاب عنها. اختر رقمًا لمراجعة الإجابة أو استكمال غير المجاب.</p><div className="question-review">{view.questions.map((q, index) => <Button key={q.id} variant={a.answers[q.id] ? 'secondary' : 'ghost'} onClick={() => goQuestion(index)} aria-label={`السؤال ${index + 1}: ${a.answers[q.id] ? 'مجاب' : 'غير مجاب'}`}>{index + 1}<span>{a.answers[q.id] ? 'مجاب' : 'غير مجاب'}</span></Button>)}</div><p id="missing-note">{missing.length ? `بقي ${missing.length} سؤالًا. يلزم إجابة الجميع لتفعيل التأكيد.` : 'اكتملت جميع الإجابات؛ يمكنك مراجعتها أو تأكيد التسليم.'}</p><div className="button-row"><Button onClick={() => navigate(`${url}/confirm`)} disabled={!!missing.length} aria-describedby="missing-note">الانتقال إلى تأكيد التسليم</Button><Button variant="secondary" onClick={() => goQuestion(a.position)}>العودة للأسئلة</Button></div></Card>;
  if (stage === 'confirm') return <Card className="preparation"><h2>تأكيد التسليم النهائي</h2><p>بعد التسليم لا يمكن تعديل هذه المحاولة. الإعادة تنشئ محاولة جديدة مستقلة.</p>{!!missing.length && <p role="alert">توجد أسئلة غير مجابة؛ ارجع إلى المراجعة.</p>}<Button disabled={submitting || !!missing.length} onClick={async () => { if (submitting) return; setSubmitting(true); const r = await adapter.execute({ type: 'submit', attemptId: a.id }); if (r.ok) navigate(`${url}/result`); else { setError(r.error); setSubmitting(false); } }}>تأكيد وتسليم المحاولة</Button><ButtonLink variant="secondary" to={`${url}/review`}>العودة إلى المراجعة</ButtonLink>{error && <p role="alert">{error}</p>}</Card>;
  return <TrainingGuard access={access}><QuestionScreen key={`${a.id}:${a.position}`} attemptId={a.id} onNavigate={goQuestion} reviewUrl={`${url}/review`} /></TrainingGuard>;
}

function QuestionScreen({ attemptId, onNavigate, reviewUrl }: { attemptId: string; onNavigate: (index: number) => Promise<void>; reviewUrl: string }) {
  const { adapter } = useTraining();
  const view = adapter.getAttemptView(attemptId)!;
  const a = view.attempt;
  const [search] = useSearchParams();
  const requested = search.get('question');
  const index = requested ? a.questionIds.indexOf(requested) : a.position;
  const q = view.questions[Math.max(0, index)]!;
  useEffect(() => { if (index >= 0 && index !== a.position) void adapter.execute({ type: 'position', attemptId, position: index }); }, [adapter, attemptId, index, a.position]);
  if (!requested) return <Navigate replace to={`${reviewUrl.replace('/review', '')}?question=${a.questionIds[a.position]}`} />;
  return index < 0 ? <Navigate replace to={reviewUrl.replace('/review', '')} /> : <QuestionAnswer key={q.id} attemptId={attemptId} index={index} onNavigate={onNavigate} reviewUrl={reviewUrl} />;
}
function QuestionAnswer({ attemptId, index, onNavigate, reviewUrl }: { attemptId: string; index: number; onNavigate: (index: number) => Promise<void>; reviewUrl: string }) {
  const { adapter } = useTraining();
  const navigate = useNavigate();
  const view = adapter.getAttemptView(attemptId)!;
  const a = view.attempt, q = view.questions[index]!;
  const [selected, setSelected] = useState(a.answers[q.id] ?? ''), [error, setError] = useState('');
  const saved = selected === (a.answers[q.id] ?? '');
  async function save(value: string) { setSelected(value); const r = await adapter.execute({ type: 'answer', attemptId, questionId: q.id, optionId: value }); setError(r.ok ? '' : r.error); }
  return <Card className="reading-card quiz-card"><div className="quiz-meta"><span>السؤال {index + 1} من {view.questions.length}</span><StatusBadge>{q.type === 'true-false' ? 'صح / خطأ' : 'اختيار من متعدد'}</StatusBadge></div><ProgressIndicator value={Object.keys(a.answers).length} max={a.questionIds.length} label="الأسئلة المجاب عنها" />
    <fieldset><legend className="question-prompt">{q.prompt}</legend><div className="answer-options">{q.options.map(option => <label key={option.id} className={selected === option.id ? 'answer-option selected' : 'answer-option'}><input type="radio" name={q.id} value={option.id} checked={selected === option.id} onChange={() => void save(option.id)} /><span>{option.text}</span></label>)}</div></fieldset>
    <p className="save-indicator" role="status">{saved ? selected ? 'حُفظت الإجابة محليًا في هذا المتصفح.' : 'يمكنك الاختيار الآن أو العودة إلى السؤال لاحقًا.' : 'الإجابة الحالية لم تُحفظ بعد.'}</p>{error && <div role="alert"><p>{error}</p><Button onClick={() => save(selected)}>إعادة حفظ الإجابة</Button></div>}
    <div className="quiz-navigation"><Button variant="secondary" disabled={index === 0 || !saved} onClick={() => onNavigate(index - 1)}><ArrowRight size={17} aria-hidden="true" />السابق</Button>{index < view.questions.length - 1 && <Button disabled={!saved} onClick={() => onNavigate(index + 1)}>التالي <ArrowLeft size={17} aria-hidden="true" /></Button>}<Button variant="ghost" disabled={!saved} onClick={async () => { const r = await adapter.execute({ type: 'position', attemptId, position: index }); if (r.ok) navigate(reviewUrl); else setError(r.error); }}>مراجعة الإجابات</Button></div>
  </Card>;
}

export default function AssessmentPage({ scope = 'global' }: { scope?: 'global' | 'activity' | 'self' }) {
  const { kind, moduleId, lessonId } = useParams();
  const { catalog, snapshot } = useTraining();
  if (!snapshot.data) return <StorageProblem />;
  const lesson = catalog.lessons.find(l => l.id === lessonId && l.moduleId === moduleId);
  const id = scope === 'global' ? kind : scope === 'activity' ? lesson?.activityAssessmentId : lesson?.selfAssessmentId;
  const definition = catalog.assessments.find(d => d.id === id);
  if (!definition || (scope === 'global' && !['pre', 'post'].includes(kind ?? '')) || (scope !== 'global' && !lesson)) return <NotFound />;
  const section = scope === 'self' ? 'self-assessment' : 'activity';
  const base = scope === 'global' ? `/assessment/${kind}` : `${lessonRoute(moduleId!, lessonId!)}/${section}`;
  const engine = <Engine definition={definition} base={base} instructions={scope === 'global' ? `${base}/instructions` : base} />;
  return <><Breadcrumbs items={[{ label: 'المحتوى التعليمي', to: '/content' }, ...(lesson ? [{ label: `الموديول ${catalog.modules.find(m => m.id === lesson.moduleId)!.order}`, to: `/modules/${lesson.moduleId}/lessons` }, { label: `الدرس ${lesson.order}`, to: `${lessonRoute(lesson.moduleId, lesson.id)}/intro` }] : []), { label: definition.title }]} /><PageHeading eyebrow="تقويم تدريبي — بيانات محلية مؤقتة" title={lesson ? `${definition.title} — الدرس ${lesson.order}: ${lesson.title}` : definition.title} />{lesson ? <LearningLayout kind="lesson" section={section} moduleId={lesson.moduleId} lessonId={lesson.id}>{engine}</LearningLayout> : engine}</>;
}
