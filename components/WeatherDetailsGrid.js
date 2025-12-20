import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

export default function WeatherDetailsGrid() {
  return (
    <View style={styles.weatherDetailsContainer}>
      {/* Air Quality Card - Full Width */}
      <View style={styles.airQualityCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderText}>AIR QUALITY</Text>
          <MaterialIcons name="more-vert" size={20} color="#A39AD5" />
        </View>
        <Text style={styles.airQualityValue}>3 - Low Health Risk</Text>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarTrack}>
            <View style={styles.progressBarGradient}>
              <View style={[styles.progressBarFillGradient, { width: '15%' }]}>
                <View style={styles.progressBarDot} />
              </View>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.seeMoreLink}>
          <Text style={styles.seeMoreText}>See more</Text>
          <MaterialIcons name="arrow-forward" size={16} color="#50D7FF" />
        </TouchableOpacity>
      </View>

      {/* UV Index and Sunrise Row */}
      <View style={styles.detailsRow}>
        {/* UV Index Card */}
        <View style={styles.detailCardHalf}>
          <View style={styles.cardHeaderWithIcon}>
            <MaterialCommunityIcons name="weather-sunny" size={20} color="#A39AD5" />
            <Text style={styles.cardHeaderTextSmall}>UV INDEX</Text>
          </View>
          <Text style={styles.detailValueLarge}>4</Text>
          <Text style={styles.detailAccent}>Moderate</Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: '40%' }]}>
                <View style={styles.progressBarDot} />
              </View>
            </View>
          </View>
        </View>

        {/* Sunrise Card */}
        <View style={styles.detailCardHalf}>
          <View style={styles.cardHeaderWithIcon}>
            <MaterialCommunityIcons name="weather-sunset-up" size={20} color="#A39AD5" />
            <Text style={styles.cardHeaderTextSmall}>SUNRISE</Text>
          </View>
          <Text style={styles.detailValueLarge}>5:28 AM</Text>
          <View style={styles.sunriseGraph}>
            <View style={styles.wavyLine} />
            <View style={styles.graphDot} />
          </View>
          <Text style={styles.detailAccent}>Sunset: 7:25PM</Text>
        </View>
      </View>

      {/* Wind and Rainfall Row */}
      <View style={styles.detailsRow}>
        {/* Wind Card */}
        <View style={styles.detailCardHalf}>
          <View style={styles.cardHeaderWithIcon}>
            <MaterialCommunityIcons name="weather-windy" size={20} color="#A39AD5" />
            <Text style={styles.cardHeaderTextSmall}>WIND</Text>
          </View>
          <View style={styles.compassContainer}>
            <View style={styles.compassCircle}>
              <Text style={styles.compassLabel}>N</Text>
              <Text style={[styles.compassLabel, styles.compassWest]}>W</Text>
              <Text style={[styles.compassLabel, styles.compassEast]}>E</Text>
              <View style={styles.compassCenter}>
                <Text style={styles.windSpeed}>9.7</Text>
                <Text style={styles.windUnit}>km/h</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Rainfall Card */}
        <View style={styles.detailCardHalf}>
          <View style={styles.cardHeaderWithIcon}>
            <MaterialCommunityIcons name="weather-rainy" size={20} color="#A39AD5" />
            <Text style={styles.cardHeaderTextSmall}>RAINFALL</Text>
          </View>
          <Text style={styles.detailValueLarge}>1.8 mm</Text>
          <Text style={styles.detailAccent}>in last hour</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  weatherDetailsContainer: {
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  airQualityCard: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: '#342561',
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderText: {
    color: '#A39AD5',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  cardHeaderTextSmall: {
    color: '#A39AD5',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 6,
  },
  airQualityValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#251C51',
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarGradient: {
    height: '100%',
    width: '100%',
    flexDirection: 'row',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#50D7FF',
    position: 'relative',
  },
  progressBarFillGradient: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#50D7FF',
    position: 'relative',
    borderRightWidth: 2,
    borderRightColor: '#FF6B9D',
  },
  progressBarDot: {
    position: 'absolute',
    right: -6,
    top: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#50D7FF',
  },
  seeMoreLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  seeMoreText: {
    color: '#50D7FF',
    fontSize: 12,
    marginRight: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailCardHalf: {
    width: '48%',
    borderRadius: 24,
    padding: 16,
    backgroundColor: '#342561',
  },
  detailValueLarge: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  detailAccent: {
    color: '#A39AD5',
    fontSize: 12,
    marginTop: 4,
  },
  sunriseGraph: {
    height: 40,
    marginVertical: 8,
    position: 'relative',
    justifyContent: 'center',
  },
  wavyLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#50D7FF',
    borderRadius: 1,
    top: '50%',
  },
  graphDot: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  compassContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  compassCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#342561',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassLabel: {
    position: 'absolute',
    color: '#A39AD5',
    fontSize: 12,
    fontWeight: '600',
    top: 8,
  },
  compassWest: {
    left: 8,
    top: '50%',
    marginTop: -6,
  },
  compassEast: {
    right: 8,
    top: '50%',
    marginTop: -6,
  },
  compassCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  windSpeed: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  windUnit: {
    color: '#A39AD5',
    fontSize: 10,
    marginTop: 2,
  },
});

