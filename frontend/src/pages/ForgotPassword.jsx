import React, { useState } from 'react';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrorMsg('');

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Correo enviado. Revisa tu bandeja para restablecer tu contraseña.');
    } catch (error) {
      setErrorMsg(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>Recuperar Contraseña</h2>
      <form onSubmit={handleReset}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        />
        <button
          type="submit"
          style={{ width: '100%', padding: 10, backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 4 }}
        >
          Enviar enlace de recuperación
        </button>
      </form>
      {message && <p style={{ color: 'green', marginTop: 10 }}>{message}</p>}
      {errorMsg && <p style={{ color: 'red', marginTop: 10 }}>{errorMsg}</p>}
      <p style={{ marginTop: 15 }}>
        <Link to="/login">Volver a iniciar sesión</Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
