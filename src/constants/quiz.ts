export type QuizSection = 'cognitive' | 'eq' | 'resilience' | 'ambition' | 'social' | 'health'
export type QuestionType = 'cognitive' | 'likert' | 'choice'

export interface QuizQuestion {
  id: string
  section: QuizSection
  text: string
  type: QuestionType
  options: string[]
  correctIndex?: number   // for cognitive: index of correct answer
  points?: number[]       // for choice: point value per option
  reversed?: boolean      // for likert: reverse-score this item
}

export interface QuizSectionMeta {
  id: QuizSection
  title: string
  icon: string
  intro: string
  scaleLabels?: [string, string]  // [low, high] labels for likert
}

export const QUIZ_SECTIONS: QuizSectionMeta[] = [
  {
    id: 'cognitive',
    title: 'Cognitive Reasoning',
    icon: '🧠',
    intro: 'These questions measure how you analyze patterns, draw logical conclusions, and solve problems. Take your time — there are right and wrong answers.',
  },
  {
    id: 'eq',
    title: 'Emotional Intelligence',
    icon: '💛',
    intro: 'Rate how accurately each statement describes you. There are no right or wrong answers — honest reflection gives the most useful results.',
    scaleLabels: ['Not at all like me', 'Very much like me'],
  },
  {
    id: 'resilience',
    title: 'Resilience',
    icon: '🌱',
    intro: 'Think about how you typically respond to setbacks and stressful periods. Rate each statement honestly.',
    scaleLabels: ['Strongly Disagree', 'Strongly Agree'],
  },
  {
    id: 'ambition',
    title: 'Drive & Perseverance',
    icon: '🔥',
    intro: 'These questions measure your grit — your tendency to stay committed and push through difficulty toward long-term goals.',
    scaleLabels: ['Not at all like me', 'Very much like me'],
  },
  {
    id: 'social',
    title: 'Social Skills',
    icon: '🤝',
    intro: 'Rate how well each statement describes your typical way of relating to other people.',
    scaleLabels: ["Doesn't describe me at all", 'Describes me very well'],
  },
  {
    id: 'health',
    title: 'Physical Health',
    icon: '💪',
    intro: 'Answer based on your actual habits over the past few months — not your ideal habits. Be honest for accurate results.',
  },
]

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // ─── Section 1: Cognitive Ability (8 questions) ───────────────────────────
  {
    id: 'c1',
    section: 'cognitive',
    type: 'cognitive',
    text: 'What comes next in the series?  3 → 6 → 12 → 24 → ___',
    options: ['30', '36', '48', '42'],
    correctIndex: 2,
  },
  {
    id: 'c2',
    section: 'cognitive',
    type: 'cognitive',
    text: 'Book is to Library as Painting is to ___',
    options: ['Artist', 'Museum', 'Canvas', 'Brush'],
    correctIndex: 1,
  },
  {
    id: 'c3',
    section: 'cognitive',
    type: 'cognitive',
    text: 'All doctors are professionals. Some professionals are wealthy. What can we definitely conclude?',
    options: [
      'All doctors are wealthy',
      'Some doctors may be wealthy',
      'No doctors are wealthy',
      'All wealthy people are doctors',
    ],
    correctIndex: 1,
  },
  {
    id: 'c4',
    section: 'cognitive',
    type: 'cognitive',
    text: 'Complete the series:  2 → 3 → 5 → 8 → 13 → ___',
    options: ['18', '20', '21', '24'],
    correctIndex: 2,
  },
  {
    id: 'c5',
    section: 'cognitive',
    type: 'cognitive',
    text: 'Which word does NOT belong with the others?',
    options: ['Apple', 'Banana', 'Rose', 'Orange'],
    correctIndex: 2,
  },
  {
    id: 'c6',
    section: 'cognitive',
    type: 'cognitive',
    text: 'A rectangle has a length of 12 and a width of 5. What is its area?',
    options: ['17', '34', '60', '55'],
    correctIndex: 2,
  },
  {
    id: 'c7',
    section: 'cognitive',
    type: 'cognitive',
    text: 'If it always rains when there are dark clouds, and there are dark clouds today, then:',
    options: [
      'It will definitely rain today',
      'It might not rain today',
      'We cannot conclude anything',
      'This statement is a paradox',
    ],
    correctIndex: 0,
  },
  {
    id: 'c8',
    section: 'cognitive',
    type: 'cognitive',
    text: 'Which of these shapes has the most sides?',
    options: ['Triangle', 'Pentagon', 'Hexagon', 'Quadrilateral'],
    correctIndex: 2,
  },

  // ─── Section 2: Emotional Intelligence (8 questions, WLEIS-adapted) ────────
  {
    id: 'eq1',
    section: 'eq',
    type: 'likert',
    text: 'I am usually very aware of why I feel the way I do in different situations.',
    options: ['1', '2', '3', '4', '5'],
  },
  {
    id: 'eq2',
    section: 'eq',
    type: 'likert',
    text: 'I have a clear understanding of my own emotional strengths and weaknesses.',
    options: ['1', '2', '3', '4', '5'],
  },
  {
    id: 'eq3',
    section: 'eq',
    type: 'likert',
    text: 'I can sense how someone is feeling even when they don\'t say it directly.',
    options: ['1', '2', '3', '4', '5'],
  },
  {
    id: 'eq4',
    section: 'eq',
    type: 'likert',
    text: 'I am sensitive to the feelings and emotions of other people.',
    options: ['1', '2', '3', '4', '5'],
  },
  {
    id: 'eq5',
    section: 'eq',
    type: 'likert',
    text: 'I can motivate myself to keep going even when things get difficult.',
    options: ['1', '2', '3', '4', '5'],
  },
  {
    id: 'eq6',
    section: 'eq',
    type: 'likert',
    text: 'I can control my emotions when I need to stay focused on a task.',
    options: ['1', '2', '3', '4', '5'],
  },
  {
    id: 'eq7',
    section: 'eq',
    type: 'likert',
    text: 'When I am in conflict with someone, I usually manage to stay calm and think clearly.',
    options: ['1', '2', '3', '4', '5'],
  },
  {
    id: 'eq8',
    section: 'eq',
    type: 'likert',
    text: 'I am good at cheering people up and helping them feel better.',
    options: ['1', '2', '3', '4', '5'],
  },

  // ─── Section 3: Resilience (6 questions, BRS-adapted) ─────────────────────
  // Reversed items: r2 (index 1), r4 (index 3), r6 (index 5)
  {
    id: 'r1',
    section: 'resilience',
    type: 'likert',
    text: 'I tend to bounce back quickly after hard times.',
    options: ['1', '2', '3', '4', '5'],
  },
  {
    id: 'r2',
    section: 'resilience',
    type: 'likert',
    text: 'I have a hard time making it through stressful events.',
    options: ['1', '2', '3', '4', '5'],
    reversed: true,
  },
  {
    id: 'r3',
    section: 'resilience',
    type: 'likert',
    text: 'It does not take me long to recover from a stressful event.',
    options: ['1', '2', '3', '4', '5'],
  },
  {
    id: 'r4',
    section: 'resilience',
    type: 'likert',
    text: 'It is hard for me to snap back when something bad happens.',
    options: ['1', '2', '3', '4', '5'],
    reversed: true,
  },
  {
    id: 'r5',
    section: 'resilience',
    type: 'likert',
    text: 'I usually come through difficult times with little trouble.',
    options: ['1', '2', '3', '4', '5'],
  },
  {
    id: 'r6',
    section: 'resilience',
    type: 'likert',
    text: 'I tend to take a long time to get over setbacks in my life.',
    options: ['1', '2', '3', '4', '5'],
    reversed: true,
  },

  // ─── Section 4: Drive & Perseverance (8 questions, Grit-S) ────────────────
  // Reversed items: g1 (index 0), g3 (index 2), g5 (index 4), g7 (index 6)
  {
    id: 'g1',
    section: 'ambition',
    type: 'likert',
    text: 'New ideas and projects sometimes distract me from previous ones.',
    options: ['1', '2', '3', '4', '5'],
    reversed: true,
  },
  {
    id: 'g2',
    section: 'ambition',
    type: 'likert',
    text: 'Setbacks don\'t discourage me. I don\'t give up easily.',
    options: ['1', '2', '3', '4', '5'],
  },
  {
    id: 'g3',
    section: 'ambition',
    type: 'likert',
    text: 'My interests change from year to year.',
    options: ['1', '2', '3', '4', '5'],
    reversed: true,
  },
  {
    id: 'g4',
    section: 'ambition',
    type: 'likert',
    text: 'I am diligent. I never give up on a goal I care about.',
    options: ['1', '2', '3', '4', '5'],
  },
  {
    id: 'g5',
    section: 'ambition',
    type: 'likert',
    text: 'I have difficulty maintaining my focus on projects that take more than a few months to complete.',
    options: ['1', '2', '3', '4', '5'],
    reversed: true,
  },
  {
    id: 'g6',
    section: 'ambition',
    type: 'likert',
    text: 'I finish whatever I begin.',
    options: ['1', '2', '3', '4', '5'],
  },
  {
    id: 'g7',
    section: 'ambition',
    type: 'likert',
    text: 'I often set a goal but later choose to pursue a different one.',
    options: ['1', '2', '3', '4', '5'],
    reversed: true,
  },
  {
    id: 'g8',
    section: 'ambition',
    type: 'likert',
    text: 'I am a hard worker. I push myself every day.',
    options: ['1', '2', '3', '4', '5'],
  },

  // ─── Section 5: Social Skills (6 questions, IRI-adapted) ──────────────────
  {
    id: 's1',
    section: 'social',
    type: 'likert',
    text: 'I find it easy to see things from another person\'s point of view.',
    options: ['1', '2', '3', '4', '5'],
  },
  {
    id: 's2',
    section: 'social',
    type: 'likert',
    text: 'I often have tender, concerned feelings for people less fortunate than me.',
    options: ['1', '2', '3', '4', '5'],
  },
  {
    id: 's3',
    section: 'social',
    type: 'likert',
    text: 'I find it easy to make new friends and maintain close relationships.',
    options: ['1', '2', '3', '4', '5'],
  },
  {
    id: 's4',
    section: 'social',
    type: 'likert',
    text: 'In social situations, I generally feel comfortable and at ease.',
    options: ['1', '2', '3', '4', '5'],
  },
  {
    id: 's5',
    section: 'social',
    type: 'likert',
    text: 'I am good at reading other people\'s emotions from their expressions or tone.',
    options: ['1', '2', '3', '4', '5'],
  },
  {
    id: 's6',
    section: 'social',
    type: 'likert',
    text: 'I tend to naturally build rapport with people I meet.',
    options: ['1', '2', '3', '4', '5'],
  },

  // ─── Section 6: Physical Health (4 questions, scored choice) ──────────────
  {
    id: 'h1',
    section: 'health',
    type: 'choice',
    text: 'How often do you exercise per week? (Any activity that raises your heart rate)',
    options: ['Never or rarely', '1–2 times per week', '3–4 times per week', '5 or more times per week'],
    points: [0, 1, 3, 4],
  },
  {
    id: 'h2',
    section: 'health',
    type: 'choice',
    text: 'How many hours of sleep do you typically get per night?',
    options: ['Less than 5 hours', '5–6 hours', '7–8 hours', '9 or more hours'],
    points: [0, 1, 4, 2],
  },
  {
    id: 'h3',
    section: 'health',
    type: 'choice',
    text: 'How would you describe your typical diet?',
    options: [
      'Mostly fast food and processed foods',
      'A mix of healthy and unhealthy options',
      'Mostly home-cooked, balanced meals',
      'Very intentional — I prioritize nutrition',
    ],
    points: [0, 2, 3, 4],
  },
  {
    id: 'h4',
    section: 'health',
    type: 'choice',
    text: 'How is your overall energy level throughout the day?',
    options: [
      'I often feel exhausted or fatigued',
      'Moderate energy with noticeable dips',
      'Generally energized throughout the day',
      'Consistently high energy from morning to night',
    ],
    points: [0, 1, 2, 3],
  },
]

// Questions grouped by section (for step-by-step rendering)
export const QUESTIONS_BY_SECTION: Record<QuizSection, QuizQuestion[]> = {
  cognitive: QUIZ_QUESTIONS.filter(q => q.section === 'cognitive'),
  eq: QUIZ_QUESTIONS.filter(q => q.section === 'eq'),
  resilience: QUIZ_QUESTIONS.filter(q => q.section === 'resilience'),
  ambition: QUIZ_QUESTIONS.filter(q => q.section === 'ambition'),
  social: QUIZ_QUESTIONS.filter(q => q.section === 'social'),
  health: QUIZ_QUESTIONS.filter(q => q.section === 'health'),
}

export const SECTION_ORDER: QuizSection[] = ['cognitive', 'eq', 'resilience', 'ambition', 'social', 'health']
