import type { Command, DemoState, LearnerCatalog, Result, StoreSnapshot, TrainingCatalog, TrainingPort } from '../domain/models';
import { freshState, parseState, reduceCommand, TrainingError } from '../domain/training';

export const STORAGE_KEY = 'edu-training-demo:v1';
export interface StoragePort { read(): string | null; write(raw: string): void; }
export class DemoAdapter implements TrainingPort {
  private snapshot: StoreSnapshot = { data: null, error: null, fault: null };
  private baseline: string | null = null;
  private listeners = new Set<() => void>();
  private celebrationToken = 0;
  readonly catalog: LearnerCatalog;
  constructor(private storage: StoragePort, private authoring: TrainingCatalog, private toolsEnabled = false) {
    this.catalog = { ...authoring, questions: authoring.questions.map(q => ({ id: q.id, prompt: q.prompt, type: q.type, options: q.options, weight: q.weight, order: q.order })) };
    this.reload();
  }
  getSnapshot = () => this.snapshot;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => this.listeners.delete(listener); };
  private publish(snapshot: StoreSnapshot) { this.snapshot = snapshot; this.listeners.forEach(fn => fn()); }
  reload = () => {
    let raw: string | null;
    try { raw = this.storage.read(); } catch { this.publish({ data: null, error: 'تعذر الوصول إلى التخزين المحلي. لم تُحذف بياناتك؛ أعد المحاولة بعد السماح بالتخزين.', fault: 'storage' }); return; }
    this.baseline = raw;
    try { this.publish({ data: raw ? parseState(raw, this.authoring) : freshState(this.authoring), error: null, fault: null }); }
    catch { this.publish({ data: null, error: 'تعذر استعادة بيانات التجربة المحفوظة أو أنها تخص نسخة مختلفة. لم يُحذف شيء. أعد المحاولة أو استخدم أدوات العرض لإعادة الضبط صراحةً.', fault: 'corrupt' }); }
  };
  async execute(command: Command): Promise<Result<{ attemptId?: string }>> {
    if (!this.snapshot.data) return { ok: false, error: this.snapshot.error ?? 'الحالة غير متاحة.' };
    try {
      if (this.storage.read() !== this.baseline) { this.publish({ ...this.snapshot, error: 'تغيرت بيانات التجربة في نافذة أخرى. أعد تحميل الحالة قبل المتابعة.', fault: 'conflict' }); return { ok: false, error: this.snapshot.error! }; }
      const result = reduceCommand(this.snapshot.data, this.authoring, command, new Date().toISOString(), crypto.randomUUID());
      if (result.state !== this.snapshot.data) {
        const newRewards = result.state.rewards.filter(r => !result.state.announcedRewardIds.includes(r.id));
        result.state.announcedRewardIds.push(...newRewards.map(r => r.id));
        const raw = JSON.stringify(result.state);
        this.storage.write(raw); this.baseline = raw;
        this.publish({ data: result.state, error: null, fault: null, celebration: newRewards.length ? `إنجاز جديد: +${newRewards.reduce((n, r) => n + r.points, 0)} نقطة إنجاز` : this.snapshot.celebration ?? null });
        if (newRewards.length) { const token = ++this.celebrationToken; setTimeout(() => { if (token === this.celebrationToken) this.publish({ ...this.snapshot, celebration: null }); }, 1100); }
      }
      return { ok: true, value: result.attemptId ? { attemptId: result.attemptId } : {} };
    } catch (error) {
      return { ok: false, error: error instanceof TrainingError ? error.message : 'تعذر حفظ التغيير محليًا. بقيت الحالة السابقة؛ أعد المحاولة ولا تغلق الصفحة إذا كانت لديك إجابة لم تحفظ.' };
    }
  }
  /** Only the separate demo-tools build may call this; no reset in learner pages. */
  async replaceFromTools(state: DemoState): Promise<Result<null>> {
    if (!this.toolsEnabled) return { ok: false, error: 'أدوات العرض مستبعدة من هذا البناء.' };
    try { const raw = JSON.stringify(parseState(JSON.stringify(state), this.authoring)); this.storage.write(raw); this.baseline = raw; this.publish({ data: state, error: null, fault: null }); return { ok: true, value: null }; }
    catch { return { ok: false, error: 'تعذر حفظ حالة العرض. لم تُحذف البيانات السابقة.' }; }
  }
  getAttemptView(id: string) {
    const attempt = this.snapshot.data?.attempts.find(a => a.id === id);
    if (!attempt || !this.snapshot.data?.learner.active || attempt.learnerId !== this.snapshot.data.learner.id) return null;
    const d = this.catalog.assessments.find(d => d.id === attempt.assessmentId)!;
    return { attempt, definition: d, questions: attempt.questionIds.map(id => {
      const q = this.authoring.questions.find(q => q.id === id)!;
      return { id: q.id, prompt: q.prompt, type: q.type, options: q.options, weight: q.weight, order: q.order };
    }), feedback: attempt.status === 'submitted' && d.feedback === 'after-submit-educational' ? attempt.questionIds.map(id => {
      const q = this.authoring.questions.find(q => q.id === id)!;
      return { questionId: id, selected: attempt.answers[id]!, correct: q.answerKey.correctOptionId, explanation: q.answerKey.rationale, sources: q.editorial.sources };
    }) : null };
  }
}
