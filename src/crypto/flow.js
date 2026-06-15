// crypto/flow.js
// Maneja el cifrado y descifrado requerido por Meta para WhatsApp Flows

const crypto = require("crypto");

/**
 * Descifra el request que manda Meta a tu endpoint.
 * Meta cifra todo con AES-128-GCM usando una clave AES que a su vez
 * viene cifrada con tu clave pública RSA.
 */
function decryptRequest(body, privatePem) {
  const { encrypted_aes_key, encrypted_flow_data, initial_vector } = body;

  // 1. Descifrar la clave AES usando tu clave privada RSA
  const decryptedAesKey = crypto.privateDecrypt(
    {
      key: crypto.createPrivateKey(privatePem),
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(encrypted_aes_key, "base64")
  );

  // 2. Descifrar el payload usando AES-128-GCM
  const flowDataBuffer = Buffer.from(encrypted_flow_data, "base64");
  const initialVectorBuffer = Buffer.from(initial_vector, "base64");

  // Los últimos 16 bytes son el auth tag de GCM
  const TAG_LENGTH = 16;
  const encryptedData = flowDataBuffer.subarray(0, -TAG_LENGTH);
  const authTag = flowDataBuffer.subarray(-TAG_LENGTH);

  const decipher = crypto.createDecipheriv(
    "aes-128-gcm",
    decryptedAesKey,
    initialVectorBuffer
  );
  decipher.setAuthTag(authTag);

  const decryptedData =
    decipher.update(encryptedData, undefined, "utf8") + decipher.final("utf8");

  return {
    decryptedBody: JSON.parse(decryptedData),
    aesKeyBuffer: decryptedAesKey,
    initialVectorBuffer,
  };
}

/**
 * Cifra la respuesta que devuelves a Meta.
 * Usa la misma clave AES que Meta usó para el request,
 * pero con el IV invertido (flip).
 */
function encryptResponse(response, aesKeyBuffer, initialVectorBuffer) {
  // Invertir el IV para la respuesta
  const flippedIV = Buffer.alloc(initialVectorBuffer.length);
  for (let i = 0; i < initialVectorBuffer.length; i++) {
    flippedIV[i] = ~initialVectorBuffer[i];
  }

  const cipher = crypto.createCipheriv("aes-128-gcm", aesKeyBuffer, flippedIV);

  const encryptedData = Buffer.concat([
    cipher.update(JSON.stringify(response), "utf8"),
    cipher.final(),
    cipher.getAuthTag(),
  ]);

  return encryptedData.toString("base64");
}

module.exports = { decryptRequest, encryptResponse };
