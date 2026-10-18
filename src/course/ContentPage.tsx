import { useCourseSession } from './hooks';
import { Link } from 'react-router';
import { ArrowLeft, BookOpen, Film } from 'lucide-react';
import { ButtonLink, Card, PageHeading } from '../components/ui';
import { useTraining } from '../state/training-context';
import { courseCatalog, courseRoute, groups } from './catalog';
import { courseAccess, courseEligibility } from './store';
import { CourseProblem } from './ui';
export default function CourseContentPage() {
  const { snapshot, active } = useCourseSession(); const legacy = useTraining().snapshot.data;
  if (!snapshot.data) return <CourseProblem />;
  const state = snapshot.data, access = courseAccess(state, active), eligibility = courseEligibility(state), group = state.assignment ? groups[state.assignment.group] : null;
  return <section className="content-hub course-hub"><div className="reference-hub-heading"><PageHeading title="الموديولات التعليمية">اختر الموديول للوصول إلى دروسه</PageHeading></div>
    <div className="course-path"><Link to="/assessment/pre/instructions" aria-current={eligibility === 'not-assessed' ? 'step' : undefined}><span>1</span>التقويم القبلي</Link><Link to="/learning-style" aria-current={eligibility === 'eligible' && !group ? 'step' : undefined}><span>2</span>أسلوب التعلم والمجموعة</Link><Link to="/content" aria-current={group ? 'step' : undefined}><span>3</span>الموديولات والأنشطة</Link><Link to="/assessment/post/instructions"><span>4</span>التقويم البعدي</Link></div>
    {!access.allowed && <div className="hub-start"><p>{access.reason} يمكنك استعراض أسماء الدروس قبل البدء.</p><ButtonLink to={access.route}>{!active ? 'بدء التجربة' : eligibility !== 'eligible' ? 'التقويم القبلي' : 'اختبار أسلوب التعلم'}</ButtonLink></div>}
    {group && <Card className="course-assignment"><strong>{group.label} — {group.supportLabel}</strong><span>{group.styleLabel} · درجة الأشكال {state.assignment!.score} / 18</span><p>التوزيع والحفظ محليان على هذا الجهاز في نسخة العرض.</p></Card>}
    <div className="reference-module-list" role="region" aria-label="الموديولات التدريبية">{courseCatalog.modules.map((module, i) => { const Icon = i === 0 ? BookOpen : Film; return <Link className="reference-module-card" key={module.id} to={courseRoute(module.id)}><span className="reference-module-symbol"><Icon size={30} aria-hidden="true" /></span><div className="reference-module-info"><span>الموديول {module.order}</span><h2>{module.title}</h2><p>{module.lessons.length} دروس · أهداف ومحتوى ووسائط وأنشطة تطبيقية</p></div><span className="reference-module-arrow"><ArrowLeft size={21} aria-hidden="true" /></span></Link>; })}</div>
    <p className="course-catalog-note">المتاح في المرجع المنقول هو الموديولان الثالث والرابع، مع الحفاظ على ترقيمهما.</p>
    {!!legacy && (legacy.attempts.length > 0 || legacy.readPartIds.length > 0) && <p className="course-legacy-note">بيانات نسخة دمج التكنولوجيا السابقة محفوظة؛ لم تُحذف أو تتحول تلقائيًا إلى تقدم في دروس CourseLab.</p>}
  </section>;
}
