/**
 * Shared authoring types and future service design from stage 1.
 * Stage 3 uses these content types; its local runtime boundary and Zod state
 * schemas are in src/domain/models.ts. TrainingService below is not implemented.
 */
export type Id = string;
export type Version = string;
export type IsoDateTime = string;

export interface SourceReference {
  id: Id;
  title: string;
  publisher: string;
  url: string;
  productOrFramework?: string;
  productVersion?: string;
  accessedOn: string | null; // Actual YYYY-MM-DD access date; never invented.
  verification: 'not-reviewed' | 'verified';
}

export type Approval =
  | { status: 'draft'; approvedBy?: never; approvedAt?: never }
  | { status: 'approved'; approvedBy: Id; approvedAt: IsoDateTime };

export interface EditorialMeta {
  contentVersion: Version;
  assessmentVersion?: Version;
  sources: readonly SourceReference[];
  approval: Approval;
}

export interface ContactInfo {
  researcherName: string;
  affiliation: string;
  email: string;
  phone: string | null;
  placeholder: boolean;
  emailActionEnabled: boolean;
  phoneActionEnabled: boolean;
  messagingAvailable: boolean;
}

export interface PersonCard {
  id: Id;
  displayName: string;
  position: string;
  roleLabel: string;
  placeholder: boolean;
  // No portraits. A role or position is not inferred from the card's location.
}

export interface BrandAsset {
  kind: 'university' | 'faculty-or-department';
  src: string | null;
  alt: string;
  placeholderLabel: string;
}

export interface DemoStudyPolicy {
  scope: 'demo-only';
  preEligibilityAttempt: 'first-submitted-pre';
  preEligibilityThreshold: { operator: 'lte'; percent: 50 };
  selfPassThreshold: { operator: 'gte'; percent: 50 };
  submitRequiresAllAnswers: true;
  postAnalysisAttempt: 'unresolved';
  postPassThreshold: null;
  certificate: 'unresolved';
  postDetailedFeedback: 'withheld-pending-approval';
}

/** Temporary demo choice, not a production research-policy approval. */
export const DEMO_STUDY_POLICY: DemoStudyPolicy = {
  scope: 'demo-only',
  preEligibilityAttempt: 'first-submitted-pre',
  preEligibilityThreshold: { operator: 'lte', percent: 50 },
  selfPassThreshold: { operator: 'gte', percent: 50 },
  submitRequiresAllAnswers: true,
  postAnalysisAttempt: 'unresolved',
  postPassThreshold: null,
  certificate: 'unresolved',
  postDetailedFeedback: 'withheld-pending-approval',
};

export interface EnvironmentConfig {
  id: Id;
  name: string; // Exact full Arabic name in project-spec.md §2.
  locale: 'ar';
  direction: 'rtl';
  contentVersion: Version;
  editorial: EditorialMeta;
  logos: readonly BrandAsset[];
  researcher: PersonCard;
  academicCards: readonly [PersonCard, PersonCard, PersonCard];
  contact: ContactInfo;
  moduleIds: readonly Id[]; // Exactly four in the current agreed scope.
  preAssessmentId: Id;
  postAssessmentId: Id;
  studyPolicy: DemoStudyPolicy; // Production policy needs an approved revision.
  gameDesign: {
    status: 'proposed';
    activityCompletionPoints: number;
    lessonCompletionPoints: number;
    moduleCompletionPoints: number;
    publicLeaderboard: false;
    speedRewards: false;
    dailyStreaks: false;
    levelRule: 'completed-module-count';
  };
}

export interface ContentRecord {
  id: Id;
  title: string;
  order: number;
  editorial: EditorialMeta;
}

export type ContentNode =
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; ordered: boolean; items: readonly string[] }
  | { kind: 'image'; src: string; alt: string; caption?: string; license: string }
  | { kind: 'resource'; label: string; url: string };

/** One short reading part. Text remains selectable; no embedded UI screenshots. */
export interface ContentBlock extends ContentRecord {
  nodes: readonly ContentNode[];
}

export interface Module extends ContentRecord {
  introduction: readonly ContentBlock[];
  objectives: readonly string[];
  lessonIds: readonly Id[];
  badgeId: Id;
}

export interface Lesson extends ContentRecord {
  moduleId: Id;
  introduction: readonly ContentBlock[];
  objectives: readonly string[];
  elementIds: readonly Id[];
  activityAssessmentId: Id;
  selfAssessmentId: Id;
  // No lesson pre-assessment and no between-module assessment.
}

export interface Element extends ContentRecord {
  moduleId: Id;
  lessonId: Id;
  parts: readonly ContentBlock[];
}

export interface Option {
  id: Id;
  text: string;
}

export interface QuestionBase {
  id: Id;
  prompt: string;
  order: number;
  weight: number; // Runtime validation: positive integer in the initial demo.
}

/** Learner-safe shape. Never return a Question with fields merely hidden in JSX. */
export type DeliveredQuestion = QuestionBase & (
  | { type: 'single-choice'; options: readonly Option[] }
  | { type: 'true-false'; options: readonly [
      { id: 'true'; text: 'صح' },
      { id: 'false'; text: 'خطأ' },
    ] }
);

export interface AnswerKey {
  correctOptionId: Id;
  rationale: string;
  sourceIds: readonly Id[];
}

/** Authoring/mock-only model: contains exposed answer keys in a bundled demo. */
export type Question = DeliveredQuestion & {
  assessmentVersion: Version;
  editorial: EditorialMeta;
  answerKey: AnswerKey;
};

export type AssessmentKind = 'pre' | 'post' | 'activity' | 'self';
export type AssessmentScope =
  | { kind: 'pre' | 'post' }
  | { kind: 'activity' | 'self'; moduleId: Id; lessonId: Id };

export interface AssessmentDefinition {
  id: Id;
  title: string;
  purpose: string;
  scope: AssessmentScope;
  contentVersion: Version;
  assessmentVersion: Version;
  editorial: EditorialMeta;
  questionIds: readonly Id[];
  expectedTypes: readonly DeliveredQuestion['type'][];
  timeLimitSeconds: null;
  attemptLimit: number | null; // null = unlimited; pre/post/self initially null.
  submitRequiresAllAnswers: boolean;
  feedback: 'after-submit-educational' | 'score-only';
}

export interface Answer {
  questionId: Id;
  selectedOptionId: Id;
}

export interface Score {
  earned: number;
  possible: number; // >0; compare the ratio before rounding for display.
}

export interface AttemptBase {
  id: Id;
  learnerId: Id;
  assessmentId: Id;
  scope: AssessmentScope;
  contentVersion: Version;
  assessmentVersion: Version;
  questionIds: readonly Id[]; // Frozen ordered IDs of an immutable definition.
  startedAt: IsoDateTime;
  revision: number;
}

export type Attempt =
  | (AttemptBase & {
      status: 'draft';
      answers: readonly Answer[];
      lastSavedAt: IsoDateTime;
    })
  | (AttemptBase & {
      status: 'submitted';
      answers: readonly Answer[];
      submittedAt: IsoDateTime;
      score: Score;
    });

export interface QuestionFeedback {
  questionId: Id;
  selectedOptionId: Id;
  correctOptionId: Id;
  rationale: string;
  references: readonly { label: string; url: string }[];
}

/** Feedback is returned only when allowed; pre/post are score-only for now. */
export interface AttemptView {
  attempt: Attempt;
  questions: readonly DeliveredQuestion[];
  feedback: readonly QuestionFeedback[] | null;
}

export type Eligibility =
  | { status: 'not-assessed'; determiningAttemptId: null }
  | { status: 'eligible' | 'ineligible'; determiningAttemptId: Id; score: Score };

export interface ElementAcknowledgement {
  elementId: Id;
  lessonId: Id;
  contentVersion: Version;
  acknowledgedAt: IsoDateTime;
  // Explicit acknowledgement at end of final part, not a claim of understanding.
}

export type AchievementEvent = 'activity-completed' | 'lesson-completed' | 'module-completed';

export interface Achievement {
  id: Id;
  learnerId: Id;
  event: AchievementEvent;
  subjectId: Id;
  contentVersion: Version;
  qualifyingAttemptId: Id;
  earnedAt: IsoDateTime;
  points: number;
  badgeId: Id | null;
  // Unique: learnerId + event + subjectId + contentVersion, not attempt ID.
}

/** Persist facts. Availability, totals and percentages are derived separately. */
export interface Progress {
  learnerId: Id;
  contentVersion: Version;
  determiningPreAttemptId: Id | null;
  attemptIds: readonly Id[];
  startedModuleIds: readonly Id[];
  startedLessonIds: readonly Id[];
  startedElementIds: readonly Id[];
  elementAcknowledgements: readonly ElementAcknowledgement[];
  firstPassingSelfAttempts: readonly { lessonId: Id; attemptId: Id }[];
  achievements: readonly Achievement[];
  revision: number;
}

export type LockReason =
  | 'account-required' | 'pre-required' | 'study-ineligible'
  | 'previous-module-required' | 'previous-lesson-required'
  | 'previous-element-required' | 'elements-required' | 'activity-required'
  | 'training-required' | 'content-unavailable' | 'attempt-not-submitted'
  | 'not-owner';

export type Access =
  | { allowed: true }
  | { allowed: false; reason: LockReason; nextAllowedRoute: string | null };

export type UnitState = 'locked' | 'available' | 'in-progress' | 'completed';
export interface UnitProgress {
  id: Id;
  state: UnitState;
  access: Access;
}

export interface LessonProgress extends UnitProgress {
  activityState: 'locked' | 'available' | 'in-progress' | 'submitted';
  selfState: 'locked' | 'available' | 'retry-available' | 'passed';
}

export interface ProgressSnapshot {
  facts: Progress;
  eligibility: Eligibility;
  modules: readonly UnitProgress[];
  lessons: readonly LessonProgress[];
  elements: readonly UnitProgress[];
  completion: { completedLessons: number; totalLessons: number };
  totalAchievementPoints: number;
  level: number; // Completed module count, 0..4 in this scope.
  postAccess: Access;
  pathwayState: 'not-started' | 'in-progress' | 'training-completed' | 'post-submitted';
}

/** Explicitly public: catalog/goal access does not grant module-body access. */
export interface PublicModule {
  id: Id;
  title: string;
  order: number;
  objectives: readonly string[];
  badgeLabel: string;
}

export interface AssessmentInstructions {
  assessmentId: Id;
  scope: AssessmentScope;
  contentVersion: Version;
  assessmentVersion: Version;
  purpose: string;
  questionCounts: readonly { type: DeliveredQuestion['type']; count: number }[];
  timeLimitSeconds: null;
  attemptLimit: number | null;
  submitRequiresAllAnswers: boolean;
  feedbackPolicyLabel: string;
  actualSavePolicyLabel: string;
  startAccess: Access;
}

export type ServiceErrorCode =
  | 'unauthenticated' | 'forbidden' | 'not-found' | 'locked' | 'invalid-data'
  | 'invalid-transition' | 'conflict' | 'storage-unavailable' | 'network';

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: ServiceErrorCode; message: string; reason?: LockReason } };

/**
 * Later: DemoTrainingAdapter or HttpTrainingAdapter supplies this interface.
 * Learner/session identity comes from adapter context, never a caller's learner ID.
 * Commands enforce access, ownership, versions, immutable submission and rewards.
 */
export interface TrainingService {
  getEnvironment(): Promise<ServiceResult<EnvironmentConfig>>;
  getCatalog(): Promise<ServiceResult<readonly PublicModule[]>>;
  getModule(moduleId: Id): Promise<ServiceResult<Module>>;
  getLesson(moduleId: Id, lessonId: Id): Promise<ServiceResult<Lesson>>;
  getElement(moduleId: Id, lessonId: Id, elementId: Id): Promise<ServiceResult<Element>>;
  getAssessmentInstructions(assessmentId: Id): Promise<ServiceResult<AssessmentInstructions>>;
  getProgress(): Promise<ServiceResult<ProgressSnapshot>>;
  startAttempt(input: {
    assessmentId: Id;
    contentVersion: Version;
    assessmentVersion: Version;
    idempotencyKey: string;
  }): Promise<ServiceResult<AttemptView>>;
  getAttempt(attemptId: Id): Promise<ServiceResult<AttemptView>>;
  saveAnswers(input: {
    attemptId: Id;
    expectedRevision: number;
    answers: readonly Answer[];
  }): Promise<ServiceResult<AttemptView>>;
  submitAttempt(input: {
    attemptId: Id;
    expectedRevision: number;
    idempotencyKey: string;
  }): Promise<ServiceResult<{ view: AttemptView; progress: ProgressSnapshot }>>;
  markElementStarted(input: {
    moduleId: Id;
    lessonId: Id;
    elementId: Id;
    contentVersion: Version;
    idempotencyKey: string;
  }): Promise<ServiceResult<ProgressSnapshot>>;
  acknowledgeElement(input: {
    moduleId: Id;
    lessonId: Id;
    elementId: Id;
    contentVersion: Version;
    idempotencyKey: string;
  }): Promise<ServiceResult<ProgressSnapshot>>;
}
