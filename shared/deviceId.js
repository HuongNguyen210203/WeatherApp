// shared/deviceId.js

import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

const DEVICE_ID_KEY = 'DEVICE_ID';

/**
 * Lấy device_id (UUID) của thiết bị
 * - Nếu chưa tồn tại → tạo mới và lưu vào AsyncStorage
 * - Nếu đã tồn tại → trả về lại
 */
export async function getDeviceId() {
  try {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);

    if (!deviceId) {
      deviceId = uuidv4();
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
      console.log('New DEVICE_ID created:', deviceId);
    } else {
      console.log('Existing DEVICE_ID:', deviceId);
    }

    return deviceId;
  } catch (error) {
    console.error('Failed to get DEVICE_ID', error);
    throw error;
  }
}
