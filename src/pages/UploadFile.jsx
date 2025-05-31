import React, { useState } from 'react';
import { storage, db } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';

const UploadFile = () => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [downloadURL, setDownloadURL] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!file) {
      alert('Selecciona un archivo primero');
      return;
    }
    const storageRef = ref(storage, `biblioteca/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      snapshot => {
        const progressPercent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(progressPercent);
      },
      error => {
        console.error('Error al subir archivo:', error);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        setDownloadURL(url);
        try {
          await addDoc(collection(db, 'biblioteca'), {
            name: file.name,
            url: url,
            createdAt: new Date()
          });
          alert('Archivo subido y guardado correctamente');
        } catch (e) {
          console.error('Error guardando metadata en Firestore:', e);
        }
      }
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Subir archivo a Biblioteca Jurídica</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} style={{ marginTop: 10 }}>
        Subir archivo
      </button>
      <div>Progreso: {progress}%</div>
      {downloadURL && (
        <div>
          Archivo disponible en: <a href={downloadURL} target="_blank" rel="noreferrer">{downloadURL}</a>
        </div>
      )}
    </div>
  );
};

export default UploadFile;

