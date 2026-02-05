import { addDays, differenceInDays, subWeeks } from 'date-fns';
import { DifficultyLevel, StudySession, Subject } from '@shared/types';
import { v4 as uuidv4 } from 'uuid';
export const SUBJECTS: Subject[] = [
  'Wiskunde A', 'Wiskunde B', 'Wiskunde C', 'Wiskunde D',
  'Natuurkunde', 'Scheikunde', 'Biologie', 'Natuur, Leven en Technologie',
  'Economie', 'Bedrijfseconomie', 'Geschiedenis', 'Aardrijkskunde', 'Maatschappijleer',
  'Nederlands', 'Engels', 'Frans', 'Duits', 'Spaans', 'Latijn', 'Grieks',
  'Informatica', 'Kunst (Algemeen)', 'Tehatex', 'Muziek', 'Drama',
  'Filosofie', 'Godsdienst', 'Lichamelijke Opvoeding', 'Rekenen'
];
export const DIFFICULTY_WEEKS: Record<DifficultyLevel, number> = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5
};
const STUDY_TOPICS: Record<string, string[]> = {
  default: [
    "Kernconcepten doornemen",
    "Oefenopgaven maken",
    "Samenvatting schrijven",
    "Flashcards oefenen",
    "Proeftoets maken",
    "Lastige onderwerpen herhalen",
    "Eindherhaling & Rust"
  ]
};
export function generateStudyPlan(
  subject: Subject,
  testDate: Date,
  difficulty: DifficultyLevel
): StudySession[] {
  const weeksToPrep = DIFFICULTY_WEEKS[difficulty];
  const startDate = subWeeks(testDate, weeksToPrep);
  const totalDays = differenceInDays(testDate, startDate);
  const sessions: StudySession[] = [];
  for (let i = 0; i < totalDays; i++) {
    const currentDate = addDays(startDate, i);
    const topics = STUDY_TOPICS[subject] || STUDY_TOPICS.default;
    const topic = topics[i % topics.length];
    sessions.push({
      id: uuidv4(),
      date: currentDate.toISOString(),
      topic: `Dag ${i + 1}: ${topic}`,
      isCompleted: false,
      durationMinutes: 45 + (difficulty * 5)
    });
  }
  return sessions;
}
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "Goedenacht";
  if (hour < 12) return "Goedemorgen";
  if (hour < 18) return "Goedemiddag";
  return "Goedenavond";
}