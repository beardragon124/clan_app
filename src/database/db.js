// src/database/db.js
import * as SQLite from "expo-sqlite";

let _db;
/** Singleton DB */
export async function getDB() {
  if (!_db) _db = await SQLite.openDatabaseAsync("clanes.db");
  return _db;
}

/* =======================
   CREAR TABLAS + MIGRAR
   ======================= */
export async function createTables() {
  const db = await getDB();
  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS clans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    /* status sin CHECK: tus 4 etiquetas tal cual */
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clan_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      className TEXT,
      role TEXT,            -- "Líder" u otro
      status TEXT,          -- "Nuevo miembro de clan" | "Miembro de clan" | "Anciano" | "Líder"
      photoUri TEXT,
      /* 🔹 atributos */
      str INTEGER,
      def INTEGER,
      agi INTEGER,
      mag INTEGER,
      luck INTEGER,
      created_at TEXT NOT NULL,
      FOREIGN KEY(clan_id) REFERENCES clans(id) ON DELETE CASCADE
    );
  `);

  await runMigrations();
}

/* Helpers introspección */
async function tableInfo(table) {
  const db = await getDB();
  return await db.getAllAsync(`PRAGMA table_info(${table});`);
}
async function columnExists(table, column) {
  const info = await tableInfo(table);
  return info.some((c) => c.name === column);
}

/** Migra "class" -> "className" (antiguo) */
async function migrateMembersClassToClassName() {
  const db = await getDB();
  const hasClassName = await columnExists("members", "className");
  const hasOldClass = await columnExists("members", "class");
  if (!hasClassName && hasOldClass) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS members_tmp (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        clan_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        className TEXT,
        role TEXT,
        status TEXT,
        photoUri TEXT,
        str INTEGER, def INTEGER, agi INTEGER, mag INTEGER, luck INTEGER,
        created_at TEXT NOT NULL,
        FOREIGN KEY(clan_id) REFERENCES clans(id) ON DELETE CASCADE
      );

      INSERT INTO members_tmp (id, clan_id, name, className, role, status, photoUri, str, def, agi, mag, luck, created_at)
      SELECT id, clan_id, name, class AS className, role, status, NULL AS photoUri, NULL, NULL, NULL, NULL, NULL, created_at
      FROM members;

      DROP TABLE members;
      ALTER TABLE members_tmp RENAME TO members;
    `);
  }
}

/** Agrega columna photoUri si no existe */
async function migrateAddPhotoUri() {
  const hasPhoto = await columnExists("members", "photoUri");
  if (!hasPhoto) {
    const db = await getDB();
    await db.execAsync(`ALTER TABLE members ADD COLUMN photoUri TEXT;`);
  }
}

/** 🔹 Agregar columnas de atributos si no existen */
async function migrateAddStats() {
  const db = await getDB();
  const cols = await tableInfo("members");
  const names = cols.map((c) => c.name);
  const toAdd = ["str", "def", "agi", "mag", "luck"].filter((k) => !names.includes(k));
  for (const col of toAdd) {
    await db.execAsync(`ALTER TABLE members ADD COLUMN ${col} INTEGER;`);
  }
}

async function runMigrations() {
  await migrateMembersClassToClassName();
  await migrateAddPhotoUri();
  await migrateAddStats();
}

/* ================
   CLANES
   ================ */
export async function addClan(name) {
  const db = await getDB();
  const now = new Date().toISOString();
  const res = await db.runAsync(
    `INSERT INTO clans (name, created_at) VALUES (?, ?);`,
    [name.trim(), now]
  );
  return res.lastInsertRowId;
}

export async function getClans() {
  const db = await getDB();
  return await db.getAllAsync(
    `SELECT id, name, created_at FROM clans ORDER BY created_at DESC;`
  );
}

export async function getClanById(clanId) {
  const db = await getDB();
  return await db.getFirstAsync(
    `SELECT id, name, created_at FROM clans WHERE id=?;`,
    [clanId]
  );
}

export async function deleteClan(clanId) {
  const db = await getDB();
  await db.runAsync(`DELETE FROM clans WHERE id=?;`, [clanId]);
}

/* ================
   MIEMBROS
   ================ */
export async function addMember({ clanId, name, className, role, status, photoUri, stats }) {
  const db = await getDB();
  const now = new Date().toISOString();
  const { str = null, def = null, agi = null, mag = null, luck = null } = stats || {};

  const res = await db.runAsync(
    `INSERT INTO members (clan_id, name, className, role, status, photoUri, str, def, agi, mag, luck, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [clanId, name.trim(), className || "", role || "", status || "", photoUri || null, str, def, agi, mag, luck, now]
  );
  return res.lastInsertRowId;
}

export async function getMembersByClan(clanId) {
  const db = await getDB();
  return await db.getAllAsync(
    `SELECT id, name, className, role, status, photoUri, str, def, agi, mag, luck
       FROM members
      WHERE clan_id=?
      ORDER BY created_at DESC;`,
    [clanId]
  );
}

export async function getMemberById(memberId) {
  const db = await getDB();
  return await db.getFirstAsync(
    `SELECT id, clan_id, name, className, role, status, photoUri, str, def, agi, mag, luck, created_at
       FROM members
      WHERE id=?;`,
    [memberId]
  );
}

export async function deleteMember(memberId) {
  const db = await getDB();
  await db.runAsync(`DELETE FROM members WHERE id=?;`, [memberId]);
}

export async function clanHasLeader(clanId) {
  const db = await getDB();
  const row = await db.getFirstAsync(
    `SELECT COUNT(*) AS cnt FROM members WHERE clan_id=? AND role='Líder';`,
    [clanId]
  );
  return (row?.cnt ?? 0) > 0;
}

export async function setLeader(clanId, memberId) {
  const db = await getDB();
  await db.withTransactionAsync(async () => {
    await db.runAsync(`UPDATE members SET role='' WHERE clan_id=? AND role='Líder';`, [clanId]);
    await db.runAsync(`UPDATE members SET role='Líder' WHERE id=?;`, [memberId]);
  });
}

export async function updateMemberStatus(memberId, newStatus) {
  const db = await getDB();
  await db.runAsync(`UPDATE members SET status=? WHERE id=?;`, [newStatus, memberId]);
}

export async function updateMemberRole(memberId, newRole) {
  const db = await getDB();
  await db.runAsync(`UPDATE members SET role=? WHERE id=?;`, [newRole || "", memberId]);
}
