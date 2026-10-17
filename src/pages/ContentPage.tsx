import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Award, Route, Sparkles } from 'lucide-react';
import { badgeNames } from '../data/catalog';
import { assessmentAccess, eligibility, lessonComplete, moduleAccess, moduleComplete } from '../domain/training';
import { useTraining } from '../state/training-context';
import { Button, ButtonLink, Card, Drawer, PageHeading, PreviewNotice, ProgressIndicator, StatusBadge } from '../components/ui';
import { StorageProblem } from '../components/TrainingGuard';
import FitPages from '../components/FitPages';
import { moduleIcons } from '../components/module-icons';

export default function ContentPage() {
  const { catalog, snapshot } = useTraining();
  const [info, setInfo] = useState(false);
  if (!snapshot.data) return <StorageProblem />;
  const state = snapshot.data, active = state.learner.active;
  const completed = active ? catalog.lessons.filter(l => lessonComplete(state, catalog, l.id)).length : 0;
  const level = active ? catalog.modules.filter(m => moduleComplete(state, catalog, m.id)).length : 0;
  const pre = eligibility(state, catalog), postAccess = assessmentAccess(state, catalog, 'post');
  return <section className="content-hub"><div className="hub-heading"><PageHeading title="مسارك التدريبي" /><Button variant="ghost" onClick={() => setInfo(true)}>تقدمك والتقويم</Button></div>
    {(!active || pre.status === 'not-assessed') && <div className="hub-start"><p>{!active ? 'استعرض الموديولات؛ ابدأ التجربة ثم القبلي لفتح الدروس.' : 'استعرض الموديولات، ثم أكمل القبلي لفتح الدروس.'}</p><ButtonLink to={active ? '/assessment/pre/instructions' : '/login'}>{active ? 'التقويم القبلي' : 'بدء التجربة'}</ButtonLink></div>}
    {pre.status === 'ineligible' && <p className="hub-eligibility">وفقًا لشروط المشاركة المحددة لهذه الدراسة، لا يتاح لك المسار التدريبي. يمكنك استعراض الأهداف وأسماء الدروس.</p>}
    <FitPages label="الموديولات التدريبية" className="module-grid hub-module-grid" items={catalog.modules.map((module, index) => {
      const Icon = moduleIcons[index] ?? Route, access = moduleAccess(state, catalog, module.id), done = active && moduleComplete(state, catalog, module.id);
      return <Card key={module.id} className={`module-card hub-module-card ${access.allowed ? 'module-card--available' : 'module-card--locked'}`}><div className="module-card-top"><span className={`module-symbol module-symbol--${index}`}><Icon size={23} aria-hidden="true" /></span><span className="module-number"><span className="sr-only">الموديول </span>{module.order}</span><StatusBadge tone={done ? 'complete' : access.allowed ? 'available' : 'locked'}>{done ? 'مكتمل' : access.allowed ? 'متاح' : 'الدروس مقفلة'}</StatusBadge></div><h2><Link className="module-preview-link" to={`/modules/${module.id}/intro`}>{module.title}</Link></h2><div className="hub-card-footer"><span>{module.lessonIds.length} دروس</span><ButtonLink to={`/modules/${module.id}/intro`} variant="secondary">تفاصيل الموديول<ArrowLeft size={15} aria-hidden="true" /></ButtonLink></div></Card>;
    })} />
    <Drawer open={info} onClose={() => setInfo(false)} title="تقدمك والتقويم" className="hub-info-dialog"><FitPages label="معلومات المسار" items={[
      <div key="progress"><div className="journey-meta"><span><Sparkles size={17} aria-hidden="true" />{active ? state.rewards.reduce((n, r) => n + r.points, 0) : 0} نقطة إنجاز</span><span>المستوى {level}</span></div><ProgressIndicator value={completed} max={catalog.lessons.length} label="الدروس المكتملة في المسار" /><p>{postAccess.allowed ? 'التقويم البعدي متاح؛ يُنصح بأدائه بعد دراسة المحتوى.' : postAccess.reason}</p><ButtonLink to="/assessment/post/instructions" variant="secondary">التقويم البعدي</ButtonLink><ButtonLink to="/assessment/pre/instructions" variant="ghost">التقويم القبلي وسجل المحاولات</ButtonLink></div>,
      <div key="badges">{catalog.modules.map(module => <p key={module.id}><Award size={15} aria-hidden="true" />{badgeNames[module.badgeId]}: {module.lessonIds.filter(id => active && lessonComplete(state, catalog, id)).length} / {module.lessonIds.length} دروس</p>)}<p>النقاط مستقلة عن الدرجة:10 للنشاط،20 للدرس،50 للموديول،مرة واحدة لكل إنجاز.</p></div>,
      <div key="about"><PreviewNotice /><p>أربع محطات:اقرأ،ثم مارس،ثم تأمل ما تعلمته. أعداد دروس الموديولات2–4 وأسماؤها مؤقتة.</p></div>,
    ]} /></Drawer>
  </section>;
}
