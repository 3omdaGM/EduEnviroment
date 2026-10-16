import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import type { AssessmentDefinition } from '../../docs/contracts';
import { useTraining } from '../state/training-context';
import { assessmentAccess, eligibility, isSelfPassed, lessonComplete, lessonRoute, submissionReadiness } from '../domain/training';
import { Breadcrumbs, Button, ButtonLink, Card, Drawer, PageHeading, ProgressIndicator, StatusBadge } from '../components/ui';
import { StorageProblem, TrainingGuard } from '../components/TrainingGuard';
import LearningLayout from '../components/LearningLayout';
import FitPages from '../components/FitPages';
import { NotFound } from './UtilityPages';

function Engine({ definition: d, base, instructions }: { definition: AssessmentDefinition; base: string; instructions: string }) {
  const { adapter, catalog, snapshot } = useTraining();
  const state = snapshot.data!;
  const { attemptId, stage } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(''), [submitting, setSubmitting] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false), [historyOpen, setHistoryOpen] = useState(false), [feedbackOpen, setFeedbackOpen] = useState(false);
  const access = assessmentAccess(state, catalog, d.id);
  const attempts = state.attempts.filter(a => a.assessmentId === d.id);
  async function start() { const r = await adapter.execute({ type: 'start-attempt', assessmentId: d.id }); if (r.ok && r.value.attemptId) navigate(`${base}/attempt/${r.value.attemptId}`); else if (!r.ok) setError(r.error); }
  if (!attemptId) {
    if (!access.allowed) return <TrainingGuard access={access}><span /></TrainingGuard>;
    const counts = d.questionIds.reduce((out, id) => { const type = catalog.questions.find(q => q.id === id)!.type; out[type] = (out[type] ?? 0) + 1; return out; }, {} as Record<string, number>);
    const rule = d.scope.kind === 'pre' ? 'أول قبلي مُسلّم يحدد الأهلية:50% فأقل تتيح المسار؛الإعادات لا تغيرها.' : d.scope.kind === 'self' ? '50% فأكثر اجتياز؛الإعادة الأقل لا تلغي نجاحًا سابقًا.' : d.scope.kind === 'activity' ? 'تسليم النشاط بعد الحد الأدنى يفتح الذاتي مهما كانت الدرجة.' : 'نتيجة مستقلة لكل محاولة دون حد نجاح أو شهادة أو اختيار للتحليل.';
    return <Card className="assessment-instructions"><div className="reading-header"><h2>قبل أن تبدأ</h2><StatusBadge tone="available">متاح</StatusBadge></div>
      <FitPages label="تعليمات التقويم" className="assessment-summary" items={[
        <p key="purpose">{d.purpose}.</p>,
        <p key="count" className="assessment-count">{d.questionIds.length} سؤالًا: {counts['single-choice'] ?? 0} اختيار من متعدد،و{counts['true-false'] ?? 0} صح/خطأ.</p>,
        <p key="minimum">أجب عن {d.minimumAnsweredQuestions} أسئلة على الأقل. السؤال المتروك يُحتسب غير صحيح من إجمالي الدرجة بعد التأكيد.</p>,
        <p key="rule" className="assessment-rule">{rule}</p>,
      ]} />
      <div className="assessment-entry-actions"><Button onClick={start} aria-label={attempts.some(a => a.status === 'draft') ? 'استكمال المحاولة' : `بدء ${d.title}`}>{attempts.some(a => a.status === 'draft') ? 'استكمال' : 'بدء التقويم'}</Button><Button variant="ghost" aria-label="تعليمات التسليم" onClick={() => setDetailsOpen(true)}>التعليمات</Button>{!!attempts.length && <Button variant="ghost" aria-label={`سجل المحاولات (${attempts.length})`} onClick={() => setHistoryOpen(true)}>المحاولات ({attempts.length})</Button>}</div>
      {error && <p role="alert">{error}</p>}
      <Drawer open={detailsOpen} onClose={() => setDetailsOpen(false)} title="تفاصيل الحفظ والتسليم والنتائج"><FitPages label="تفاصيل التقويم" items={[
        <p key="nav">سؤال واحد في كل شاشة،بلا وقت محدد. يمكنك الرجوع وتعديل الإجابات قبل التسليم. المحاولات متعددة ومستقلة؛المسلّمة لا تُعدل.</p>,
        <p key="submit">أجب عن {d.minimumAnsweredQuestions} أسئلة على الأقل. يمكنك ترك الباقي وتأكيد التسليم؛السؤال المتروك يُحتسب بصفر،وتبقى الدرجة الكلية لجميع الأسئلة. الأوزان متساوية في نموذج العرض.</p>,
        <p key="save">تُحفظ الإجابة والموضع في المتصفح والجهاز نفسيهما؛حذف بيانات المتصفح يفقد التجربة،ولا توجد مزامنة بين الأجهزة.</p>,
        <p key="feedback">{d.feedback === 'score-only' ? 'تُعرض الدرجة فقط،دون مفاتيح أو تصحيح تفصيلي.' : 'تظهر الإجابات والتفسيرات بعد التسليم فقط.'} أسئلة تدريبية أولية بانتظار اعتماد الباحث.{d.scope.kind === 'pre' && ' القبلي لا يمنح نقاطًا؛أول قبلي مُسلّم وحده يحدد الأهلية.'}</p>,
      ]} /></Drawer>
      <Drawer open={historyOpen} onClose={() => setHistoryOpen(false)} title="سجل المحاولات"><FitPages label="المحاولات السابقة" className="attempt-list" items={attempts.map((a, i) => <div key={a.id}><p>المحاولة {i + 1} — {a.status === 'draft' ? 'مسودة' : `${a.score!.earned} / ${a.score!.possible} (${(a.score!.earned / a.score!.possible * 100).toFixed(2)}%)`}</p><ButtonLink variant="ghost" to={`${base}/attempt/${a.id}${a.status === 'submitted' ? '/result' : ''}`}>{a.status === 'draft' ? 'استكمال' : 'عرض النتيجة'}</ButtonLink></div>)} /></Drawer>
    </Card>;
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
    return <><Card className="assessment-result"><StatusBadge tone="complete">محاولة مسلّمة — نتيجة تجريبية</StatusBadge><h2>نتيجة {d.title}</h2>
      <FitPages label="تفاصيل النتيجة" className="result-details" items={[
        <div key="score" className="score-display"><strong dir="ltr">{(a.score.earned / a.score.possible * 100).toFixed(2)}%</strong><span dir="ltr">{a.score.earned} / {a.score.possible}</span></div>,
        ...(d.scope.kind === 'pre' ? [<p key="eligibility">{pre.status === 'eligible' ? 'عزيزي المتدرب، لم تتجاوز نسبتك 50%، لذا يمكنك البدء بدراسة المحتوى التدريبي' : 'وفقًا لشروط المشاركة المحددة لهذه الدراسة، لا يتاح لك المسار التدريبي'}</p>, <p key="first-pre">درجة أول قبلي مُسلّم المحددة للأهلية: <bdi>{pre.attempt!.score!.earned} / {pre.attempt!.score!.possible}</bdi> ({(pre.attempt!.score!.earned / pre.attempt!.score!.possible * 100).toFixed(2)}%). الإعادات لا تغير الأهلية في العرض.</p>] : []),
        ...(d.scope.kind === 'self' ? [<p key="self-status" role="status">{isSelfPassed(a.score) ? 'اجتزت التقويم الذاتي وأكملت الدرس.' : lesson && lessonComplete(state, catalog, lesson.id) ? 'هذه المحاولة أقل من 50%، ويبقى اجتيازك السابق وإنجازك محفوظين.' : 'لم تجتز هذه المحاولة؛ راجع عناصر الدرس وأعد المحاولة.'}</p>] : []),
        ...(d.scope.kind === 'activity' ? [<p key="activity-status">اكتمل تسليم النشاط وأصبح التقويم الذاتي متاحًا، دون اشتراط درجة نجاح.</p>] : []),
        ...(d.scope.kind === 'post' ? [<p key="post-status">حُفظت هذه المحاولة مستقلة. لا حد نجاح أو شهادة معتمدة، ولم تُختر محاولة للتحليل البحثي.</p>] : []),
        <p key="score-rule">النسبة للعرض؛شروط الفتح تُحسب بالدرجة الدقيقة قبل التقريب. نقاط الإنجاز مستقلة عنها،والمتروك بصفر من إجمالي الأسئلة.</p>,
      ]} />
      <div className="result-primary-actions">{d.scope.kind === 'pre' && pre.status === 'eligible' ? <ButtonLink to="/content">ابدأ المسار</ButtonLink> : (d.scope.kind === 'activity' || (d.scope.kind === 'self' && lesson && lessonComplete(state, catalog, lesson.id))) ? <ButtonLink to={nextRoute}><span className="sr-only">الانتقال إلى </span>الخطوة التالية<ArrowLeft size={17} aria-hidden="true" /></ButtonLink> : <ButtonLink to="/content" variant="secondary">المسار التدريبي</ButtonLink>}<Button variant="secondary" onClick={start}>محاولة جديدة</Button></div>
      <div className="result-secondary-actions"><ButtonLink variant="ghost" to={instructions}>سجل المحاولات<span className="sr-only"> والتعليمات</span></ButtonLink>{lesson && <ButtonLink variant="ghost" to={`${lessonRoute(lesson.moduleId, lesson.id)}/elements`}>مراجعة العناصر</ButtonLink>}{view.feedback && <Button variant="ghost" onClick={() => setFeedbackOpen(true)}>مراجعة التصحيح</Button>}</div>
      {error && <p role="alert">{error}</p>}
    </Card>{view.feedback && <Drawer open={feedbackOpen} onClose={() => setFeedbackOpen(false)} title="مراجعة الإجابات والتفسيرات"><FitPages label="التغذية الراجعة التعليمية" className="feedback-list" items={view.feedback.flatMap((f, i) => {
      const q = view.questions.find(q => q.id === f.questionId)!;
      return [<div className="feedback-card" key={`${f.questionId}-answer`}><p>السؤال {i + 1}</p><h3>{q.prompt}</h3><p>إجابتك: {q.options.find(o => o.id === f.selected)?.text ?? 'لم تُجب — تُحتسب غير صحيحة'}</p></div>,<div className="feedback-card" key={`${f.questionId}-explanation`}><h3>تصحيح السؤال {i + 1}</h3><p><Check size={15} aria-hidden="true" />الإجابة الصحيحة: {q.options.find(o => o.id === f.correct)!.text}</p><p>{f.explanation}</p>{f.sources.map(source => <a href={source.url} key={source.id} target="_blank" rel="noreferrer">{source.title}<span className="sr-only"> يفتح في نافذة جديدة</span></a>)}</div>];
    })} /></Drawer>}</>;
  }

  const missing = a.questionIds.filter(id => !a.answers[id]);
  const readiness = submissionReadiness(a);
  async function goQuestion(index: number) { const r = await adapter.execute({ type: 'position', attemptId: a.id, position: index }); if (r.ok) navigate(`${url}?question=${a.questionIds[index]}`); else setError(r.error); }
  if (stage === 'review') return <Card className="reading-card review-card"><h2 aria-label="مراجعة الإجابات قبل التسليم">مراجعة الإجابات</h2><p>{readiness.answered} / {a.questionIds.length} مجاب عنها؛اختر رقمًا للمراجعة.</p><select className="question-review-select" aria-label="اختر سؤالًا لمراجعة إجابته" value="" onChange={event => { if (event.target.value !== '') void goQuestion(Number(event.target.value)); }}><option value="">اختر رقم السؤال للمراجعة</option>{view.questions.map((q, i) => <option key={q.id} value={i}>السؤال {i + 1}: {a.answers[q.id] ? 'مجاب' : 'غير مجاب'}</option>)}</select><FitPages label="مراجعة الأسئلة" className="question-review" items={view.questions.map((q, index) => <Button key={q.id} variant={a.answers[q.id] ? 'secondary' : 'ghost'} onClick={() => goQuestion(index)} aria-label={`السؤال ${index + 1}: ${a.answers[q.id] ? 'مجاب' : 'غير مجاب'}`}>{index + 1}<span>{a.answers[q.id] ? 'مجاب' : 'غير مجاب'}</span></Button>)} /><p id="missing-note">{!readiness.canSubmit ? `أجب عن ${readiness.minimum} أسئلة على الأقل؛ أجبت عن ${readiness.answered}.` : missing.length ? `تركت ${missing.length} سؤالًا؛تُحتسب غير صحيحة.` : 'اكتملت جميع الإجابات؛ يمكنك مراجعتها أو تأكيد التسليم.'}</p><div className="button-row"><Button aria-label="الانتقال إلى تأكيد التسليم" onClick={() => navigate(`${url}/confirm`)} disabled={!readiness.canSubmit} aria-describedby="missing-note">تأكيد التسليم</Button><Button variant="secondary" onClick={() => goQuestion(a.position)}>العودة للأسئلة</Button></div>{error && <p role="alert">{error}</p>}</Card>;
  if (stage === 'confirm') return <Card className="preparation confirm-card"><h2>تأكيد التسليم النهائي</h2><p>لا تعديل بعد التسليم؛الإعادة محاولة مستقلة.</p><p>أجبت عن {readiness.answered} من {a.questionIds.length}.</p>{!readiness.canSubmit ? <p role="alert">يلزم الإجابة عن {readiness.minimum} أسئلة على الأقل قبل التسليم.</p> : !!missing.length && <p className="submission-warning" role="alert">هناك {missing.length} أسئلة لم تختر لها إجابة،وستُحتسب غير صحيحة ضمن الدرجة الكلية. هل أنت متأكد أنك تريد التسليم؟</p>}<div className="confirm-actions"><Button disabled={submitting || !readiness.canSubmit} onClick={async () => { if (submitting) return; setSubmitting(true); const r = await adapter.execute({ type: 'submit', attemptId: a.id }); if (r.ok) navigate(`${url}/result`); else { setError(r.error); setSubmitting(false); } }} aria-label="تأكيد وتسليم المحاولة">{missing.length ? 'نعم،سلّم المحاولة' : 'تأكيد وتسليم المحاولة'}</Button><Link className="button button--secondary" to={`${url}/review`} aria-label="لا،العودة إلى المراجعة">لا،رجوع</Link></div>{error && <p role="alert">{error}</p>}</Card>;
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
  return <Card className="reading-card quiz-card"><div className="quiz-meta"><span>{view.definition.title} · السؤال {index + 1} من {view.questions.length}</span><StatusBadge>{q.type === 'true-false' ? 'صح / خطأ' : 'اختيار من متعدد'}</StatusBadge></div><ProgressIndicator value={Object.keys(a.answers).length} max={a.questionIds.length} label="الأسئلة المجاب عنها" />
    <fieldset><legend className="question-prompt">{q.prompt}</legend><div className={`answer-options answer-options--${q.type}`}>{q.options.map((option, optionIndex) => <label key={option.id} className={selected === option.id ? 'answer-option selected' : 'answer-option'}><input type="radio" name={q.id} value={option.id} checked={selected === option.id} onChange={() => void save(option.id)} /><span>{q.type === 'single-choice' && <b className="answer-letter">{['أ', 'ب', 'ج', 'د'][optionIndex]}. </b>}{option.text}</span></label>)}</div></fieldset>
    <p className="save-indicator" role="status">{saved ? selected ? 'حُفظت الإجابة محليًا في هذا المتصفح.' : 'يمكنك الاختيار الآن أو العودة إلى السؤال لاحقًا.' : 'الإجابة الحالية لم تُحفظ بعد.'}</p>{error && <div role="alert"><p>{error}</p><Button onClick={() => save(selected)}>إعادة حفظ الإجابة</Button></div>}
    <div className="quiz-navigation quiz-navigation--submit"><Button variant="secondary" aria-label="السابق" disabled={index === 0 || !saved} onClick={() => onNavigate(index - 1)}><ArrowRight size={17} aria-hidden="true" /><span className="nav-label">السابق</span></Button><Button aria-label="التالي" disabled={!saved || index === view.questions.length - 1} onClick={() => onNavigate(index + 1)}><span className="nav-label">التالي</span><ArrowLeft size={17} aria-hidden="true" /></Button><Button disabled={!saved} onClick={() => navigate(`${reviewUrl.replace('/review', '')}/confirm`)}>تسليم</Button><Button variant="ghost" disabled={!saved} onClick={async () => { const r = await adapter.execute({ type: 'position', attemptId, position: index }); if (r.ok) navigate(reviewUrl); else setError(r.error); }}>مراجعة<span className="sr-only"> الإجابات</span></Button></div>
  </Card>;
}

export default function AssessmentPage({ scope = 'global' }: { scope?: 'global' | 'activity' | 'self' }) {
  const { kind, moduleId, lessonId, attemptId, stage } = useParams();
  const { catalog, snapshot } = useTraining();
  if (!snapshot.data) return <StorageProblem />;
  const lesson = catalog.lessons.find(l => l.id === lessonId && l.moduleId === moduleId);
  const id = scope === 'global' ? kind : scope === 'activity' ? lesson?.activityAssessmentId : lesson?.selfAssessmentId;
  const definition = catalog.assessments.find(d => d.id === id);
  if (!definition || (scope === 'global' && !['pre', 'post'].includes(kind ?? '')) || (scope !== 'global' && !lesson)) return <NotFound />;
  const section = scope === 'self' ? 'self-assessment' : 'activity';
  const base = scope === 'global' ? `/assessment/${kind}` : `${lessonRoute(moduleId!, lessonId!)}/${section}`;
  const engine = <Engine definition={definition} base={base} instructions={scope === 'global' ? `${base}/instructions` : base} />;
  if (attemptId) return <section className="assessment-focus"><h1 className="sr-only">{definition.title}{lesson ? ` — الدرس ${lesson.order}: ${lesson.title}` : ''}</h1>{stage && <p className="assessment-context">{definition.title}{lesson ? ` — الدرس ${lesson.order}` : ''}</p>}{engine}</section>;
  return <section className={`assessment-page${lesson ? ' assessment-page--lesson' : ''}`}><div className="assessment-page-context"><Breadcrumbs items={[{ label: 'المحتوى التعليمي', to: '/content' }, ...(lesson ? [{ label: `الموديول ${catalog.modules.find(m => m.id === lesson.moduleId)!.order}`, to: `/modules/${lesson.moduleId}/lessons` }, { label: `الدرس ${lesson.order}`, to: `${lessonRoute(lesson.moduleId, lesson.id)}/intro` }] : []), { label: definition.title }]} /><PageHeading title={lesson ? `${definition.title} — الدرس ${lesson.order}: ${lesson.title}` : definition.title} /></div>{lesson ? <LearningLayout kind="lesson" section={section} moduleId={lesson.moduleId} lessonId={lesson.id}>{engine}</LearningLayout> : engine}</section>;
}
