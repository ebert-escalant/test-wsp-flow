// src/index.js
const express = require("express");
const { decryptRequest, encryptResponse } = require("./crypto/flow");
const { handleInit, handleDataExchange } = require("./handlers/flow");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ─── Clave privada RSA ────────────────────────────────────────────────────────
// En Render la defines como variable de entorno PRIVATE_KEY
// El valor debe ser el PEM completo con saltos de línea reales (usa \n en Render)
const PRIVATE_KEY = process.env.PRIVATE_KEY || null;

// ─── Health check para Render ─────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "WhatsApp Flow - Clínica" });
});

// ─── Endpoint principal del Flow ──────────────────────────────────────────────
app.post("/flow", async (req, res) => {
  try {
    // Sin clave privada configurada → modo desarrollo (sin cifrado)
    if (!PRIVATE_KEY) {
      console.warn("⚠️  PRIVATE_KEY no configurada — modo desarrollo sin cifrado");
      const body = req.body;
      const response = routeAction(body);
      return res.json(response);
    }

    // Descifrar request de Meta
    const { decryptedBody, aesKeyBuffer, initialVectorBuffer } = decryptRequest(
      req.body,
      PRIVATE_KEY
    );

    console.log("📨 Action recibida:", decryptedBody.action);

    // Procesar según el action
    const response = routeAction(decryptedBody);

    // Cifrar respuesta y devolver
    const encryptedResponse = encryptResponse(
      response,
      aesKeyBuffer,
      initialVectorBuffer
    );

    res.send(encryptedResponse);
  } catch (err) {
    console.error("❌ Error en /flow:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Router de acciones ───────────────────────────────────────────────────────
function routeAction(body) {
  const { action } = body;

  switch (action) {
    case "INIT":
      return handleInit();

    case "data_exchange":
      return handleDataExchange(body);

    case "ping":
      // Meta usa esto para verificar que el endpoint está vivo
      return { data: { status: "active" } };

    default:
      console.warn("⚠️  Action desconocida:", action);
      return { data: {} };
  }
}

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
  console.log(`🔑 Modo: ${PRIVATE_KEY ? "producción (cifrado activo)" : "desarrollo (sin cifrado)"}`);
});
