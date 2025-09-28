// App.js
import React, { useEffect } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createTables } from "./src/database/db";
import HomeScreen from "./src/screens/HomeScreen";
import AttendanceScreen from "./src/screens/AttendanceScreen";

const Stack = createNativeStackNavigator();

const DarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#3a506b",   // gris azulado claro (base principal)
    card: "#1c2541",         // azul marino metálico (contraste para headers/barras)
    text: "#ffffff",         // blanco puro
    border: "rgba(255,255,255,0.2)", // bordes translúcidos

  },
};

export default function App() {
  useEffect(() => { (async () => { try { await createTables(); } catch(e){ console.warn(e); }})(); }, []);

  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Inicio" }} />
        <Stack.Screen name="Attendance" component={AttendanceScreen} options={{ title: "Asistencias" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
