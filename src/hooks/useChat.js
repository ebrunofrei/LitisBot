import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export function useChat(userId, userName, language) {
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/conversation/${userId}`);
        if (!res.ok) throw new Error('Error al cargar historial');
        const data = await res.json();
        setResponses(data.map(conv => ({
          question: conv.question,
          answer: conv.answer,
        })));
      } catch (error) {
        toast.error(error.message || 'Error cargando historial');
      }
    };

    fetchHistory();
  }, [userId]);

  const saveConversation = async (data) => {
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Error guardando conversación:', error);
      toast.error('Error guardando conversación');
    }
  };

  const sendMessage = async (text) => {
    if (!text || text.trim() === '') return;
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, userId, userName, language }),
      });

      if (!response.ok) throw new Error(`Error del servidor: ${response.statusText}`);

      const data = await response.json();

      const personalizedAnswer = userName
        ? `Hola ${userName}, ${data.reply}`
        : data.reply;

      setResponses(prev => [...prev, { question: text, answer: personalizedAnswer }]);
      saveConversation({
        userId,
        userName,
        language,
        question: text,
        translatedQuestion: text,
        answer: personalizedAnswer,
      });

      return personalizedAnswer;
    } catch (error) {
      toast.error('Error al obtener respuesta. Intenta nuevamente.');
      setResponses(prev => [...prev, { question: text, answer: 'Error al obtener respuesta.' }]);
      return null;
    }
  };

  return { responses, sendMessage };
}



