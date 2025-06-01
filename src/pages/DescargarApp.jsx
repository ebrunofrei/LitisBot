import React from "react";

const DescargarApp = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 p-4">
    <img
      src="/logo-litisbot-512.png"
      alt="LitisBot logo"
      className="w-32 h-32 rounded-full shadow-2xl border-4 border-blue-500 mb-6"
    />
    <h1 className="text-4xl font-bold text-blue-800 mb-4">¡Bienvenido a LitisBot!</h1>
    <p className="text-xl text-gray-700 mb-6 text-center">
      Asesoría legal, modelos y gestión de expedientes en una sola app. Instala LitisBot y lleva la justicia en tu celular.
    </p>
    <button
      className="bg-blue-600 text-white text-xl rounded-2xl px-8 py-3 shadow-lg hover:bg-blue-700 transition"
      onClick={() => window.location.reload()}
    >
      Ver instrucciones de instalación
    </button>
    <div className="mt-8 text-gray-500 text-sm text-center max-w-xl">
      Para instalar, haz clic en el ícono <span className="font-bold">“Agregar a inicio”</span> desde el navegador de tu celular.<br/>
      Si ves un banner, solo presiona <span className="font-bold">Instalar</span>.
    </div>
  </div>
);

export default DescargarApp;
