import { Component, lazy } from 'react';
import type { ReactNode } from 'react';
import { Route, Routes } from 'react-router';
import AppShell, { BrandHeader } from './components/AppShell';
import { Button } from './components/ui';
import TrainingProvider from './state/TrainingProvider';

const HomePage = lazy(() => import('./pages/HomePage'));
const ContentPage = lazy(() => import('./pages/ContentPage'));
const LearningPage = lazy(() => import('./pages/LearningPage'));
const UtilityPages = lazy(() => import('./pages/UtilityPages'));
const NotFoundPage = lazy(() => import('./pages/UtilityPages').then(module => ({ default: module.NotFound })));
const AssessmentPage = lazy(() => import('./pages/AssessmentPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
// Keep the compile-time condition at the import site so Vite omits its chunk.
const DemoToolsPage = __DEMO_TOOLS_ENABLED__ ? lazy(() => import('./pages/DemoToolsPage')) : null;

class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <><header className="site-header"><BrandHeader /></header><main className="container not-found"><h1>تعذر عرض الصفحة</h1><p>أعد تحميل الصفحة للمحاولة مجددًا، دون حذف الحالة المحلية.</p><Button onClick={() => window.location.reload()}>إعادة المحاولة</Button></main></>;
    return this.props.children;
  }
}

export default function App() {
  return <AppErrorBoundary><TrainingProvider><Routes><Route element={<AppShell />}>
    <Route index element={<HomePage />} /><Route path="content" element={<ContentPage />} />
    <Route path="modules/:moduleId" element={<LearningPage />} /><Route path="modules/:moduleId/:section" element={<LearningPage />} />
    <Route path="modules/:moduleId/lessons/:lessonId" element={<LearningPage />} /><Route path="modules/:moduleId/lessons/:lessonId/:section" element={<LearningPage />} />
    <Route path="modules/:moduleId/lessons/:lessonId/elements/:elementId" element={<LearningPage />} />
    <Route path="goals" element={<UtilityPages />} /><Route path="goals/:moduleId" element={<UtilityPages />} /><Route path="guide" element={<UtilityPages />} /><Route path="contact" element={<UtilityPages />} />
    <Route path="login" element={<AccountPage />} /><Route path="register" element={<AccountPage />} /><Route path="recover" element={<AccountPage />} />
    <Route path="assessment/:kind/instructions" element={<AssessmentPage />} /><Route path="assessment/:kind/attempt/:attemptId" element={<AssessmentPage />} /><Route path="assessment/:kind/attempt/:attemptId/:stage" element={<AssessmentPage />} />
    {(['activity', 'self-assessment'] as const).flatMap(section => {
      const scope = section === 'activity' ? 'activity' as const : 'self' as const;
      const base = `modules/:moduleId/lessons/:lessonId/${section}`;
      return [<Route key={base} path={base} element={<AssessmentPage scope={scope} />} />, <Route key={`${base}-attempt`} path={`${base}/attempt/:attemptId`} element={<AssessmentPage scope={scope} />} />, <Route key={`${base}-stage`} path={`${base}/attempt/:attemptId/:stage`} element={<AssessmentPage scope={scope} />} />];
    })}
    {DemoToolsPage && <Route path="demo-tools" element={<DemoToolsPage />} />}
    <Route path="*" element={<NotFoundPage />} />
  </Route></Routes></TrainingProvider></AppErrorBoundary>;
}
