"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import { useAudio } from "@/hooks/use-audio"

interface SpinWheelProps {
  onSpin: (result: { type: "points" | "surprise"; value: number | string }) => void
  surprisesEnabled: boolean
}

type Seg = {
  start: number
  end: number
  label: string
  kind: "puan" | "surpriz"
  value?: number
  key?: string
  color: string
}

const SEGMENTS: Seg[] = [
  { start: 270, end: 306, label: "10 PUAN", kind: "puan", value: 10, color: "#FF6B35" },
  { start: 306, end: 342, label: "20 PUAN", kind: "puan", value: 20, color: "#F7931E" },
  { start: 342, end: 18, label: "SÜRPRİZ", kind: "surpriz", key: "random", color: "#8B5CF6" },
  { start: 18, end: 54, label: "30 PUAN", kind: "puan", value: 30, color: "#FFD23F" },
  { start: 54, end: 90, label: "50 PUAN", kind: "puan", value: 50, color: "#06FFA5" },
  { start: 90, end: 126, label: "70 PUAN", kind: "puan", value: 70, color: "#4ECDC4" },
  { start: 126, end: 162, label: "100 PUAN", kind: "puan", value: 100, color: "#9B59B6" },
  { start: 162, end: 198, label: "20 PUAN", kind: "puan", value: 20, color: "#F7931E" },
  { start: 198, end: 234, label: "10 PUAN", kind: "puan", value: 10, color: "#FF6B35" },
  { start: 234, end: 270, label: "SÜRPRİZ", kind: "surpriz", key: "random", color: "#8B5CF6" },
]

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
  type: "spark" | "trail" | "glow" | "star"
  rotation: number
  rotationSpeed: number
  scale: number
  opacity: number
}

export function SpinWheel({ onSpin, surprisesEnabled }: SpinWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  const resizeObserverRef = useRef<ResizeObserver>()
  const spinTimeoutRef = useRef<NodeJS.Timeout>()
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [velocity, setVelocity] = useState(0)
  const [showResultPopup, setShowResultPopup] = useState(false)
  const [resultData, setResultData] = useState<{
    type: "points" | "surprise"
    value: number | string
    label?: string
    icon?: string
  } | null>(null)
  const [particles, setParticles] = useState<Particle[]>([])
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 400 })
  const [debugInfo, setDebugInfo] = useState<string>("")
  const audio = useAudio()

  const allSurprises = [
    { key: "doublePoints", name: "Çifte Puan", weight: 3, icon: "⚡" },
    { key: "gift", name: "Hediye", weight: 3, icon: "🎁" },
    { key: "gold", name: "Altın", weight: 2, icon: "💰" },
    { key: "rocket", name: "Roket", weight: 2, icon: "🚀" },
    { key: "swap", name: "Değiş Tokuş", weight: 2, icon: "🔄" },
    { key: "steal", name: "Çilek", weight: 2, icon: "🍓" },
    { key: "knight", name: "Şövalye", weight: 2, icon: "⚔️" },
    { key: "collect", name: "Toplayıcı", weight: 2, icon: "🧲" },
    { key: "bomb", name: "Bomba", weight: 1, icon: "💣" },
    { key: "eraser", name: "Silgi", weight: 1, icon: "🧽" },
    { key: "virus", name: "Virüs", weight: 1, icon: "🦠" },
  ]

  const selectRandomSurprise = (surprises: typeof allSurprises) => {
    const totalWeight = surprises.reduce((sum, s) => sum + s.weight, 0)
    let random = Math.random() * totalWeight

    for (const surprise of surprises) {
      random -= surprise.weight
      if (random <= 0) return surprise
    }

    return surprises[0]
  }

  const createParticles = (
    x: number,
    y: number,
    color: string,
    setParticles: React.Dispatch<React.SetStateAction<Particle[]>>,
    type: "spin" | "result" = "spin",
  ) => {
    const newParticles: Particle[] = []
    const particleCount = type === "result" ? 15 : 6

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount
      const speed = type === "result" ? 8 : 5
      const particleType = Math.random() < 0.4 ? "spark" : Math.random() < 0.7 ? "glow" : "star"

      newParticles.push({
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 3,
        vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 3,
        life: type === "result" ? 120 : 80,
        maxLife: type === "result" ? 120 : 80,
        color,
        size: Math.random() * 6 + 3,
        type: particleType,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        scale: 1,
        opacity: 1,
      })
    }
    setParticles((prev) => [...prev, ...newParticles])
  }

  const updateParticles = (particles: Particle[], setParticles: React.Dispatch<React.SetStateAction<Particle[]>>) => {
    setParticles((prev) =>
      prev
        .map((p) => {
          const lifeRatio = p.life / p.maxLife
          return {
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 1,
            vx: p.vx * 0.96,
            vy: p.vy * 0.96,
            rotation: p.rotation + p.rotationSpeed,
            scale: p.type === "glow" ? 1 + (1 - lifeRatio) * 0.5 : lifeRatio,
            opacity: p.type === "trail" ? lifeRatio * 0.8 : lifeRatio,
          }
        })
        .filter((p) => p.life > 0),
    )
  }

  const drawParticles = (ctx: CanvasRenderingContext2D, particles: Particle[]) => {
    particles.forEach((p) => {
      ctx.save()
      ctx.globalAlpha = p.opacity
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)
      ctx.scale(p.scale, p.scale)

      switch (p.type) {
        case "spark":
          // Diamond spark effect
          ctx.fillStyle = p.color
          ctx.shadowColor = p.color
          ctx.shadowBlur = 10
          ctx.beginPath()
          ctx.moveTo(0, -p.size)
          ctx.lineTo(p.size * 0.5, 0)
          ctx.lineTo(0, p.size)
          ctx.lineTo(-p.size * 0.5, 0)
          ctx.closePath()
          ctx.fill()
          break

        case "glow":
          // Glowing orb effect
          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size)
          gradient.addColorStop(0, p.color + "FF")
          gradient.addColorStop(0.5, p.color + "88")
          gradient.addColorStop(1, p.color + "00")
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(0, 0, p.size, 0, Math.PI * 2)
          ctx.fill()
          break

        case "star":
          // Star effect
          ctx.fillStyle = p.color
          ctx.strokeStyle = "#FFFFFF"
          ctx.lineWidth = 1
          ctx.shadowColor = p.color
          ctx.shadowBlur = 8
          ctx.beginPath()
          for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5
            const outerRadius = p.size
            const innerRadius = p.size * 0.4
            const x1 = Math.cos(angle) * outerRadius
            const y1 = Math.sin(angle) * outerRadius
            const x2 = Math.cos(angle + Math.PI / 5) * innerRadius
            const y2 = Math.sin(angle + Math.PI / 5) * innerRadius

            if (i === 0) ctx.moveTo(x1, y1)
            else ctx.lineTo(x1, y1)
            ctx.lineTo(x2, y2)
          }
          ctx.closePath()
          ctx.fill()
          ctx.stroke()
          break

        case "trail":
          // Trail effect
          ctx.strokeStyle = p.color
          ctx.lineWidth = p.size * 0.3
          ctx.lineCap = "round"
          ctx.shadowColor = p.color
          ctx.shadowBlur = 5
          ctx.beginPath()
          ctx.moveTo(-p.vx * 3, -p.vy * 3)
          ctx.lineTo(0, 0)
          ctx.stroke()
          break
      }

      ctx.restore()
    })
  }

  const norm = (deg: number) => ((deg % 360) + 360) % 360
  const EPS = 0.1

  const findSegmentByAngle = (deg: number, segs: typeof SEGMENTS) => {
    const normalizedDeg = norm(deg)

    for (const segment of segs) {
      if (segment.start > segment.end) {
        // Handle segments that cross 360/0 boundary (like 342-18)
        if (normalizedDeg >= segment.start - EPS || normalizedDeg <= segment.end + EPS) {
          return segment
        }
      } else {
        // Normal segments
        if (normalizedDeg >= segment.start - EPS && normalizedDeg <= segment.end + EPS) {
          return segment
        }
      }
    }

    // Fallback to first segment
    return segs[0]
  }

  const updateCanvasSize = useCallback(() => {
    const container = containerRef.current
    if (!container) {
      setCanvasSize({ width: 400, height: 400 })
      return
    }

    let containerWidth = container.clientWidth

    if (containerWidth <= 0) {
      // Try parent element width
      const parent = container.parentElement
      if (parent && parent.clientWidth > 0) {
        containerWidth = parent.clientWidth * 0.8
      } else {
        // Final fallback to viewport width
        containerWidth = Math.min(window.innerWidth * 0.8, 400)
      }
    }

    // Calculate size with safe min/max bounds
    const size = Math.max(280, Math.min(containerWidth - 40, 520))

    setCanvasSize({ width: size, height: size })
  }, [])

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = canvasSize.width * dpr
    canvas.height = canvasSize.height * dpr
    ctx.scale(dpr, dpr)

    if (velocity > 0) {
      let deceleration = 0.985
      if (velocity < 5) {
        // Slower deceleration when velocity is low for more gradual stop
        deceleration = 0.992
      } else if (velocity < 10) {
        // Medium deceleration for mid-range velocity
        deceleration = 0.988
      }

      const newVelocity = velocity * deceleration
      const nextRotation = rotation + newVelocity
      setVelocity(newVelocity)
      setRotation(nextRotation)

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = Math.min(canvas.width, canvas.height) / 2 - 20

      if (Math.random() < 0.4) {
        const colors = ["#FFD700", "#FF6B35", "#8B5CF6", "#06FFA5", "#F7931E"]
        const randomColor = colors[Math.floor(Math.random() * colors.length)]
        createParticles(
          centerX + (Math.random() - 0.5) * radius * 1.5,
          centerY + (Math.random() - 0.5) * radius * 1.5,
          randomColor,
          setParticles,
          "spin",
        )
      }

      if (newVelocity < 0.2 && isSpinning) {
        setVelocity(0)
        setIsSpinning(false)

        if (spinTimeoutRef.current) {
          clearTimeout(spinTimeoutRef.current)
          spinTimeoutRef.current = undefined
        }

        setTimeout(() => {
          const normalizedRotation = norm(nextRotation)
          const pointerAngle = norm(270 - normalizedRotation) // Pointer at top pointing to wheel
          const landedSegment = findSegmentByAngle(pointerAngle, SEGMENTS)

          console.log(
            `[v0] Wheel stopped at ${normalizedRotation.toFixed(1)}°, pointer at ${pointerAngle.toFixed(1)}°, hit: ${landedSegment.label}`,
          )

          let result: { type: "points" | "surprise"; value: number | string }
          if (landedSegment.kind === "surpriz" && surprisesEnabled) {
            const selectedSurprise = selectRandomSurprise(allSurprises)
            result = { type: "surprise", value: selectedSurprise.key }
            setResultData({
              type: "surprise",
              value: selectedSurprise.key,
              label: selectedSurprise.name,
              icon: selectedSurprise.icon,
            })
            setShowResultPopup(true)
            setTimeout(() => {
              setShowResultPopup(false)
              onSpin(result)
            }, 2000)
          } else {
            result = { type: "points", value: landedSegment.value as number }
            setResultData({
              type: "points",
              value: landedSegment.value as number,
              label: `+${landedSegment.value} PUAN`,
              icon: "🎉",
            })
            setShowResultPopup(true)
            setTimeout(() => {
              setShowResultPopup(false)
              onSpin(result)
            }, 2000)
          }

          createParticles(canvas.width / 2, canvas.height / 2, landedSegment.color, setParticles, "result")

          const debugText = `Wheel: ${normalizedRotation.toFixed(1)}° | Pointer: ${pointerAngle.toFixed(1)}° | Hit: ${landedSegment.label} | Value: ${landedSegment.value || landedSegment.key}`
          setDebugInfo(debugText)
          setTimeout(() => setDebugInfo(""), 3000)
        }, 800)
      }
    }

    updateParticles(particles, setParticles)
    drawWheel(ctx, rotation)
    drawParticles(ctx, particles)

    animationRef.current = requestAnimationFrame(animate)
  }, [velocity, rotation, isSpinning, canvasSize, onSpin, surprisesEnabled])

  const drawWheel = useCallback(
    (ctx: CanvasRenderingContext2D, currentRotation: number) => {
      const { width, height } = canvasSize
      const centerX = width / 2
      const centerY = height / 2
      const radius = Math.min(width, height) / 2 - 20

      if (radius <= 0 || isNaN(radius) || width <= 0 || height <= 0) {
        console.log("[v0] Canvas size invalid:", { width, height, radius })
        return
      }

      ctx.clearRect(0, 0, width, height)
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate((currentRotation * Math.PI) / 180)

      SEGMENTS.forEach((segment) => {
        const startAngle = (segment.start * Math.PI) / 180
        let endAngle = (segment.end * Math.PI) / 180

        // Handle segments that cross 360/0 boundary
        if (segment.start > segment.end) {
          endAngle += 2 * Math.PI
        }

        const midAngle = (startAngle + endAngle) / 2

        const gradient = ctx.createRadialGradient(0, 0, radius * 0.3, 0, 0, radius)
        gradient.addColorStop(0, segment.color + "FF")
        gradient.addColorStop(0.7, segment.color + "DD")
        gradient.addColorStop(1, segment.color + "AA")

        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.arc(0, 0, radius, startAngle, endAngle)
        ctx.closePath()
        ctx.fillStyle = gradient
        ctx.fill()

        ctx.strokeStyle = "#FFFFFF"
        ctx.lineWidth = 2
        ctx.shadowColor = "#FFFFFF"
        ctx.shadowBlur = 5
        ctx.stroke()
        ctx.shadowBlur = 0

        ctx.save()
        ctx.rotate(midAngle)
        ctx.translate(radius * 0.65, 0)
        ctx.rotate(-midAngle - (currentRotation * Math.PI) / 180)

        ctx.fillStyle = "#FFFFFF"
        ctx.strokeStyle = "#000000"
        ctx.lineWidth = 3
        ctx.font = `bold ${Math.max(12, radius * 0.08)}px Inter, system-ui, sans-serif`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        const lines = segment.label.split("\n")
        lines.forEach((line, index) => {
          const y = (index - (lines.length - 1) / 2) * (radius * 0.12)
          ctx.strokeText(line, 0, y)
          ctx.fillText(line, 0, y)
        })

        ctx.restore()
      })

      // Center circle
      const centerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.25)
      centerGradient.addColorStop(0, "#1a1a1a")
      centerGradient.addColorStop(1, "#000000")

      ctx.beginPath()
      ctx.arc(0, 0, radius * 0.25, 0, 2 * Math.PI)
      ctx.fillStyle = centerGradient
      ctx.fill()
      ctx.strokeStyle = "#FF3B30"
      ctx.lineWidth = 4
      ctx.shadowColor = "#FF3B30"
      ctx.shadowBlur = 15
      ctx.stroke()

      ctx.shadowBlur = 0
      ctx.fillStyle = "#FFFFFF"
      ctx.font = `bold ${radius * 0.08}px Inter, system-ui, sans-serif`
      ctx.textAlign = "center"
      ctx.fillText("BİLGİ", 0, -radius * 0.04)
      ctx.fillText("ÇARKI", 0, radius * 0.04)

      ctx.restore()

      ctx.save()
      ctx.translate(centerX, centerY - radius - 10)

      // Shadow for pointer
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
      ctx.beginPath()
      ctx.moveTo(2, 22) // Shadow offset
      ctx.lineTo(-10, 2)
      ctx.lineTo(14, 2)
      ctx.closePath()
      ctx.fill()

      // Main pointer triangle pointing downward
      const pointerGradient = ctx.createLinearGradient(0, 0, 0, 20)
      pointerGradient.addColorStop(0, "#FF3B30")
      pointerGradient.addColorStop(1, "#CC0000")

      ctx.fillStyle = pointerGradient
      ctx.beginPath()
      ctx.moveTo(0, 20) // Point at bottom (toward wheel)
      ctx.lineTo(-12, 0) // Left corner at top
      ctx.lineTo(12, 0) // Right corner at top
      ctx.closePath()
      ctx.fill()

      ctx.strokeStyle = "#FFFFFF"
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.restore()
    },
    [canvasSize],
  )

  const handleSpin = useCallback(() => {
    if (!isSpinning) {
      setIsSpinning(true)
      setVelocity(Math.random() * 10 + 20)
      audio.playWheelSpin()

      spinTimeoutRef.current = setTimeout(() => {
        console.log("[v0] Spin timeout triggered - resetting wheel state")
        if (isSpinning) {
          setIsSpinning(false)
          setVelocity(0)
          if (!showResultPopup) {
            const fallbackResult = { type: "points" as const, value: 10 }
            onSpin(fallbackResult)
          }
        }
      }, 5000)
    }
  }, [isSpinning, setVelocity, audio, onSpin, showResultPopup])

  useEffect(() => {
    const startAnimation = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      animationRef.current = requestAnimationFrame(animate)
    }

    startAnimation()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animate])

  useEffect(() => {
    updateCanvasSize()

    if (containerRef.current && "ResizeObserver" in window) {
      resizeObserverRef.current = new ResizeObserver(() => {
        updateCanvasSize()
      })
      resizeObserverRef.current.observe(containerRef.current)
    }

    window.addEventListener("resize", updateCanvasSize)

    return () => {
      window.removeEventListener("resize", updateCanvasSize)
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
      }
    }
  }, [updateCanvasSize])

  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="flex flex-col items-center w-full max-w-sm sm:max-w-md mx-auto">
      <div className="relative w-full min-h-[320px] sm:min-h-[360px] flex flex-col items-center justify-center gap-3 sm:gap-4 p-2">
        <div ref={containerRef} className="relative w-full max-w-md mx-auto aspect-square">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="w-full h-full rounded-full shadow-2xl"
            style={{
              filter: isSpinning
                ? "drop-shadow(0 0 20px rgba(255, 59, 48, 0.5))"
                : "drop-shadow(0 0 10px rgba(0, 0, 0, 0.3))",
              transition: "filter 0.3s ease",
            }}
          />
        </div>

        {debugInfo && (
          <div className="fixed top-4 left-4 right-4 bg-black/80 text-white p-2 rounded text-xs font-mono z-50">
            {debugInfo}
          </div>
        )}

        <Button
          onClick={handleSpin}
          disabled={isSpinning || velocity > 0}
          size="lg"
          className="h-10 sm:h-12 px-4 sm:px-6 text-base sm:text-lg font-bold glassmorphism neon-glow hover:scale-105 disabled:opacity-50 transition-all duration-300 w-full"
        >
          <RotateCcw className={`mr-2 h-4 w-4 sm:h-5 sm:w-5 ${isSpinning ? "animate-spin" : ""}`} />
          {isSpinning ? "ÇEVİRİLİYOR..." : "ÇARKI ÇEVİR"}
        </Button>
      </div>

      {showResultPopup && resultData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative glassmorphism p-8 rounded-2xl border border-red-500/30 shadow-2xl animate-scale-in max-w-sm w-full backdrop-blur-md bg-black/40">
            <div className="text-center">
              {/* Enhanced icon with subtle glow */}
              <div className="text-6xl mb-4 animate-bounce drop-shadow-lg" style={{ animationDuration: "1.5s" }}>
                {resultData.icon}
              </div>

              {/* Clean result label matching game typography */}
              <div className="text-2xl font-bold text-white drop-shadow-lg">{resultData.label}</div>
            </div>

            {/* Subtle red glow border effect */}
            <div className="absolute inset-0 rounded-2xl border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.3)] pointer-events-none"></div>
          </div>
        </div>
      )}
    </div>
  )
}
