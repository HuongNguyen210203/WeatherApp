import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { connect } from 'react-redux';
import { fetchCities, selectCity } from '../redux/ActionCreators';

function WeatherListScreen({ navigation, cities, fetchCities, selectCity }) {
  const [q, setQ] = useState('');


  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const filtered = useMemo(() => {
    const list = cities?.list ?? [];
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter((c) => {
      const name = (c.name ?? '').toLowerCase();
      const country = (c.country ?? '').toLowerCase();
      return name.includes(s) || country.includes(s);
    });
  }, [cities?.list, q]);

  return (
    <View style={styles.weatherListContainer}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.weatherListSafeArea}>
        {/* Header */}
        <View style={styles.weatherListHeader}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.weatherListTitle}>Weather</Text>
          <TouchableOpacity style={styles.menuButton}>
            <MaterialIcons name="more-vert" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <MaterialIcons name="search" size={20} color="#A39AD5" style={styles.searchIcon} />
          <TextInput
            value={q}
            onChangeText={setQ}
            style={styles.searchInput}
            placeholder="Search for a city or airport"
            placeholderTextColor="#A39AD5"
          />
        </View>

        {/* Loading / Error */}
        {cities?.isLoading ? (
          <Text style={{ color: '#FFFFFF', marginHorizontal: 20, marginBottom: 12 }}>
            Loading cities...
          </Text>
        ) : cities?.errMess ? (
          <Text style={{ color: '#FFB4B4', marginHorizontal: 20, marginBottom: 12 }}>
            {cities.errMess}
          </Text>
        ) : null}

        {/* List */}
        <ScrollView
          style={styles.weatherListScroll}
          contentContainerStyle={styles.weatherListContent}
          showsVerticalScrollIndicator={false}
        >
          {filtered.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.weatherCard}
              onPress={() => {
                selectCity(item);
                navigation.navigate('Home');
              }}
            >
              <View style={styles.weatherCardLeft}>
                <Text style={styles.weatherCardTemp}>--°</Text>
                <Text style={styles.weatherCardHighLow}>H:-- L:--</Text>
                <Text style={styles.weatherCardLocation}>
                  {item.name}, {item.country}
                </Text>
                <Text style={styles.weatherCardCondition}>Tap to view weather</Text>
              </View>
              <View style={styles.weatherCardRight}>
                <Text style={styles.weatherCardIcon}>☁️</Text>
              </View>
            </TouchableOpacity>
          ))}

          {!cities?.isLoading && !cities?.errMess && filtered.length === 0 ? (
            <Text style={{ color: '#A39AD5', textAlign: 'center', marginTop: 16 }}>
              No cities found.
            </Text>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const mapStateToProps = (state) => ({
  cities: state.cities,
});

const mapDispatchToProps = {
  fetchCities,
  selectCity,
};

export default connect(mapStateToProps, mapDispatchToProps)(WeatherListScreen);

const styles = StyleSheet.create({
  weatherListContainer: { flex: 1, backgroundColor: '#251C51' },
  weatherListSafeArea: { flex: 1 },

  weatherListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: { padding: 4 },
  weatherListTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '600' },
  menuButton: { padding: 4 },

  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#342561',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  searchIcon: { marginRight: 12 },
  searchInput: { color: '#FFFFFF', fontSize: 14, flex: 1 },

  weatherListScroll: { flex: 1 },
  weatherListContent: { paddingHorizontal: 20, paddingBottom: 100 },

  weatherCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#342561',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  weatherCardLeft: { flex: 1 },
  weatherCardTemp: { color: '#FFFFFF', fontSize: 48, fontWeight: '300', marginBottom: 4 },
  weatherCardHighLow: { color: '#FFFFFF', fontSize: 14, marginBottom: 8 },
  weatherCardLocation: { color: '#FFFFFF', fontSize: 16, fontWeight: '500', marginBottom: 4 },
  weatherCardCondition: { color: '#FFFFFF', fontSize: 14, opacity: 0.8 },
  weatherCardRight: { alignItems: 'center', justifyContent: 'center' },
  weatherCardIcon: { fontSize: 80 },
});

