"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Settings, Play, Trophy, Users } from "lucide-react"
import { GameSettings } from "@/components/game-settings"
import { GameBoard } from "@/components/game-board"
import { WinnerScreen } from "@/components/winner-screen"

export type GameState = "menu" | "settings" | "playing" | "finished"

export interface Team {
  id: number
  name: string
  color: string
  logo: string
  score: number
}

export interface GameConfig {
  teamCount: number
  questionCount: number
  optionCount: 2 | 3 | 4
  timeMode: "unlimited" | "fixed" | "decreasing"
  surprisesEnabled: boolean
  surpriseSettings: {
    bomb: boolean
    doublePoints: boolean
    eraser: boolean
    swap: boolean
    gift: boolean
    gold: boolean
    knight: boolean
    collect: boolean
    rocket: boolean
    steal: boolean
    virus: boolean
  }
}

const defaultConfig: GameConfig = {
  teamCount: 2,
  questionCount: 12,
  optionCount: 4,
  timeMode: "unlimited",
  surprisesEnabled: true,
  surpriseSettings: {
    bomb: true,
    doublePoints: true,
    eraser: true,
    swap: true,
    gift: true,
    gold: true,
    knight: true,
    collect: true,
    rocket: true,
    steal: true,
    virus: true,
  },
}

export default function HomePage() {
  const [gameState, setGameState] = useState<GameState>("menu")
  const [gameConfig, setGameConfig] = useState<GameConfig>(defaultConfig)
  const [teams, setTeams] = useState<Team[]>([])
  const [finalTeams, setFinalTeams] = useState<Team[]>([])

  const handleStartGame = () => {
    // Generate teams based on config
    const generatedTeams = generateTeams(gameConfig.teamCount)
    setTeams(generatedTeams)
    setGameState("playing")
  }

  const handlePlayAgain = () => {
    const generatedTeams = generateTeams(gameConfig.teamCount)
    setTeams(generatedTeams)
    setGameState("playing")
  }

  const handleGameEnd = (updatedTeams: Team[]) => {
    setFinalTeams(updatedTeams)
    setGameState("finished")
  }

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(234,88,12,0.1),transparent_50%)]" />
        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {gameState === "menu" && <MenuScreen onPlay={handleStartGame} onSettings={() => setGameState("settings")} />}

        {gameState === "settings" && (
          <GameSettings
            config={gameConfig}
            onConfigChange={setGameConfig}
            onBack={() => setGameState("menu")}
            onStartGame={handleStartGame}
          />
        )}

        {gameState === "playing" && (
          <GameBoard
            teams={teams}
            config={gameConfig}
            onGameEnd={handleGameEnd}
            onBackToMenu={() => setGameState("menu")}
          />
        )}

        {gameState === "finished" && (
          <WinnerScreen teams={finalTeams} onPlayAgain={handlePlayAgain} onBackToMenu={() => setGameState("menu")} />
        )}
      </div>
    </main>
  )
}

function MenuScreen({ onPlay, onSettings }: { onPlay: () => void; onSettings: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12">
      <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16 animate-float">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-2 sm:mb-3 md:mb-4 leading-tight drop-shadow-2xl">
          BİLGİ ÇARKI
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-muted-foreground px-4 animate-fade-in-up">
          Eğitim ve Eğlencenin Buluştuğu Yer
        </p>
      </div>

      <div
        className="flex flex-col gap-4 sm:gap-5 md:gap-6 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl animate-fade-in-up"
        style={{ animationDelay: "0.2s" }}
      >
        <Button
          onClick={onPlay}
          size="lg"
          className="h-12 sm:h-14 md:h-16 lg:h-18 xl:h-20 text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold glassmorphism neon-glow hover:neon-glow-strong transition-all duration-300 hover:scale-105 active:scale-95 group touch-manipulation shadow-2xl"
        >
          <Play className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 group-hover:scale-110 transition-transform" />
          OYNA
        </Button>

        <Button
          onClick={onSettings}
          variant="outline"
          size="lg"
          className="h-12 sm:h-14 md:h-16 lg:h-18 xl:h-20 text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold glassmorphism border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-300 hover:scale-105 active:scale-95 group bg-transparent touch-manipulation shadow-xl"
        >
          <Settings className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 group-hover:rotate-90 transition-transform duration-300" />
          AYARLAR
        </Button>
      </div>

      <div
        className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-4 sm:left-6 md:left-8 flex items-center gap-2 text-muted-foreground text-xs sm:text-sm md:text-base lg:text-lg animate-fade-in"
        style={{ animationDelay: "0.4s" }}
      >
        <Trophy className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 animate-pulse" />
        <span className="hidden sm:inline">Premium Eğitim Oyunu</span>
        <span className="sm:hidden">Premium</span>
      </div>

      <div
        className="absolute bottom-4 sm:bottom-6 md:bottom-8 right-4 sm:right-6 md:right-8 flex items-center gap-2 text-muted-foreground text-xs sm:text-sm md:text-base lg:text-lg animate-fade-in"
        style={{ animationDelay: "0.6s" }}
      >
        <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 animate-pulse" />
        <span className="hidden sm:inline">1-8 Takım Desteği</span>
        <span className="sm:hidden">1-8 Takım</span>
      </div>
    </div>
  )
}

function generateTeams(count: number): Team[] {
  const teamColors = ["#ea580c", "#f97316", "#0ea5e9", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"]

  const teamLogos = ["🔥", "⚡", "🌟", "💎", "🚀", "⭐", "💫", "🎯"]

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Takım ${i + 1}`,
    color: teamColors[i % teamColors.length],
    logo: teamLogos[i % teamLogos.length],
    score: 0,
  }))
}
