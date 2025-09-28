// src/screens/ClanListScreen.js
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// 🔗 Google Sheets (vía backend): usa sheetsRepo en lugar de SQLite local
import {
  getClans as getClansSheets,
  addClan as addClanSheets,
  deleteClan as deleteClanSheets,
} from "../services/sheetsRepo";

const BLUE = "#4f7cff";

export default function ClanListScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clans, setClans] = useState([]);
  const [name, setName] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getClansSheets();
      setClans(Array.isArray(data) ? data : []);
    } catch (e) {
      Alert.alert("Google Sheets", e?.message || "No se pudo leer clanes");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const unsub = navigation.addListener("focus", load);
    return unsub;
  }, [navigation, load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
  };

  const onCreate = async () => {
    const n = name.trim();
    if (!n) return Alert.alert("Validación", "Escribe un nombre de clan.");
    setSaving(true);
    try {
      await addClanSheets(n); // ← crea el clan en Google Sheets (requiere endpoint /api/clans {action:'create'})
      setName("");
      await load();
    } catch (e) {
      Alert.alert("Error", e?.message || "No se pudo crear el clan");
    } finally {
      setSaving(false);
    }
  };

  const askDeleteClan = (item) => {
    Alert.alert(
      "Eliminar clan",
      `¿Eliminar "${item.name}"?\nSe borrarán también sus miembros (si tu backend lo implementa).`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteClanSheets(item.id); // ← elimina en Google Sheets (requiere endpoint /api/clans {action:'delete'})
              await load();
            } catch (e) {
              Alert.alert("Error", e?.message || "No se pudo eliminar el clan");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <Pressable
      style={styles.item}
      onPress={() =>
        navigation.navigate("ClanDetail", { clanId: item.id, clanName: item.name })
      }
      onLongPress={() => askDeleteClan(item)}
      android_ripple={{ color: "rgba(255,255,255,0.06)" }}
      delayLongPress={350}
    >
      <Ionicons name="shield" size={22} color={BLUE} />
      <Text style={styles.itemText}>{item.name}</Text>
      <Ionicons name="chevron-forward" size={18} color="#9aa3ab" />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clanes</Text>

      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Nombre del clan"
          placeholderTextColor="#9aa3ab"
          value={name}
          onChangeText={setName}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.btn, saving && { opacity: 0.6 }]}
          onPress={onCreate}
          disabled={saving}
          activeOpacity={0.9}
        >
          <Text style={styles.btnText}>{saving ? "Agregando…" : "Agregar"}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={clans}
          keyExtractor={(it, idx) => String(it?.id ?? idx)}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={
            <Text style={styles.empty}>No hay clanes. Crea el primero.</Text>
          }
          contentContainerStyle={{ paddingTop: 10, paddingBottom: 24 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#202a44", padding: 16 },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
  },
  row: { flexDirection: "row", gap: 8, marginBottom: 12 },
  input: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    color: "#e5eefb",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    minHeight: 50,
  },
  btn: {
    backgroundColor: BLUE,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: "center",
    minHeight: 50,
  },
  btnText: { color: "#fff", fontWeight: "800" },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    padding: 14,
    borderRadius: 14,
  },
  itemText: { color: "#eaf2ff", fontWeight: "700", flex: 1, fontSize: 16 },
  empty: { color: "#9aa3ab", textAlign: "center", marginTop: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
