import React from "react";

const Bienvenida = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 px-4">
    <img
      src="/litisbot-logo.png"
      alt="LitisBot logo"
      className="w-32 h-32 rounded-full shadow-2xl border-4 border-blue-500 mb-6 animate-pulse"
    />
    <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2">
      ¡Bienvenido a <span className="text-blue-700">LitisBot</span>!
    </h1>
    <h2 className="text-xl text-blue-700 font-semibold mb-4 text-center">
      Porque la justicia no debe ser un privilegio
    </h2>
    <p className="text-lg text-gray-700 text-center mb-6 max-w-md">
      Acceso rápido, asesoría jurídica en tiempo real y modelos legales listos para descargar o imprimir desde cualquier dispositivo.
    </p>
    <a
      href="/"
      className="bg-blue-600 text-white px-8 py-3 text-lg rounded-xl shadow-lg hover:bg-blue-700 transition"
    >
      Ingresar a la app
    </a>
  </div>
);

export default Bienvenida;
