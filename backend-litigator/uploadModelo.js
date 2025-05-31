const path = require('path');
const fs = require('fs');
const { db, bucket } = require('./utils/firebaseAdmin');

/**
 * Sube un archivo Word (.docx) a Firebase Storage y registra su metadata en Firestore.
 * @param {string} localPath - Ruta local del archivo
 * @param {Object} metadata - Información sobre el modelo legal
 */
const subirModeloLegal = async (localPath, metadata) => {
  try {
    const filename = path.basename(localPath);
    const destination = `modelos/${filename}`;

    // Subir a Storage
    await bucket.upload(localPath, {
      destination,
      metadata: {
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }
    });

    // Generar URL pública
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/modelos%2F${encodeURIComponent(filename)}?alt=media`;

    // Guardar metadata en Firestore
    await db.collection('biblioteca').add({
      nombre: metadata.nombre || filename,
      materia: metadata.materia || 'general',
      tipo: metadata.tipo || 'modelo',
      editable: metadata.editable ?? true,
      url,
      descripcion: metadata.descripcion || '',
      creadoEn: new Date()
    });

    console.log(`✅ Modelo legal '${filename}' subido y registrado en Firestore.`);
  } catch (error) {
    console.error('❌ Error al subir modelo legal:', error);
  }
};

// Ejemplo de uso (puedes cambiar los valores según el modelo)
const modeloPath = path.join(__dirname, 'documentos', 'Modelo_Demanda_Editable.docx');
const datosModelo = {
  nombre: 'Modelo de Demanda de Nulidad de Acto Jurídico',
  materia: 'civil',
  tipo: 'demanda',
  editable: true,
  descripcion: 'Plantilla editable para demandas de nulidad de actos jurídicos en procesos civiles y contencioso-administrativos.'
};

subirModeloLegal(modeloPath, datosModelo);