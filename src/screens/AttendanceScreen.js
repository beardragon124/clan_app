// src/screens/AttendanceScreen.js
import React, { useEffect, useState, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ActivityIndicator,
  FlatList,
  Pressable,
  Alert,
  RefreshControl,
} from "react-native";
import { BlurView } from "expo-blur";
// ✅ Importa funciones nombradas (así están exportadas en sheetsRepo.js)
import { getClans,  } from "../services/sheetsRepo";  // ✅


/**
 * Botón estilo glass para mostrar cada clan
 */
function ClanCard({ clan, onPress }) {
  return (
    <Pressable onPress={() => onPress(clan)} style={{ marginBottom: 14 }}>
      <BlurView intensity={30} tint="dark" style={{ borderRadius: 18, overflow: "hidden" }}>
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            paddingVertical: 20,
            paddingHorizontal: 24,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.15)",
            borderRadius: 18,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>
            {clan.name || "Clan sin nombre"}
          </Text>
        </View>
      </BlurView>
    </Pressable>
  );
}

export default function AttendanceScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [clans, setClans] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar lista de clanes desde Google Sheets
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const items = await getClans();   // ✅ usamos la función importada
      setClans(items);
    } catch (e) {
      console.warn(e);
      Alert.alert("Error", "No se pudo cargar la lista de clanes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const items = await getClans();   // ✅ mismo uso aquí
      setClans(items);
    } catch (e) {
      console.warn(e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleOpenClan = (clan) => {
    // Próximo paso: abrir miembros de este clan para marcar asistencia
    Alert.alert("Asistencias", `Abrir asistencia para: ${clan.name}`);
    // navigation.navigate("AttendanceByClan", { clanId: clan.id, clanName: clan.name });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#202a44" }}>
      <View style={{ padding: 20, paddingBottom: 8 }}>
        <Text style={{ color: "#fff", fontSize: 24, fontWeight: "800" }}>Asistencias</Text>
        <Text style={{ color: "rgba(255,255,255,0.7)", marginTop: 6 }}>
          Selecciona un clan para continuar
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator color="#4f7cff" />
          <Text style={{ color: "#fff", marginTop: 8 }}>Cargando clanes…</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ padding: 20, paddingTop: 10 }}
          data={clans}
          keyExtractor={(item, idx) => String(item.id ?? idx)}
          renderItem={({ item }) => <ClanCard clan={item} onPress={handleOpenClan} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
          }
          ListEmptyComponent={
            <Text style={{ color: "rgba(255,255,255,0.7)" }}>
              No hay clanes en la hoja de Google Sheets.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}
