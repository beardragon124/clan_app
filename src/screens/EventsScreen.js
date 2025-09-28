import React from "react";
import { View, Text, StyleSheet } from "react-native";
export default function EventsScreen(){ 
  return (
    <View style={styles.c}>
      <Text style={styles.t}>Eventos</Text>
      <Text style={styles.s}>Calendario + RSVP</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:"#0f1420",alignItems:"center",justifyContent:"center"},
  t:{color:"#fff",fontSize:20,fontWeight:"700"},
  s:{color:"#cbd5e1",marginTop:8}
});
