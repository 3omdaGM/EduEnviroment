import type { ReactNode } from 'react';
import type { Access } from '../domain/models';
import { useTraining } from '../state/training-context';
import { demoToolsEnabled } from '../demo/flags';
import { Button, ButtonLink, Card } from './ui';

export function StorageProblem() {
  const { snapshot, adapter } = useTraining();
  return <Card className="preparation" role="alert"><h1>تعذر استعادة التجربة</h1><p>{snapshot.error}</p><Button onClick={() => adapter.reload()}>إعادة المحاولة</Button>{demoToolsEnabled && <ButtonLink to="/demo-tools" variant="secondary">أدوات العرض واستعادة الحالة</ButtonLink>}</Card>;
}
export function TrainingGuard({ access, children }: { access?: Access; children: ReactNode }) {
  const { snapshot } = useTraining();
  if (!snapshot.data) return <StorageProblem />;
  if (access && !access.allowed) return <Card className="preparation"><h2>المحتوى مقفل</h2><p>{access.reason}</p><ButtonLink to={access.nextRoute}>الانتقال إلى الخطوة المتاحة</ButtonLink></Card>;
  return <>{snapshot.fault === 'conflict' && <div role="alert" className="notice">{snapshot.error}<Button onClick={() => window.location.reload()}>تحميل الحالة الأحدث</Button></div>}{children}</>;
}
