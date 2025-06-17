import React, { useEffect, useState } from 'react';

const InstalarApp = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    });
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => setShowInstall(false));
    }
  };

  if (!showInstall) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-blue-600 flex items-center justify-between p-4 shadow-xl z-50">
      <div className="flex items-center space-x-3">
        <img
          src="/logo-litisbot-192.png"
          alt="LitisBot"
          className="w-12 h-12 rounded-full shadow-lg"
        />
        <div>
          <div className="text-white font-bold text-lg">Instala LitisBot</div>
          <div className="text-white text-sm">
            Acceso directo y seguro desde tu celular. ¡Haz clic para agregar al inicio!
          </div>
        </div>
      </div>
      <button
        onClick={handleInstall}
        className="ml-4 bg-white text-blue-600 font-bold px-4 py-2 rounded-2xl shadow"
      >
        Instalar
      </button>
    </div>
  );
};

export default InstalarApp;
