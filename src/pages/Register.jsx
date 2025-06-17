import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const Register = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!displayName.trim()) {
      setErrorMsg('Por favor ingresa tu nombre.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Actualizar nombre en Firebase Auth
      await updateProfile(user, {
        displayName: displayName.trim(),
      });

      // Guardar en Firestore
      await setDoc(doc(db, 'usuarios', user.uid), {
        nombre: displayName.trim(),
        email: user.email,
        creadoEn: new Date()
      });

      navigate('/');
    } catch (error) {
      setErrorMsg(`Error al registrarse: ${error.message}`);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>Registrarse</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Nombre completo o del estudio"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        />
        <input
          type="password"
          placeholder="Contraseña (mínimo 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        />
        <button
          type="submit"
          style={{ width: '100%', padding: 10, backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 4 }}
        >
          Registrarse
        </button>
      </form>
      {errorMsg && <p style={{ color: 'red', marginTop: 10 }}>{errorMsg}</p>}
      <p style={{ marginTop: 15 }}>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
      </p>
    </div>
  );
};

export default Register;
