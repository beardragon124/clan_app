import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function BackButton({ label = "Clanes" }) {
  const navigation = useNavigation(); // 👈 evita el error aunque no sea pantalla

  return (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={{ flexDirection: "row", alignItems: "center", padding: 6 }}
    >
      <Ionicons name="chevron-back" size={22} color="#cbd5e1" />
      <Text style={{ color: "#cbd5e1", fontWeight: "700" }}>{label}</Text>
    </TouchableOpacity>
  );
}
