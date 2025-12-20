import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  TextInput,
  Animated,
  Modal,
  Pressable,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { connect } from 'react-redux';
import { useSelector } from 'react-redux';
import { Swipeable } from 'react-native-gesture-handler';

import BottomNav from '../components/BottomNav';
import { fetchFavorites, selectCity, removeFavorite, signOut } from '../redux/ActionCreators';

function FavoritesScreen({ navigation, favorites, fetchFavorites, selectCity, removeFavorite, signOut }) {
  const [q, setQ] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const auth = useSelector((state) => state.auth);

  const user = auth?.user ?? null;
  const email = user?.email ?? '';
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (email ? email.split('@')[0] : 'User');

  // Ambient animation
  const a1 = useRef(new Animated.Value(0)).current;
  const a2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (auth?.session) {
      fetchFavorites();
    }
  }, [auth?.session, fetchFavorites]);

  useEffect(() => {
    Animated.loop(
      Animated.timing(a1, { toValue: 1, duration: 6000, useNativeDriver: true })
    ).start();
    Animated.loop(
      Animated.timing(a2, { toValue: 1, duration: 8000, useNativeDriver: true })
    ).start();
  }, [a1, a2]);

  const list = favorites?.list ?? [];

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter((c) => {
      const name = (c.name ?? '').toLowerCase();
      const country = (c.country ?? '').toLowerCase();
      return name.includes(s) || country.includes(s);
    });
  }, [list, q]);

  const onPick = (city) => {
    selectCity(city);
    navigation.navigate('Home');
  };

  const goToCitySearch = () => navigation.navigate('CitySearch');
  const goToHome = () => navigation.navigate('Home');
  const goToFavorites = () => navigation.navigate('Favorites');

  const dot1Y = a1.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
  const dot2Y = a2.interpolate({ inputRange: [0, 1], outputRange: [0, -22] });

  // Swipe: right-to-left (kéo qua trái) => show Remove
  const renderRightActions = () => (
    <View style={styles.swipeRightAction}>
      <MaterialIcons name="delete" size={20} color="#fff" />
      <Text style={styles.swipeRightText}>Remove</Text>
    </View>
  );

  return (
    <ImageBackground
      source={require('../assets/night-sky.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        <StatusBar style="light" />

        {/* ambient dots */}
        <Animated.View style={[styles.dot, styles.dot1, { transform: [{ translateY: dot1Y }] }]} />
        <Animated.View style={[styles.dot, styles.dot2, { transform: [{ translateY: dot2Y }] }]} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconBtn}>
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Favorites</Text>
            <Text style={styles.subTitle}>Saved locations for quick access</Text>
          </View>

          {/* 3 dots -> settings */}
          <TouchableOpacity style={styles.headerIconBtn} onPress={() => setSettingsOpen(true)}>
            <MaterialIcons name="more-vert" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#A39AD5" style={{ marginRight: 10 }} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search favorites"
            placeholderTextColor="#A39AD5"
            style={styles.searchInput}
          />
          {q.length > 0 ? (
            <TouchableOpacity onPress={() => setQ('')} style={{ padding: 6 }}>
              <MaterialIcons name="close" size={18} color="#A39AD5" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* List */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Swipeable
              renderRightActions={renderRightActions}
              rightThreshold={60}
              onSwipeableOpen={() => removeFavorite(item.id)}
            >
              <TouchableOpacity style={styles.card} onPress={() => onPick(item)} activeOpacity={0.85}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>
                    {item.name}, {item.country}
                  </Text>
                  <Text style={styles.cardMeta}>
                    {Number(item.lat).toFixed(4)}, {Number(item.lon).toFixed(4)}
                  </Text>
                  <Text style={styles.cardHint}>Tap to view weather</Text>
                </View>

                <View style={styles.cardRight}>
                  <Text style={styles.cardEmoji}>⭐</Text>
                </View>
              </TouchableOpacity>
            </Swipeable>
          )}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>No favorites yet</Text>
              <Text style={styles.emptyText}>
                Tap “+” or go to City Search to add your first location.
              </Text>
            </View>
          }
        />

        {/* Settings Dialog */}
        <Modal
          visible={settingsOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setSettingsOpen(false)}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setSettingsOpen(false)} />

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Settings</Text>
              <TouchableOpacity onPress={() => setSettingsOpen(false)} style={styles.modalCloseBtn}>
                <MaterialIcons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.profileBlock}>
              <View style={styles.avatar}>
                <MaterialIcons name="person" size={22} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.profileName}>{displayName}</Text>
                <Text style={styles.profileEmail}>{email}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.logoutBtn}
              activeOpacity={0.9}
              onPress={async () => {
                setSettingsOpen(false);
                await signOut();
                console.log("User signed out");
              }}
            >
              <MaterialIcons name="logout" size={18} color="#FFFFFF" />
              <Text style={styles.logoutText}>Log out</Text>
            </TouchableOpacity>

            <Text style={styles.modalHint}>You will be signed out on this device.</Text>
          </View>
        </Modal>

        <BottomNav
          active="favorites"
          onPlusPress={goToCitySearch}
          onPinPress={goToHome}
          onListPress={goToFavorites}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

const mapStateToProps = (state) => ({
  favorites: state.favorites,
});

const mapDispatchToProps = {
  fetchFavorites,
  selectCity,
  removeFavorite,
  signOut,
};

export default connect(mapStateToProps, mapDispatchToProps)(FavoritesScreen);

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },

  // ambient
  dot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: '#C427FB',
    opacity: 0.25,
  },
  dot1: { top: 120, left: 30 },
  dot2: { top: 170, right: 40, backgroundColor: '#50D7FF', opacity: 0.22 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 10,
  },
  headerIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#342561',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  subTitle: { color: '#A39AD5', marginTop: 2, fontSize: 12 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#342561',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 18,
    marginBottom: 12,
  },
  searchInput: { color: '#FFFFFF', fontSize: 14, flex: 1 },

  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 120, // chừa chỗ BottomNav
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#342561',
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
  },
  cardTitle: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  cardMeta: { color: '#A39AD5', marginTop: 6, fontSize: 12 },
  cardHint: { color: '#FFFFFF', opacity: 0.75, marginTop: 8, fontSize: 12 },

  cardRight: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: { fontSize: 22 },

  emptyWrap: { padding: 18, marginTop: 30, alignItems: 'center' },
  emptyTitle: { color: '#FFFFFF', fontWeight: '800', fontSize: 16, marginBottom: 8 },
  emptyText: { color: '#A39AD5', textAlign: 'center', lineHeight: 18 },

  // swipe (right side reveal)
  swipeRightAction: {
    flex: 1,
    backgroundColor: '#E14B4B',
    borderRadius: 24,
    marginBottom: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  swipeRightText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // modal
  modalBackdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  modalCard: {
    position: 'absolute',
    left: 18,
    right: 18,
    top: 160,
    backgroundColor: '#251C51',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#342561',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#342561',
    borderRadius: 18,
    padding: 12,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: { color: '#FFFFFF', fontWeight: '900', fontSize: 15 },
  profileEmail: { color: '#A39AD5', marginTop: 2, fontSize: 12 },

  logoutBtn: {
    marginTop: 12,
    backgroundColor: '#E14B4B',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: { color: '#FFFFFF', fontWeight: '900' },

  modalHint: { color: '#A39AD5', marginTop: 10, fontSize: 11, textAlign: 'center' },
});
