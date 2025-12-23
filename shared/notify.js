import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_ALERT_KEY = 'LAST_ALERTS_V1';

//test =0
const COOLDOWN_MIN = 1; // 1 minute

// Hiển thị notification khi app đang mở (foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function nowMs() {
  return Date.now();
}

export async function ensureNotifPermission() {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.status !== 'granted') {
    await Notifications.requestPermissionsAsync();
  }

  // Android channel (bắt buộc để có độ ưu tiên cao)
  await Notifications.setNotificationChannelAsync('weather-alerts', {
    name: 'Weather Alerts',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
  });
}

export async function canSendAlert(cityId, alertType) {
  const raw = (await AsyncStorage.getItem(LAST_ALERT_KEY)) || '{}';
  const map = JSON.parse(raw);

  const key = `${cityId}:${alertType}`;
  const last = map[key] ?? 0;

  const diffMin = (nowMs() - last) / 60000;
  return diffMin >= COOLDOWN_MIN;
}

export async function markAlertSent(cityId, alertType) {
  const raw = (await AsyncStorage.getItem(LAST_ALERT_KEY)) || '{}';
  const map = JSON.parse(raw);

  const key = `${cityId}:${alertType}`;
  map[key] = nowMs();

  await AsyncStorage.setItem(LAST_ALERT_KEY, JSON.stringify(map));
}

export async function pushWeatherAlert({ title, body }, cityName) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${title} • ${cityName}`,
      body,
      sound: 'default',
    },
    trigger: null, // gửi ngay
  });
}


