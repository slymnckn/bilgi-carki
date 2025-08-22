"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Crown, Medal, RotateCcw, Home, Sparkles } from "lucide-react"
import type { Team } from "@/app/page"
import { useAudio } from "@/hooks/use-audio"

interface WinnerScreenProps {
  teams: Team[]
  onPlayAgain: () => void
  onBackToMenu: () => void
}

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
  type: "confetti" | "star" | "sparkle"
  rotation: number
  rotationSpeed: number
}

export function WinnerScreen({ teams, onPlayAgain, onBackToMenu }: WinnerScreenProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [showContent, setShowContent] = useState(false)
  const audio = useAudio()

  console.log("[v0] WinnerScreen received teams:", teams)

  // Sort teams by score to determine winner and rankings
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score)
  const winner = sortedTeams[0]
  const hasWinner = winner && winner.score > 0

  console.log("[v0] Sorted teams:", sortedTeams)
  console.log("[v0] Winner:", winner)

  useEffect(() => {
    // Play celebration sound
    if (hasWinner) {
      audio.playCorrectAnswer()
    }

    // Show content with delay for dramatic effect
    const contentTimer = setTimeout(() => setShowContent(true), 500)

    // Create initial burst of particles
    createParticleBurst()

    // Continuous particle generation
    const particleInterval = setInterval(() => {
      createParticleBurst()
    }, 2000)

    // Particle animation loop
    const animationInterval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((particle) => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vy: particle.vy + 0.2, // gravity
            life: particle.life - 1,
            rotation: particle.rotation + particle.rotationSpeed,
          }))
          .filter((particle) => particle.life > 0 && particle.y < window.innerHeight + 50),
      )
    }, 16)

    return () => {
      clearTimeout(contentTimer)
      clearInterval(particleInterval)
      clearInterval(animationInterval)
    }
  }, [hasWinner])

  const createParticleBurst = () => {
    const newParticles: Particle[] = []
    const colors = ["#ea580c", "#f97316", "#fbbf24", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444"]

    // Create confetti burst
    for (let i = 0; i < 30; i++) {
      newParticles.push({
        id: Math.random(),
        x: Math.random() * window.innerWidth,
        y: -20,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * -8 - 2,
        life: 180,
        maxLife: 180,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        type: "confetti",
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
      })
    }

    // Create stars
    for (let i = 0; i < 15; i++) {
      newParticles.push({
        id: Math.random(),
        x: Math.random() * window.innerWidth,
        y: -20,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * -6 - 1,
        life: 240,
        maxLife: 240,
        color: "#fbbf24",
        size: Math.random() * 6 + 3,
        type: "star",
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 5,
      })
    }

    setParticles((prev) => [...prev, ...newParticles])
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-6 w-6 text-yellow-400" />
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 2:
        return <Medal className="h-6 w-6 text-amber-600" />
      default:
        return <Trophy className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return "from-yellow-400 to-yellow-600"
      case 1:
        return "from-gray-300 to-gray-500"
      case 2:
        return "from-amber-500 to-amber-700"
      default:
        return "from-muted-foreground to-muted-foreground"
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(234,88,12,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_70%)]" />
      </div>

      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => {
          const opacity = particle.life / particle.maxLife
          return (
            <div
              key={particle.id}
              className="absolute"
              style={{
                left: particle.x,
                top: particle.y,
                transform: `rotate(${particle.rotation}deg)`,
                opacity,
              }}
            >
              {particle.type === "confetti" && (
                <div
                  className="rounded-sm"
                  style={{
                    width: particle.size,
                    height: particle.size * 0.6,
                    backgroundColor: particle.color,
                  }}
                />
              )}
              {particle.type === "star" && (
                <Sparkles
                  style={{
                    width: particle.size,
                    height: particle.size,
                    color: particle.color,
                  }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Content */}
      <div
        className={`relative z-10 min-h-screen flex flex-col items-center justify-center p-4 transition-all duration-1000 ${showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {/* Winner Announcement */}
        {hasWinner && (
          <div className="text-center mb-4 sm:mb-6 md:mb-8 animate-bounce max-w-full">
            <div className="flex items-center justify-center mb-2 sm:mb-4">
              <Trophy className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 text-yellow-400 animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-2 animate-pulse leading-tight">
              KAZANAN!
            </h1>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-4">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-lg sm:text-2xl md:text-3xl animate-spin flex-shrink-0"
                style={{ backgroundColor: winner.color }}
              >
                {winner.logo}
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-white truncate">{winner.name}</h2>
                <p className="text-base sm:text-lg md:text-2xl text-yellow-400 font-semibold">{winner.score} Puan</p>
              </div>
            </div>
          </div>
        )}

        {/* Final Scoreboard */}
        <Card className="w-full max-w-2xl glassmorphism border-primary/20 mb-4 sm:mb-6 md:mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
              <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-center">Final Skor Tablosu</h3>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {sortedTeams.map((team, index) => (
                <div
                  key={team.id}
                  className={`flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg transition-all duration-300 hover:scale-105 ${
                    index === 0
                      ? "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30"
                      : index === 1
                        ? "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border border-gray-400/30"
                        : index === 2
                          ? "bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30"
                          : "bg-muted/20 border border-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8">{getRankIcon(index)}</div>
                    <div className="text-lg sm:text-2xl font-bold text-muted-foreground">#{index + 1}</div>
                  </div>

                  <div
                    className="w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm sm:text-xl flex-shrink-0"
                    style={{ backgroundColor: team.color }}
                  >
                    {team.logo}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-base sm:text-lg truncate">{team.name}</h4>
                  </div>

                  <div
                    className={`text-xl sm:text-2xl font-bold bg-gradient-to-r ${getRankColor(index)} bg-clip-text text-transparent flex-shrink-0`}
                  >
                    {team.score}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-md">
          <Button
            onClick={onPlayAgain}
            size="lg"
            className="flex-1 h-12 sm:h-14 text-base sm:text-lg font-semibold glassmorphism neon-glow hover:neon-glow-strong transition-all duration-300 hover:scale-105 group"
          >
            <RotateCcw className="mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-180 transition-transform duration-300" />
            Tekrar Oyna
          </Button>

          <Button
            onClick={onBackToMenu}
            variant="outline"
            size="lg"
            className="flex-1 h-12 sm:h-14 text-base sm:text-lg font-semibold glassmorphism border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-300 hover:scale-105 group bg-transparent"
          >
            <Home className="mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
            Ana Menü
          </Button>
        </div>
      </div>
    </div>
  )
}
