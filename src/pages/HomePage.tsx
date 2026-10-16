import { ArrowLeft, BookOpen, Compass, GraduationCap, Layers3, UserRound } from 'lucide-react';
import { environmentName, people } from '../data/catalog';
import { ButtonLink, Card } from '../components/ui';
import { LearningIllustration } from '../components/illustrations';

export default function HomePage() {
  return <>
    <section className="home-intro" aria-labelledby="home-title"><div className="home-copy"><p className="eyebrow"><span className="eyebrow-line" />تعلمٌ هادف، وممارسةٌ واعية</p><h1 id="home-title">نحو تجربة تعليمية<br /><em>أكثر تفاعلًا وأثرًا.</em></h1>
      <p className="home-description">بيئة تدريب لإجراء الجانب التطبيقي لرسالة الماجستير بعنوان «{environmentName}».</p>
      <div className="button-row"><ButtonLink to="/content">ابدأ رحلتك <ArrowLeft size={18} aria-hidden="true" /></ButtonLink><ButtonLink to="/guide" variant="secondary"><Compass size={18} aria-hidden="true" />دليل المتدرب</ButtonLink></div>
      <div className="home-facts"><span><Layers3 size={16} aria-hidden="true" />٤ موديولات مترابطة</span><span><BookOpen size={16} aria-hidden="true" />تعلم بالخطوة والممارسة</span></div>
    </div><div className="home-art"><LearningIllustration /><div className="art-caption"><span className="small-icon"><GraduationCap size={20} aria-hidden="true" /></span><div><strong>من المعرفة إلى الممارسة</strong><span>رحلة مهنية لأعضاء الهيئة المعاونة</span></div></div></div></section>
    <section className="research-section" aria-labelledby="research-title"><div className="section-heading"><span /><div><p className="eyebrow">القائمون على الدراسة</p><h2 id="research-title">الباحث والفريق الأكاديمي</h2></div><span /></div>
      <div className="people-grid">{people.map((person, index) => <Card key={person.id} className={`person-card person-card--${index}`}><div className="person-icon"><UserRound size={21} aria-hidden="true" /></div><div><p className="person-role">{person.roleLabel}</p><h3>{person.displayName}</h3><p className="person-position">{person.position}</p></div><span className="person-placeholder">بيانات مؤقتة</span></Card>)}</div>
    </section>
  </>;
}
