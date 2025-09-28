// src/screens/MemberDetailScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, Dimensions, ActivityIndicator, ScrollView } from "react-native";
import Svg, { Polygon, Circle, Line, Text as SvgText } from "react-native-svg";
import { getMemberById } from "../database/db";

// Radar config
const SIZE = Math.min(Dimensions.get("window").width, 360);
const RADIUS = SIZE * 0.35;
const CENTER = SIZE / 2;
const AXES = ["Fuerza", "Defensa", "Agilidad", "Magia", "Suerte"];

// Clase → imagen
const classImages = {
  ballestera: require("../assets/classes/ballestera.png"),
  guerrero:   require("../assets/classes/guerrero.png"),
  lancero:    require("../assets/classes/lancero.png"),
  maga:       require("../assets/classes/maga.png"),
  oscuraria:  require("../assets/classes/oscuraria.png"),
  taoista:    require("../assets/classes/taoista.png"),
  valiente:   require("../assets/classes/valiente.png"),
};

// Clase → stats por defecto
const classStats = {
  ballestera: [70, 40, 80, 30, 60],
  guerrero:   [85, 70, 50, 20, 40],
  lancero:    [75, 60, 70, 25, 50],
  maga:       [40, 35, 55, 90, 65],
  oscuraria:  [60, 45, 65, 85, 50],
  taoista:    [55, 50, 60, 75, 70],
  valiente:   [80, 65, 55, 35, 55],
};

function polarToCartesian(angleDeg, r) {
  const rad = (Math.PI / 180) * angleDeg;
  return [CENTER + r * Math.cos(rad), CENTER + r * Math.sin(rad)];
}

export default function MemberDetailScreen({ route }) {
  const { memberId } = route?.params ?? {};
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const m = await getMemberById(memberId);
        setMember(m);
      } finally {
        setLoading(false);
      }
    })();
  }, [memberId]);

  if (loading || !member) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ color: "#cbd5e1", marginTop: 8 }}>Cargando…</Text>
      </View>
    );
  }

  const classKey = (member.className || "").toLowerCase().trim();

  // 🔹 Imagen por clase
  const avatarSource = classImages[classKey] || classImages.guerrero;

  // 🔹 Stats: preferir los de DB si están definidos; si no, los de clase
  const fromDb = [member.str, member.def, member.agi, member.mag, member.luck];
  const hasAllDb = fromDb.every((v) => typeof v === "number" && !Number.isNaN(v));
  const baseStats = hasAllDb ? fromDb : (classStats[classKey] || classStats.guerrero);

  const step = 360 / AXES.length;
  const points = baseStats
    .map((v, i) => {
      const angle = -90 + step * i;
      const r = (v / 100) * RADIUS;
      const [x, y] = polarToCartesian(angle, r);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>{member.name}</Text>
      <Text style={styles.sub}>
        {(member.className || "Sin clase") + " • " + (member.role || "Sin rol")}
      </Text>

            // ↑ dentro del componente, donde renderizas el avatar:
      <View style={styles.avatarCircle}>
        <Image
          source={avatarSource}
          style={styles.avatarImage}
          resizeMode="contain"   // 👈 la imagen se ve completa dentro del círculo
        />
      </View>


      <View style={styles.card}>
        <Text style={styles.cardTitle}>Atributos</Text>
        <Svg width={SIZE} height={SIZE}>
          {[0.25, 0.5, 0.75, 1].map((k, idx) => (
            <Circle key={idx} cx={CENTER} cy={CENTER} r={RADIUS * k} stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" />
          ))}

          {AXES.map((label, i) => {
            const angle = -90 + step * i;
            const [x, y] = polarToCartesian(angle, RADIUS);
            const [tx, ty] = polarToCartesian(angle, RADIUS + 18);
            return (
              <React.Fragment key={label}>
                <Line x1={CENTER} y1={CENTER} x2={x} y2={y} stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                <SvgText x={tx} y={ty} fill="#cbd5e1" fontSize="12" textAnchor="middle">{label}</SvgText>
              </React.Fragment>
            );
          })}

          <Polygon points={points} fill="rgba(59,130,246,0.35)" stroke="#3b82f6" strokeWidth="2" />
        </Svg>

        <View style={styles.legend}>
          {AXES.map((label, i) => (
            <Text key={label} style={styles.legendText}>
              {label}: {baseStats[i]}
            </Text>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const AV_SIZE = 260;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f1420" },
  center: { flex: 1, backgroundColor: "#0f1420", alignItems: "center", justifyContent: "center" },
  title: { color: "#fff", fontSize: 22, fontWeight: "800", textAlign: "center" },
  sub: { color: "#cbd5e1", textAlign: "center", marginBottom: 12, marginTop: 4 },

  // Círculo grande contenedor con la imagen completa centrada
  avatarCircle: {
    width: AV_SIZE,
    height: AV_SIZE,
    borderRadius: AV_SIZE / 2,
    alignSelf: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.04)",
    overflow: "hidden", // asegura imagen dentro del círculo
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: "95%",
    height: "95%",
    resizeMode: "contain", // 🔹 se ve completa dentro del círculo
  },

  card: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 12,
  },
  cardTitle: { color: "#fff", fontWeight: "800", marginBottom: 8 },
  legend: {
    width: "100%",
    marginTop: 10,
    paddingHorizontal: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  legendText: { color: "#cbd5e1", fontSize: 12 },
});
