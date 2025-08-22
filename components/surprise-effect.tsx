"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, RotateCcw, Coins, Sparkles, Bomb, Shield, Gift, Rocket, Cherry, Bug } from "lucide-react"
import type { Team } from "@/app/page"
import { useAudio } from "@/hooks/use-audio"

interface SurpriseEffectProps {
  surpriseType: string
  teams: Team[]
  currentTeamId: number
  onComplete: () => void
  onTeamsUpdate: (teams: Team[]) => void
  onDoublePointsActive?: (active: boolean) => void
}

export function SurpriseEffect({
  surpriseType,
  teams,
  currentTeamId,
  onComplete,
  onTeamsUpdate,
  onDoublePointsActive,
}: SurpriseEffectProps) {
  const [effectActive, setEffectActive] = useState(false)
  const [effectDescription, setEffectDescription] = useState("")
  const [specialParticles, setSpecialParticles] = useState<
    Array<{ id: number; x: number; y: number; type: string; delay: number }>
  >([])

  const audio = useAudio()

  const surpriseData = {
    bomb: { icon: "💣", name: "Bomba", color: "text-red-500", bgColor: "bg-red-500/20", lucideIcon: Bomb },
    doublePoints: {
      icon: "✨",
      name: "Çifte Puan",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/20",
      lucideIcon: Sparkles,
    },
    eraser: { icon: "🧽", name: "Silgi", color: "text-blue-500", bgColor: "bg-blue-500/20", lucideIcon: RotateCcw },
    swap: {
      icon: "🔄",
      name: "Değiş Tokuş",
      color: "text-purple-500",
      bgColor: "bg-purple-500/20",
      lucideIcon: RotateCcw,
    },
    gift: { icon: "🎁", name: "Hediye", color: "text-green-500", bgColor: "bg-green-500/20", lucideIcon: Gift },
    gold: { icon: "🏆", name: "Altın", color: "text-yellow-400", bgColor: "bg-yellow-400/20", lucideIcon: Coins },
    knight: { icon: "⚔️", name: "Şövalye", color: "text-gray-400", bgColor: "bg-gray-400/20", lucideIcon: Shield },
    collect: { icon: "🧲", name: "Toplayıcı", color: "text-indigo-500", bgColor: "bg-indigo-500/20", lucideIcon: Zap },
    rocket: { icon: "🚀", name: "Roket", color: "text-blue-400", bgColor: "bg-blue-400/20", lucideIcon: Rocket },
    steal: { icon: "🍓", name: "Çilek", color: "text-pink-500", bgColor: "bg-pink-500/20", lucideIcon: Cherry },
    virus: { icon: "🦠", name: "Virüs", color: "text-green-600", bgColor: "bg-green-600/20", lucideIcon: Bug },
  }

  const currentSurprise = surpriseData[surpriseType as keyof typeof surpriseData]

  useEffect(() => {
    if (!currentSurprise) {
      console.error(`Unknown surprise type: ${surpriseType}`)
      // Return early with a default surprise effect
      setTimeout(() => {
        onComplete()
      }, 1000)
      return
    }

    setEffectActive(true)
    applySurpriseEffect()
  }, [])

  const generateSpecialParticles = (type: string, count = 30) => {
    const particles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      type,
      delay: Math.random() * 1,
    }))
    setSpecialParticles(particles)
    setTimeout(() => setSpecialParticles([]), 4000)
  }

  const applySurpriseEffect = () => {
    let newTeams = [...teams]
    let description = ""
    const currentTeamIndex = newTeams.findIndex((team) => team.id === currentTeamId)

    switch (surpriseType) {
      case "bomb":
        audio.playSurpriseEffect("bomb")
        if (currentTeamIndex !== -1) {
          newTeams[currentTeamIndex].score = Math.max(0, newTeams[currentTeamIndex].score - 50)
          description = `💥 Bomba patladı! ${newTeams[currentTeamIndex].name} takımı -50 puan kaybetti!`
          generateSpecialParticles("spark", 40)
        }
        break

      case "doublePoints":
        audio.playSurpriseEffect("default")
        description = "✨ Çifte puan aktif! Bir sonraki doğru cevap 2 katına çıkacak!"
        onDoublePointsActive?.(true)
        generateSpecialParticles("star", 25)
        break

      case "eraser":
        audio.playSurpriseEffect("default")
        newTeams = newTeams.map((team) => ({ ...team, score: 0 }))
        description = "🧽 Silgi kullanıldı! Tüm takım puanları sıfırlandı!"
        generateSpecialParticles("eraser", 20)
        break

      case "swap":
        audio.playSurpriseEffect("default")
        if (newTeams.length >= 2) {
          const team1 = Math.floor(Math.random() * newTeams.length)
          let team2 = Math.floor(Math.random() * newTeams.length)
          while (team2 === team1 && newTeams.length > 1) {
            team2 = Math.floor(Math.random() * newTeams.length)
          }

          const temp = newTeams[team1].score
          newTeams[team1].score = newTeams[team2].score
          newTeams[team2].score = temp
          description = `🔄 ${newTeams[team1].name} ve ${newTeams[team2].name} puanları değişti!`
          generateSpecialParticles("swap", 15)
        }
        break

      case "gift":
        audio.playSurpriseEffect("default")
        const randomTeam = Math.floor(Math.random() * newTeams.length)
        const randomPoints = [25, 50, 75, 100][Math.floor(Math.random() * 4)]
        newTeams[randomTeam].score += randomPoints
        description = `🎁 ${newTeams[randomTeam].name} takımına +${randomPoints} puan hediyesi!`
        generateSpecialParticles("gift", 20)
        break

      case "gold":
        audio.playSurpriseEffect("gold")
        if (currentTeamIndex !== -1) {
          newTeams[currentTeamIndex].score += 100
          description = `🏆 Altın bulundu! ${newTeams[currentTeamIndex].name} takımı +100 puan kazandı!`
          generateSpecialParticles("coin", 50)
        }
        break

      case "knight":
        audio.playSurpriseEffect("default")
        const targetTeam = Math.floor(Math.random() * newTeams.length)
        const pointsToSubtract = Math.min(50, newTeams[targetTeam].score)
        newTeams[targetTeam].score = Math.max(0, newTeams[targetTeam].score - pointsToSubtract)
        description = `⚔️ Şövalye saldırdı! ${newTeams[targetTeam].name} takımından -${pointsToSubtract} puan!`
        generateSpecialParticles("sword", 15)
        break

      case "collect":
        audio.playSurpriseEffect("default")
        const sortedTeams = [...newTeams].sort((a, b) => a.score - b.score)
        const lastTeam = sortedTeams[0]
        const lastTeamIndex = newTeams.findIndex((team) => team.id === lastTeam.id)
        if (lastTeamIndex !== -1 && lastTeam.score > 0) {
          const pointsToTake = Math.min(50, lastTeam.score)
          newTeams[lastTeamIndex].score = Math.max(0, newTeams[lastTeamIndex].score - pointsToTake)
          description = `🧲 Toplayıcı çalıştı! ${lastTeam.name} takımından -${pointsToTake} puan toplandı!`
        } else {
          description = "🧲 Toplayıcı çalıştı ama toplanacak puan bulunamadı!"
        }
        generateSpecialParticles("magnet", 20)
        break

      case "rocket":
        audio.playSurpriseEffect("rocket")
        const leaderTeam = [...newTeams].sort((a, b) => b.score - a.score)[0]
        const leaderIndex = newTeams.findIndex((team) => team.id === leaderTeam.id)
        if (leaderIndex !== -1) {
          newTeams[leaderIndex].score += 50
          description = `🚀 Roket fırlatıldı! Lider ${leaderTeam.name} takımı +50 puan daha aldı!`
          generateSpecialParticles("rocket", 25)
        }
        break

      case "steal":
        audio.playSurpriseEffect("default")
        if (newTeams.length >= 2) {
          const fromTeam = Math.floor(Math.random() * newTeams.length)
          let toTeam = Math.floor(Math.random() * newTeams.length)
          while (toTeam === fromTeam && newTeams.length > 1) {
            toTeam = Math.floor(Math.random() * newTeams.length)
          }

          const pointsToSteal = Math.min(30, newTeams[fromTeam].score)
          newTeams[fromTeam].score = Math.max(0, newTeams[fromTeam].score - pointsToSteal)
          newTeams[toTeam].score += pointsToSteal

          description = `🍓 Çilek çaldı! ${newTeams[fromTeam].name} takımından ${pointsToSteal} puan çalınıp ${newTeams[toTeam].name} takımına verildi!`
          generateSpecialParticles("steal", 30)
        }
        break

      case "virus":
        audio.playSurpriseEffect("default")
        newTeams = newTeams.map((team) => ({ ...team, score: 0 }))
        description = "🦠 Virüs yayıldı! Tüm takım puanları enfekte oldu ve sıfırlandı!"
        generateSpecialParticles("virus", 35)
        break

      default:
        audio.playSurpriseEffect("default")
        description = `${currentSurprise?.icon} ${currentSurprise?.name} efekti uygulandı!`
        generateSpecialParticles("default", 15)
    }

    setEffectDescription(description)
    onTeamsUpdate(newTeams)

    setTimeout(() => {
      onComplete()
    }, 4000)
  }

  const getParticleStyle = (particle: { type: string; x: number; y: number; delay: number }) => {
    const baseStyle = {
      left: `${particle.x}px`,
      top: `${particle.y}px`,
      animationDelay: `${particle.delay}s`,
    }

    switch (particle.type) {
      case "spark":
        return { ...baseStyle, backgroundColor: "#ff4444", animationDuration: "0.8s" }
      case "coin":
        return { ...baseStyle, backgroundColor: "#ffd700", animationDuration: "2s" }
      case "star":
        return { ...baseStyle, backgroundColor: "#ffeb3b", animationDuration: "1.5s" }
      case "gift":
        return { ...baseStyle, backgroundColor: "#4caf50", animationDuration: "1.2s" }
      case "rocket":
        return { ...baseStyle, backgroundColor: "#2196f3", animationDuration: "1s" }
      case "virus":
        return { ...baseStyle, backgroundColor: "#8bc34a", animationDuration: "2s" }
      default:
        return { ...baseStyle, backgroundColor: "#f97316", animationDuration: "1s" }
    }
  }

  if (!currentSurprise) {
    return (
      <Card className="glassmorphism border-accent/20 p-8 text-center">
        <CardContent>
          <p className="text-lg">Bilinmeyen sürpriz efekti: {surpriseType}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Special particle effects */}
      {specialParticles.map((particle) => (
        <div
          key={particle.id}
          className="fixed w-3 h-3 rounded-full animate-ping z-50 pointer-events-none"
          style={getParticleStyle(particle)}
        />
      ))}

      <Card
        className={`glassmorphism border-accent/20 p-8 text-center relative overflow-hidden ${currentSurprise?.bgColor}`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-primary/10 to-accent/10 animate-pulse" />

        {/* Background particle effects */}
        {effectActive &&
          Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 rounded-full animate-bounce ${currentSurprise?.color?.replace("text-", "bg-")}`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: "1.5s",
              }}
            />
          ))}

        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-3">
            {currentSurprise.lucideIcon && (
              <currentSurprise.lucideIcon className="h-8 w-8 text-accent animate-bounce" />
            )}
            <span className="text-3xl font-bold text-accent animate-pulse">SÜRPRİZ!</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="relative z-10 space-y-6">
          <div className="mb-6">
            <div
              className={`text-8xl mb-4 animate-bounce ${currentSurprise?.color} drop-shadow-lg`}
              style={{ filter: "drop-shadow(0 0 20px currentColor)" }}
            >
              {currentSurprise?.icon}
            </div>
            <h3 className={`text-3xl font-bold mb-2 ${currentSurprise?.color} animate-pulse`}>
              {currentSurprise?.name}
            </h3>
          </div>

          <div className="p-6 glassmorphism rounded-lg border border-accent/30 mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent animate-pulse" />
            <p className="text-lg font-medium relative z-10">{effectDescription}</p>
          </div>

          {/* Effect-specific visual elements */}
          {surpriseType === "gold" && (
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-4 h-4 bg-yellow-400 rounded-full animate-bounce opacity-70"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: "2s",
                  }}
                />
              ))}
            </div>
          )}

          {surpriseType === "bomb" && (
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 15 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-8 bg-red-500 animate-ping opacity-60"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 1}s`,
                    transform: `rotate(${Math.random() * 360}deg)`,
                  }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
