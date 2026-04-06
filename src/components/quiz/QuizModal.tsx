import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSimulatorStore } from '@/store/useSimulatorStore'
import {
  QUIZ_SECTIONS,
  QUESTIONS_BY_SECTION,
  SECTION_ORDER,
  type QuizSection,
  type QuizQuestion,
} from '@/constants/quiz'
import {
  emptyAnswers,
  scoreQuiz,
  answeredCount,
  totalAnswered,
  TOTAL_QUESTIONS,
  type QuizAnswers,
} from '@/engine/quizScorer'
import type { PersonStats } from '@/types'
import { STAT_DEFINITIONS } from '@/constants/stats'

// ─── Stat color map (mirrors stat definitions) ────────────────────────────────
const STAT_COLORS: Record<keyof PersonStats, string> = {
  iq:         '#60A5FA',
  eq:         '#FBBF24',
  resilience: '#34D399',
  ambition:   '#FB923C',
  social:     '#F472B6',
  health:     '#2DD4BF',
  luck:       '#A78BFA',
}

type Phase = 'quiz' | 'calculating' | 'results'

// ─── Sub-components ───────────────────────────────────────────────────────────

function CognitiveQuestion({
  q,
  answer,
  onAnswer,
}: {
  q: QuizQuestion
  answer: number | null
  onAnswer: (idx: number) => void
}) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <p style={{ fontSize: '15px', color: '#E2E8F0', lineHeight: 1.6, marginBottom: '12px' }}>
        {q.text}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {q.options.map((opt, i) => {
          const selected = answer === i
          return (
            <button
              key={i}
              onClick={() => onAnswer(i)}
              style={{
                textAlign: 'left',
                padding: '10px 16px',
                borderRadius: '10px',
                border: `1px solid ${selected ? '#6366F1' : 'rgba(255,255,255,0.08)'}`,
                background: selected
                  ? 'rgba(99,102,241,0.2)'
                  : 'rgba(255,255,255,0.03)',
                color: selected ? '#A5B4FC' : '#94A3B8',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                border: `1.5px solid ${selected ? '#6366F1' : 'rgba(255,255,255,0.2)'}`,
                background: selected ? '#6366F1' : 'transparent',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
                color: selected ? '#fff' : '#64748B',
              }}>
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function LikertQuestion({
  q,
  answer,
  onAnswer,
  scaleLabels,
}: {
  q: QuizQuestion
  answer: number | null
  onAnswer: (val: number) => void
  scaleLabels?: [string, string]
}) {
  const [low, high] = scaleLabels ?? ['Not at all like me', 'Very much like me']
  return (
    <div style={{ marginBottom: '24px' }}>
      <p style={{ fontSize: '14px', color: '#CBD5E1', lineHeight: 1.6, marginBottom: '14px' }}>
        {q.text}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          {[1, 2, 3, 4, 5].map(val => {
            const selected = answer === val
            return (
              <button
                key={val}
                onClick={() => onAnswer(val)}
                title={val === 1 ? low : val === 5 ? high : `${val}`}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  border: `1.5px solid ${selected ? '#6366F1' : 'rgba(255,255,255,0.1)'}`,
                  background: selected
                    ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
                    : 'rgba(255,255,255,0.03)',
                  color: selected ? '#fff' : '#64748B',
                  fontSize: '14px',
                  fontWeight: selected ? 700 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.12s',
                  flexShrink: 0,
                }}
              >
                {val}
              </button>
            )
          })}
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 4px',
        }}>
          <span style={{ fontSize: '10px', color: '#475569' }}>{low}</span>
          <span style={{ fontSize: '10px', color: '#475569' }}>{high}</span>
        </div>
      </div>
    </div>
  )
}

function ChoiceQuestion({
  q,
  answer,
  onAnswer,
}: {
  q: QuizQuestion
  answer: number | null
  onAnswer: (idx: number) => void
}) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <p style={{ fontSize: '15px', color: '#E2E8F0', lineHeight: 1.6, marginBottom: '12px' }}>
        {q.text}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {q.options.map((opt, i) => {
          const selected = answer === i
          return (
            <button
              key={i}
              onClick={() => onAnswer(i)}
              style={{
                textAlign: 'left',
                padding: '10px 16px',
                borderRadius: '10px',
                border: `1px solid ${selected ? '#6366F1' : 'rgba(255,255,255,0.08)'}`,
                background: selected
                  ? 'rgba(99,102,241,0.18)'
                  : 'rgba(255,255,255,0.03)',
                color: selected ? '#A5B4FC' : '#94A3B8',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Results screen ───────────────────────────────────────────────────────────

function ResultsScreen({ inferredStats, onApply }: { inferredStats: PersonStats; onApply: () => void }) {
  const statDefs = STAT_DEFINITIONS.filter(d => d.key !== 'luck')

  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '28px', marginBottom: '8px' }}>✓</div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#F1F5F9', margin: 0 }}>
          Your Life Simulation Profile
        </h2>
        <p style={{ fontSize: '13px', color: '#64748B', marginTop: '6px' }}>
          Based on your responses across 40 scientifically-validated questions
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
        {statDefs.map((def, i) => {
          const value = inferredStats[def.key as keyof PersonStats]
          const color = STAT_COLORS[def.key as keyof PersonStats]
          const pct = value

          return (
            <motion.div
              key={def.key}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '13px', color: '#94A3B8' }}>
                  {def.icon} {def.label}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 700, color, fontFamily: 'JetBrains Mono, monospace' }}>
                  {value}
                </span>
              </div>
              <div style={{
                height: '6px',
                borderRadius: '3px',
                background: 'rgba(255,255,255,0.06)',
                overflow: 'hidden',
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: i * 0.07 + 0.1, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                  style={{
                    height: '100%',
                    borderRadius: '3px',
                    background: `linear-gradient(90deg, ${color}99, ${color})`,
                  }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>

      <div style={{
        padding: '10px 14px',
        background: 'rgba(167,139,250,0.08)',
        border: '1px solid rgba(167,139,250,0.2)',
        borderRadius: '10px',
        marginBottom: '20px',
      }}>
        <p style={{ fontSize: '12px', color: '#A78BFA', margin: 0, lineHeight: 1.5 }}>
          🎲 <strong>Luck</strong> stays at your manual setting — it's the one thing no assessment can measure. It represents the uncontrollable circumstances of life.
        </p>
      </div>

      <p style={{ fontSize: '12px', color: '#475569', textAlign: 'center', marginBottom: '16px' }}>
        Sliders will reflect these values. You can still adjust them manually before running.
      </p>

      <button
        onClick={onApply}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '12px',
          border: 'none',
          background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
          color: '#fff',
          fontSize: '15px',
          fontWeight: 700,
          cursor: 'pointer',
          letterSpacing: '0.01em',
        }}
      >
        Apply Profile &amp; Configure Decisions →
      </button>
    </div>
  )
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function QuizModal() {
  const quizOpen   = useSimulatorStore(s => s.quizOpen)
  const closeQuiz  = useSimulatorStore(s => s.closeQuiz)
  const applyStats = useSimulatorStore(s => s.applyQuizStats)
  const luck       = useSimulatorStore(s => s.stats.luck)

  const [sectionIdx, setSectionIdx] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswers>(emptyAnswers)
  const [phase, setPhase] = useState<Phase>('quiz')
  const [inferredStats, setInferredStats] = useState<PersonStats | null>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  // Reset when modal opens
  useEffect(() => {
    if (quizOpen) {
      setSectionIdx(0)
      setAnswers(emptyAnswers())
      setPhase('quiz')
      setInferredStats(null)
    }
  }, [quizOpen])

  const currentSection = SECTION_ORDER[sectionIdx]
  const sectionMeta = QUIZ_SECTIONS[sectionIdx]
  const sectionQuestions = QUESTIONS_BY_SECTION[currentSection]

  const totalAnsweredCount = totalAnswered(answers)
  const sectionAnsweredCount = answeredCount(answers, currentSection)
  const allSectionAnswered = sectionAnsweredCount === sectionQuestions.length
  const isLastSection = sectionIdx === SECTION_ORDER.length - 1

  const setAnswer = useCallback((section: QuizSection, qIdx: number, val: number) => {
    setAnswers(prev => {
      const next = { ...prev, [section]: [...prev[section]] }
      next[section][qIdx] = val
      return next
    })
  }, [])

  const scrollBodyToTop = () => {
    bodyRef.current?.scrollTo({ top: 0, behavior: 'instant' })
  }

  const handleNext = () => {
    if (isLastSection) {
      setPhase('calculating')
      setTimeout(() => {
        const stats = scoreQuiz(answers, luck)
        setInferredStats(stats)
        setPhase('results')
      }, 1600)
    } else {
      setSectionIdx(i => i + 1)
      scrollBodyToTop()
    }
  }

  const handleApply = () => {
    if (inferredStats) {
      applyStats(inferredStats)
    }
  }

  const overallProgress =
    phase === 'results'
      ? 100
      : phase === 'calculating'
        ? 95
        : Math.round((totalAnsweredCount / TOTAL_QUESTIONS) * 90)

  if (!quizOpen) return null

  return (
    <AnimatePresence>
      {quizOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(5,8,16,0.88)',
            backdropFilter: 'blur(12px)',
            padding: '20px',
          }}
          onClick={e => { if (e.target === e.currentTarget) closeQuiz() }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            style={{
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(13,17,23,0.97)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div style={{ padding: '20px 24px 0', flexShrink: 0 }}>
              {/* Progress bar */}
              <div style={{
                height: '3px',
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '2px',
                marginBottom: '16px',
                overflow: 'hidden',
              }}>
                <motion.div
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #6366F1, #A855F7)',
                    borderRadius: '2px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  {phase === 'quiz' && (
                    <>
                      <p style={{ fontSize: '11px', color: '#475569', margin: 0 }}>
                        Section {sectionIdx + 1} of {SECTION_ORDER.length}
                      </p>
                      <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#F1F5F9', margin: '2px 0 0' }}>
                        {sectionMeta.icon} {sectionMeta.title}
                      </h2>
                    </>
                  )}
                  {phase === 'calculating' && (
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#F1F5F9', margin: 0 }}>
                      Analyzing your responses…
                    </h2>
                  )}
                  {phase === 'results' && (
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#F1F5F9', margin: 0 }}>
                      Profile Complete
                    </h2>
                  )}
                </div>
                <button
                  onClick={closeQuiz}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#64748B',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* ── Body ───────────────────────────────────────────────────── */}
            <div ref={bodyRef} style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
              <AnimatePresence mode="wait">
                {phase === 'quiz' && (
                  <motion.div
                    key={`section-${sectionIdx}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.22 }}
                  >
                    <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6, marginBottom: '20px' }}>
                      {sectionMeta.intro}
                    </p>

                    {sectionQuestions.map((q, i) => {
                      const ans = answers[currentSection][i]
                      if (q.type === 'cognitive') {
                        return (
                          <CognitiveQuestion
                            key={q.id}
                            q={q}
                            answer={ans}
                            onAnswer={val => setAnswer(currentSection, i, val)}
                          />
                        )
                      }
                      if (q.type === 'likert') {
                        return (
                          <LikertQuestion
                            key={q.id}
                            q={q}
                            answer={ans}
                            onAnswer={val => setAnswer(currentSection, i, val)}
                            scaleLabels={sectionMeta.scaleLabels}
                          />
                        )
                      }
                      return (
                        <ChoiceQuestion
                          key={q.id}
                          q={q}
                          answer={ans}
                          onAnswer={val => setAnswer(currentSection, i, val)}
                        />
                      )
                    })}
                  </motion.div>
                )}

                {phase === 'calculating' && (
                  <motion.div
                    key="calculating"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '60px 0',
                      gap: '20px',
                    }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        border: '3px solid rgba(99,102,241,0.2)',
                        borderTop: '3px solid #6366F1',
                      }}
                    />
                    <p style={{ fontSize: '15px', color: '#94A3B8' }}>
                      Calculating your profile…
                    </p>
                    <p style={{ fontSize: '12px', color: '#475569', textAlign: 'center', maxWidth: '300px' }}>
                      Applying validated scoring algorithms across 6 psychological dimensions
                    </p>
                  </motion.div>
                )}

                {phase === 'results' && inferredStats && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ResultsScreen inferredStats={inferredStats} onApply={handleApply} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Footer ─────────────────────────────────────────────────── */}
            {phase === 'quiz' && (
              <div style={{
                padding: '16px 24px 20px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}>
                <button
                  onClick={() => { setSectionIdx(i => Math.max(0, i - 1)); scrollBodyToTop() }}
                  disabled={sectionIdx === 0}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.04)',
                    color: sectionIdx === 0 ? '#334155' : '#94A3B8',
                    fontSize: '13px',
                    cursor: sectionIdx === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  ← Back
                </button>

                <span style={{ fontSize: '11px', color: '#475569' }}>
                  {sectionAnsweredCount}/{sectionQuestions.length} answered
                </span>

                <button
                  onClick={handleNext}
                  disabled={!allSectionAnswered}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: allSectionAnswered
                      ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
                      : 'rgba(255,255,255,0.06)',
                    color: allSectionAnswered ? '#fff' : '#334155',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: allSectionAnswered ? 'pointer' : 'not-allowed',
                    transition: 'all 0.15s',
                  }}
                >
                  {isLastSection ? 'Calculate My Profile' : 'Next Section →'}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
