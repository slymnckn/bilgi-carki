"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Crown, Zap } from "lucide-react"
import { useState, useEffect } from "react"
import type { Team } from "@/app/page"

interface ScoreboardProps {
  teams: Team[]
  currentTeamId: number
}

interface AnimatedScoreProps {
  score: number
  previousScore?: number
  isActive: boolean
}

function AnimatedScore({ score, previousScore = 0, isActive }: AnimatedScoreProps) {
  const [displayScore, setDisplayScore] = useState(previousScore)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (score !== displayScore) {
      setIsAnimating(true)

      // Animate score change
      const duration = 800
      const startTime = Date.now()
      const startScore = displayScore
      const scoreChange = score - startScore

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Easing function for smooth animation
        const easeOut = 1 - Math.pow(1 - progress, 3)
        const currentScore = Math.round(startScore + scoreChange * easeOut)

        setDisplayScore(currentScore)

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setIsAnimating(false)
          setDisplayScore(score) // Ensure final score is exactly correct
        }
      }

      requestAnimationFrame(animate)
    }
  }, [score, displayScore]) // Removed previousScore dependency to fix sync issues

  return (
    <>
      <span
        className={`text-2xl sm:text-3xl font-black transition-all duration-500 bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent ${
          isActive
            ? "animate-pulse scale-125 drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]"
            : "drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
        } ${isAnimating ? "animate-bounce scale-150" : ""}`}
        style={{
          textShadow: isActive ? "0 0 20px currentColor, 0 0 40px currentColor" : "0 4px 8px rgba(0,0,0,0.3)",
        }}
      >
        {displayScore}
      </span>
      {isAnimating && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="animate-ping text-2xl sm:text-3xl font-black text-accent/60 drop-shadow-lg">
            {displayScore}
          </div>
        </div>
      )}
    </>
  )
}

export function Scoreboard({ teams, currentTeamId }: ScoreboardProps) {
  const [previousScores, setPreviousScores] = useState<Record<number, number>>({})

  useEffect(() => {
    const newPreviousScores: Record<number, number> = {}
    teams.forEach((team) => {
      newPreviousScores[team.id] = previousScores[team.id] ?? 0
    })

    setPreviousScores(newPreviousScores)
  }, [teams.map((t) => `${t.id}:${t.score}`).join(",")]) // Better dependency tracking

  const sortedTeams = [...teams].sort((a, b) => b.score - a.score)
  const leader = sortedTeams[0]
  const hasScores = teams.some((team) => team.score > 0)

  const getTeamSizing = () => {
    if (teams.length <= 2) {
      return {
        containerSize: "w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24",
        logoSize: "w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10",
        gap: "gap-6 sm:gap-8",
      }
    } else if (teams.length <= 4) {
      return {
        containerSize: "w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20",
        logoSize: "w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8",
        gap: "gap-4 sm:gap-6",
      }
    } else if (teams.length <= 6) {
      return {
        containerSize: "w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16",
        logoSize: "w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6",
        gap: "gap-3 sm:gap-4",
      }
    } else {
      return {
        containerSize: "w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14",
        logoSize: "w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5",
        gap: "gap-2 sm:gap-3",
      }
    }
  }

  const sizing = getTeamSizing()

  return (
    <Card className="scoreboard-target glassmorphism-premium border-primary/30 relative overflow-hidden shadow-2xl">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-accent/30 rounded-full animate-float"
            style={{
              left: `${15 + i * 12}%`,
              top: `${25 + (i % 4) * 18}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${2.5 + i * 0.15}s`,
            }}
          />
        ))}
      </div>

      <CardContent className="p-3 sm:p-4 relative">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-accent animate-pulse" />
          <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Skor Tablosu
          </h2>
        </div>

        <div
          className={`grid place-items-center ${sizing.gap} ${
            teams.length <= 2
              ? "grid-cols-2"
              : teams.length <= 3
                ? "grid-cols-3"
                : teams.length <= 4
                  ? "grid-cols-2 sm:grid-cols-4"
                  : teams.length <= 6
                    ? "grid-cols-2 sm:grid-cols-3"
                    : "grid-cols-2 sm:grid-cols-4"
          }`}
        >
          {teams.map((team, index) => {
            const isCurrentTeam = team.id === currentTeamId
            const isLeader = leader && team.id === leader.id && team.score > 0
            const position = sortedTeams.findIndex((t) => t.id === team.id) + 1

            return (
              <div key={team.id} className="relative flex flex-col items-center group">
                <div className="relative">
                  {/* Outer glow ring */}
                  <div
                    className={`absolute -inset-1 rounded-full transition-all duration-500 ${
                      isCurrentTeam
                        ? "bg-gradient-to-r from-accent/30 via-primary/30 to-accent/30 animate-spin-slow blur-sm"
                        : "bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10"
                    }`}
                  />

                  <div
                    className={`relative ${sizing.containerSize} rounded-full transition-all duration-500 ${
                      isCurrentTeam ? "scale-110 animate-neon-pulse" : "hover:scale-105"
                    }`}
                    style={{
                      background: `conic-gradient(from 0deg, ${team.color}80, ${team.color}40, ${team.color}80)`,
                      boxShadow: isCurrentTeam
                        ? `0 0 25px ${team.color}60, inset 0 0 15px rgba(255,255,255,0.1)`
                        : `0 0 15px ${team.color}30`,
                    }}
                  >
                    {/* Inner border */}
                    <div
                      className="absolute inset-1 rounded-full border-2 transition-all duration-300"
                      style={{
                        borderColor: isCurrentTeam ? team.color : `${team.color}60`,
                        background: `radial-gradient(circle, ${team.color}20, transparent 70%)`,
                      }}
                    />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className={`${sizing.logoSize} rounded-full flex items-center justify-center text-xs font-bold shadow-lg transition-all duration-300 ${
                          isCurrentTeam ? "animate-pulse" : ""
                        }`}
                        style={{
                          backgroundColor: team.color,
                          boxShadow: `0 0 12px ${team.color}80`,
                        }}
                      >
                        {team.logo}
                      </div>
                    </div>

                    {/* Position indicator */}
                    {hasScores && (
                      <div
                        className={`absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center text-xs font-bold border border-background transition-all duration-300 ${
                          position === 1 ? "bg-yellow-500 text-black animate-bounce" : "bg-gray-700 text-white"
                        }`}
                      >
                        {position}
                      </div>
                    )}

                    {/* Current team indicator */}
                    {isCurrentTeam && (
                      <div className="absolute -top-1 -left-1 w-2 h-2 sm:w-3 sm:h-3 bg-accent rounded-full flex items-center justify-center animate-pulse">
                        <Zap className="h-1 w-1 sm:h-1.5 sm:w-1.5 text-background" />
                      </div>
                    )}

                    {/* Leader crown */}
                    {isLeader && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <Crown className="h-2 w-2 sm:h-3 sm:w-3 text-yellow-400 animate-bounce" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-1 sm:mt-2 text-center">
                  <h3
                    className={`font-bold text-xs mb-1 transition-colors duration-300 truncate max-w-[60px] sm:max-w-[80px] ${
                      isCurrentTeam ? "text-accent" : "text-foreground"
                    }`}
                  >
                    {team.name}
                  </h3>

                  <div className={`relative scoreboard-target-team-${team.id}`}>
                    <AnimatedScore
                      score={team.score}
                      previousScore={previousScores[team.id]}
                      isActive={isCurrentTeam}
                    />
                    <div
                      className={`text-xs mt-1 font-medium transition-all duration-300 ${
                        isCurrentTeam
                          ? "text-accent/80 animate-pulse drop-shadow-[0_0_4px_rgba(239,68,68,0.6)]"
                          : "text-muted-foreground/60"
                      }`}
                    >
                      puan
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {hasScores && (
          <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-primary/20">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm text-muted-foreground">
              <span className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 rounded-full bg-primary/10 whitespace-nowrap">
                <Trophy className="h-3 w-3 text-accent flex-shrink-0" />
                <span className="font-medium">Lider:</span>
                <span className="text-accent font-bold truncate max-w-[60px] sm:max-w-none">{leader.name}</span>
              </span>
              <span className="px-2 py-1 rounded-full bg-accent/10 whitespace-nowrap">
                <span className="font-medium">En Yüksek:</span>
                <span className="text-accent font-bold ml-1">{leader.score}</span>
              </span>
              <span className="px-2 py-1 rounded-full bg-primary/10 whitespace-nowrap">
                <span className="font-medium">Toplam:</span>
                <span className="text-primary font-bold ml-1">{teams.reduce((sum, team) => sum + team.score, 0)}</span>
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
