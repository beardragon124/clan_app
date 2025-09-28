// src/services/sheetsRepo.js
import { api } from "./api";

/** Lista los clanes desde Google Sheets (vía backend). */
async function getClans() {
  const data = await api.post("/api/clans", { action: "list" });
  return Array.isArray(data) ? data : (data.items || []);
}

/** Lista miembros de un clan específico. */
async function getMembersByClan(clanId) {
  const data = await api.post("/api/members", { action: "list", clan_id: clanId });
  return Array.isArray(data) ? data : (data.items || []);
}

// ✅ Export nombrados (lo ideal)
export { getClans, getMembersByClan };

// ✅ Export default (para archivos que aún hacen `import sheetsRepo from ...`)
const sheetsRepo = { getClans, getMembersByClan };
export default sheetsRepo;
