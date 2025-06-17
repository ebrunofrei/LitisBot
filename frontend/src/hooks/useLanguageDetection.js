import { useEffect, useState } from 'react';
import { franc } from 'franc';

const LANG_MAP = {
  spa: 'es',
  eng: 'en',
  por: 'pt',
  ita: 'it',
  fra: 'fr',
  deu: 'de',
  rus: 'ru',
  cmn: 'zh',
  jpn: 'ja',
  que: 'qu', // Quechua (puedes definir tu código)
  aym: 'ay', // Aymara (idem)
};

export function useLanguageDetection(text) {
  const [language, setLanguage] = useState('es');

  useEffect(() => {
    if (!text || text.trim() === '') {
      setLanguage('es');
      return;
    }
    const detected = franc(text);
    setLanguage(LANG_MAP[detected] || 'es');
  }, [text]);

  return language;
}

