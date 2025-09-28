// src/services/api.js

/**
 * Este archivo es un cliente genérico para consumir tu backend en Vercel.
 * El backend será el puente entre tu app y Google Sheets.
 *
 * 📌 Flujo general:
 * - La app (Expo) llama a api.post("/api/xxx", { ...datos... }).
 * - El backend (en Vercel) recibe la petición y usa Google Sheets API.
 * - Devuelve un JSON con los datos solicitados.
 */

// ✅ La URL base de tu API (la defines en app.json o .env con EXPO_PUBLIC_API_BASE)
//    Ejemplo: "https://tu-proyecto.vercel.app"
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE;

// ✅ Clave para validar que solo los moderadores puedan modificar datos.
//    La defines como EXPO_PUBLIC_MODERATOR_KEY en tu app y en Vercel.
const MOD_KEY = process.env.EXPO_PUBLIC_MODERATOR_KEY;

/**
 * 🔹 post
 * Hace un POST al backend con body en formato JSON.
 *
 * @param {string} path - Ruta del endpoint (ej: "/api/clans").
 * @param {object} body - Cuerpo de la petición (ej: { action: "list" }).
 *
 * Flujo:
 * 1. Concatena BASE_URL + path → URL completa.
 * 2. Envía fetch con método POST, headers y body en JSON.
 * 3. Incluye el header "x-mod-key" con tu clave de moderador.
 * 4. Si la respuesta no es OK (status >= 400), lanza error.
 * 5. Si es OK, convierte a JSON y lo devuelve.
 */
async function post(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-mod-key": MOD_KEY, // Header para autenticar
    },
    body: JSON.stringify(body), // Pasamos el objeto en formato JSON
  });

  if (!res.ok) {
    const text = await res.text(); // Leemos texto del error (útil para debug)
    throw new Error(`API ${path} ${res.status}: ${text}`);
  }

  return res.json(); // Respuesta esperada en JSON
}

// Exportamos el cliente con la función post
export const api = { post };
