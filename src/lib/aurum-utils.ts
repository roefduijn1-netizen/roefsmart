import { addDays, differenceInDays, format, subWeeks } from 'date-fns';
import { DifficultyLevel, StudySession, Subject } from '@shared/types';
import { v4 as uuidv4 } from 'uuid';
export const SUBJECTS: Subject[] = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 
  'History', 'Literature', 'Languages', 'Computer Science', 
  'Art', 'Economics', 'Other'
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
    "Review core concepts",
    "Practice problem set",
    "Summarize key notes",
    "Flashcard review",
    "Mock quiz",
    "Deep dive into weak areas",
    "Final review"
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
  // Generate a session for each day leading up to the test
  // Skip the actual test day for studying (or maybe just a warm up)
  // We will include the test day as a "Test Day" event separately in UI, 
  // but here we generate prep sessions.
  for (let i = 0; i < totalDays; i++) {
    const currentDate = addDays(startDate, i);
    const topics = STUDY_TOPICS[subject] || STUDY_TOPICS.default;
    // Cycle through topics
    const topic = topics[i % topics.length];
    sessions.push({
      id: uuidv4(),
      date: currentDate.toISOString(),
      topic: `Day ${i + 1}: ${topic}`,
      isCompleted: false,
      durationMinutes: 45 + (difficulty * 5) // Harder difficulty = longer sessions
    });
  }
  return sessions;
}
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}