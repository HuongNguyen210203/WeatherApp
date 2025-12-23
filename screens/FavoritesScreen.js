import React, { useEffect, useMemo, useState } from 'react';
import * as Haptics from 'expo-haptics';

import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { RectButton } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  Extrapolation,
  useAnimatedStyle,
} from 'react-native-reanimated';


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
  const ACTION_W = 110; // độ rộng action xoá

  const deletingRef = React.useRef(new Set());

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

  

const renderRightActions = (progress, dragX, item) => {
  const contentStyle = useAnimatedStyle(() => {
      // Cho icon/text trượt nhẹ vào khi kéo
      const translateX = interpolate(
        dragX.value,
        [-ACTION_W, 0],
        [0, 24],
        Extrapolation.CLAMP
      );

      const opacity = interpolate(progress.value, [0, 1], [0.6, 1], Extrapolation.CLAMP);

      return { transform: [{ translateX }], opacity };
    }, []);

    return (
      <View style={{ width: ACTION_W }}>
        <View style={styles.deleteBg}>
          <Animated.View style={[styles.deleteContent, contentStyle]} pointerEvents="none">
            <MaterialIcons name="delete" size={22} color="#fff" />
            <Text style={styles.deleteLabel}>Delete</Text>
          </Animated.View>
        </View>
      </View>
    );
  };




const renderItem = ({ item }) => (
  <View style={styles.rowWrap}>
    <ReanimatedSwipeable
      renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
      overshootRight={false}
      rightThreshold={ACTION_W * 0.7} // phải kéo “đủ sâu” mới xoá, giảm xoá nhầm
      friction={1.6}
      onSwipeableOpen={(direction) => {
        if (direction !== 'left') return;

        const id = String(item.id);
        if (deletingRef.current.has(id)) return;
        deletingRef.current.add(id);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

        removeFavorite(item.id);
        setTimeout(() => deletingRef.current.delete(id), 1200);
      }}
    >
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
    </ReanimatedSwipeable>
  </View>
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
          ListEmptyComponent={
            q.trim().length > 0 ? <Text style={styles.emptyText}>No results.</Text> : null
          }
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1, backgroundColor: 'transparent' },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    backgroundColor: 'rgba(52, 37, 97, 0.7)',
    paddingTop: 6, // hạ xuống thêm chút (đỡ dính status bar)
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
    backgroundColor: 'rgba(52, 37, 97, 0.85)',
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
  flexGrow: 1,
  paddingHorizontal: 18,
  paddingTop: 14,
  paddingBottom: 24,
  gap: 14,
  justifyContent: 'flex-start',
},
  emptyText: {
    color: '#A39AD5',
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.9,
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
  rowWrap: {
    borderRadius: 22,
    overflow: 'hidden',
  },

  deleteBg: {
    flex: 1,
    backgroundColor: 'rgba(220, 38, 38, 0.95)',
    justifyContent: 'center',
  },

  deleteContent: {
    alignSelf: 'flex-end',
    paddingRight: 18,
    alignItems: 'center',
    gap: 6,
  },

  deleteLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
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
