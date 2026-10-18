import { useState } from 'react';
import { Button, ButtonLink, Card, PageHeading } from '../components/ui';
import { freshCourse } from './store';
import { courseScenario } from './scenarios';
import { groups } from './catalog';
import { useCourse } from './context';
import { NotFound } from '../pages/UtilityPages';
export default function CourseDemoTools() {
  const { store } = useCourse(); const [pending, setPending] = useState<keyof typeof groups | 'reset' | null>(null), [message, setMessage] = useState('');
  if (!__DEMO_TOOLS_ENABLED__) return <NotFound />;
  return <><PageHeading title="أدوات عرض CourseLab" /><Card className="assessment-instructions"><p>حالات مصطنعة لعرض المجموعات الأربع. الاستبدال يخص بيانات CourseLab المحلية وحدها؛ بيانات النسخة السابقة محفوظة.</p><div className="button-row">{Object.entries(groups).map(([id, g]) => <Button key={id} variant="secondary" onClick={() => setPending(id as keyof typeof groups)}>{g.label} — {g.styleLabel} — {g.supportLabel}</Button>)}<Button variant="ghost" onClick={() => setPending('reset')}>تهيئة CourseLab من جديد</Button></div>{pending && <div className="course-demo-confirm"><p>هل تؤكد استبدال بيانات CourseLab المحلية الحالية؟</p><Button onClick={() => { const r = store.replaceForDemo(pending === 'reset' ? freshCourse() : courseScenario(pending)); setMessage(r.ok ? 'حُفظت حالة العرض.' : r.error ?? 'تعذر حفظ الحالة.'); setPending(null); }}>تأكيد الاستبدال</Button><Button variant="ghost" onClick={() => setPending(null)}>إلغاء</Button></div>}<p role="status">{message}</p><ButtonLink to="/content">المحتوى التعليمي</ButtonLink></Card></>;
}
