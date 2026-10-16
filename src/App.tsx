import { Component, lazy, useState } from 'react';
import type { ReactNode } from 'react';
import { Route, Routes } from 'react-router';
import AppShell, { BrandHeader } from './components/AppShell';
import { Button } from './components/ui';
import { elements } from './data/catalog';
import { PreviewContext } from './state/preview';

const HomePage = lazy(() => import('./pages/HomePage'));
const ContentPage = lazy(() => import('./pages/ContentPage'));
const LearningPage = lazy(() => import('./pages/LearningPage'));
const UtilityPages = lazy(() => import('./pages/UtilityPages'));
const NotFoundPage = lazy(() => import('./pages/UtilityPages').then(module => ({ default: module.NotFound })));

class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <><header className="site-header"><BrandHeader /></header><main className="container not-found"><h1>تعذر عرض الصفحة</h1><p>لم تُحفظ بيانات تدريب في هذه المعاينة. أعد تحميل الصفحة للمحاولة مجددًا.</p><Button onClick={() => window.location.reload()}>إعادة المحاولة</Button></main></>;
    return this.props.children;
  }
}

export default function App() {
  const [acknowledged, setAcknowledged] = useState<readonly string[]>([]);
  function canRead(id: string) {
    const index = elements.findIndex(element => element.id === id);
    return index === 0 || (index > 0 && acknowledged.includes(elements[index - 1]!.id));
  }
  function acknowledge(id: string) {
    setAcknowledged(previous => {
      const index = elements.findIndex(element => element.id === id);
      if (index < 0 || previous.includes(id) || (index > 0 && !previous.includes(elements[index - 1]!.id))) return previous;
      return [...previous, id];
    });
  }
  return <PreviewContext.Provider value={{ acknowledged, acknowledge, canRead }}><AppErrorBoundary><Routes><Route element={<AppShell />}>
    <Route index element={<HomePage />} /><Route path="content" element={<ContentPage />} />
    <Route path="modules/:moduleId" element={<LearningPage />} /><Route path="modules/:moduleId/:section" element={<LearningPage />} />
    <Route path="modules/:moduleId/lessons/:lessonId" element={<LearningPage />} /><Route path="modules/:moduleId/lessons/:lessonId/:section" element={<LearningPage />} />
    <Route path="modules/:moduleId/lessons/:lessonId/elements/:elementId" element={<LearningPage />} />
    <Route path="goals" element={<UtilityPages />} /><Route path="goals/:moduleId" element={<UtilityPages />} /><Route path="guide" element={<UtilityPages />} /><Route path="contact" element={<UtilityPages />} />
    <Route path="login" element={<UtilityPages />} /><Route path="register" element={<UtilityPages />} /><Route path="recover" element={<UtilityPages />} />
    <Route path="assessment/:kind/instructions" element={<UtilityPages />} /><Route path="assessment/:kind/attempt/*" element={<UtilityPages />} />
    <Route path="*" element={<NotFoundPage />} />
  </Route></Routes></AppErrorBoundary></PreviewContext.Provider>;
}
