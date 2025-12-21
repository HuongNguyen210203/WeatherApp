import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { supabaseWithDevice } from './supabaseClient';

const DEVICE_ID_KEY = 'DEVICE_ID';

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

    // Upsert anonymous_users (để DB có record device)
    try {
      const client = supabaseWithDevice(deviceId);

      // Nếu bảng bạn CÓ last_seen_at thì giữ, nếu KHÔNG có thì bỏ field này
      const payload = {
        device_id: deviceId,
        last_seen_at: new Date().toISOString(),
      };

      const { error } = await client
        .from('anonymous_users')
        .upsert(payload, { onConflict: 'device_id' });

      if (error) console.log('anonymous_users upsert error:', error.message);
    } catch (e) {
      console.log('anonymous_users upsert exception:', e?.message ?? e);
    }

    return deviceId;
  } catch (error) {
    console.error('Failed to get DEVICE_ID', error);
    throw error;
  }
}
