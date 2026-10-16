import { useState } from 'react';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import { BookOpen, Check, ChevronLeft, Flag, Layers3, List, LockKeyhole, Target } from 'lucide-react';
import { lessonBase, lessonSections } from '../data/catalog';
import { Button, Card, Drawer, ProgressIndicator } from './ui';
import { usePreview } from '../state/preview';

export default function LearningLayout({ kind, section, children }: { kind: 'module' | 'lesson'; section: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { acknowledged } = usePreview();
  const items = kind === 'module' ? [{ id: 'intro', label: 'مقدمة الموديول' }, { id: 'objectives', label: 'أهداف الموديول' }, { id: 'lessons', label: 'دروس الموديول' }] : lessonSections;
  const icons = kind === 'module' ? [BookOpen, Target, Layers3] : [BookOpen, Target, Layers3, Flag, Check];
  const navigation = <><div className="sidebar-heading"><span className="eyebrow">{kind === 'module' ? 'الموديول الأول' : 'الدرس الأول'}</span><h2>{kind === 'module' ? 'أقسام الموديول' : 'أقسام الدرس'}</h2></div>
    <nav aria-label={kind === 'module' ? 'أقسام الموديول' : 'أقسام الدرس'} className="section-navigation">{items.map((item, index) => {
      const Icon = icons[index] ?? BookOpen;
      const delayed = ['activity', 'self-assessment'].includes(item.id);
      return <NavLink key={item.id} to={kind === 'module' ? `/modules/mod-01/${item.id}` : `${lessonBase}/${item.id}`} className={({ isActive }) => isActive || (section === 'element' && item.id === 'elements') ? 'selected' : ''} onClick={() => setOpen(false)}><Icon size={18} aria-hidden="true" /><span>{item.label}</span>{delayed ? <LockKeyhole size={14} aria-label="قيد التجهيز" /> : <ChevronLeft size={14} aria-hidden="true" />}</NavLink>;
    })}</nav><div className="sidebar-progress"><ProgressIndicator value={kind === 'module' ? 0 : acknowledged.length} max={kind === 'module' ? 3 : 5} label={kind === 'module' ? 'الدروس المكتملة' : 'عناصر تم الاطلاع عليها'} /><p>{kind === 'module' ? 'لا تُمنح إنجازات في المعاينة.' : 'يُحفظ الاطلاع حتى تحديث الصفحة فقط.'}</p></div></>;
  return <><div className="mobile-section-control"><Button variant="secondary" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}><List size={18} aria-hidden="true" />{kind === 'module' ? 'أقسام الموديول' : 'أقسام الدرس'}</Button><span>{items.find(item => item.id === section)?.label ?? 'عنصر الدرس'}</span></div>
    <Drawer open={open} onClose={() => setOpen(false)} title={kind === 'module' ? 'أقسام الموديول' : 'أقسام الدرس'}>{navigation}</Drawer>
    <div className="learning-layout"><aside className="learning-sidebar"><Card>{navigation}</Card></aside><div className="learning-content">{children}</div></div></>;
}
