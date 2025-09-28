// src/screens/ClanDetailScreen.js
import React, { useEffect, useState } from 'react';
import {
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { listMembersByClan } from '../database/db';

export default function ClanDetailScreen({ route, navigation }) {
  const { clanId, clanName } = route.params || {};
  const [members, setMembers] = useState([]);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const cargar = async () => {
    const rows = await listMembersByClan(clanId);
    setMembers(rows);
  };

  useEffect(() => { cargar(); }, [clanId]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  const goAddMember = () => {
    navigation.navigate('AgregarMiembro', { clanId, clanName }); // ✅ abre tu MembersScreen
  };

  return (
    <LinearGradient colors={['#0b0f1a','#111827','#0b0f1a']} style={{flex:1}}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ flex: 1 }}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
            >
              <BlurView intensity={40} tint="dark" style={styles.blurBG} />

              <View style={styles.header}>
                <Text style={styles.title}>{clanName || 'Clan'}</Text>
                <Text style={styles.subtitle}>Miembros del clan</Text>
              </View>

              <View style={[styles.card, styles.glass]}>
                {members.length === 0 ? (
                  <View>
                    <Text style={styles.empty}>Aún no hay miembros</Text>
                    {/* ✅ Botón grande en el vacío */}
                    <Pressable onPress={goAddMember} style={({ pressed }) => [styles.bigBtn, pressed && { opacity: 0.95 }]}>
                      <Text style={styles.bigBtnText}>Agregar miembro</Text>
                    </Pressable>
                  </View>
                ) : (
                  members.map((m) => (
                    <Pressable
                      key={m.id}
                      onPress={() => navigation.navigate('MemberDetail', { member: m, clanName })}
                      style={({ pressed }) => [styles.itemRow, pressed && { opacity: 0.9 }]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemName}>{m.name}</Text>
                        <Text style={styles.itemMeta}>
                          {m.role || '—'} • {m.status} • {m.created_at}
                          {typeof m.power === 'number' ? ` • Poder ${m.power}` : ''}
                        </Text>
                      </View>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>Ver</Text>
                      </View>
                    </Pressable>
                  ))
                )}
              </View>

              <View style={{ height: isKeyboardVisible ? 40 : 60 }} />
            </ScrollView>

            {/* ✅ Botón flotante siempre visible */}
            <Pressable
              onPress={goAddMember}
              style={({ pressed }) => [
                styles.fab,
                pressed && { transform: [{ scale: 0.98 }], opacity: 0.95 },
              ]}
            >
              <Text style={styles.fabPlus}>＋</Text>
              <Text style={styles.fabText}>Agregar miembro</Text>
            </Pressable>
          </View>
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

  empty: { color: 'rgba(220,230,255,0.6)', fontSize: 13, marginBottom: 12 },

  bigBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(80,150,255,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(80,150,255,0.35)',
  },
  bigBtnText: { color: '#dfeaff', fontWeight: '800', letterSpacing: 0.3 },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  itemName: { color: '#fff', fontSize: 16, fontWeight: '600' },
  itemMeta: { color: 'rgba(200,220,255,0.6)', fontSize: 12, marginTop: 3 },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(80,150,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(80,150,255,0.35)',
  },
  badgeText: { color: '#dfeaff', fontWeight: '700' },

  // FAB
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(80,150,255,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(80,150,255,0.35)',
  },
  fabPlus: { color: '#dfeaff', fontSize: 20, fontWeight: '900', marginRight: 6, marginTop: -2 },
  fabText: { color: '#dfeaff', fontWeight: '800' },
});
