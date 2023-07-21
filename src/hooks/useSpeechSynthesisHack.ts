import { useEffect } from 'react'

export default function useSpeechSynthesisHack() {
  useEffect(() => {
    let hasEnabledVoice = false
    document.addEventListener('click', () => {
      if (hasEnabledVoice) {
        return
      }
      const lecture = new SpeechSynthesisUtterance('hello')
      lecture.volume = 0
      speechSynthesis.speak(lecture)
      hasEnabledVoice = true
    })
  }, [])
}
