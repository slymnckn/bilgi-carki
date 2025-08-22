"use client"

import { useCallback, useRef } from "react"

interface AudioOptions {
  volume?: number
  loop?: boolean
}

export function useAudio() {
  const audioContextRef = useRef<AudioContext | null>(null)

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current && typeof window !== "undefined") {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  const playTone = useCallback(
    (frequency: number, duration: number, options: AudioOptions = {}) => {
      const { volume = 0.3, loop = false } = options

      try {
        const audioContext = initAudioContext()
        if (!audioContext) return

        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
        oscillator.type = "sine"

        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + duration)
      } catch (error) {
        console.log("Audio not supported")
      }
    },
    [initAudioContext],
  )

  const playWheelSpin = useCallback(() => {
    // Spinning wheel sound - ascending tones
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        playTone(200 + i * 20, 0.1, { volume: 0.2 })
      }, i * 100)
    }
  }, [playTone])

  const playCorrectAnswer = useCallback(() => {
    // Success chord - C major
    playTone(523.25, 0.3, { volume: 0.4 }) // C5
    setTimeout(() => playTone(659.25, 0.3, { volume: 0.4 }), 100) // E5
    setTimeout(() => playTone(783.99, 0.5, { volume: 0.4 }), 200) // G5
  }, [playTone])

  const playWrongAnswer = useCallback(() => {
    // Error sound - descending tones
    playTone(400, 0.2, { volume: 0.3 })
    setTimeout(() => playTone(300, 0.2, { volume: 0.3 }), 150)
    setTimeout(() => playTone(200, 0.3, { volume: 0.3 }), 300)
  }, [playTone])

  const playButtonClick = useCallback(() => {
    playTone(800, 0.1, { volume: 0.2 })
  }, [playTone])

  const playWheelStop = useCallback(() => {
    // Wheel stopping sound
    playTone(150, 0.5, { volume: 0.3 })
  }, [playTone])

  const playSurpriseEffect = useCallback(
    (type: string) => {
      switch (type) {
        case "bomb":
          // Explosion sound
          playTone(100, 0.3, { volume: 0.4 })
          setTimeout(() => playTone(80, 0.2, { volume: 0.3 }), 100)
          break
        case "gold":
          // Coin sound
          playTone(800, 0.1, { volume: 0.3 })
          setTimeout(() => playTone(1000, 0.1, { volume: 0.3 }), 100)
          setTimeout(() => playTone(1200, 0.2, { volume: 0.3 }), 200)
          break
        case "rocket":
          // Rocket launch
          for (let i = 0; i < 10; i++) {
            setTimeout(() => playTone(200 + i * 50, 0.1, { volume: 0.2 }), i * 50)
          }
          break
        default:
          // Generic surprise sound
          playTone(600, 0.2, { volume: 0.3 })
          setTimeout(() => playTone(800, 0.2, { volume: 0.3 }), 100)
      }
    },
    [playTone],
  )

  const playScoreUpdate = useCallback(() => {
    // Score update sound
    playTone(600, 0.15, { volume: 0.25 })
    setTimeout(() => playTone(800, 0.15, { volume: 0.25 }), 75)
  }, [playTone])

  return {
    playWheelSpin,
    playCorrectAnswer,
    playWrongAnswer,
    playButtonClick,
    playWheelStop,
    playSurpriseEffect,
    playScoreUpdate,
  }
}
