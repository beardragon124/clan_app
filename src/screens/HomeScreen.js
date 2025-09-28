import React from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import { BlurView } from "expo-blur";

// Botón estilo tarjeta (Liquid Glass)
function MenuCard({ label, onPress }) {
  return (
    <Pressable onPress={onPress} style={{ marginBottom: 16 }}>
      <BlurView intensity={30} tint="dark" style={{ borderRadius: 18, overflow: "hidden" }}>
        <View style={{
          backgroundColor: "rgba(255,255,255,0.05)",
          paddingVertical: 20, paddingHorizontal: 24,
          borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderRadius: 18
        }}>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>{label}</Text>
        </View>
      </BlurView>
    </Pressable>
  );
}

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0f1420" }} contentContainerStyle={{ padding: 20 }}>
      <Text style={{ color: "#fff", fontSize: 26, fontWeight: "800", marginBottom: 20 }}>Menú Principal</Text>
      <MenuCard label="Asistencias" onPress={() => navigation.navigate("Attendance")} />
      <MenuCard label="Discord" onPress={() => navigation.navigate("")} />
      {/* futuros:
      <MenuCard label="Discord" onPress={() => navigation.navigate("ClanStack")} />
      <MenuCard label="Miembros" onPress={() => {}} />
      <MenuCard label="Estadísticas" onPress={() => {}} />
      */}
    </ScrollView>
  );
}
