import React, { useEffect, useState } from "react";
import { db, auth } from "../../firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

const estadoColor = {
  "vigente": { color: "#2e7d32", icon: "✅" },
  "derogada": { color: "#c62828", icon: "❌" },
  "vacatio legis": { color: "#ef6c00", icon: "⏳" },
  "pendiente reglamentación": { color: "#1565c0", icon: "📄" },
  "no identificado": { color: "#757575", icon: "❓" }
};

const HistorialNormas = () => {
  const [user] = useAuthState(auth);
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "conversaciones"),
      where("uid", "==", user.uid),
      orderBy("fecha", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const resultados = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHistorial(resultados);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div style={{ padding: "20px", maxWidth: "720px", margin: "0 auto" }}>
      <h2 style={{ color: "#1662C4", textAlign: "center" }}>📚 Historial de Normas Consultadas</h2>
      {historial.length === 0 && (
        <p style={{ textAlign: "center", color: "#888" }}>
          No se han registrado consultas aún.
        </p>
      )}
      {historial.map((item) => {
        const estado = estadoColor[item.estadoNorma] || estadoColor["no identificado"];
        return (
          <div key={item.id} style={{
            background: "#f5f5f5",
            borderLeft: `5px solid ${estado.color}`,
            padding: "12px 16px",
            borderRadius: 8,
            marginBottom: 12
          }}>
            <div style={{ fontSize: 13, color: "#555" }}>
              {new Date(item.fecha?.seconds * 1000).toLocaleString("es-PE")}
            </div>
            <div style={{ fontWeight: "bold", marginTop: 4 }}>{item.pregunta}</div>
            <div style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>{item.respuesta}</div>
            <div style={{ marginTop: 8, color: estado.color, fontWeight: "bold" }}>
              {estado.icon} Estado legal: {item.estadoNorma || "no identificado"}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HistorialNormas;
