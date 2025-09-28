// src/screens/MembersScreen.js
import React, { useState } from 'react';
import {
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { getDB } from '../database/db';
import BackButton from '../components/BackButton';

<BackButton navigation={navigation} />


// Etiquetas visibles (largas) → valor real en DB
const STATUS_LABELS = [
  { label: 'Nuevo miembro del clan', value: 'Nuevo' },
  { label: 'Miembro del clan', value: 'Miembro' },
  { label: 'Anciano', value: 'Anciano' },
  { label: 'Líder', value: 'Líder' },
];

export default function MembersScreen({ route, navigation }) {
  const { clanId, clanName } = route.params || {};
  const [name, setName] = useState('');
  const [role, setRole] = useState('');   // ← Rol separado
  const [klass, setKlass] = useState(''); // ← Clase separada
  const [statusIdx, setStatusIdx] = useState(1); // por defecto "Miembro del clan"
  const [power, setPower] = useState('0');

  const insertMember = async () => {
    const n = (name || '').trim();
    const r = (role || '').trim();
    const k = (klass || '').trim();
    const s = STATUS_LABELS[statusIdx]?.value || 'Miembro';
    const p = Number(power) || 0;

    if (!n) {
      Alert.alert('Falta nombre', 'Escribe el nombre del PJ');
      return;
    }
    try {
      const db = getDB();

      // validar único Líder por clan
      if (s === 'Líder') {
        const row = await db.getFirstAsync(
          `SELECT COUNT(*) AS c FROM members WHERE clan_id=? AND status='Líder'`,
          [clanId]
        );
        if (row && Number(row.c) > 0) {
          Alert.alert('Límite de Líder', 'Ya existe un Líder en este clan');
          return;
        }
      }

      // Guardamos rol y clase concatenados o como prefieras.
      // Si tu tabla ya tiene solo "role", metemos "Rol - Clase" para conservar ambos.
      const roleForDB = k ? `${r}${r ? ' - ' : ''}${k}` : r;

      await db.runAsync(
        `INSERT INTO members (clan_id, name, role, status, power, created_at)
         VALUES (?, ?, ?, ?, ?, datetime('now'))`,
        [clanId, n, roleForDB, s, p]
      );

      // limpiar y volver
      setName(''); setRole(''); setKlass(''); setPower('0');
      Keyboard.dismiss();
      navigation.goBack();
    } catch (e) {
      console.log(e);
      Alert.alert('Error', e?.message || 'No se pudo guardar el miembro');
    }
  };

  return (
    <LinearGradient colors={['#0b0f1a', '#111827', '#0b0f1a']} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
          >
            <BlurView intensity={40} tint="dark" style={styles.blurBG} />

            <View style={styles.header}>
              <Text style={styles.title}>Agregar miembro</Text>
              {clanName ? <Text style={styles.subtitle}>Clan: {clanName}</Text> : null}
            </View>

            {/* Nombre */}
            <View style={[styles.card, styles.glass]}>
              <Text style={styles.label}>Nombre del PJ</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ej. Jorge"
                placeholderTextColor="rgba(255,255,255,0.55)"
                style={styles.input}
                returnKeyType="next"
              />
            </View>

            {/* Rol */}
            <View style={[styles.card, styles.glass]}>
              <Text style={styles.label}>Rol</Text>
              <TextInput
                value={role}
                onChangeText={setRole}
                placeholder="Ej. Soporte / DPS / Tanque…"
                placeholderTextColor="rgba(255,255,255,0.55)"
                style={styles.input}
                returnKeyType="next"
              />
            </View>

            {/* Clase */}
            <View style={[styles.card, styles.glass]}>
              <Text style={styles.label}>Clase</Text>
              <TextInput
                value={klass}
                onChangeText={setKlass}
                placeholder="Valiente / Oscuraria / Ballestera / Lancero / Taoista / Maga / Guerrero"
                placeholderTextColor="rgba(255,255,255,0.55)"
                style={styles.input}
                returnKeyType="next"
              />
            </View>

            {/* Estatus (etiquetas largas) */}
            <View style={[styles.card, styles.glass]}>
              <Text style={styles.label}>Estatus</Text>
              <View style={styles.statusRow}>
                {STATUS_LABELS.map((item, idx) => {
                  const active = idx === statusIdx;
                  return (
                    <Pressable
                      key={item.value}
                      onPress={() => setStatusIdx(idx)}
                      style={[
                        styles.statusChip,
                        active && {
                          backgroundColor: 'rgba(80,150,255,0.28)',
                          borderColor: 'rgba(80,150,255,0.5)',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          active && { color: '#dfeaff', fontWeight: '800' },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Poder */}
            <View style={[styles.card, styles.glass]}>
              <Text style={styles.label}>Poder</Text>
              <TextInput
                value={power}
                onChangeText={(t) => setPower(t.replace(/[^\d]/g, ''))}
                placeholder="0"
                placeholderTextColor="rgba(255,255,255,0.55)"
                style={styles.input}
                keyboardType="numeric"
                returnKeyType="done"
              />
              <Text style={styles.hint}>Número entero (ej. 735)</Text>
            </View>

            {/* Guardar */}
            <View style={[styles.card, styles.glass, { alignItems: 'flex-start' }]}>
              <Pressable onPress={insertMember} style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}>
                <Text style={styles.btnText}>Guardar</Text>
              </Pressable>
            </View>

            <View style={{ height: 28 }} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 24, flexGrow: 1 },
  blurBG: { ...StyleSheet.absoluteFillObject },
  header: { marginBottom: 8, paddingVertical: 6 },
  title: { fontSize: 26, fontWeight: '700', color: '#e8f0ff', letterSpacing: 0.3 },
  subtitle: { marginTop: 4, fontSize: 13, color: 'rgba(200,220,255,0.7)' },

  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  card: { padding: 14, marginTop: 14 },

  label: { color: 'rgba(220,230,255,0.85)', marginBottom: 8, fontSize: 14, fontWeight: '600' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.select({ ios: 14, android: 10 }),
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  hint: { marginTop: 6, color: 'rgba(200,220,255,0.6)', fontSize: 12 },

  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginRight: 6,
    marginTop: 6,
  },
  statusText: { color: 'rgba(220,230,255,0.85)', fontWeight: '700' },

  btn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(80,150,255,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(80,150,255,0.35)',
  },
  btnPressed: { transform: [{ scale: 0.98 }], opacity: 0.95 },
  btnText: { color: '#dfeaff', fontWeight: '800', letterSpacing: 0.3 },
});
