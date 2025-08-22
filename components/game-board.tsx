"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trophy, Users } from "lucide-react"
import type { Team, GameConfig } from "@/app/page"
import { SpinWheel } from "@/components/spin-wheel"
import { QuestionCard } from "@/components/question-card"
import { Scoreboard } from "@/components/scoreboard"
import { SurpriseEffect } from "@/components/surprise-effect"
import { useAudio } from "@/hooks/use-audio"

interface GameBoardProps {
  teams: Team[]
  config: GameConfig
  onGameEnd: (finalTeams: Team[]) => void
  onBackToMenu: () => void
}

export type GamePhase = "wheel" | "question" | "result" | "surprise"

export interface Question {
  id: number
  text: string
  options: string[]
  correctAnswer: number
  points: number
}

interface TeamSurpriseEffects {
  [teamId: number]: {
    doublePoints: boolean
    // Can add other surprise effects here in the future
  }
}

export function GameBoard({ teams, config, onGameEnd, onBackToMenu }: GameBoardProps) {
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0)
  const [gamePhase, setGamePhase] = useState<GamePhase>("wheel")
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [gameTeams, setGameTeams] = useState<Team[]>(teams)
  const [questionsAsked, setQuestionsAsked] = useState(0)
  const [wheelResult, setWheelResult] = useState<{ type: "points" | "surprise"; value: number | string } | null>(null)
  const [currentSurprise, setCurrentSurprise] = useState<string | null>(null)
  const [teamSurpriseEffects, setTeamSurpriseEffects] = useState<TeamSurpriseEffects>({})

  const audio = useAudio()

  const currentTeam = gameTeams[currentTeamIndex]
  const currentTeamHasDoublePoints = teamSurpriseEffects[currentTeam.id]?.doublePoints || false

  const handleWheelSpin = (result: { type: "points" | "surprise"; value: number | string }) => {
    setWheelResult(result)

    if (result.type === "points") {
      const question = generateQuestion(result.value as number, config.optionCount)
      setCurrentQuestion(question)
      setGamePhase("question")
    } else {
      setCurrentSurprise(result.value as string)
      setGamePhase("surprise")
    }
  }

  const handleAnswerSubmit = (selectedAnswer: number) => {
    if (!currentQuestion) return

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer

    if (isCorrect) {
      audio.playCorrectAnswer()

      const basePoints = currentQuestion.points
      const finalPoints = currentTeamHasDoublePoints ? basePoints * 2 : basePoints

      console.log("[v0] Before score update - Current team:", currentTeam.name, "Current score:", currentTeam.score)
      console.log("[v0] Adding points:", finalPoints, "to team:", currentTeam.name)

      setGameTeams((prev) => {
        const updatedTeams = prev.map((team) =>
          team.id === currentTeam.id ? { ...team, score: team.score + finalPoints } : team,
        )
        console.log("[v0] Updated teams after score:", updatedTeams)

        const nextQuestionCount = questionsAsked + 1
        if (nextQuestionCount >= config.questionCount) {
          console.log("[v0] Game ending after score update - Final teams data:", updatedTeams)
          setTimeout(() => {
            onGameEnd(updatedTeams)
          }, 3000) // Wait for the same duration as the result display
          return updatedTeams
        }

        return updatedTeams
      })

      if (currentTeamHasDoublePoints) {
        setTeamSurpriseEffects((prev) => ({
          ...prev,
          [currentTeam.id]: {
            ...prev[currentTeam.id],
            doublePoints: false,
          },
        }))
      }
    } else {
      audio.playWrongAnswer()
    }

    setTimeout(() => {
      if (questionsAsked + 1 < config.questionCount) {
        nextTurn()
      }
    }, 3000)
  }

  const handleSurpriseComplete = () => {
    setCurrentSurprise(null)
    nextTurn()
  }

  const handleDoublePointsActive = (active: boolean) => {
    if (active) {
      setTeamSurpriseEffects((prev) => ({
        ...prev,
        [currentTeam.id]: {
          ...prev[currentTeam.id],
          doublePoints: true,
        },
      }))
    }
  }

  const nextTurn = () => {
    setQuestionsAsked((prev) => prev + 1)

    setCurrentTeamIndex((prev) => (prev + 1) % gameTeams.length)
    setGamePhase("wheel")
    setCurrentQuestion(null)
    setWheelResult(null)
  }

  const handleBackToMenu = () => {
    audio.playButtonClick()
    onBackToMenu()
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-shrink-0 p-2 sm:p-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4 glassmorphism p-2 sm:p-3 rounded-lg border border-primary/20">
          <Button
            onClick={handleBackToMenu}
            variant="outline"
            className="glassmorphism border-primary/30 hover:border-primary bg-transparent hover:scale-105 transition-all duration-300 touch-manipulation h-8 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="hidden sm:inline">Ana Menü</span>
            <span className="sm:hidden">Menü</span>
          </Button>

          <div className="text-center flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Bilgi Çarkı
            </h2>
            <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-accent" />
                <span className="text-muted-foreground">
                  <span className="text-accent font-semibold">{currentTeam.name}</span>
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Trophy className="h-3 w-3 text-accent" />
                <span className="text-muted-foreground">
                  {questionsAsked + 1}/{config.questionCount}
                </span>
              </div>
              {currentTeamHasDoublePoints && (
                <div className="bg-yellow-500/20 px-2 py-1 rounded-full border border-yellow-500/30">
                  <span className="text-yellow-400 text-xs font-bold animate-pulse">✨ ÇİFTE</span>
                </div>
              )}
            </div>
          </div>

          <div className="w-16 sm:w-20" />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="hidden lg:block w-80 xl:w-96 flex-shrink-0 p-3">
          <div className="h-full">
            <Scoreboard teams={gameTeams} currentTeamId={currentTeam.id} />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-3xl">
            {gamePhase === "wheel" && (
              <div className="flex justify-center">
                <SpinWheel onSpin={handleWheelSpin} surprisesEnabled={config.surprisesEnabled} />
              </div>
            )}

            {gamePhase === "question" && currentQuestion && (
              <div className="flex justify-center">
                <div className="w-full max-w-2xl">
                  <QuestionCard
                    question={currentQuestion}
                    onAnswer={handleAnswerSubmit}
                    timeMode={config.timeMode}
                    doublePointsActive={currentTeamHasDoublePoints}
                    currentTeamId={currentTeam.id}
                  />
                </div>
              </div>
            )}

            {gamePhase === "surprise" && currentSurprise && (
              <div className="flex justify-center">
                <div className="w-full max-w-2xl">
                  <SurpriseEffect
                    surpriseType={currentSurprise}
                    teams={gameTeams}
                    currentTeamId={currentTeam.id}
                    onComplete={handleSurpriseComplete}
                    onTeamsUpdate={setGameTeams}
                    onDoublePointsActive={handleDoublePointsActive}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="lg:hidden flex-shrink-0 p-2">
        <div className="max-h-32 overflow-y-auto">
          <Scoreboard teams={gameTeams} currentTeamId={currentTeam.id} />
        </div>
      </div>
    </div>
  )
}

function generateQuestion(points: number, optionCount: number): Question {
  const questionBank = [
    {
      text: "Türkiye'nin başkenti neresidir?",
      options: ["İstanbul", "Ankara", "İzmir", "Bursa"],
      correctAnswer: 1,
    },
    {
      text: "Dünyanın en büyük okyanusu hangisidir?",
      options: ["Atlantik", "Pasifik", "Hint", "Arktik"],
      correctAnswer: 1,
    },
    {
      text: "Işık hızı saniyede kaç kilometre?",
      options: ["300.000 km", "150.000 km", "450.000 km", "600.000 km"],
      correctAnswer: 0,
    },
    {
      text: "Hangi gezegen Güneş'e en yakındır?",
      options: ["Venüs", "Merkür", "Mars", "Dünya"],
      correctAnswer: 1,
    },
    {
      text: "DNA'nın açılımı nedir?",
      options: ["Deoksiribonükleik Asit", "Dinamik Nükleer Asit", "Doğal Nükleer Asit", "Derinlik Nükleer Asit"],
      correctAnswer: 0,
    },
    {
      text: "Hangi element periyodik tabloda 'Au' sembolü ile gösterilir?",
      options: ["Gümüş", "Altın", "Alüminyum", "Argon"],
      correctAnswer: 1,
    },
    {
      text: "Dünya'nın en yüksek dağı hangisidir?",
      options: ["K2", "Everest", "Kangchenjunga", "Annapurna"],
      correctAnswer: 1,
    },
    {
      text: "Hangi yıl İstanbul'un fethi gerçekleşmiştir?",
      options: ["1453", "1451", "1455", "1449"],
      correctAnswer: 0,
    },
    {
      text: "Fotosintez hangi organellerde gerçekleşir?",
      options: ["Mitokondri", "Kloroplast", "Ribozom", "Çekirdek"],
      correctAnswer: 1,
    },
    {
      text: "Hangi gezegen 'Kırmızı Gezegen' olarak bilinir?",
      options: ["Venüs", "Mars", "Jüpiter", "Satürn"],
      correctAnswer: 1,
    },
  ]

  const randomQuestion = questionBank[Math.floor(Math.random() * questionBank.length)]

  return {
    id: Math.random(),
    text: randomQuestion.text,
    options: randomQuestion.options.slice(0, optionCount),
    correctAnswer: randomQuestion.correctAnswer < optionCount ? randomQuestion.correctAnswer : 0,
    points,
  }
}
