import { useState } from 'react';
import { useTraining } from '../state/training-context';
import { freshState } from '../domain/training';
import { fullCatalog } from '../data/assessments';
import { createE2eFixture } from '../demo/e2e-fixture';
import { scenarioLabels, scenarioState } from '../demo/scenarios';
import type { Scenario } from '../demo/scenarios';
import { Button, ButtonLink, Card, Drawer, PageHeading } from '../components/ui';

export default function DemoToolsPage() {
  const { adapter, catalog, snapshot } = useTraining();
  const [pending, setPending] = useState<Scenario | 'reset' | null>(null);
  const [message, setMessage] = useState('');
  async function confirm() {
    if (!pending) return;
    if (!adapter.replaceFromTools) { setMessage('أدوات العرض غير متاحة.'); return; }
    const source = import.meta.env.MODE === 'e2e' ? createE2eFixture(fullCatalog) : fullCatalog;
    const result = await adapter.replaceFromTools(pending === 'reset' ? freshState(catalog) : scenarioState(source, pending));
    setMessage(result.ok ? 'حُفظت حالة العرض محليًا. يمكنك الآن معاينة الرحلة.' : result.error); setPending(null);
  }
  return <><PageHeading eyebrow="أدوات العرض — خارج رحلة المتدرب" title="حالات التجربة المحلية">هذه حالات مصطنعة للعرض والاختبار، وليست بيانات دراسة. استبدال الحالة يمحو التقدم الحالي في هذا المتصفح فقط.</PageHeading>
    <div className="notice">هذه الصفحة لا تُضمّن في البناء الافتراضي للإنتاج. مفاتيح التصحيح وقواعد المتصفح مكشوفة تقنيًا في العرض وليست أمانًا.</div>
    {snapshot.error && <p role="alert">{snapshot.error}</p>}
    <Card className="tools-grid">{(Object.keys(scenarioLabels) as Scenario[]).map(s => <Button key={s} variant="secondary" onClick={() => setPending(s)}>{scenarioLabels[s]}</Button>)}<Button onClick={() => setPending('reset')}>إعادة ضبط التجربة</Button></Card>
    {message && <p role="status" className="notice">{message}</p>}<div className="button-row"><ButtonLink to="/content">عرض المسار</ButtonLink><ButtonLink variant="secondary" to="/assessment/pre/instructions">القبلي</ButtonLink><ButtonLink variant="secondary" to="/assessment/post/instructions">البعدي</ButtonLink></div>
    <Drawer open={pending !== null} onClose={() => setPending(null)} title="تأكيد استبدال الحالة المحلية" className="image-dialog"><p>سيستبدل هذا الإجراء بيانات التجربة الحالية، بما فيها المسودات والمحاولات والإنجازات. لا يمكن التراجع عنه من الواجهة.</p><div className="button-row"><Button onClick={confirm}>تأكيد الاستبدال</Button><Button variant="secondary" onClick={() => setPending(null)}>إلغاء</Button></div></Drawer>
  </>;
}
