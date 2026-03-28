import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Preferences = {
  push_notifications: boolean;
  trip_updates: boolean;
  promotions: boolean;
  leaderboard: boolean;
  sound: boolean;
  vibration: boolean;
  language: string;
  location_sharing: boolean;
  analytics: boolean;
  personalized_ads: boolean;
};

const defaultPreferences: Preferences = {
  push_notifications: true,
  trip_updates: true,
  promotions: false,
  leaderboard: true,
  sound: true,
  vibration: false,
  language: 'en',
  location_sharing: true,
  analytics: true,
  personalized_ads: false,
};

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('@komiota_preferences').then((stored) => {
      if (stored) {
        setPreferences({ ...defaultPreferences, ...JSON.parse(stored) });
      }
      setLoading(false);
    });
  }, []);

  const updatePreference = async <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    await AsyncStorage.setItem('@komiota_preferences', JSON.stringify(updated));
  };

  return { preferences, updatePreference, loading };
}
