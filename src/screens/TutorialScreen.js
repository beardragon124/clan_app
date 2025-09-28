import { Modal, View, Text, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import GlassCard from "../components/GlassCard";

export default function TutorialScreen({ onFinish }) {
  return (
    <Modal transparent animationType="fade">
      <LinearGradient style={styles.overlay} colors={["#0f1220cc", "#0b0f1acc"]}>
        <GlassCard style={styles.card}>
          <Text style={styles.title}>👋 Bienvenido al Clan MIR4</Text>
          <Text style={styles.text}>
            • Crea tu clan en la pestaña "Clan".{"\n"}• Registra asistencias: Expedición (Sáb), Desafío (Dom).{"\n"}• Donaciones y Apoyo técnico: cualquier día.
          </Text>
          <Pressable style={styles.button} onPress={onFinish}>
            <Text style={styles.buttonText}>¡Entendido!</Text>
          </Pressable>
        </GlassCard>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { width: "85%" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12, color: "#fff" },
  text: { fontSize: 14, color: "#ddd", marginBottom: 8 },
  button: {
    marginTop: 16,
    backgroundColor: "#3b82f6",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
