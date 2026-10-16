import { Link, useLocation, useParams, useSearchParams } from 'react-router';
import { ArrowLeft, ArrowRight, BookOpen, Check, CircleHelp, Mail, MapPin, Phone, Target } from 'lucide-react';
import { guideSteps, modules } from '../data/catalog';
import { moduleIcons } from '../components/module-icons';
import { Button, ButtonLink, Card, PageHeading, ProgressIndicator, StatusBadge } from '../components/ui';

export function NotFound() {
  return <div className="not-found"><p className="eyebrow">٤٠٤ — الصفحة غير موجودة</p><CircleHelp size={52} aria-hidden="true" /><h1>لم نعثر على هذه الصفحة</h1><p>قد يكون الرابط غير صحيح أو لا ينتمي العنصر إلى هذا الدرس.</p><ButtonLink to="/content">العودة إلى المحتوى التعليمي <ArrowLeft size={17} aria-hidden="true" /></ButtonLink></div>;
}

function GoalsPage() {
  const { moduleId } = useParams();
  const selected = modules.find(module => module.id === (moduleId ?? 'mod-01'));
  if (!selected) return <NotFound />;
  return <><PageHeading eyebrow="تعلم يبدأ بهدف" title="أهداف البيئة">اختر موديولًا لاستعراض أهدافه. الاطلاع على الأهداف متاح للجميع ولا يفتح المحتوى المقفل.</PageHeading>
    <div className="goals-grid">{modules.map((module, index) => {
      const Icon = moduleIcons[index] ?? Target;
      return <Link key={module.id} to={`/goals/${module.id}`} className={`card goal-card ${selected.id === module.id ? 'goal-card--selected' : ''}`} aria-current={selected.id === module.id ? 'true' : undefined}><span className={`module-symbol module-symbol--${index}`}><Icon size={25} aria-hidden="true" /></span><span className="eyebrow">الموديول {index + 1}</span><h2>{module.title}</h2><span className="text-link">عرض الأهداف <ArrowLeft size={16} aria-hidden="true" /></span></Link>;
    })}</div><Card className="goals-detail" aria-live="polite"><span className="eyebrow">أهداف الموديول {selected.order}</span><h2>{selected.title}</h2><ul>{selected.objectives.map(objective => <li key={objective}><Check size={19} aria-hidden="true" />{objective}</li>)}</ul><p className="quiet-note">أهداف أولية بانتظار المراجعة والاعتماد. لا يغير عرضها حالة فتح المحتوى.</p></Card></>;
}

function GuidePage() {
  const [search, setSearch] = useSearchParams();
  const raw = Number(search.get('step') ?? '1');
  const index = Number.isInteger(raw) && raw >= 1 && raw <= guideSteps.length ? raw - 1 : 0;
  const step = guideSteps[index]!;
  return <><PageHeading eyebrow="تعرف إلى رحلتك" title="دليل المتدرب">خطوات واضحة من بداية الرحلة إلى إكمال المسار التدريبي.</PageHeading>
    <Card className="guide-card"><div className="guide-steps" aria-label="خطوات الدليل">{guideSteps.map((item, i) => <button key={item.title} onClick={() => setSearch({ step: String(i + 1) })} aria-label={`الخطوة ${i + 1}: ${item.title}`} aria-current={index === i ? 'step' : undefined}>{i < index ? <Check size={16} aria-hidden="true" /> : i + 1}</button>)}</div><div className="guide-body"><span className="icon-tile"><BookOpen size={30} aria-hidden="true" /></span><p className="eyebrow">الخطوة {index + 1} من {guideSteps.length}</p><h2>{step.title}</h2><p>{step.text}</p></div><ProgressIndicator value={index + 1} max={guideSteps.length} label="تقدم قراءة الدليل" /><div className="guide-actions"><Button variant="secondary" disabled={index === 0} onClick={() => setSearch({ step: String(index) })}><ArrowRight size={17} aria-hidden="true" />السابق</Button>{index < guideSteps.length - 1 ? <Button onClick={() => setSearch({ step: String(index + 2) })}>التالي <ArrowLeft size={17} aria-hidden="true" /></Button> : <ButtonLink to="/content">استعرض المحتوى <ArrowLeft size={17} aria-hidden="true" /></ButtonLink>}</div></Card></>;
}

function ContactPage() {
  return <><PageHeading eyebrow="نسعد بتواصلك" title="اتصل بنا">تُضاف بيانات الاتصال المعتمدة عند تزويدها من الباحث.</PageHeading><Card className="contact-card"><div className="contact-heading"><h2>اسم الباحث</h2><StatusBadge>بيانات مؤقتة</StatusBadge></div><p>الدرجة العلمية والصفة — قيد التزويد</p><ul className="contact-list"><li><Mail size={21} aria-hidden="true" /><div><span>البريد الإلكتروني المؤقت</span><bdi>researcher@example.com</bdi></div></li><li><Phone size={21} aria-hidden="true" /><div><span>رقم الهاتف</span><strong>غير متاح حاليًا</strong></div></li><li><MapPin size={21} aria-hidden="true" /><div><span>جهة الدراسة</span><strong>كلية التربية النوعية — جامعة الزقازيق</strong></div></li></ul><p className="quiet-note">وسائل الاتصال المعروضة غير مفعلة. لا توجد خدمة إرسال رسائل في هذه النسخة.</p></Card></>;
}

export default function UtilityPages() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/goals')) return <GoalsPage />;
  if (pathname === '/guide') return <GuidePage />;
  if (pathname === '/contact') return <ContactPage />;
  return <NotFound />;
}
