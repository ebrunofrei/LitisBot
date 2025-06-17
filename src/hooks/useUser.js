import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export function useUser() {
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [hasName, setHasName] = useState(false);

  useEffect(() => {
    let storedId = localStorage.getItem('userId');
    if (!storedId) {
      storedId = uuidv4();
      localStorage.setItem('userId', storedId);
    }
    setUserId(storedId);

    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
      setHasName(true);
    }
  }, []);

  const saveName = (name) => {
    localStorage.setItem('userName', name);
    setUserName(name);
    setHasName(true);
  };

  return { userId, userName, hasName, saveName };
}
