import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import MembersScreen from "../screens/MembersScreen";
import EventsScreen from "../screens/EventsScreen";
import AttendanceScreen from "../screens/AttendanceScreen";
import ClanScreen from "../screens/ClanScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let icon = "ellipse";
          if (route.name === "Inicio") icon = "home";
          if (route.name === "Asistencia") icon = "checkbox";
          if (route.name === "Miembros") icon = "people";
          if (route.name === "Clan") icon = "shield";
          if (route.name === "Eventos") icon = "calendar";
          return <Ionicons name={icon} size={size} color={color} />;
        },
        headerShown: true,
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Asistencia" component={AttendanceScreen} />
      <Tab.Screen name="Miembros" component={MembersScreen} />
      <Tab.Screen name="Clan" component={ClanScreen} />
      <Tab.Screen name="Eventos" component={EventsScreen} />
    </Tab.Navigator>
  );
}
