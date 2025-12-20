import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function CurrentWeatherHeader({
  cityName,
  country,
  current,
  currentUnits,
  isLoading,
  error,
}) {
  const title = cityName ? `${cityName}${country ? `, ${country}` : ''}` : 'Choose a city';

  const temp = current?.temperature_2m;
  const unit = currentUnits?.temperature_2m || '°C';

  return (
    <View style={styles.headerBackground}>
      <View style={styles.headerContent}>
        <Text style={styles.cityText}>{title}</Text>

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
  cityText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '600',
  },
  mainTemp: {
    color: '#FFFFFF',
    fontSize: 64,
    fontWeight: '200',
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

