import { useState, useEffect } from 'react';

export function useSpeechSynthesis(language, voiceGender, rate, volume) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Cancel speech synthesis on unmount
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = (text, enabled) => {
    if (!enabled) return;
    if (!('speechSynthesis' in window)) {
      alert('Tu navegador no soporta Speech Synthesis');
      return;
    }
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'es' ? 'es-PE' : 'en-US';

    const voices = window.speechSynthesis.getVoices();
    const voiceName = language === 'es'
      ? (voiceGender === 'male' ? 'Google Español Male' : 'Google Español Female')
      : (voiceGender === 'male' ? 'Google US English Male' : 'Google US English Female');

    const voice = voices.find(v => v.name === voiceName);
    if (voice) utterance.voice = voice;

    utterance.rate = rate;
    utterance.volume = volume;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const pause = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsSpeaking(false);
    }
  };

  const resume = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsSpeaking(true);
    }
  };

  return { isSpeaking, speak, pause, resume };
}


