import { ArrowLeft, Award, LockKeyhole, Route, Sparkles } from 'lucide-react';
import { badgeNames, modules } from '../data/catalog';
import { Button, ButtonLink, Card, PageHeading, PreviewNotice, ProgressIndicator, StatusBadge } from '../components/ui';
import { moduleIcons } from '../components/module-icons';

export default function ContentPage() {
  return <><PageHeading eyebrow="خطوة تلو الأخرى" title="مسارك التدريبي">أربع محطات لبناء معرفة مهنية وتوظيفها في ممارستك التعليمية.</PageHeading><PreviewNotice />
    <div className="journey-summary"><div className="journey-title"><span className="icon-tile"><Route size={23} aria-hidden="true" /></span><div><h2>كل خطوة تبني على سابقتها</h2><p>اقرأ، ثم مارس، ثم تأمل ما تعلمته.</p></div></div><div className="journey-meta"><span><Sparkles size={17} aria-hidden="true" />٠ نقاط إنجاز</span><span><Award size={18} aria-hidden="true" />المستوى ٠</span></div></div>
    <div className="module-grid">{modules.map((module, index) => {
      const Icon = moduleIcons[index] ?? Route;
      const available = index === 0;
      return <Card key={module.id} className={`module-card ${available ? 'module-card--available' : 'module-card--locked'}`}><div className="module-card-top"><span className={`module-symbol module-symbol--${index}`}><Icon size={28} strokeWidth={1.6} aria-hidden="true" /></span><span className="module-number">{String(module.order).padStart(2, '0')}</span><StatusBadge tone={available ? 'available' : 'locked'}>{available ? 'متاح للمعاينة' : 'مقفل'}</StatusBadge></div>
        <p className="eyebrow">الموديول {['الأول', 'الثاني', 'الثالث', 'الرابع'][index]}</p><h2>{module.title}</h2>
        <p className="module-note" id={`reason-${module.id}`}>{available ? '٣ دروس تبدأ بالفهم وتنتهي بالتطبيق.' : `يفتح بعد إكمال جميع دروس الموديول ${['', 'الأول', 'الثاني', 'الثالث'][index]}. المحتوى قيد التجهيز.`}</p>
        <div className="module-badge"><Award size={17} aria-hidden="true" /><span>شارة المحطة: {badgeNames[module.badgeId]}</span></div>
        <div className="module-card-bottom">{available ? <><ProgressIndicator value={0} max={3} label="الدروس المكتملة" /><ButtonLink to={`/modules/${module.id}/intro`}>استكشف الموديول <ArrowLeft size={17} aria-hidden="true" /></ButtonLink></> : <><span className="locked-caption"><LockKeyhole size={15} aria-hidden="true" />محطة قادمة في رحلتك</span><Button disabled variant="secondary" aria-describedby={`reason-${module.id}`}>الموديول مقفل <LockKeyhole size={16} aria-hidden="true" /></Button></>}</div>
      </Card>;
    })}</div><p className="quiet-note">النقاط والشارات مستقلة عن درجات التقويم، ولا تُمنح في نسخة المعاينة.</p></>;
}
