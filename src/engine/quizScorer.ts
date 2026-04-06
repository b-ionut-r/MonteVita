import type { PersonStats } from '@/types'
import { QUIZ_QUESTIONS, SECTION_ORDER, type QuizSection } from '@/constants/quiz'

export type QuizAnswers = {
  [S in QuizSection]: (number | null)[]
}

export function emptyAnswers(): QuizAnswers {
  const result = {} as QuizAnswers
  for (const section of SECTION_ORDER) {
    const count = QUIZ_QUESTIONS.filter(q => q.section === section).length
    result[section] = Array(count).fill(null)
  }
  return result
}

// ─── Scoring helpers ──────────────────────────────────────────────────────────

/** Cognitive: count of correct answers (0–8) → stat (15–90) */
function cognitiveToStat(correct: number): number {
  return Math.round(Math.min(90, Math.max(15, (correct / 8) * 75 + 15)))
}

/**
 * Likert: array of 1–5 responses (reversed items already handled)
 * → mean → stat (10–90)
 */
function likertToStat(responses: number[], reverseIndices: number[]): number {
  const adjusted = responses.map((v, i) => reverseIndices.includes(i) ? 6 - v : v)
  const mean = adjusted.reduce((a, b) => a + b, 0) / adjusted.length
  return Math.round(Math.min(90, Math.max(10, ((mean - 1) / 4) * 80 + 10)))
}

/** Health: sum of scored-choice points (0–15) → stat (10–90) */
function healthToStat(points: number): number {
  return Math.round(Math.min(90, Math.max(10, (points / 15) * 80 + 10)))
}

// ─── Section scorers ──────────────────────────────────────────────────────────

function scoreIQ(answers: (number | null)[]): number {
  const cogQs = QUIZ_QUESTIONS.filter(q => q.section === 'cognitive')
  const correct = answers.filter((ans, i) => ans !== null && ans === cogQs[i]?.correctIndex).length
  return cognitiveToStat(correct)
}

function scoreLikertSection(
  answers: (number | null)[],
  reverseIndices: number[],
): number {
  const filled = answers.map(a => a ?? 3) // default to neutral (3) if unanswered
  return likertToStat(filled, reverseIndices)
}

function scoreHealth(answers: (number | null)[]): number {
  const healthQs = QUIZ_QUESTIONS.filter(q => q.section === 'health')
  const points = answers.reduce<number>((sum, ans, i) => {
    if (ans === null) return sum
    return sum + (healthQs[i]?.points?.[ans] ?? 0)
  }, 0)
  return healthToStat(points)
}

// Reversed item indices per section (0-based within that section's question list)
const RESILIENCE_REVERSED = [1, 3, 5]   // r2, r4, r6
const AMBITION_REVERSED   = [0, 2, 4, 6] // g1, g3, g5, g7

// ─── Public API ───────────────────────────────────────────────────────────────

export function scoreQuiz(answers: QuizAnswers, currentLuck: number): PersonStats {
  return {
    iq:         scoreIQ(answers.cognitive),
    eq:         scoreLikertSection(answers.eq, []),
    resilience: scoreLikertSection(answers.resilience, RESILIENCE_REVERSED),
    ambition:   scoreLikertSection(answers.ambition, AMBITION_REVERSED),
    social:     scoreLikertSection(answers.social, []),
    health:     scoreHealth(answers.health),
    luck:       currentLuck,
  }
}

/** Returns count of answered questions for a given section */
export function answeredCount(answers: QuizAnswers, section: QuizSection): number {
  return answers[section].filter(a => a !== null).length
}

/** Returns total answered questions across all sections */
export function totalAnswered(answers: QuizAnswers): number {
  return SECTION_ORDER.reduce((sum, s) => sum + answeredCount(answers, s), 0)
}

/** Total questions in the quiz */
export const TOTAL_QUESTIONS = QUIZ_QUESTIONS.length
