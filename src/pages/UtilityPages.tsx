import { useEffect, useRef, useState } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router';
import { ArrowLeft, ArrowRight, Check, CircleHelp, Mail, MapPin, Phone, Target, X } from 'lucide-react';
import { guideSteps, modules } from '../data/catalog';
import { moduleIcons } from '../components/module-icons';
import { Button, ButtonLink, Card, PageHeading, ProgressIndicator, StatusBadge } from '../components/ui';

export function NotFound() {
  return <div className="not-found"><p className="eyebrow">٤٠٤ — الصفحة غير موجودة</p><CircleHelp size={52} aria-hidden="true" /><h1>لم نعثر على هذه الصفحة</h1><p>قد يكون الرابط غير صحيح أو لا ينتمي العنصر إلى هذا الدرس.</p><ButtonLink to="/content">العودة إلى المحتوى التعليمي <ArrowLeft size={17} aria-hidden="true" /></ButtonLink></div>;
}

function GoalsPage() {
  const { moduleId } = useParams();
  const [pinnedId, setPinnedId] = useState<string | null>(moduleId ?? null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [compact, setCompact] = useState(() => window.matchMedia('(max-width: 899px), (max-height: 700px)').matches);
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const closes = useRef<Record<string, HTMLButtonElement | null>>({});
  const pendingFocus = useRef<{ id: string; target: 'trigger' | 'close' } | null>(null);
  const activeId = hoverId ?? pinnedId;
  useEffect(() => {
    const query = window.matchMedia('(max-width: 899px), (max-height: 700px)');
    const update = () => setCompact(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const request = pendingFocus.current;
    if (!request) return;
    (request.target === 'close' ? closes : triggers).current[request.id]?.focus({ preventScroll: true });
    pendingFocus.current = null;
  }, [activeId]);
  const pin = (id: string, keyboard = false) => {
    if (keyboard) {
      if (activeId === id) closes.current[id]?.focus({ preventScroll: true });
      else pendingFocus.current = { id, target: 'close' };
    }
    setPinnedId(id); setHoverId(null);
  };
  const close = (id: string) => {
    pendingFocus.current = { id, target: 'trigger' };
    setPinnedId(null); setHoverId(null);
  };
  if (moduleId && !modules.some(module => module.id === moduleId)) return <NotFound />;
  return <section className="goals-page" aria-labelledby="goals-title">
    <div className="goals-heading"><h1 id="goals-title">أهداف البيئة</h1><p>مرّر على الكارت أو اضغط عليه لاستعراض أهداف الموديول.</p></div>
    <div className="goals-deck" data-compact={compact} onKeyDown={event => { if (event.key === 'Escape' && activeId) { event.preventDefault(); event.stopPropagation(); close(activeId); } }}>
      {modules.map((module, index) => {
        const Icon = moduleIcons[index] ?? Target;
        const active = activeId === module.id;
        return <div key={module.id} className={`goal-slot${active ? ' goal-slot--active' : ''}`} data-muted={Boolean(activeId) && !active} inert={compact && Boolean(activeId) && !active}
          onPointerEnter={event => { if (event.pointerType === 'mouse' && window.matchMedia('(hover: hover) and (pointer: fine)').matches) setHoverId(module.id); }}
          onPointerLeave={() => setHoverId(null)}>
          <article className="card goal-tile" onClick={() => pin(module.id)}>
            <h2 className="goal-card-heading"><button ref={node => { triggers.current[module.id] = node; }} type="button" className="goal-card-trigger" aria-label={`عرض أهداف الموديول ${module.order}: ${module.title}`} aria-expanded={active} aria-controls={`objectives-${module.id}`} onClick={event => { event.stopPropagation(); pin(module.id, event.detail === 0); }}>
              <span className="goal-card-meta"><span className={`module-symbol module-symbol--${index}`}><Icon size={20} aria-hidden="true" /></span><span>الموديول {module.order}</span></span>
              <span className="goal-card-name">{module.title}</span>
            </button></h2>
            {active && <button ref={node => { closes.current[module.id] = node; }} type="button" className="goal-card-close" aria-label={`إغلاق أهداف ${module.title}`} onClick={event => { event.stopPropagation(); close(module.id); }}><X size={19} aria-hidden="true" /></button>}
            <section id={`objectives-${module.id}`} className="goal-card-objectives" aria-label={`أهداف ${module.title}`} hidden={!active}><ul>{module.objectives.map(objective => <li key={objective}><Check size={16} aria-hidden="true" /><span>{objective}</span></li>)}</ul></section>
          </article>
        </div>;
    })}</div>
  </section>;
}

function GuidePage() {
  const [search, setSearch] = useSearchParams();
  const raw = Number(search.get('step') ?? '1');
  const index = Number.isInteger(raw) && raw >= 1 && raw <= guideSteps.length ? raw - 1 : 0;
  const step = guideSteps[index]!;
  return <section className="guide-page"><PageHeading title="دليل المتدرب" />
    <Card className="guide-card"><div className="guide-steps" aria-label="خطوات الدليل">{guideSteps.map((item, i) => <button key={item.title} onClick={() => setSearch({ step: String(i + 1) })} aria-label={`الخطوة ${i + 1}: ${item.title}`} aria-current={index === i ? 'step' : undefined}>{i < index ? <Check size={16} aria-hidden="true" /> : i + 1}</button>)}</div>
      <select className="guide-step-select" aria-label="اختر خطوة دليل المتدرب" value={index + 1} onChange={event => setSearch({ step: event.target.value })}>{guideSteps.map((item, i) => <option key={item.title} value={i + 1}>الخطوة {i + 1} من {guideSteps.length}: {item.title}</option>)}</select>
      <div className="guide-body"><p className="eyebrow">الخطوة {index + 1} من {guideSteps.length}</p><h2>{step.title}</h2><p>{step.text}</p></div><div className="guide-progress"><ProgressIndicator value={index + 1} max={guideSteps.length} label="تقدم قراءة الدليل" /></div><div className="guide-actions"><Button variant="secondary" disabled={index === 0} onClick={() => setSearch({ step: String(index) })}><ArrowRight size={17} aria-hidden="true" />السابق</Button>{index < guideSteps.length - 1 ? <Button onClick={() => setSearch({ step: String(index + 2) })}>التالي <ArrowLeft size={17} aria-hidden="true" /></Button> : <ButtonLink to="/content">استعرض المحتوى <ArrowLeft size={17} aria-hidden="true" /></ButtonLink>}</div></Card></section>;
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
