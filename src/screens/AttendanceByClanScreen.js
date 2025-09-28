// src/screens/AttendanceByClanScreen.js
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  SafeAreaView, View, Text, ActivityIndicator, FlatList,
  Pressable, Alert, ScrollView
} from "react-native";
import { BlurView } from "expo-blur";
import { getMembersByClan } from "../services/sheetsRepo";
import { api } from "../services/api";

// --- util: semana actual (lunes a domingo) ---
function getWeekRange(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = (d.getUTCDay() + 6) % 7; // 0 = lunes
  const monday = new Date(d); monday.setUTCDate(d.getUTCDate() - day);
  const sunday = new Date(monday); sunday.setUTCDate(monday.getUTCDate() + 6);
  const toISO = (x) => x.toISOString().slice(0, 10);
  return { weekStart: toISO(monday), weekEnd: toISO(sunday) };
}
const WEEK_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

// --- celda de asistencia (toggle) ---
function DayToggle({ active, onPress }) {
  return (
    <Pressable onPress={onPress} style={{ padding: 6 }}>
      <View style={{
        width: 26, height: 26, borderRadius: 8,
        borderWidth: 1, borderColor: active ? "rgba(131,208,255,0.7)" : "rgba(255,255,255,0.25)",
        backgroundColor: active ? "rgba(131,208,255,0.18)" : "rgba(255,255,255,0.05)",
        alignItems: "center", justifyContent: "center"
      }}>
        {active ? <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: "#83D0FF" }} /> : null}
      </View>
    </Pressable>
  );
}

// --- fila por miembro con 7 días ---
function MemberRow({ member, weekDays, values, onToggle }) {
  return (
    <BlurView intensity={25} tint="dark" style={{ borderRadius: 14, overflow: "hidden", marginBottom: 10 }}>
      <View style={{
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
        paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <Text style={{ color: "#fff", fontSize: 15, fontWeight: "800", flex: 1 }}>{member.name}</Text>
          {member.role ? (
            <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>{member.role}</Text>
          ) : null}
        </View>

        {/* matriz de 7 días */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          {weekDays.map((day, idx) => {
            const key = `${member.id}_${day.date}`;
            const active = !!values[key];
            return (
              <View key={day.date} style={{ alignItems: "center" }}>
                <Text style={{ color: "rgba(255,255,255,0.75)", marginBottom: 4 }}>{WEEK_LABELS[idx]}</Text>
                <DayToggle active={active} onPress={() => onToggle(member.id, day.date)} />
              </View>
            );
          })}
        </View>
      </View>
    </BlurView>
  );
}

export default function AttendanceByClanScreen({ route, navigation }) {
  const { clanId, clanName } = route.params || {};
  const { weekStart, weekEnd } = useMemo(() => getWeekRange(), []);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  // estado: { `${memberId}_${YYYY-MM-DD}`: true/false }
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);

  // genera arreglo de días ISO de la semana
  const weekDays = useMemo(() => {
    const days = [];
    const start = new Date(weekStart + "T00:00:00Z");
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setUTCDate(start.getUTCDate() + i);
      days.push({ date: d.toISOString().slice(0, 10) });
    }
    return days;
  }, [weekStart]);

  const loadMembers = useCallback(async () => {
    try {
      setLoading(true);
      const list = await getMembersByClan(clanId);
      setMembers(list);
      // Si tu backend expone asistencia previa, aquí podrías hidratar `values`
      // con lo que venga (p.ej. api.post("/api/attendance", { action: "list", clan_id, weekStart, weekEnd }))
    } catch (e) {
      console.warn(e);
      Alert.alert("Error", "No se pudieron cargar los miembros del clan.");
    } finally {
      setLoading(false);
    }
  }, [clanId]);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  const handleToggle = (memberId, dateISO) => {
    const key = `${memberId}_${dateISO}`;
    setValues((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Preparamos payload compacto: [{ member_id, date, present, clan_id }, ...]
      const payload = [];
      for (const [key, present] of Object.entries(values)) {
        if (!present) continue;
        const [memberId, date] = key.split("_");
        payload.push({ member_id: Number(memberId), date, present: true, clan_id: clanId });
      }

      // TODO: en tu backend implementa /api/attendance con action "batch_mark"
      // que reciba esta lista y la escriba en la pestaña Attendance de Sheets.
      await api.post("/api/attendance", {
        action: "batch_mark",
        weekStart,
        weekEnd,
        clan_id: clanId,
        items: payload,
      });

      Alert.alert("Listo", "Asistencia guardada.");
    } catch (e) {
      console.warn(e);
      Alert.alert("Error", "No se pudo guardar la asistencia.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#202a44" }}>
      {/* Header */}
      <View style={{ padding: 20, paddingBottom: 10 }}>
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800" }}>
          {clanName || "Clan"}
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.75)", marginTop: 4 }}>
          Semana {weekStart} — {weekEnd}
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#83D0FF" />
          <Text style={{ color: "rgba(255,255,255,0.8)", marginTop: 8 }}>Cargando miembros…</Text>
        </View>
      ) : (
        <>
          {/* Encabezados de días (L M X J V S D) */}
          <ScrollView
            horizontal
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 8 }}
            showsHorizontalScrollIndicator={false}
          >
            <View style={{ flexDirection: "row", gap: 16 }}>
              {WEEK_LABELS.map((d, i) => (
                <Text key={i} style={{ color: "rgba(255,255,255,0.85)", fontWeight: "700" }}>{d}</Text>
              ))}
            </View>
          </ScrollView>

          {/* Lista de miembros con matriz semanal */}
          <FlatList
            contentContainerStyle={{ padding: 20, paddingTop: 8, paddingBottom: 100 }}
            data={members}
            keyExtractor={(m, idx) => String(m.id ?? idx)}
            renderItem={({ item }) => (
              <MemberRow
                member={item}
                weekDays={weekDays}
                values={values}
                onToggle={handleToggle}
              />
            )}
            ListEmptyComponent={
              <Text style={{ color: "rgba(255,255,255,0.75)", paddingHorizontal: 20 }}>
                No hay miembros en este clan.
              </Text>
            }
          />

          {/* Botón Guardar */}
          <View style={{ position: "absolute", left: 20, right: 20, bottom: 20 }}>
            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={{
                backgroundColor: saving ? "rgba(131,208,255,0.4)" : "#83D0FF",
                paddingVertical: 14,
                borderRadius: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#0b1020", fontSize: 16, fontWeight: "800" }}>
                {saving ? "Guardando…" : "Guardar asistencia"}
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
