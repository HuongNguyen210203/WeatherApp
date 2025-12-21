import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

export default function CurrentWeatherHeader({
  cityName,
  country,
  current,
  currentUnits,
  isLoading,
  error,
  onChooseCityPress,
}) {
  const temp = current?.temperature_2m;
  const unit = currentUnits?.temperature_2m || '°C';

  const cityLine =
    cityName ? `${cityName}${country ? `, ${country}` : ''}` : null;

  return (
    <View style={styles.headerBackground}>
      <View style={styles.headerContent}>
        <TouchableOpacity
          onPress={onChooseCityPress}
          activeOpacity={0.8}
        >
          <Text style={styles.chooseText}>Choose a city</Text>
        </TouchableOpacity>

        {cityLine ? <Text style={styles.cityText}>{cityLine}</Text> : null}
        

        {isLoading ? (
          <Text style={styles.conditionText}>Loading...</Text>
        ) : error ? (
          <Text style={styles.conditionText}>{error}</Text>
        ) : (
          <>
            <Text style={styles.mainTemp}>
              {temp != null ? `${Math.round(temp)}${unit}` : '--'}
            </Text>
            <Text style={styles.conditionText}> </Text>
            <Text style={styles.highLowText}> </Text>
          </>
        )}

        <Image source={require('../assets/house.png')} style={styles.heroHouse} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBackground: {
    height: 520,
    justifyContent: 'flex-start',
    paddingTop: 32,
    paddingHorizontal: 32,
  },
  headerContent: {
    alignItems: 'center',
  },

  chooseText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '600',
    marginTop: 2,
  },

  cityText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
  },

  mainTemp: {
    color: '#FFFFFF',
    fontSize: 64,
    fontWeight: '200',
    marginTop: 10,
  },
  conditionText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 4,
  },
  highLowText: {
    color: '#FFFFFFAA',
    fontSize: 14,
    marginTop: 4,
  },
  heroHouse: {
    width: 350,
    height: 350,
    resizeMode: 'contain',
    marginTop: 40,
  },
});
