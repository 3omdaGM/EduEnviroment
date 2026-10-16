import { useState } from 'react';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import { BookOpen, Check, ChevronLeft, Flag, Layers3, List, LockKeyhole, Target } from 'lucide-react';
import { lessonSections } from '../data/catalog';
import { Button, Card, Drawer, ProgressIndicator } from './ui';
import { useTraining } from '../state/training-context';
import { assessmentAccess, elementComplete, lessonComplete, lessonRoute } from '../domain/training';

export default function LearningLayout({ kind, section, moduleId, lessonId, children }: { kind: 'module' | 'lesson'; section: string; moduleId: string; lessonId?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { catalog, snapshot } = useTraining();
  const state = snapshot.data!;
  const module = catalog.modules.find(m => m.id === moduleId)!;
  const lesson = catalog.lessons.find(l => l.id === lessonId);
  const items = kind === 'module' ? [{ id: 'intro', label: 'مقدمة الموديول' }, { id: 'objectives', label: 'أهداف الموديول' }, { id: 'lessons', label: 'دروس الموديول' }] : lessonSections;
  const icons = kind === 'module' ? [BookOpen, Target, Layers3] : [BookOpen, Target, Layers3, Flag, Check];
  const navigation = <><div className="sidebar-heading"><span className="eyebrow">{kind === 'module' ? `الموديول ${module.order}` : `الدرس ${lesson?.order}`}</span><h2>{kind === 'module' ? 'أقسام الموديول' : 'أقسام الدرس'}</h2></div>
    <nav aria-label={kind === 'module' ? 'أقسام الموديول' : 'أقسام الدرس'} className="section-navigation">{items.map((item, index) => {
      const Icon = icons[index] ?? BookOpen;
      const assessmentId = item.id === 'activity' ? lesson?.activityAssessmentId : item.id === 'self-assessment' ? lesson?.selfAssessmentId : undefined;
      const delayed = assessmentId && !assessmentAccess(state, catalog, assessmentId).allowed;
      return <NavLink key={item.id} to={kind === 'module' ? `/modules/${moduleId}/${item.id}` : `${lessonRoute(moduleId, lessonId!)}/${item.id}`} className={({ isActive }) => isActive || (section === 'element' && item.id === 'elements') ? 'selected' : ''} onClick={() => setOpen(false)}><Icon size={18} aria-hidden="true" /><span>{item.label}</span>{delayed ? <LockKeyhole size={14} aria-label="مقفل" /> : <ChevronLeft size={14} aria-hidden="true" />}</NavLink>;
    })}</nav><div className="sidebar-progress"><ProgressIndicator value={kind === 'module' ? module.lessonIds.filter(id => lessonComplete(state, catalog, id)).length : lesson!.elementIds.filter(id => elementComplete(state, catalog, id)).length} max={kind === 'module' ? module.lessonIds.length : lesson!.elementIds.length} label={kind === 'module' ? 'الدروس المكتملة' : 'عناصر تم الاطلاع عليها'} /><p>محفوظ محليًا في المتصفح نفسه.</p></div></>;
  return <><div className="mobile-section-control"><Button variant="secondary" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}><List size={18} aria-hidden="true" />{kind === 'module' ? 'أقسام الموديول' : 'أقسام الدرس'}</Button><span>{items.find(item => item.id === section)?.label ?? 'عنصر الدرس'}</span></div>
    <Drawer open={open} onClose={() => setOpen(false)} title={kind === 'module' ? 'أقسام الموديول' : 'أقسام الدرس'}><p className="drawer-course-title">{module.title}{lesson && <> — {lesson.title}</>}</p>{navigation}</Drawer>
    <div className="learning-layout"><aside className="learning-sidebar"><Card>{navigation}</Card></aside><div className="learning-content">{children}</div></div></>;
}
