import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

export default function BottomNav({
  onPlusPress,
  onPinPress,
  onListPress,
  active = 'home', // 'home' | 'favorites' | 'citysearch'
}) {
  const isHome = active === 'home';
  const isFav = active === 'favorites';

  const activeColor = '#C427FB';
  const normalColor = '#FFFFFF';

  return (
    <View style={styles.bottomNavShell}>
      <View style={styles.bottomNavPill}>
        <TouchableOpacity
          style={styles.bottomNavIcon}
          onPress={onPinPress}
          activeOpacity={0.85}
        >
          <MaterialIcons name="pin-drop" size={24} color={isHome ? activeColor : normalColor} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavIcon}
          onPress={onListPress}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons
            name="format-list-bulleted"
            size={24}
            color={isFav ? activeColor : normalColor}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.bottomNavCenterButtonOuter}
        onPress={onPlusPress}
        activeOpacity={0.8}
      >
        <View style={styles.bottomNavCenterButtonInner}>
          <Text style={styles.bottomNavPlus}>＋</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNavShell: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
    zIndex: 1000,
  },
  bottomNavPill: {
    width: '100%',
    height: 72,
    borderRadius: 40,
    backgroundColor: '#25205B',
    paddingHorizontal: 40,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  bottomNavIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  bottomNavCenterButtonOuter: {
    position: 'absolute',
    top: -28,
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#25205B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 16,
    elevation: 10,
  },
  bottomNavCenterButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
  },
  bottomNavPlus: {
    fontSize: 28,
    color: '#5B35C5',
  },
});

