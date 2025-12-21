import React, { useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import { fetchFavorites, removeFavorite, selectCity } from '../redux/ActionCreators';

function FavoritesScreen({
  navigation,
  favorites,
  fetchFavorites,
  removeFavorite,
  selectCity,
  route,
}) {
  const pickMode = route?.params?.pickMode === true;

  const [q, setQ] = useState('');

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return favorites ?? [];
    return (favorites ?? []).filter((c) => {
      const name = (c?.name ?? '').toLowerCase();
      const country = (c?.country ?? '').toLowerCase();
      return name.includes(s) || country.includes(s);
    });
  }, [favorites, q]);

  const onPick = (city) => {
    selectCity(city);
    navigation.goBack();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => onPick(item)}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>
          {item?.name ?? 'Unknown'}
          {item?.country ? `, ${item.country}` : ''}
        </Text>
        <Text style={styles.sub}>
          {Number(item?.lat).toFixed(4)}, {Number(item?.lon).toFixed(4)}
        </Text>
        <Text style={styles.hint}>Tap to view weather</Text>
      </View>

      <TouchableOpacity
        onPress={() => removeFavorite(item.id)}
        style={styles.starBtn}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MaterialIcons name="star" size={28} color="#FFD54A" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require('../assets/night-sky.png')}
      style={[styles.bg, { backgroundColor: '#0B0B1A' }]}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <MaterialIcons name="arrow-back" size={26} color="#fff" />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Favorites</Text>
            <Text style={styles.headerSub}>Saved locations for quick access</Text>
          </View>

          <View style={{ width: 44 }} />
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <MaterialIcons name="search" size={20} color="#B9B3E6" />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search favorites"
            placeholderTextColor="#9D96D6"
            style={styles.searchInput}
          />
        </View>

        {/* List */}
        <FlatList
          data={filtered}
          keyExtractor={(it) => String(it.id ?? `${it.lat},${it.lon}`)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'rgba(52, 37, 97, 0.7)' },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 6, // ✅ hạ xuống thêm chút (đỡ dính status bar)
    paddingBottom: 10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(52, 37, 97, 0.55)',
    marginRight: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 34,
  },
  headerSub: {
    color: '#C9C4F0',
    marginTop: 2,
  },

  searchWrap: {
    marginHorizontal: 18,
    marginTop: 10,
    backgroundColor: 'rgba(52, 37, 97, 0.7)',
    borderRadius: 18,
    paddingHorizontal: 14,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },

  listContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 24,
    gap: 14,
  },

  card: {
    backgroundColor: 'rgba(52, 37, 97, 0.85)',
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  sub: { color: '#BFB9EA', marginTop: 6 },
  hint: { color: '#BFB9EA', marginTop: 8, opacity: 0.9 },
  starBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const mapStateToProps = (state) => ({
  favorites: state.favorites.list,
});

const mapDispatchToProps = {
  fetchFavorites,
  removeFavorite,
  selectCity,
};

export default connect(mapStateToProps, mapDispatchToProps)(FavoritesScreen);
