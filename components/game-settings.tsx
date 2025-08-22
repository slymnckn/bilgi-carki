"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Users, Clock, Play, Zap, Info, X, Settings } from "lucide-react"
import type { GameConfig } from "@/app/page"

interface GameSettingsProps {
  config: GameConfig
  onConfigChange: (config: GameConfig) => void
  onBack: () => void
  onStartGame: () => void
}

export function GameSettings({ config, onConfigChange, onBack, onStartGame }: GameSettingsProps) {
  const [activePopup, setActivePopup] = useState<string | null>(null)
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const [layoutAnimating, setLayoutAnimating] = useState(false)

  const updateConfig = (updates: Partial<GameConfig>) => {
    onConfigChange({ ...config, ...updates })
  }

  const updateSurpriseSettings = (key: keyof GameConfig["surpriseSettings"], value: boolean) => {
    onConfigChange({
      ...config,
      surpriseSettings: {
        ...config.surpriseSettings,
        [key]: value,
      },
    })
  }

  const toggleAllSurprises = (enabled: boolean) => {
    const newSurpriseSettings = Object.keys(config.surpriseSettings).reduce(
      (acc, key) => ({
        ...acc,
        [key]: enabled,
      }),
      {} as GameConfig["surpriseSettings"],
    )

    onConfigChange({
      ...config,
      surprisesEnabled: enabled,
      surpriseSettings: newSurpriseSettings,
    })
  }

  const handleOptionCountChange = (count: 2 | 3 | 4) => {
    setLayoutAnimating(true)
    updateConfig({ optionCount: count })
    setTimeout(() => setLayoutAnimating(false), 300)
  }

  const getQuestionOptions = (teamCount: number) => {
    const base = teamCount * 6
    return [2, base, base + 4, base + 8, base + 12, base + 20]
  }

  const surprises = [
    { key: "bomb", icon: "💣", name: "Bomba", description: "-50 puan kaybı, kıvılcım efektleri ile" },
    { key: "doublePoints", icon: "✨", name: "Çifte Puan", description: "Bu tur kazanılan puan 2 katına çıkar" },
    { key: "eraser", icon: "🧽", name: "Silgi", description: "Tüm takımların puanları sıfırlanır" },
    { key: "swap", icon: "🔄", name: "Değiş Tokuş", description: "İki rastgele takım puanlarını değiştirir" },
    { key: "gift", icon: "🎁", name: "Hediye", description: "Rastgele takıma rastgele puan hediyesi" },
    { key: "gold", icon: "🏆", name: "Altın", description: "+100 puan kazancı, coin yağmuru efekti" },
    { key: "knight", icon: "⚔️", name: "Şövalye", description: "Rastgele takımdan puan düşürür" },
    { key: "collect", icon: "🧲", name: "Toplayıcı", description: "Son sıradaki takımdan -50 puan" },
    { key: "rocket", icon: "🚀", name: "Roket", description: "Lider takımın puanının +50 fazlası" },
    { key: "steal", icon: "🍓", name: "Çilek", description: "Bir takımdan puan çalıp diğerine verir" },
    { key: "virus", icon: "🦠", name: "Virüs", description: "Tüm takım puanları sıfırlanır" },
  ]

  const activeSurpriseCount = Object.values(config.surpriseSettings).filter(Boolean).length

  const closePopup = () => setActivePopup(null)

  const TeamQuestionPopup = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="glassmorphism border-primary/20 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Takım ve Soru Ayarları
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={closePopup} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Takım Sayısı</Label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
                <Button
                  key={count}
                  variant={config.teamCount === count ? "default" : "outline"}
                  className={`h-10 text-sm transition-all duration-300 hover:scale-105 ${
                    config.teamCount === count
                      ? "neon-glow animate-neon-pulse"
                      : "glassmorphism border-primary/30 hover:border-primary"
                  }`}
                  onClick={() => updateConfig({ teamCount: count })}
                >
                  {count}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Soru Sayısı</Label>
            <div className="grid grid-cols-2 gap-2">
              {getQuestionOptions(config.teamCount).map((count) => (
                <Button
                  key={count}
                  variant={config.questionCount === count ? "default" : "outline"}
                  className={`h-10 text-sm transition-all duration-300 hover:scale-105 ${
                    config.questionCount === count
                      ? "neon-glow animate-neon-pulse"
                      : "glassmorphism border-primary/30 hover:border-primary"
                  }`}
                  onClick={() => updateConfig({ questionCount: count })}
                >
                  {count}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Şık Sayısı</Label>
            <div className={`grid grid-cols-3 gap-2 transition-all duration-300 ${layoutAnimating ? "scale-105" : ""}`}>
              {[2, 3, 4].map((count) => (
                <Button
                  key={count}
                  variant={config.optionCount === count ? "default" : "outline"}
                  className={`h-10 text-sm transition-all duration-300 hover:scale-105 ${
                    config.optionCount === count
                      ? "neon-glow animate-neon-pulse"
                      : "glassmorphism border-primary/30 hover:border-primary"
                  }`}
                  onClick={() => handleOptionCountChange(count as 2 | 3 | 4)}
                >
                  {count} Şık
                </Button>
              ))}
            </div>
            {layoutAnimating && <p className="text-xs text-accent mt-2 animate-pulse">Soru düzeni güncelleniyor...</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const TimeSettingsPopup = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="glassmorphism border-primary/20 w-full max-w-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Süre Ayarları
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={closePopup} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { value: "unlimited", label: "Süresiz", desc: "Zaman sınırı yok" },
            { value: "fixed", label: "60 Saniye Sabit", desc: "Her soru için 60 saniye" },
            { value: "decreasing", label: "60 Saniye Azalan Puan", desc: "Süre azaldıkça puan düşer" },
          ].map((mode) => (
            <Button
              key={mode.value}
              variant={config.timeMode === mode.value ? "default" : "outline"}
              className={`w-full h-12 justify-start transition-all duration-300 hover:scale-105 ${
                config.timeMode === mode.value
                  ? "neon-glow animate-neon-pulse"
                  : "glassmorphism border-primary/30 hover:border-primary"
              }`}
              onClick={() => updateConfig({ timeMode: mode.value as any })}
            >
              <div className="text-left">
                <div className="font-semibold text-sm">{mode.label}</div>
                <div className="text-xs text-muted-foreground">{mode.desc}</div>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )

  const SurpriseSettingsPopup = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="glassmorphism border-primary/20 w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" />
              Sürpriz Ayarları
              <span className="ml-2 text-xs bg-accent/20 px-2 py-1 rounded-full">{activeSurpriseCount}/11</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={closePopup} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Master Toggle */}
          <div className="flex items-center justify-between p-3 glassmorphism rounded-lg border border-accent/30">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-accent" />
              <div>
                <Label className="text-sm font-semibold block">Tüm Sürprizler</Label>
                <p className="text-xs text-muted-foreground">Hepsini aynı anda aç/kapat</p>
              </div>
            </div>
            <Switch
              checked={config.surprisesEnabled && activeSurpriseCount > 0}
              onCheckedChange={toggleAllSurprises}
              className="data-[state=checked]:bg-accent"
            />
          </div>

          {/* Individual Surprise Toggles */}
          {config.surprisesEnabled && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Bireysel Sürpriz Kontrolü</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {surprises.map((surprise) => {
                  const isActive = config.surpriseSettings[surprise.key as keyof typeof config.surpriseSettings]
                  return (
                    <Button
                      key={surprise.key}
                      variant="outline"
                      className={`w-full h-12 justify-start transition-all duration-300 hover:scale-105 ${
                        isActive
                          ? "glassmorphism border-accent neon-glow animate-neon-pulse bg-accent/10"
                          : "glassmorphism border-primary/30 hover:border-primary bg-transparent"
                      }`}
                      onClick={() =>
                        updateSurpriseSettings(surprise.key as keyof typeof config.surpriseSettings, !isActive)
                      }
                    >
                      <span className="text-base mr-2">{surprise.icon}</span>
                      <div className="text-left flex-1">
                        <div className="font-medium text-sm">{surprise.name}</div>
                        <div className="text-xs text-muted-foreground">{surprise.description}</div>
                      </div>
                      {isActive && <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />}
                    </Button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Surprise Statistics */}
          {config.surprisesEnabled && (
            <div className="p-3 glassmorphism rounded-lg border border-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">Sürpriz İstatistikleri</span>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Çarkta %25 sürpriz, %75 puan olasılığı</p>
                <p>• Aktif sürpriz sayısı: {activeSurpriseCount}/11</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="h-screen flex flex-col p-4 overflow-hidden">
      <div className="max-w-4xl mx-auto flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 flex-shrink-0">
          <Button
            onClick={onBack}
            variant="outline"
            size="lg"
            className="h-12 w-12 p-0 glassmorphism border-primary/30 hover:border-primary hover:bg-primary/10 bg-transparent hover:scale-105 transition-all duration-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Oyun Ayarları
            </h1>
            <p className="text-muted-foreground mt-1">Oyununuzu özelleştirin ve başlayın</p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-4xl">
            {/* Team & Question Settings Button */}
            <Button
              onClick={() => setActivePopup("team-question")}
              variant="outline"
              className="h-32 glassmorphism border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-300 hover:scale-105 group"
            >
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                <div className="font-semibold text-lg mb-1">Takım & Soru</div>
                <div className="text-xs text-muted-foreground">
                  {config.teamCount} takım, {config.questionCount} soru
                </div>
              </div>
            </Button>

            {/* Time Settings Button */}
            <Button
              onClick={() => setActivePopup("time")}
              variant="outline"
              className="h-32 glassmorphism border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-300 hover:scale-105 group"
            >
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                <div className="font-semibold text-lg mb-1">Süre Ayarları</div>
                <div className="text-xs text-muted-foreground">
                  {config.timeMode === "unlimited" ? "Süresiz" : "60 saniye"}
                </div>
              </div>
            </Button>

            {/* Surprise Settings Button */}
            <Button
              onClick={() => setActivePopup("surprise")}
              variant="outline"
              className="h-32 glassmorphism border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-300 hover:scale-105 group"
            >
              <div className="text-center">
                <Zap className="h-8 w-8 mx-auto mb-2 text-accent group-hover:scale-110 transition-transform" />
                <div className="font-semibold text-lg mb-1">Sürprizler</div>
                <div className="text-xs text-muted-foreground">{activeSurpriseCount}/11 aktif</div>
              </div>
            </Button>

            {/* Game Summary Button */}
            <div className="h-32 glassmorphism border-accent/30 p-4 flex flex-col justify-center">
              <Settings className="h-8 w-8 mx-auto mb-2 text-accent" />
              <div className="font-semibold text-lg mb-2 text-center">Özet</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center">
                  <div className="text-accent font-semibold">{config.teamCount}</div>
                  <div className="text-muted-foreground">Takım</div>
                </div>
                <div className="text-center">
                  <div className="text-accent font-semibold">{config.questionCount}</div>
                  <div className="text-muted-foreground">Soru</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="flex-shrink-0 pt-6">
          <div className="flex justify-center">
            <Button
              onClick={onStartGame}
              size="lg"
              className="h-14 px-12 text-lg font-bold glassmorphism neon-glow hover:neon-glow-strong transition-all duration-300 hover:scale-110 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 animate-pulse" />
              <div className="relative flex items-center">
                <Play className="mr-3 h-6 w-6 group-hover:scale-125 transition-transform duration-300" />
                OYUNU BAŞLAT
              </div>
            </Button>
          </div>
        </div>
      </div>

      {activePopup === "team-question" && <TeamQuestionPopup />}
      {activePopup === "time" && <TimeSettingsPopup />}
      {activePopup === "surprise" && <SurpriseSettingsPopup />}
    </div>
  )
}
