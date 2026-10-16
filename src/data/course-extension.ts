import type { EditorialMeta, SourceReference } from '../../docs/contracts';

export const contentVersion = '0.4.0-draft';
const reference = (id: string, title: string, publisher: string, url: string, productOrFramework: string): SourceReference => ({ id, title, publisher, url, productOrFramework, accessedOn: '2026-10-16', verification: 'verified' });
export const sources = {
  theory: reference('unesco-ict-cft', 'ICT Competency Framework for Teachers v3', 'UNESCO', 'https://www.unesco.org/en/digital-competencies-skills/ict-cft', 'ICT-CFT v3؛ إطار مرجعي، والأمثلة التعليمية من إعداد نسخة العرض'),
  forms: reference('google-forms-quiz', 'Create and grade quizzes', 'Google', 'https://support.google.com/docs/answer/7032287', 'Google Forms — واجهة الويب'),
  formsReview: reference('google-quiz-learning', 'Create a quiz with Google Forms', 'Google', 'https://support.google.com/a/users/answer/13344425?hl=en', 'Google Forms — واجهة الويب'),
  formsPrivacy: reference('google-forms-sharing', 'Publish and share your form with responders', 'Google', 'https://support.google.com/docs/answer/2839588', 'Google Forms — النشر ووصول المجيبين بحسب إعدادات الحساب'),
  teams: reference('teams-files', 'Share files in Microsoft Teams', 'Microsoft', 'https://support.microsoft.com/en-us/teams/files/share-files-in-microsoft-teams', 'Teams للعمل أو التعليم؛ الإتاحة تخضع للحساب والسياسات'),
  teamsChannels: reference('teams-channels', 'Overview of teams and channels', 'Microsoft', 'https://learn.microsoft.com/en-us/microsoftteams/teams-channels-overview', 'Teams للعمل أو التعليم؛ لا افتراض لتراخيص أو صلاحيات إدارية'),
  teamsChat: reference('teams-meeting-chat', 'Chat in Microsoft Teams meetings', 'Microsoft', 'https://support.microsoft.com/en-us/teams/meetings/chat-in-microsoft-teams-meetings', 'Teams؛ وصول المحادثة يتأثر بالعضوية وإعدادات المنظم والمؤسسة'),
  mendeley: reference('mendeley-add', 'Adding references — Reference Manager', 'Mendeley', 'https://static.mendeley.com/md-stitch/releases/live/02-adding-references.e005845c.html', 'Mendeley Reference Manager؛ ليس Mendeley Desktop القديم'),
  mendeleyOrganize: reference('mendeley-organize', 'Searching and organizing references', 'Mendeley', 'https://static.mendeley.com/md-stitch/releases/live/03-searching-and-organizing-references.9a92d93d.html', 'Mendeley Reference Manager'),
  cite: reference('mendeley-cite', 'Getting started with Mendeley Cite', 'Mendeley', 'https://static.mendeley.com/md-stitch/releases/live/mendeley-cite-introduction.0d18bf79.html', 'Mendeley Cite — إضافة Word المعاصرة'),
};
export type SourceKey = keyof typeof sources;
export const metaFor = (...refs: SourceReference[]): EditorialMeta => ({ contentVersion, sources: refs, approval: { status: 'draft' } });
/** Titles/counts outside module 1 remain demonstration choices pending researcher approval. */
export const temporaryLessonCounts = { 'mod-01': 3, 'mod-02': 2, 'mod-03': 2, 'mod-04': 2 } as const;
