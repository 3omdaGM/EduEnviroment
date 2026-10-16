import { z } from 'zod';
import type { AssessmentDefinition, Element, Lesson, Module, Option, Question, SourceReference } from '../../docs/contracts';

export interface TrainingCatalog {
  version: string;
  modules: readonly Module[];
  lessons: readonly Lesson[];
  elements: readonly Element[];
  assessments: readonly AssessmentDefinition[];
  questions: readonly Question[];
}
export type ProgressCatalog = Omit<TrainingCatalog, 'questions'>;
export interface PublicQuestion { id: string; prompt: string; type: Question['type']; options: readonly Option[]; weight: number; order: number; }
export interface LearnerCatalog extends ProgressCatalog { questions: readonly PublicQuestion[]; }
export interface AttemptPresentation {
  attempt: DemoAttempt; definition: AssessmentDefinition; questions: readonly PublicQuestion[];
  feedback: readonly { questionId: string; selected: string; correct: string; explanation: string; sources: readonly SourceReference[] }[] | null;
}
const scoreSchema = z.object({ earned: z.number().int().nonnegative(), possible: z.number().int().positive() }).strict().refine(s => s.earned <= s.possible);
export const attemptSchema = z.object({
  id: z.string().min(1), learnerId: z.literal('demo-learner'), assessmentId: z.string().min(1), assessmentVersion: z.string(), contentVersion: z.string(),
  questionIds: z.array(z.string()).min(1), answers: z.record(z.string(), z.string()), position: z.number().int().nonnegative(),
  status: z.enum(['draft', 'submitted']), score: scoreSchema.nullable(), createdAt: z.string(), submittedAt: z.string().nullable(), sequence: z.number().int().positive().nullable(),
}).strict();
export const rewardSchema = z.object({ id: z.string(), event: z.enum(['activity-completed', 'lesson-completed', 'module-completed']), subjectId: z.string(), points: z.number().int().nonnegative(), badgeId: z.string().nullable(), earnedAt: z.string() }).strict();
export const stateSchema = z.object({
  schemaVersion: z.literal(1), contentVersion: z.string(), revision: z.number().int().nonnegative(),
  learner: z.object({ id: z.literal('demo-learner'), name: z.string().min(1).max(80), active: z.boolean() }).strict(),
  readPartIds: z.array(z.string()), attempts: z.array(attemptSchema), rewards: z.array(rewardSchema), announcedRewardIds: z.array(z.string()),
}).strict();
export type DemoState = z.infer<typeof stateSchema>;
export type DemoAttempt = z.infer<typeof attemptSchema>;
export type Reward = z.infer<typeof rewardSchema>;
export type Score = z.infer<typeof scoreSchema>;
export interface Access { allowed: boolean; reason: string; nextRoute: string; }
export interface DemoPolicy {
  scope: 'demo-only';
  eligibilityAttempt: 'first-submitted-pre';
  points: { activity: number; lesson: number; module: number };
}
export const demoPolicy: DemoPolicy = { scope: 'demo-only', eligibilityAttempt: 'first-submitted-pre', points: { activity: 10, lesson: 20, module: 50 } };
export type Command =
  | { type: 'login'; name: string }
  | { type: 'logout' }
  | { type: 'read-part'; elementId: string; partId: string }
  | { type: 'start-attempt'; assessmentId: string }
  | { type: 'answer'; attemptId: string; questionId: string; optionId: string }
  | { type: 'position'; attemptId: string; position: number }
  | { type: 'submit'; attemptId: string }
  | { type: 'announce'; rewardIds: string[] };
export type Result<T> = { ok: true; value: T } | { ok: false; error: string };
export interface CommandOutput { state: DemoState; attemptId?: string; }
export interface StoreSnapshot { data: DemoState | null; error: string | null; fault: 'corrupt' | 'storage' | 'conflict' | null; celebration?: string | null; }
export interface TrainingPort {
  readonly catalog: LearnerCatalog;
  getSnapshot(): StoreSnapshot;
  subscribe(listener: () => void): () => void;
  execute(command: Command): Promise<Result<{ attemptId?: string }>>;
  reload(): void;
  getAttemptView(id: string): AttemptPresentation | null;
  replaceFromTools?(state: DemoState): Promise<Result<null>>;
}
