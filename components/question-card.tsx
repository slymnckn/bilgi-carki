"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Clock, CheckCircle, XCircle, Sparkles } from "lucide-react"
import type { Question } from "@/components/game-board"
import { useAudio } from "@/hooks/use-audio"

interface QuestionCardProps {
  question: Question
  onAnswer: (selectedAnswer: number) => void
  timeMode: "unlimited" | "fixed" | "decreasing"
  doublePointsActive?: boolean
  onPointsFlow?: (points: number) => void
  currentTeamId?: number // Added currentTeamId prop to target specific team
}

interface FloatingPoint {
  id: number
  x: number
  y: number
  targetX: number
  targetY: number
  value: string
  progress: number
  rotation: number
  scale: number
  opacity: number
  trail: Array<{ x: number; y: number; opacity: number }>
  type: "digit" | "sparkle" | "glow"
}

export function QuestionCard({
  question,
  onAnswer,
  timeMode,
  doublePointsActive,
  onPointsFlow,
  currentTeamId,
}: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(60)
  const [answered, setAnswered] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; y: number; color: string; delay: number }>>(
    [],
  )
  const [screenShake, setScreenShake] = useState(false)
  const [cardFlipped, setCardFlipped] = useState(false)
  const [floatingPoints, setFloatingPoints] = useState<FloatingPoint[]>([])
  const [showWrongPopup, setShowWrongPopup] = useState(false)
  const audio = useAudio()

  useEffect(() => {
    setTimeout(() => setCardFlipped(true), 100)
  }, [])

  useEffect(() => {
    if (timeMode === "unlimited") return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          if (!answered) {
            handleAnswer(-1)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeMode, answered])

  const generateConfetti = () => {
    const screenWidth = typeof window !== "undefined" ? window.innerWidth : 1200
    const newConfetti = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * screenWidth,
      y: -10,
      color: ["#ea580c", "#f97316", "#fbbf24", "#10b981", "#3b82f6"][Math.floor(Math.random() * 5)],
      delay: Math.random() * 0.5,
    }))
    setConfetti(newConfetti)

    setTimeout(() => setConfetti([]), 3000)
  }

  const createPointFlow = () => {
    const points = getPointsForTime()

    console.log("[v0] Creating point flow animation for team:", currentTeamId)

    const sourceElement = document.querySelector(".points-source")
    console.log("[v0] Source element found:", !!sourceElement)

    // Try multiple target selectors to ensure we find the target
    let targetElement = null
    if (currentTeamId) {
      targetElement = document.querySelector(`.scoreboard-target-team-${currentTeamId}`)
      console.log("[v0] Team-specific target found:", !!targetElement, `for team ${currentTeamId}`)
    }

    // Fallback to general scoreboard target if team-specific not found
    if (!targetElement) {
      targetElement = document.querySelector(".scoreboard-target")
      console.log("[v0] General target found:", !!targetElement)
    }

    // Additional fallback - try to find any scoreboard element
    if (!targetElement) {
      targetElement = document.querySelector("[class*='scoreboard']")
      console.log("[v0] Fallback scoreboard element found:", !!targetElement)
    }

    if (!sourceElement || !targetElement) {
      console.log("[v0] Point flow animation failed - missing elements:", {
        source: !!sourceElement,
        target: !!targetElement,
        currentTeamId,
      })
      return
    }

    console.log("[v0] Starting point flow animation")

    const sourceRect = sourceElement.getBoundingClientRect()
    const targetRect = targetElement.getBoundingClientRect()

    const pointElement = document.createElement("div")
    pointElement.textContent = `+${points}`
    pointElement.className = "fixed z-50 pointer-events-none text-4xl font-black text-accent"
    pointElement.style.cssText = `
      left: ${sourceRect.left + sourceRect.width / 2}px;
      top: ${sourceRect.top + sourceRect.height / 2}px;
      transform: translate(-50%, -50%) scale(1.5);
      opacity: 1;
      filter: drop-shadow(0 0 20px rgba(var(--accent), 1)) brightness(1.5);
      text-shadow: 0 0 20px rgba(var(--accent), 1), 0 0 40px rgba(var(--accent), 0.8);
      transition: all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      will-change: transform, opacity;
    `

    document.body.appendChild(pointElement)

    setTimeout(() => {
      requestAnimationFrame(() => {
        pointElement.style.left = `${targetRect.left + targetRect.width / 2}px`
        pointElement.style.top = `${targetRect.top + targetRect.height / 2}px`
        pointElement.style.transform = "translate(-50%, -50%) scale(0.8)"
        pointElement.style.opacity = "0"
        console.log("[v0] Point flow animation started")
      })
    }, 50)

    setTimeout(() => {
      if (document.body.contains(pointElement)) {
        document.body.removeChild(pointElement)
        console.log("[v0] Point flow animation completed")
      }
    }, 1300)
  }

  const triggerScreenShake = () => {
    setScreenShake(true)
    setTimeout(() => setScreenShake(false), 500)
  }

  const handleAnswer = (answerIndex: number) => {
    if (answered) return

    setSelectedAnswer(answerIndex)
    setAnswered(true)

    setTimeout(() => {
      setShowResult(true)
      const isCorrect = answerIndex === question.correctAnswer

      if (isCorrect) {
        audio.playCorrectAnswer()
        generateConfetti()
        triggerScreenShake()
        onPointsFlow?.(getPointsForTime())
        setTimeout(() => {
          createPointFlow()
        }, 100)
      } else {
        audio.playWrongAnswer()
        triggerScreenShake()
        setShowWrongPopup(true)
        setTimeout(() => setShowWrongPopup(false), 2000)
      }

      setTimeout(
        () => {
          onAnswer(answerIndex)
        },
        isCorrect ? 3000 : 2000,
      )
    }, 500)
  }

  const getPointsForTime = () => {
    const basePoints =
      timeMode !== "decreasing" ? question.points : Math.max(1, Math.floor(question.points * (timeLeft / 60)))
    return doublePointsActive ? basePoints * 2 : basePoints
  }

  const isCorrect = selectedAnswer === question.correctAnswer
  const isWrong = answered && selectedAnswer !== question.correctAnswer && selectedAnswer !== -1

  return (
    <>
      {confetti.map((particle) => (
        <div
          key={particle.id}
          className="fixed w-2 h-2 rounded-full animate-bounce z-50 pointer-events-none"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
            animationDuration: "3s",
            animationTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        />
      ))}

      {floatingPoints.map((particle) => {
        const currentX = particle.x + (particle.targetX - particle.x) * particle.progress
        const currentY =
          particle.y + (particle.targetY - particle.y) * particle.progress - Math.sin(particle.progress * Math.PI) * 15

        return (
          <div
            key={particle.id}
            className={`fixed z-50 pointer-events-none transition-all duration-75 ${
              particle.type === "digit" ? "text-3xl font-black text-accent" : "text-xl text-yellow-400"
            }`}
            style={{
              left: `${currentX}px`,
              top: `${currentY}px`,
              transform: `translate(-50%, -50%) scale(${particle.scale}) rotate(${particle.rotation}deg)`,
              opacity: particle.opacity,
              filter:
                particle.type === "digit"
                  ? `drop-shadow(0 0 12px rgba(var(--accent), 0.9)) brightness(1.3)`
                  : "drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))",
              textShadow:
                particle.type === "digit"
                  ? "0 0 15px rgba(var(--accent), 0.9), 0 0 30px rgba(var(--accent), 0.5)"
                  : "0 0 10px rgba(255, 215, 0, 0.8)",
            }}
          >
            {particle.value}
          </div>
        )
      })}

      {showWrongPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-destructive/90 backdrop-blur-xl border-2 border-destructive rounded-2xl p-8 animate-scale-bounce shadow-2xl">
            <div className="flex items-center justify-center gap-4">
              <XCircle className="h-12 w-12 text-white animate-pulse" />
              <span className="text-3xl font-black text-white">YANLIŞ CEVAP!</span>
            </div>
          </div>
        </div>
      )}

      <div className={`w-full ${screenShake ? "animate-pulse" : ""}`}>
        <Card
          className={`glassmorphism-premium border-primary/30 transition-all duration-500 ${
            cardFlipped ? "opacity-100 scale-100" : "opacity-0 scale-95"
          } ${
            showResult
              ? isCorrect
                ? "border-green-500 neon-glow-strong bg-green-500/10"
                : "border-destructive bg-destructive/10"
              : ""
          } ${doublePointsActive ? "border-yellow-500/50 bg-yellow-500/5" : ""} bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-xl`}
          style={{
            transform: cardFlipped ? "rotateY(0deg)" : "rotateY(-90deg)",
            transformStyle: "preserve-3d",
          }}
        >
          <CardHeader className="text-center p-3 sm:p-4 border-b border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {doublePointsActive && <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />}
                <span className="points-source text-lg sm:text-xl font-bold text-primary">
                  {getPointsForTime()} PUAN
                  {doublePointsActive && <span className="text-yellow-400 text-sm ml-1">(2x)</span>}
                </span>
              </div>

              {timeMode !== "unlimited" && (
                <div className="flex items-center gap-2">
                  <Clock className={`h-4 w-4 ${timeLeft <= 10 ? "text-destructive animate-bounce" : "text-accent"}`} />
                  <span
                    className={`text-lg font-bold transition-all duration-300 ${
                      timeLeft <= 10
                        ? "text-destructive animate-pulse scale-110"
                        : timeLeft <= 30
                          ? "text-yellow-500"
                          : "text-accent"
                    }`}
                  >
                    {timeLeft}s
                  </span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-4 sm:p-6 rounded-xl border-2 border-primary/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse" />
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-center relative z-10 leading-relaxed text-foreground">
                {question.text}
              </h3>
            </div>

            <div
              className={`grid gap-3 transition-all duration-300 ${
                question.options.length === 2
                  ? "grid-cols-1 sm:grid-cols-2"
                  : question.options.length === 3
                    ? "grid-cols-1 sm:grid-cols-3"
                    : "grid-cols-1 sm:grid-cols-2"
              }`}
            >
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === index
                const isCorrectOption = index === question.correctAnswer
                const shouldHighlight = answered && (isSelected || isCorrectOption)

                return (
                  <Button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={answered}
                    variant="outline"
                    className={`h-14 sm:h-16 text-sm sm:text-base font-medium transition-all duration-300 hover:scale-105 relative overflow-hidden group touch-manipulation ${
                      shouldHighlight
                        ? isCorrectOption
                          ? "border-green-500 bg-green-500/20 neon-glow text-green-100"
                          : isSelected && !isCorrectOption
                            ? "border-destructive bg-destructive/20 text-destructive-foreground"
                            : "glassmorphism-premium border-primary/30"
                        : "glassmorphism-premium border-primary/30 hover:border-primary hover:bg-primary/10 hover:neon-glow hover:text-white"
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

                    <div className="relative z-10 flex items-center w-full px-3">
                      <div
                        className={`mr-3 font-black text-xl flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                          shouldHighlight && isCorrectOption
                            ? "bg-green-500 text-white"
                            : shouldHighlight && isSelected && !isCorrectOption
                              ? "bg-destructive text-white"
                              : "bg-primary/20 text-accent group-hover:bg-primary group-hover:text-white"
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="flex-1 text-left leading-tight font-medium group-hover:text-white transition-colors duration-300">
                        {option}
                      </span>
                      <div className="flex-shrink-0 ml-2">
                        {showResult && isCorrectOption && (
                          <CheckCircle className="h-5 w-5 text-green-500 animate-bounce" />
                        )}
                        {showResult && isSelected && !isCorrectOption && (
                          <XCircle className="h-5 w-5 text-destructive animate-pulse" />
                        )}
                      </div>
                    </div>
                  </Button>
                )
              })}
            </div>

            {showResult && !isCorrect && (
              <div className="text-center p-4 sm:p-6 rounded-xl border-2 animate-scale-bounce bg-destructive/10 border-destructive/50">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <XCircle className="h-8 w-8 text-destructive animate-pulse" />
                  <span className="text-2xl sm:text-3xl font-black text-destructive">YANLIŞ!</span>
                </div>
                <div className="text-base sm:text-lg">
                  <span className="text-muted-foreground">Doğru cevap: </span>
                  <div className="bg-primary/20 px-4 py-2 rounded-full inline-block mt-2">
                    <span className="text-accent font-bold">{question.options[question.correctAnswer]}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
